import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/apiClient';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/StatusBadge';
import {
  Users, UserPlus, Shield, Briefcase, Building2, User as UserIcon,
  Search, Edit2, Trash2, ChevronDown, Check, X, Mail, Lock
} from 'lucide-react';

type Role = 'Admin' | 'Asset Manager' | 'Department Head' | 'Employee';

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  departmentId?: string | null;
  status: 'Active' | 'Inactive';
  joinedAt: string;
  avatar?: string;
}

interface Department {
  id: string;
  name: string;
}

const ROLE_CONFIG: Record<Role, { icon: React.ElementType; color: string; bg: string; permissions: string[] }> = {
  Admin: {
    icon: Shield,
    color: '#dc3545',
    bg: 'bg-red-50',
    permissions: [
      'Manages departments, asset categories, audit cycles',
      'Employee & role assignment (Organization Setup)',
      'Views organization-wide analytics',
      'Full access to all modules',
    ],
  },
  'Asset Manager': {
    icon: Briefcase,
    color: '#0d6efd',
    bg: 'bg-blue-50',
    permissions: [
      'Registers and allocates assets',
      'Approves transfers & maintenance requests',
      'Approves asset returns & condition check-in',
      'Audit discrepancy resolution',
    ],
  },
  'Department Head': {
    icon: Building2,
    color: '#198754',
    bg: 'bg-green-50',
    permissions: [
      'Views assets allocated to their department',
      'Approves allocation/transfer within department',
      'Books shared resources on behalf of department',
      'Access to audit & reports',
    ],
  },
  Employee: {
    icon: UserIcon,
    color: '#6c757d',
    bg: 'bg-gray-50',
    permissions: [
      'Views assets allocated to them',
      'Books shared resources',
      'Raises maintenance requests',
      'Initiates return/transfer requests',
    ],
  },
};

const ROLES: Role[] = ['Admin', 'Asset Manager', 'Department Head', 'Employee'];

const EMPTY_FORM = { name: '', email: '', role: 'Employee' as Role, department: 'Unassigned', status: 'Active' as 'Active' | 'Inactive' };

