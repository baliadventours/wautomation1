import { 
  Tenant, 
  Conversation, 
  WorkflowRule, 
  WebhookLog, 
  MetricsData, 
  PricingPlan, 
  SuperAdminStats,
  WhapiChannel,
  NumberCheckResult,
  WarmingScheduleDay,
  ApiEndpointItem,
  SaaSInvoice,
  SaaSUser,
  ClusterNode,
  AdminAuditLog,
  SystemAnnouncement
} from '../types';

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'Starter',
    name: 'Starter Gateway',
    priceMonthly: 39,
    priceAnnual: 29,
    status: 'active',
    channelLimit: 1,
    monthlyQuotaNumber: 5000,
    rateLimitRps: 10,
    retentionDays: 14,
    subscribersCount: 42,
    description: 'Perfect for small local businesses & single-brand merchants starting on WhatsApp.',
    features: [
      '1 Connected WhatsApp Number',
      '5,000 Messages / month',
      'Shared Multi-Agent Team Inbox (3 seats)',
      'Basic Keyword Auto-Responders',
      'QR Code Web Link & UTM Generator',
      'Standard REST API & Webhooks',
      'Anti-Ban Message Pacing',
      'Email Support (24h response)',
    ],
    limits: {
      numbers: '1 Device',
      messagesPerMonth: '5,000',
      teamAgents: '3 Agents',
      tripboneAccess: false,
      webhooks: true,
    },
  },
  {
    id: 'Pro',
    name: 'Business Pro',
    popular: true,
    badge: 'Most Popular',
    priceMonthly: 89,
    priceAnnual: 69,
    status: 'active',
    channelLimit: 3,
    monthlyQuotaNumber: 25000,
    rateLimitRps: 30,
    retentionDays: 45,
    subscribersCount: 88,
    description: 'For growing e-commerce stores, hospitality, and tour operators needing advanced integrations.',
    features: [
      'Up to 3 Connected WhatsApp Numbers',
      '25,000 Messages / month',
      'Shared Multi-Agent Team Inbox (10 seats)',
      'Full Workflow Engine & Chatbot Simulator',
      'Dedicated Tripbone Tour Integration Connector',
      'Driver & Hotel Pickup Dispatch System',
      'Automated TripAdvisor & Google Review Booster',
      'Daily Tour Manifest & CSV Export',
      'Smart Anti-Ban Queue with Jitter',
      'Priority WhatsApp & Live Chat Support',
    ],
    limits: {
      numbers: '3 Devices',
      messagesPerMonth: '25,000',
      teamAgents: '10 Agents',
      tripboneAccess: true,
      webhooks: true,
    },
  },
  {
    id: 'Enterprise',
    name: 'Enterprise Scale',
    badge: 'High Volume',
    priceMonthly: 219,
    priceAnnual: 179,
    status: 'active',
    channelLimit: 15,
    monthlyQuotaNumber: 100000,
    rateLimitRps: 100,
    retentionDays: 180,
    subscribersCount: 18,
    description: 'Dedicated clusters, high-frequency broadcast campaigns, and custom webhook SLAs.',
    features: [
      'Unlimited WhatsApp Numbers',
      '100,000+ Messages / month',
      'Unlimited Team Agents & Roles',
      'Dedicated Isolated Baileys Socket Cluster',
      'Dedicated Tripbone Full-Stack Synchronization',
      'Custom ERP, Shopify & HubSpot Integrations',
      'Custom Rate-Limit Throttling & Dedicated IP',
      'White-Label Client Portal & Custom Domain',
      '99.9% Uptime SLA Guarantee',
      'Dedicated 24/7 Solutions Engineer',
    ],
    limits: {
      numbers: 'Unlimited',
      messagesPerMonth: '100,000+',
      teamAgents: 'Unlimited',
      tripboneAccess: true,
      webhooks: true,
    },
  },
  {
    id: 'CustomPartner',
    name: 'Agency & Reseller Partner',
    badge: 'Whitelabel',
    priceMonthly: 499,
    priceAnnual: 399,
    status: 'active',
    channelLimit: 50,
    monthlyQuotaNumber: 500000,
    rateLimitRps: 250,
    retentionDays: 365,
    subscribersCount: 5,
    description: 'Multi-organization reseller portal with white-label domains and custom sub-billing.',
    features: [
      '50+ WhatsApp Numbers & Sub-Accounts',
      '500,000 Messages / month',
      'White-label CNAME Domain & Custom SMTP',
      'Reseller Sub-Tenant Billing Engine',
      'Custom Dedicated IP Pool & Proxy Rotation',
      'Direct Private WhatsApp Channel Support',
      'Full Database Read-Replicas Access'
    ],
    limits: {
      numbers: '50+ Devices',
      messagesPerMonth: '500,000',
      teamAgents: 'Unlimited',
      tripboneAccess: true,
      webhooks: true,
    }
  }
];

export const INITIAL_SUPERADMIN_STATS: SuperAdminStats = {
  totalTenants: 148,
  activeSockets: 312,
  mrr: 14820,
  totalMessagesMonthly: 1845000,
  averageUptime: 99.94,
  serverLoad: '18% Cluster Capacity',
};

