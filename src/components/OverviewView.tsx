import React from 'react';
import { Tenant, MetricsData } from '../types';
import { 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  Users, 
  ArrowUpRight, 
  Zap, 
  Smartphone, 
  Radio, 
  ShieldCheck, 
  Activity,
  Calendar
} from 'lucide-react';

interface OverviewViewProps {
  tenant: Tenant;
  metrics: MetricsData;
  onNavigateToInbox: () => void;
  onNavigateToQr: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  tenant,
  metrics,
  onNavigateToInbox,
  onNavigateToQr,
}) => {
  const isConnected = tenant.whatsappAccount.status === 'connected';

  // Sample hourly message distribution for visual bar chart
  const hourlyData = [
    { hour: '06:00', inbound: 12, outbound: 45 },
    { hour: '08:00', inbound: 48, outbound: 85 },
    { hour: '10:00', inbound: 92, outbound: 130 },
    { hour: '12:00', inbound: 75, outbound: 95 },
    { hour: '14:00', inbound: 110, outbound: 160 },
    { hour: '16:00', inbound: 85, outbound: 125 },
    { hour: '18:00', inbound: 64, outbound: 90 },
    { hour: '20:00', inbound: 42, outbound: 60 },
  ];

  const maxTotal = 270;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Top Welcome & Health */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">{tenant.name}</h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-neutral-100 text-neutral-700">
              {tenant.plan} Plan
            </span>
          </div>
          <p className="text-sm text-neutral-500 mt-1">
            Dedicated multi-tenant instance for WhatsApp messaging, CRM sync, and workflow automations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToQr}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium border flex items-center gap-2 transition cursor-pointer shadow-xs ${
              isConnected
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800 animate-pulse'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span>{isConnected ? 'WhatsApp Gateway Connected' : 'Action Required: Scan QR Code'}</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Messages Today */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Messages Today</span>
            <MessageSquare className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 tracking-tight">
            {metrics.totalMessagesToday.toLocaleString()}
          </div>
          <div className="text-[11px] text-neutral-500 flex items-center gap-1.5">
            <span className="text-emerald-600 font-semibold">{metrics.inboundToday} In</span>
            <span>•</span>
            <span className="text-blue-600 font-semibold">{metrics.outboundToday} Out</span>
          </div>
        </div>

        {/* Delivery Rate */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Delivery Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 tracking-tight">
            {metrics.deliveryRate}%
          </div>
          <div className="text-[11px] text-neutral-500 flex items-center gap-1">
            <span className="text-emerald-600 font-semibold">99.8%</span> socket uptime
          </div>
        </div>

        {/* Avg Response Time */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Response Time</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 tracking-tight">
            {metrics.avgResponseMinutes} min
          </div>
          <div className="text-[11px] text-neutral-500">
            Automations reply in <strong className="text-neutral-700">~1.2 sec</strong>
          </div>
        </div>

        {/* Active Chats */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Conversations</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 tracking-tight">
            {metrics.activeChatsCount}
          </div>
          <button
            onClick={onNavigateToInbox}
            className="text-[11px] text-emerald-700 font-medium hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Open live inbox</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Message Volume Visual Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Volume Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Hourly Message Traffic</h3>
              <p className="text-xs text-neutral-400">Inbound inquiries vs outbound automated tour alerts</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> Inbound
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span> Outbound (API & Workflows)
              </span>
            </div>
          </div>

          {/* Clean CSS Bars */}
          <div className="pt-6 h-52 flex items-end justify-between gap-3 border-b border-neutral-100 pb-2">
            {hourlyData.map((d, i) => {
              const inboundH = (d.inbound / maxTotal) * 100;
              const outboundH = (d.outbound / maxTotal) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                  <div className="w-full max-w-[28px] flex items-end gap-1 h-full justify-center">
                    <div
                      style={{ height: `${inboundH}%` }}
                      className="w-3 bg-emerald-500 rounded-t-sm group-hover:bg-emerald-600 transition"
                      title={`Inbound: ${d.inbound}`}
                    />
                    <div
                      style={{ height: `${outboundH}%` }}
                      className="w-3 bg-blue-500 rounded-t-sm group-hover:bg-blue-600 transition"
                      title={`Outbound: ${d.outbound}`}
                    />
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono mt-1">{d.hour}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* WhatsApp Gateway Instance Status */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900">Instance Gateway Health</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Optimal
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <span className="text-neutral-500">Socket Protocol</span>
              <span className="font-mono text-neutral-800">Baileys WebSocket v6.7</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <span className="text-neutral-500">Host Node</span>
              <span className="font-mono text-neutral-800">cluster-asia-east1</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <span className="text-neutral-500">Memory Allocation</span>
              <span className="font-mono text-neutral-800">74 MB / 256 MB</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <span className="text-neutral-500">Anti-Ban Pacing</span>
              <span className="text-emerald-700 font-medium">Jitter (2-4s interval)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-500">External Tripbone Link</span>
              <span className="text-purple-700 font-medium">Connected (v1.2)</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onNavigateToQr}
              className="w-full py-2 px-3 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium transition cursor-pointer"
            >
              Manage WhatsApp Phone Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
