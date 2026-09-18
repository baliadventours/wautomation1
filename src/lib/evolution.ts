/**
 * Evolution API v2 Server-Side Client
 * Handles communication between the Next.js SaaS backend and Evolution API.
 * The Evolution API global admin key is NEVER exposed to the browser.
 */

export interface EvolutionCreateResult {
  instance: {
    instanceName: string;
    instanceId: string;
    status: string;
  };
  hash: {
    apikey: string;
  };
  qrcode?: {
    pairingCode?: string;
    code?: string;
    base64?: string;
  };
}

export interface EvolutionConnectResult {
  pairingCode?: string;
  code?: string;
  base64?: string;
  count?: number;
}

export interface EvolutionStateResult {
  instance?: {
    instanceName: string;
    state: 'open' | 'connecting' | 'close' | 'refused';
  };
}

export class EvolutionApiClient {
  private baseUrl: string;
  private adminApiKey: string;

  constructor(baseUrl?: string, adminApiKey?: string) {
    this.baseUrl = (baseUrl || process.env.EVOLUTION_API_BASE_URL || 'http://localhost:8080').replace(/\/+$/, '');
    this.adminApiKey = adminApiKey || process.env.EVOLUTION_API_ADMIN_KEY || 'wac_gateway_master_key_8921a';
  }

  private getHeaders(customToken?: string) {
    return {
      'Content-Type': 'application/json',
      apikey: customToken || this.adminApiKey,
    };
  }

  /**
   * Format any international number to clean digits (e.g. +62 812-3456 -> 628123456)
   */
  public cleanNumber(phoneNumber: string): string {
    return phoneNumber.replace(/\D/g, '');
  }

  /**
   * 1. Create a new WhatsApp instance in Evolution API with webhook registration
   */
  async createInstance(
    instanceName: string,
    webhookUrl?: string,
    instanceToken?: string
  ): Promise<EvolutionCreateResult> {
    const payload: Record<string, any> = {
      instanceName,
      qrcode: true,
      integration: 'WHATSAPP-BAILEYS',
    };

    if (instanceToken) {
      payload.token = instanceToken;
    }

    if (webhookUrl) {
      payload.webhook = webhookUrl;
      payload.webhook_by_events = false;
      payload.events = [
        'CONNECTION_UPDATE',
        'MESSAGES_UPSERT',
        'MESSAGES_UPDATE',
        'QRCODE_UPDATED',
      ];
    }

    const res = await fetch(`${this.baseUrl}/instance/create`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      // If already exists, we proceed gracefully
      if (!errText.includes('already exists') && !errText.includes('instance already in use')) {
        throw new Error(`Failed to create Evolution instance (${res.status}): ${errText}`);
      }
    }

    const data = await res.json().catch(() => ({}));
    return data;
  }

  /**
   * 2. Retrieve live QR code and optional Pairing Code for an instance
   */
  async getConnectQr(instanceName: string, phoneNumber?: string): Promise<EvolutionConnectResult> {
    const url = phoneNumber
      ? `${this.baseUrl}/instance/connect/${instanceName}?number=${this.cleanNumber(phoneNumber)}`
      : `${this.baseUrl}/instance/connect/${instanceName}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to fetch QR code from Evolution API (${res.status}): ${err}`);
    }

    return await res.json();
  }

  /**
   * 3. Fetch current connection state ('open' = connected, 'close' = disconnected, 'connecting')
   */
  async getConnectionState(instanceName: string): Promise<EvolutionStateResult> {
    const res = await fetch(`${this.baseUrl}/instance/connectionState/${instanceName}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      return { instance: { instanceName, state: 'close' } };
    }

    return await res.json();
  }

  /**
   * 4. Send a text message through an instance
   */
  async sendTextMessage(
    instanceName: string,
    recipientNumber: string,
    text: string,
    instanceToken?: string
  ): Promise<{ key?: { id?: string }; status?: string }> {
    const cleanNum = this.cleanNumber(recipientNumber);

    const res = await fetch(`${this.baseUrl}/message/sendText/${instanceName}`, {
      method: 'POST',
      headers: this.getHeaders(instanceToken),
      body: JSON.stringify({
        number: cleanNum,
        text,
        delay: 1200,
        linkPreview: true,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Evolution API sendText error (${res.status}): ${errText}`);
    }

    return await res.json();
  }

  /**
   * 5. Logout WhatsApp session
   */
  async logoutInstance(instanceName: string): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/instance/logout/${instanceName}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return res.ok;
  }

  /**
   * 6. Delete instance completely from Evolution API
   */
  async deleteInstance(instanceName: string): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/instance/delete/${instanceName}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return res.ok;
  }
}

// Default singleton instance
export const evolutionApi = new EvolutionApiClient();
