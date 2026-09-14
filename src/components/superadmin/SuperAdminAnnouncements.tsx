import React, { useState } from 'react';
import { SystemAnnouncement } from '../../types';
import { 
  Megaphone, 
  Plus, 
  AlertTriangle, 
  Info, 
  AlertOctagon, 
  Trash2, 
  CheckCircle2, 
  Eye, 
  Power, 
  ExternalLink,
  Users
} from 'lucide-react';

interface SuperAdminAnnouncementsProps {
  announcements: SystemAnnouncement[];
  onAddAnnouncement: (item: SystemAnnouncement) => void;
  onUpdateAnnouncement: (item: SystemAnnouncement) => void;
  onDeleteAnnouncement: (id: string) => void;
  onShowNotice: (msg: string) => void;
}

export const SuperAdminAnnouncements: React.FC<SuperAdminAnnouncementsProps> = ({
  announcements,
  onAddAnnouncement,
  onUpdateAnnouncement,
  onDeleteAnnouncement,
  onShowNotice,
}) => {
  const [items, setItems] = useState<SystemAnnouncement[]>(announcements);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [maintenanceModeActive, setMaintenanceModeActive] = useState(false);

  // New announcement state
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newType, setNewType] = useState<'info' | 'warning' | 'urgent'>('info');
  const [newTarget, setNewTarget] = useState<'all' | 'trial' | 'enterprise'>('all');
  const [newLinkText, setNewLinkText] = useState('View Status');
  const [newLinkUrl, setNewLinkUrl] = useState('https://status.whatscrm.cloud');

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMessage.trim()) return;

    const created: SystemAnnouncement = {
      id: `ann-${Date.now()}`,
      title: newTitle,
      message: newMessage,
      type: newType,
      targetAudience: newTarget,
      isActive: true,
      active: true,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
      linkText: newLinkText || undefined,
      linkUrl: newLinkUrl || undefined,
    };

    onAddAnnouncement(created);
    setItems([created, ...items]);
    setIsCreateModalOpen(false);
    resetForm();
    onShowNotice(`System broadcast "${created.title}" dispatched across tenant portals!`);
  };

  const resetForm = () => {
    setNewTitle('');
    setNewMessage('');
    setNewType('info');
    setNewTarget('all');
    setNewLinkText('View Status');
    setNewLinkUrl('https://status.whatscrm.cloud');
  };

  const handleToggleActive = (ann: SystemAnnouncement) => {
    const isCurrentlyActive = ann.isActive ?? ann.active ?? true;
    const nextActive = !isCurrentlyActive;
    const updated = { ...ann, isActive: nextActive, active: nextActive };
    onUpdateAnnouncement(updated);
    setItems(items.map(i => i.id === ann.id ? updated : i));
    onShowNotice(`Broadcast banner "${ann.title}" set to ${nextActive ? 'ACTIVE' : 'INACTIVE'}`);
  };

  const handleDelete = (ann: SystemAnnouncement) => {
    if (confirm(`Delete announcement "${ann.title}"?`)) {
      onDeleteAnnouncement(ann.id);
      setItems(items.filter(i => i.id !== ann.id));
      onShowNotice(`Announcement "${ann.title}" removed.`);
    }
  };

  const handleToggleMaintenance = () => {
    const next = !maintenanceModeActive;
    setMaintenanceModeActive(next);
    if (next) {
      onShowNotice('⚠️ PLATFORM MAINTENANCE MODE ACTIVATED. Read-only banner displayed across all portals.');
    } else {
      onShowNotice('✅ Maintenance mode deactivated. Normal operations resumed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900/70 p-5 rounded-2xl border border-neutral-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>System Broadcasts & Tenant Announcements</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
              {items.filter(i => i.active).length} Active Banners
            </span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Push real-time alert ribbons and maintenance notices to subscriber dashboards and customer portals.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-purple-900/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Broadcast</span>
          </button>
        </div>
      </div>

      {/* Emergency Maintenance Mode Banner Card */}
      <div className={`p-4 rounded-2xl border transition ${
        maintenanceModeActive
          ? 'bg-red-950/40 border-red-800 text-red-200'
          : 'bg-neutral-900 border-neutral-800 text-neutral-300'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              maintenanceModeActive ? 'bg-red-900/60 text-red-300 border border-red-700' : 'bg-neutral-800 text-neutral-400'
            }`}>
              <Power className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm flex items-center gap-2">
                <span>Platform Emergency Maintenance Killswitch</span>
                {maintenanceModeActive && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-red-600 text-white animate-pulse">
                    Live Maintenance Active
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Forces a global read-only notification across every subscriber workspace while database maintenance is performed.
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleMaintenance}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 border ${
              maintenanceModeActive
                ? 'bg-red-600 hover:bg-red-500 text-white border-red-500 shadow-lg shadow-red-900/40'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
            }`}
          >
            {maintenanceModeActive ? 'Deactivate Maintenance' : 'Activate Maintenance Mode'}
          </button>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-12 text-center text-neutral-500">
            <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium">No system broadcasts configured</p>
          </div>
        ) : (
          items.map((ann) => {
            const isAnnActive = ann.isActive ?? ann.active ?? true;
            return (
              <div
                key={ann.id}
                className={`bg-neutral-900 rounded-2xl border p-5 transition ${
                  isAnnActive
                    ? 'border-neutral-700 bg-neutral-900/90 shadow-lg'
                    : 'border-neutral-800/60 opacity-60'
                }`}
              >
                {/* Live banner preview */}
                <div className="mb-4">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-2">Live Banner Appearance</span>
                  <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                    ann.type === 'urgent'
                      ? 'bg-red-950/70 text-red-200 border-red-800/80'
                      : ann.type === 'warning'
                      ? 'bg-amber-950/70 text-amber-200 border-amber-800/80'
                      : 'bg-blue-950/70 text-blue-200 border-blue-800/80'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      {ann.type === 'urgent' ? (
                        <AlertOctagon className="w-4 h-4 text-red-400 shrink-0" />
                      ) : ann.type === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      ) : (
                        <Info className="w-4 h-4 text-blue-400 shrink-0" />
                      )}
                      <div>
                        <span className="font-bold">{ann.title}: </span>
                        <span>{ann.message}</span>
                      </div>
                    </div>

                    {ann.linkUrl && (
                      <span className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-[11px] font-bold underline flex items-center gap-1 shrink-0">
                        <span>{ann.linkText || 'Details'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Metadata & Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-neutral-800 text-xs text-neutral-400">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1 text-white font-medium">
                      <Users className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Audience: <strong className="uppercase text-purple-300">{ann.targetAudience}</strong></span>
                    </span>
                    <span>•</span>
                    <span className="font-mono text-[11px]">Posted: {ann.createdAt}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(ann)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                        isAnnActive
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                          : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
                      }`}
                    >
                      {isAnnActive ? 'ACTIVE (Broadcasting)' : 'INACTIVE (Hidden)'}
                    </button>

                    <button
                      onClick={() => handleDelete(ann)}
                      className="p-1.5 text-neutral-500 hover:text-red-400 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition cursor-pointer"
                      title="Delete Announcement"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATE ANNOUNCEMENT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl p-6 space-y-5 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto text-neutral-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Publish System Broadcast Banner</h3>
                  <p className="text-xs text-neutral-400">Display prominent notice across member portals</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-neutral-500 hover:text-white text-xs cursor-pointer px-2 py-1 bg-neutral-800 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-300">Broadcast Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scheduled Network Upgrade"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-300">Broadcast Message *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Singapore cluster nodes undergoing maintenance on Sep 20 between 02:00-03:00 UTC."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Alert Visual Severity</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                  >
                    <option value="info">Info (Blue ribbon)</option>
                    <option value="warning">Warning (Amber ribbon)</option>
                    <option value="urgent">Urgent / Critical (Red ribbon)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Target Audience Scope</label>
                  <select
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value as any)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                  >
                    <option value="all">All Subscribers (Platform-wide)</option>
                    <option value="trial">Trial Accounts Only</option>
                    <option value="enterprise">Enterprise Tier Clients Only</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Action Button Text</label>
                  <input
                    type="text"
                    value={newLinkText}
                    onChange={(e) => setNewLinkText(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Action Button URL</label>
                  <input
                    type="text"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                  />
                </div>
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
                  Dispatch Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
