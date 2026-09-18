import React, { useState } from 'react';
import { 
  Tenant, 
  SuperAdminStats, 
  PricingPlan, 
  SaaSInvoice, 
  SaaSUser, 
  ClusterNode, 
  AdminAuditLog, 
  SystemAnnouncement 
} from '../types';
import { 
  INITIAL_SUPERADMIN_STATS, 
  PRICING_PLANS, 
  INITIAL_INVOICES, 
  INITIAL_SAAS_USERS, 
  INITIAL_CLUSTER_NODES, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_ANNOUNCEMENTS 
} from '../data/mockData';

import { SuperAdminSubscribers } from './superadmin/SuperAdminSubscribers';
import { SuperAdminPackages } from './superadmin/SuperAdminPackages';
import { SuperAdminInvoices } from './superadmin/SuperAdminInvoices';
import { SuperAdminUsers } from './superadmin/SuperAdminUsers';
import { SuperAdminInfrastructure } from './superadmin/SuperAdminInfrastructure';
import { SuperAdminAuditLogs } from './superadmin/SuperAdminAuditLogs';
import { SuperAdminAnnouncements } from './superadmin/SuperAdminAnnouncements';
import { SuperAdminVpsGuide } from './superadmin/SuperAdminVpsGuide';
import { DatabaseGuideView } from './DatabaseGuideView';

import { 
  Building2, 
  Users, 
  DollarSign, 
  Activity, 
  ShieldCheck, 
  ArrowUpRight, 
  Layers, 
  Server, 
  Sliders, 
  Sparkles, 
  Receipt, 
  Megaphone, 
  FileText, 
  Radio, 
  ShieldAlert,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Sun,
  Moon,
  Menu,
  X,
  Database,
  Globe,
  LifeBuoy,
  Terminal
} from 'lucide-react';

interface SuperAdminViewProps {
  tenants: Tenant[];
  onSelectTenant: (tenantId: string) => void;
  onUpdateTenant: (updatedTenant: Tenant) => void;
  onAddTenant?: (newTenant: Tenant) => void;
  onDeleteTenant?: (tenantId: string) => void;
  onNavigateMember: () => void;
  onNavigateLanding: () => void;
  onNavigateLogin?: () => void;
}

type SuperAdminTab = 
  | 'subscribers' 
  | 'cluster' 
  | 'vps'
  | 'database'
  | 'packages' 
  | 'invoices' 
  | 'users' 
  | 'audit' 
  | 'announcements';

