import React, { useState } from 'react';
import { Tenant } from '../types';
import { PRICING_PLANS } from '../data/mockData';
import { 
  CreditCard, 
  CheckCircle2, 
  Zap, 
  ArrowUpRight, 
  ShieldCheck, 
  Calendar, 
  FileText, 
  Download, 
  Sparkles,
  Check,
  AlertCircle
} from 'lucide-react';

interface BillingViewProps {
  currentTenant: Tenant;
  onUpdatePlan: (newPlan: 'Starter' | 'Pro' | 'Enterprise' | string) => void;
}

export const BillingView: React.FC<BillingViewProps> = ({
  currentTenant,
  onUpdatePlan,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const activePlanDetails = PRICING_PLANS.find((p) => p.id === currentTenant.plan) || PRICING_PLANS[1];
  const quota = currentTenant.monthlyQuota || 25000;
  const used = currentTenant.messagesUsed || 12450;
  const percentUsed = Math.min(100, Math.round((used / quota) * 100));

  const handleSelectPlan = (planId: string) => {
    onUpdatePlan(planId);
    setSuccessToast(`Plan successfully updated to ${planId}! Your limits have refreshed.`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const mockInvoices = [
    { id: 'INV-2026-009', date: 'Sep 01, 2026', amount: `$${activePlanDetails.priceMonthly}.00`, status: 'Paid', pdf: 'invoice-sep-2026.pdf' },
    { id: 'INV-2026-008', date: 'Aug 01, 2026', amount: `$${activePlanDetails.priceMonthly}.00`, status: 'Paid', pdf: 'invoice-aug-2026.pdf' },
    { id: 'INV-2026-007', date: 'Jul 01, 2026', amount: `$${activePlanDetails.priceMonthly}.00`, status: 'Paid', pdf: 'invoice-jul-2026.pdf' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Toast */}
      {successToast && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-800 rounded-2xl text-xs text-emerald-200 flex items-center gap-2 animate-fade-in">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Subscription & Billing Management</h1>
        <p className="text-xs text-neutral-400">
          Manage your WhatsApp workspace plan, monthly message throughput limits, and billing details
        </p>
      </div>

      {/* Current Plan & Quota Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Active plan banner */}
        <div className="md:col-span-2 bg-neutral-900 rounded-2xl border border-neutral-800 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Active Workspace Plan</span>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-white">{activePlanDetails.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  AUTO-RENEW ACTIVE
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-black text-white">${activePlanDetails.priceMonthly}</div>
              <span className="text-xs text-neutral-400">per month</span>
            </div>
          </div>

          {/* Quota bar */}
          <div className="space-y-2 pt-2 border-t border-neutral-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-300">WhatsApp Messages Quota (This Cycle)</span>
              <span className="font-mono text-neutral-400">
                <strong className="text-white">{used.toLocaleString()}</strong> / {quota.toLocaleString()} msgs ({percentUsed}%)
              </span>
            </div>

            <div className="w-full bg-neutral-950 rounded-full h-2.5 overflow-hidden border border-neutral-800">
              <div
                style={{ width: `${percentUsed}%` }}
                className={`h-full rounded-full transition-all ${
                  percentUsed > 85 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
              <span>Billing resets on October 1, 2026</span>
              <span className="text-emerald-400 font-medium">Anti-Ban Pacing Active</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-xs">
              <span className="text-neutral-500 block text-[10px]">Connected Numbers</span>
              <span className="font-bold text-white mt-0.5 block">{activePlanDetails.limits.numbers}</span>
            </div>
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-xs">
              <span className="text-neutral-500 block text-[10px]">Team Agent Seats</span>
              <span className="font-bold text-white mt-0.5 block">{activePlanDetails.limits.teamAgents}</span>
            </div>
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-xs">
              <span className="text-neutral-500 block text-[10px]">Tripbone Connector</span>
              <span className={`font-bold mt-0.5 block ${currentTenant.tripboneEnabled ? 'text-purple-400' : 'text-neutral-400'}`}>
                {currentTenant.tripboneEnabled ? 'Enabled' : 'Available'}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
              Payment Method
            </span>
            <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-sm text-white">Mastercard •••• 8841</span>
                </div>
                <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded font-mono">
                  DEFAULT
                </span>
              </div>
              <div className="text-[11px] text-neutral-400">Expires 09/28 • Automatic recurring charge</div>
            </div>
          </div>

          <div className="pt-2">
            <button className="w-full py-2.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer border border-neutral-700">
              Update Payment Method
            </button>
          </div>
        </div>
      </div>

      {/* Change / Upgrade Plan Selection */}
      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6 space-y-6">
        <div>
          <h2 className="text-base font-bold text-white">Change or Upgrade Plan</h2>
          <p className="text-xs text-neutral-400">Upgrade anytime to instantly unlock higher monthly message limits and additional numbers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PRICING_PLANS.map((p) => {
            const isCurrent = currentTenant.plan === p.id;
            return (
              <div
                key={p.id}
                className={`bg-neutral-950 rounded-2xl p-5 border flex flex-col justify-between space-y-4 transition ${
                  isCurrent ? 'border-emerald-500 bg-emerald-950/20' : 'border-neutral-800'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-white">{p.name}</h3>
                    {isCurrent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500 text-neutral-950">
                        CURRENT
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-black text-white">
                    ${p.priceMonthly}
                    <span className="text-xs text-neutral-400 font-normal"> /mo</span>
                  </div>
                  <p className="text-xs text-neutral-400 min-h-[32px]">{p.description}</p>

                  <div className="pt-2 border-t border-neutral-800 space-y-2 text-xs text-neutral-300">
                    <div className="font-semibold text-emerald-400">{p.limits.messagesPerMonth} messages / mo</div>
                    <div>{p.limits.numbers}</div>
                    <div>{p.limits.teamAgents}</div>
                    <div>{p.limits.tripboneAccess ? '✓ Tripbone Travel Connector' : '— Standard Connectors'}</div>
                  </div>
                </div>

                <div className="pt-3">
                  {isCurrent ? (
                    <div className="w-full py-2 text-center text-xs font-semibold text-emerald-400 bg-neutral-900 rounded-xl border border-emerald-800/60">
                      Active Plan
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSelectPlan(p.id)}
                      className="w-full py-2 bg-neutral-800 hover:bg-emerald-600 hover:text-white text-neutral-200 rounded-xl text-xs font-bold transition cursor-pointer border border-neutral-700"
                    >
                      Switch to {p.name}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoice History */}
      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Past Invoices & Receipts</h2>
          <span className="text-xs text-neutral-400">All invoices include tax receipts</span>
        </div>

        <div className="border border-neutral-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800">
              <tr>
                <th className="py-3 px-4">Invoice ID</th>
                <th className="py-3 px-4">Billing Date</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-neutral-300">
              {mockInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-neutral-800/40">
                  <td className="py-3 px-4 font-mono font-bold text-white">{inv.id}</td>
                  <td className="py-3 px-4">{inv.date}</td>
                  <td className="py-3 px-4 font-bold">{inv.amount}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => alert(`Downloading ${inv.pdf}...`)}
                      className="text-neutral-400 hover:text-white inline-flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
