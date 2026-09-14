import React, { useState } from 'react';
import { Tenant, PricingPlan } from '../../types';
import { 
  Building2, 
  Search, 
  Plus, 
  Download, 
  ArrowUpRight, 
  Cable, 
  AlertCircle, 
  CheckCircle2, 
  Edit, 
  Trash2, 
  ShieldAlert, 
  Key, 
  RotateCcw, 
  Sparkles, 
  Filter, 
  Smartphone,
  ExternalLink,
  Bot,
  Globe
} from 'lucide-react';

interface SuperAdminSubscribersProps {
  tenants: Tenant[];
  plans: PricingPlan[];
  onSelectTenant: (tenantId: string) => void;
  onUpdateTenant: (updatedTenant: Tenant) => void;
  onAddTenant: (newTenant: Tenant) => void;
  onDeleteTenant: (tenantId: string) => void;
  onNavigateMember: () => void;
  onShowNotice: (msg: string) => void;
}

export const SuperAdminSubscribers: React.FC<SuperAdminSubscribersProps> = ({
  tenants,
  plans,
  onSelectTenant,
  onUpdateTenant,
  onAddTenant,
  onDeleteTenant,
  onNavigateMember,
  onShowNotice,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

  // New Tenant Form State
  const [newName, setNewName] = useState('');
  const [newBusinessType, setNewBusinessType] = useState('');
  const [newIndustry, setNewIndustry] = useState('Travel & Tourism');
  const [newEmail, setNewEmail] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('+62 812-');
  const [newPlan, setNewPlan] = useState<string>('Pro');
  const [newMonthlyQuota, setNewMonthlyQuota] = useState<number>(25000);
  const [newTripbone, setNewTripbone] = useState(true);
  const [newDedicatedIp, setNewDedicatedIp] = useState(false);
  const [newAiCopilot, setNewAiCopilot] = useState(true);

  // Filtered subscribers
  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.industry || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.whatsappAccount?.phoneNumber || '').includes(searchQuery);

    const matchesPlan = selectedPlanFilter === 'all' || t.plan === selectedPlanFilter;
    const matchesStatus = selectedStatusFilter === 'all' || (t.status || 'active') === selectedStatusFilter;

    return matchesSearch && matchesPlan && matchesStatus;
  });

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const slug = newName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const tenantId = `tenant-${slug}-${Date.now().toString().slice(-4)}`;
    const apiKey = `wac_live_${Math.random().toString(36).substring(2, 10)}_${slug.slice(0, 8)}`;

    const createdTenant: Tenant = {
      id: tenantId,
      name: newName,
      businessType: newBusinessType || 'Business Operations',
      industry: newIndustry,
      email: newEmail || `support@${slug}.com`,
      contactName: newContactName || 'Operations Lead',
      contactPhone: newContactPhone,
      plan: newPlan,
      status: 'active',
      monthlyQuota: Number(newMonthlyQuota) || 25000,
      messagesUsed: 0,
      channelCount: 1,
      tripboneEnabled: newTripbone,
      dedicatedIp: newDedicatedIp,
      aiCopilotEnabled: newAiCopilot,
      billingCycle: 'monthly',
      nextBillingDate: '2026-10-15',
      apiKey: apiKey,
      createdAt: new Date().toISOString().split('T')[0],
      whatsappAccount: {
        status: 'disconnected',
      },
    };

    onAddTenant(createdTenant);
    setIsAddModalOpen(false);
    resetNewForm();
    onShowNotice(`Subscriber "${createdTenant.name}" successfully created!`);
  };

  const resetNewForm = () => {
    setNewName('');
    setNewBusinessType('');
    setNewEmail('');
    setNewContactName('');
    setNewContactPhone('+62 812-');
    setNewPlan('Pro');
    setNewMonthlyQuota(25000);
    setNewTripbone(true);
    setNewDedicatedIp(false);
    setNewAiCopilot(true);
  };

  const handleUpdateTenantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;

    onUpdateTenant(editingTenant);
    onShowNotice(`Updated subscriber details for "${editingTenant.name}"`);
    setEditingTenant(null);
  };

  const handleToggleStatus = (tenant: Tenant) => {
    const nextStatus = tenant.status === 'suspended' ? 'active' : 'suspended';
    const updated: Tenant = {
      ...tenant,
      status: nextStatus,
    };
    onUpdateTenant(updated);
    onShowNotice(`Tenant ${tenant.name} status updated to: ${nextStatus.toUpperCase()}`);
  };

  const handleToggleTripbone = (tenant: Tenant) => {
    const updated: Tenant = {
      ...tenant,
      tripboneEnabled: !tenant.tripboneEnabled,
    };
    onUpdateTenant(updated);
    onShowNotice(`Tripbone Connector ${updated.tripboneEnabled ? 'Enabled' : 'Disabled'} for ${tenant.name}`);
  };

  const handleResetUsage = (tenant: Tenant) => {
    if (confirm(`Reset message usage counter to 0 for ${tenant.name}?`)) {
      onUpdateTenant({
        ...tenant,
        messagesUsed: 0,
      });
      onShowNotice(`Usage counter for ${tenant.name} reset to 0 msgs.`);
    }
  };

  const handleRegenerateApiKey = (tenant: Tenant) => {
    if (confirm(`Regenerate live API key for ${tenant.name}? Any existing integrations will need the new key.`)) {
      const newKey = `wac_live_${Math.random().toString(36).substring(2, 10)}_${tenant.id.slice(0, 8)}`;
      onUpdateTenant({
        ...tenant,
        apiKey: newKey,
      });
      onShowNotice(`Regenerated API key for ${tenant.name}`);
    }
  };

  const handleDeleteSubscriber = (tenant: Tenant) => {
    if (confirm(`Are you sure you want to completely delete subscriber "${tenant.name}" (${tenant.id})? This will wipe all message archives and channel links.`)) {
      onDeleteTenant(tenant.id);
      onShowNotice(`Subscriber "${tenant.name}" removed from platform.`);
    }
  };

  const handleExportCsv = () => {
    const headers = ['Tenant ID', 'Company Name', 'Industry', 'Email', 'Plan', 'Status', 'Monthly Quota', 'Messages Used', 'Tripbone', 'WhatsApp Number', 'Created Date'];
    const rows = tenants.map((t) => [
      t.id,
      `"${t.name.replace(/"/g, '""')}"`,
      `"${(t.industry || '').replace(/"/g, '""')}"`,
      t.email || '',
      t.plan,
      t.status || 'active',
      t.monthlyQuota || 25000,
      t.messagesUsed || 0,
      t.tripboneEnabled ? 'YES' : 'NO',
      t.whatsappAccount?.phoneNumber || 'Unlinked',
      t.createdAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `whatscrm_subscribers_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowNotice('Subscribers exported to CSV successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900/70 p-5 rounded-2xl border border-neutral-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>SaaS Subscribers & Tenant Organizations</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-neutral-800 text-neutral-300 border border-neutral-700">
              {tenants.length} Total
            </span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Provision new client accounts, adjust message allocations, toggle add-ons, or masquerade into tenant portals.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 border border-neutral-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Subscriber</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search company name, tenant ID, email, or WhatsApp number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <Filter className="w-3.5 h-3.5 text-neutral-500" />
            <span>Plan:</span>
          </div>
          <select
            value={selectedPlanFilter}
            onChange={(e) => setSelectedPlanFilter(e.target.value)}
            className="px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600 cursor-pointer"
          >
            <option value="all">All Packages</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <div className="flex items-center gap-1.5 text-xs text-neutral-400 ml-2">
            <span>Status:</span>
          </div>
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="trial">Trial Period</option>
            <option value="suspended">Suspended</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Subscriber / Organization</th>
                <th className="py-3.5 px-4 font-semibold">Contact & Industry</th>
                <th className="py-3.5 px-4 font-semibold">Plan & Quota Usage</th>
                <th className="py-3.5 px-4 font-semibold">WhatsApp Gateway</th>
                <th className="py-3.5 px-4 font-semibold">Integrations</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-neutral-300">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500">
                    <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium">No subscribers match your search filter</p>
                    <p className="text-xs text-neutral-600 mt-1">Try resetting the plan or status filter</p>
                  </td>
                </tr>
              ) : (
                filteredTenants.map((t) => {
                  const isConnected = t.whatsappAccount?.status === 'connected';
                  const quota = t.monthlyQuota || 25000;
                  const used = t.messagesUsed || 0;
                  const usagePercent = Math.min(100, Math.round((used / quota) * 100));

                  return (
                    <tr key={t.id} className="hover:bg-neutral-800/40 transition">
                      {/* Company Name & ID */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-white text-xs shrink-0">
                            {t.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm hover:text-purple-300 transition cursor-pointer" onClick={() => setEditingTenant(t)}>
                              {t.name}
                            </div>
                            <div className="text-[11px] text-neutral-500 font-mono flex items-center gap-1.5 mt-0.5">
                              <span>{t.id}</span>
                              <span className="text-neutral-700">•</span>
                              <span>Joined {t.createdAt}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact & Industry */}
                      <td className="py-4 px-4">
                        <div className="text-white font-medium">{t.industry || t.businessType}</div>
                        <div className="text-[11px] text-neutral-400 mt-0.5">{t.email}</div>
                        {t.contactPhone && (
                          <div className="text-[10px] text-neutral-500 font-mono">{t.contactPhone}</div>
                        )}
                      </td>

                      {/* Plan & Quota Usage */}
                      <td className="py-4 px-4 min-w-[170px]">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.plan === 'Enterprise'
                              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                              : t.plan === 'Pro'
                              ? 'bg-slate-800 text-slate-200 border border-slate-700'
                              : 'bg-slate-900/60 text-slate-400 border border-slate-800'
                          }`}>
                            {t.plan}
                          </span>
                          <span className="text-[11px] font-mono text-neutral-400">
                            {used.toLocaleString()} / {quota.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            style={{ width: `${usagePercent}%` }}
                            className={`h-full rounded-full transition-all ${
                              usagePercent > 90 ? 'bg-rose-500' : usagePercent > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-neutral-500 mt-1">
                          <span>{usagePercent}% utilized</span>
                          <button
                            onClick={() => handleResetUsage(t)}
                            className="hover:text-indigo-400 transition cursor-pointer flex items-center gap-0.5"
                            title="Reset monthly usage to 0"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                            <span>Reset</span>
                          </button>
                        </div>
                      </td>

                      {/* WhatsApp Gateway Status */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-600'}`} />
                          <div>
                            <div className={isConnected ? 'text-emerald-400 font-mono text-xs font-semibold' : 'text-neutral-500 text-xs'}>
                              {isConnected ? t.whatsappAccount.phoneNumber : 'Disconnected'}
                            </div>
                            <div className="text-[10px] text-neutral-500">
                              {isConnected ? (t.whatsappAccount.pushName || 'Multi-Device v6.7') : 'No active socket'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Integrations */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleToggleTripbone(t)}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer flex items-center gap-1.5 w-fit ${
                              t.tripboneEnabled
                                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                : 'bg-neutral-800 text-neutral-500 hover:text-neutral-400'
                            }`}
                          >
                            <Cable className="w-2.5 h-2.5" />
                            <span>Tripbone {t.tripboneEnabled ? 'ON' : 'OFF'}</span>
                          </button>

                          {t.dedicatedIp && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-neutral-800 text-neutral-400 border border-neutral-700 w-fit">
                              Dedicated IP
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleToggleStatus(t)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition cursor-pointer border ${
                            t.status === 'suspended'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                              : t.status === 'trial'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                          }`}
                          title="Click to toggle active/suspended"
                        >
                          {(t.status || 'active').toUpperCase()}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Masquerade into Tenant Portal */}
                          <button
                            onClick={() => {
                              onSelectTenant(t.id);
                              onNavigateMember();
                            }}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium rounded-lg text-xs transition cursor-pointer flex items-center gap-1 border border-slate-700/60 shadow-xs"
                            title="Masquerade / Log into this tenant workspace directly"
                          >
                            <span>Open</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Details */}
                          <button
                            onClick={() => setEditingTenant(t)}
                            className="p-1.5 text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition cursor-pointer"
                            title="Edit Subscriber Profile"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteSubscriber(t)}
                            className="p-1.5 text-neutral-500 hover:text-red-400 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition cursor-pointer"
                            title="Delete Subscriber"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD SUBSCRIBER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl p-6 space-y-5 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto text-neutral-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Provision New SaaS Subscriber</h3>
                  <p className="text-xs text-neutral-400">Onboard a business organization with dedicated workspace and credentials</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-500 hover:text-white text-xs cursor-pointer px-2 py-1 bg-neutral-800 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Company / Organization Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Komodo Island Safari"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Industry / Vertical</label>
                  <select
                    value={newIndustry}
                    onChange={(e) => setNewIndustry(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                  >
                    <option value="Travel & Tourism">Travel & Tourism</option>
                    <option value="Hospitality & Wellness">Hospitality & Wellness</option>
                    <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                    <option value="Healthcare & Wellness">Healthcare & Wellness</option>
                    <option value="Real Estate & Property">Real Estate & Property</option>
                    <option value="Financial & Legal">Financial & Legal</option>
                    <option value="Other Service">Other Service</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Primary Contact Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="operations@komodosafari.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Contact Phone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="+62 812-9988-7766"
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Package Tier</label>
                  <select
                    value={newPlan}
                    onChange={(e) => {
                      const p = e.target.value;
                      setNewPlan(p);
                      if (p === 'Starter') setNewMonthlyQuota(5000);
                      else if (p === 'Pro') setNewMonthlyQuota(25000);
                      else if (p === 'Enterprise') setNewMonthlyQuota(100000);
                    }}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} (${p.priceMonthly}/mo)</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Monthly Message Quota</label>
                  <input
                    type="number"
                    value={newMonthlyQuota}
                    onChange={(e) => setNewMonthlyQuota(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              {/* Feature Toggles */}
              <div className="pt-2 border-t border-neutral-800 space-y-2.5">
                <span className="text-xs font-semibold text-neutral-400">Add-ons & Architecture Capabilities</span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 p-2.5 bg-neutral-950 rounded-xl border border-neutral-800 cursor-pointer hover:border-neutral-700">
                    <input
                      type="checkbox"
                      checked={newTripbone}
                      onChange={(e) => setNewTripbone(e.target.checked)}
                      className="rounded border-neutral-700 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-xs font-medium text-white">Tripbone Tour Suite</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 bg-neutral-950 rounded-xl border border-neutral-800 cursor-pointer hover:border-neutral-700">
                    <input
                      type="checkbox"
                      checked={newDedicatedIp}
                      onChange={(e) => setNewDedicatedIp(e.target.checked)}
                      className="rounded border-neutral-700 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-xs font-medium text-white">Dedicated IP</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 bg-neutral-950 rounded-xl border border-neutral-800 cursor-pointer hover:border-neutral-700">
                    <input
                      type="checkbox"
                      checked={newAiCopilot}
                      onChange={(e) => setNewAiCopilot(e.target.checked)}
                      className="rounded border-neutral-700 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-xs font-medium text-white">AI Inbox Copilot</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs"
                >
                  Provision Subscriber
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SUBSCRIBER MODAL */}
      {editingTenant && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl p-6 space-y-5 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto text-neutral-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <Edit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Edit Subscriber: {editingTenant.name}</h3>
                  <p className="text-xs text-neutral-400 font-mono">{editingTenant.id}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingTenant(null)}
                className="text-neutral-500 hover:text-white text-xs cursor-pointer px-2 py-1 bg-neutral-800 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateTenantSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Company Name</label>
                  <input
                    type="text"
                    required
                    value={editingTenant.name}
                    onChange={(e) => setEditingTenant({ ...editingTenant, name: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Industry</label>
                  <input
                    type="text"
                    value={editingTenant.industry || ''}
                    onChange={(e) => setEditingTenant({ ...editingTenant, industry: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Official Billing Email</label>
                  <input
                    type="email"
                    value={editingTenant.email || ''}
                    onChange={(e) => setEditingTenant({ ...editingTenant, email: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Contact Phone</label>
                  <input
                    type="text"
                    value={editingTenant.contactPhone || ''}
                    onChange={(e) => setEditingTenant({ ...editingTenant, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Plan Tier</label>
                  <select
                    value={editingTenant.plan}
                    onChange={(e) => setEditingTenant({ ...editingTenant, plan: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Monthly Message Quota</label>
                  <input
                    type="number"
                    value={editingTenant.monthlyQuota || 25000}
                    onChange={(e) => setEditingTenant({ ...editingTenant, monthlyQuota: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Subscriber Status</label>
                  <select
                    value={editingTenant.status || 'active'}
                    onChange={(e) => setEditingTenant({ ...editingTenant, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                  >
                    <option value="active">Active</option>
                    <option value="trial">Trial Period</option>
                    <option value="suspended">Suspended</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Tripbone Tour Connector</label>
                  <select
                    value={editingTenant.tripboneEnabled ? 'yes' : 'no'}
                    onChange={(e) => setEditingTenant({ ...editingTenant, tripboneEnabled: e.target.value === 'yes' })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                  >
                    <option value="yes">Enabled</option>
                    <option value="no">Disabled</option>
                  </select>
                </div>
              </div>

              {/* API Key management */}
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-400 flex items-center gap-1.5 font-semibold">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    <span>Master API Key</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRegenerateApiKey(editingTenant)}
                    className="text-[11px] text-amber-400 hover:text-amber-300 transition cursor-pointer"
                  >
                    Regenerate Key
                  </button>
                </div>
                <div className="font-mono text-xs text-neutral-300 bg-neutral-900 p-2 rounded border border-neutral-800 break-all select-all">
                  {editingTenant.apiKey}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingTenant(null)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs"
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
