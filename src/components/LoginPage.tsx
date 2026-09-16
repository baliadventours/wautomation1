import React, { useState } from 'react';
import { 
  MessageSquare, 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Key, 
  ArrowLeft,
  Sparkles,
  Server,
  UserCheck
} from 'lucide-react';
import { Tenant } from '../types';

interface LoginPageProps {
  tenants: Tenant[];
  onLoginSuccess: (tenantId: string) => void;
  onLoginSuperAdmin: () => void;
  onNavigateRegister: () => void;
  onNavigateLanding: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  tenants,
  onLoginSuccess,
  onLoginSuperAdmin,
  onNavigateRegister,
  onNavigateLanding,
}) => {
  const [selectedRole, setSelectedRole] = useState<'subscriber' | 'superadmin'>('subscriber');
  const [email, setEmail] = useState('admin@bali-paradise.com');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (selectedRole === 'superadmin') {
        onLoginSuperAdmin();
        return;
      }

      // Find matching tenant or fallback to first tenant
      const matched = tenants.find(t => (t.email || '').toLowerCase() === (email || '').toLowerCase());
      if (matched) {
        onLoginSuccess(matched.id);
      } else if (tenants.length > 0) {
        // Fallback to active demo tenant
        onLoginSuccess(tenants[0].id);
      }
    }, 600);
  };

  const selectPresetAccount = (presetEmail: string, role: 'subscriber' | 'superadmin') => {
    setSelectedRole(role);
    setEmail(presetEmail);
    setPassword('••••••••••••');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button 
            onClick={onNavigateLanding}
            className="flex items-center gap-3 cursor-pointer text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-lg shadow-sm group-hover:scale-105 transition">
              <MessageSquare className="w-5 h-5 text-slate-950 fill-slate-950" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                Whapi.Cloud <span className="text-emerald-400 font-mono text-xs px-1.5 py-0.5 rounded bg-emerald-950/70 border border-emerald-800">Auth</span>
              </span>
              <span className="text-[10px] text-slate-400 block -mt-0.5">Secure Gateway Access</span>
            </div>
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 hidden sm:inline">Don't have an account?</span>
            <button
              onClick={onNavigateRegister}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition cursor-pointer border border-slate-700 flex items-center gap-1.5"
            >
              <span>Create Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-6 py-12 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md space-y-6 relative z-10">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Multi-Tenant Single Sign-On</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Log in to your workspace
            </h1>
            <p className="text-xs text-slate-400">
              Enter your credentials to access your WhatsApp channels and API console
            </p>
          </div>

          {/* Role Selector Tabs */}
          <div className="p-1 bg-slate-900 rounded-xl border border-slate-800 grid grid-cols-2 gap-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('subscriber');
                setEmail('admin@bali-paradise.com');
              }}
              className={`py-2 px-3 rounded-lg transition cursor-pointer flex items-center justify-center gap-2 ${
                selectedRole === 'subscriber'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Subscriber Portal</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRole('superadmin');
                setEmail('root.admin@whatscrm.cloud');
              }}
              className={`py-2 px-3 rounded-lg transition cursor-pointer flex items-center justify-center gap-2 ${
                selectedRole === 'superadmin'
                  ? 'bg-purple-600 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>SuperAdmin Room</span>
            </button>
          </div>

          {/* Login Form Card */}
          <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-5 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 bg-red-950/50 border border-red-800/80 rounded-xl text-xs text-red-200">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Email address</span>
                  <span className="text-[10px] text-slate-500 font-normal">Business or Admin email</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl pl-10 pr-3 py-2.5 text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Password</label>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password recovery email dispatched in demo mode.'); }} className="text-[11px] text-emerald-400 hover:underline">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl pl-10 pr-3 py-2.5 text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500 w-3.5 h-3.5"
                  />
                  <span>Remember this browser</span>
                </label>
                <span className="text-[11px] text-slate-500 font-mono">TLS 1.3 256-bit</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 shadow-md ${
                  selectedRole === 'superadmin'
                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/30'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-900/30'
                } ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>{selectedRole === 'superadmin' ? 'Enter SuperAdmin Room' : 'Sign In to Workspace'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Fast 1-Click Demo Accounts Quick Access */}
            <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Quick Demo Presets
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => selectPresetAccount('admin@bali-paradise.com', 'subscriber')}
                  className="p-2.5 text-left rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition cursor-pointer"
                >
                  <div className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                    <span>Bali Paradise Tours</span>
                    <span className="text-[10px] text-emerald-400 font-mono">Pro</span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">admin@bali-paradise.com</div>
                </button>

                <button
                  type="button"
                  onClick={() => selectPresetAccount('root.admin@whatscrm.cloud', 'superadmin')}
                  className="p-2.5 text-left rounded-xl bg-slate-950 hover:bg-purple-950/30 border border-purple-900/40 hover:border-purple-800 transition cursor-pointer"
                >
                  <div className="text-xs font-semibold text-purple-300 flex items-center justify-between">
                    <span>SuperAdmin Master</span>
                    <span className="text-[10px] text-purple-400 font-mono">Root</span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">root.admin@whatscrm.cloud</div>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom links */}
          <div className="text-center text-xs text-slate-500 space-x-3">
            <button 
              onClick={onNavigateLanding}
              className="hover:text-slate-400 transition cursor-pointer inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Back to home</span>
            </button>
            <span>•</span>
            <button 
              onClick={onNavigateRegister}
              className="hover:text-slate-400 transition cursor-pointer"
            >
              New registration
            </button>
            <span>•</span>
            <span className="text-slate-600">v2.4.0-cloud</span>
          </div>
        </div>
      </main>
    </div>
  );
};
