import React, { useState } from 'react';
import { SaaSUser, Tenant } from '../../types';
import { 
  Users, 
  Search, 
  Plus, 
  ShieldCheck, 
  ShieldAlert, 
  Key, 
  Lock, 
  RotateCcw, 
  Trash2, 
  Edit, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Building2, 
  Mail, 
  Phone,
  UserCheck
} from 'lucide-react';

interface SuperAdminUsersProps {
  users: SaaSUser[];
  tenants: Tenant[];
  onAddUser: (newUser: SaaSUser) => void;
  onUpdateUser: (updatedUser: SaaSUser) => void;
  onDeleteUser: (userId: string) => void;
  onShowNotice: (msg: string) => void;
}

export const SuperAdminUsers: React.FC<SuperAdminUsersProps> = ({
  users,
  tenants,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onShowNotice,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SaaSUser | null>(null);

  // New user form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<'superadmin' | 'billing_admin' | 'support_agent' | 'tenant_owner' | 'tenant_operator'>('support_agent');
  const [newTenantId, setNewTenantId] = useState<string>('');
  const [newRequire2FA, setNewRequire2FA] = useState(true);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.tenantName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const assignedTenant = tenants.find(t => t.id === newTenantId);

    const newUser: SaaSUser = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: newName,
      email: newEmail,
      phone: newPhone || undefined,
      role: newRole,
      tenantId: assignedTenant?.id,
      tenantName: assignedTenant?.name,
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80`,
      status: 'invited',
      twoFactorEnabled: newRequire2FA,
      lastLoginAt: 'Never (Invite sent)',
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAddUser(newUser);
    setIsInviteModalOpen(false);
    resetForm();
    onShowNotice(`Invitation email sent to ${newUser.email} with role: ${newUser.role.toUpperCase()}`);
  };

  const resetForm = () => {
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewRole('support_agent');
    setNewTenantId('');
    setNewRequire2FA(true);
  };

  const handleUpdateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    onUpdateUser(editingUser);
    onShowNotice(`Updated user profile for ${editingUser.name}`);
    setEditingUser(null);
  };

  const handleToggleStatus = (user: SaaSUser) => {
    const nextStatus = user.status === 'suspended' ? 'active' : 'suspended';
    const updated = { ...user, status: nextStatus as any };
    onUpdateUser(updated);
    onShowNotice(`User ${user.name} status updated to: ${nextStatus.toUpperCase()}`);
  };

  const handleReset2FA = (user: SaaSUser) => {
    if (confirm(`Reset Two-Factor Authentication (2FA) for ${user.name}? They will be forced to re-enroll on their next login.`)) {
      const updated = { ...user, twoFactorEnabled: false };
      onUpdateUser(updated);
      onShowNotice(`2FA reset for ${user.name}. Enrollment requirement flagged.`);
    }
  };

  const handleRevokeSessions = (user: SaaSUser) => {
    onShowNotice(`All active OAuth and browser sessions revoked for ${user.name}.`);
  };

  const handleDelete = (user: SaaSUser) => {
    if (confirm(`Permanently remove user ${user.name} (${user.email})?`)) {
      onDeleteUser(user.id);
      onShowNotice(`User account ${user.email} deleted.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900/70 p-5 rounded-2xl border border-neutral-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>SaaS Platform & Tenant User Management</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
              {users.length} Team Accounts
            </span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Manage platform superadmins, billing personnel, support technicians, and subscriber workspace owners.
          </p>
        </div>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-purple-900/30"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Invite / Add User</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by full name, email address, role, or tenant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <Filter className="w-3.5 h-3.5 text-neutral-500" />
            <span>Role:</span>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600 cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="superadmin">Superadmin</option>
            <option value="billing_admin">Billing Admin</option>
            <option value="support_agent">Support Agent</option>
            <option value="tenant_owner">Tenant Owner</option>
            <option value="tenant_operator">Tenant Operator</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs text-neutral-400 ml-2">
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="invited">Invited</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">User Details</th>
                <th className="py-3.5 px-4 font-semibold">Role & Access</th>
                <th className="py-3.5 px-4 font-semibold">Organization Scope</th>
                <th className="py-3.5 px-4 font-semibold">Security / 2FA</th>
                <th className="py-3.5 px-4 font-semibold">Last Login</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-neutral-300">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium">No users match your criteria</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isGlobalAdmin = u.role === 'superadmin' || u.role === 'billing_admin' || u.role === 'support_agent';

                  return (
                    <tr key={u.id} className="hover:bg-neutral-800/40 transition">
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatarUrl}
                            alt={u.name}
                            referrerPolicy="no-referrer"
                            className="w-9 h-9 rounded-full object-cover border border-neutral-700 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-white text-xs">{u.name}</div>
                            <div className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-neutral-500" />
                              <span>{u.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                          u.role === 'superadmin'
                            ? 'bg-purple-950 text-purple-300 border border-purple-800'
                            : u.role === 'billing_admin'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : u.role === 'support_agent'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800'
                            : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                        }`}>
                          <ShieldCheck className="w-2.5 h-2.5" />
                          <span>{u.role.replace('_', ' ')}</span>
                        </span>
                      </td>

                      {/* Scope */}
                      <td className="py-3.5 px-4">
                        {isGlobalAdmin ? (
                          <div className="text-emerald-400 font-semibold text-xs flex items-center gap-1">
                            <span>Global (All Tenants)</span>
                          </div>
                        ) : (
                          <div>
                            <div className="font-medium text-white text-xs">{u.tenantName || 'Unassigned'}</div>
                            <div className="text-[10px] text-neutral-500 font-mono">{u.tenantId}</div>
                          </div>
                        )}
                      </td>

                      {/* 2FA */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${u.twoFactorEnabled ? 'bg-emerald-400' : 'bg-neutral-600'}`} />
                          <span className={u.twoFactorEnabled ? 'text-emerald-400 text-xs font-medium' : 'text-neutral-500 text-xs'}>
                            {u.twoFactorEnabled ? 'Enforced' : 'Disabled'}
                          </span>
                        </div>
                      </td>

                      {/* Last Login */}
                      <td className="py-3.5 px-4">
                        <span className="text-neutral-400 text-xs font-mono">{u.lastLoginAt}</span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition cursor-pointer ${
                            u.status === 'suspended'
                              ? 'bg-red-950 text-red-300 border-red-800'
                              : u.status === 'invited'
                              ? 'bg-amber-950 text-amber-300 border-amber-800'
                              : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          }`}
                          title="Toggle active / suspended status"
                        >
                          {u.status.toUpperCase()}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingUser(u)}
                            className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg transition cursor-pointer"
                            title="Edit Role & Details"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleReset2FA(u)}
                            className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-400 rounded-lg transition cursor-pointer"
                            title="Reset 2FA Authentication"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleRevokeSessions(u)}
                            className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white rounded-lg transition cursor-pointer"
                            title="Revoke Active Sessions"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDelete(u)}
                            className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-500 hover:text-red-400 rounded-lg transition cursor-pointer"
                            title="Delete User"
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

      {/* INVITE USER MODAL */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl p-6 space-y-5 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto text-neutral-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Invite Platform or Tenant User</h3>
                  <p className="text-xs text-neutral-400">Configure role privileges, organization affiliation, and MFA requirements</p>
                </div>
              </div>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="text-neutral-500 hover:text-white text-xs cursor-pointer px-2 py-1 bg-neutral-800 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInviteUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jordan Miller"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="jordan.miller@company.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">User Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                  >
                    <option value="superadmin">Superadmin (Full Root Access)</option>
                    <option value="billing_admin">Billing Admin (Finance & Invoices)</option>
                    <option value="support_agent">Support Agent (Diagnostics & Logs)</option>
                    <option value="tenant_owner">Tenant Owner (Single Org Admin)</option>
                    <option value="tenant_operator">Tenant Operator (Staff Member)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Phone Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 019-2834"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              {/* Organization Scope */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-300">Tenant / Organization Scope</label>
                <select
                  value={newTenantId}
                  onChange={(e) => setNewTenantId(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                >
                  <option value="">Global / All Tenants (Platform Staff)</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.id})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-neutral-500">
                  Global staff have platform-wide permissions. Tenant roles are restricted solely to their assigned company.
                </p>
              </div>

              <div className="pt-2 border-t border-neutral-800">
                <label className="flex items-center gap-2 text-xs font-medium text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newRequire2FA}
                    onChange={(e) => setNewRequire2FA(e.target.checked)}
                    className="rounded text-purple-600"
                  />
                  <span>Enforce Two-Factor Authentication (Authenticator TOTP)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-lg shadow-purple-900/30"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl p-6 space-y-5 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto text-neutral-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <Edit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Edit User: {editingUser.name}</h3>
                  <p className="text-xs text-neutral-400 font-mono">{editingUser.id}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-neutral-500 hover:text-white text-xs cursor-pointer px-2 py-1 bg-neutral-800 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateUserSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Role</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                  >
                    <option value="superadmin">Superadmin</option>
                    <option value="billing_admin">Billing Admin</option>
                    <option value="support_agent">Support Agent</option>
                    <option value="tenant_owner">Tenant Owner</option>
                    <option value="tenant_operator">Tenant Operator</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Account Status</label>
                  <select
                    value={editingUser.status}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                  >
                    <option value="active">Active</option>
                    <option value="invited">Invited</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-800">
                <label className="flex items-center gap-2 text-xs font-medium text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingUser.twoFactorEnabled}
                    onChange={(e) => setEditingUser({ ...editingUser, twoFactorEnabled: e.target.checked })}
                    className="rounded text-purple-600"
                  />
                  <span>Two-Factor Authentication (2FA) Enforced</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
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
