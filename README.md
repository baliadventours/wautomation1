# WhatsCRM & WhatsApp Multi-Device Gateway

Automated WhatsApp CRM & Tour Operator Communication System.

## Webdock VPS Deployment (Ubuntu Noble 24.04)

Your Webdock VPS details:
- **Domain:** `wautomation1.vps.webdock.cloud`
- **Server IP:** `193.181.218.146`
- **OS:** Ubuntu 24.04 LTS (Noble Numbat)
- **Repository:** `https://github.com/baliadventours/wautomation1`

---

### Option A: 1-Line Fast Install (Recommended)

SSH into your Webdock VPS (or open the **Web Terminal** in the Webdock control panel) and run:

```bash
curl -fsSL https://raw.githubusercontent.com/baliadventours/wautomation1/main/install-webdock.sh | sudo bash
```

---

### Option B: Manual Step-by-Step Installation

#### 1. Connect to your VPS via SSH
```bash
ssh root@193.181.218.146
# or
ssh root@wautomation1.vps.webdock.cloud
```

#### 2. Clone the Repository
```bash
git clone https://github.com/baliadventours/wautomation1.git /var/whatscrm
cd /var/whatscrm
```

#### 3. Run the Webdock Installer
```bash
sudo bash install-webdock.sh wautomation1.vps.webdock.cloud
```

The script will automatically:
1. Stop any port conflicts (Apache/Nginx defaults).
2. Install Docker Engine and the Docker Compose v2 plugin.
3. Configure PostgreSQL 16, Redis 7, Evolution API Gateway v2, and the WhatsCRM App.
4. Set up an Nginx reverse proxy with WebSocket support.
5. Request a free SSL certificate from Let's Encrypt for `wautomation1.vps.webdock.cloud`.
6. Launch all containers in background mode (`restart: unless-stopped`).

---

### Managing the Application

#### View Live Application Logs
```bash
cd /var/whatscrm
docker compose logs -f app
```

#### View WhatsApp Gateway Logs
```bash
docker compose logs -f whatsapp_gateway
```

#### Restart the Entire Stack
```bash
cd /var/whatscrm
docker compose restart
```

#### Update to Latest Code from GitHub
```bash
cd /var/whatscrm
git pull origin main
docker compose up -d --build
```

---

### Endpoints & Ports

- **Dashboard & REST API:** `https://wautomation1.vps.webdock.cloud` (Port 443 / 80)
- **WhatsApp Gateway:** `https://wautomation1.vps.webdock.cloud/gateway/` (Port 8080)
- **Tripbone Webhook:** `https://wautomation1.vps.webdock.cloud/api/integrations/tripbone/webhook`
- **Health Check:** `https://wautomation1.vps.webdock.cloud/api/health`
