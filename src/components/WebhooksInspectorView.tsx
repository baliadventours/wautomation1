import React, { useState } from 'react';
import { 
  WhapiChannel, 
  WebhookLog 
} from '../types';
import { INITIAL_WEBHOOK_LOGS } from '../data/mockData';
import { 
  Webhook, 
  Send, 
  Copy, 
  Check, 
  RefreshCw, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  Key, 
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Filter,
  Sparkles
} from 'lucide-react';

interface WebhooksInspectorViewProps {
  activeChannel: WhapiChannel;
  onUpdateChannelWebhook: (url: string) => void;
}

export const WebhooksInspectorView: React.FC<WebhooksInspectorViewProps> = ({
  activeChannel,
  onUpdateChannelWebhook,
}) => {
  const [webhookUrl, setWebhookUrl] = useState(activeChannel.webhookUrl);
  const [signingSecret, setSigningSecret] = useState('whsec_' + Math.random().toString(36).substring(2, 16));
  const [logs, setLogs] = useState<WebhookLog[]>(INITIAL_WEBHOOK_LOGS);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(INITIAL_WEBHOOK_LOGS[0]?.id || null);
  const [filterEvent, setFilterEvent] = useState<string>('all');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedPayloadId, setCopiedPayloadId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [subscriptions, setSubscriptions] = useState({
    messages_upsert: true,
    messages_ack: true,
    presence_update: true,
    chats_update: true,
    contacts_update: true,
    groups_update: false,
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSaveUrl = () => {
    onUpdateChannelWebhook(webhookUrl);
    showToast('Webhook endpoint updated successfully!');
  };

  const handleSendTestWebhook = () => {
    setIsSendingTest(true);
    setTimeout(() => {
      const newLog: WebhookLog = {
        id: `wh-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        event: 'messages.upsert',
        destination: webhookUrl,
        status: 'success',
        httpStatus: 200,
        payload: JSON.stringify({
          event: 'messages.upsert',
          channel_id: activeChannel.id,
          timestamp: Math.floor(Date.now() / 1000),
          data: {
            id: `wamid.HBgL${Math.random().toString(36).substring(2, 8).toUpperCase()}==`,
            from: '6281234567890@s.whatsapp.net',
            type: 'text',
            text: {
              body: 'Test webhook ping from Whapi.Cloud console!'
            },
            push_name: 'Whapi Tester'
          }
        }, null, 2),
      };

      setLogs(prev => [newLog, ...prev]);
      setExpandedLogId(newLog.id);
      setIsSendingTest(false);
      showToast('Simulated webhook delivered with HTTP 200 OK');
    }, 600);
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(signingSecret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleCopyPayload = (payload: string, id: string) => {
    navigator.clipboard.writeText(payload);
    setCopiedPayloadId(id);
    setTimeout(() => setCopiedPayloadId(null), 2000);
  };

  const filteredLogs = logs.filter(l => {
    if (filterEvent === 'all') return true;
    return l.event.toLowerCase().includes(filterEvent.toLowerCase());
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2.5 bg-neutral-900 text-white text-xs font-semibold rounded-xl shadow-lg border border-neutral-800 animate-in fade-in">
          {toastMsg}
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold tracking-wide uppercase">
              Webhooks Engine
            </span>
            <span className="text-xs text-neutral-400">• Real-Time Delivery Callbacks</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mt-1">Webhooks & Event Stream</h1>
          <p className="text-sm text-neutral-600 mt-0.5">
            Receive instant HTTP POST notifications on your backend server for incoming messages, read receipts, delivery updates, and group status changes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSendTestWebhook}
            disabled={isSendingTest}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-300 text-white text-xs font-bold transition cursor-pointer shadow-xs"
          >
            {isSendingTest ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Pinging Destination...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Send Test Webhook</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Webhook Endpoint & Secret Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <Webhook className="w-4 h-4 text-emerald-600" />
              <h3 className="text-base font-bold text-neutral-900">Webhook Destination Configuration</h3>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Stream Active
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Target URL (Must respond with HTTP 200 within 5 seconds)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://api.yourcompany.com/webhooks/whatsapp"
                  className="flex-1 px-3.5 py-2.5 border border-neutral-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
                <button
                  onClick={handleSaveUrl}
                  className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Save URL
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                HMAC-SHA256 Webhook Signature Secret
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={signingSecret}
                  className="flex-1 px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono text-neutral-600 focus:outline-hidden"
                />
                <button
                  onClick={handleCopySecret}
                  className="p-2.5 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-xl text-neutral-600 transition cursor-pointer"
                  title="Copy Secret"
                >
                  {copiedSecret ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => {
                    setSigningSecret('whsec_' + Math.random().toString(36).substring(2, 16));
                    showToast('Generated new signing secret');
                  }}
                  className="px-3 py-2 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-xl text-xs font-medium text-neutral-700 transition cursor-pointer"
                >
                  Regenerate
                </button>
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                Whapi passes a signature in the <code className="text-neutral-700 font-mono">X-Whapi-Signature</code> header so you can verify that requests originate from Whapi.Cloud.
              </p>
            </div>
          </div>
        </div>

        {/* Subscribed Event Filters */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-3">
          <h3 className="text-base font-bold text-neutral-900 pb-2 border-b border-neutral-100">
            Subscribed Events
          </h3>

          <div className="space-y-2 text-xs">
            <label className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 cursor-pointer">
              <span className="font-mono text-neutral-700">messages.upsert</span>
              <input
                type="checkbox"
                checked={subscriptions.messages_upsert}
                onChange={(e) => setSubscriptions({ ...subscriptions, messages_upsert: e.target.checked })}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 cursor-pointer">
              <span className="font-mono text-neutral-700">messages.ack</span>
              <input
                type="checkbox"
                checked={subscriptions.messages_ack}
                onChange={(e) => setSubscriptions({ ...subscriptions, messages_ack: e.target.checked })}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 cursor-pointer">
              <span className="font-mono text-neutral-700">presence.update</span>
              <input
                type="checkbox"
                checked={subscriptions.presence_update}
                onChange={(e) => setSubscriptions({ ...subscriptions, presence_update: e.target.checked })}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 cursor-pointer">
              <span className="font-mono text-neutral-700">chats.update</span>
              <input
                type="checkbox"
                checked={subscriptions.chats_update}
                onChange={(e) => setSubscriptions({ ...subscriptions, chats_update: e.target.checked })}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 cursor-pointer">
              <span className="font-mono text-neutral-700">groups.update</span>
              <input
                type="checkbox"
                checked={subscriptions.groups_update}
                onChange={(e) => setSubscriptions({ ...subscriptions, groups_update: e.target.checked })}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Webhook Delivery Stream Logs */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-neutral-900">Recent Webhook Deliveries</span>
            <span className="text-xs text-neutral-500">({filteredLogs.length} events logged)</span>
          </div>

          <div className="flex items-center gap-1">
            {['all', 'message', 'booking', 'contact'].map((ef) => (
              <button
                key={ef}
                onClick={() => setFilterEvent(ef)}
                className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition cursor-pointer ${
                  filterEvent === ef ? 'bg-neutral-900 text-white font-semibold' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {ef === 'all' ? 'All Events' : ef}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-neutral-100">
          {filteredLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            return (
              <div key={log.id} className="transition">
                <div 
                  onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-neutral-50 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-emerald-100 text-emerald-800">
                      HTTP {log.httpStatus}
                    </span>
                    <span className="font-mono text-xs font-semibold text-neutral-900 truncate">
                      {log.event}
                    </span>
                    <span className="text-xs text-neutral-500 truncate hidden md:inline">
                      &rarr; {log.destination}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-neutral-400 font-mono">{log.timestamp}</span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-neutral-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-neutral-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 bg-neutral-950 text-white border-t border-neutral-800">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800">
                      <span className="text-[11px] font-mono text-neutral-400">JSON Payload:</span>
                      <button
                        onClick={() => handleCopyPayload(log.payload, log.id)}
                        className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition cursor-pointer"
                      >
                        {copiedPayloadId === log.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Payload</span>
                          </>
                        )}
                      </button>
                    </div>

                    <pre className="p-3 font-mono text-xs text-emerald-400 overflow-x-auto bg-neutral-900 rounded-lg">
                      {log.payload}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
