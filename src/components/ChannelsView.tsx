import React, { useState, useEffect } from 'react';
import { 
  WhapiChannel, 
  Tenant 
} from '../types';
import { 
  Plus, 
  Smartphone, 
  QrCode, 
  Key, 
  RefreshCw, 
  CheckCircle2, 
  Flame, 
  Zap, 
  Copy, 
  Check, 
  ExternalLink, 
  Trash2, 
  Power,
  BatteryCharging,
  Sliders,
  Terminal,
  ShieldCheck,
  AlertCircle,
  Clock,
  Sparkles,
  X
} from 'lucide-react';

interface ChannelsViewProps {
  channels: WhapiChannel[];
  activeChannelId?: string;
  currentTenant?: Tenant;
  onSelectChannel: (channelId: string) => void;
  onAddChannel: (newChannel: WhapiChannel) => void;
  onUpdateChannel: (updatedChannel: WhapiChannel) => void;
  onDeleteChannel?: (channelId: string) => void;
  onRefreshChannel?: (channelId: string) => void;
  onOpenQrPairing?: (channel: WhapiChannel) => void;
  onOpenApiExplorer?: () => void;
}

export const ChannelsView: React.FC<ChannelsViewProps> = ({
  channels,
  activeChannelId,
  currentTenant,
  onSelectChannel,
  onAddChannel,
  onUpdateChannel,
  onDeleteChannel,
  onRefreshChannel,
  onOpenQrPairing,
  onOpenApiExplorer,
}) => {
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelType, setNewChannelType] = useState<'business' | 'personal' | 'sandbox'>('business');
  const [pairingMethod, setPairingMethod] = useState<'qr' | 'code'>('qr');
  const [pairingPhoneNumber, setPairingPhoneNumber] = useState('');
  const [generatedPairingCode, setGeneratedPairingCode] = useState<string | null>(null);
  const [selectedChannelForConfig, setSelectedChannelForConfig] = useState<WhapiChannel | null>(null);

  // Dedicated QR Pairing Modal State
  const [selectedChannelForQr, setSelectedChannelForQr] = useState<WhapiChannel | null>(null);
  const [qrCountdown, setQrCountdown] = useState(45);
  const [qrPairingMethod, setQrPairingMethod] = useState<'qr' | 'code'>('qr');
  const [qrPhoneInput, setQrPhoneInput] = useState('');
  const [qrGeneratedOtp, setQrGeneratedOtp] = useState<string | null>(null);
  const [isPairingSuccess, setIsPairingSuccess] = useState(false);

  // Countdown timer for QR code
  useEffect(() => {
    let timer: any;
    if (selectedChannelForQr && qrCountdown > 0) {
      timer = setInterval(() => setQrCountdown((prev) => prev - 1), 1000);
    } else if (qrCountdown === 0) {
      setQrCountdown(45);
    }
    return () => clearInterval(timer);
  }, [selectedChannelForQr, qrCountdown]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTokenId(id);
    setTimeout(() => setCopiedTokenId(null), 2000);
  };

  const handleGeneratePairingCode = () => {
    if (!pairingPhoneNumber) return;
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code1 = '';
    let code2 = '';
    for (let i = 0; i < 4; i++) code1 += chars.charAt(Math.floor(Math.random() * chars.length));
    for (let i = 0; i < 4; i++) code2 += chars.charAt(Math.floor(Math.random() * chars.length));
    setGeneratedPairingCode(`${code1}-${code2}`);
  };

  const handleCreateChannel = () => {
    if (!newChannelName.trim()) return;
    const randomHex = Math.random().toString(16).substring(2, 8);
    const newChan: WhapiChannel = {
      id: `ch_whapi_${randomHex}`,
      name: newChannelName.trim(),
      phoneNumber: pairingPhoneNumber || '+62 813-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000),
      formattedJid: `${pairingPhoneNumber.replace(/[^0-9]/g, '') || '628130000000'}@s.whatsapp.net`,
      status: 'active',
      type: newChannelType,
      apiKey: `whapi_live_${Math.random().toString(36).substring(2, 14)}${Math.random().toString(36).substring(2, 14)}`,
      webhookUrl: 'https://api.yourdomain.com/whapi/webhook',
      dailyMessagesSent: 0,
      dailyLimit: newChannelType === 'sandbox' ? 150 : 2500,
      warmupDay: 1,
      warmupStatus: 'in_progress',
      batteryLevel: 98,
      isPlugged: true,
      linkedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      autoReconnect: true,
      simulateTyping: true,
    };
    onAddChannel(newChan);
    setShowAddModal(false);
    setNewChannelName('');
    setPairingPhoneNumber('');
    setGeneratedPairingCode(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Whapi Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold tracking-wide uppercase">
              Whapi.Cloud Gateway
            </span>
            <span className="text-xs text-neutral-400">• Multi-Device Cloud Sockets</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mt-1">WhatsApp Channels & Instances</h1>
          <p className="text-sm text-neutral-600 mt-1 max-w-2xl">
            Each channel represents an active WhatsApp phone number instance. Connect via QR code or 8-digit OTP pairing code, generate dedicated API tokens, and monitor real-time message quotas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenApiExplorer}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 text-sm font-medium transition cursor-pointer shadow-xs"
          >
            <Terminal className="w-4 h-4 text-neutral-500" />
            <span>Open API Explorer</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Channel</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Channels</span>
            <Smartphone className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900">{channels.length}</div>
          <div className="text-xs text-neutral-500 mt-1">
            {channels.filter(c => c.status === 'active').length} connected & active
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Daily Quota Usage</span>
            <Zap className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900">
            {channels.reduce((acc, c) => acc + c.dailyMessagesSent, 0).toLocaleString()} <span className="text-xs font-normal text-neutral-500">/ {channels.reduce((acc, c) => acc + c.dailyLimit, 0).toLocaleString()}</span>
          </div>
          <div className="w-full bg-neutral-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div 
              className="bg-blue-600 h-1.5 rounded-full"
              style={{ width: `${Math.min(100, Math.round((channels.reduce((acc, c) => acc + c.dailyMessagesSent, 0) / Math.max(1, channels.reduce((acc, c) => acc + c.dailyLimit, 0))) * 100))}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Number Warming</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-neutral-900">
            {channels.filter(c => c.warmupStatus === 'in_progress').length} Warming
          </div>
          <div className="text-xs text-amber-700 mt-1 font-medium">
            Anti-ban pacing active
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Gateway Model</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-neutral-900">
            $35 / mo <span className="text-xs font-normal text-neutral-500">per channel</span>
          </div>
          <div className="text-xs text-emerald-700 mt-1">
            Zero per-message fees • Unlimited
          </div>
        </div>
      </div>

      {/* Channel Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {channels.map((channel) => {
          const isCurrentActive = channel.id === activeChannelId;
          const quotaPercent = Math.min(100, Math.round((channel.dailyMessagesSent / channel.dailyLimit) * 100));

          return (
            <div 
              key={channel.id}
              className={`bg-white rounded-2xl border transition-all duration-200 shadow-xs flex flex-col justify-between ${
                isCurrentActive ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="p-6">
                {/* Header info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-neutral-900">{channel.name}</h3>
                        {channel.type === 'sandbox' && (
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 rounded-md">
                            Sandbox
                          </span>
                        )}
                        {channel.type === 'business' && (
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 rounded-md">
                            Business
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono text-neutral-500 mt-0.5">{channel.phoneNumber}</div>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div>
                    {channel.status === 'active' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Active
                      </span>
                    )}
                    {channel.status === 'warming' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <Flame className="w-3.5 h-3.5 text-amber-500" />
                        Day {channel.warmupDay}
                      </span>
                    )}
                    {channel.status === 'disconnected' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                        <Power className="w-3.5 h-3.5" />
                        Offline
                      </span>
                    )}
                  </div>
                </div>

                {/* Channel Details */}
                <div className="mt-5 space-y-3 pt-4 border-t border-neutral-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500">Channel ID</span>
                    <span className="font-mono text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded">{channel.id}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500">API Token</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-neutral-600 text-[11px] truncate max-w-[140px]">
                        {channel.apiKey.substring(0, 16)}...
                      </span>
                      <button
                        onClick={() => handleCopy(channel.apiKey, channel.id)}
                        className="p-1 hover:bg-neutral-100 rounded text-neutral-500 hover:text-neutral-800 transition cursor-pointer"
                        title="Copy API Token"
                      >
                        {copiedTokenId === channel.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500">Device State</span>
                    <div className="flex items-center gap-1.5 text-neutral-700">
                      <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{channel.batteryLevel}% {channel.isPlugged ? '(Charging)' : ''}</span>
                    </div>
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-500">Daily Quota</span>
                      <span className="font-medium text-neutral-800">
                        {channel.dailyMessagesSent.toLocaleString()} / {channel.dailyLimit.toLocaleString()} msgs ({quotaPercent}%)
                      </span>
                    </div>
                    <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-1.5 rounded-full ${quotaPercent > 85 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${quotaPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="bg-neutral-50 p-4 border-t border-neutral-100 rounded-b-2xl flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectChannel(channel.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    isCurrentActive
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {isCurrentActive ? '✓ Active Channel' : 'Select Channel'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedChannelForQr(channel);
                      setQrPhoneInput(channel.phoneNumber || '');
                      setQrCountdown(45);
                      setIsPairingSuccess(false);
                      setQrGeneratedOtp(null);
                      if (onOpenQrPairing) onOpenQrPairing(channel);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-700 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold shadow-2xs"
                    title="Link or Re-scan QR Code"
                  >
                    <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Link QR</span>
                  </button>

                  <button
                    onClick={() => setSelectedChannelForConfig(channel)}
                    className="p-1.5 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 transition cursor-pointer"
                    title="Channel Settings"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Channel Settings Modal */}
      {selectedChannelForConfig && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-neutral-200">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <h3 className="text-lg font-bold text-neutral-900">
                Channel Settings: {selectedChannelForConfig.name}
              </h3>
              <button
                onClick={() => setSelectedChannelForConfig(null)}
                className="text-neutral-400 hover:text-neutral-700 text-xl font-bold cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 py-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Webhook URL</label>
                <input
                  type="text"
                  value={selectedChannelForConfig.webhookUrl}
                  onChange={(e) => setSelectedChannelForConfig({ ...selectedChannelForConfig, webhookUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Daily Sending Limit</label>
                <input
                  type="number"
                  value={selectedChannelForConfig.dailyLimit}
                  onChange={(e) => setSelectedChannelForConfig({ ...selectedChannelForConfig, dailyLimit: parseInt(e.target.value) || 500 })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedChannelForConfig.simulateTyping}
                    onChange={(e) => setSelectedChannelForConfig({ ...selectedChannelForConfig, simulateTyping: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-neutral-700">Simulate human typing indicator before message delivery</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedChannelForConfig.autoReconnect}
                    onChange={(e) => setSelectedChannelForConfig({ ...selectedChannelForConfig, autoReconnect: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-neutral-700">Auto-reconnect WhatsApp socket if disconnected</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
              <button
                onClick={() => setSelectedChannelForConfig(null)}
                className="px-4 py-2 rounded-lg border border-neutral-200 text-neutral-600 text-xs font-medium hover:bg-neutral-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onUpdateChannel(selectedChannelForConfig);
                  setSelectedChannelForConfig(null);
                }}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Channel Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-neutral-200">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Add WhatsApp Channel</h3>
                <p className="text-xs text-neutral-500">Connect a new phone number to your Whapi gateway</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-neutral-700 text-xl font-bold cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 py-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Channel Label / Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sales WhatsApp or Customer Care"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Channel Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewChannelType('business')}
                    className={`p-2.5 rounded-lg border text-xs font-medium transition text-center cursor-pointer ${
                      newChannelType === 'business' ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    Business Line
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewChannelType('personal')}
                    className={`p-2.5 rounded-lg border text-xs font-medium transition text-center cursor-pointer ${
                      newChannelType === 'personal' ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    Personal Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewChannelType('sandbox')}
                    className={`p-2.5 rounded-lg border text-xs font-medium transition text-center cursor-pointer ${
                      newChannelType === 'sandbox' ? 'border-purple-600 bg-purple-50 text-purple-800 font-semibold' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    Free Sandbox
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Pairing Method</label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setPairingMethod('qr')}
                    className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition cursor-pointer ${
                      pairingMethod === 'qr' ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>QR Code Scan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPairingMethod('code')}
                    className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition cursor-pointer ${
                      pairingMethod === 'code' ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <Key className="w-4 h-4" />
                    <span>8-Digit Phone Code</span>
                  </button>
                </div>

                {pairingMethod === 'code' && (
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                    <label className="block text-xs font-medium text-neutral-600">WhatsApp Phone Number with Country Code</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="+62 812 3456 7890"
                        value={pairingPhoneNumber}
                        onChange={(e) => setPairingPhoneNumber(e.target.value)}
                        className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleGeneratePairingCode}
                        className="px-3 py-2 bg-neutral-800 hover:bg-neutral-900 text-white rounded-lg text-xs font-medium transition cursor-pointer"
                      >
                        Get Code
                      </button>
                    </div>

                    {generatedPairingCode && (
                      <div className="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-center">
                        <span className="text-[11px] text-emerald-700 block">Enter this code in WhatsApp &gt; Linked Devices &gt; Link with phone number:</span>
                        <div className="text-xl font-mono font-bold tracking-widest text-emerald-900 mt-1">
                          {generatedPairingCode}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-lg border border-neutral-200 text-neutral-600 text-xs font-medium hover:bg-neutral-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateChannel}
                disabled={!newChannelName.trim()}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-300 text-white text-xs font-semibold transition cursor-pointer shadow-xs"
              >
                Connect Channel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive QR Code & OTP Pairing Modal */}
      {selectedChannelForQr && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div>
                <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  Link WhatsApp: {selectedChannelForQr.name}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">Scan to connect WhatsApp multi-device session</p>
              </div>
              <button
                onClick={() => setSelectedChannelForQr(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              {/* Toggle QR vs Code */}
              <div className="grid grid-cols-2 gap-2 bg-neutral-100 p-1 rounded-xl">
                <button
                  onClick={() => setQrPairingMethod('qr')}
                  className={`py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    qrPairingMethod === 'qr' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                  <span>QR Code Scan</span>
                </button>
                <button
                  onClick={() => setQrPairingMethod('code')}
                  className={`py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    qrPairingMethod === 'code' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  <Key className="w-3.5 h-3.5 text-emerald-600" />
                  <span>8-Digit Phone Code</span>
                </button>
              </div>

              {qrPairingMethod === 'qr' ? (
                <div className="flex flex-col items-center justify-center py-2 space-y-3">
                  {isPairingSuccess ? (
                    <div className="py-8 text-center space-y-3">
                      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h4 className="text-base font-bold text-neutral-900">WhatsApp Device Linked!</h4>
                      <p className="text-xs text-neutral-500">Instance session active and ready to send & receive messages.</p>
                    </div>
                  ) : (
                    <>
                      <div className="p-4 bg-white rounded-2xl border-2 border-emerald-500 shadow-md relative">
                        {/* Clean SVG QR Code */}
                        <svg className="w-52 h-52" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="100" height="100" fill="#FFFFFF" />
                          {/* Finder Patterns */}
                          <rect x="10" y="10" width="24" height="24" rx="3" fill="#111827" />
                          <rect x="14" y="14" width="16" height="16" rx="2" fill="#FFFFFF" />
                          <rect x="18" y="18" width="8" height="8" fill="#111827" />

                          <rect x="66" y="10" width="24" height="24" rx="3" fill="#111827" />
                          <rect x="70" y="14" width="16" height="16" rx="2" fill="#FFFFFF" />
                          <rect x="74" y="18" width="8" height="8" fill="#111827" />

                          <rect x="10" y="66" width="24" height="24" rx="3" fill="#111827" />
                          <rect x="14" y="70" width="16" height="16" rx="2" fill="#FFFFFF" />
                          <rect x="18" y="74" width="8" height="8" fill="#111827" />

                          {/* Data Pattern */}
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
                          <div className="w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center border border-neutral-200">
                            <Smartphone className="w-4 h-4 text-emerald-600" />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>Expires in: </span>
                        <span className="font-mono font-bold text-neutral-900">{qrCountdown}s</span>
                        <button
                          onClick={() => setQrCountdown(45)}
                          className="ml-2 text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 font-semibold cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" /> Refresh
                        </button>
                      </div>

                      <div className="text-[11px] text-neutral-500 text-center max-w-xs space-y-1">
                        <p>1. Open WhatsApp on phone &gt; <strong>Linked Devices</strong></p>
                        <p>2. Tap <strong>Link a Device</strong> and point camera here</p>
                      </div>

                      <button
                        onClick={() => {
                          setIsPairingSuccess(true);
                          onUpdateChannel({
                            ...selectedChannelForQr,
                            status: 'active',
                            batteryLevel: 96,
                            isPlugged: true,
                            linkedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
                          });
                          setTimeout(() => setSelectedChannelForQr(null), 1500);
                        }}
                        className="w-full mt-2 py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Device Linked</span>
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-3 py-2">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">WhatsApp Phone Number</label>
                    <input
                      type="text"
                      value={qrPhoneInput}
                      onChange={(e) => setQrPhoneInput(e.target.value)}
                      placeholder="+62 812-3456-7890"
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (!qrPhoneInput) return;
                      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
                      let c1 = '', c2 = '';
                      for (let i = 0; i < 4; i++) c1 += chars.charAt(Math.floor(Math.random() * chars.length));
                      for (let i = 0; i < 4; i++) c2 += chars.charAt(Math.floor(Math.random() * chars.length));
                      setQrGeneratedOtp(`${c1}-${c2}`);
                    }}
                    className="w-full py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Get 8-Digit Pairing Code</span>
                  </button>

                  {qrGeneratedOtp && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                      <div className="text-xs text-neutral-600">Enter this code in WhatsApp:</div>
                      <div className="font-mono text-xl font-bold tracking-widest text-emerald-800 bg-white py-2 rounded-lg border border-emerald-200 shadow-2xs">
                        {qrGeneratedOtp}
                      </div>
                      <p className="text-[11px] text-neutral-500">
                        Phone &gt; Linked Devices &gt; Link with phone number instead
                      </p>
                      <button
                        onClick={() => {
                          setIsPairingSuccess(true);
                          onUpdateChannel({
                            ...selectedChannelForQr,
                            phoneNumber: qrPhoneInput || selectedChannelForQr.phoneNumber,
                            status: 'active',
                            batteryLevel: 94,
                            isPlugged: true,
                            linkedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
                          });
                          setTimeout(() => setSelectedChannelForQr(null), 1200);
                        }}
                        className="w-full py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold cursor-pointer"
                      >
                        Confirm Linked
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
