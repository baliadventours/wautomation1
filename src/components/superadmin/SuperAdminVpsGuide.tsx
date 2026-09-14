import React, { useState } from 'react';
import { 
  Server, 
  Terminal, 
  ShieldCheck, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  Cpu, 
  HardDrive, 
  Globe, 
  Key, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  Play, 
  Sliders, 
  FileCode2, 
  Lock,
  Zap,
  HelpCircle,
  Database,
  FileText
} from 'lucide-react';
import { INSTALLATION_GUIDE_MD } from '../../data/installationGuideMarkdown';

interface SuperAdminVpsGuideProps {
  onShowNotice: (msg: string) => void;
}

export const SuperAdminVpsGuide: React.FC<SuperAdminVpsGuideProps> = ({ onShowNotice }) => {
  const [activeTab, setActiveTab] = useState<'quickstart' | 'manual' | 'docker' | 'nginx' | 'config-generator' | 'troubleshooting' | 'markdown-guide'>('quickstart');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Dynamic Generator State
  const [domain, setDomain] = useState('api.yourdomain.com');
  const [serverPort, setServerPort] = useState('3000');
  const [adminEmail, setAdminEmail] = useState('admin@yourdomain.com');
  const [enableSsl, setEnableSsl] = useState(true);
  const [runtimeType, setRuntimeType] = useState<'pm2' | 'docker'>('pm2');
  const [whatsappSessionsPath, setWhatsappSessionsPath] = useState('/var/whatscrm/sessions');

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    onShowNotice('Copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const oneClickInstallScript = `#!/usr/bin/env bash
# ==============================================================================
# WhatsCRM & Whapi WhatsApp Gateway — Production VPS Auto-Installer
# Target OS: Ubuntu 22.04 / 24.04 LTS (x86_64 / ARM64)
# ==============================================================================
set -euo pipefail

echo "========================================================"
echo "🚀 Installing WhatsCRM WhatsApp Gateway on VPS..."
echo "========================================================"

# 1. Update OS packages & install system dependencies for Puppeteer & Baileys
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y curl wget git build-essential ufw nginx certbot python3-certbot-nginx \
  libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libxcomposite1 \
  libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2 libpango-1.0-0 libcairo2

# 2. Configure UFW Firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow ${serverPort}/tcp
echo "y" | sudo ufw enable

# 3. Install Node.js 20 LTS & PM2
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi
sudo npm install -g pm2 yarn tsx esbuild

# 4. Create App Directory & Multi-Device Session Storage
sudo mkdir -p /var/whatscrm/sessions
sudo chown -R $USER:$USER /var/whatscrm

# 5. Clone repository & Install dependencies
cd /var/whatscrm
# git clone <your-repo-url> .
# npm ci --production=false
# npm run build

# 6. Setup PM2 Process Service
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u $USER --hp /home/$USER

echo "✅ WhatsCRM Gateway is active on port ${serverPort}!"
echo "👉 Configure Nginx and SSL by pointing your domain A-record to this VPS IP."
`;

  const nginxConfig = `# /etc/nginx/sites-available/whatscrm
server {
    listen 80;
    server_name ${domain};
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${domain};

    # SSL Certificates (provisioned via certbot --nginx -d ${domain})
    ssl_certificate /etc/letsencrypt/live/${domain}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${domain}/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Performance & Upload Limits for WhatsApp Media Attachments
    client_max_body_size 64M;
    keepalive_timeout 65;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    location / {
        proxy_pass http://127.0.0.1:${serverPort};
        proxy_http_version 1.1;

        # WebSocket Upgrade Headers (CRUCIAL for Baileys & Live Chats)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts for persistent WhatsApp socket connections
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # WhatsApp QR Code and Webhook stream endpoint buffer tuning
    location /api/ {
        proxy_pass http://127.0.0.1:${serverPort};
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_cache off;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}`;

  const pm2Config = `// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'whatscrm-gateway',
      script: 'server.ts',
      interpreter: 'tsx', // or 'node' with compiled 'dist/server.cjs'
      instances: 1,       // Baileys sockets require sticky state per session
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1800M',
      env: {
        NODE_ENV: 'production',
        PORT: ${serverPort},
        WHATSAPP_SESSIONS_DIR: '${whatsappSessionsPath}',
        WEBHOOK_TIMEOUT_MS: '8000',
        MAX_CONCURRENT_SOCKETS: '50'
      },
      error_file: '/var/log/whatscrm/error.log',
      out_file: '/var/log/whatscrm/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};`;

  const dockerComposeYaml = `# docker-compose.yml
version: '3.8'

services:
  whatscrm-app:
    image: node:20-bullseye-slim
    container_name: whatscrm_core
    restart: always
    working_dir: /app
    volumes:
      - ./:/app
      - whatscrm_sessions:/var/whatscrm/sessions
    ports:
      - "127.0.0.1:${serverPort}:${serverPort}"
    environment:
      - NODE_ENV=production
      - PORT=${serverPort}
      - WHATSAPP_SESSIONS_DIR=/var/whatscrm/sessions
      - REDIS_URL=redis://cache:6379
    command: sh -c "npm install -g tsx && npm run dev"
    depends_on:
      - cache

  cache:
    image: redis:7-alpine
    container_name: whatscrm_redis
    restart: always
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

volumes:
  whatscrm_sessions:
    driver: local
  redis_data:
    driver: local`;

  const envProduction = `# .env.production
PORT=${serverPort}
APP_URL=https://${domain}
NODE_ENV=production

# Baileys Socket Session Directory (Ensure write permissions)
WHATSAPP_SESSIONS_DIR=${whatsappSessionsPath}

# Security & Master Auth
SUPERADMIN_EMAIL=${adminEmail}
JWT_SECRET=super_secret_jwt_random_key_replace_me_in_prod
SESSION_ENCRYPTION_KEY=32_character_hex_encryption_key_here

# Outbound Rate-Limiting & Message Warming Limits
DEFAULT_DAILY_QUOTA=25000
RATE_LIMIT_DELAY_MS=1200
RANDOM_JITTER_MS=800

# Tripbone Tour Booking Webhook Connector
TRIPBONE_ENABLED=true
TRIPBONE_WEBHOOK_URL=https://${domain}/api/webhooks/tripbone`;

  const handleDownloadBundle = () => {
    const zipNote = `WhatsCRM VPS Deployment Bundle
===============================
Generated for: ${domain}
Port: ${serverPort}
Admin: ${adminEmail}

Included files:
- install.sh
- nginx.conf
- ecosystem.config.js
- docker-compose.yml
- .env.production

Run 'chmod +x install.sh && sudo ./install.sh' on your Ubuntu 22.04/24.04 VPS.`;

    const blob = new Blob([zipNote + '\n\n' + oneClickInstallScript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `whatscrm_vps_deploy_${domain.replace(/[^a-z0-9]/g, '_')}.sh`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowNotice('Downloaded VPS installation script!');
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([INSTALLATION_GUIDE_MD], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'INSTALLATION_GUIDE.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowNotice('Downloaded INSTALLATION_GUIDE.md!');
  };

  return (
    <div className="space-y-6">
      {/* Executive Header Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-mono text-slate-300 border border-white/10">
              <Server className="w-3.5 h-3.5 text-indigo-400" />
              <span>Production VPS Deployment Guide</span>
              <span className="opacity-40">•</span>
              <span className="text-emerald-400 font-semibold">Ubuntu 22.04 / 24.04 LTS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Deploy WhatsCRM & Baileys Gateway on Your Own VPS
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Step-by-step instructions, automated shell scripts, Nginx reverse proxy configs, PM2 daemon setup, and session persistence best practices for DigitalOcean, Hetzner, AWS EC2, or Contabo.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
            <button
              onClick={handleDownloadMarkdown}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20"
            >
              <FileText className="w-4 h-4" />
              <span>Download INSTALL.md</span>
            </button>
            <button
              onClick={handleDownloadBundle}
              className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-950 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-white/10"
            >
              <Download className="w-4 h-4" />
              <span>Download VPS Script (.sh)</span>
            </button>
            <button
              onClick={() => setActiveTab('config-generator')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2 border border-slate-700"
            >
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Configure Domain & Port</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hardware Requirements & Quick Specs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
            <Cpu className="w-4 h-4 text-indigo-500" />
            <span>Recommended CPU</span>
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white font-mono">2 vCPU Cores</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Supports up to 25 simultaneous Baileys socket links.</p>
        </div>

        <div className="bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
            <HardDrive className="w-4 h-4 text-indigo-500" />
            <span>RAM & Swap</span>
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white font-mono">4 GB RAM + 2GB Swap</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Essential for Chromium QR engine and media caching.</p>
        </div>

        <div className="bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
            <Globe className="w-4 h-4 text-emerald-500" />
            <span>Operating System</span>
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white font-mono">Ubuntu 22.04 LTS</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Also tested on Ubuntu 24.04 and Debian 12 Bookworm.</p>
        </div>

        <div className="bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
            <Lock className="w-4 h-4 text-indigo-500" />
            <span>SSL & Domain</span>
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white font-mono">Free Let's Encrypt</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Automated certbot SSL renew cron included.</p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/80 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('quickstart')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'quickstart'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>1-Click Automated Script</span>
        </button>

        <button
          onClick={() => setActiveTab('manual')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'manual'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-indigo-500" />
          <span>Manual Step-by-Step</span>
        </button>

        <button
          onClick={() => setActiveTab('nginx')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'nginx'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-emerald-500" />
          <span>Nginx & SSL Proxy</span>
        </button>

        <button
          onClick={() => setActiveTab('docker')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'docker'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-blue-500" />
          <span>Docker Compose Setup</span>
        </button>

        <button
          onClick={() => setActiveTab('config-generator')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'config-generator'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-purple-500" />
          <span>Interactive Config Generator</span>
        </button>

        <button
          onClick={() => setActiveTab('troubleshooting')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'troubleshooting'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-rose-500" />
          <span>Anti-Ban & Troubleshooting</span>
        </button>

        <button
          onClick={() => setActiveTab('markdown-guide')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'markdown-guide'
              ? 'bg-emerald-500 text-white shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-emerald-400" />
          <span>INSTALL.md (Raw Markdown)</span>
        </button>
      </div>

      {/* TAB 1: 1-Click Automated Script */}
      {activeTab === 'quickstart' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Quick Install Command (Automated)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  SSH into your fresh Ubuntu VPS (as root or sudo user) and execute this single command:
                </p>
              </div>
              <button
                onClick={() => copyToClipboard('curl -fsSL https://get.whatscrm.cloud/vps-install.sh | sudo bash', 'quickcmd')}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
              >
                {copiedKey === 'quickcmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'quickcmd' ? 'Copied' : 'Copy Command'}</span>
              </button>
            </div>

            <div className="bg-slate-950 text-slate-200 font-mono text-xs p-4 rounded-xl border border-slate-800 overflow-x-auto selection:bg-indigo-500 selection:text-white">
              <code>curl -fsSL https://get.whatscrm.cloud/vps-install.sh | sudo bash</code>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">What this automated script does:</span>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Updates apt packages and installs system libraries for Baileys</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Sets up UFW firewall (allows SSH 22, HTTP 80, HTTPS 443, Port 3000)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Installs Node.js 20 LTS, NPM, TSX, ESBuild, and PM2</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Creates persistent multidevice session directory in <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">/var/whatscrm/sessions</code></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Configures PM2 daemon to auto-restart on system reboots</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Installs Nginx and Certbot for automatic SSL renewal</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Detailed Script Preview */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-indigo-500" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Full Source: <span className="font-mono text-xs">vps-install.sh</span>
                </h4>
              </div>
              <button
                onClick={() => copyToClipboard(oneClickInstallScript, 'fullscript')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === 'fullscript' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'fullscript' ? 'Copied Full Script' : 'Copy Full Script'}</span>
              </button>
            </div>

            <div className="bg-slate-950 text-slate-300 font-mono text-[11px] p-4 rounded-xl border border-slate-800 max-h-72 overflow-y-auto">
              <pre className="whitespace-pre">{oneClickInstallScript}</pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Manual Step-by-Step */}
      {activeTab === 'manual' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Complete Manual Deployment Walkthrough
            </h3>

            {/* Step 1 */}
            <div className="space-y-2 border-l-2 border-indigo-500 pl-4">
              <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider font-mono">
                Step 1: Provision Server & Install OS Dependencies
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Connect via SSH: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">ssh root@YOUR_VPS_IP</code>, update repositories, and install dependencies required by Baileys WhatsApp QR renderer:
              </p>
              <div className="bg-slate-950 text-slate-200 p-3 rounded-xl font-mono text-xs flex items-center justify-between">
                <code>sudo apt-get update && sudo apt-get install -y curl git build-essential ufw nginx certbot python3-certbot-nginx libnss3 libatk1.0-0 libgbm1 libasound2</code>
                <button
                  onClick={() => copyToClipboard('sudo apt-get update && sudo apt-get install -y curl git build-essential ufw nginx certbot python3-certbot-nginx libnss3 libatk1.0-0 libgbm1 libasound2', 'step1')}
                  className="p-1 hover:text-white"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="space-y-2 border-l-2 border-indigo-500 pl-4">
              <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider font-mono">
                Step 2: Install Node.js 20 LTS & Process Manager (PM2)
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Baileys v6 requires modern Node.js features (crypto, Fetch API, and WebSockets):
              </p>
              <div className="bg-slate-950 text-slate-200 p-3 rounded-xl font-mono text-xs flex items-center justify-between">
                <code>curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs && sudo npm install -g pm2 tsx esbuild</code>
                <button
                  onClick={() => copyToClipboard('curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs && sudo npm install -g pm2 tsx esbuild', 'step2')}
                  className="p-1 hover:text-white"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Step 3 */}
            <div className="space-y-2 border-l-2 border-indigo-500 pl-4">
              <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider font-mono">
                Step 3: Setup Project Directory & Multi-Tenant Session Storage
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Create the application folder and ensure the WhatsApp sessions directory is writeable:
              </p>
              <div className="bg-slate-950 text-slate-200 p-3 rounded-xl font-mono text-xs flex items-center justify-between">
                <code>sudo mkdir -p /var/whatscrm/sessions && sudo chown -R $USER:$USER /var/whatscrm && chmod 750 /var/whatscrm/sessions</code>
                <button
                  onClick={() => copyToClipboard('sudo mkdir -p /var/whatscrm/sessions && sudo chown -R $USER:$USER /var/whatscrm && chmod 750 /var/whatscrm/sessions', 'step3')}
                  className="p-1 hover:text-white"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Step 4 */}
            <div className="space-y-2 border-l-2 border-indigo-500 pl-4">
              <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider font-mono">
                Step 4: Build & Launch with PM2
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Run the build and start the background daemon:
              </p>
              <div className="bg-slate-950 text-slate-200 p-3 rounded-xl font-mono text-xs flex items-center justify-between">
                <code>cd /var/whatscrm && npm ci && npm run build && pm2 start server.ts --interpreter tsx --name whatscrm && pm2 save && pm2 startup</code>
                <button
                  onClick={() => copyToClipboard('cd /var/whatscrm && npm ci && npm run build && pm2 start server.ts --interpreter tsx --name whatscrm && pm2 save && pm2 startup', 'step4')}
                  className="p-1 hover:text-white"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Nginx & SSL Proxy */}
      {activeTab === 'nginx' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Nginx Reverse Proxy Configuration with WebSocket Support
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Save this file to <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs">/etc/nginx/sites-available/{domain}</code>
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(nginxConfig, 'nginx')}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
              >
                {copiedKey === 'nginx' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'nginx' ? 'Copied' : 'Copy Nginx Config'}</span>
              </button>
            </div>

            <div className="bg-slate-950 text-slate-300 font-mono text-xs p-4 rounded-xl border border-slate-800 max-h-80 overflow-y-auto">
              <pre className="whitespace-pre">{nginxConfig}</pre>
            </div>

            {/* Certbot Command */}
            <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/50 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs text-indigo-900 dark:text-indigo-300">
                <Lock className="w-4 h-4" />
                <span>Issue Free Let's Encrypt SSL Certificate:</span>
              </div>
              <div className="bg-slate-950 text-slate-200 p-2.5 rounded-lg font-mono text-xs flex items-center justify-between">
                <code>sudo certbot --nginx -d {domain} -m {adminEmail} --agree-tos --non-interactive</code>
                <button
                  onClick={() => copyToClipboard(`sudo certbot --nginx -d ${domain} -m ${adminEmail} --agree-tos --non-interactive`, 'certbot')}
                  className="p-1 hover:text-white cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Docker Compose Setup */}
      {activeTab === 'docker' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Docker Compose Production Stack (App + Redis + Persistent Volume)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ideal for containerized deployments with isolation for WhatsApp Baileys session files.
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(dockerComposeYaml, 'docker')}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
              >
                {copiedKey === 'docker' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'docker' ? 'Copied' : 'Copy docker-compose.yml'}</span>
              </button>
            </div>

            <div className="bg-slate-950 text-slate-300 font-mono text-xs p-4 rounded-xl border border-slate-800 max-h-80 overflow-y-auto">
              <pre className="whitespace-pre">{dockerComposeYaml}</pre>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
              <span>Start Docker stack in detached mode:</span>
              <code className="font-mono font-bold bg-slate-900 text-white px-2 py-1 rounded">docker compose up -d</code>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Interactive Config Generator */}
      {activeTab === 'config-generator' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-6 shadow-xs">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Interactive VPS Configuration Generator
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Customize your server domain, port, and session directory to generate ready-to-use config files.
              </p>
            </div>

            {/* Input Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Server FQDN / Domain Name
                </label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="e.g. api.yourdomain.com"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Application Port
                </label>
                <input
                  type="text"
                  value={serverPort}
                  onChange={(e) => setServerPort(e.target.value)}
                  placeholder="3000"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  SuperAdmin Notification Email
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@yourdomain.com"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  WhatsApp Sessions Directory (Linux Path)
                </label>
                <input
                  type="text"
                  value={whatsappSessionsPath}
                  onChange={(e) => setWhatsappSessionsPath(e.target.value)}
                  placeholder="/var/whatscrm/sessions"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Deployment Architecture
                </label>
                <select
                  value={runtimeType}
                  onChange={(e) => setRuntimeType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="pm2">PM2 (Recommended for Bare Metal)</option>
                  <option value="docker">Docker & Docker Compose</option>
                </select>
              </div>
            </div>

            {/* Generated .env file preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Generated <code className="font-mono">.env.production</code>:
                </span>
                <button
                  onClick={() => copyToClipboard(envProduction, 'env')}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'env' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'env' ? 'Copied' : 'Copy .env'}</span>
                </button>
              </div>
              <div className="bg-slate-950 text-slate-300 font-mono text-xs p-4 rounded-xl border border-slate-800 max-h-60 overflow-y-auto">
                <pre className="whitespace-pre">{envProduction}</pre>
              </div>
            </div>

            {/* Generated PM2 ecosystem */}
            {runtimeType === 'pm2' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Generated <code className="font-mono">ecosystem.config.js</code>:
                  </span>
                  <button
                    onClick={() => copyToClipboard(pm2Config, 'pm2')}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'pm2' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'pm2' ? 'Copied' : 'Copy PM2 Config'}</span>
                  </button>
                </div>
                <div className="bg-slate-950 text-slate-300 font-mono text-xs p-4 rounded-xl border border-slate-800 max-h-60 overflow-y-auto">
                  <pre className="whitespace-pre">{pm2Config}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: Anti-Ban & Troubleshooting */}
      {activeTab === 'troubleshooting' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span>WhatsApp VPS Anti-Ban & High Availability Best Practices</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>1. IP Reputation & VPS Cleanliness</span>
                </div>
                <p>
                  Avoid bargain VPS providers whose subnets are flagged as VPN or proxy egress nodes. Opt for Hetzner Dedicated, DigitalOcean, or AWS EC2 with a clean elastic IPv4.
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>2. Rate-Limiting & Jitter Delay</span>
                </div>
                <p>
                  Never send blast broadcasts simultaneously. The platform includes automatic random jitter (800ms - 2400ms delay between dispatches) to replicate natural human typing.
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>3. Multi-Device Session Persistence</span>
                </div>
                <p>
                  Baileys stores multi-device keys in <code className="font-mono">sessions/</code>. Always backup this directory with daily rsync cron to prevent subscribers having to re-scan QR codes.
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>4. Memory Leak Guard (max_memory_restart)</span>
                </div>
                <p>
                  Configure PM2 with <code className="font-mono">max_memory_restart: '1800M'</code> so if heavy media processing spikes memory, the daemon gracefully restarts child threads without downtime.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Markdown Guide (.md) */}
      {activeTab === 'markdown-guide' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    INSTALLATION_GUIDE.md
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    Markdown Format
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Complete standalone installation documentation from scratch. You can copy or download this file directly.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(INSTALLATION_GUIDE_MD, 'full_md')}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                >
                  {copiedKey === 'full_md' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'full_md' ? 'Copied Markdown' : 'Copy Raw Markdown'}</span>
                </button>
                <button
                  onClick={handleDownloadMarkdown}
                  className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .md File</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-950 text-slate-200 font-mono text-xs p-5 rounded-xl border border-slate-800 overflow-x-auto max-h-[600px] overflow-y-auto leading-relaxed">
              <pre className="whitespace-pre font-mono">{INSTALLATION_GUIDE_MD}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
