#!/usr/bin/env bash
# ==============================================================================
# WhatsCRM Webdock VPS 1-Click Installer
# Spec: Ubuntu 24.04 LTS (Noble) on Webdock
# Domain: wautomation1.vps.webdock.cloud (193.181.218.146)
# Repo: https://github.com/baliadventours/wautomation1
# ==============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}==================================================================${NC}"
echo -e "${GREEN}    WhatsCRM & WhatsApp Gateway — Webdock Ubuntu 24.04 Deployer   ${NC}"
echo -e "${CYAN}==================================================================${NC}"
echo -e "Server IP: ${YELLOW}193.181.218.146${NC}"
echo -e "Domain:    ${YELLOW}wautomation1.vps.webdock.cloud${NC}"
echo -e "Target OS: Ubuntu 24.04 Noble Numbat (Webdock KVM)"
echo -e "${CYAN}==================================================================${NC}"

# 1. Root check
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}[ERROR] Please execute as root or with sudo:${NC}"
  echo -e "  sudo bash install-webdock.sh"
  exit 1
fi

DOMAIN="${1:-wautomation1.vps.webdock.cloud}"
REPO_URL="https://github.com/baliadventours/wautomation1.git"
INSTALL_DIR="/var/whatscrm"

# 2. Free up port 80 / 443 if Apache was installed by Webdock template
echo -e "\n${BLUE}[1/7] Checking for web server port conflicts...${NC}"
if systemctl is-active --quiet apache2 2>/dev/null; then
  echo -e "${YELLOW}Stopping Apache2 to avoid port 80 conflicts with Nginx...${NC}"
  systemctl stop apache2
  systemctl disable apache2 2>/dev/null || true
fi

# 3. Install core dependencies
echo -e "\n${BLUE}[2/7] Installing System Packages (Git, Curl, Nginx, Certbot, UFW)...${NC}"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y nginx certbot python3-certbot-nginx ufw curl git jq ca-certificates gnupg
mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled

# 4. Install official Docker Engine and Docker Compose v2 plugin
echo -e "\n${BLUE}[3/7] Installing Docker Engine & Docker Compose Plugin...${NC}"
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
  sh /tmp/get-docker.sh
  systemctl enable docker
  systemctl start docker
  rm -f /tmp/get-docker.sh
else
  echo -e "${GREEN}✓ Docker already installed${NC}"
fi

# Ensure compose plugin is installed
apt-get install -y docker-compose-plugin || true

# 5. Clone or update repository
echo -e "\n${BLUE}[4/7] Setting up application source code...${NC}"
if [ -f "./Dockerfile" ] && [ -f "./package.json" ]; then
  APP_DIR="$(pwd)"
  echo -e "${GREEN}✓ Using existing repository directory: $APP_DIR${NC}"
else
  mkdir -p "$INSTALL_DIR"
  if [ -d "$INSTALL_DIR/.git" ]; then
    echo -e "Pulling latest code from GitHub..."
    cd "$INSTALL_DIR"
    git pull origin main || git pull || true
  else
    echo -e "Cloning repository from $REPO_URL..."
    rm -rf "$INSTALL_DIR"
    git clone "$REPO_URL" "$INSTALL_DIR"
    cd "$INSTALL_DIR"
  fi
  APP_DIR="$INSTALL_DIR"
fi

cd "$APP_DIR"

# Create persistence directories
mkdir -p "$APP_DIR/data/sessions"
mkdir -p "$APP_DIR/postgres_data"
mkdir -p "$APP_DIR/redis_data"
mkdir -p "$APP_DIR/gateway_instances"
chmod -R 775 "$APP_DIR/data"

# 6. Generate production .env configuration
echo -e "\n${BLUE}[5/7] Preparing production environment configuration...${NC}"
if [ ! -f "$APP_DIR/.env" ]; then
  PG_PASSWORD=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 24)
  REDIS_PASSWORD=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 24)
  GATEWAY_KEY="wac_live_gw_$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 24)"
  JWT_SECRET=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 32)
  TRIPBONE_SECRET="tb_sec_$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 16)"

  cat <<EOF > "$APP_DIR/.env"
