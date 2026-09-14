import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { Tenant, Conversation, Message, WorkflowRule, WebhookLog, MetricsData, DispatchJob, Driver } from '../src/types';

const { Pool } = pg;

export interface DatabaseSchema {
  version: number;
  tenants: Tenant[];
  conversations: Conversation[];
  messages: Message[];
  workflows: WorkflowRule[];
  webhookLogs: WebhookLog[];
  dispatchJobs: DispatchJob[];
  drivers: Driver[];
  metrics: MetricsData;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

const INITIAL_DRIVERS: Driver[] = [
  {
    id: 'drv-made-wijaya',
    name: 'Pak Made Wijaya',
    phone: '+62 812-9876-5432',
    vehicleModel: 'Toyota Innova Reborn (Silver)',
    licensePlate: 'DK 1829 FB',
    rating: 4.98,
    totalTrips: 642,
    status: 'available',
    languages: ['English', 'Indonesian', 'Balinese'],
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'drv-gede-pratama',
    name: 'Pak Gede Pratama',
    phone: '+62 813-2345-6789',
    vehicleModel: 'Toyota HiAce Commuter VIP (12 Seater)',
    licensePlate: 'DK 7192 AB',
    rating: 4.95,
    totalTrips: 498,
    status: 'available',
    languages: ['English', 'Japanese', 'Indonesian'],
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'drv-wayan-sudiarta',
    name: 'Pak Wayan Sudiarta',
    phone: '+62 811-3456-7890',
    vehicleModel: 'Toyota Fortuner 4x4 (Black)',
    licensePlate: 'DK 9021 BZ',
    rating: 4.99,
    totalTrips: 820,
    status: 'available',
    languages: ['English', 'French', 'Indonesian'],
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'drv-ketut-suarta',
    name: 'Pak Ketut Suarta',
    phone: '+62 819-4567-8901',
    vehicleModel: 'Suzuki Ertiga Hybrid (White)',
    licensePlate: 'DK 3018 KL',
    rating: 4.92,
    totalTrips: 375,
    status: 'available',
    languages: ['English', 'Indonesian'],
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
  },
];

const INITIAL_TENANTS: Tenant[] = [
  {
    id: 'tenant-bali-adventures',
    name: 'Bali Adventours & Treks',
    businessType: 'Tour Operator & Outdoor Expeditions',
    plan: 'Enterprise',
    apiKey: 'wac_live_8f7b2a9e10c43d92',
    webhookSecret: 'whsec_tripbone_bali_9948271a',
    strictSignatureVerification: false,
    createdAt: '2026-01-15',
    whatsappAccount: {
      status: 'disconnected',
    },
  },
  {
    id: 'tenant-seminyak-villas',
    name: 'Seminyak Luxury Sanctuaries',
    businessType: 'Boutique Resort & Villas',
    plan: 'Pro',
    apiKey: 'wac_live_4a1c99f03d55e812',
    webhookSecret: 'whsec_tripbone_seminyak_8812a',
    strictSignatureVerification: false,
    createdAt: '2026-02-01',
    whatsappAccount: {
      status: 'disconnected',
    },
  },
  {
    id: 'tenant-nusa-dive-center',
    name: 'Nusa Penida Manta Divers',
    businessType: 'PADI Dive Center & Boat Charters',
    plan: 'Starter',
    apiKey: 'wac_live_c33b708e9221da45',
    webhookSecret: 'whsec_tripbone_nusadive_3321c',
    strictSignatureVerification: false,
    createdAt: '2026-03-10',
    whatsappAccount: {
      status: 'disconnected',
    },
  },
];

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    tenantId: 'tenant-bali-adventures',
    customerName: 'Marcus Vance',
    phoneNumber: '+61 412 345 678',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    lastMessage: 'Awesome, see you at 02:30 AM tomorrow for Mount Batur!',
    lastMessageTimestamp: '10:45 AM',
    unreadCount: 0,
    status: 'open',
    tags: ['#mount-batur', '#hotel-pickup', '#tripbone-booking'],
    assignedAgent: 'Wayan Putra',
    isOptedOut: false,
    tripboneBooking: {
      bookingId: 'TB-89421',
      tourName: 'Mount Batur Sunrise Trekking & Natural Hot Springs',
      tourDate: 'Tomorrow, 14 Sep 2026',
      pickupTime: '02:30 AM WITA',
      pickupLocation: 'Padma Resort Ubud (Main Lobby)',
      pax: 2,
      totalAmount: '$180 USD',
      paymentStatus: 'Paid',
      assignedDriver: 'Pak Made Wijaya (+62 812-9876-5432)',
      notes: 'Vegetarian breakfast requested on summit. Flashlights & trekking poles ready.',
    },
  },
  {
    id: 'conv-2',
    tenantId: 'tenant-bali-adventures',
    customerName: 'Sophie Dubois',
    phoneNumber: '+33 6 12 34 56 78',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    lastMessage: 'Can we reschedule the Nusa Penida speedboat tour if it rains?',
    lastMessageTimestamp: '09:20 AM',
    unreadCount: 2,
    status: 'open',
    tags: ['#weather-inquiry', '#nusa-penida'],
    assignedAgent: 'Ketut Astika',
    isOptedOut: false,
  },
  {
    id: 'conv-3',
    tenantId: 'tenant-seminyak-villas',
    customerName: 'Liam & Emma Hemsworth',
    phoneNumber: '+44 7911 123456',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
    lastMessage: 'We would love the floating flower breakfast in Villa 4 tomorrow morning.',
    lastMessageTimestamp: 'Yesterday',
    unreadCount: 0,
    status: 'resolved',
    tags: ['#concierge', '#vip-guest'],
    assignedAgent: 'Gede Suarna',
    isOptedOut: false,
  },
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm-1',
    conversationId: 'conv-1',
    sender: 'customer',
    text: 'Hi Bali Adventours! We booked the sunrise trek on Tripbone. Can you confirm if our driver is picking us up at Padma Resort Ubud?',
    timestamp: '10:30 AM',
    status: 'read',
  },
  {
    id: 'm-2',
    conversationId: 'conv-1',
    sender: 'system',
    text: '⚡ Tripbone Booking Synced: Reservation #TB-89421 validated.',
    timestamp: '10:31 AM',
    status: 'read',
    isAutomated: true,
  },
  {
    id: 'm-3',
    conversationId: 'conv-1',
    sender: 'business',
    text: 'Good morning Marcus! Yes, confirmed! Your driver Pak Made Wijaya (+62 812-9876-5432) will be at the Padma Resort lobby at exactly 02:30 AM. He will arrive in a silver Toyota Innova (DK 8821 FB).',
    timestamp: '10:34 AM',
    status: 'read',
  },
  {
    id: 'm-4',
    conversationId: 'conv-1',
    sender: 'customer',
    text: 'Awesome, see you at 02:30 AM tomorrow for Mount Batur!',
    timestamp: '10:45 AM',
    status: 'read',
  },
  {
    id: 'm-5',
    conversationId: 'conv-2',
    sender: 'customer',
    text: 'Hello, what is your policy if high waves delay the Sanur harbour boats?',
    timestamp: '09:15 AM',
    status: 'delivered',
  },
  {
    id: 'm-6',
    conversationId: 'conv-2',
    sender: 'customer',
    text: 'Can we reschedule the Nusa Penida speedboat tour if it rains?',
    timestamp: '09:20 AM',
    status: 'delivered',
  },
];

