import React, { useState } from 'react';
import { PricingPlan } from '../../types';
import { 
  Layers, 
  Plus, 
  Check, 
  Sparkles, 
  Edit, 
  Trash2, 
  ShieldCheck, 
  Zap, 
  DollarSign, 
  Users, 
  MessageSquare,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Tag
} from 'lucide-react';

interface SuperAdminPackagesProps {
  plans: PricingPlan[];
  onUpdatePlan: (updatedPlan: PricingPlan) => void;
  onAddPlan: (newPlan: PricingPlan) => void;
  onDeletePlan: (planId: string) => void;
  onShowNotice: (msg: string) => void;
}

export const SuperAdminPackages: React.FC<SuperAdminPackagesProps> = ({
  plans,
  onUpdatePlan,
  onAddPlan,
  onDeletePlan,
  onShowNotice,
}) => {
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Plan form state
  const [newName, setNewName] = useState('');
  const [newBadge, setNewBadge] = useState('');
  const [newPriceMonthly, setNewPriceMonthly] = useState<number>(49);
  const [newPriceAnnual, setNewPriceAnnual] = useState<number>(39);
  const [newDescription, setNewDescription] = useState('');
  const [newChannelLimit, setNewChannelLimit] = useState<number>(2);
  const [newMonthlyQuota, setNewMonthlyQuota] = useState<number>(15000);
  const [newTeamAgents, setNewTeamAgents] = useState('5 Agents');
  const [newRateLimitRps, setNewRateLimitRps] = useState<number>(20);
  const [newRetentionDays, setNewRetentionDays] = useState<number>(30);
  const [newTripboneAccess, setNewTripboneAccess] = useState(true);
  const [newFeaturesText, setNewFeaturesText] = useState(
    '2 Connected WhatsApp Numbers\n15,000 Messages / month\nShared Multi-Agent Team Inbox (5 seats)\nAnti-Ban Message Pacing\nWebhook Delivery & Re-try'
  );

  const handleCreatePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const planId = newName.replace(/[^a-zA-Z0-9]/g, '');
    const featuresList = newFeaturesText
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const createdPlan: PricingPlan = {
      id: planId,
      name: newName,
      badge: newBadge.trim() || undefined,
      priceMonthly: Number(newPriceMonthly),
      priceAnnual: Number(newPriceAnnual),
      description: newDescription || 'Tailored WhatsApp SaaS solution.',
      popular: false,
      status: 'active',
      channelLimit: Number(newChannelLimit),
      monthlyQuotaNumber: Number(newMonthlyQuota),
      rateLimitRps: Number(newRateLimitRps),
      retentionDays: Number(newRetentionDays),
      subscribersCount: 0,
      features: featuresList,
      limits: {
        numbers: `${newChannelLimit} ${newChannelLimit === 1 ? 'Device' : 'Devices'}`,
        messagesPerMonth: Number(newMonthlyQuota).toLocaleString(),
        teamAgents: newTeamAgents,
        tripboneAccess: newTripboneAccess,
        webhooks: true,
      },
    };

    onAddPlan(createdPlan);
    setIsCreateModalOpen(false);
    resetNewForm();
    onShowNotice(`SaaS Package "${createdPlan.name}" created and published!`);
  };

  const resetNewForm = () => {
    setNewName('');
    setNewBadge('');
    setNewPriceMonthly(49);
    setNewPriceAnnual(39);
    setNewDescription('');
    setNewChannelLimit(2);
    setNewMonthlyQuota(15000);
    setNewTeamAgents('5 Agents');
    setNewRateLimitRps(20);
    setNewRetentionDays(30);
    setNewTripboneAccess(true);
    setNewFeaturesText('2 Connected WhatsApp Numbers\n15,000 Messages / month\nShared Multi-Agent Team Inbox\nAnti-Ban Message Pacing');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    onUpdatePlan(editingPlan);
    onShowNotice(`Package "${editingPlan.name}" configurations updated!`);
    setEditingPlan(null);
  };

  const handleTogglePopular = (plan: PricingPlan) => {
    const updated = { ...plan, popular: !plan.popular };
    onUpdatePlan(updated);
    onShowNotice(`Package "${plan.name}" featured flag set to: ${!plan.popular ? 'POPULAR' : 'NORMAL'}`);
  };

  const handleDelete = (plan: PricingPlan) => {
    if ((plan.subscribersCount || 0) > 0) {
      alert(`Cannot delete package "${plan.name}" because ${plan.subscribersCount} active subscribers are currently enrolled. Please migrate them first.`);
      return;
    }
    if (confirm(`Delete package "${plan.name}"?`)) {
      onDeletePlan(plan.id);
      onShowNotice(`Package "${plan.name}" removed.`);
    }
  };

  // Calculate MRR totals per tier
  const totalSubscribersAcrossPlans = plans.reduce((acc, p) => acc + (p.subscribersCount || 0), 0);
  const estimatedTierMRR = plans.reduce((acc, p) => acc + ((p.subscribersCount || 0) * p.priceMonthly), 0);

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900/70 p-5 rounded-2xl border border-neutral-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>SaaS Package & Plan Management</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
              {plans.length} Tiers Configured
            </span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Configure monthly & annual subscription tiers, message quota boundaries, channel concurrency, and add-on rights.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-purple-900/30"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create New Package</span>
        </button>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-800 text-purple-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-neutral-400 font-medium">Estimated Tier MRR</div>
            <div className="text-xl font-bold text-white font-mono">${estimatedTierMRR.toLocaleString()}</div>
            <div className="text-[11px] text-emerald-400 font-medium">Across active subscription tiers</div>
          </div>
        </div>

        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-800 text-blue-400 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-neutral-400 font-medium">Enrolled Subscribers</div>
            <div className="text-xl font-bold text-white font-mono">{totalSubscribersAcrossPlans}</div>
            <div className="text-[11px] text-neutral-400">Total paying accounts</div>
          </div>
        </div>

        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-neutral-400 font-medium">Gateway Quota Engine</div>
            <div className="text-xl font-bold text-emerald-400">Auto-Enforced</div>
            <div className="text-[11px] text-neutral-400">Pacing & webhook rate throttling</div>
          </div>
        </div>
      </div>

      {/* Package Tier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {plans.map((p) => {
          const annualDiscount = Math.round(((p.priceMonthly - p.priceAnnual) / p.priceMonthly) * 100);

          return (
            <div
              key={p.id}
              className={`bg-neutral-900 rounded-2xl border flex flex-col justify-between p-5 transition relative shadow-lg ${
                p.popular
                  ? 'border-purple-600 ring-1 ring-purple-600/50 bg-neutral-900/90'
                  : 'border-neutral-800 hover:border-neutral-700'
              }`}
            >
              {/* Badge */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  p.badge
                    ? 'bg-purple-950 text-purple-300 border border-purple-800'
                    : 'bg-neutral-800 text-neutral-400'
                }`}>
                  {p.badge || 'Standard Tier'}
                </span>

                <button
                  onClick={() => handleTogglePopular(p)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded transition cursor-pointer ${
                    p.popular
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                  title="Toggle 'Featured / Most Popular' badge"
                >
                  {p.popular ? '★ Featured' : '☆ Feature'}
                </button>
              </div>

              {/* Title & Pricing */}
              <div className="space-y-2 mb-4">
                <h3 className="text-base font-bold text-white">{p.name}</h3>
                <p className="text-[11px] text-neutral-400 min-h-[32px] leading-relaxed">
                  {p.description}
                </p>

                <div className="pt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white font-mono">${p.priceMonthly}</span>
                    <span className="text-xs text-neutral-400">/ mo</span>
                  </div>
                  <div className="text-[11px] text-emerald-400 font-medium">
                    ${p.priceAnnual}/mo billed annually ({annualDiscount}% off)
                  </div>
                </div>
              </div>

              {/* Limits and Quota Breakdown */}
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800/80 space-y-2 mb-4 text-xs font-mono">
                <div className="flex items-center justify-between text-neutral-300">
                  <span className="text-[11px] text-neutral-400">Message Quota:</span>
                  <span className="font-bold text-white">{p.limits.messagesPerMonth}</span>
                </div>
                <div className="flex items-center justify-between text-neutral-300">
                  <span className="text-[11px] text-neutral-400">WhatsApp Sockets:</span>
                  <span className="font-bold text-white">{p.limits.numbers}</span>
                </div>
                <div className="flex items-center justify-between text-neutral-300">
                  <span className="text-[11px] text-neutral-400">Team Seats:</span>
                  <span className="font-bold text-white">{p.limits.teamAgents}</span>
                </div>
                <div className="flex items-center justify-between text-neutral-300">
                  <span className="text-[11px] text-neutral-400">Tripbone Tour Suite:</span>
                  <span className={p.limits.tripboneAccess ? 'text-purple-400 font-bold' : 'text-neutral-500'}>
                    {p.limits.tripboneAccess ? 'Included' : 'No'}
                  </span>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-1.5 mb-5 flex-1">
                <div className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">Included Features</div>
                {p.features.slice(0, 5).map((f, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-neutral-300">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{f}</span>
                  </div>
                ))}
                {p.features.length > 5 && (
                  <div className="text-[10px] text-neutral-500 pl-5">
                    +{p.features.length - 5} more features
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-neutral-800 flex items-center justify-between gap-2">
                <div className="text-[11px] text-neutral-400">
                  <span className="font-bold text-white">{p.subscribersCount || 0}</span> subscribers
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditingPlan(p)}
                    className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg transition cursor-pointer"
                    title="Edit Package Configuration"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(p)}
                    className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-500 hover:text-red-400 rounded-lg transition cursor-pointer"
                    title="Delete Package"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE PACKAGE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl p-6 space-y-5 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto text-neutral-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Create New SaaS Package Tier</h3>
                  <p className="text-xs text-neutral-400">Define pricing, channel concurrency limits, and quotas</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-neutral-500 hover:text-white text-xs cursor-pointer px-2 py-1 bg-neutral-800 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePackage} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Package Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Growth Scale"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Badge Label (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. High Volume, Best Value"
                    value={newBadge}
                    onChange={(e) => setNewBadge(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Monthly Price ($ USD) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newPriceMonthly}
                    onChange={(e) => setNewPriceMonthly(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Annual Price ($ USD/mo) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newPriceAnnual}
                    onChange={(e) => setNewPriceAnnual(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">WhatsApp Channels Limit</label>
                  <input
                    type="number"
                    min="1"
                    value={newChannelLimit}
                    onChange={(e) => setNewChannelLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Monthly Message Quota</label>
                  <input
                    type="number"
                    min="1000"
                    value={newMonthlyQuota}
                    onChange={(e) => setNewMonthlyQuota(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Team Seats Label</label>
                  <input
                    type="text"
                    value={newTeamAgents}
                    onChange={(e) => setNewTeamAgents(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">API Rate Limit (Req/sec)</label>
                  <input
                    type="number"
                    min="1"
                    value={newRateLimitRps}
                    onChange={(e) => setNewRateLimitRps(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-300">Short Description</label>
                <input
                  type="text"
                  placeholder="Target audience and best use-case"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-300">Features Checklist (1 per line)</label>
                <textarea
                  rows={4}
                  value={newFeaturesText}
                  onChange={(e) => setNewFeaturesText(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-medium text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newTripboneAccess}
                    onChange={(e) => setNewTripboneAccess(e.target.checked)}
                    className="rounded text-purple-600"
                  />
                  <span>Include Tripbone Tour Suite & GPS Driver Dispatch</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-lg shadow-purple-900/30"
                >
                  Publish Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PACKAGE MODAL */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl p-6 space-y-5 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto text-neutral-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <Edit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Edit Package: {editingPlan.name}</h3>
                  <p className="text-xs text-neutral-400 font-mono">Plan ID: {editingPlan.id}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingPlan(null)}
                className="text-neutral-500 hover:text-white text-xs cursor-pointer px-2 py-1 bg-neutral-800 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Package Display Name</label>
                  <input
                    type="text"
                    required
                    value={editingPlan.name}
                    onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Badge Label</label>
                  <input
                    type="text"
                    value={editingPlan.badge || ''}
                    onChange={(e) => setEditingPlan({ ...editingPlan, badge: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Monthly Price ($ USD)</label>
                  <input
                    type="number"
                    required
                    value={editingPlan.priceMonthly}
                    onChange={(e) => setEditingPlan({ ...editingPlan, priceMonthly: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Annual Price ($ USD/mo)</label>
                  <input
                    type="number"
                    required
                    value={editingPlan.priceAnnual}
                    onChange={(e) => setEditingPlan({ ...editingPlan, priceAnnual: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">WhatsApp Sockets Limit</label>
                  <input
                    type="text"
                    value={editingPlan.limits.numbers}
                    onChange={(e) => setEditingPlan({
                      ...editingPlan,
                      limits: { ...editingPlan.limits, numbers: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Monthly Message Quota Label</label>
                  <input
                    type="text"
                    value={editingPlan.limits.messagesPerMonth}
                    onChange={(e) => setEditingPlan({
                      ...editingPlan,
                      limits: { ...editingPlan.limits, messagesPerMonth: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-300">Description</label>
                <input
                  type="text"
                  value={editingPlan.description}
                  onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
                <label className="flex items-center gap-2 text-xs font-medium text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPlan.limits.tripboneAccess}
                    onChange={(e) => setEditingPlan({
                      ...editingPlan,
                      limits: { ...editingPlan.limits, tripboneAccess: e.target.checked }
                    })}
                    className="rounded text-purple-600"
                  />
                  <span>Include Tripbone Tour Suite</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPlan.popular || false}
                    onChange={(e) => setEditingPlan({
                      ...editingPlan,
                      popular: e.target.checked
                    })}
                    className="rounded text-purple-600"
                  />
                  <span>Featured 'Most Popular'</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-lg shadow-blue-900/30"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