export const INITIAL_TENANTS: Tenant[] = [
  {
    id: 'tenant-bali-adventours',
    name: 'Bali Adventours & Expeditions',
    businessType: 'Tours & Adventure Travel',
    industry: 'Travel & Tourism',
    email: 'operations@baliadventours.com',
    plan: 'Enterprise',
    status: 'active',
    monthlyQuota: 100000,
    messagesUsed: 23840,
    tripboneEnabled: true,
    apiKey: 'wac_live_79a2b94f_adventours_889a',
    createdAt: '2026-01-15',
    whatsappAccount: {
      status: 'connected',
      phoneNumber: '+62 812-3456-7890',
      pushName: 'Bali Adventours Official Desk',
      profilePic: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=150&auto=format&fit=crop&q=80',
      batteryLevel: 89,
      isPlugged: true,
      linkedAt: '2026-09-10 09:15 WITA',
      platform: 'WhatsApp Multi-Device (Baileys v6.7)',
    },
  },
  {
    id: 'tenant-luxe-couture',
    name: 'Aura Artisan Apparel',
    businessType: 'Direct-To-Consumer Fashion',
    industry: 'E-Commerce & Retail',
    email: 'support@auracouture.com',
    plan: 'Pro',
    status: 'active',
    monthlyQuota: 25000,
    messagesUsed: 11420,
    tripboneEnabled: false,
    apiKey: 'wac_live_8812c9a1_auracouture_2910',
    createdAt: '2026-02-14',
    whatsappAccount: {
      status: 'connected',
      phoneNumber: '+62 811-2233-4455',
      pushName: 'Aura Customer Concierge',
      batteryLevel: 94,
      isPlugged: true,
      linkedAt: '2026-09-11 11:00 WITA',
      platform: 'WhatsApp Multi-Device (Baileys v6.7)',
    },
  },
  {
    id: 'tenant-lombok-surf',
    name: 'Lombok Surf Camp & Transfers',
    businessType: 'Surf School & Shuttle',
    industry: 'Travel & Tourism',
    email: 'info@lomboksufcamp.com',
    plan: 'Pro',
    status: 'trial',
    monthlyQuota: 25000,
    messagesUsed: 3180,
    tripboneEnabled: true,
    apiKey: 'wac_live_3c90e21a_lombsurf_4102',
    createdAt: '2026-03-20',
    whatsappAccount: {
      status: 'disconnected',
    },
  },
  {
    id: 'tenant-dental-care',
    name: 'SmileCraft Dental Studio',
    businessType: 'Dental Clinic & Aesthetics',
    industry: 'Healthcare & Wellness',
    email: 'appointments@smilecraft.id',
    plan: 'Starter',
    status: 'active',
    monthlyQuota: 5000,
    messagesUsed: 1840,
    tripboneEnabled: false,
    apiKey: 'wac_live_12af9091_smilecraft_5512',
    createdAt: '2026-04-05',
    whatsappAccount: {
      status: 'connected',
      phoneNumber: '+62 813-8899-7711',
      pushName: 'SmileCraft Clinic Desk',
      batteryLevel: 62,
      isPlugged: false,
      linkedAt: '2026-09-09 16:45 WITA',
      platform: 'WhatsApp Multi-Device (Baileys v6.7)',
    },
  },
  {
    id: 'tenant-ubud-wellness',
    name: 'Ubud Sanctuary Retreats',
    businessType: 'Wellness & Spa Resort',
    industry: 'Hospitality & Wellness',
    email: 'concierge@ubudsanctuary.com',
    plan: 'Pro',
    status: 'active',
    monthlyQuota: 25000,
    messagesUsed: 8930,
    tripboneEnabled: true,
    apiKey: 'wac_live_55d1a89c_ubudwell_9901',
    createdAt: '2026-05-10',
    whatsappAccount: {
      status: 'connected',
      phoneNumber: '+62 821-9876-5432',
      pushName: 'Ubud Sanctuary Concierge',
      batteryLevel: 74,
      isPlugged: false,
      linkedAt: '2026-09-08 14:20 WITA',
      platform: 'WhatsApp Multi-Device (Baileys v6.7)',
    },
  },
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    tenantId: 'tenant-bali-adventours',
    customerName: 'Marcus Vance',
    phoneNumber: '+61 412 345 678',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    lastMessage: 'Great! What time will our private driver arrive at Padma Resort?',
    lastMessageTimestamp: '10:42 AM',
    unreadCount: 1,
    status: 'open',
    tags: ['#tripbone-booking', '#vip', '#mt-batur'],
    assignedAgent: 'Wayan Putra',
    tripboneBooking: {
      bookingId: 'TB-89412',
      tourName: 'Mount Batur Sunrise Trek & Hot Springs',
      tourDate: 'Tomorrow, 02:30 AM pickup',
      pickupTime: '02:30 AM WITA',
      pickupLocation: 'Padma Resort Legian (Lobby A)',
      pax: 2,
      totalAmount: '$170 USD',
      paymentStatus: 'Paid',
      assignedDriver: 'Pak Made (Toyota Innova DK 1842 AB)',
      notes: 'Vegetarian breakfast requested at summit.',
    },
  },
  {
    id: 'conv-2',
    tenantId: 'tenant-bali-adventours',
    customerName: 'Elena Rostova',
    phoneNumber: '+44 7911 123456',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    lastMessage: 'Is the Nusa Penida speedboat ticket included in this package?',
    lastMessageTimestamp: '09:18 AM',
    unreadCount: 0,
    status: 'open',
    tags: ['#inquiry', '#nusa-penida'],
    assignedAgent: 'Ketut Ayu',
    tripboneBooking: {
      bookingId: 'TB-89455',
      tourName: 'Nusa Penida West Coast Day Trip',
      tourDate: '14 Sep 2026',
      pickupTime: '06:30 AM WITA',
      pickupLocation: 'W Bali Seminyak',
      pax: 3,
      totalAmount: '$240 USD',
      paymentStatus: 'Deposit Pending',
      notes: 'Pending final deposit via Tripbone checkout.',
    },
  },
  {
    id: 'conv-3',
    tenantId: 'tenant-bali-adventours',
    customerName: 'David Chen',
    phoneNumber: '+65 9123 4567',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    lastMessage: 'Thank you for organizing the driver. The tour was incredible!',
    lastMessageTimestamp: 'Yesterday',
    unreadCount: 0,
    status: 'resolved',
    tags: ['#completed-tour', '#review-sent'],
    assignedAgent: 'Wayan Putra',
    tripboneBooking: {
      bookingId: 'TB-88902',
      tourName: 'Uluwatu Sunset, Kecak Dance & Jimbaran Seafood',
      tourDate: 'Yesterday',
      pickupTime: '14:00 WITA',
      pickupLocation: 'AYANA Resort Jimbaran',
      pax: 4,
      totalAmount: '$310 USD',
      paymentStatus: 'Paid',
      assignedDriver: 'Pak Ketut',
    },
  },
  {
    id: 'conv-4',
    tenantId: 'tenant-bali-adventours',
    customerName: 'Sophie Moreau',
    phoneNumber: '+33 6 12 34 56 78',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    lastMessage: 'Hello, can you send the digital itinerary voucher on PDF?',
    lastMessageTimestamp: 'Yesterday',
    unreadCount: 0,
    status: 'open',
    tags: ['#voucher-request'],
    assignedAgent: 'Ketut Ayu',
  },
];

