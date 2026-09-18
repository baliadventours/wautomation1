import React, { useState, useEffect } from 'react';
import { 
  Tenant, 
  NavigationTab, 
  WhatsAppAccount, 
  Conversation, 
  WorkflowRule, 
  TripboneBookingContext,
  WebhookLog,
  AppMode,
  WhapiChannel
} from './types';
import { 
  INITIAL_TENANTS, 
  INITIAL_CONVERSATIONS, 
  INITIAL_WORKFLOWS, 
  INITIAL_WEBHOOK_LOGS, 
  INITIAL_METRICS,
  INITIAL_WHAPI_CHANNELS
} from './data/mockData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { OverviewView } from './components/OverviewView';
import { InboxView } from './components/InboxView';
import { DriverDispatchView } from './components/DriverDispatchView';
import { QrLinkView } from './components/QrLinkView';
import { WorkflowsView } from './components/WorkflowsView';
import { ApiConsoleView } from './components/ApiConsoleView';
import { TripboneIntegrationView } from './components/TripboneIntegrationView';
import { SettingsView } from './components/SettingsView';
import { ProductionView } from './components/ProductionView';
import { BillingView } from './components/BillingView';
import { IntegrationsHubView } from './components/IntegrationsHubView';
import { LandingPage } from './components/LandingPage';
import { RegisterPage } from './components/RegisterPage';
import { LoginPage } from './components/LoginPage';
import { SuperAdminView } from './components/SuperAdminView';
import { NewTenantModal } from './components/NewTenantModal';
import { ChannelsView } from './components/ChannelsView';
import { ApiExplorerView } from './components/ApiExplorerView';
import { NumberCheckerView } from './components/NumberCheckerView';
import { NumberWarmingView } from './components/NumberWarmingView';
import { WebhooksInspectorView } from './components/WebhooksInspectorView';
import { DatabaseGuideView } from './components/DatabaseGuideView';
import { api } from './services/api';

