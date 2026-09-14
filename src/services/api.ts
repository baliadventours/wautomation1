import { Tenant, Conversation, WebhookLog, MetricsData, WhatsAppAccount, OutboundMessagePayload, Driver } from '../types';

export const api = {
  // Health
  async getHealth() {
    const res = await fetch('/api/health');
    return res.json();
  },

  // Production readiness status
  async getProductionStatus() {
    const res = await fetch('/api/v1/production-status');
    return res.json();
  },

  // Live WhatsApp / Evolution API Gateway Diagnostic
  async getGatewayStatus() {
    const res = await fetch('/api/v1/gateway/status');
    return res.json();
  },

  // Tenants
  async getTenants(): Promise<Tenant[]> {
    try {
      const res = await fetch('/api/v1/tenants');
      const data = await res.json();
      return data.data;
    } catch {
      return [];
    }
  },

  async createTenant(payload: { name: string; businessType: string; plan: string }): Promise<Tenant> {
    const res = await fetch('/api/v1/tenants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data.data;
  },

  async rollApiKey(tenantId: string): Promise<string> {
    const res = await fetch(`/api/v1/tenants/${tenantId}/roll-key`, {
      method: 'POST',
    });
    const data = await res.json();
    return data.data.apiKey;
  },

  // WhatsApp QR & Connect
  async getQrString(tenantId: string): Promise<{ qrString: string; base64?: string; isLiveGateway?: boolean; expiresIn: number; status: string }> {
    const res = await fetch(`/api/v1/tenants/${tenantId}/qr`);
    return res.json();
  },

  async connectWhatsApp(tenantId: string, info: { phoneNumber: string; pushName: string }): Promise<WhatsAppAccount> {
    const res = await fetch(`/api/v1/tenants/${tenantId}/whatsapp/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(info),
    });
    const data = await res.json();
    return data.data;
  },

  async disconnectWhatsApp(tenantId: string): Promise<WhatsAppAccount> {
    const res = await fetch(`/api/v1/tenants/${tenantId}/whatsapp/disconnect`, {
      method: 'POST',
    });
    const data = await res.json();
    return data.data;
  },

  // Public Outbound Messages API (Uses Tenant API Key)
  async sendOutboundMessage(apiKey: string, payload: OutboundMessagePayload & { allowOptedOut?: boolean }) {
    const res = await fetch('/api/v1/messages/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // One-Click Tripbone PDF Voucher Dispatcher
  async sendTripboneVoucher(apiKey: string, payload: {
    to: string;
    bookingId: string;
    tourName: string;
    guestName: string;
    tourDate: string;
    pickupTime: string;
    pickupLocation: string;
    assignedDriver?: string;
  }) {
    const res = await fetch('/api/v1/messages/voucher', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Conversations
  async getConversations(tenantId: string): Promise<Conversation[]> {
    try {
      const res = await fetch(`/api/v1/conversations?tenantId=${tenantId}`);
      const data = await res.json();
      return data.data;
    } catch {
      return [];
    }
  },

  async toggleOptOut(conversationId: string, isOptedOut: boolean) {
    const res = await fetch(`/api/v1/conversations/${conversationId}/opt-out`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isOptedOut }),
    });
    return res.json();
  },

  async sendConversationMessage(conversationId: string, text: string, sender: 'business' | 'customer' = 'business') {
    const res = await fetch(`/api/v1/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, sender }),
    });
    return res.json();
  },

  // Tripbone Webhook Simulator / Dispatcher
  async triggerTripboneWebhook(tenantId: string, bookingData: any) {
    const res = await fetch('/api/v1/webhooks/tripbone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tripbone-Signature': 'sha256=' + Math.random().toString(16).substring(2),
      },
      body: JSON.stringify({
        event: 'booking.confirmed',
        tenantId,
        booking: bookingData,
      }),
    });
    return res.json();
  },

  // Webhook Logs
  async getWebhookLogs(): Promise<WebhookLog[]> {
    try {
      const res = await fetch('/api/v1/webhooks/logs');
      const data = await res.json();
      return data.data;
    } catch {
      return [];
    }
  },

  // Webhook Secret & HMAC Security
  async getWebhookSecret(tenantId: string): Promise<{ webhookSecret: string; strictSignatureVerification: boolean }> {
    const res = await fetch(`/api/v1/tenants/${tenantId}/webhook-secret`);
    return res.json();
  },

  async rotateWebhookSecret(tenantId: string): Promise<{ webhookSecret: string }> {
    const res = await fetch(`/api/v1/tenants/${tenantId}/webhook-secret/rotate`, {
      method: 'POST',
    });
    return res.json();
  },

  async toggleStrictWebhookVerification(tenantId: string, strict: boolean): Promise<{ strictSignatureVerification: boolean; message: string }> {
    const res = await fetch(`/api/v1/tenants/${tenantId}/webhook-secret/toggle-strict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ strict }),
    });
    return res.json();
  },

  // Message Queue & Anti-Ban Inspector
  async getQueueStatus(): Promise<{ success: boolean; stats: any; recentJobs: any[] }> {
    const res = await fetch('/api/v1/queue/status');
    return res.json();
  },

  async drainQueue(): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/v1/queue/drain', {
      method: 'POST',
    });
    return res.json();
  },

  // Driver Fleet & Dispatch Coordinator
  async getDrivers(): Promise<Driver[]> {
    try {
      const res = await fetch('/api/v1/drivers');
      const data = await res.json();
      return data.data || [];
    } catch {
      return [];
    }
  },

  async assignDriver(payload: {
    conversationId: string;
    driverId: string;
    notifyDriver?: boolean;
    notifyGuest?: boolean;
  }) {
    const res = await fetch('/api/v1/dispatch/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Bulk Announcements / Broadcast
  async broadcastCampaign(payload: {
    tenantId: string;
    messageText: string;
    audience?: 'all' | 'upcoming';
  }) {
    const res = await fetch('/api/v1/campaigns/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Post-Tour Review & Reputation Booster
  async requestReview(conversationId: string, reviewPlatform: 'tripadvisor' | 'google' = 'tripadvisor') {
    const res = await fetch('/api/v1/reviews/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, reviewPlatform }),
    });
    return res.json();
  },

  async simulateReviewRating(conversationId: string, rating: number, feedback: string) {
    const res = await fetch('/api/v1/reviews/simulate-rating', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, rating, feedback }),
    });
    return res.json();
  },

  // Daily Tour Manifest & Compliance
  async getTourManifest(tenantId?: string) {
    const url = tenantId ? `/api/v1/manifest?tenantId=${encodeURIComponent(tenantId)}` : '/api/v1/manifest';
    const res = await fetch(url);
    return res.json();
  },

  // Metrics
  async getMetrics(): Promise<MetricsData> {
    try {
      const res = await fetch('/api/v1/metrics');
      const data = await res.json();
      return data.data;
    } catch {
      return {} as MetricsData;
    }
  },

  // System Production Readiness Live Diagnostics
  async getSystemReadiness() {
    const res = await fetch('/api/system/readiness');
    return res.json();
  },

  async testDatabaseConnection(connectionString?: string) {
    const res = await fetch('/api/system/test-db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ connectionString }),
    });
    return res.json();
  },

  async testGatewayConnection() {
    const res = await fetch('/api/system/test-gateway', {
      method: 'POST',
    });
    return res.json();
  },
};