export const INITIAL_WORKFLOWS: WorkflowRule[] = [
  {
    id: 'wf-1',
    tenantId: 'tenant-bali-adventours',
    name: 'Tripbone New Booking ➔ Instant WhatsApp Voucher',
    description: 'When Tripbone registers a confirmed reservation, dispatch instant WhatsApp greeting with digital voucher & driver contact details.',
    triggerType: 'tripbone_booking_created',
    triggerValue: 'event:booking.confirmed',
    conditions: ['Payment status == Paid', 'WhatsApp number is valid'],
    actionType: 'send_template',
    actionPayload: 'template:booking_confirmation_v2 with dynamic booking link',
    isActive: true,
    runsCount: 342,
    lastRunAt: '12 mins ago',
  },
  {
    id: 'wf-2',
    tenantId: 'tenant-bali-adventours',
    name: '24-Hour Pickup Reminder & Hotel Pin Confirmation',
    description: 'Triggers automatically 24 hours prior to tour start time to confirm pickup lobby & provide vehicle license plate.',
    triggerType: 'tour_reminder_24h',
    triggerValue: 'offset:-24h_before_tour',
    conditions: ['Booking status == Confirmed'],
    actionType: 'send_template',
    actionPayload: 'template:pickup_reminder_detailed with driver card',
    isActive: true,
    runsCount: 289,
    lastRunAt: '2 hours ago',
  },
  {
    id: 'wf-3',
    tenantId: 'tenant-bali-adventours',
    name: 'Keyword Auto-Responder: "Pricing" & "Catalog"',
    description: 'Auto-replies to inquiries containing pricing keywords with the seasonal Bali tour catalog and live booking link.',
    triggerType: 'keyword',
    triggerValue: 'price, pricing, catalog, paket tour, berapa',
    conditions: ['Inbound message contains keyword'],
    actionType: 'send_template',
    actionPayload: 'template:catalog_brochure_pdf + Tripbone booking widget',
    isActive: true,
    runsCount: 512,
    lastRunAt: '35 mins ago',
  },
  {
    id: 'wf-4',
    tenantId: 'tenant-bali-adventours',
    name: 'First-time Sender Welcome & CRM Contact Ingestion',
    description: 'When an unknown phone number contacts the WhatsApp line, create lead in CRM and reply with friendly concierge greeting.',
    triggerType: 'first_message',
    triggerValue: 'event:contact.first_contact',
    conditions: ['Contact not present in CRM database'],
    actionType: 'sync_tripbone',
    actionPayload: 'Create Lead in Tripbone CRM + Tag #whatsapp-lead',
    isActive: true,
    runsCount: 194,
    lastRunAt: '4 hours ago',
  },
];

export const INITIAL_WEBHOOK_LOGS: WebhookLog[] = [
  {
    id: 'log-101',
    timestamp: '10:42:15 AM',
    event: 'message.received',
    destination: 'https://api.tripbone.com/v1/integrations/whatsapp/webhook',
    status: 'success',
    httpStatus: 200,
    payload: JSON.stringify({
      event: 'message.received',
      tenant_id: 'tenant-bali-adventours',
      message: {
        from: '+61 412 345 678',
        name: 'Marcus Vance',
        text: 'Great! What time will our private driver arrive at Padma Resort?',
        timestamp: 1726041735,
      },
    }, null, 2),
  },
  {
    id: 'log-102',
    timestamp: '10:30:00 AM',
    event: 'message.delivered',
    destination: 'https://api.tripbone.com/v1/integrations/whatsapp/webhook',
    status: 'success',
    httpStatus: 200,
    payload: JSON.stringify({
      event: 'message.delivered',
      tenant_id: 'tenant-bali-adventours',
      message_id: 'wamid.HBgLMTYyMzg...==',
      recipient: '+61 412 345 678',
    }, null, 2),
  },
  {
    id: 'log-103',
    timestamp: '09:18:22 AM',
    event: 'contact.synced',
    destination: 'https://api.tripbone.com/v1/integrations/whatsapp/webhook',
    status: 'success',
    httpStatus: 200,
    payload: JSON.stringify({
      event: 'contact.synced',
      tenant_id: 'tenant-bali-adventours',
      phone: '+44 7911 123456',
      name: 'Elena Rostova',
      tags: ['#inquiry', '#nusa-penida'],
    }, null, 2),
  },
];

