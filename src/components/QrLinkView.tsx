import React, { useState, useEffect } from 'react';
import { Tenant, WhatsAppAccount } from '../types';
import { 
  QrCode, 
  Smartphone, 
  BatteryCharging, 
  Battery, 
  RefreshCw, 
  Unlink, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight,
  Zap,
  Radio,
  Clock,
  Sparkles
} from 'lucide-react';

interface QrLinkViewProps {
  tenant: Tenant;
  onUpdateAccount: (updatedAccount: WhatsAppAccount) => void;
}

export const QrLinkView: React.FC<QrLinkViewProps> = ({
  tenant,
  onUpdateAccount,
}) => {
  const account = tenant.whatsappAccount;
  const isConnected = account.status === 'connected';

  const [qrStep, setQrStep] = useState<'idle' | 'generating' | 'ready' | 'pairing'>('idle');
  const [countdown, setCountdown] = useState(45);
  const [simulatedPhone, setSimulatedPhone] = useState('+62 812-3456-7890');
  const [simulatedName, setSimulatedName] = useState(tenant.name);
  const [pingStatus, setPingStatus] = useState<string | null>(null);

  // Countdown for QR expiration
  useEffect(() => {
    let timer: any;
    if (qrStep === 'ready' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0 && qrStep === 'ready') {
      // Auto regenerate or set expired
      setCountdown(45);
    }
    return () => clearInterval(timer);
  }, [qrStep, countdown]);

  const handleStartQr = () => {
    setQrStep('generating');
    setTimeout(() => {
      setQrStep('ready');
      setCountdown(45);
    }, 1200);
  };

  const handleSimulateScan = () => {
    setQrStep('pairing');
    setTimeout(() => {
      const now = new Date();
      onUpdateAccount({
        status: 'connected',
        phoneNumber: simulatedPhone,
        pushName: simulatedName,
        batteryLevel: 92,
        isPlugged: true,
        linkedAt: now.toLocaleTimeString() + ' Today',
        platform: 'WhatsApp Multi-Device (Baileys Engine)',
      });
      setQrStep('idle');
    }, 2200);
  };

  const handleDisconnect = () => {
    if (confirm('Are you sure you want to unlink this WhatsApp account? Outbound and inbound messages will pause until re-linked.')) {
      onUpdateAccount({
        status: 'disconnected',
      });
      setQrStep('idle');
    }
  };

  const handleTestPing = () => {
    setPingStatus('Sending keep-alive ping to WhatsApp Socket...');
    setTimeout(() => {
      setPingStatus('ACK Received: Socket latency 42ms. Session healthy.');
      setTimeout(() => setPingStatus(null), 4000);
    }, 800);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">WhatsApp QR Account Linker</h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-neutral-100 text-neutral-700">
              Multi-Device Session
            </span>
          </div>
          <p className="text-sm text-neutral-500 mt-1">
            Connect your business WhatsApp number instantly via QR code without official Meta Business API verification.
          </p>
        </div>

        {isConnected && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleTestPing}
              className="px-3 py-2 rounded-lg border border-neutral-200 bg-white text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-600" />
              <span>Test Connection Latency</span>
            </button>
            <button
              onClick={handleDisconnect}
              className="px-3 py-2 rounded-lg border border-rose-200 bg-rose-50 text-xs font-medium text-rose-700 hover:bg-rose-100 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Unlink className="w-3.5 h-3.5" />
              <span>Unlink Number</span>
            </button>
          </div>
        )}
      </div>

      {pingStatus && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{pingStatus}</span>
          </div>
        </div>
      )}

      {/* Main Connection Container */}
      {!isConnected ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Interactive QR Box */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-neutral-200 p-8 shadow-xs flex flex-col items-center justify-center text-center relative overflow-hidden">
            {qrStep === 'idle' && (
              <div className="space-y-4 py-8 max-w-sm">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                  <QrCode className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">Link WhatsApp Account</h3>
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                    Generate an encrypted multi-device QR code to link your business phone with this tenant workspace.
                  </p>
                </div>
                <button
                  id="generate-qr-btn"
                  onClick={handleStartQr}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Instant QR Code</span>
                </button>
              </div>
            )}

            {qrStep === 'generating' && (
              <div className="space-y-4 py-16">
                <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
                <div className="text-sm font-medium text-neutral-700">
                  Initializing Baileys Socket session...
                </div>
                <p className="text-xs text-neutral-400">Allocating dedicated tenant channel in Redis...</p>
              </div>
            )}

            {qrStep === 'ready' && (
              <div className="space-y-4 py-2 w-full max-w-sm flex flex-col items-center">
                <div className="relative p-4 bg-white rounded-2xl border-2 border-emerald-500 shadow-md">
                  {/* Visual Realistic QR SVG */}
                  <svg className="w-60 h-60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Background */}
                    <rect width="100" height="100" fill="#FFFFFF" />
                    {/* Outer corners */}
                    <rect x="10" y="10" width="24" height="24" rx="3" fill="#111827" />
                    <rect x="14" y="14" width="16" height="16" rx="2" fill="#FFFFFF" />
                    <rect x="18" y="18" width="8" height="8" fill="#111827" />

                    <rect x="66" y="10" width="24" height="24" rx="3" fill="#111827" />
                    <rect x="70" y="14" width="16" height="16" rx="2" fill="#FFFFFF" />
                    <rect x="74" y="18" width="8" height="8" fill="#111827" />

                    <rect x="10" y="66" width="24" height="24" rx="3" fill="#111827" />
                    <rect x="14" y="70" width="16" height="16" rx="2" fill="#FFFFFF" />
                    <rect x="18" y="74" width="8" height="8" fill="#111827" />

                    {/* Realistic matrix data blocks */}
                    <rect x="40" y="12" width="6" height="6" fill="#111827" />
                    <rect x="52" y="12" width="6" height="6" fill="#111827" />
                    <rect x="40" y="24" width="18" height="6" fill="#111827" />
                    <rect x="12" y="40" width="12" height="6" fill="#111827" />
                    <rect x="30" y="40" width="6" height="18" fill="#111827" />
                    <rect x="42" y="36" width="14" height="14" rx="2" fill="#059669" />
                    <rect x="62" y="40" width="12" height="6" fill="#111827" />
                    <rect x="80" y="40" width="8" height="12" fill="#111827" />
                    <rect x="12" y="52" width="12" height="8" fill="#111827" />
                    <rect x="40" y="56" width="8" height="8" fill="#111827" />
                    <rect x="54" y="56" width="14" height="8" fill="#111827" />
                    <rect x="40" y="70" width="14" height="6" fill="#111827" />
                    <rect x="60" y="70" width="8" height="18" fill="#111827" />
                    <rect x="74" y="70" width="14" height="6" fill="#111827" />
                    <rect x="40" y="82" width="6" height="8" fill="#111827" />
                    <rect x="52" y="82" width="20" height="6" fill="#111827" />
                  </svg>

                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center border border-neutral-200">
                      <Smartphone className="w-5 h-5 text-emerald-600" />
                    </div>
                  </div>
                </div>

                {/* Expiration Timer */}
                <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>QR code expires in </span>
                  <span className="font-mono font-bold text-neutral-800">{countdown}s</span>
                </div>

                {/* Instant Simulator Control */}
                <div className="w-full bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-2 mt-2">
                  <div className="text-left text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Instant Demo Simulator</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-left">
                    <div>
                      <label className="text-[10px] text-neutral-400 uppercase font-semibold">Test Phone</label>
                      <input
                        type="text"
                        value={simulatedPhone}
                        onChange={(e) => setSimulatedPhone(e.target.value)}
                        className="w-full text-xs font-mono px-2 py-1 bg-white border border-neutral-200 rounded"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 uppercase font-semibold">Business Name</label>
                      <input
                        type="text"
                        value={simulatedName}
                        onChange={(e) => setSimulatedName(e.target.value)}
                        className="w-full text-xs px-2 py-1 bg-white border border-neutral-200 rounded"
                      />
                    </div>
                  </div>
                  <button
                    id="simulate-scan-btn"
                    onClick={handleSimulateScan}
                    className="w-full mt-2 py-2 px-3 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Simulate Mobile Scan & Confirm</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {qrStep === 'pairing' && (
              <div className="space-y-4 py-16">
                <div className="relative flex h-10 w-10 mx-auto">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-10 w-10 bg-emerald-600 items-center justify-center text-white">
                    <CheckCircle2 className="w-6 h-6" />
                  </span>
                </div>
                <div className="text-sm font-semibold text-neutral-900">
                  Establishing WhatsApp Multi-Device Session...
                </div>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                  Exchanging Noise-protocol keys and generating durable auth tokens in Redis.
                </p>
              </div>
            )}
          </div>

          {/* Right: Setup Instructions & Protocol details */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
              <h3 className="font-semibold text-neutral-900 text-sm">How to link on your phone:</h3>
              
              <ol className="space-y-3.5 text-xs text-neutral-600">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-neutral-100 text-neutral-700 flex items-center justify-center font-bold text-[11px] shrink-0">
                    1
                  </span>
                  <span>Open <strong>WhatsApp</strong> on your mobile device (Standard or WhatsApp Business).</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-neutral-100 text-neutral-700 flex items-center justify-center font-bold text-[11px] shrink-0">
                    2
                  </span>
                  <span>Tap <strong>Menu</strong> (Android: 3 dots) or <strong>Settings</strong> (iPhone).</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-neutral-100 text-neutral-700 flex items-center justify-center font-bold text-[11px] shrink-0">
                    3
                  </span>
                  <span>Select <strong>Linked Devices</strong>, then tap <strong>Link a Device</strong>.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-neutral-100 text-neutral-700 flex items-center justify-center font-bold text-[11px] shrink-0">
                    4
                  </span>
                  <span>Point your phone camera at the QR code on the left to complete pairing.</span>
                </li>
              </ol>
            </div>

            <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Multi-Tenant Architecture Guarantee</span>
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Sessions are isolated per tenant ID. Your encryption keys and device tokens are stored securely in memory with automatic reconnect workers.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Connected State Details */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Account Card */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-neutral-100 border border-neutral-200 overflow-hidden flex items-center justify-center text-neutral-400">
                  {account.profilePic ? (
                    <img src={account.profilePic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <Smartphone className="w-8 h-8 text-emerald-600" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-neutral-900">{account.pushName || tenant.name}</h2>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active Session
                    </span>
                  </div>
                  <p className="font-mono text-sm text-neutral-600 mt-0.5">{account.phoneNumber}</p>
                  <p className="text-xs text-neutral-400 mt-1">Linked: {account.linkedAt}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-neutral-100">
              <div className="p-3 bg-neutral-50 rounded-xl">
                <div className="text-[10px] uppercase font-semibold text-neutral-400">Battery Status</div>
                <div className="flex items-center gap-1.5 mt-1 font-semibold text-neutral-800 text-sm">
                  {account.isPlugged ? (
                    <BatteryCharging className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Battery className="w-4 h-4 text-neutral-600" />
                  )}
                  <span>{account.batteryLevel}% {account.isPlugged ? '(Charging)' : ''}</span>
                </div>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl">
                <div className="text-[10px] uppercase font-semibold text-neutral-400">Platform</div>
                <div className="mt-1 font-semibold text-neutral-800 text-sm truncate">
                  Baileys Multi-Device
                </div>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl">
                <div className="text-[10px] uppercase font-semibold text-neutral-400">Socket Latency</div>
                <div className="mt-1 font-semibold text-emerald-600 text-sm">
                  42 ms (Healthy)
                </div>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl">
                <div className="text-[10px] uppercase font-semibold text-neutral-400">Auto Reconnect</div>
                <div className="mt-1 font-semibold text-neutral-800 text-sm">
                  Enabled (24/7)
                </div>
              </div>
            </div>
          </div>

          {/* Quick Diagnostics */}
          <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-6 space-y-4">
            <h3 className="font-semibold text-neutral-900 text-sm">Session Diagnostics</h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                <span className="text-neutral-500">Instance ID</span>
                <span className="font-mono text-neutral-800">{tenant.id}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                <span className="text-neutral-500">Protocol</span>
                <span className="text-neutral-800 font-medium">WhatsApp Web v2.3000.x</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                <span className="text-neutral-500">Auth Store</span>
                <span className="text-emerald-700 font-medium">Redis multi-device credentials</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Webhook Forwarding</span>
                <span className="text-emerald-700 font-medium">100% Active</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleDisconnect}
                className="w-full py-2 px-3 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-700 text-xs font-medium transition cursor-pointer"
              >
                Disconnect / Switch Phone Number
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