const INITIAL_WORKFLOWS: WorkflowRule[] = [
  {
    id: 'wf-1',
    tenantId: 'tenant-bali-adventures',
    name: 'Tripbone Instant Booking Confirmation & PDF Voucher',
    description: 'Auto-dispatches WhatsApp confirmation, Google Maps hotel pickup coordinates, and PDF voucher when Tripbone confirms a tour.',
    triggerType: 'tripbone_booking_created',
    triggerValue: 'status == "PAID"',
    conditions: ['Customer phone has international prefix', 'Tour date is in future'],
    actionType: 'send_template',
    actionPayload: 'template_tripbone_confirmed_voucher_v1',
    isActive: true,
    runsCount: 342,
    lastRunAt: 'Today, 10:42 AM',
  },
  {
    id: 'wf-2',
    tenantId: 'tenant-bali-adventures',
    name: '24-Hour Pre-Tour Driver & Pickup Dispatcher',
    description: 'Pings travelers exactly 24 hours before pickup with the assigned driver name, vehicle plate, and pickup guidelines.',
    triggerType: 'tour_reminder_24h',
    triggerValue: 'departure_time - 24h',
    conditions: ['Status is Confirmed', 'Driver is assigned'],
    actionType: 'send_template',
    actionPayload: 'template_pickup_reminder_driver_v2',
    isActive: true,
    runsCount: 289,
    lastRunAt: 'Today, 08:00 AM',
  },
  {
    id: 'wf-3',
    tenantId: 'tenant-bali-adventures',
    name: 'Live Driver GPS & Location Pin Sharing',
    description: 'Sends real-time Google Maps location pin when guest asks "where is the driver" or "pickup location".',
    triggerType: 'keyword',
    triggerValue: 'driver, pickup, location, where, sopir',
    conditions: ['Active booking exists for today'],
    actionType: 'notify_driver',
    actionPayload: 'send_driver_location_pin',
    isActive: true,
    runsCount: 147,
    lastRunAt: 'Yesterday, 03:15 PM',
  },
  {
    id: 'wf-4',
    tenantId: 'tenant-bali-adventures',
    name: 'Anti-Spam & Opt-Out Automated Handler',
    description: 'Detects STOP or BERHENTI keywords and immediately pauses automated notifications for compliance.',
    triggerType: 'keyword',
    triggerValue: 'stop, berhenti, unsubscribe, cancel',
    conditions: ['Any incoming customer message'],
    actionType: 'assign_tag',
    actionPayload: 'opt_out_compliance_flag',
    isActive: true,
    runsCount: 12,
    lastRunAt: '2 days ago',
  },
];