export const INITIAL_METRICS: MetricsData = {
  totalMessagesToday: 1482,
  deliveryRate: 99.2,
  avgResponseMinutes: 1.8,
  activeChatsCount: 24,
  inboundToday: 641,
  outboundToday: 841,
  uptimeHours: 340,
};

export const INITIAL_WHAPI_CHANNELS: WhapiChannel[] = [
  {
    id: 'ch_whapi_8921a',
    name: 'Main Support & Concierge',
    phoneNumber: '+62 812-3456-7890',
    formattedJid: '6281234567890@s.whatsapp.net',
    status: 'active',
    type: 'business',
    apiKey: 'whapi_live_9a87f61b2c4e5d6f0a9b8c7d',
    webhookUrl: 'https://api.yourdomain.com/whapi/events',
    dailyMessagesSent: 841,
    dailyLimit: 2500,
    warmupDay: 14,
    warmupStatus: 'graduated',
    batteryLevel: 94,
    isPlugged: true,
    linkedAt: '2026-08-10 14:20 UTC',
    autoReconnect: true,
    simulateTyping: true,
  },
  {
    id: 'ch_whapi_3471b',
    name: 'Booking & Automated Notifications',
    phoneNumber: '+62 819-8765-4321',
    formattedJid: '6281987654321@s.whatsapp.net',
    status: 'warming',
    type: 'business',
    apiKey: 'whapi_live_3c2e1f4a5b6d7c8e9f0a1b2c',
    webhookUrl: 'https://api.tripbone.com/v1/integrations/whatsapp/webhook',
    dailyMessagesSent: 312,
    dailyLimit: 500,
    warmupDay: 5,
    warmupStatus: 'in_progress',
    batteryLevel: 88,
    isPlugged: false,
    linkedAt: '2026-09-08 09:12 UTC',
    autoReconnect: true,
    simulateTyping: true,
  },
  {
    id: 'ch_whapi_sandbox_01',
    name: 'Free Developer Sandbox',
    phoneNumber: '+1 (415) 555-0199',
    formattedJid: '14155550199@s.whatsapp.net',
    status: 'active',
    type: 'sandbox',
    apiKey: 'whapi_test_sandbox_881923aae1029c',
    webhookUrl: 'https://webhook.site/whapi-test-stream',
    dailyMessagesSent: 18,
    dailyLimit: 150,
    warmupDay: 14,
    warmupStatus: 'graduated',
    batteryLevel: 100,
    isPlugged: true,
    linkedAt: '2026-09-12 11:00 UTC',
    autoReconnect: true,
    simulateTyping: false,
  },
];

export const INITIAL_NUMBER_CHECKS: NumberCheckResult[] = [
  {
    id: 'chk-01',
    inputNumber: '+62 812 3456 7890',
    formattedNumber: '+62 812-3456-7890',
    jid: '6281234567890@s.whatsapp.net',
    status: 'valid',
    isBusiness: true,
    businessName: 'Bali Tour Operator HQ',
    pushName: 'Wayan Bali Ops',
    statusBio: 'Available 24/7 for guest pickups & island excursions 🌴',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    verifiedAt: '10 mins ago',
  },
  {
    id: 'chk-02',
    inputNumber: '+44 7911 123456',
    formattedNumber: '+44 7911 123456',
    jid: '447911123456@s.whatsapp.net',
    status: 'valid',
    isBusiness: false,
    pushName: 'Elena Rostova',
    statusBio: 'Traveling in Southeast Asia ✈️',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    verifiedAt: '25 mins ago',
  },
  {
    id: 'chk-03',
    inputNumber: '+1 415 555 0188',
    formattedNumber: '+1 415 555 0188',
    jid: '14155550188@s.whatsapp.net',
    status: 'valid',
    isBusiness: false,
    pushName: 'Marcus Vance',
    statusBio: 'Battery about to die',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    verifiedAt: '1 hour ago',
  },
  {
    id: 'chk-04',
    inputNumber: '+61 400 000 000',
    formattedNumber: '+61 400 000 000',
    jid: '',
    status: 'invalid',
    isBusiness: false,
    verifiedAt: '2 hours ago',
  },
];

export const INITIAL_WARMING_SCHEDULE: WarmingScheduleDay[] = [
  { day: 1, maxMessages: 20, typingDelaySec: 3.5, dialoguePairs: 5, description: 'Initial handshake with warm seed contacts', isCompleted: true, isCurrent: false },
  { day: 2, maxMessages: 40, typingDelaySec: 3.2, dialoguePairs: 10, description: 'Bi-directional greeting replies & presence simulation', isCompleted: true, isCurrent: false },
  { day: 3, maxMessages: 80, typingDelaySec: 2.8, dialoguePairs: 20, description: 'Simulated media exchange (photos, voice notes)', isCompleted: true, isCurrent: false },
  { day: 4, maxMessages: 150, typingDelaySec: 2.5, dialoguePairs: 35, description: 'Group chat creation and invite link interactions', isCompleted: true, isCurrent: false },
  { day: 5, maxMessages: 300, typingDelaySec: 2.2, dialoguePairs: 50, description: 'Gradual ramp-up with randomized outbound intervals', isCompleted: false, isCurrent: true },
  { day: 6, maxMessages: 500, typingDelaySec: 2.0, dialoguePairs: 75, description: 'Mixed notification broadcast pacing', isCompleted: false, isCurrent: false },
  { day: 7, maxMessages: 800, typingDelaySec: 1.8, dialoguePairs: 100, description: 'Full business template pacing with read receipts', isCompleted: false, isCurrent: false },
  { day: 8, maxMessages: 1200, typingDelaySec: 1.6, dialoguePairs: 140, description: 'High frequency queue test with safe jitter (1-4s)', isCompleted: false, isCurrent: false },
  { day: 9, maxMessages: 1800, typingDelaySec: 1.5, dialoguePairs: 180, description: 'Peak hour load testing simulation', isCompleted: false, isCurrent: false },
  { day: 10, maxMessages: 2500, typingDelaySec: 1.5, dialoguePairs: 220, description: 'Unrestricted enterprise throughput unlocked', isCompleted: false, isCurrent: false },
];

