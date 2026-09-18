import React, { useState } from 'react';
import { Tenant } from '../types';
import { 
  Building2, 
  ChevronDown, 
  Plus, 
  KeyRound, 
  Check, 
  Copy, 
  Smartphone, 
  Wifi, 
  WifiOff, 
  Radio,
  LogOut
} from 'lucide-react';

interface HeaderProps {
  currentTenant: Tenant;
  tenants: Tenant[];
  onSelectTenant: (tenant: Tenant) => void;
  onOpenNewTenantModal: () => void;
  onNavigateToQr: () => void;
  onNavigateLanding?: () => void;
  onNavigateSuperAdmin?: () => void;
  onNavigateLogin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTenant,
  tenants,
  onSelectTenant,
  onOpenNewTenantModal,
  onNavigateToQr,
  onNavigateLanding,
  onNavigateSuperAdmin,
  onNavigateLogin,
}) => {
  const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const isConnected = currentTenant.whatsappAccount.status === 'connected';

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(currentTenant.apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <header className="h-16 border-b border-neutral-200 bg-white px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Tenant Switcher & Brand */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-xs">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-neutral-900 tracking-tight text-base">Whapi.Cloud</span>
              <span className="px-1.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                API Gateway v2.4
              </span>
            </div>
            <p className="text-xs text-neutral-500">Universal WhatsApp REST API Platform</p>
          </div>
        </div>

        <div className="h-6 w-[1px] bg-neutral-200" />

        {/* Tenant Selector Dropdown */}
        <div className="relative">
          <button
            id="tenant-dropdown-btn"
            onClick={() => setTenantDropdownOpen(!tenantDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 text-xs font-medium transition cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5 text-neutral-500" />
            <div className="text-left max-w-[180px] truncate">
              <span className="block font-semibold text-neutral-900 truncate">{currentTenant.name}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
          </button>

          {tenantDropdownOpen && (
            <div className="absolute left-0 mt-1.5 w-72 rounded-xl bg-white border border-neutral-200 shadow-xl py-1.5 z-50">
              <div className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                Switch Business Tenant
              </div>
              {tenants.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    onSelectTenant(t);
                    setTenantDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-neutral-50 transition cursor-pointer ${
                    t.id === currentTenant.id ? 'bg-emerald-50/60 font-semibold text-emerald-900' : 'text-neutral-700'
                  }`}
                >
                  <div className="truncate mr-2">
                    <div className="truncate font-medium">{t.name}</div>
                    <div className="text-[11px] text-neutral-400">{t.businessType} • {t.plan}</div>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${
                    t.whatsappAccount.status === 'connected' ? 'bg-emerald-500' : 'bg-neutral-300'
                  }`} />
                </button>
              ))}
              <div className="border-t border-neutral-100 mt-1 pt-1">
                <button
                  id="create-tenant-modal-btn"
                  onClick={() => {
                    setTenantDropdownOpen(false);
                    onOpenNewTenantModal();
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-emerald-700 font-medium flex items-center gap-2 hover:bg-emerald-50 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register New Tenant Account</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Active WhatsApp Session Pill & API Key */}
      <div className="flex items-center gap-3">
        {/* Dedicated API Key preview button */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-600 text-xs">
          <KeyRound className="w-3.5 h-3.5 text-neutral-400" />
          <span className="font-mono text-[11px] text-neutral-700 truncate max-w-[140px]">
            {currentTenant.apiKey.slice(0, 15)}...
          </span>
          <button
            onClick={handleCopyApiKey}
            title="Copy Tenant API Key"
            className="p-1 hover:text-neutral-900 transition cursor-pointer"
          >
            {copiedKey ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>

        {/* Landing and SuperAdmin switches */}
        {onNavigateLanding && (
          <button
            onClick={onNavigateLanding}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-600 hover:text-neutral-900 text-xs font-medium transition cursor-pointer"
          >
            <span>Landing Page</span>
          </button>
        )}

        {onNavigateSuperAdmin && (
          <button
            onClick={onNavigateSuperAdmin}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-xs font-semibold transition cursor-pointer"
          >
            <span>SuperAdmin</span>
          </button>
        )}

        {onNavigateLogin && (
          <button
            onClick={onNavigateLogin}
            title="Sign Out / Switch Account"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:bg-red-50 hover:border-red-200 text-neutral-600 hover:text-red-700 text-xs font-medium transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        )}

        {/* WhatsApp Connection Status Pill */}
        <button
          onClick={onNavigateToQr}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
            isConnected
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
              : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
          }`}
        >
          {isConnected ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
              <span>{currentTenant.whatsappAccount.phoneNumber || 'Linked'}</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-600" />
              <span>WhatsApp Disconnected • Scan QR</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