export const SuperAdminView: React.FC<SuperAdminViewProps> = ({
  tenants,
  onSelectTenant,
  onUpdateTenant,
  onAddTenant = (_newTenant: Tenant) => {},
  onDeleteTenant = (_tenantId: string) => {},
  onNavigateMember,
  onNavigateLanding,
  onNavigateLogin,
}) => {
  const [activeTab, setActiveTab] = useState<SuperAdminTab>('subscribers');
  const [stats, setStats] = useState<SuperAdminStats>(INITIAL_SUPERADMIN_STATS);
  const [adminNotice, setAdminNotice] = useState<string | null>(null);

  // Sidebar & Theme State
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('whatscrm_superadmin_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    }
    return 'dark';
  });

  // Platform Data Collections
  const [plans, setPlans] = useState<PricingPlan[]>(PRICING_PLANS);
  const [invoices, setInvoices] = useState<SaaSInvoice[]>(INITIAL_INVOICES);
  const [saasUsers, setSaasUsers] = useState<SaaSUser[]>(INITIAL_SAAS_USERS);
  const [clusterNodes, setClusterNodes] = useState<ClusterNode[]>(INITIAL_CLUSTER_NODES);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>(INITIAL_AUDIT_LOGS);
  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>(INITIAL_ANNOUNCEMENTS);

  const showNotice = (msg: string) => {
    setAdminNotice(msg);
    setTimeout(() => setAdminNotice(null), 4500);
  };

  const handleSetTheme = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('whatscrm_superadmin_theme', newTheme);
    }
    showNotice(`Theme switched to ${newTheme === 'dark' ? 'Dark Terminal' : 'Crisp Light'} Mode`);
  };

  const toggleTheme = () => {
    handleSetTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Helper audit logger
  const logAdminAction = (action: string, details: Record<string, any>, severity: 'info' | 'warning' | 'critical' = 'info') => {
    const newLog: AdminAuditLog = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      adminEmail: 'root.admin@whatscrm.cloud',
      action: action,
      severity: severity,
      ipAddress: '10.240.0.1 (VPN Mesh)',
      details: details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Pricing Plan mutations
  const handleUpdatePlan = (updatedPlan: PricingPlan) => {
    setPlans(prev => prev.map(p => p.id === updatedPlan.id ? updatedPlan : p));
    logAdminAction('PACKAGE_UPDATED', { planId: updatedPlan.id, name: updatedPlan.name, price: updatedPlan.priceMonthly });
  };

  const handleAddPlan = (newPlan: PricingPlan) => {
    setPlans(prev => [...prev, newPlan]);
    logAdminAction('PACKAGE_CREATED', { planId: newPlan.id, name: newPlan.name, price: newPlan.priceMonthly });
  };

  const handleDeletePlan = (planId: string) => {
    const target = plans.find(p => p.id === planId);
    setPlans(prev => prev.filter(p => p.id !== planId));
    logAdminAction('PACKAGE_DELETED', { planId, name: target?.name }, 'warning');
  };

  // Invoice mutations
  const handleAddInvoice = (newInv: SaaSInvoice) => {
    setInvoices(prev => [newInv, ...prev]);
    logAdminAction('INVOICE_GENERATED', { invoiceNumber: newInv.invoiceNumber, tenant: newInv.tenantName, total: newInv.total });
  };

  const handleUpdateInvoice = (updatedInv: SaaSInvoice) => {
    setInvoices(prev => prev.map(inv => inv.id === updatedInv.id ? updatedInv : inv));
    logAdminAction('INVOICE_STATUS_CHANGED', { invoiceNumber: updatedInv.invoiceNumber, status: updatedInv.status });
  };

  const handleDeleteInvoice = (invId: string) => {
    const target = invoices.find(i => i.id === invId);
    setInvoices(prev => prev.filter(inv => inv.id !== invId));
    logAdminAction('INVOICE_DELETED', { invoiceNumber: target?.invoiceNumber }, 'warning');
  };

  // User mutations
  const handleAddUser = (newUser: SaaSUser) => {
    setSaasUsers(prev => [newUser, ...prev]);
    logAdminAction('USER_INVITED', { email: newUser.email, role: newUser.role, tenant: newUser.tenantName || 'Global' });
  };

  const handleUpdateUser = (updatedUser: SaaSUser) => {
    setSaasUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    logAdminAction('USER_UPDATED', { userId: updatedUser.id, email: updatedUser.email, role: updatedUser.role });
  };

  const handleDeleteUser = (userId: string) => {
    const target = saasUsers.find(u => u.id === userId);
    setSaasUsers(prev => prev.filter(u => u.id !== userId));
    logAdminAction('USER_DELETED', { userId, email: target?.email }, 'warning');
  };

  // Announcement mutations
  const handleAddAnnouncement = (item: SystemAnnouncement) => {
    setAnnouncements(prev => [item, ...prev]);
    logAdminAction('BROADCAST_PUBLISHED', { title: item.title, type: item.type, audience: item.targetAudience });
  };

  const handleUpdateAnnouncement = (item: SystemAnnouncement) => {
    setAnnouncements(prev => prev.map(a => a.id === item.id ? item : a));
    logAdminAction('BROADCAST_TOGGLED', { title: item.title, active: item.isActive ?? item.active });
  };

  const handleDeleteAnnouncement = (id: string) => {
    const target = announcements.find(a => a.id === id);
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    logAdminAction('BROADCAST_DELETED', { title: target?.title });
  };

  // Tenant mutations wrapped with audit logs
  const handleWrapAddTenant = (newTenant: Tenant) => {
    onAddTenant(newTenant);
    logAdminAction('SUBSCRIBER_PROVISIONED', { tenantId: newTenant.id, name: newTenant.name, plan: newTenant.plan });
  };

  const handleWrapUpdateTenant = (updatedTenant: Tenant) => {
    onUpdateTenant(updatedTenant);
    logAdminAction('SUBSCRIBER_UPDATED', { tenantId: updatedTenant.id, name: updatedTenant.name, plan: updatedTenant.plan, status: updatedTenant.status });
  };

  const handleWrapDeleteTenant = (tenantId: string) => {
    const target = tenants.find(t => t.id === tenantId);
    onDeleteTenant(tenantId);
    logAdminAction('SUBSCRIBER_TERMINATED', { tenantId, name: target?.name }, 'critical');
  };

  // Notification counters
  const overdueInvoicesCount = invoices.filter(inv => inv.status === 'overdue').length;
  const activeAnnouncementsCount = announcements.filter(a => a.isActive ?? a.active).length;

  // Navigation Items Structure
  interface NavGroup {
    title: string;
    items: {
      id: SuperAdminTab;
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      badge?: string | number;
      badgeColor?: 'default' | 'alert' | 'pulse';
    }[];
  }

  const navGroups: NavGroup[] = [
    {
      title: 'Platform Core',
      items: [
        {
          id: 'subscribers',
          label: 'Subscribers & Tenants',
          icon: Building2,
          badge: tenants.length,
          badgeColor: 'default',
        },
        {
          id: 'cluster',
          label: 'Cluster & Sockets',
          icon: Server,
          badge: '3 Nodes',
          badgeColor: 'pulse',
        },
        {
          id: 'vps',
          label: 'VPS Fast Deploy',
          icon: Terminal,
          badge: 'Guide',
          badgeColor: 'pulse',
        },
        {
          id: 'database',
          label: 'Database & Hosting',
          icon: Database,
          badge: 'PostgreSQL',
          badgeColor: 'pulse',
        },
      ],
    },
    {
      title: 'Operations & Billing',
      items: [
        {
          id: 'packages',
          label: 'Pricing Packages',
          icon: Layers,
          badge: plans.length,
          badgeColor: 'default',
        },
        {
          id: 'invoices',
          label: 'Invoices & Billing',
          icon: Receipt,
          badge: overdueInvoicesCount > 0 ? `${overdueInvoicesCount} Overdue` : invoices.length,
          badgeColor: overdueInvoicesCount > 0 ? 'alert' : 'default',
        },
        {
          id: 'users',
          label: 'User Directory & Access',
          icon: Users,
          badge: saasUsers.length,
          badgeColor: 'default',
        },
        {
          id: 'announcements',
          label: 'System Broadcasts',
          icon: Megaphone,
          badge: activeAnnouncementsCount > 0 ? `${activeAnnouncementsCount} Active` : undefined,
          badgeColor: activeAnnouncementsCount > 0 ? 'alert' : 'default',
        },
        {
          id: 'audit',
          label: 'Audit Trail & Logs',
          icon: ShieldAlert,
          badge: auditLogs.length,
          badgeColor: 'default',
        },
      ],
    },
  ];

  const currentTabName = 
    activeTab === 'subscribers' ? 'Subscriber Management' :
    activeTab === 'cluster' ? 'Cluster & Sockets' :
    activeTab === 'vps' ? 'VPS Deployment & Setup Guide' :
    activeTab === 'database' ? 'Database Architecture & Hosting' :
    activeTab === 'packages' ? 'Package Management' :
    activeTab === 'invoices' ? 'Invoices & Subscriptions' :
    activeTab === 'users' ? 'User Directory & Access' :
    activeTab === 'audit' ? 'Security Audit Trail' : 'System Broadcasts';

  return (
    <div className={`min-h-screen flex transition-colors duration-200 ${
      theme === 'dark' 
        ? 'superadmin-dark bg-[#090d16] text-slate-100 selection:bg-indigo-600 selection:text-white' 
        : 'superadmin-light bg-[#f8fafc] text-slate-900 selection:bg-slate-900 selection:text-white'
    }`}>
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* ====================================================================
          SIDEBAR NAVIGATION MENU
          ==================================================================== */}
      <aside className={`
        fixed md:sticky top-0 h-screen z-50 flex flex-col transition-all duration-300
        ${theme === 'dark' 
          ? 'bg-[#0c101c] border-r border-slate-800/80' 
          : 'bg-white border-r border-slate-200 shadow-sm'
        }
        ${sidebarCollapsed ? 'w-20' : 'w-72'}
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Sidebar Brand Header */}
        <div className={`p-4 border-b flex items-center justify-between shrink-0 ${
          theme === 'dark' ? 'border-slate-800/80' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center font-black shadow-md border border-slate-700/40 dark:border-white/20 shrink-0">
              <Sliders className="w-5 h-5" />
            </div>

            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm tracking-tight truncate text-slate-900 dark:text-white">WhatsCRM</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-800 text-slate-200 border border-slate-700 shrink-0">
                    ROOT
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Enterprise SuperAdmin</p>
              </div>
            )}
          </div>

          {/* Desktop Collapse / Expand Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`hidden md:flex p-1.5 rounded-lg transition cursor-pointer shrink-0 ${
              theme === 'dark' 
                ? 'text-slate-400 hover:text-white hover:bg-slate-800/60' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1.5 text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 no-scrollbar">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {!sidebarCollapsed ? (
                <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 select-none">
                  {group.title}
                </div>
              ) : (
                <div className="h-2 border-b border-slate-800/40 mb-2" />
              )}

              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      isActive
                        ? theme === 'dark'
                          ? 'bg-white/[0.08] text-white shadow-xs border border-white/10 font-bold'
                          : 'bg-slate-900 text-white shadow-xs font-bold'
                        : theme === 'dark'
                          ? 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                    }`} />

                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1 text-left truncate">{item.label}</span>
                        {item.badge !== undefined && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono shrink-0 ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : item.badgeColor === 'alert'
                              ? 'bg-red-950 text-red-300 border border-red-800'
                              : item.badgeColor === 'pulse'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1'
                              : theme === 'dark'
                              ? 'bg-slate-800 text-slate-300'
                              : 'bg-slate-200 text-slate-700'
                          }`}>
                            {item.badgeColor === 'pulse' && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            )}
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer: Theme Toggle & Root Profile */}
        <div className={`p-3 border-t space-y-3 shrink-0 ${
          theme === 'dark' ? 'border-neutral-800 bg-neutral-900/70' : 'border-slate-200 bg-slate-50/70'
        }`}>
          {/* THEME TOGGLE SWITCHER */}
          <div className="space-y-1">
            {!sidebarCollapsed && (
              <div className="px-2 text-[10px] font-bold uppercase tracking-wider opacity-50 flex items-center justify-between">
                <span>Theme Mode</span>
                <span className="text-[9px] font-mono capitalize">{theme}</span>
              </div>
            )}

            <div className={`p-1 rounded-xl flex items-center gap-1 text-xs font-semibold ${
              theme === 'dark' 
                ? 'bg-neutral-950 border border-neutral-800' 
                : 'bg-slate-200/80 border border-slate-300'
            }`}>
              <button
                onClick={() => handleSetTheme('light')}
                className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  theme === 'light'
                    ? 'bg-white text-amber-600 shadow-xs font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Switch to Crisp Light Mode"
              >
                <Sun className="w-3.5 h-3.5" />
                {!sidebarCollapsed && <span>Light</span>}
              </button>

              <button
                onClick={() => handleSetTheme('dark')}
                className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-purple-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Switch to Dark Terminal Mode"
              >
                <Moon className="w-3.5 h-3.5" />
                {!sidebarCollapsed && <span>Dark</span>}
              </button>
            </div>
          </div>

          {/* Quick Shortcuts */}
          {!sidebarCollapsed && (
            <div className="space-y-1 pt-1 border-t border-neutral-800/40">
              <button
                onClick={onNavigateMember}
                className={`w-full px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-between ${
                  theme === 'dark' 
                    ? 'bg-neutral-800/80 hover:bg-neutral-800 text-emerald-400' 
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                }`}
              >
                <span>Member Portal</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onNavigateLanding}
                className={`w-full px-3 py-1.5 rounded-xl text-[11px] font-medium transition cursor-pointer flex items-center justify-between ${
                  theme === 'dark'
                    ? 'text-neutral-400 hover:text-white'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <span>Landing Page</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </button>

              {onNavigateLogin && (
                <button
                  onClick={onNavigateLogin}
                  className={`w-full px-3 py-1.5 rounded-xl text-[11px] font-medium transition cursor-pointer flex items-center justify-between ${
                    theme === 'dark'
                      ? 'text-rose-400 hover:text-rose-300 hover:bg-rose-950/30'
                      : 'text-rose-600 hover:text-rose-700 hover:bg-rose-50'
                  }`}
                >
                  <span>Sign Out</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </button>
              )}
            </div>
          )}

          {/* Admin Identity Card */}
          <div className={`p-2.5 rounded-xl flex items-center gap-2.5 ${
            theme === 'dark' ? 'bg-neutral-950/60' : 'bg-white border border-slate-200'
          }`}>
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-700 to-indigo-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
              R
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold truncate leading-none mb-0.5">root.admin</div>
                <div className="text-[10px] opacity-60 truncate">Root Administrator</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ====================================================================
          MAIN CONTENT AREA (Right of Sidebar)
          ==================================================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Operational Bar */}
        <header className={`sticky top-0 z-30 px-6 py-3.5 border-b backdrop-blur-md flex items-center justify-between ${
          theme === 'dark' 
            ? 'bg-neutral-900/90 border-neutral-800' 
            : 'bg-white/90 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className={`md:hidden p-2 rounded-xl transition cursor-pointer ${
                theme === 'dark' ? 'bg-neutral-800 text-white' : 'bg-slate-100 text-slate-900'
              }`}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Path */}
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>SuperAdmin</span>
                <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600" />
                <span className="font-semibold text-slate-900 dark:text-slate-100">{currentTabName}</span>
              </div>
              <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">{currentTabName}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Live Gateway Telemetry Pill */}
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
              theme === 'dark' 
                ? 'bg-slate-900/90 border-slate-800 text-slate-300' 
                : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[11px]">3/3 Clusters Online</span>
              <span className="opacity-50 font-mono text-[11px]">({stats.averageUptime}%)</span>
            </div>

            {/* Quick Header Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition cursor-pointer flex items-center justify-center ${
                theme === 'dark'
                  ? 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-slate-800'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
              title={`Currently in ${theme} mode. Click to toggle.`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Jump to Member Portal Action */}
            <button
              onClick={onNavigateMember}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs shrink-0 border ${
                theme === 'dark'
                  ? 'bg-white hover:bg-slate-100 text-slate-950 border-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900'
              }`}
            >
              <span>Subscriber Portal</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Inner Scrollable Workspace */}
        <main className="p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6 flex-1">
          {/* Admin Feedback Toast */}
          {adminNotice && (
            <div className={`p-3.5 border rounded-2xl text-xs flex items-center justify-between gap-3 animate-fade-in shadow-xl backdrop-blur-sm ${
              theme === 'dark' 
                ? 'bg-slate-900 border-slate-800 text-slate-200' 
                : 'bg-slate-900 text-white border-slate-900'
            }`}>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="font-medium">{adminNotice}</span>
              </div>
              <button
                onClick={() => setAdminNotice(null)}
                className="opacity-70 hover:opacity-100 text-xs cursor-pointer px-2 py-0.5"
              >
                ✕
              </button>
            </div>
          )}

          {/* Global Executive SaaS Metrics Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className={`rounded-2xl border p-4 space-y-1 transition ${
              theme === 'dark' 
                ? 'bg-[#0f1523] border-slate-800/80 shadow-xs' 
                : 'bg-white border-slate-200/80 shadow-xs'
            }`}>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Monthly Recurring Revenue</span>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">${stats.mrr.toLocaleString()}</div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <span>+18.4% MRR velocity</span>
              </span>
            </div>

            <div className={`rounded-2xl border p-4 space-y-1 transition ${
              theme === 'dark' 
                ? 'bg-[#0f1523] border-slate-800/80 shadow-xs' 
                : 'bg-white border-slate-200/80 shadow-xs'
            }`}>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Business Tenants</span>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">{tenants.length} Active</div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">{plans.length} subscription tiers</span>
            </div>

            <div className={`rounded-2xl border p-4 space-y-1 transition ${
              theme === 'dark' 
                ? 'bg-[#0f1523] border-slate-800/80 shadow-xs' 
                : 'bg-white border-slate-200/80 shadow-xs'
            }`}>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Connected WhatsApp Sockets</span>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
                {tenants.filter(t => t.whatsappAccount?.status === 'connected').length} Online
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Distributed across 3 clusters</span>
            </div>

            <div className={`rounded-2xl border p-4 space-y-1 transition ${
              theme === 'dark' 
                ? 'bg-[#0f1523] border-slate-800/80 shadow-xs' 
                : 'bg-white border-slate-200/80 shadow-xs'
            }`}>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Messages Routed (30d)</span>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">{(stats.totalMessagesMonthly / 1000000).toFixed(2)}M</div>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">99.85% Delivered</span>
            </div>

            <div className={`rounded-2xl border p-4 space-y-1 transition ${
              theme === 'dark' 
                ? 'bg-[#0f1523] border-slate-800/80 shadow-xs' 
                : 'bg-white border-slate-200/80 shadow-xs'
            }`}>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Cluster Uptime & Health</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">{stats.averageUptime}%</div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{stats.serverLoad}</span>
            </div>
          </div>

          {/* Active Module View */}
          <div className="pt-2">
            {activeTab === 'subscribers' && (
              <SuperAdminSubscribers
                tenants={tenants}
                plans={plans}
                onSelectTenant={onSelectTenant}
                onUpdateTenant={handleWrapUpdateTenant}
                onAddTenant={handleWrapAddTenant}
                onDeleteTenant={handleWrapDeleteTenant}
                onNavigateMember={onNavigateMember}
                onShowNotice={showNotice}
              />
            )}

            {activeTab === 'packages' && (
              <SuperAdminPackages
                plans={plans}
                onUpdatePlan={handleUpdatePlan}
                onAddPlan={handleAddPlan}
                onDeletePlan={handleDeletePlan}
                onShowNotice={showNotice}
              />
            )}

            {activeTab === 'invoices' && (
              <SuperAdminInvoices
                invoices={invoices}
                tenants={tenants}
                onAddInvoice={handleAddInvoice}
                onUpdateInvoice={handleUpdateInvoice}
                onDeleteInvoice={handleDeleteInvoice}
                onShowNotice={showNotice}
              />
            )}

            {activeTab === 'users' && (
              <SuperAdminUsers
                users={saasUsers}
                tenants={tenants}
                onAddUser={handleAddUser}
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
                onShowNotice={showNotice}
              />
            )}

            {activeTab === 'cluster' && (
              <SuperAdminInfrastructure
                nodes={clusterNodes}
                onShowNotice={showNotice}
              />
            )}

            {activeTab === 'vps' && (
              <SuperAdminVpsGuide
                onShowNotice={showNotice}
              />
            )}

            {activeTab === 'database' && (
              <DatabaseGuideView
                onShowNotice={showNotice}
              />
            )}

            {activeTab === 'audit' && (
              <SuperAdminAuditLogs
                logs={auditLogs}
                onShowNotice={showNotice}
              />
            )}

            {activeTab === 'announcements' && (
              <SuperAdminAnnouncements
                announcements={announcements}
                onAddAnnouncement={handleAddAnnouncement}
                onUpdateAnnouncement={handleUpdateAnnouncement}
                onDeleteAnnouncement={handleDeleteAnnouncement}
                onShowNotice={showNotice}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
