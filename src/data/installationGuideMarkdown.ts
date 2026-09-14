export const INSTALLATION_GUIDE_MD = `# WhatsCRM & WhatsApp API Gateway — VPS Installation Guide From Scratch

This production guide walks you through deploying **WhatsCRM** and the **Baileys WhatsApp REST Gateway** on a fresh Linux VPS (Ubuntu 22.04 LTS / 24.04 LTS or Debian 12 Bookworm) with Nginx reverse proxy, SSL Let's Encrypt certificates, PM2 daemon supervision, and persistent socket session storage.

---

## 1. System Requirements & Hardware Sizing

| Workload Scale | Simultaneous Sockets | Recommended VPS Spec | Cloud Providers |
| :--- | :--- | :--- | :--- |
| **Starter / Testing** | 1 - 5 Accounts | 1 vCPU, 2 GB RAM, 25 GB SSD | Hetzner CX22, DigitalOcean $12/mo |
| **Production SaaS** | 5 - 25 Accounts | 2 vCPU, 4 GB RAM, 40 GB SSD | Hetzner CPX21, DigitalOcean $24/mo, AWS t4g.medium |
| **High-Volume Enterprise** | 25 - 100 Accounts | 4 vCPU, 8 GB RAM, 80 GB NVMe | Hetzner CPX31, Contabo Cloud VPS M |

> **Note on Memory:** Baileys stores cryptographic session keys in memory and caches media payloads during sync. Always configure a **2 GB Swap file** to prevent Out-Of-Memory (OOM) socket drops.

---

## 2. Server Preparation & Security Hardening

### Step 2.1: Connect to your VPS
\`\`\`bash
ssh root@YOUR_SERVER_IP
\`\`\`

### Step 2.2: Update System & Install Core Utilities
\`\`\`bash
apt update && apt upgrade -y
apt install -y curl wget git build-essential ufw software-properties-common jq unzip
\`\`\`

### Step 2.3: Configure 2GB Swap Memory
\`\`\`bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
\`\`\`

### Step 2.4: Configure UFW Firewall
\`\`\`bash
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw --force enable
ufw status verbose
\`\`\`

---

## 3. Install Node.js 20 LTS, NPM & Build Dependencies

Baileys and the media transcoding pipeline require native C++ build tools and Node 20 LTS:

\`\`\`bash
# Add NodeSource repository for Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# Install Node.js and Chromium system dependencies
apt install -y nodejs libgbm-dev libnss3 libatk1.0-0 libasound2 libxss1 libx11-xcb1

# Verify installed versions
node -v # Should be v20.x.x
npm -v

# Install PM2 globally for daemon management
npm install -g pm2 tsx esbuild
\`\`\`

---

## 4. Persistent WhatsApp Session Storage Setup

Baileys multi-device credentials must be saved to a persistent, durable folder with strict read/write permissions:

\`\`\`bash
mkdir -p /var/whatscrm/sessions
mkdir -p /var/log/whatscrm
chmod 750 /var/whatscrm/sessions
chmod 750 /var/log/whatscrm
\`\`\`

---

## 5. Clone Repository & Install Dependencies

\`\`\`bash
# Navigate to deployment directory
cd /var/www
git clone https://github.com/your-username/whatscrm-gateway.git whatscrm
cd /var/www/whatscrm

# Install production dependencies
npm install --production=false
\`\`\`

---

## 6. Configure Production Environment Variables

Create the \`/var/www/whatscrm/.env\` file:

\`\`\`bash
cat << 'EOF' > /var/www/whatscrm/.env
# Application Host & Port
PORT=3000
NODE_ENV=production
APP_URL=https://api.yourdomain.com

# WhatsApp Multi-Device Session Storage
WHATSAPP_SESSIONS_DIR=/var/whatscrm/sessions
MAX_CONCURRENT_SOCKETS=50
SOCKET_PING_INTERVAL_MS=25000

# Security & Master Auth
SUPERADMIN_EMAIL=admin@yourdomain.com
JWT_SECRET=super_secret_production_jwt_key_please_generate_random_64_chars
SESSION_ENCRYPTION_KEY=9f83ab21e05d4f6c8215aa6391d8e12b7a4c9e8d1234567890abcdef12345678

# Webhook & Rate-Limiting Controls
WEBHOOK_TIMEOUT_MS=8000
DEFAULT_DAILY_QUOTA=25000
RATE_LIMIT_DELAY_MS=1200
RANDOM_JITTER_MS=800

# Tripbone Tour Webhook Integration
TRIPBONE_ENABLED=true
TRIPBONE_WEBHOOK_URL=https://api.yourdomain.com/api/webhooks/tripbone
EOF
\`\`\`

> **Tip:** Replace \`api.yourdomain.com\` with your real domain name pointing to the VPS IP via an \`A\` record.

---

## 7. Production Build & PM2 Daemon Configuration

### Step 7.1: Build Application
\`\`\`bash
npm run build
\`\`\`

### Step 7.2: Create PM2 Configuration (\`ecosystem.config.cjs\`)
\`\`\`bash
cat << 'EOF' > /var/www/whatscrm/ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: 'whatscrm-gateway',
      script: 'server.ts',
      interpreter: 'tsx',
      instances: 1, // Must be 1 instance to maintain persistent stateful WhatsApp sockets
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1800M',
      env_file: '.env',
      error_file: '/var/log/whatscrm/error.log',
      out_file: '/var/log/whatscrm/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      kill_timeout: 5000,
      restart_delay: 2000
    }
  ]
};
EOF
\`\`\`

### Step 7.3: Start PM2 and Enable Boot Startup
\`\`\`bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup systemd
\`\`\`

---

## 8. Nginx Reverse Proxy with WebSocket Support

Baileys and the WhatsCRM dashboard use WebSockets for instant QR code scanning and incoming message streaming.

### Step 8.1: Install Nginx
\`\`\`bash
apt install -y nginx
\`\`\`

### Step 8.2: Create Virtual Host Configuration
Create \`/etc/nginx/sites-available/whatscrm\`:

\`\`\`nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

server {
    listen 80;
    listen [::]:80;
    server_name api.yourdomain.com; # Change to your actual domain

    client_max_body_size 64M; # Support WhatsApp video/PDF file uploads

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;

        # WebSocket Upgrade Headers (Crucial for Baileys QR Streaming)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;

        # Client IP & Forwarding Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts for persistent socket connection
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
        proxy_connect_timeout 60s;
        proxy_buffering off;
    }
}
\`\`\`

### Step 8.3: Enable Site & Test Nginx
\`\`\`bash
ln -s /etc/nginx/sites-available/whatscrm /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
\`\`\`

---

## 9. SSL Certificate with Let's Encrypt (Certbot)

\`\`\`bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d api.yourdomain.com --non-interactive --agree-tos -m admin@yourdomain.com --redirect
\`\`\`

Test auto-renewal:
\`\`\`bash
certbot renew --dry-run
\`\`\`

---

## 10. Verification & Health Checks

1. **Verify Backend Status:**
   \`\`\`bash
   curl -I https://api.yourdomain.com/api/health
   \`\`\`
   Should return \`HTTP/1.1 200 OK\` with \`{ "status": "ok" }\`.

2. **Verify PM2 Process:**
   \`\`\`bash
   pm2 status
   pm2 logs whatscrm-gateway --lines 50
   \`\`\`

3. **Check Firewall:**
   \`\`\`bash
   ufw status
   \`\`\`

---

## 11. WhatsApp Anti-Ban & Best Practices

1. **Number Warming:**
   - For fresh SIM cards, start with ≤ 50 outbound messages/day on Day 1-3.
   - Use WhatsCRM's automated warming scheduler to ramp up gradually (+20% daily).
2. **Dynamic Jitter & Delays:**
   - Keep \`RATE_LIMIT_DELAY_MS\` at \`1200\` and \`RANDOM_JITTER_MS\` at \`800\` so message dispatch times look organic to Meta's automated spam filters.
3. **Session Persistence:**
   - Never wipe \`/var/whatscrm/sessions\` unless explicitly disconnecting an account. This prevents QR re-authentication triggers.
4. **Regular Backup:**
   \`\`\`bash
   # Add daily backup cron for WhatsApp sessions
   crontab -e
   # Add line:
   0 3 * * * tar -czf /root/whatscrm_sessions_$(date +\%F).tar.gz /var/whatscrm/sessions
   \`\`\`

---

## 12. Troubleshooting Common Issues

- **Port 3000 Already in Use:**
  Run \`lsof -i :3000\` or \`netstat -tulnp | grep 3000\` to find conflicting processes and terminate with \`kill -9 <PID>\`.
- **Baileys QR Code Not Displaying:**
  Ensure Nginx has \`proxy_set_header Upgrade $http_upgrade;\` and \`proxy_buffering off;\` enabled.
- **Node Gyp / Build Failures:**
  Run \`apt install -y python3 make g++\` and retry \`npm rebuild\`.
`;
