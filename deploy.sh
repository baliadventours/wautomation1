#!/usr/bin/env bash
# ==============================================================================
# WhatsCRM & WhatsApp Multi-Device Gateway Production Deployment Script
# Target OS: Ubuntu 22.04 LTS / 24.04 LTS or Debian 12
# Ports: 80 (HTTP), 443 (HTTPS), 3000 (CRM Backend/UI), 8080 (WhatsApp Gateway)
# ==============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}==================================================================${NC}"
echo -e "${GREEN}    WhatsCRM & WhatsApp Multi-Device Gateway Production Deployer  ${NC}"
echo -e "${BLUE}==================================================================${NC}"

# Check root privileges
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}[ERROR] Please run this script as root or with sudo:${NC} sudo bash deploy.sh"
  exit 1
fi

APP_DIR="/var/whatscrm"
DOMAIN="${1:-}"

if [ -z "$DOMAIN" ]; then
  echo -e "${YELLOW}[PROMPT] Enter your domain or subdomain (e.g. crm.yourdomain.com):${NC}"
  read -r DOMAIN
fi

if [ -z "$DOMAIN" ]; then
  echo -e "${RED}[ERROR] Domain name is required for Nginx and SSL setup.${NC}"
  exit 1
fi

echo -e "\n${BLUE}[1/6] Installing Essential Packages & Docker Engine...${NC}"
apt-get update -y
apt-get install -y curl git ufw nginx certbot python3-certbot-nginx jq

if ! command -v docker &> /dev/null; then
  echo -e "${BLUE}Installing Docker...${NC}"
  curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
  sh /tmp/get-docker.sh
  systemctl enable docker
  systemctl start docker
fi

# Ensure docker compose plugin exists
apt-get install -y docker-compose-plugin

echo -e "\n${BLUE}[2/6] Setting Up Project Directory & Storage Volumes...${NC}"
mkdir -p "$APP_DIR"
mkdir -p "$APP_DIR/data/sessions"
mkdir -p "$APP_DIR/postgres_data"
mkdir -p "$APP_DIR/redis_data"
mkdir -p "$APP_DIR/gateway_instances"
chmod -R 775 "$APP_DIR"

cd "$APP_DIR"

echo -e "\n${BLUE}[3/6] Generating Secure Production Environment (.env)...${NC}"
PG_PASSWORD=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 24)
REDIS_PASSWORD=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 24)
GATEWAY_MASTER_KEY=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 32)
JWT_SECRET=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 32)
TRIPBONE_SECRET=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 24)

cat <<EOF > "$APP_DIR/.env"
NODE_ENV=production
PORT=3000
APP_URL=https://$DOMAIN
DOMAIN=$DOMAIN

# Database & Cache
DATABASE_URL=postgresql://whatscrm:$PG_PASSWORD@postgres:5432/whatscrm_production
POSTGRES_USER=whatscrm
POSTGRES_PASSWORD=$PG_PASSWORD
POSTGRES_DB=whatscrm_production

REDIS_URL=redis://:$REDIS_PASSWORD@redis:6379/0
REDIS_PASSWORD=$REDIS_PASSWORD

# WhatsApp Multi-Device Gateway (Evolution API / Baileys)
WHATSAPP_GATEWAY_URL=http://whatsapp_gateway:8080
WHATSAPP_GATEWAY_API_KEY=$GATEWAY_MASTER_KEY
AUTHENTICATION_API_KEY=$GATEWAY_MASTER_KEY

# Security & Webhooks
JWT_SECRET=$JWT_SECRET
TRIPBONE_WEBHOOK_SECRET=$TRIPBONE_SECRET
MIN_OUTBOUND_DELAY_SEC=2.5
SIMULATE_TYPING_PRESENCE=true
EOF

echo -e "${GREEN}✓ Generated secure production secrets in $APP_DIR/.env${NC}"

echo -e "\n${BLUE}[4/6] Creating docker-compose.yml...${NC}"
cat <<'EOF' > "$APP_DIR/docker-compose.yml"
version: '3.8'

services:
  # 1. WhatsCRM Core App (React UI + Express REST API)
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: whatscrm_app
    restart: unless-stopped
    ports:
      - "127.0.0.1:3000:3000"
    env_file: .env
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      whatsapp_gateway:
        condition: service_started
    volumes:
      - ./data:/app/data

  # 2. WhatsApp Multi-Device Gateway Daemon (Evolution API v2)
  whatsapp_gateway:
    image: atendai/evolution-api:v2.1.2
    container_name: whatscrm_gateway
    restart: unless-stopped
    ports:
      - "127.0.0.1:8080:8080"
    environment:
      - SERVER_PORT=8080
      - AUTHENTICATION_API_KEY=${AUTHENTICATION_API_KEY}
      - DATABASE_ENABLED=true
      - DATABASE_CONNECTION_URI=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      - CACHE_REDIS_ENABLED=true
      - CACHE_REDIS_URI=redis://:${REDIS_PASSWORD}@redis:6379/1
      - WEBHOOK_GLOBAL_URL=http://app:3000/api/webhooks/whatsapp
      - CONFIG_SESSION_PHONE_CLIENT=WhatsCRM
    depends_on:
      - postgres
      - redis
    volumes:
      - ./gateway_instances:/evolution/instances

  # 3. PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: whatscrm_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - ./postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 5s
      timeout: 5s
      retries: 5

  # 4. Redis Cache & Job Queue
  redis:
    image: redis:7-alpine
    container_name: whatscrm_redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD} --appendonly yes
    volumes:
      - ./redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  redis_data:
  gateway_instances:
EOF

echo -e "\n${BLUE}[5/6] Configuring Nginx Reverse Proxy with WebSocket Support...${NC}"
cat <<EOF > "/etc/nginx/sites-available/whatscrm"
server {
    listen 80;
    server_name $DOMAIN;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;

    # SSL will be configured via certbot below
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    client_max_body_size 50M;

    # Main Application and API
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
rm -f /etc/nginx/sites-enabled/default

echo -e "\n${BLUE}[6/6] Obtaining Free SSL Certificate via Let's Encrypt...${NC}"
systemctl reload nginx || true
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "admin@$DOMAIN" --redirect || {
  echo -e "${YELLOW}[NOTICE] Certbot could not obtain certificate automatically. Ensure DNS points to this server IP.${NC}"
}

# Firewall
ufw allow 22/tcp || true
ufw allow 80/tcp || true
ufw allow 443/tcp || true
ufw --force enable || true

echo -e "\n${GREEN}==================================================================${NC}"
echo -e "${GREEN}    WhatsCRM Production Deployment Successfully Configured!       ${NC}"
echo -e "${GREEN}==================================================================${NC}"
echo -e "Your Dashboard: ${BLUE}https://$DOMAIN${NC}"
echo -e "WhatsApp Gateway: ${BLUE}https://$DOMAIN/gateway/${NC}"
echo -e "Master Gateway API Key: ${YELLOW}$GATEWAY_MASTER_KEY${NC}"
echo -e "Environment Config: ${YELLOW}$APP_DIR/.env${NC}"
echo -e "\nTo start or restart the entire stack:"
echo -e "${BLUE}cd $APP_DIR && docker compose up -d${NC}"