export const WHAPI_API_ENDPOINTS: ApiEndpointItem[] = [
  {
    id: 'post-messages-text',
    name: 'Send Text Message',
    method: 'POST',
    path: '/messages/text',
    category: 'Messages',
    summary: 'Send plain or formatted text to any WhatsApp user or group',
    description: 'Sends a standard text message. Supports WhatsApp markdown formatting (*bold*, _italic_, ~strikethrough~), emoji, mentions (@user), and optional typing indicator delay.',
    defaultPayload: {
      to: '6281234567890@s.whatsapp.net',
      body: 'Hello! Your booking for Nusa Penida Tour is confirmed. Pickup at 06:30 AM.',
      typing_time: 2,
      view_once: false
    },
    defaultResponse: {
      sent: true,
      message_id: 'wamid.HBgLMTYyMzg...==',
      timestamp: 1726214400,
      to: '6281234567890@s.whatsapp.net',
      status: 'pending'
    }
  },
  {
    id: 'post-messages-image',
    name: 'Send Image',
    method: 'POST',
    path: '/messages/image',
    category: 'Messages',
    summary: 'Send photos and graphics with optional caption',
    description: 'Upload an image via public URL or base64 data string. Whapi compresses and delivers the image with native WhatsApp image preview.',
    defaultPayload: {
      to: '6281234567890@s.whatsapp.net',
      media: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
      caption: '🌴 Welcome to Bali! Here is your tour itinerary map for tomorrow.'
    },
    defaultResponse: {
      sent: true,
      message_id: 'wamid.HBgLMTYyNzc...==',
      media_type: 'image',
      status: 'delivered'
    }
  },
  {
    id: 'post-messages-document',
    name: 'Send Document / PDF',
    method: 'POST',
    path: '/messages/document',
    category: 'Messages',
    summary: 'Send PDF vouchers, invoices, tickets or spreadsheets',
    description: 'Delivers files (PDF, DOCX, XLSX, etc.) with custom file name and caption.',
    defaultPayload: {
      to: '6281234567890@s.whatsapp.net',
      media: 'https://tripbone.com/vouchers/TB-88421.pdf',
      filename: 'Tripbone-Tour-Voucher-TB88421.pdf',
      caption: 'Official E-Ticket & Receipt for Bali Adventours'
    },
    defaultResponse: {
      sent: true,
      message_id: 'wamid.HBgLMTYyOTA...==',
      filename: 'Tripbone-Tour-Voucher-TB88421.pdf',
      status: 'sent'
    }
  },
  {
    id: 'post-messages-location',
    name: 'Send Geo Location',
    method: 'POST',
    path: '/messages/location',
    category: 'Messages',
    summary: 'Send GPS coordinates and venue address cards',
    description: 'Sends an interactive location card that opens directly in Google Maps or Apple Maps with directions.',
    defaultPayload: {
      to: '6281234567890@s.whatsapp.net',
      latitude: -8.6500,
      longitude: 115.2167,
      name: 'Sanur Harbor Pier 4 - Bali Fastboat',
      address: 'Jalan Hang Tuah No. 45, Sanur Kaja, Denpasar Selatan'
    },
    defaultResponse: {
      sent: true,
      message_id: 'wamid.HBgLMTYyOTk...==',
      latitude: -8.6500,
      longitude: 115.2167,
      status: 'sent'
    }
  },
  {
    id: 'post-messages-interactive',
    name: 'Send Interactive Buttons',
    method: 'POST',
    path: '/messages/interactive',
    category: 'Messages',
    summary: 'Send quick-reply buttons and clickable menu lists',
    description: 'Renders interactive native action buttons that trigger instant webhook callbacks when clicked by the user.',
    defaultPayload: {
      to: '6281234567890@s.whatsapp.net',
      body: 'Would you like to confirm your hotel pickup for tomorrow morning?',
      buttons: [
        { id: 'btn_confirm', title: '✅ Confirm Pickup' },
        { id: 'btn_change_time', title: '🕒 Change Time' },
        { id: 'btn_call_driver', title: '📞 Driver Contact' }
      ]
    },
    defaultResponse: {
      sent: true,
      message_id: 'wamid.HBgLMTYyMTA...==',
      type: 'interactive_button',
      status: 'sent'
    }
  },
  {
    id: 'post-contacts-check',
    name: 'Check Phone Number (Validator)',
    method: 'POST',
    path: '/contacts/check',
    category: 'Contacts',
    summary: 'Verify if a phone number is registered on WhatsApp',
    description: 'Whapi instant number validator. Returns registration status, account type (Personal vs Business), verified name, and profile bio.',
    defaultPayload: {
      blocking: 'wait',
      force_check: true,
      contacts: ['+6281234567890', '+447911123456', '+14155550188']
    },
    defaultResponse: {
      contacts: [
        {
          input: '+6281234567890',
          status: 'valid',
          wa_id: '6281234567890',
          type: 'business',
          business_name: 'Bali Tour Operator HQ'
        },
        {
          input: '+447911123456',
          status: 'valid',
          wa_id: '447911123456',
          type: 'personal',
          name: 'Elena Rostova'
        },
        {
          input: '+14155550188',
          status: 'valid',
          wa_id: '14155550188',
          type: 'personal',
          name: 'Marcus Vance'
        }
      ]
    }
  },
  {
    id: 'get-chats',
    name: 'List Active Chats',
    method: 'GET',
    path: '/chats',
    category: 'Chats',
    summary: 'Retrieve all conversations with pagination',
    description: 'Returns all recent active chats, unread counters, pin status, and last message timestamp.',
    defaultPayload: null,
    defaultResponse: {
      count: 24,
      chats: [
        { id: '6281234567890@s.whatsapp.net', name: 'Wayan Bali Ops', unread_count: 0, last_message_time: 1726214100 },
        { id: '447911123456@s.whatsapp.net', name: 'Elena Rostova', unread_count: 2, last_message_time: 1726214250 }
      ]
    }
  },
  {
    id: 'post-groups-create',
    name: 'Create WhatsApp Group',
    method: 'POST',
    path: '/groups/create',
    category: 'Groups',
    summary: 'Programmatically create group and invite members',
    description: 'Creates a group with custom subject title, description, and invite link generation.',
    defaultPayload: {
      subject: 'Nusa Penida Tour - Group 14 Sept',
      participants: ['6281234567890@s.whatsapp.net', '447911123456@s.whatsapp.net']
    },
    defaultResponse: {
      group_id: '120363024829104820@g.us',
      invite_code: 'D9a87f61B2c4',
      invite_link: 'https://chat.whatsapp.com/D9a87f61B2c4',
      participants_count: 2
    }
  },
  {
    id: 'post-status-text',
    name: 'Post Status / Story',
    method: 'POST',
    path: '/status/text',
    category: 'Status',
    summary: 'Publish text story to WhatsApp Status for 24h',
    description: 'Broadcasts a status story to your contact list with custom background color and font styling.',
    defaultPayload: {
      body: '🌊 Flash Promo: 20% OFF Mount Batur Sunrise Trek this weekend! DM us to book.',
      background_color: '#075e54',
      font: 1
    },
    defaultResponse: {
      sent: true,
      status_id: 'status_post_992144',
      expires_at: 1726300800
    }
  },
  {
    id: 'get-health',
    name: 'Channel Health & Status',
    method: 'GET',
    path: '/health',
    category: 'Channel',
    summary: 'Check WhatsApp Baileys multi-device socket status',
    description: 'Returns real-time gateway metrics, battery percentage, phone charging status, and ping latency.',
    defaultPayload: null,
    defaultResponse: {
      status: 'connected',
      channel_id: 'ch_whapi_8921a',
      phone: '+62 812-3456-7890',
      battery: 94,
      plugged: true,
      uptime_seconds: 122400,
      version: '2.3000.1018'
    }
  }
];

