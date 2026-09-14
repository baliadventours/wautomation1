import React, { useState } from 'react';
import { PRICING_PLANS } from '../data/mockData';
import { Tenant } from '../types';
import { 
  MessageSquare, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Building2, 
  Compass, 
  ShoppingBag, 
  Stethoscope, 
  Lock, 
  Check, 
  ArrowLeft 
} from 'lucide-react';

interface RegisterPageProps {
  initialPlan?: 'Starter' | 'Pro' | 'Enterprise';
  onRegisterSuccess: (newTenant: Tenant) => void;
  onNavigateLanding: () => void;
  onNavigateLogin: () => void;
  onLoginMember?: () => void;
  onLoginSuperAdmin?: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  initialPlan = 'Pro',
  onRegisterSuccess,
  onNavigateLanding,
  onNavigateLogin,
  onLoginMember = onNavigateLogin,
  onLoginSuperAdmin,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'Starter' | 'Pro' | 'Enterprise'>(initialPlan);
  const [businessName, setBusinessName] = useState('My Business Solutions');
  const [industry, setIndustry] = useState('E-Commerce & Retail');
  const [email, setEmail] = useState('admin@mybusiness.com');
  const [password, setPassword] = useState('••••••••••••');
  const [subdomain, setSubdomain] = useState('mybusiness');
  const [enableTripbone, setEnableTripbone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !email.trim()) return;

    setLoading(true);

    setTimeout(() => {
      const tenantId = `tenant-${subdomain.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString().slice(-4)}`;
      const newTenant: Tenant = {
        id: tenantId,
        name: businessName,
        businessType: industry,
        industry: industry,
        email: email,
        plan: selectedPlan,
        status: 'active',
        monthlyQuota: selectedPlan === 'Starter' ? 5000 : selectedPlan === 'Pro' ? 25000 : 100000,
        messagesUsed: 0,
        tripboneEnabled: enableTripbone || industry.includes('Tour') || industry.includes('Travel'),
        apiKey: `wac_live_${Math.random().toString(36).substring(2, 10)}_${subdomain}_key`,
        webhookSecret: `whsec_${Math.random().toString(36).substring(2, 12)}`,
        strictSignatureVerification: true,
        createdAt: new Date().toISOString().slice(0, 10),
        whatsappAccount: {
          status: 'disconnected',
        },
      };

      setLoading(false);
      onRegisterSuccess(newTenant);
    }, 600);
  };

  const industries = [
    'E-Commerce & Retail',
    'Tours, Travel & Experiences (Tripbone)',
    'Healthcare & Dental Clinics',
    'Real Estate & Property',
    'Hospitality & Hotels',
    'SaaS & Digital Agency',
    'Other Industry',
  ];

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
        <button
          onClick={onNavigateLanding}
          className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing Page</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 text-neutral-950 flex items-center justify-center font-black">
            <MessageSquare className="w-4 h-4 text-neutral-950 fill-neutral-950" />
          </div>
          <span className="font-bold text-sm text-white">WhatsCRM SaaS</span>
        </div>

        <div className="text-xs text-neutral-400">
          Already a subscriber?{' '}
          <button
            onClick={onNavigateLogin}
            className="text-emerald-400 hover:underline font-semibold cursor-pointer ml-1"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Main Registration Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 w-full">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl font-black text-white tracking-tight">Create Your Business WhatsApp Workspace</h1>
          <p className="text-xs text-neutral-400">
            14-day full featured trial • Instant QR code connection • Zero Meta Cloud API approval needed
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left 2 Cols: Form */}
          <div className="md:col-span-2 bg-neutral-950 rounded-2xl border border-neutral-800 p-6 shadow-xl space-y-5">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Business or Brand Name</label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => {
                      setBusinessName(e.target.value);
                      setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''));
                    }}
                    placeholder="e.g. Acme Lifestyle"
                    className="w-full text-xs px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Industry Vertical</label>
                  <select
                    value={industry}
                    onChange={(e) => {
                      setIndustry(e.target.value);
                      if (e.target.value.includes('Tripbone') || e.target.value.includes('Tour')) {
                        setEnableTripbone(true);
                      }
                    }}
                    className="w-full text-xs px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  >
                    {industries.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Work Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full text-xs px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full text-xs px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Subdomain preview */}
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">Workspace Slug</label>
                <div className="flex items-center">
                  <span className="bg-neutral-800 text-neutral-400 px-3 py-2.5 rounded-l-xl border border-r-0 border-neutral-700 text-xs font-mono">
                    app.whatscrm.io/
                  </span>
                  <input
                    type="text"
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="flex-1 text-xs px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-r-xl text-emerald-400 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Tripbone toggle */}
              <div className="p-3.5 bg-neutral-900 rounded-xl border border-neutral-800 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                    <span>Activate Dedicated Tripbone Connector</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-purple-900/60 text-purple-300 font-mono font-bold">
                      Tour Ops
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Enable real-time tour booking sync, driver dispatching, and TripAdvisor review booster.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={enableTripbone}
                  onChange={(e) => setEnableTripbone(e.target.checked)}
                  className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                />
              </div>

              {/* Plan Picker */}
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-2">Select Subscription Plan</label>
                <div className="grid grid-cols-3 gap-3">
                  {PRICING_PLANS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPlan(p.id)}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        selectedPlan === p.id
                          ? 'bg-emerald-950/50 border-emerald-500 text-white'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">{p.name}</span>
                        {selectedPlan === p.id && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <div className="text-sm font-black text-emerald-400 mt-1">${p.priceMonthly}<span className="text-[10px] font-normal text-neutral-500">/mo</span></div>
                      <div className="text-[10px] text-neutral-400 mt-1">{p.limits.messagesPerMonth} msgs</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                  <span>Launch My WhatsApp Workspace Now</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right 1 Col: Value props & Demo Logins */}
          <div className="space-y-4">
            <div className="bg-neutral-950 rounded-2xl border border-neutral-800 p-5 space-y-3">
              <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
                What's Included
              </span>
              <div className="space-y-2 text-xs text-neutral-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>30-Second QR Code Pairing</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Multi-Agent Shared Team Inbox</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Interactive Chatbot & Workflows</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Anti-Ban Jitter Queue</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Full REST API & HMAC Webhooks</span>
                </div>
              </div>
            </div>

            {/* Quick Demo Accounts */}
            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-5 space-y-3">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
                Quick Demo Access
              </span>
              <p className="text-xs text-neutral-400">
                Want to evaluate right now without filling out forms?
              </p>

              <div className="space-y-2 pt-1">
                <button
                  onClick={onLoginMember}
                  className="w-full py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-between"
                >
                  <span>Demo Member Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                </button>

                <button
                  onClick={onLoginSuperAdmin}
                  className="w-full py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-purple-300 border border-purple-900/60 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-between"
                >
                  <span>Demo SuperAdmin Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer note */}
      <footer className="border-t border-neutral-800 py-6 text-center text-xs text-neutral-500">
        Safe & Encrypted • Built with Baileys Multi-Device WebSocket Engine
      </footer>
    </div>
  );
};
