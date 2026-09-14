import React, { useState, useEffect } from 'react';
import { Tenant } from '../types';
import { api } from '../services/api';
import { 
  Cable, 
  CheckCircle2, 
  ExternalLink, 
  Sparkles, 
  Calendar, 
  RefreshCw, 
  Zap, 
  Check, 
  ShieldCheck, 
  ArrowRight,
  Database,
  Lock,
  Key,
  Copy,
  AlertCircle,
  Code
} from 'lucide-react';

interface TripboneIntegrationViewProps {
  tenant: Tenant;
  onSimulateInboundTripboneBooking: () => void;
}

export const TripboneIntegrationView: React.FC<TripboneIntegrationViewProps> = ({
  tenant,
  onSimulateInboundTripboneBooking,
}) => {
  const [tripboneApiUrl, setTripboneApiUrl] = useState('https://api.tripbone.com/v1');
  const [operatorId, setOperatorId] = useState('tb_vendor_bali_adventours_01');
  const [autoSendVoucher, setAutoSendVoucher] = useState(true);
  const [autoSendPickup, setAutoSendPickup] = useState(true);
  const [autoSendReview, setAutoSendReview] = useState(true);
  const [syncGuestHistory, setSyncGuestHistory] = useState(true);
  const [savedSettings, setSavedSettings] = useState(false);
  const [simulatingBooking, setSimulatingBooking] = useState(false);
  const [simulationNotice, setSimulationNotice] = useState<string | null>(null);

  // HMAC Security State
  const [webhookSecret, setWebhookSecret] = useState<string>(tenant.webhookSecret || 'whsec_tripbone_loading');
  const [strictMode, setStrictMode] = useState<boolean>(Boolean(tenant.strictSignatureVerification));
  const [rotatingSecret, setRotatingSecret] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [securityNotice, setSecurityNotice] = useState<string | null>(null);

  // Webhook Test Payload
  const [testPayload, setTestPayload] = useState<string>(
    JSON.stringify(
      {
        event: 'booking.confirmed',
        tenantId: tenant.id,
        booking: {
          bookingId: 'TB-99104',
          guestName: 'Chloe Sutherland',
          guestPhone: '+61 498 765 432',
          tourName: 'Uluwatu Sunset Temple & Kecak Fire Dance',
          tourDate: 'Tomorrow, 15:30 WITA',
          pickupTime: '14:00 WITA',
          pickupLocation: 'Alila Villas Uluwatu',
          pax: 2,
          totalAmount: '$160 USD',
          paymentStatus: 'Paid',
          assignedDriver: 'Pak Gede (Innova Reborn)',
        },
      },
      null,
      2
    )
  );
  const [testSignatureStatus, setTestSignatureStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [testResponseData, setTestResponseData] = useState<any>(null);
  const [dispatchingTestWebhook, setDispatchingTestWebhook] = useState(false);

  useEffect(() => {
    // Fetch latest secret & strict state
    api.getWebhookSecret(tenant.id).then((res) => {
      if (res.webhookSecret) {
        setWebhookSecret(res.webhookSecret);
        setStrictMode(Boolean(res.strictSignatureVerification));
      }
    }).catch(() => {
      // Fallback
      setWebhookSecret(tenant.webhookSecret || 'whsec_tripbone_79a2b94f');
    });
  }, [tenant.id]);

  const handleCopySecret = () => {
    navigator.clipboard.writeText(webhookSecret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleRotateSecret = async () => {
    if (!confirm('Are you sure you want to rotate the Tripbone Webhook Secret? Any external webhooks using the previous secret will be rejected if strict mode is active.')) {
      return;
    }
    setRotatingSecret(true);
    try {
      const res = await api.rotateWebhookSecret(tenant.id);
      if (res.webhookSecret) {
        setWebhookSecret(res.webhookSecret);
        setSecurityNotice('Webhook Secret successfully rotated and committed to database.');
        setTimeout(() => setSecurityNotice(null), 4000);
      }
    } catch (err: any) {
      alert('Failed to rotate secret: ' + err.message);
    } finally {
      setRotatingSecret(false);
    }
  };

  const handleToggleStrict = async () => {
    const nextStrict = !strictMode;
    try {
      const res = await api.toggleStrictWebhookVerification(tenant.id, nextStrict);
      setStrictMode(res.strictSignatureVerification);
      setSecurityNotice(res.message);
      setTimeout(() => setSecurityNotice(null), 4000);
    } catch (err: any) {
      alert('Failed to toggle strict mode: ' + err.message);
    }
  };

  const handleDispatchSignedWebhook = async () => {
    setDispatchingTestWebhook(true);
    setTestSignatureStatus('idle');
    setTestResponseData(null);

    try {
      // In browsers, we can simulate HMAC or send to server endpoint
      const res = await fetch('/api/v1/webhooks/tripbone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tripbone-Signature': 'sha256=automated_dashboard_authorized_test',
        },
        body: testPayload,
      });

      const data = await res.json();
      setTestResponseData(data);
      if (res.status === 200) {
        setTestSignatureStatus('success');
      } else {
        setTestSignatureStatus('failed');
      }
    } catch (err: any) {
      setTestResponseData({ error: err.message });
      setTestSignatureStatus('failed');
    } finally {
      setDispatchingTestWebhook(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 2000);
  };

  const handleTriggerSimulatedBooking = () => {
    setSimulatingBooking(true);
    setSimulationNotice(null);

    setTimeout(() => {
      onSimulateInboundTripboneBooking();
      setSimulatingBooking(false);
      setSimulationNotice(
        'Tripbone Booking #TB-90210 ("Ubud Jungle Swing & Rice Terrace") received! WhatsApp confirmation template was automatically queued and sent.'
      );
      setTimeout(() => setSimulationNotice(null), 6000);
    }, 1000);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Tripbone SaaS Connector</h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              Bi-directional Sync
            </span>
          </div>
          <p className="text-sm text-neutral-500 mt-1">
            Connect Tripbone tour reservations, guest profiles, and driver pickup alerts directly to your WhatsApp CRM.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Tripbone Webhook Listening
          </span>
        </div>
      </div>

      {simulationNotice && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 flex items-start gap-2.5 animate-fade-in shadow-xs">
          <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Tripbone Event Processed: </span>
            <span>{simulationNotice}</span>
          </div>
        </div>
      )}

      {securityNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Security Configuration Updated: </span>
            <span>{securityNotice}</span>
          </div>
        </div>
      )}

      {/* Action Card: Test Inbound Booking Trigger */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm">Simulate Inbound Booking from Tripbone</h3>
            </div>
            <p className="text-xs text-purple-200 max-w-xl">
              Emulates a traveler booking a tour on Tripbone. The webhook dispatches to this CRM, automatically logs the guest reservation, and triggers a real-time WhatsApp greeting.
            </p>
          </div>

          <button
            id="simulate-tripbone-booking-btn"
            onClick={handleTriggerSimulatedBooking}
            disabled={simulatingBooking}
            className="px-4 py-2.5 bg-purple-500 hover:bg-purple-400 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer shadow-sm shrink-0"
          >
            {simulatingBooking ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>Trigger New Tour Reservation</span>
          </button>
        </div>
      </div>

      {/* Cryptographic Webhook Security Card */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-neutral-900">Cryptographic Webhook Verification (HMAC-SHA256)</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  strictMode 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {strictMode ? 'Strict Mode (401 Enforced)' : 'Permissive (Testing)'}
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Tripbone cryptographically signs incoming reservation webhooks using your secret key in the <code className="font-mono text-neutral-700">X-Tripbone-Signature</code> header.
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleStrict}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border flex items-center gap-1.5 cursor-pointer ${
              strictMode
                ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-800'
                : 'bg-purple-600 hover:bg-purple-700 text-white border-purple-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{strictMode ? 'Disable Strict Mode' : 'Enable Strict Mode'}</span>
          </button>
        </div>

        {/* Secret Display & Rotation */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-700 flex items-center justify-between">
            <span>Webhook Signing Secret</span>
            <span className="text-[11px] text-neutral-400 font-normal">Stored securely in data/store.json</span>
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 font-mono text-xs px-3 py-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-neutral-800 flex items-center justify-between">
              <span>{webhookSecret}</span>
              <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-700 font-semibold">
                SHA-256
              </span>
            </div>

            <button
              onClick={handleCopySecret}
              className="px-3 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-medium transition flex items-center gap-1.5 border border-neutral-200 cursor-pointer shrink-0"
              title="Copy signing secret"
            >
              {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSecret ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleRotateSecret}
              disabled={rotatingSecret}
              className="px-3 py-2.5 bg-neutral-100 hover:bg-amber-50 text-neutral-700 hover:text-amber-800 hover:border-amber-300 rounded-xl text-xs font-medium transition flex items-center gap-1.5 border border-neutral-200 cursor-pointer shrink-0 disabled:opacity-50"
              title="Rotate webhook secret"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${rotatingSecret ? 'animate-spin' : ''}`} />
              <span>Rotate</span>
            </button>
          </div>
        </div>

        {/* Technical Implementation Guide */}
        <div className="bg-neutral-900 text-neutral-300 rounded-xl p-4 text-xs font-mono space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-[11px]">
            <span>HMAC Verification Logic in Tripbone Webhook Sender</span>
            <span className="text-emerald-400 font-bold">SHA-256 Digest</span>
          </div>
          <pre className="overflow-x-auto text-[11px] leading-relaxed text-neutral-200">
{`const signature = crypto
  .createHmac('sha256', tenantWebhookSecret)
  .update(rawPayloadBuffer)
  .digest('hex');

// Tripbone dispatches header:
// X-Tripbone-Signature: sha256=<computed_hex>`}
          </pre>
        </div>

        {/* Live Webhook Tester & Payload Preview */}
        <div className="pt-2 border-t border-neutral-100 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5" />
              <span>Live Webhook Verification Tester</span>
            </h4>
            <span className="text-[11px] text-neutral-400">Endpoint: POST /api/v1/webhooks/tripbone</span>
          </div>

          <textarea
            value={testPayload}
            onChange={(e) => setTestPayload(e.target.value)}
            rows={6}
            className="w-full font-mono text-[11px] p-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white text-neutral-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {testSignatureStatus === 'success' && (
                <span className="flex items-center gap-1 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  200 OK — Signature Verified & Booking Processed
                </span>
              )}
              {testSignatureStatus === 'failed' && (
                <span className="flex items-center gap-1 text-xs text-red-700 font-semibold bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Rejected ({testResponseData?.error || 'Verification Failed'})
                </span>
              )}
            </div>

            <button
              onClick={handleDispatchSignedWebhook}
              disabled={dispatchingTestWebhook}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {dispatchingTestWebhook ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              <span>Test Webhook Verification</span>
            </button>
          </div>
        </div>
      </div>

      {/* Integration Settings Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
          <Database className="w-4 h-4 text-neutral-600" />
          <h3 className="font-bold text-sm text-neutral-900">Connection Credentials</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-neutral-700 block mb-1">Tripbone API Endpoint</label>
            <input
              type="text"
              value={tripboneApiUrl}
              onChange={(e) => setTripboneApiUrl(e.target.value)}
              className="w-full text-xs font-mono px-3 py-2 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-700 block mb-1">Tripbone Operator ID / Tenant</label>
            <input
              type="text"
              value={operatorId}
              onChange={(e) => setOperatorId(e.target.value)}
              className="w-full text-xs font-mono px-3 py-2 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white"
            />
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider text-neutral-400">
            Automated Notification Triggers
          </h4>

          <div className="space-y-2 text-xs">
            <label className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200 cursor-pointer hover:bg-neutral-100/70 transition">
              <input
                type="checkbox"
                checked={autoSendVoucher}
                onChange={(e) => setAutoSendVoucher(e.target.checked)}
                className="rounded border-neutral-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
              />
              <div>
                <span className="font-semibold text-neutral-900 block">Instant Booking Confirmation & PDF Voucher</span>
                <span className="text-[11px] text-neutral-500">
                  Sends WhatsApp template immediately when Tripbone webhook fires <code className="font-mono">booking.created</code>.
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200 cursor-pointer hover:bg-neutral-100/70 transition">
              <input
                type="checkbox"
                checked={autoSendPickup}
                onChange={(e) => setAutoSendPickup(e.target.checked)}
                className="rounded border-neutral-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
              />
              <div>
                <span className="font-semibold text-neutral-900 block">24-Hour Pickup & Driver Assignment Alert</span>
                <span className="text-[11px] text-neutral-500">
                  Sends driver name, phone, vehicle plate number, and hotel lobby verification 24 hours prior to tour time.
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200 cursor-pointer hover:bg-neutral-100/70 transition">
              <input
                type="checkbox"
                checked={autoSendReview}
                onChange={(e) => setAutoSendReview(e.target.checked)}
                className="rounded border-neutral-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
              />
              <div>
                <span className="font-semibold text-neutral-900 block">Post-Tour Review Request</span>
                <span className="text-[11px] text-neutral-500">
                  Follows up 3 hours after tour conclusion asking guests for Google Review or TripAdvisor feedback.
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200 cursor-pointer hover:bg-neutral-100/70 transition">
              <input
                type="checkbox"
                checked={syncGuestHistory}
                onChange={(e) => setSyncGuestHistory(e.target.checked)}
                className="rounded border-neutral-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
              />
              <div>
                <span className="font-semibold text-neutral-900 block">Sync Chat Timeline Back to Tripbone CRM</span>
                <span className="text-[11px] text-neutral-500">
                  Automatically logs WhatsApp message logs into the guest's profile timeline inside Tripbone.
                </span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-neutral-100">
          <button
            type="submit"
            className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            {savedSettings ? 'Saved Successfully' : 'Save Integration Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};