const INITIAL_WEBHOOK_LOGS: WebhookLog[] = [
  {
    id: 'log-001',
    timestamp: '10:45:12 AM',
    event: 'message.received',
    destination: 'https://api.tripbone.com/v1/integrations/whatsapp/webhook',
    status: 'success',
    httpStatus: 200,
    payload: JSON.stringify({
      event: 'message.received',
      from: '+61 412 345 678',
      text: 'What time will our private driver arrive at Padma Resort?',
      timestamp: 1789123512,
    }),
  },
  {
    id: 'log-002',
    timestamp: '10:42:08 AM',
    event: 'booking.confirmed',
    destination: 'https://api.tripbone.com/v1/integrations/whatsapp/webhook',
    status: 'success',
    httpStatus: 200,
    payload: JSON.stringify({
      event: 'booking.confirmed',
      booking_id: 'TB-89421',
      guest_phone: '+61 412 345 678',
      tour: 'Mount Batur Sunrise Trekking',
      status: 'PAID',
    }),
  },
];

const INITIAL_METRICS: MetricsData = {
  totalMessagesToday: 1420,
  deliveryRate: 99.4,
  avgResponseMinutes: 1.8,
  activeChatsCount: 42,
  inboundToday: 685,
  outboundToday: 735,
  uptimeHours: 342,
};

class Database {
  private cache: DatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;
  private pgPool: pg.Pool | null = null;
  public isPgConnected: boolean = false;
  public lastPgPingMs: number = 0;
  private pgProvider: string = 'Local JSON File';

  constructor() {
    this.cache = this.loadFromDisk();
    this.initPostgres();
  }

  public async initPostgres(): Promise<boolean> {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl || dbUrl.includes('localhost:5432/whatsapp_crm_db')) {
      // Default / unset - use fast in-memory store with local json persistence
      return false;
    }

