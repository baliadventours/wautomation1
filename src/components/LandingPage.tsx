import React, { useState } from 'react';
import { PRICING_PLANS } from '../data/mockData';
import { PricingPlan } from '../types';
import { 
  MessageSquare, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  QrCode, 
  Workflow, 
  Key, 
  Cable, 
  ArrowRight, 
  Star, 
  ChevronRight, 
  Users, 
  Building2, 
  ShoppingBag, 
  Compass, 
  Stethoscope, 
  Laptop, 
  Sparkles,
  Lock,
  Globe2,
  Check,
  HelpCircle,
  Play
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: (planId?: 'Starter' | 'Pro' | 'Enterprise') => void;
  onNavigateLogin: () => void;
  onNavigateRegister: () => void;
  onLoginMember?: () => void;
  onLoginSuperAdmin?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onNavigateLogin,
  onNavigateRegister,
  onLoginMember,
  onLoginSuperAdmin,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [activeIndustry, setActiveIndustry] = useState<'all' | 'tours' | 'ecommerce' | 'health'>('all');
  const [simulatedInbound, setSimulatedInbound] = useState('Hi, I want to book a VIP sunset tour for 2 pax tomorrow!');
  const [simulatedReply, setSimulatedReply] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulateMessage = () => {
    setIsSimulating(true);
    setSimulatedReply(null);
    setTimeout(() => {
      setSimulatedReply(
        '👋 Hello! Thanks for reaching out to us. We have 2 VIP spots available for tomorrow\'s sunset excursion! Here is your private booking link with instant WhatsApp confirmation: https://tripbone.com/b/vip-sunset\n\nReply 1 to speak with a human agent.'
      );
      setIsSimulating(false);
    }, 600);
  };

  const industries = [
    {
      id: 'tours',
      name: 'Tours & Experiences',
      icon: Compass,
      tag: 'Dedicated Tripbone Integration',
      description: 'Automate booking vouchers, hotel pickup passes, driver dispatch alerts, and post-tour TripAdvisor review requests.',
      benefit: 'Zero manual texting for drivers & guides',
    },
    {
      id: 'ecommerce',
      name: 'E-Commerce & DTC',
      icon: ShoppingBag,
      tag: 'Cart Recovery & Orders',
      description: 'Recover abandoned checkout carts with high-converting personalized discounts and automatic shipping tracking alerts.',
      benefit: 'Up to 34% abandoned cart recovery',
    },
    {
      id: 'health',
      name: 'Clinics & Healthcare',
      icon: Stethoscope,
      tag: 'Appointment Reminders',
      description: 'Eliminate patient no-shows with automated WhatsApp appointment reminders, doctor schedule links, and intake forms.',
      benefit: 'Reduces appointment no-shows by 68%',
    },
    {
      id: 'realestate',
      name: 'Real Estate & Agencies',
      icon: Building2,
      tag: 'Instant Lead Capture',
      description: 'Instantly send property PDF brochures, schedule private viewing walkthroughs, and qualify high-intent buyers.',
      benefit: 'Respond to property inquiries in < 2 sec',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Whapi.Cloud Live: Easy WhatsApp REST API with Channels, Webhooks, Number Checker, & Tripbone Suite!</span>
        <button
          onClick={() => onGetStarted('Pro')}
          className="underline hover:text-emerald-100 font-bold ml-1 cursor-pointer"
        >
          Try Free Sandbox →
        </button>
      </div>

      {/* Navigation Bar */}
      <header className="border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-neutral-950 flex items-center justify-center font-black text-lg shadow-sm">
              <MessageSquare className="w-5 h-5 text-neutral-950 fill-neutral-950" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                Whapi.Cloud <span className="text-emerald-400 font-mono text-xs px-1.5 py-0.5 rounded bg-emerald-950/70 border border-emerald-800">API</span>
              </span>
              <span className="text-[10px] text-neutral-400 block -mt-0.5">Universal WhatsApp Cloud Gateway</span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-neutral-300">
            <a href="#features" className="hover:text-white transition">API Features</a>
            <a href="#solutions" className="hover:text-white transition">SDKs & Explorer</a>
            <a href="#tripbone" className="hover:text-emerald-400 transition flex items-center gap-1">
              <Cable className="w-3.5 h-3.5 text-purple-400" />
              <span>Tripbone Integration</span>
            </a>
            <a href="#pricing" className="hover:text-white transition">Pricing ($35/channel)</a>
            <a href="#faq" className="hover:text-white transition">FAQ</a>
          </nav>

          {/* Auth Navigation */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onNavigateLogin}
              className="px-3.5 py-2 text-xs font-semibold text-neutral-200 hover:text-white transition cursor-pointer"
            >
              Sign In
            </button>

            <button
              onClick={onNavigateRegister}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm shadow-emerald-500/20"
            >
              <span>Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 max-w-7xl mx-auto w-full">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center space-y-5 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-800/80 border border-neutral-700 text-xs text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Universal WhatsApp REST API Gateway</span>
            <span className="text-neutral-500">•</span>
            <span className="text-emerald-400 font-semibold">No Meta Business Verification Required</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
            Build WhatsApp Superpowers Into Your App with <span className="text-emerald-400">Whapi.Cloud</span>
          </h1>

          <p className="text-base sm:text-lg text-neutral-400 leading-relaxed max-w-2xl mx-auto">
            Pair any WhatsApp account in 30 seconds via QR or OTP code. Send texts, media, documents, interactive buttons, listen to real-time webhooks, validate phone numbers, and safely ramp up sending with automated number warming — with dedicated connectors for <strong className="text-purple-300">Tripbone</strong> tour operations.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onGetStarted('Pro')}
              className="w-full sm:w-auto px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-xl text-sm transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <span>Get Started Free — 14-Day Trial</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onLoginMember}
              className="w-full sm:w-auto px-6 py-3.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold rounded-xl text-sm transition cursor-pointer border border-neutral-700 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
              <span>Explore Member Demo Dashboard</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-neutral-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Anti-Ban delay algorithms
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Baileys Multi-Device socket
            </span>
          </div>
        </div>

        {/* Live Interactive Sandbox Card */}
        <div className="mt-14 max-w-4xl mx-auto bg-neutral-950 rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden">
          <div className="bg-neutral-900 px-5 py-3 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="text-xs font-mono text-neutral-400 ml-2">live-simulator.whatscrm.io</span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Gateway Engine Active</span>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-neutral-950">
            {/* Left: Input tester */}
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                  Try Inbound WhatsApp Simulation
                </span>
                <p className="text-xs text-neutral-400">
                  Type any simulated customer inquiry to see the instant auto-responder in action:
                </p>
              </div>

              <textarea
                value={simulatedInbound}
                onChange={(e) => setSimulatedInbound(e.target.value)}
                rows={3}
                className="w-full text-xs font-medium p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
              />

              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={handleSimulateMessage}
                  disabled={isSimulating}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSimulating ? (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Zap className="w-3.5 h-3.5" />
                  )}
                  <span>Simulate WhatsApp Inbound Message</span>
                </button>
              </div>

              <div className="p-3 bg-neutral-900/70 border border-neutral-800/80 rounded-xl text-[11px] text-neutral-400 space-y-1">
                <div className="font-semibold text-neutral-300">Quick Templates to Test:</div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <button
                    onClick={() => setSimulatedInbound('PRICE')}
                    className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-mono cursor-pointer"
                  >
                    "PRICE"
                  </button>
                  <button
                    onClick={() => setSimulatedInbound('Where is my private driver meeting me?')}
                    className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-mono cursor-pointer"
                  >
                    "Where is driver?"
                  </button>
                  <button
                    onClick={() => setSimulatedInbound('STOP')}
                    className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-mono cursor-pointer"
                  >
                    "STOP" (Opt-Out)
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Phone preview bubble */}
            <div className="bg-[#121b22] rounded-2xl p-4 border border-neutral-800 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold text-white">
                    W
                  </div>
                  <div>
                    <span className="text-xs font-bold text-neutral-200 block leading-tight">Your WhatsApp Business</span>
                    <span className="text-[10px] text-emerald-400">Online • Automated Bot</span>
                  </div>
                </div>
                <span className="text-[10px] text-neutral-500 font-mono">End-to-end encrypted</span>
              </div>

              {/* Messages viewport */}
              <div className="space-y-2.5 flex-1 min-h-[160px] flex flex-col justify-end">
                {/* User message */}
                <div className="flex justify-end">
                  <div className="bg-[#005c4b] text-neutral-100 rounded-xl rounded-tr-none px-3.5 py-2 text-xs max-w-[85%] shadow-sm">
                    <div>{simulatedInbound}</div>
                    <div className="text-[9px] text-neutral-400 text-right mt-1">10:24 AM ✓✓</div>
                  </div>
                </div>

                {/* Bot reply */}
                {simulatedReply && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="bg-[#202c33] text-neutral-100 rounded-xl rounded-tl-none px-3.5 py-2.5 text-xs max-w-[90%] shadow-sm whitespace-pre-line leading-relaxed">
                      <div>{simulatedReply}</div>
                      <div className="text-[9px] text-neutral-400 text-right mt-1.5">10:24 AM • Automated</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions / Industries Section */}
      <section id="solutions" className="py-20 border-t border-neutral-800 bg-neutral-950/60">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Built for Every Modern Business
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              One Unified WhatsApp Platform, Infinite Industry Workflows
            </h2>
            <p className="text-sm text-neutral-400">
              Whether you run an international tour agency, an e-commerce boutique, or a private medical practice, WhatsCRM automates high-touch customer relationships.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {industries.map((ind) => {
              const Icon = ind.icon;
              return (
                <div
                  key={ind.id}
                  className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6 space-y-4 hover:border-neutral-700 transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                        {ind.tag}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-white">{ind.name}</h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">{ind.description}</p>
                  </div>

                  <div className="pt-3 border-t border-neutral-800/80">
                    <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{ind.benefit}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dedicated Tripbone Feature Callout */}
      <section id="tripbone" className="py-20 border-t border-neutral-800 bg-gradient-to-b from-purple-950/20 to-neutral-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-neutral-900 border border-purple-900/60 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/40 border border-purple-700 text-xs font-semibold text-purple-300">
                  <Cable className="w-3.5 h-3.5 text-purple-400" />
                  <span>Featured First-Class Integration</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                  Dedicated <span className="text-purple-400">Tripbone Tour & Travel</span> Connector
                </h2>

                <p className="text-sm text-neutral-300 leading-relaxed">
                  Are you a tour operator or travel experience agency using Tripbone? Our native integration synchronizes confirmed bookings, auto-dispatches PDF tickets, coordinates driver pickup alerts, and runs post-tour TripAdvisor review engines.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="flex items-center gap-2 text-neutral-200">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Real-time HMAC Webhook Sync</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-200">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Instant PDF Voucher Dispatch</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-200">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Driver & Hotel Pickup Passes</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-200">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Automated TripAdvisor Booster</span>
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-3">
                  <button
                    onClick={() => onGetStarted('Pro')}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-2 shadow-md shadow-purple-600/30"
                  >
                    <span>Connect Your Tripbone Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Tripbone Preview Card */}
              <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800 space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                  <span className="text-neutral-400 text-[11px]">WEBHOOK EVENT: booking.confirmed</span>
                  <span className="text-emerald-400 font-bold text-[10px] bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    VERIFIED HMAC-SHA256
                  </span>
                </div>

                <div className="text-neutral-300 text-[11px] leading-relaxed space-y-1">
                  <div><span className="text-purple-400">bookingId</span>: "TB-89412"</div>
                  <div><span className="text-purple-400">tourName</span>: "Mount Batur Sunrise Trekking & Hot Springs"</div>
                  <div><span className="text-purple-400">pickupLocation</span>: "Padma Resort Ubud Lobby"</div>
                  <div><span className="text-purple-400">assignedDriver</span>: "Pak Made Wijaya (DK 1829 FB)"</div>
                  <div><span className="text-purple-400">status</span>: "PDF Voucher & Driver Pass Queued"</div>
                </div>

                <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 flex items-center justify-between text-[11px]">
                  <span className="text-neutral-400">WhatsApp Anti-Ban Queue:</span>
                  <span className="text-emerald-400 font-sans font-semibold">Pacing: 3.2s jitter</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Transparent Multi-Tenant Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Simple, Predictable Plans for Every Stage
            </h2>
            <p className="text-sm text-neutral-400">
              No hidden Meta per-conversation markups. Pay a fixed monthly subscription and connect your own WhatsApp Business numbers.
            </p>

            {/* Monthly / Annual Toggle */}
            <div className="inline-flex items-center gap-2 bg-neutral-800/80 p-1 rounded-xl border border-neutral-700 text-xs">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  billingCycle === 'annual'
                    ? 'bg-emerald-500 text-neutral-950 shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <span>Annual Billing</span>
                <span className="text-[10px] bg-neutral-950 text-emerald-300 px-1.5 py-0.2 rounded font-mono font-bold">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PRICING_PLANS.map((plan) => {
              const price = billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;
              return (
                <div
                  key={plan.id}
                  className={`bg-neutral-900 rounded-3xl p-8 border flex flex-col justify-between relative transition ${
                    plan.popular
                      ? 'border-emerald-500 shadow-xl shadow-emerald-500/10'
                      : 'border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-neutral-950 shadow-sm">
                      {plan.badge}
                    </span>
                  )}

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-bold text-xl text-white">{plan.name}</h3>
                      <p className="text-xs text-neutral-400 mt-1 min-h-[32px]">{plan.description}</p>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-white">${price}</span>
                      <span className="text-xs text-neutral-400">/ month</span>
                      {billingCycle === 'annual' && (
                        <span className="text-[10px] text-emerald-400 font-mono block ml-2">billed annually</span>
                      )}
                    </div>

                    {/* Limits bar */}
                    <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-xs space-y-1.5 font-medium">
                      <div className="flex items-center justify-between text-neutral-300">
                        <span className="text-neutral-500">WhatsApp Numbers:</span>
                        <span className="text-white font-bold">{plan.limits.numbers}</span>
                      </div>
                      <div className="flex items-center justify-between text-neutral-300">
                        <span className="text-neutral-500">Monthly Message Limit:</span>
                        <span className="text-emerald-400 font-bold">{plan.limits.messagesPerMonth}</span>
                      </div>
                      <div className="flex items-center justify-between text-neutral-300">
                        <span className="text-neutral-500">Team Agents:</span>
                        <span className="text-white font-bold">{plan.limits.teamAgents}</span>
                      </div>
                    </div>

                    {/* Feature list */}
                    <div className="space-y-2.5 pt-2">
                      <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
                        Included Features:
                      </span>
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-neutral-300">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-8">
                    <button
                      onClick={() => onGetStarted(plan.id)}
                      className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                        plan.popular
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-md shadow-emerald-500/20'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-white'
                      }`}
                    >
                      <span>Choose {plan.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 border-t border-neutral-800 bg-neutral-950/70">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Frequently Asked Questions</h2>
            <p className="text-xs text-neutral-400">Everything you need to know about our WhatsApp CRM & API platform</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'How does WhatsApp connection work? Do I need Meta Cloud API approval?',
                a: 'No Meta Business verification or complex templates required! You can link any standard WhatsApp or WhatsApp Business phone number simply by scanning a secure QR code in our dashboard (powered by multi-device Baileys v6.7 socket). You are ready in under 30 seconds.',
              },
              {
                q: 'How do you prevent WhatsApp account bans when sending automated messages?',
                a: 'Our proprietary Anti-Ban Pacing Engine queues outbound messages with randomized humanized jitter (2 to 4 second delays), enforces strict opt-out compliance ("STOP" / "UNSUBSCRIBE" filters), and limits burst spikes automatically.',
              },
              {
                q: 'How does the Tripbone integration work?',
                a: 'Tripbone is a native first-class integration! When a booking is created or updated in Tripbone, it triggers a signed HMAC webhook to WhatsCRM. The system automatically creates a customer profile, sends a branded PDF voucher, coordinates driver hotel pickup passes, and later requests a TripAdvisor review.',
              },
              {
                q: 'Can multiple agents reply to customer chats simultaneously?',
                a: 'Yes! Our Unified Shared Team Inbox allows multiple agents to view, claim, tag, and reply to customer inquiries in real time without conflicting or sending duplicate replies.',
              },
            ].map((faq, i) => (
              <div key={i} className="p-5 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-2">
                <h3 className="font-bold text-sm text-neutral-200">{faq.q}</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 bg-neutral-950 py-12 px-6 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-neutral-300">WhatsCRM API SaaS</span>
            <span>• Universal Multi-Tenant WhatsApp Operations</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={onNavigateLogin} className="hover:text-neutral-300 transition cursor-pointer">
              Login
            </button>
            <button onClick={onNavigateRegister} className="hover:text-neutral-300 transition cursor-pointer">
              Register
            </button>
            <button onClick={onNavigateLogin} className="hover:text-purple-300 transition cursor-pointer text-purple-400 font-mono">
              SuperAdmin
            </button>
            <span>© 2026 WhatsCRM. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
