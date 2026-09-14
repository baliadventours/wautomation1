import React, { useState } from 'react';
import { Tenant, WebhookLog } from '../types';
import { 
  Key, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Terminal, 
  Send, 
  Code2, 
  RefreshCw, 
  Globe, 
  ShieldCheck, 
  CheckCircle2,
  FileCode,
  Zap
} from 'lucide-react';

interface ApiConsoleViewProps {
  tenant: Tenant;
  webhookLogs: WebhookLog[];
  onRegenerateKey: () => void;
  onSendTestApiMessage: (payload: any) => void;
}

export const ApiConsoleView: React.FC<ApiConsoleViewProps> = ({
  tenant,
  webhookLogs,
  onRegenerateKey,
  onSendTestApiMessage,
}) => {
  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [activeTab, setActiveTab] = useState<'sandbox' | 'webhooks' | 'curl'>('sandbox');

  // Request test state
  const [recipientNumber, setRecipientNumber] = useState('+61412345678');
  const [messageBody, setMessageBody] = useState('Hello from Tripbone API! Your booking #TB-89412 is confirmed.');
  const [isSending, setIsSending] = useState(false);
  const [apiResponse, setApiResponse] = useState<string | null>(null);

  // Webhook config
  const [webhookUrl, setWebhookUrl] = useState('https://api.tripbone.com/v1/integrations/whatsapp/webhook');
  const [savedWebhook, setSavedWebhook] = useState(false);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(tenant.apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleExecuteApi = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setApiResponse(null);

    setTimeout(() => {
      const resp = {
        success: true,
        message_id: 'wamid.HBgL' + Math.random().toString(36).substring(2, 12).toUpperCase(),
        tenant_id: tenant.id,
        recipient: recipientNumber,
        status: 'queued_in_baileys',
        timestamp: Math.floor(Date.now() / 1000),
        meta: {
          rate_limit_remaining: 998,
          socket_latency_ms: 38,
        },
      };

      setApiResponse(JSON.stringify(resp, null, 2));
      setIsSending(false);
      onSendTestApiMessage({ to: recipientNumber, text: messageBody });
    }, 900);
  };

  const handleSaveWebhook = () => {
    setSavedWebhook(true);
    setTimeout(() => setSavedWebhook(false), 2500);
  };

  const curlSnippet = `curl -X POST "https://api.yourwhatsappcrm.com/v1/messages/send" \\
  -H "Authorization: Bearer ${tenant.apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "${recipientNumber}",
    "type": "text",
    "text": "${messageBody}"
  }'`;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Dedicated API & Webhooks</h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              REST Gateway
            </span>
          </div>
          <p className="text-sm text-neutral-500 mt-1">
            Integrate Tripbone, HubSpot, or any external CRM with your dedicated tenant API key and webhooks.
          </p>
        </div>
      </div>

      {/* Tenant API Key Card */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-neutral-700" />
              <h3 className="font-bold text-sm text-neutral-900">Your Dedicated Tenant API Key</h3>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Authenticate requests by including this key in the <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono text-[11px]">Authorization: Bearer [KEY]</code> header.
            </p>
          </div>

          <button
            onClick={onRegenerateKey}
            className="px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Roll Key</span>
          </button>
        </div>

        <div className="flex items-center gap-2 bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
          <input
            type={showKey ? 'text' : 'password'}
            readOnly
            value={tenant.apiKey}
            className="flex-1 bg-transparent font-mono text-xs text-neutral-800 focus:outline-none select-all"
          />
          <button
            onClick={() => setShowKey(!showKey)}
            className="p-1.5 text-neutral-500 hover:text-neutral-800 transition cursor-pointer"
            title={showKey ? 'Hide key' : 'Show key'}
          >
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={handleCopyKey}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium transition cursor-pointer"
          >
            {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Tabs: Interactive Sandbox / Webhooks / Code Snippets */}
      <div className="flex border-b border-neutral-200 gap-6 text-xs font-medium">
        <button
          onClick={() => setActiveTab('sandbox')}
          className={`pb-3 border-b-2 transition cursor-pointer ${
            activeTab === 'sandbox'
              ? 'border-neutral-900 text-neutral-900 font-bold'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          Interactive API Sandbox (POST /messages/send)
        </button>

        <button
          onClick={() => setActiveTab('webhooks')}
          className={`pb-3 border-b-2 transition cursor-pointer ${
            activeTab === 'webhooks'
              ? 'border-neutral-900 text-neutral-900 font-bold'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          Webhook Dispatcher & Logs
        </button>

        <button
          onClick={() => setActiveTab('curl')}
          className={`pb-3 border-b-2 transition cursor-pointer ${
            activeTab === 'curl'
              ? 'border-neutral-900 text-neutral-900 font-bold'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          cURL & SDK Snippets
        </button>
      </div>

      {/* 1. Sandbox View */}
      {activeTab === 'sandbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Request Configurator */}
          <form onSubmit={handleExecuteApi} className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800">
                  POST
                </span>
                <span className="font-mono text-xs text-neutral-700">/v1/messages/send</span>
              </div>
              <span className="text-[11px] text-neutral-400">JSON Payload</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Recipient Phone (E.164 with Country Code)
                </label>
                <input
                  type="text"
                  value={recipientNumber}
                  onChange={(e) => setRecipientNumber(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Message Body
                </label>
                <textarea
                  rows={4}
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white resize-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              {isSending ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Executing Request...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send API Message via WhatsApp</span>
                </>
              )}
            </button>
          </form>

          {/* Response Console */}
          <div className="bg-neutral-900 text-white rounded-2xl p-6 shadow-sm flex flex-col font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-neutral-200">Response Inspector</span>
              </div>
              {apiResponse && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-900/80 text-emerald-300 border border-emerald-700">
                  HTTP 200 OK
                </span>
              )}
            </div>

            <div className="flex-1 py-4 overflow-y-auto">
              {apiResponse ? (
                <pre className="text-emerald-400 text-xs leading-relaxed whitespace-pre-wrap">
                  {apiResponse}
                </pre>
              ) : (
                <div className="text-neutral-500 flex flex-col items-center justify-center h-48 text-center">
                  <Code2 className="w-8 h-8 text-neutral-700 mb-2" />
                  <p>Execute an API request on the left to inspect the live JSON response payload.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Webhooks Tab */}
      {activeTab === 'webhooks' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-neutral-900">Webhook Endpoint Destination</h3>
            <p className="text-xs text-neutral-500">
              When WhatsApp receives incoming customer chats or message delivery receipts, we POST the event payload to your endpoint.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Globe className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full text-xs font-mono pl-9 pr-3 py-2.5 border border-neutral-200 rounded-xl bg-neutral-50 focus:bg-white"
                />
              </div>
              <button
                onClick={handleSaveWebhook}
                className="w-full sm:w-auto px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                {savedWebhook ? 'Saved & Verified' : 'Save Endpoint'}
              </button>
            </div>
          </div>

          {/* Webhook Delivery Logs */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-neutral-900">Recent Webhook Deliveries</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-400 font-semibold uppercase text-[10px]">
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Event</th>
                    <th className="pb-2">Destination</th>
                    <th className="pb-2">Timestamp</th>
                    <th className="pb-2 text-right">Payload</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-mono">
                  {webhookLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-neutral-50">
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {log.httpStatus} OK
                        </span>
                      </td>
                      <td className="py-2.5 font-semibold text-neutral-800">{log.event}</td>
                      <td className="py-2.5 text-neutral-500 truncate max-w-xs">{log.destination}</td>
                      <td className="py-2.5 text-neutral-400">{log.timestamp}</td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => alert(`Webhook payload for ${log.event}:\n\n` + log.payload)}
                          className="text-[11px] text-purple-700 hover:underline cursor-pointer"
                        >
                          View JSON
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. cURL Tab */}
      {activeTab === 'curl' && (
        <div className="bg-neutral-900 text-white rounded-2xl p-6 shadow-sm space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-neutral-200">cURL Example</span>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(curlSnippet);
                alert('cURL command copied to clipboard!');
              }}
              className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-200 text-[11px]"
            >
              Copy cURL
            </button>
          </div>

          <pre className="text-emerald-400 text-xs overflow-x-auto p-2 bg-neutral-950 rounded-xl leading-relaxed whitespace-pre-wrap">
            {curlSnippet}
          </pre>
        </div>
      )}
    </div>
  );
};