    try {
      const isSsl = dbUrl.includes('supabase') || dbUrl.includes('neon.tech') || dbUrl.includes('sslmode=require');
      this.pgPool = new Pool({
        connectionString: dbUrl,
        ssl: isSsl ? { rejectUnauthorized: false } : undefined,
        connectionTimeoutMillis: 5000,
      });

      const start = Date.now();
      const res = await this.pgPool.query('SELECT NOW() as now, version() as ver');
      this.lastPgPingMs = Date.now() - start;
      this.isPgConnected = true;

      if (dbUrl.includes('supabase')) {
        this.pgProvider = 'Supabase PostgreSQL';
      } else if (dbUrl.includes('neon.tech')) {
        this.pgProvider = 'Neon Serverless Postgres';
      } else {
        this.pgProvider = 'PostgreSQL Cloud/VPS';
      }

      console.log(`[DB] Connected to ${this.pgProvider} in ${this.lastPgPingMs}ms`);

      // Initialize Tables if not present
      await this.pgPool.query(`
        CREATE TABLE IF NOT EXISTS tenants (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          business_type VARCHAR(255),
          plan VARCHAR(50) DEFAULT 'Pro',
          api_key VARCHAR(128) UNIQUE NOT NULL,
          webhook_secret VARCHAR(128),
          strict_signature_verification BOOLEAN DEFAULT false,
          data JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS conversations (
          id VARCHAR(64) PRIMARY KEY,
          tenant_id VARCHAR(64) REFERENCES tenants(id) ON DELETE CASCADE,
          customer_name VARCHAR(255),
          phone_number VARCHAR(64) NOT NULL,
          last_message TEXT,
          last_message_timestamp VARCHAR(64),
          unread_count INT DEFAULT 0,
          status VARCHAR(32) DEFAULT 'open',
          data JSONB,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS messages (
          id VARCHAR(64) PRIMARY KEY,
          conversation_id VARCHAR(64) REFERENCES conversations(id) ON DELETE CASCADE,
          sender VARCHAR(32) NOT NULL,
          text TEXT NOT NULL,
          timestamp VARCHAR(64) NOT NULL,
          status VARCHAR(32) DEFAULT 'sent',
          is_automated BOOLEAN DEFAULT false,
          data JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS workflow_rules (
          id VARCHAR(64) PRIMARY KEY,
          tenant_id VARCHAR(64) REFERENCES tenants(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          trigger_type VARCHAR(64) NOT NULL,
          trigger_value VARCHAR(255),
          action_type VARCHAR(64) NOT NULL,
          action_payload TEXT,
          is_active BOOLEAN DEFAULT true,
          data JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      return true;
    } catch (err: any) {
      this.isPgConnected = false;
      this.pgProvider = 'Local JSON (PostgreSQL Connection Standby)';
      console.warn('[DB] PostgreSQL init skipped or offline, using reliable local store:', err.message);
      return false;
    }
  }

  public async testConnection(connectionString: string): Promise<{ success: boolean; latencyMs: number; provider: string; error?: string }> {
    const start = Date.now();
    let tempPool: pg.Pool | null = null;
    try {
      const isSsl = connectionString.includes('supabase') || connectionString.includes('neon.tech') || connectionString.includes('sslmode=require');
      tempPool = new Pool({
        connectionString,
        ssl: isSsl ? { rejectUnauthorized: false } : undefined,
        connectionTimeoutMillis: 4000,
      });

      const res = await tempPool.query('SELECT NOW() as now, version() as ver');
      const latencyMs = Date.now() - start;

      let provider = 'PostgreSQL';
      if (connectionString.includes('supabase')) provider = 'Supabase';
      else if (connectionString.includes('neon.tech')) provider = 'Neon';
      else if (connectionString.includes('localhost') || connectionString.includes('127.0.0.1')) provider = 'Localhost VPS';

      await tempPool.end();
      return { success: true, latencyMs, provider };
    } catch (err: any) {
      if (tempPool) {
        try { await tempPool.end(); } catch {}
      }
      return { success: false, latencyMs: Date.now() - start, provider: 'Unknown', error: err.message };
    }
  }

  public getStatus() {
    return {
      mode: this.isPgConnected ? 'postgresql' : 'local_json',
      connected: this.isPgConnected,
      latencyMs: this.lastPgPingMs,
      provider: this.pgProvider,
      databaseUrlConfigured: Boolean(process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost:5432/whatsapp_crm_db')),
      counts: {
        tenants: this.cache.tenants.length,
        conversations: this.cache.conversations.length,
        messages: this.cache.messages.length,
        workflows: this.cache.workflows.length,
      },
    };
  }

  private loadFromDisk(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(content);
        const tenants: Tenant[] = (parsed.tenants || INITIAL_TENANTS).map((t: Tenant) => {
          if (t.whatsappAccount?.phoneNumber?.includes('812-3456-7890') || t.whatsappAccount?.phoneNumber?.includes('819-8765-4321')) {
            return { ...t, whatsappAccount: { status: 'disconnected' } };
          }
          return t;
        });
        return {
          version: 1,
          tenants,
          conversations: parsed.conversations || INITIAL_CONVERSATIONS,
          messages: parsed.messages || INITIAL_MESSAGES,
          workflows: parsed.workflows || INITIAL_WORKFLOWS,
          webhookLogs: parsed.webhookLogs || INITIAL_WEBHOOK_LOGS,
          dispatchJobs: parsed.dispatchJobs || [],
          drivers: parsed.drivers || INITIAL_DRIVERS,
          metrics: parsed.metrics || INITIAL_METRICS,
        };
      }
    } catch (err) {
      console.warn('[DB] Could not read existing store.json, creating initial store', err);
    }

    const initialData: DatabaseSchema = {
      version: 1,
      tenants: INITIAL_TENANTS,
      conversations: INITIAL_CONVERSATIONS,
      messages: INITIAL_MESSAGES,
      workflows: INITIAL_WORKFLOWS,
      webhookLogs: INITIAL_WEBHOOK_LOGS,
      dispatchJobs: [],
      drivers: INITIAL_DRIVERS,
      metrics: INITIAL_METRICS,
    };

    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    } catch (writeErr) {
      console.error('[DB] Failed to initialize store.json', writeErr);
    }

    return initialData;
  }

  private scheduleSave() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.flushToDisk();
    }, 500);
  }

  public flushToDisk() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.cache, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('[DB] Error writing store.json', err);
    }
  }

  // Tenants
  public getTenants(): Tenant[] {
    return this.cache.tenants;
  }

  public getTenant(id: string): Tenant | undefined {
    return this.cache.tenants.find((t) => t.id === id);
  }

  public getTenantByApiKey(apiKey: string): Tenant | undefined {
    return this.cache.tenants.find((t) => t.apiKey === apiKey);
  }

  public addTenant(tenant: Tenant): Tenant {
    this.cache.tenants.push(tenant);
    this.scheduleSave();
    return tenant;
  }

  public updateTenant(id: string, patch: Partial<Tenant>): Tenant | undefined {
    const idx = this.cache.tenants.findIndex((t) => t.id === id);
    if (idx === -1) return undefined;
    this.cache.tenants[idx] = { ...this.cache.tenants[idx], ...patch };
    this.scheduleSave();
    return this.cache.tenants[idx];
  }

  // Conversations
  public getConversations(tenantId?: string): Conversation[] {
    if (tenantId) {
      return this.cache.conversations.filter((c) => c.tenantId === tenantId);
    }
    return this.cache.conversations;
  }

  public getConversation(id: string): Conversation | undefined {
    return this.cache.conversations.find((c) => c.id === id);
  }

  public getConversationByPhone(phoneNumber: string, tenantId?: string): Conversation | undefined {
    const clean = phoneNumber.replace(/[^0-9]/g, '');
    return this.cache.conversations.find((c) => {
      const convClean = c.phoneNumber.replace(/[^0-9]/g, '');
      const phoneMatches = convClean === clean || convClean.endsWith(clean) || clean.endsWith(convClean);
      return phoneMatches && (!tenantId || c.tenantId === tenantId);
    });
  }

  public addConversation(conv: Conversation): Conversation {
    this.cache.conversations.unshift(conv);
    this.scheduleSave();
    return conv;
  }

  public updateConversation(id: string, patch: Partial<Conversation>): Conversation | undefined {
    const idx = this.cache.conversations.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    this.cache.conversations[idx] = { ...this.cache.conversations[idx], ...patch };
    this.scheduleSave();
    return this.cache.conversations[idx];
  }

  // Messages
  public getMessages(conversationId: string): Message[] {
    return this.cache.messages.filter((m) => m.conversationId === conversationId);
  }

  public addMessage(msg: Message): Message {
    this.cache.messages.push(msg);
    this.scheduleSave();
    return msg;
  }

  // Webhook Logs
  public getWebhookLogs(): WebhookLog[] {
    return this.cache.webhookLogs;
  }

  public addWebhookLog(log: WebhookLog): WebhookLog {
    this.cache.webhookLogs.unshift(log);
    // Keep max 100 logs in storage
    if (this.cache.webhookLogs.length > 100) {
      this.cache.webhookLogs = this.cache.webhookLogs.slice(0, 100);
    }
    this.scheduleSave();
    return log;
  }

  // Workflows
  public getWorkflows(tenantId?: string): WorkflowRule[] {
    if (tenantId) {
      return this.cache.workflows.filter((w) => w.tenantId === tenantId);
    }
    return this.cache.workflows;
  }

  public addWorkflow(wf: WorkflowRule): WorkflowRule {
    this.cache.workflows.unshift(wf);
    this.scheduleSave();
    return wf;
  }

  public updateWorkflow(id: string, patch: Partial<WorkflowRule>): WorkflowRule | undefined {
    const idx = this.cache.workflows.findIndex((w) => w.id === id);
    if (idx === -1) return undefined;
    this.cache.workflows[idx] = { ...this.cache.workflows[idx], ...patch };
    this.scheduleSave();
    return this.cache.workflows[idx];
  }

  // Dispatch Queue Jobs
  public getDispatchJobs(): DispatchJob[] {
    return this.cache.dispatchJobs || [];
  }

  public addDispatchJob(job: DispatchJob): DispatchJob {
    if (!this.cache.dispatchJobs) {
      this.cache.dispatchJobs = [];
    }
    this.cache.dispatchJobs.unshift(job);
    if (this.cache.dispatchJobs.length > 50) {
      this.cache.dispatchJobs = this.cache.dispatchJobs.slice(0, 50);
    }
    this.scheduleSave();
    return job;
  }

  public updateDispatchJob(id: string, patch: Partial<DispatchJob>): DispatchJob | undefined {
    if (!this.cache.dispatchJobs) return undefined;
    const idx = this.cache.dispatchJobs.findIndex((j) => j.id === id);
    if (idx === -1) return undefined;
    this.cache.dispatchJobs[idx] = { ...this.cache.dispatchJobs[idx], ...patch };
    this.scheduleSave();
    return this.cache.dispatchJobs[idx];
  }

  // Drivers & Fleet Management
  public getDrivers(): Driver[] {
    return this.cache.drivers || INITIAL_DRIVERS;
  }

  public getDriver(id: string): Driver | undefined {
    return (this.cache.drivers || INITIAL_DRIVERS).find((d) => d.id === id);
  }

  public updateDriver(id: string, patch: Partial<Driver>): Driver | undefined {
    if (!this.cache.drivers) {
      this.cache.drivers = [...INITIAL_DRIVERS];
    }
    const idx = this.cache.drivers.findIndex((d) => d.id === id);
    if (idx === -1) return undefined;
    this.cache.drivers[idx] = { ...this.cache.drivers[idx], ...patch };
    this.scheduleSave();
    return this.cache.drivers[idx];
  }

  // Metrics
  public getMetrics(): MetricsData {
    return this.cache.metrics;
  }

  public incrementMetrics(patch: Partial<MetricsData>) {
    this.cache.metrics = {
      ...this.cache.metrics,
      totalMessagesToday: (this.cache.metrics.totalMessagesToday || 0) + (patch.totalMessagesToday || 0),
      inboundToday: (this.cache.metrics.inboundToday || 0) + (patch.inboundToday || 0),
      outboundToday: (this.cache.metrics.outboundToday || 0) + (patch.outboundToday || 0),
      activeChatsCount: patch.activeChatsCount !== undefined ? patch.activeChatsCount : this.cache.metrics.activeChatsCount,
    };
    this.scheduleSave();
  }
}

export const db = new Database();