export const INITIAL_INVOICES: SaaSInvoice[] = [
  {
    id: 'inv-1001',
    invoiceNumber: 'INV-2026-0091',
    tenantId: 'tenant-bali-adventours',
    tenantName: 'Bali Adventours & Expeditions',
    customerEmail: 'billing@baliadventours.com',
    planName: 'Enterprise Scale (Annual)',
    billingPeriod: 'Jan 15, 2026 – Jan 14, 2027',
    amount: 2148,
    tax: 214.8,
    total: 2362.8,
    status: 'paid',
    issueDate: '2026-01-15',
    dueDate: '2026-01-29',
    paidAt: '2026-01-16 10:24 WITA',
    paymentMethod: 'Stripe',
    transactionRef: 'ch_3N8bY62eZvKYlo2C1g9024kx',
    items: [
      { id: 'it-1', description: 'Enterprise WhatsApp Scale Plan (Annual prepaid 12mo)', quantity: 1, unitPrice: 2148, total: 2148 },
      { id: 'it-2', description: 'Dedicated Isolated Baileys Socket Cluster', quantity: 1, unitPrice: 0, total: 0 }
    ],
    notes: 'Payment settled via corporate Visa card. Includes 99.9% uptime SLA.'
  },
  {
    id: 'inv-1002',
    invoiceNumber: 'INV-2026-0142',
    tenantId: 'tenant-luxe-couture',
    tenantName: 'Aura Artisan Apparel',
    customerEmail: 'finance@auracouture.com',
    planName: 'Business Pro (Monthly)',
    billingPeriod: 'Sep 01, 2026 – Sep 30, 2026',
    amount: 89,
    tax: 8.9,
    total: 97.9,
    status: 'paid',
    issueDate: '2026-09-01',
    dueDate: '2026-09-15',
    paidAt: '2026-09-02 08:11 WITA',
    paymentMethod: 'Stripe',
    transactionRef: 'pi_3Mo9A12eZvKYlo1A0887121b',
    items: [
      { id: 'it-1', description: 'Business Pro Plan - Monthly subscription', quantity: 1, unitPrice: 89, total: 89 }
    ]
  },
  {
    id: 'inv-1003',
    invoiceNumber: 'INV-2026-0158',
    tenantId: 'tenant-ubud-wellness',
    tenantName: 'Ubud Sanctuary Retreats',
    customerEmail: 'accounts@ubudsanctuary.com',
    planName: 'Business Pro (Monthly)',
    billingPeriod: 'Sep 10, 2026 – Oct 09, 2026',
    amount: 119,
    tax: 11.9,
    total: 130.9,
    status: 'paid',
    issueDate: '2026-09-10',
    dueDate: '2026-09-24',
    paidAt: '2026-09-10 14:30 WITA',
    paymentMethod: 'Midtrans',
    transactionRef: 'MTRX-882910-BCA-VA',
    items: [
      { id: 'it-1', description: 'Business Pro Plan Monthly', quantity: 1, unitPrice: 89, total: 89 },
      { id: 'it-2', description: 'Tripbone Concierge & Tour Pickup Add-on', quantity: 1, unitPrice: 30, total: 30 }
    ]
  },
  {
    id: 'inv-1004',
    invoiceNumber: 'INV-2026-0172',
    tenantId: 'tenant-dental-care',
    tenantName: 'SmileCraft Dental Studio',
    customerEmail: 'clinic@smilecraft.id',
    planName: 'Starter Gateway (Monthly)',
    billingPeriod: 'Sep 05, 2026 – Oct 04, 2026',
    amount: 39,
    tax: 3.9,
    total: 42.9,
    status: 'overdue',
    issueDate: '2026-09-05',
    dueDate: '2026-09-12',
    paymentMethod: 'Stripe',
    items: [
      { id: 'it-1', description: 'Starter Gateway Monthly Plan', quantity: 1, unitPrice: 39, total: 39 }
    ],
    notes: 'First dunning email sent on Sep 12. Card payment retry scheduled.'
  },
  {
    id: 'inv-1005',
    invoiceNumber: 'INV-2026-0180',
    tenantId: 'tenant-lombok-surf',
    tenantName: 'Lombok Surf Camp & Transfers',
    customerEmail: 'billing@lomboksufcamp.com',
    planName: 'Business Pro (Monthly Trial Conversion)',
    billingPeriod: 'Sep 15, 2026 – Oct 14, 2026',
    amount: 89,
    tax: 8.9,
    total: 97.9,
    status: 'pending',
    issueDate: '2026-09-12',
    dueDate: '2026-09-19',
    paymentMethod: 'PayPal',
    items: [
      { id: 'it-1', description: 'Business Pro Subscription (Post 14-day trial)', quantity: 1, unitPrice: 89, total: 89 }
    ]
  },
  {
    id: 'inv-1006',
    invoiceNumber: 'INV-2026-0045',
    tenantId: 'tenant-legacy-agency',
    tenantName: 'Nusantara Creative Media',
    customerEmail: 'finance@nusantaracreative.co.id',
    planName: 'Starter Gateway (Monthly)',
    billingPeriod: 'Aug 01, 2026 – Aug 31, 2026',
    amount: 39,
    tax: 3.9,
    total: 42.9,
    status: 'refunded',
    issueDate: '2026-08-01',
    dueDate: '2026-08-15',
    paidAt: '2026-08-01 11:15 WITA',
    paymentMethod: 'Wire Transfer',
    transactionRef: 'REF-TX-991204',
    items: [
      { id: 'it-1', description: 'Starter Gateway Plan - Refunded per customer request', quantity: 1, unitPrice: 39, total: 39 }
    ],
    notes: 'Account merged into parent agency account. Full refund issued.'
  }
];

