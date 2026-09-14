export type AppMode = 'landing' | 'register' | 'login' | 'member' | 'superadmin';

export type NavigationTab = 
  | 'overview' 
  | 'channels'
  | 'api-explorer'
  | 'number-checker'
  | 'warming'
  | 'webhooks'
  | 'inbox' 
  | 'driver-dispatch'
  | 'qr-link' 
  | 'workflows' 
  | 'api-keys' 
  | 'integrations'
  | 'tripbone' 
  | 'billing'
  | 'production'
  | 'settings'
  | 'database';

export interface WhapiChannel {
  id: string;
  name: string;
  phoneNumber: string;
  formattedJid: string;
  status: 'active' | 'qr_ready' | 'warming' | 'disconnected';
  type: 'business' | 'personal' | 'sandbox';
  apiKey: string;
  webhookUrl: string;
  dailyMessagesSent: number;
  dailyLimit: number;
  warmupDay: number;
  warmupStatus: 'in_progress' | 'graduated' | 'paused';
  batteryLevel?: number;
  isPlugged?: boolean;
  linkedAt: string;
  autoReconnect: boolean;
  simulateTyping: boolean;
}

export interface NumberCheckResult {
  id: string;
  inputNumber: string;
  formattedNumber: string;
  jid: string;
  status: 'valid' | 'invalid' | 'checking';
  isBusiness: boolean;
  businessName?: string;
  pushName?: string;
  statusBio?: string;
  avatarUrl?: string;
  verifiedAt: string;
}

export interface WarmingScheduleDay {
  day: number;
  maxMessages: number;
  typingDelaySec: number;
  dialoguePairs: number;
  description: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

export interface ApiEndpointItem {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  category: 'Messages' | 'Chats' | 'Contacts' | 'Groups' | 'Status' | 'Channel';
  summary: string;
  description: string;
  defaultPayload?: any;
  defaultResponse?: any;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicleModel: string;
  licensePlate: string;
  rating: number;
  totalTrips: number;
  status: 'available' | 'on_trip' | 'off_duty';
  languages: string[];
  photoUrl: string;
}

export interface Tenant {
  id: string;
  name: string;
  businessType: string;
  industry?: string;
  email?: string;
  contactName?: string;
  contactPhone?: string;
  billingCycle?: 'monthly' | 'annual';
  plan: 'Starter' | 'Pro' | 'Enterprise' | string;
  status?: 'active' | 'trial' | 'suspended' | 'expired';
  monthlyQuota?: number;
  messagesUsed?: number;
  channelCount?: number;
  tripboneEnabled?: boolean;
  dedicatedIp?: boolean;
  aiCopilotEnabled?: boolean;
  nextBillingDate?: string;
  apiKey: string;
  webhookSecret?: string;
  strictSignatureVerification?: boolean;
  createdAt: string;
  whatsappAccount: WhatsAppAccount;
}

export interface PricingPlan {
  id: string;
  name: string;
  badge?: string;
  priceMonthly: number;
  priceAnnual: number;
  description: string;
  popular?: boolean;
  status?: 'active' | 'legacy' | 'archived';
  channelLimit?: number;
  monthlyQuotaNumber?: number;
  rateLimitRps?: number;
  retentionDays?: number;
  subscribersCount?: number;
  features: string[];
  limits: {
    numbers: string;
    messagesPerMonth: string;
    teamAgents: string;
    tripboneAccess: boolean;
    webhooks: boolean;
  };
}

export interface SaaSInvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface SaaSInvoice {
  id: string;
  invoiceNumber: string;
  tenantId: string;
  tenantName: string;
  customerEmail: string;
  planName: string;
  billingPeriod: string;
  amount: number;
  tax: number;
  total: number;
  status: 'paid' | 'pending' | 'overdue' | 'refunded' | 'draft';
  issueDate: string;
  dueDate: string;
  paidAt?: string;
  paymentMethod: 'Stripe' | 'Wire Transfer' | 'PayPal' | 'Crypto USDT' | 'Midtrans';
  transactionRef?: string;
  items: SaaSInvoiceItem[];
  notes?: string;
}

export interface SaaSUser {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'billing_admin' | 'support_agent' | 'tenant_owner' | 'tenant_operator';
  tenantId?: string;
  tenantName?: string;
  avatarUrl: string;
  status: 'active' | 'invited' | 'suspended';
  twoFactorEnabled: boolean;
  lastLoginAt: string;
  createdAt: string;
  phone?: string;
}

export interface ClusterNode {
  id: string;
  name: string;
  region: string;
  ip: string;
  status: 'healthy' | 'warning' | 'offline';
  cpuPercent: number;
  ramPercent: number;
  activeSockets: number;
  queuedMessages: number;
  uptime: string;
  latencyMs: number;
}

export interface AdminAuditLog {
  id: string;
  adminName?: string;
  adminEmail: string;
  action: string;
  target?: string;
  details: string | Record<string, any>;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical';
  ipAddress: string;
}

export interface SystemAnnouncement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'critical' | 'urgent';
  isActive: boolean;
  active?: boolean;
  targetAudience: 'all' | 'trial' | 'enterprise';
  updatedAt?: string;
  createdAt?: string;
  createdBy?: string;
  linkText?: string;
  linkUrl?: string;
}

