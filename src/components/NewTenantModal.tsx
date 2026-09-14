import React, { useState } from 'react';
import { Tenant } from '../types';
import { X, Building2, Key, Sparkles } from 'lucide-react';

interface NewTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTenant: (tenant: Tenant) => void;
}

export const NewTenantModal: React.FC<NewTenantModalProps> = ({
  isOpen,
  onClose,
  onAddTenant,
}) => {
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('Tour & Activity Operator');
  const [plan, setPlan] = useState<'Starter' | 'Pro' | 'Enterprise'>('Pro');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) return;

    const slug = businessName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const randomHex = Math.random().toString(16).substring(2, 10);

    const newTenant: Tenant = {
      id: `tenant-${slug}-${Date.now().toString().slice(-4)}`,
      name: businessName.trim(),
      businessType,
      plan,
      apiKey: `wac_live_${randomHex}_${slug}`,
      createdAt: new Date().toISOString().split('T')[0],
      whatsappAccount: {
        status: 'disconnected',
      },
    };

    onAddTenant(newTenant);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm text-neutral-900">Register New Business Tenant</h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-neutral-700 block mb-1">Company / Brand Name</label>
            <input
              type="text"
              placeholder="e.g. Komodo Island Charters"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-xl bg-neutral-50 focus:bg-white focus:outline-none focus:border-neutral-400"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-700 block mb-1">Industry / Category</label>
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-xl bg-neutral-50 focus:bg-white focus:outline-none"
            >
              <option value="Tour & Activity Operator">Tour & Activity Operator</option>
              <option value="Hotel & Resort Concierge">Hotel & Resort Concierge</option>
              <option value="Car Rental & Airport Transfers">Car Rental & Airport Transfers</option>
              <option value="Dive Center & Water Sports">Dive Center & Water Sports</option>
              <option value="Travel Agency & B2B Wholesaler">Travel Agency & B2B Wholesaler</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-700 block mb-1">SaaS Subscription Tier</label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {(['Starter', 'Pro', 'Enterprise'] as const).map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setPlan(tier)}
                  className={`py-2 px-3 rounded-xl border text-center font-medium transition cursor-pointer ${
                    plan === tier
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                      : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1 text-xs text-neutral-500">
            <div className="flex items-center gap-1.5 font-semibold text-neutral-800">
              <Key className="w-3.5 h-3.5 text-neutral-500" />
              <span>Automated Tenant Provisioning</span>
            </div>
            <p className="text-[11px]">
              Will provision a dedicated tenant database scope, isolated WhatsApp multi-device session slot, and generate a unique live API key.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer shadow-xs"
            >
              Register & Launch Workspace
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