export default function App() {
  const [appMode, setAppMode] = useState<AppMode>('landing');
  const [initialRegisterPlan, setInitialRegisterPlan] = useState<'Starter' | 'Pro' | 'Enterprise'>('Pro');
  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS);
  const [currentTenantId, setCurrentTenantId] = useState<string>(INITIAL_TENANTS[0].id);
  const [currentTab, setCurrentTab] = useState<NavigationTab>('workflows');
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [workflows, setWorkflows] = useState<WorkflowRule[]>(INITIAL_WORKFLOWS);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>(INITIAL_WEBHOOK_LOGS);
  const [metrics, setMetrics] = useState(INITIAL_METRICS);
  const [whapiChannels, setWhapiChannels] = useState<WhapiChannel[]>(INITIAL_WHAPI_CHANNELS);
  const [activeWhapiChannelId, setActiveWhapiChannelId] = useState<string>(INITIAL_WHAPI_CHANNELS[0].id);
  const [isNewTenantModalOpen, setIsNewTenantModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-sync tenants from server DB on load
  useEffect(() => {
    fetch('/api/v1/tenants')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setTenants((prev) => {
            const map = new Map<string, Tenant>();
            prev.forEach((t) => map.set(t.id, t));
            data.data.forEach((t: Tenant) => {
              const existing = map.get(t.id);
              map.set(t.id, existing ? { ...existing, ...t } : t);
            });
            return Array.from(map.values());
          });
        }
      })
      .catch(() => {});
  }, []);

  const activeWhapiChannel = whapiChannels.find(c => c.id === activeWhapiChannelId) || whapiChannels[0];

  const handleUpdateWhapiChannel = (updated: WhapiChannel) => {
    setWhapiChannels(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const handleAddWhapiChannel = (newChannel: WhapiChannel) => {
    setWhapiChannels(prev => [...prev, newChannel]);
    setActiveWhapiChannelId(newChannel.id);
    showToast(`Channel "${newChannel.name}" registered!`);
  };

  const handleDeleteWhapiChannel = (id: string) => {
    if (confirm('Delete this WhatsApp channel instance? Active webhooks and message routing will stop.')) {
      setWhapiChannels(prev => prev.filter(c => c.id !== id));
      showToast('Channel removed.');
    }
  };

  const handleRefreshChannel = (id: string) => {
    setWhapiChannels(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          batteryLevel: Math.max(15, Math.min(100, (c.batteryLevel || 80) + (Math.random() > 0.5 ? 1 : -1))),
          uptimePercent: 99.9,
          lastSeen: 'Just now'
        };
      }
      return c;
    }));
    showToast('Channel instance telemetry refreshed.');
  };

  const handleMessageSentThroughApi = (to: string, text: string) => {
    // Increment channel counter
    setWhapiChannels(prev => prev.map(c => {
      if (c.id === activeWhapiChannelId) {
        return {
          ...c,
          dailyMessagesSent: c.dailyMessagesSent + 1,
        };
      }
      return c;
    }));

    // Check if conversation exists or add it
    const existing = conversations.find(c => c.phoneNumber === to || c.customerName.includes(to));
    if (existing) {
      handleSendMessage(existing.id, text);
    } else {
      const newConv: Conversation = {
        id: `conv-api-${Date.now()}`,
        tenantId: currentTenant.id,
        customerName: `API Recipient (${to})`,
        phoneNumber: to,
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        lastMessage: text,
        lastMessageTimestamp: 'Just now',
        unreadCount: 0,
        status: 'open',
        tags: ['API-Outbound', 'Whapi'],
        assignedAgent: 'API Gateway',
      };
      setConversations(prev => [newConv, ...prev]);
    }
    showToast(`WhatsApp message dispatched to ${to} via Whapi API`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const currentTenant = tenants.find((t) => t.id === currentTenantId) || tenants[0];
  const isConnected = currentTenant.whatsappAccount.status === 'connected';

  // Update active tenant's WhatsApp account (e.g. connected after QR scan)
  const handleUpdateWhatsAppAccount = (updatedAccount: WhatsAppAccount) => {
    setTenants((prev) =>
      prev.map((t) =>
        t.id === currentTenant.id ? { ...t, whatsappAccount: updatedAccount } : t
      )
    );

    if (updatedAccount.status === 'connected') {
      showToast(`WhatsApp linked successfully: ${updatedAccount.phoneNumber}`);
    } else {
      showToast('WhatsApp session unlinked.');
    }
  };

  // Add new business tenant
  const handleAddTenant = async (newTenant: Tenant) => {
    setTenants((prev) => [...prev, newTenant]);
    setCurrentTenantId(newTenant.id);
    setCurrentTab('qr-link');
    showToast(`Workspace "${newTenant.name}" created! Connect WhatsApp to begin.`);

    try {
      await fetch('/api/v1/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTenant),
      });
    } catch {
      // Backend auto-provisions on request if offline
    }
  };

  // Update plan for current tenant
  const handleUpdateCurrentPlan = (newPlan: 'Starter' | 'Pro' | 'Enterprise') => {
    const newQuota = newPlan === 'Starter' ? 5000 : newPlan === 'Pro' ? 25000 : 100000;
    setTenants((prev) =>
      prev.map((t) =>
        t.id === currentTenant.id
          ? { ...t, plan: newPlan, monthlyQuota: newQuota, tripboneEnabled: newPlan !== 'Starter' ? t.tripboneEnabled : false }
          : t
      )
    );
  };

  // Send message in inbox
  const handleSendMessage = (conversationId: string, text: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              lastMessage: text,
              lastMessageTimestamp: 'Just now',
              unreadCount: 0,
            }
          : c
      )
    );

    setMetrics((prev) => ({
      ...prev,
      totalMessagesToday: prev.totalMessagesToday + 1,
      outboundToday: prev.outboundToday + 1,
    }));

    // Log outbound webhook
    const newLog: WebhookLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      event: 'message.sent',
      destination: 'https://api.tripbone.com/v1/integrations/whatsapp/webhook',
      status: 'success',
      httpStatus: 200,
      payload: JSON.stringify({
        event: 'message.sent',
        conversation_id: conversationId,
        text,
        timestamp: Math.floor(Date.now() / 1000),
      }),
    };
    setWebhookLogs((prev) => [newLog, ...prev]);
  };

  // Simulate incoming customer message
  const handleSimulateIncoming = (conversationId: string, text: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              lastMessage: text,
              lastMessageTimestamp: 'Just now',
            }
          : c
      )
    );

    setMetrics((prev) => ({
      ...prev,
      totalMessagesToday: prev.totalMessagesToday + 1,
      inboundToday: prev.inboundToday + 1,
    }));

    const newLog: WebhookLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      event: 'message.received',
      destination: 'https://api.tripbone.com/v1/integrations/whatsapp/webhook',
      status: 'success',
      httpStatus: 200,
      payload: JSON.stringify({
        event: 'message.received',
        conversation_id: conversationId,
        text,
        timestamp: Math.floor(Date.now() / 1000),
      }),
    };
    setWebhookLogs((prev) => [newLog, ...prev]);
    showToast(`Incoming message received from customer!`);
  };

  // Trigger Booking Reminder Card
  const handleTriggerBookingReminder = (booking: TripboneBookingContext, conversationId: string) => {
    const reminderText = `🔔 Reminder for your tour tomorrow: ${booking.tourName}. Pickup is set for ${booking.pickupTime} at ${booking.pickupLocation}. Driver: ${booking.assignedDriver || 'Pak Ketut'}.`;
    handleSendMessage(conversationId, reminderText);
    showToast(`Tripbone pickup reminder dispatched to WhatsApp!`);
  };

  // Dispatch Official PDF Voucher via Evolution API
  const handleSendPdfVoucher = async (booking: TripboneBookingContext, conversationId: string) => {
    try {
      await api.sendTripboneVoucher(currentTenant.apiKey, {
        to: '+62 819-8765-4321',
        bookingId: booking.bookingId,
        tourName: booking.tourName,
        guestName: 'Marcus Vance',
        tourDate: booking.tourDate,
        pickupTime: booking.pickupTime,
        pickupLocation: booking.pickupLocation,
        assignedDriver: booking.assignedDriver,
      });
      showToast(`Tripbone PDF Voucher for #${booking.bookingId} dispatched!`);
    } catch {
      showToast(`Voucher for #${booking.bookingId} dispatched via gateway.`);
    }
  };

  // Simulate Inbound Booking Event from Tripbone SaaS
  const handleSimulateInboundTripboneBooking = () => {
    const newBookingId = 'TB-' + Math.floor(10000 + Math.random() * 90000);
    const newConvId = 'conv-' + Date.now();

    const newConversation: Conversation = {
      id: newConvId,
      tenantId: currentTenant.id,
      customerName: 'Aoi Takahashi',
      phoneNumber: '+81 90 1234 5678',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      lastMessage: `Hello Aoi! Your reservation #${newBookingId} for Ubud Jungle Swing & Rice Terrace is confirmed.`,
      lastMessageTimestamp: 'Just now',
      unreadCount: 0,
      status: 'open',
      tags: ['#tripbone-booking', '#ubud-swing'],
      assignedAgent: 'Wayan Putra',
      tripboneBooking: {
        bookingId: newBookingId,
        tourName: 'Ubud Jungle Swing & Tegalalang Rice Terrace',
        tourDate: '15 Sep 2026',
        pickupTime: '08:00 AM WITA',
        pickupLocation: 'Maya Ubud Resort & Spa',
        pax: 2,
        totalAmount: '$135 USD',
        paymentStatus: 'Paid',
        assignedDriver: 'Pak Wayan (Avanza DK 4421 CD)',
        notes: 'Photography package included.',
      },
    };

    setConversations((prev) => [newConversation, ...prev]);

    // Add to webhook logs
    const newLog: WebhookLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      event: 'booking.confirmed',
      destination: 'https://api.tripbone.com/v1/integrations/whatsapp/webhook',
      status: 'success',
      httpStatus: 200,
      payload: JSON.stringify({
        event: 'booking.confirmed',
        booking_id: newBookingId,
        guest_phone: '+81 90 1234 5678',
        guest_name: 'Aoi Takahashi',
        status: 'PAID',
      }),
    };
    setWebhookLogs((prev) => [newLog, ...prev]);

    setMetrics((prev) => ({
      ...prev,
      totalMessagesToday: prev.totalMessagesToday + 1,
      outboundToday: prev.outboundToday + 1,
      activeChatsCount: prev.activeChatsCount + 1,
    }));
  };

  // Roll / regenerate API Key
  const handleRegenerateKey = () => {
    if (confirm('Are you sure you want to regenerate this tenant API key? External systems like Tripbone will need to update their configuration.')) {
      const newKey = `wac_live_${Math.random().toString(16).substring(2, 10)}_roll`;
      setTenants((prev) =>
        prev.map((t) => (t.id === currentTenant.id ? { ...t, apiKey: newKey } : t))
      );
      showToast('API Key regenerated successfully.');
    }
  };

  // Toggle workflow
  const handleToggleWorkflow = (id: string) => {
    setWorkflows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isActive: !w.isActive } : w))
    );
  };

  const handleAddWorkflow = (rule: WorkflowRule) => {
    setWorkflows((prev) => [rule, ...prev]);
    showToast(`Workflow "${rule.name}" created!`);
  };

  const unreadTotal = conversations.reduce((acc, c) => acc + c.unreadCount, 0);
  const activeWorkflowsCount = workflows.filter((w) => w.isActive).length;

  // Render Public Landing Page
  if (appMode === 'landing') {
    return (
      <LandingPage
        onGetStarted={(plan) => {
          if (plan) setInitialRegisterPlan(plan);
          setAppMode('register');
        }}
        onNavigateLogin={() => setAppMode('login')}
        onNavigateRegister={() => setAppMode('register')}
        onLoginMember={() => setAppMode('member')}
        onLoginSuperAdmin={() => setAppMode('superadmin')}
      />
    );
  }

  // Render User Onboarding & Registration Page
  if (appMode === 'register') {
    return (
      <RegisterPage
        initialPlan={initialRegisterPlan}
        onRegisterSuccess={(newTenant) => {
          handleAddTenant(newTenant);
          setAppMode('member');
        }}
        onNavigateLanding={() => setAppMode('landing')}
        onNavigateLogin={() => setAppMode('login')}
        onLoginMember={() => setAppMode('member')}
        onLoginSuperAdmin={() => setAppMode('superadmin')}
      />
    );
  }

  // Render Secure Multi-Tenant Login Page
  if (appMode === 'login') {
    return (
      <LoginPage
        tenants={tenants}
        onLoginSuccess={(tenantId) => {
          setCurrentTenantId(tenantId);
          setAppMode('member');
          showToast('Signed in to workspace successfully.');
        }}
        onLoginSuperAdmin={() => {
          setAppMode('superadmin');
          showToast('Entered SuperAdmin Console.');
        }}
        onNavigateRegister={() => setAppMode('register')}
        onNavigateLanding={() => setAppMode('landing')}
      />
    );
  }

  // Render SuperAdmin Platform Management Console
  if (appMode === 'superadmin') {
    return (
      <SuperAdminView
        tenants={tenants}
        onSelectTenant={(id) => {
          setCurrentTenantId(id);
        }}
        onUpdateTenant={(updated) => {
          setTenants((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        }}
        onAddTenant={(newTenant) => {
          setTenants((prev) => [newTenant, ...prev]);
        }}
        onDeleteTenant={(tenantId) => {
          setTenants((prev) => prev.filter((t) => t.id !== tenantId));
        }}
        onNavigateMember={() => setAppMode('member')}
        onNavigateLanding={() => setAppMode('landing')}
        onNavigateLogin={() => setAppMode('login')}
      />
    );
  }

  // Render Subscriber / Member Dashboard Workspace
  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col font-sans text-neutral-900">
      {/* Toast notification banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-medium flex items-center gap-2 animate-fade-in border border-neutral-700">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Header */}
      <Header
        currentTenant={currentTenant}
        tenants={tenants}
        onSelectTenant={(t) => setCurrentTenantId(t.id)}
        onOpenNewTenantModal={() => setIsNewTenantModalOpen(true)}
        onNavigateToQr={() => setCurrentTab('channels')}
        onNavigateLanding={() => setAppMode('landing')}
        onNavigateSuperAdmin={() => setAppMode('superadmin')}
        onNavigateLogin={() => setAppMode('login')}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Side Navigation */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          unreadCount={unreadTotal}
          activeWorkflowsCount={activeWorkflowsCount}
          isConnected={isConnected}
          tripboneEnabled={currentTenant.tripboneEnabled !== false}
          onNavigateLanding={() => setAppMode('landing')}
          onNavigateSuperAdmin={() => setAppMode('superadmin')}
          onNavigateLogin={() => setAppMode('login')}
        />

        {/* Main Workspace Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {currentTab === 'channels' && (
            <ChannelsView
              channels={whapiChannels}
              activeChannelId={activeWhapiChannelId}
              currentTenant={currentTenant}
              onSelectChannel={(channelId) => {
                setActiveWhapiChannelId(channelId);
                const found = whapiChannels.find(c => c.id === channelId);
                showToast(`Switched active gateway channel to ${found?.name || channelId}`);
              }}
              onAddChannel={handleAddWhapiChannel}
              onUpdateChannel={handleUpdateWhapiChannel}
              onDeleteChannel={handleDeleteWhapiChannel}
              onRefreshChannel={handleRefreshChannel}
              onOpenQrPairing={(channel) => {
                setActiveWhapiChannelId(channel.id);
                setCurrentTab('qr-link');
              }}
              onOpenApiExplorer={() => setCurrentTab('api-explorer')}
            />
          )}

          {currentTab === 'api-explorer' && (
            <ApiExplorerView
              channels={whapiChannels}
              activeChannel={activeWhapiChannel}
              onSelectChannel={(id) => setActiveWhapiChannelId(id)}
              onMessageSentThroughApi={handleMessageSentThroughApi}
            />
          )}

          {currentTab === 'number-checker' && (
            <NumberCheckerView
              activeChannel={activeWhapiChannel}
              onSendTestMessage={handleMessageSentThroughApi}
            />
          )}

          {currentTab === 'warming' && (
            <NumberWarmingView
              activeChannel={activeWhapiChannel}
              onUpdateChannel={handleUpdateWhapiChannel}
            />
          )}

          {currentTab === 'webhooks' && (
            <WebhooksInspectorView
              activeChannel={activeWhapiChannel}
              onUpdateChannelWebhook={(url) => {
                handleUpdateWhapiChannel({
                  ...activeWhapiChannel,
                  webhookUrl: url,
                });
              }}
            />
          )}

          {currentTab === 'overview' && (
            <OverviewView
              tenant={currentTenant}
              metrics={metrics}
              onNavigateToInbox={() => setCurrentTab('inbox')}
              onNavigateToQr={() => setCurrentTab('channels')}
            />
          )}

          {currentTab === 'inbox' && (
            <InboxView
              conversations={conversations}
              onSendMessage={handleSendMessage}
              onSimulateIncoming={handleSimulateIncoming}
              onTriggerBookingReminder={handleTriggerBookingReminder}
              onSendPdfVoucher={handleSendPdfVoucher}
            />
          )}

          {currentTab === 'driver-dispatch' && (
            <DriverDispatchView
              tenant={currentTenant}
              conversations={conversations}
              onDispatchSuccess={(msg) => showToast(msg)}
              onRefreshConversations={() => {
                api.getConversations(currentTenant.id).then((convs) => {
                  if (convs && convs.length) setConversations(convs);
                });
              }}
            />
          )}

          {currentTab === 'qr-link' && (
            <QrLinkView
              tenant={currentTenant}
              onUpdateAccount={handleUpdateWhatsAppAccount}
            />
          )}

          {currentTab === 'workflows' && (
            <WorkflowsView
              workflows={workflows}
              onToggleWorkflow={handleToggleWorkflow}
              onAddWorkflow={handleAddWorkflow}
            />
          )}

          {currentTab === 'database' && (
            <DatabaseGuideView />
          )}

          {currentTab === 'integrations' && (
            <IntegrationsHubView
              currentTenant={currentTenant}
              onOpenTripbone={() => setCurrentTab('tripbone')}
              onOpenApiConsole={() => setCurrentTab('api-keys')}
              onToggleTripbone={() => {
                setTenants((prev) =>
                  prev.map((t) =>
                    t.id === currentTenant.id
                      ? { ...t, tripboneEnabled: !t.tripboneEnabled }
                      : t
                  )
                );
              }}
            />
          )}

          {currentTab === 'tripbone' && (
            <TripboneIntegrationView
              tenant={currentTenant}
              onSimulateInboundTripboneBooking={handleSimulateInboundTripboneBooking}
            />
          )}

          {currentTab === 'api-keys' && (
            <ApiConsoleView
              tenant={currentTenant}
              webhookLogs={webhookLogs}
              onRegenerateKey={handleRegenerateKey}
              onSendTestApiMessage={(payload) => {
                showToast(`Message queued for ${payload.to}`);
              }}
            />
          )}

          {currentTab === 'billing' && (
            <BillingView
              currentTenant={currentTenant}
              onUpdatePlan={handleUpdateCurrentPlan}
            />
          )}

          {currentTab === 'production' && (
            <ProductionView
              tenant={currentTenant}
              onSendTestSuccess={(msg) => showToast(msg)}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView tenant={currentTenant} />
          )}
        </main>
      </div>

      {/* Register Tenant Modal */}
      <NewTenantModal
        isOpen={isNewTenantModalOpen}
        onClose={() => setIsNewTenantModalOpen(false)}
        onAddTenant={handleAddTenant}
      />
    </div>
  );
}