export const INITIAL_SAAS_USERS: SaaSUser[] = [
  {
    id: 'usr-001',
    name: 'Alexander Wright',
    email: 'alex.wright@whatscrm.cloud',
    role: 'superadmin',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    status: 'active',
    twoFactorEnabled: true,
    lastLoginAt: '2026-09-13 07:48 UTC',
    createdAt: '2025-11-01',
    phone: '+1 (415) 890-2199'
  },
  {
    id: 'usr-002',
    name: 'Sarah Chen, CPA',
    email: 'sarah.chen@whatscrm.cloud',
    role: 'billing_admin',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    status: 'active',
    twoFactorEnabled: true,
    lastLoginAt: '2026-09-12 18:22 UTC',
    createdAt: '2025-12-15',
    phone: '+1 (212) 555-0182'
  },
  {
    id: 'usr-003',
    name: 'Dwi Pratama',
    email: 'dwi.support@whatscrm.cloud',
    role: 'support_agent',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    status: 'active',
    twoFactorEnabled: true,
    lastLoginAt: '2026-09-13 06:10 UTC',
    createdAt: '2026-02-01',
    phone: '+62 812-8877-6655'
  },
  {
    id: 'usr-004',
    name: 'Wayan Sudarma (Owner)',
    email: 'operations@baliadventours.com',
    role: 'tenant_owner',
    tenantId: 'tenant-bali-adventours',
    tenantName: 'Bali Adventours & Expeditions',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    status: 'active',
    twoFactorEnabled: true,
    lastLoginAt: '2026-09-13 08:01 WITA',
    createdAt: '2026-01-15',
    phone: '+62 812-3456-7890'
  },
  {
    id: 'usr-005',
    name: 'Elena Rostova',
    email: 'support@auracouture.com',
    role: 'tenant_owner',
    tenantId: 'tenant-luxe-couture',
    tenantName: 'Aura Artisan Apparel',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    status: 'active',
    twoFactorEnabled: false,
    lastLoginAt: '2026-09-11 15:40 WITA',
    createdAt: '2026-02-14',
    phone: '+62 811-2233-4455'
  },
  {
    id: 'usr-006',
    name: 'Kadek Mahendra',
    email: 'concierge@ubudsanctuary.com',
    role: 'tenant_operator',
    tenantId: 'tenant-ubud-wellness',
    tenantName: 'Ubud Sanctuary Retreats',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
    status: 'active',
    twoFactorEnabled: false,
    lastLoginAt: '2026-09-10 12:05 WITA',
    createdAt: '2026-05-10',
    phone: '+62 821-9876-5432'
  },
  {
    id: 'usr-007',
    name: 'Marcus Vance',
    email: 'marcus.v@cloudscale.io',
    role: 'tenant_owner',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    status: 'invited',
    twoFactorEnabled: false,
    lastLoginAt: 'Never (Invite sent)',
    createdAt: '2026-09-12',
    phone: '+44 20 7946 0912'
  }
];