export function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<Role | 'All'>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ManagedUser | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [showRoleDetails, setShowRoleDetails] = useState<Role | null>(null);

  const departmentOptions = useMemo(
    () => ['Unassigned', ...departments.map(d => d.name)],
    [departments]
  );

  const fetchUsers = useCallback(async () => {
    try {
      const res = await apiClient.get<ManagedUser[]>('/users');
      setUsers(res.data);
    } catch (e) {
      console.error('Failed to fetch users', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await apiClient.get<Department[]>('/departments');
      setDepartments(res.data);
    } catch (e) {
      console.error('Failed to fetch departments', e);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, [fetchUsers, fetchDepartments]);

  const filtered = useMemo(() => {
    return users.filter(u => {
      const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.department.toLowerCase().includes(search.toLowerCase());
      const matchRole = filterRole === 'All' || u.role === filterRole;
      const matchStatus = filterStatus === 'All' || u.status === filterStatus;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, filterRole, filterStatus]);

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.status === 'Active').length,
    byRole: ROLES.map(r => ({ role: r, count: users.filter(u => u.role === r).length })),
  }), [users]);

  const openCreate = () => {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setShowModal(true);
  };

  const openEdit = (u: ManagedUser) => {
    setEditingUser(u);
    setForm({ name: u.name, email: u.email, role: u.role, department: u.department, status: u.status });
    setFormError(null);
    setShowModal(true);
  };

  const resolveDepartmentId = (departmentName: string) => {
    if (departmentName === 'Unassigned') return null;
    return departments.find(d => d.name === departmentName)?.id ?? null;
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setFormError('Name and email are required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setFormError('Please enter a valid email address.');
      return;
    }
    const emailExists = users.some(u => u.email === form.email && u.id !== editingUser?.id);
    if (emailExists) {
      setFormError('This email is already in use.');
      return;
    }

    try {
      if (editingUser) {
        const updates: Promise<unknown>[] = [];
        if (form.role !== editingUser.role) {
          updates.push(apiClient.patch(`/users/${editingUser.id}/role`, { role: form.role }));
        }
        if (form.status !== editingUser.status) {
          updates.push(apiClient.patch(`/users/${editingUser.id}/status`, { status: form.status }));
        }
        const newDepartmentId = resolveDepartmentId(form.department);
        const currentDepartmentId = editingUser.departmentId ?? null;
        if (newDepartmentId !== currentDepartmentId) {
          updates.push(apiClient.patch(`/users/${editingUser.id}/department`, { departmentId: newDepartmentId }));
        }
        await Promise.all(updates);
      } else {
        const res = await apiClient.post<{ id: string }>('/auth/signup', {
          name: form.name.trim(),
          email: form.email.trim(),
          password: 'AssetFlow1!',
        });
        const userId = res.data.id;
        const updates: Promise<unknown>[] = [];
        if (form.role !== 'Employee') {
          updates.push(apiClient.patch(`/users/${userId}/role`, { role: form.role }));
        }
        const departmentId = resolveDepartmentId(form.department);
        if (departmentId) {
          updates.push(apiClient.patch(`/users/${userId}/department`, { departmentId }));
        }
        await Promise.all(updates);
      }
      await fetchUsers();
      setShowModal(false);
    } catch (e: unknown) {
      const message = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setFormError(message || 'Failed to save user. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteError(null);
    try {
      await apiClient.delete(`/users/${deleteTarget.id}`);
      setDeleteTarget(null);
      await fetchUsers();
    } catch (e: unknown) {
      const message = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setDeleteError(message || 'Failed to delete user. Please try again.');
    }
  };

  const toggleStatus = async (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await apiClient.patch(`/users/${id}/status`, { status: newStatus });
      await fetchUsers();
    } catch (e) {
      console.error('Failed to update user status', e);
    }
  };

  const RoleIcon = ({ role }: { role: Role }) => {
    const Icon = ROLE_CONFIG[role].icon;
    return <Icon className="w-4 h-4" style={{ color: ROLE_CONFIG[role].color }} />;
  };

  return (
    <div className="p-8 font-sans max-w-[1400px] mx-auto">
      <PageHeader
        title="User Management"
        description="Manage user accounts, assign roles, and control access permissions across the organization."
        actions={
          <Button variant="primary" onClick={openCreate} className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Add User
          </Button>
        }
      />

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <div className="col-span-2 lg:col-span-2 bg-white border border-[#dee2e6] rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#6c757d]/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#6c757d]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#212529]">{stats.total}</p>
              <p className="text-xs text-[#6c757d] font-semibold">Total Users · {stats.active} Active</p>
            </div>
          </div>
        </div>
        {stats.byRole.map(({ role, count }) => {
          const cfg = ROLE_CONFIG[role];
          const Icon = cfg.icon;
          return (
            <div
              key={role}
              onClick={() => setShowRoleDetails(showRoleDetails === role ? null : role)}
              className={`bg-white border rounded-xl p-4 shadow-sm cursor-pointer transition-all hover:shadow-md ${showRoleDetails === role ? 'border-[#6c757d]' : 'border-[#dee2e6]'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                <span className="text-xl font-bold text-[#212529]">{count}</span>
              </div>
              <p className="text-xs text-[#6c757d] font-semibold truncate">{role}</p>
            </div>
          );
        })}
      </div>

      {/* Role Detail Panel */}
      {showRoleDetails && (
        <div className={`mb-6 p-5 rounded-xl border border-[#dee2e6] shadow-sm ${ROLE_CONFIG[showRoleDetails].bg} animate-fade-in`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <RoleIcon role={showRoleDetails} />
              <h3 className="font-bold text-[#212529]" style={{ color: ROLE_CONFIG[showRoleDetails].color }}>{showRoleDetails} — Permissions</h3>
            </div>
            <button onClick={() => setShowRoleDetails(null)} className="text-[#6c757d] hover:text-[#212529]">
              <X className="w-4 h-4" />
            </button>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {ROLE_CONFIG[showRoleDetails].permissions.map((perm, i) => (
              <li key={i} className="flex items-start gap-2 text-[14px] text-[#495057]">
                <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: ROLE_CONFIG[showRoleDetails].color }} />
                {perm}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6c757d]" />
          <input
            type="text"
            placeholder="Search by name, email, department..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-white border border-[#ced4da] rounded-lg text-[14px] text-[#212529] placeholder-[#6c757d] focus:outline-none focus:border-[#6c757d] transition-all"
          />
        </div>
        <select
          value={filterRole}
          onChange={e => setFilterRole(e.target.value as Role | 'All')}
          className="h-11 px-4 bg-white border border-[#ced4da] rounded-lg text-[14px] text-[#212529] focus:outline-none focus:border-[#6c757d] transition-all cursor-pointer"
        >
          <option value="All">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as 'All' | 'Active' | 'Inactive')}
          className="h-11 px-4 bg-white border border-[#ced4da] rounded-lg text-[14px] text-[#212529] focus:outline-none focus:border-[#6c757d] transition-all cursor-pointer"
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-[#dee2e6] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[14px]">
            <thead>
              <tr className="bg-[#f8f9fa] border-b border-[#dee2e6]">
                <th className="text-left font-bold text-[#495057] px-6 py-4">User</th>
                <th className="text-left font-bold text-[#495057] px-4 py-4">Role</th>
                <th className="text-left font-bold text-[#495057] px-4 py-4 hidden md:table-cell">Department</th>
                <th className="text-left font-bold text-[#495057] px-4 py-4 hidden lg:table-cell">Joined</th>
                <th className="text-left font-bold text-[#495057] px-4 py-4">Status</th>
                <th className="text-right font-bold text-[#495057] px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dee2e6]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-[#6c757d]">
                    <p className="font-semibold">Loading users...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-[#6c757d]">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-semibold">No users found</p>
                  </td>
                </tr>
              ) : (
                filtered.map(u => {
                  const cfg = ROLE_CONFIG[u.role];
                  const Icon = cfg.icon;
                  const isCurrentUser = u.email === currentUser?.email;
                  return (
                    <tr key={u.id} className={`hover:bg-[#f8f9fa] transition-colors ${u.status === 'Inactive' ? 'opacity-60' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-[14px] shrink-0"
                            style={{ backgroundColor: cfg.color }}
                          >
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-[#212529] truncate">
                              {u.name}
                              {isCurrentUser && <span className="ml-2 text-[10px] font-bold bg-[#6c757d]/10 text-[#6c757d] px-1.5 py-0.5 rounded-full">You</span>}
                            </p>
                            <p className="text-[12px] text-[#6c757d] truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 shrink-0" style={{ color: cfg.color }} />
                          <span className="font-semibold text-[#212529] whitespace-nowrap">{u.role}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell text-[#495057]">{u.department}</td>
                      <td className="px-4 py-4 hidden lg:table-cell text-[#6c757d]">{u.joinedAt}</td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => !isCurrentUser && toggleStatus(u.id)}
                          disabled={isCurrentUser}
                          title={isCurrentUser ? "Cannot change your own status" : `Set ${u.status === 'Active' ? 'Inactive' : 'Active'}`}
                          className="disabled:cursor-not-allowed"
                        >
                          <StatusBadge
                            status={u.status === 'Active' ? 'Available' : 'Disposed'}
                            className="cursor-pointer"
                          />
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(u)}
                            className="p-2 text-[#6c757d] hover:text-[#0d6efd] hover:bg-blue-50 rounded-lg transition-all"
                            title="Edit user"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteError(null);
                              setDeleteTarget(u);
                            }}
                            disabled={isCurrentUser}
                            className="p-2 text-[#6c757d] hover:text-[#dc3545] hover:bg-red-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            title={isCurrentUser ? "Cannot delete yourself" : "Delete user"}
                          >
                            <Trash2 className="w-4 h-4" />
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
        <div className="px-6 py-3 border-t border-[#dee2e6] bg-[#f8f9fa] text-[12px] text-[#6c757d] font-semibold">
          Showing {filtered.length} of {users.length} users
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingUser ? 'Edit User' : 'Add New User'}
        description={editingUser ? 'Update user information and role assignment.' : 'Create a new user account and assign a role.'}
      >
        <div className="space-y-4">
          {formError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-[13px] text-red-600 font-semibold">
              <X className="w-4 h-4 shrink-0" />
              {formError}
            </div>
          )}
          <div>
            <label className="block text-[13px] font-bold text-[#495057] mb-1.5">Full Name *</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6c757d]" />
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="John Doe"
                readOnly={!!editingUser}
                className={`w-full h-11 pl-10 pr-4 border border-[#ced4da] rounded-lg text-[14px] text-[#212529] focus:outline-none focus:border-[#6c757d] transition-all ${editingUser ? 'bg-[#f8f9fa] cursor-not-allowed' : ''}`}
              />
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-bold text-[#495057] mb-1.5">Email Address *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6c757d]" />
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="user@company.com"
                readOnly={!!editingUser}
                className={`w-full h-11 pl-10 pr-4 border border-[#ced4da] rounded-lg text-[14px] text-[#212529] focus:outline-none focus:border-[#6c757d] transition-all ${editingUser ? 'bg-[#f8f9fa] cursor-not-allowed' : ''}`}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-bold text-[#495057] mb-1.5">Role *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6c757d]" />
                <select
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value as Role }))}
                  className="w-full h-11 pl-10 pr-8 border border-[#ced4da] rounded-lg text-[14px] text-[#212529] focus:outline-none focus:border-[#6c757d] transition-all appearance-none cursor-pointer bg-white"
                >
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6c757d] pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-[13px] font-bold text-[#495057] mb-1.5">Department *</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6c757d]" />
                <select
                  value={form.department}
                  onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                  className="w-full h-11 pl-10 pr-8 border border-[#ced4da] rounded-lg text-[14px] text-[#212529] focus:outline-none focus:border-[#6c757d] transition-all appearance-none cursor-pointer bg-white"
                >
                  {departmentOptions.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6c757d] pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Role permissions preview */}
          <div className={`p-3 rounded-lg border border-[#dee2e6] ${ROLE_CONFIG[form.role].bg}`}>
            <p className="text-[12px] font-bold text-[#495057] mb-2 flex items-center gap-1.5">
              <RoleIcon role={form.role} />
              {form.role} can:
            </p>
            <ul className="space-y-1">
              {ROLE_CONFIG[form.role].permissions.map((p, i) => (
                <li key={i} className="text-[12px] text-[#495057] flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: ROLE_CONFIG[form.role].color }} />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-[#dee2e6]">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave}>
              {editingUser ? 'Save Changes' : 'Create User'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteError(null);
        }}
        title="Remove User"
        description="This action cannot be undone."
      >
        <div className="space-y-4">
          {deleteError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-[13px] text-red-600 font-semibold">
              <X className="w-4 h-4 shrink-0" />
              {deleteError}
            </div>
          )}
          <p className="text-[14px] text-[#495057]">
            Are you sure you want to remove <strong className="text-[#212529]">{deleteTarget?.name}</strong> ({deleteTarget?.email}) from the system?
          </p>
          <div className="flex justify-end gap-3 pt-2 border-t border-[#dee2e6]">
            <Button variant="outline" onClick={() => {
              setDeleteTarget(null);
              setDeleteError(null);
            }}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Remove User</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