NODE_ENV=production
PORT=3000
APP_URL=https://$DOMAIN
DOMAIN=$DOMAIN

# Database (PostgreSQL 16)
DATABASE_URL=postgresql://whatscrm:$PG_PASSWORD@postgres:5432/whatscrm_production
POSTGRES_USER=whatscrm
POSTGRES_PASSWORD=$PG_PASSWORD
POSTGRES_DB=whatscrm_production

# Redis Cache & Queue
REDIS_URL=redis://:$REDIS_PASSWORD@redis:6379/0
REDIS_PASSWORD=$REDIS_PASSWORD

# WhatsApp Multi-Device Gateway (Evolution API v2)
WHATSAPP_GATEWAY_URL=http://whatsapp_gateway:8080
WHATSAPP_GATEWAY_API_KEY=$GATEWAY_KEY
AUTHENTICATION_API_KEY=$GATEWAY_KEY

# Security & Webhook Signatures
JWT_SECRET=$JWT_SECRET
TRIPBONE_WEBHOOK_SECRET=$TRIPBONE_SECRET
MIN_OUTBOUND_DELAY_SEC=2.5
SIMULATE_TYPING_PRESENCE=true
EOF
  echo -e "${GREEN}✓ Created secure .env with isolated credentials${NC}"
else
  echo -e "${GREEN}✓ Reusing existing .env configuration${NC}"
fi

# 7. Configure Nginx Reverse Proxy
echo -e "\n${BLUE}[6/7] Configuring Nginx Reverse Proxy for $DOMAIN...${NC}"
cat <<EOF > "/etc/nginx/sites-available/whatscrm"
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;

    client_max_body_size 50M;

    # WhatsApp CRM Dashboard & API
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # WhatsApp Gateway WebSocket Tunnel
    location /gateway/ {
        proxy_pass http://127.0.0.1:8080/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/whatscrm /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
nginx -t
systemctl reload nginx

# 8. Start Docker Stack
echo -e "\n${BLUE}[7/7] Launching Docker Containers (CRM + Gateway + PostgreSQL + Redis)...${NC}"
docker compose down || true
docker compose up -d --build

# Open Firewall Ports
ufw allow 22/tcp || true
ufw allow 80/tcp || true
ufw allow 443/tcp || true
ufw --force enable || true

# 9. Request Free SSL Certificate via Let's Encrypt
echo -e "\n${BLUE}Acquiring SSL Certificate for $DOMAIN...${NC}"
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "admin@$DOMAIN" --redirect || {
  echo -e "${YELLOW}[NOTICE] Certbot automated SSL setup had a notice. You can run 'certbot --nginx -d $DOMAIN' anytime.${NC}"
}

# Wait for containers to warm up
echo -e "\nVerifying application health..."
sleep 6

HEALTH_RES=$(curl -s "http://127.0.0.1:3000/api/health" || echo '{"status":"starting"}')

echo -e "\n${GREEN}==================================================================${NC}"
echo -e "${GREEN}    🎉 WhatsCRM Installation Complete on Webdock VPS!            ${NC}"
echo -e "${GREEN}==================================================================${NC}"
echo -e "Dashboard URL:     ${CYAN}https://$DOMAIN${NC}"
echo -e "Alternative HTTP:  ${CYAN}http://$DOMAIN${NC} or http://193.181.218.146:3000"
echo -e "WhatsApp Gateway:  ${CYAN}https://$DOMAIN/gateway/${NC}"
echo -e "Application Dir:   ${YELLOW}$APP_DIR${NC}"
echo -e "Server Health:     $HEALTH_RES"
echo -e "${GREEN}==================================================================${NC}"
echo -e "\n${YELLOW}To view live logs:${NC}"
echo -e "  cd $APP_DIR && docker compose logs -f app"
echo -e "\n${YELLOW}To restart stack:${NC}"
echo -e "  cd $APP_DIR && docker compose restart"
echo -e "${GREEN}==================================================================${NC}"