export interface SuperAdminStats {
  totalTenants: number;
  activeSockets: number;
  mrr: number;
  totalMessagesMonthly: number;
  averageUptime: number;
  serverLoad: string;
}

export interface WhatsAppAccount {
  status: 'disconnected' | 'connecting' | 'connected';
  phoneNumber?: string;
  pushName?: string;
  profilePic?: string;
  batteryLevel?: number;
  isPlugged?: boolean;
  linkedAt?: string;
  platform?: string;
}

export interface TripboneBookingContext {
  bookingId: string;
  tourName: string;
  tourDate: string;
  pickupTime: string;
  pickupLocation: string;
  pax: number;
  totalAmount: string;
  paymentStatus: 'Paid' | 'Deposit Pending' | 'Pay on Arrival';
  assignedDriver?: string;
  notes?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: 'customer' | 'business' | 'system';
  senderName?: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  mediaUrl?: string;
  mediaType?: 'image' | 'document' | 'audio';
  mediaCaption?: string;
  fileName?: string;
  location?: {
    latitude: number;
    longitude: number;
    title: string;
    address?: string;
  };
  isAutomated?: boolean;
}

export interface OutboundMessagePayload {
  to: string;
  text?: string;
  templateName?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'document' | 'audio';
  mediaCaption?: string;
  fileName?: string;
  location?: {
    latitude: number;
    longitude: number;
    title: string;
    address?: string;
  };
  bookingId?: string;
}

export interface Conversation {
  id: string;
  tenantId: string;
  customerName: string;
  phoneNumber: string;
  avatarUrl: string;
  lastMessage: string;
  lastMessageTimestamp: string;
  unreadCount: number;
  status: 'open' | 'resolved' | 'snoozed';
  tags: string[];
  assignedAgent: string;
  isOptedOut?: boolean;
  tripboneBooking?: TripboneBookingContext;
}

export interface WorkflowRule {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  triggerType: 'keyword' | 'tripbone_booking_created' | 'tour_reminder_24h' | 'first_message' | 'offline_hours';
  triggerValue: string;
  conditions: string[];
  actionType: 'send_template' | 'assign_tag' | 'notify_driver' | 'sync_tripbone' | 'route_agent';
  actionPayload: string;
  isActive: boolean;
  runsCount: number;
  lastRunAt?: string;
}

export interface WebhookLog {
  id: string;
  timestamp: string;
  event: string;
  destination: string;
  status: 'success' | 'failed' | 'retrying';
  httpStatus: number;
  payload: string;
}

export interface MetricsData {
  totalMessagesToday: number;
  deliveryRate: number;
  avgResponseMinutes: number;
  activeChatsCount: number;
  inboundToday: number;
  outboundToday: number;
  uptimeHours: number;
}

export interface DispatchJob {
  id: string;
  tenantId: string;
  recipient: string;
  type: 'text' | 'media' | 'location' | 'voucher';
  summary: string;
  status: 'queued' | 'processing' | 'delivered' | 'failed';
  enqueuedAt: string;
  deliveredAt?: string;
  delayMs?: number;
  jitterMs?: number;
}
