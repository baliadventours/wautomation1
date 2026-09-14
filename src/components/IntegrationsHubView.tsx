import React, { useState } from 'react';
import { Tenant } from '../types';
import { 
  Cable, 
  Key, 
  ShoppingBag, 
  Sparkles, 
  ArrowUpRight, 
  CheckCircle2, 
  Compass, 
  Share2, 
  FileSpreadsheet, 
  ExternalLink,
  ShieldCheck,
  Settings2,
  Lock
} from 'lucide-react';

interface IntegrationsHubViewProps {
  currentTenant: Tenant;
  onOpenTripbone: () => void;
  onOpenApiConsole: () => void;
  onToggleTripbone: () => void;
}

export const IntegrationsHubView: React.FC<IntegrationsHubViewProps> = ({
  currentTenant,
  onOpenTripbone,
  onOpenApiConsole,
  onToggleTripbone,
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Toast */}
      {toastMessage && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-800 rounded-2xl text-xs text-emerald-200 flex items-center gap-2 animate-fade-in">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Integrations & Connectors Hub</h1>
        <p className="text-xs text-neutral-400">
          Connect your WhatsApp workspace to external reservation systems, e-commerce stores, and custom APIs
        </p>
      </div>

      {/* Featured: Dedicated Tripbone Tour Connector */}
      <div className="bg-neutral-900 rounded-3xl border border-purple-900/60 p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
                DEDICATED TRAVEL & TOUR SUITE
              </span>
              {currentTenant.tripboneEnabled ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>CONNECTED</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-800 text-neutral-400">
                  AVAILABLE
                </span>
              )}
            </div>

            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <span>Tripbone Booking Synchronization</span>
              <Cable className="w-6 h-6 text-purple-400" />
            </h2>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Our first-class dedicated integration for tour operators, excursions, and travel companies. Automatically ingests confirmed bookings, generates instant PDF ticket vouchers, coordinates private driver and hotel pickup passes, and triggers post-excursion review collection engines.
            </p>

            <div className="flex flex-wrap gap-4 pt-1 text-xs text-neutral-400">
              <span className="flex items-center gap-1 text-neutral-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> HMAC-SHA256 Webhook Sync
              </span>
              <span className="flex items-center gap-1 text-neutral-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Driver Dispatch Alerts
              </span>
              <span className="flex items-center gap-1 text-neutral-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> TripAdvisor & Google Review Booster
              </span>
              <span className="flex items-center gap-1 text-neutral-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> National Park Manifest Export
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              onClick={onOpenTripbone}
              className="px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30"
            >
              <span>Open Tripbone Control Center</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                onToggleTripbone();
                showToast(`Tripbone connector ${!currentTenant.tripboneEnabled ? 'Enabled' : 'Disabled'}`);
              }}
              className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-semibold transition cursor-pointer border border-neutral-700"
            >
              {currentTenant.tripboneEnabled ? 'Disable Connector' : 'Enable Connector'}
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Other Connectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Developer REST API */}
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                ACTIVE
              </span>
            </div>

            <h3 className="font-bold text-base text-white">REST API & Inbound Webhooks</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Programmatically send WhatsApp messages, query conversation logs, and receive real-time webhook callbacks for incoming customer messages.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={onOpenApiConsole}
              className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 border border-neutral-700"
            >
              <span>Manage API Keys & Docs</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          </div>
        </div>

        {/* E-Commerce (Shopify & WooCommerce) */}
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">
                READY
              </span>
            </div>

            <h3 className="font-bold text-base text-white">Shopify & WooCommerce</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Recover abandoned shopping carts with automated discount WhatsApp links and send automated order fulfillment tracking numbers.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => showToast('Shopify connector webhook instructions generated in API Console.')}
              className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer border border-neutral-700"
            >
              Configure Store Webhook
            </button>
          </div>
        </div>

        {/* Zapier & Make.com */}
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Share2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">
                READY
              </span>
            </div>

            <h3 className="font-bold text-base text-white">Zapier & Make Automation</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Connect to 5,000+ business applications (HubSpot, Salesforce, Airtable, Notion, Stripe) through no-code triggers and actions.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => showToast('Zapier Inbound Webhook endpoint copied to clipboard!')}
              className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer border border-neutral-700"
            >
              Copy Zapier Ingest URL
            </button>
          </div>
        </div>

        {/* Google Sheets Lead Sync */}
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                ACTIVE
              </span>
            </div>

            <h3 className="font-bold text-base text-white">Google Sheets Real-time Sync</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Automatically append every new WhatsApp lead and booking directly into your live operational Google Spreadsheet.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => showToast('Google Sheet Sync stream active for current workspace.')}
              className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer border border-neutral-700"
            >
              Sync Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
