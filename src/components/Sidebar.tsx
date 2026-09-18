import React, { useState } from 'react';
import { NavigationTab } from '../types';
import { 
  Zap, 
  MessageSquare, 
  Smartphone, 
  Terminal, 
  Database, 
  ChevronDown, 
  ChevronRight, 
  Layers, 
  CreditCard, 
  Flame, 
  Car, 
  Cable, 
  Settings, 
  Globe2, 
  Sliders, 
  ArrowUpRight,
  Server,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  unreadCount: number;
  activeWorkflowsCount: number;
  isConnected: boolean;
  tripboneEnabled?: boolean;
  onNavigateLanding?: () => void;
  onNavigateSuperAdmin?: () => void;
  onNavigateLogin?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  unreadCount,
  activeWorkflowsCount,
  isConnected,
  tripboneEnabled = true,
  onNavigateLanding,
  onNavigateSuperAdmin,
  onNavigateLogin,
}) => {
  const [showAdvancedTools, setShowAdvancedTools] = useState(false);

  // 5 Simplified Core Primary Tabs
  const coreTabs = [
    {
      id: 'workflows' as NavigationTab,
      label: 'Automations & Bots',
      icon: Zap,
      badge: `${activeWorkflowsCount} Active`,
      badgeColor: 'bg-emerald-100 text-emerald-800 font-bold',
      highlight: true,
    },
    {
      id: 'inbox' as NavigationTab,
      label: 'Live Chat & Inbox',
      icon: MessageSquare,
      badge: unreadCount > 0 ? `${unreadCount}` : null,
      badgeColor: 'bg-emerald-500 text-white font-bold',
    },
    {
      id: 'channels' as NavigationTab,
      label: 'WhatsApp Device',
      icon: Smartphone,
      badge: isConnected ? 'Connected' : 'Scan QR',
      badgeColor: isConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 font-bold',
    },
    {
      id: 'api-explorer' as NavigationTab,
      label: 'API & Webhooks',
      icon: Terminal,
      badge: 'Live',
      badgeColor: 'bg-slate-100 text-slate-700',
    },
    {
      id: 'database' as NavigationTab,
      label: 'Database & Hosting',
      icon: Database,
      badge: 'Guide',
      badgeColor: 'bg-blue-100 text-blue-800 font-bold',
    },
  ];

  // Secondary Tools (cleanly grouped)
  const secondaryTabs = [
    {
      id: 'overview' as NavigationTab,
      label: 'Telemetry & Stats',
      icon: Settings,
    },
    {
      id: 'warming' as NavigationTab,
      label: 'Number Warming',
      icon: Flame,
    },
    ...(tripboneEnabled ? [
      {
        id: 'tripbone' as NavigationTab,
        label: 'Tripbone Tour Suite',
        icon: Cable,
      },
      {
        id: 'driver-dispatch' as NavigationTab,
        label: 'Driver Dispatch',
        icon: Car,
      },
    ] : []),
    {
      id: 'billing' as NavigationTab,
      label: 'Plans & Billing',
      icon: CreditCard,
    },
    {
      id: 'production' as NavigationTab,
      label: 'Production & Deploy',
      icon: Server,
    },
    {
      id: 'integrations' as NavigationTab,
      label: 'Zapier & Webhooks',
      icon: Layers,
    },
  ];

  const isSecondaryActive = secondaryTabs.some(t => t.id === currentTab);

  return (
    <aside className="w-64 border-r border-slate-200/90 bg-slate-50/70 flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] select-none">
      <div className="p-3 space-y-4 overflow-y-auto">
        {/* Core Simple Navigation */}
        <div className="space-y-1">
          <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Main Workspace
          </div>

          {coreTabs.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-tab-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-2 py-0.5 rounded text-[10px] shrink-0 ${
                    isActive ? 'bg-slate-800 text-slate-200' : item.badgeColor
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Collapsible More Tools */}
        <div className="space-y-1 pt-2 border-t border-slate-200/80">
          <button
            onClick={() => setShowAdvancedTools(!showAdvancedTools)}
            className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-bold text-slate-400 hover:text-slate-700 uppercase tracking-wider transition cursor-pointer"
          >
            <span>Additional Utilities</span>
            {showAdvancedTools ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {(showAdvancedTools || isSecondaryActive) && (
            <div className="space-y-0.5 pt-1">
              {secondaryTabs.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`sidebar-tab-${item.id}`}
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs font-semibold'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Switcher Area */}
      <div className="p-3 border-t border-slate-200/90 space-y-1.5 bg-white/60">
        {onNavigateLanding && (
          <button
            onClick={onNavigateLanding}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer font-medium"
          >
            <div className="flex items-center gap-2">
              <Globe2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Public Portal</span>
            </div>
            <ArrowUpRight className="w-3 h-3 text-slate-400" />
          </button>
        )}

        {onNavigateSuperAdmin && (
          <button
            onClick={onNavigateSuperAdmin}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-purple-700 bg-purple-50 hover:bg-purple-100/80 transition cursor-pointer font-bold border border-purple-200/60"
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-purple-600" />
              <span>SuperAdmin Room</span>
            </div>
            <span className="text-[10px] font-mono bg-purple-200 text-purple-950 px-1.5 py-0.5 rounded">
              ROOT
            </span>
          </button>
        )}

        {onNavigateLogin && (
          <button
            onClick={onNavigateLogin}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer font-medium"
          >
            <div className="flex items-center gap-2">
              <LogOut className="w-3.5 h-3.5 text-rose-500" />
              <span>Sign Out</span>
            </div>
          </button>
        )}
      </div>
    </aside>
  );
};