export const INITIAL_CLUSTER_NODES: ClusterNode[] = [
  {
    id: 'node-us-east-1',
    name: 'Baileys-Cluster-US-East-01',
    region: 'us-east-1 (N. Virginia)',
    ip: '198.51.100.42',
    status: 'healthy',
    cpuPercent: 24,
    ramPercent: 48,
    activeSockets: 142,
    queuedMessages: 18,
    uptime: '42 days, 18 hours',
    latencyMs: 38
  },
  {
    id: 'node-eu-central-1',
    name: 'Baileys-Cluster-EU-Frankfurt-02',
    region: 'eu-central-1 (Frankfurt)',
    ip: '198.51.100.89',
    status: 'healthy',
    cpuPercent: 31,
    ramPercent: 55,
    activeSockets: 98,
    queuedMessages: 12,
    uptime: '29 days, 04 hours',
    latencyMs: 44
  },
  {
    id: 'node-ap-southeast-1',
    name: 'Baileys-Cluster-AP-Singapore-03',
    region: 'ap-southeast-1 (Singapore)',
    ip: '203.0.113.15',
    status: 'healthy',
    cpuPercent: 42,
    ramPercent: 64,
    activeSockets: 172,
    queuedMessages: 26,
    uptime: '61 days, 11 hours',
    latencyMs: 19
  }
];

export const INITIAL_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: 'aud-991',
    adminName: 'Alexander Wright',
    adminEmail: 'alex.wright@whatscrm.cloud',
    action: 'TENANT_QUOTA_ADJUSTED',
    target: 'Bali Adventours & Expeditions',
    details: 'Increased monthly quota from 50,000 to 100,000 for peak tourist season high-volume dispatch.',
    timestamp: '2026-09-13 07:15 UTC',
    severity: 'info',
    ipAddress: '108.162.215.18'
  },
  {
    id: 'aud-992',
    adminName: 'Sarah Chen, CPA',
    adminEmail: 'sarah.chen@whatscrm.cloud',
    action: 'INVOICE_GENERATED',
    target: 'INV-2026-0180 (Lombok Surf Camp)',
    details: 'Generated monthly recurring invoice $97.90 following 14-day trial expiry.',
    timestamp: '2026-09-12 16:40 UTC',
    severity: 'info',
    ipAddress: '72.229.28.185'
  },
  {
    id: 'aud-993',
    adminName: 'Alexander Wright',
    adminEmail: 'alex.wright@whatscrm.cloud',
    action: 'GLOBAL_PACING_THROTTLED',
    target: 'Anti-Ban Engine Config',
    details: 'Set global Baileys outbound pacing jitter threshold to 3.2s following Meta spam wave advisory.',
    timestamp: '2026-09-11 09:20 UTC',
    severity: 'warning',
    ipAddress: '108.162.215.18'
  },
  {
    id: 'aud-994',
    adminName: 'Dwi Pratama',
    adminEmail: 'dwi.support@whatscrm.cloud',
    action: 'MASQUERADE_SESSION_OPENED',
    target: 'Ubud Sanctuary Retreats',
    details: 'Authorized support diagnostic session to debug Tripbone hotel pickup webhook sync payload.',
    timestamp: '2026-09-10 11:32 UTC',
    severity: 'info',
    ipAddress: '180.252.88.14'
  },
  {
    id: 'aud-995',
    adminName: 'Alexander Wright',
    adminEmail: 'alex.wright@whatscrm.cloud',
    action: 'TENANT_STATUS_UPDATED',
    target: 'SmileCraft Dental Studio',
    details: 'Sent overdue payment notification and placed tenant on 7-day grace period status.',
    timestamp: '2026-09-08 14:05 UTC',
    severity: 'warning',
    ipAddress: '108.162.215.18'
  }
];

export const INITIAL_ANNOUNCEMENTS: SystemAnnouncement[] = [
  {
    id: 'ann-01',
    title: 'Meta WhatsApp Multi-Device Sync Maintenance Window',
    message: 'WhatsApp Baileys socket pool will undergo scheduled zero-downtime rolling reload on Sunday Sep 20 at 02:00 UTC. Inbound messages will be queued without loss.',
    type: 'warning',
    isActive: true,
    targetAudience: 'all',
    updatedAt: '2026-09-12 10:00 UTC',
    createdBy: 'Alexander Wright'
  },
  {
    id: 'ann-02',
    title: 'New Tripbone 2.0 Webhook Connector Live',
    message: 'Enhanced automated tour voucher delivery and hotel pickup GPS coordination is now available for all Pro and Enterprise subscribers.',
    type: 'info',
    isActive: true,
    targetAudience: 'enterprise',
    updatedAt: '2026-09-10 14:00 UTC',
    createdBy: 'Alexander Wright'
  }
];

