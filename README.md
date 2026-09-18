# WhatsSaaS - Multi-Tenant WhatsApp Automation Platform

A multi-tenant WhatsApp SaaS platform built on **Next.js (App Router)**, **Supabase (PostgreSQL + Auth + Row Level Security)**, and **Evolution API v2** (self-hosted WhatsApp REST gateway engine).

---

## System Architecture

```
[ Tenant Browser ] 
        │ 
        ▼ (HTTPS / Supabase JWT)
┌────────────────────────────────────────────────────────────────────────┐
│                      Next.js SaaS Backend (Vercel)                     │
│                                                                        │
│  • App Router API: /api/whatsapp/instances, /connect, /send            │
│  • Webhook Receiver: /api/webhooks/evolution                           │
│  • AES-256-GCM Token Encryption & Per-Tenant Quota Enforcer            │
│  • Keyword Automation Engine (Matches incoming message -> Auto-reply)  │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │                                 │
                   ▼ (RLS Enforced Queries)          ▼ (Evolution REST / Webhooks)
┌─────────────────────────────────────┐   ┌──────────────────────────────────────────────┐
│       Supabase (PostgreSQL)         │   │         VPS Docker Stack (Webdock)           │
│                                     │   │                                              │
│ • profiles (auth.users linkage)     │   │ • Evolution API v2 (repo: baliadventours/...) │
│ • whatsapp_instances (status, QR)   │   │ • PostgreSQL 16 (session store)              │
│ • message_logs (in/out audit)       │   │ • Redis 7 (queue & state cache)              │
│ • automations (keyword rules)       │   │                                              │
│ • subscriptions (plan limits)       │   │ Global Admin Key: NEVER exposed to browser   │
└─────────────────────────────────────┘   └──────────────────────────────────────────────┘
```

---

## 1. Environment Variables Setup

Create your `.env.local` file (or set variables in Vercel / Docker):

```env
# 1. Supabase Credentials (from Supabase Dashboard -> Settings -> API)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 2. Evolution API Gateway (running on your VPS)
EVOLUTION_API_BASE_URL="http://193.181.218.146:8080" # Or https://wautomation1.vps.webdock.cloud:8080
EVOLUTION_API_ADMIN_KEY="wac_gateway_master_key_8921a"

# 3. SaaS Domain & Encryption
NEXT_PUBLIC_APP_URL="https://my-saas-domain.com"
ENCRYPTION_KEY="replace-with-32-character-secret-key!"

# 4. Stripe (Optional for MVP)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

---

## 2. Database Migrations (Supabase / PostgreSQL)

The complete SQL migration is located at:
`supabase/migrations/20260916000000_init_whatsapp_saas.sql`

### How to apply:
1. Open your **Supabase Dashboard** -> **SQL Editor**.
2. Copy and paste the contents of `supabase/migrations/20260916000000_init_whatsapp_saas.sql`.
3. Click **Run**.

### What this migration creates:
1. `profiles`: references `auth.users`, handles profile metadata, plan status, and timestamps.
2. `subscriptions`: tracks active plan tier (`starter`, `pro`, `enterprise`), `instance_limit`, and monthly message quota (`messages_sent_this_period` / `message_limit`).
3. `whatsapp_instances`: stores tenant-scoped instances (`instance_name = tenant_<user_id>_<timestamp>`), status (`connecting`, `connected`, `disconnected`, `banned`), phone number, and AES-256 encrypted instance token.
4. `message_logs`: audit trail for all inbound and outbound WhatsApp messages.
5. `automations`: keyword auto-responder rules (e.g., keyword `pricing` -> reply with tour catalog).
6. **Row Level Security (RLS)**: Strictly limits tenants to only query and mutate their own instances, messages, and automations.
7. **Automated User Provisioning Trigger**: Whenever a user registers in Supabase Auth, a profile and default Starter subscription are automatically provisioned.

---

## 3. Endpoints & Features

| Method | Route | Description |
| :--- | :--- | :--- |
| `POST` | `/api/whatsapp/instances` | Checks subscription quota, provisions Evolution instance, generates encrypted token, saves to DB |
| `GET` | `/api/whatsapp/instances` | Lists all WhatsApp instances owned by authenticated tenant |
| `GET` | `/api/whatsapp/instances/[id]/connect` | Fetches live QR code & pairing code; syncs status if already connected |
| `POST` | `/api/whatsapp/instances/[id]/send` | Sends text message via Evolution API, verifies quota, logs to `message_logs` |
| `DELETE` | `/api/whatsapp/instances/[id]` | Deletes instance in Evolution API and removes database record |
| `POST` | `/api/webhooks/evolution` | Webhook receiver: updates connection state, logs incoming messages, and triggers keyword auto-replies |

---

## 4. Testing the "Connect WhatsApp" QR Flow

1. Register or Log in as a tenant.
2. Go to **Channels / WhatsApp** in the dashboard.
3. Click **"Connect WhatsApp"**.
4. The backend calls `POST /api/whatsapp/instances`, initializing an instance in your VPS's Evolution API.
5. A live QR code is displayed (along with an optional 8-digit phone pairing code).
6. Open WhatsApp on your phone -> **Linked Devices** -> **Link a Device** -> scan the QR.
7. Evolution API fires `CONNECTION_UPDATE` to `/api/webhooks/evolution`, marking the instance `connected` in Supabase.

---

## 5. Testing the Keyword Auto-Reply Automation

1. Create a keyword automation in the dashboard:
   - **Name:** "Tour Pricing Auto-Responder"
   - **Trigger:** Keyword = `tours` or `pricing` (contains)
   - **Reply:** "Hello from Bali Adventours! Check out our tours at https://baliadventours.com"
2. Send a WhatsApp message containing `tours` to the connected number.
3. Evolution API posts `MESSAGES_UPSERT` to `/api/webhooks/evolution`.
4. The webhook verifies tenant ownership, logs the message to `message_logs`, matches the rule, and automatically replies to the sender!

---

## 6. VPS Deployment (Webdock / Docker)

To run the Evolution API engine on your Webdock VPS:

```bash
# 1. SSH into VPS
ssh root@193.181.218.146

# 2. View running containers
docker compose ps

# 3. Check Evolution API logs
docker compose logs -f whatsapp_gateway
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
