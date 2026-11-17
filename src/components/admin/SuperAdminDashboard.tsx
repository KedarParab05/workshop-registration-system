import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import { apiFetch } from '../../utils/api';
import {
  ShieldAlert,
  Users,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Search,
  RefreshCw,
  Lock,
  Unlock,
  FileText,
  Clock,
  CreditCard,
  Download,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const SuperAdminDashboard: React.FC = () => {
  const {
    currentUser,
    users,
    workshops,
    registrations,
    auditLogs,
    toggleUserAccountStatus,
    changeUserRole,
    refreshData,
    navigateTo,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'users' | 'audit' | 'workshops' | 'payments'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedUserToToggle, setSelectedUserToToggle] = useState<User | null>(null);
  const [roleModalUser, setRoleModalUser] = useState<User | null>(null);
  const [targetRole, setTargetRole] = useState<UserRole>('PARTICIPANT');

  // Razorpay Payments state
  const [paymentRecords, setPaymentRecords] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'ALL' | 'SUCCESS' | 'ORDER_CREATED' | 'FAILED'>('ALL');

  const fetchPayments = async () => {
    setLoadingPayments(true);
    try {
      const res = await apiFetch(`/api/payments/admin/all?status=${paymentStatusFilter}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.payments) {
          setPaymentRecords(data.payments);
        }
      }
    } catch {}
    setLoadingPayments(false);
  };

  useEffect(() => {
    if (activeTab === 'payments') {
      fetchPayments();
    }
  }, [activeTab, paymentStatusFilter]);

  React.useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Metrics
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.accountStatus !== 'SUSPENDED').length;
  const totalWorkshops = workshops.length;
  const publishedWorkshops = workshops.filter((w) => w.status === 'PUBLISHED').length;
  const totalBookings = registrations.filter((r) => r.status === 'CONFIRMED' || r.status === 'ATTENDED').length;

  // Filtered users
  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (statusFilter !== 'ALL' && u.accountStatus !== statusFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.department && u.department.toLowerCase().includes(q))
    );
  });

  // Filtered audit logs
  const filteredLogs = auditLogs.filter((log) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.actorName.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.shortDescription.toLowerCase().includes(q) ||
      log.entityType.toLowerCase().includes(q)
    );
  });

  const handleConfirmToggle = async () => {
    if (!selectedUserToToggle) return;
    await toggleUserAccountStatus(selectedUserToToggle.id);
    setSelectedUserToToggle(null);
  };

  const handleConfirmRoleChange = async () => {
    if (!roleModalUser) return;
    await changeUserRole(roleModalUser.id, targetRole);
    setRoleModalUser(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Super Admin Hero Banner */}
      <div className="bg-[#101D32] rounded-2xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-[8px_8px_0px_0px_#101D32] border-2 border-[#101D32] relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-heading font-extrabold uppercase tracking-wider bg-[#F4511E] text-white border border-white">
            <ShieldAlert className="w-3.5 h-3.5 text-white" />
            <span>Super Administrator Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-white">
            Institutional Governance &amp; Oversight
          </h1>
          <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed font-sans">
            Monitor platform-wide academic workshops, regulate user accounts, review immutable audit logs,
            and ensure compliant access control across all university departments.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 relative z-10 font-sans">
          <button
            onClick={() => refreshData()}
            className="px-4 py-2 bg-white text-[#101D32] hover:bg-[#FFD6B0] font-heading font-bold text-xs rounded-lg border-2 border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] transition-all flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#F4511E]" />
            <span>Sync Live Records</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
        <div className="bg-white p-5 rounded-xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#FFD6B0] border-2 border-[#101D32] text-[#101D32] flex items-center justify-center font-bold shrink-0 shadow-[2px_2px_0px_0px_#101D32]">
            <Users className="w-6 h-6 text-[#F4511E]" />
          </div>
          <div>
            <div className="text-2xl font-heading font-extrabold text-[#101410]">
              {totalUsers}
            </div>
            <div className="text-xs text-[#101D32]/70 font-semibold">
              Registered Accounts ({activeUsers} active)
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#FFD6B0] border-2 border-[#101D32] text-[#101D32] flex items-center justify-center font-bold shrink-0 shadow-[2px_2px_0px_0px_#101D32]">
            <Calendar className="w-6 h-6 text-[#F4511E]" />
          </div>
          <div>
            <div className="text-2xl font-heading font-extrabold text-[#101410]">
              {publishedWorkshops}
            </div>
            <div className="text-xs text-[#101D32]/70 font-semibold">
              Active Sessions ({totalWorkshops} total)
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#FFD6B0] border-2 border-[#101D32] text-[#101D32] flex items-center justify-center font-bold shrink-0 shadow-[2px_2px_0px_0px_#101D32]">
            <CheckCircle2 className="w-6 h-6 text-[#F4511E]" />
          </div>
          <div>
            <div className="text-2xl font-heading font-extrabold text-[#101410]">
              {totalBookings}
            </div>
            <div className="text-xs text-[#101D32]/70 font-semibold">
              Seat Enrollments (Confirmed)
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#FFD6B0] border-2 border-[#101D32] text-[#101D32] flex items-center justify-center font-bold shrink-0 shadow-[2px_2px_0px_0px_#101D32]">
            <FileText className="w-6 h-6 text-[#F4511E]" />
          </div>
          <div>
            <div className="text-2xl font-heading font-extrabold text-[#101410]">
              {auditLogs.length}
            </div>
            <div className="text-xs text-[#101D32]/70 font-semibold">
              Logged System Events
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b-2 border-[#101D32] pb-3 font-sans">
        <button
          onClick={() => { setActiveTab('users'); setSearchQuery(''); }}
          className={`px-4 py-2.5 font-heading font-bold text-xs rounded-lg border-2 border-[#101D32] transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'users'
              ? 'bg-[#F4511E] text-white shadow-[2px_2px_0px_0px_#101D32]'
              : 'bg-white text-[#101D32] hover:bg-[#FFD6B0]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Governance ({users.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('audit'); setSearchQuery(''); }}
          className={`px-4 py-2.5 font-heading font-bold text-xs rounded-lg border-2 border-[#101D32] transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-[#F4511E] text-white shadow-[2px_2px_0px_0px_#101D32]'
              : 'bg-white text-[#101D32] hover:bg-[#FFD6B0]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Audit Logs ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('workshops'); setSearchQuery(''); }}
          className={`px-4 py-2.5 font-heading font-bold text-xs rounded-lg border-2 border-[#101D32] transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'workshops'
              ? 'bg-[#F4511E] text-white shadow-[2px_2px_0px_0px_#101D32]'
              : 'bg-white text-[#101D32] hover:bg-[#FFD6B0]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Workshops Catalog ({workshops.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('payments'); setSearchQuery(''); }}
          className={`px-4 py-2.5 font-heading font-bold text-xs rounded-lg border-2 border-[#101D32] transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'payments'
              ? 'bg-[#F4511E] text-white shadow-[2px_2px_0px_0px_#101D32]'
              : 'bg-white text-[#101D32] hover:bg-[#FFD6B0]'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Razorpay Payments ({paymentRecords.length})</span>
        </button>
      </div>

      {/* Tab 1: User Governance */}
      {activeTab === 'users' && (
        <div className="space-y-4 font-sans">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#101D32]/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user by name, email, or department..."
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border-2 border-[#101D32] bg-white text-[#101410] focus:outline-none focus:ring-2 focus:ring-[#F4511E]"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border-2 border-[#101D32] bg-white text-[#101410] font-bold focus:outline-none"
              >
                <option value="ALL">All Roles</option>
                <option value="PARTICIPANT">Participants</option>
                <option value="ORGANIZER">Organizers</option>
                <option value="VOLUNTEER">Volunteers</option>
                <option value="SUPER_ADMIN">Super Admins</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border-2 border-[#101D32] bg-white text-[#101410] font-bold focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>

          {/* User Table */}
          <div className="bg-white rounded-xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FFF5E9] border-b-2 border-[#101D32] text-[#101D32] font-heading font-extrabold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-[#101D32]/10">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#101D32]/70 font-medium">
                        No matching user accounts found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const isSelf = user.id === currentUser?.id;
                      const isSuspended = user.accountStatus === 'SUSPENDED';

                      return (
                        <tr key={user.id} className="hover:bg-[#FFF5E9]/50 transition-colors">
                          <td className="py-3 px-4 font-medium text-[#101410] flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-md bg-[#FFD6B0] border border-[#101D32] text-[#101D32] flex items-center justify-center font-extrabold text-xs uppercase shadow-[1px_1px_0px_0px_#101D32]">
                              {user.fullName.charAt(0)}
                            </div>
                            <div>
                              <span className="font-bold block">{user.fullName}</span>
                              {isSelf && (
                                <span className="text-[10px] text-[#F4511E] font-extrabold">
                                  (You)
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-[#101D32]/80 font-mono text-[11px]">
                            {user.email}
                          </td>
                          <td className="py-3 px-4 text-[#101D32]/80 font-medium">
                            {user.department || 'General Academic'}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-heading font-extrabold border border-[#101D32] tracking-wider uppercase ${
                                user.role === 'SUPER_ADMIN'
                                  ? 'bg-[#101D32] text-white'
                                  : user.role === 'ORGANIZER'
                                  ? 'bg-[#FFD6B0] text-[#101D32]'
                                  : user.role === 'VOLUNTEER'
                                  ? 'bg-[#FFF5E9] text-[#101D32]'
                                  : 'bg-white text-[#101D32]'
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-heading font-extrabold border border-[#101D32] flex items-center gap-1 w-fit uppercase ${
                                isSuspended
                                  ? 'bg-[#E84316] text-white'
                                  : 'bg-[#FFD6B0] text-[#101D32]'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isSuspended ? 'bg-white' : 'bg-[#F4511E]'}`} />
                              <span>{isSuspended ? 'Suspended' : 'Active'}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Change Role Button */}
                              <button
                                onClick={() => {
                                  setRoleModalUser(user);
                                  setTargetRole(user.role);
                                }}
                                disabled={isSelf}
                                className="px-2.5 py-1 text-[11px] font-heading font-bold text-[#101D32] bg-white hover:bg-[#FFD6B0] rounded border border-[#101D32] transition-colors disabled:opacity-40 cursor-pointer shadow-[1px_1px_0px_0px_#101D32]"
                                title="Change role"
                              >
                                Modify Role
                              </button>

                              {/* Toggle Status Button */}
                              <button
                                onClick={() => setSelectedUserToToggle(user)}
                                disabled={isSelf}
                                className={`px-2.5 py-1 text-[11px] font-heading font-bold rounded border border-[#101D32] transition-colors disabled:opacity-40 flex items-center gap-1 cursor-pointer shadow-[1px_1px_0px_0px_#101D32] ${
                                  isSuspended
                                    ? 'bg-[#F4511E] hover:bg-[#E84316] text-white'
                                    : 'bg-white hover:bg-rose-100 text-rose-700'
                                }`}
                              >
                                {isSuspended ? (
                                  <>
                                    <Unlock className="w-3 h-3" />
                                    <span>Reactivate</span>
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-3 h-3" />
                                    <span>Suspend</span>
                                  </>
                                )}
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
        </div>
      )}

      {/* Tab 2: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="space-y-4 font-sans">
          <div className="bg-white p-4 rounded-xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#101D32]/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search audit trail by actor, action, or entity..."
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border-2 border-[#101D32] bg-white text-[#101410] focus:outline-none focus:ring-2 focus:ring-[#F4511E]"
              />
            </div>
            <div className="text-xs text-[#101D32]/80 font-bold">
              Showing {filteredLogs.length} logged entries
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FFF5E9] border-b-2 border-[#101D32] text-[#101D32] font-heading font-extrabold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Entity Type</th>
                    <th className="py-3 px-4">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-[#101D32]/10">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[#101D32]/70 font-medium">
                        No audit logs recorded yet.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#FFF5E9]/50 transition-colors">
                        <td className="py-3 px-4 text-[#101D32]/80 font-mono text-[11px] whitespace-nowrap">
                          {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'Recent'}
                        </td>
                        <td className="py-3 px-4 font-bold text-[#101410] whitespace-nowrap">
                          {log.actorName}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#FFD6B0] text-[#101D32] border border-[#101D32]">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#101D32]/80 font-bold text-[11px]">
                          {log.entityType}
                        </td>
                        <td className="py-3 px-4 text-[#101410] font-medium">
                          {log.shortDescription}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Workshops Overview */}
      {activeTab === 'workshops' && (
        <div className="space-y-4 font-sans">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {workshops.map((ws) => (
              <div
                key={ws.id}
                className="bg-white p-5 rounded-xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-[#101D32]/80 mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#FFD6B0] border border-[#101D32] text-[#101D32] font-heading font-extrabold uppercase text-[10px]">
                      {ws.category}
                    </span>
                    <span className="font-mono font-bold text-[#101D32]">{ws.date}</span>
                  </div>
                  <h3 className="font-heading font-extrabold text-sm text-[#101410] mb-1">
                    {ws.title}
                  </h3>
                  <p className="text-xs text-[#101D32]/80 line-clamp-2 mb-3">
                    {ws.summary}
                  </p>
                  <div className="text-[11px] text-[#101D32]/80 space-y-1">
                    <div>Organizer: <strong className="text-[#101410]">{ws.organizerNameSnapshot}</strong></div>
                    <div>Capacity: <strong className="text-[#101410]">{ws.capacity} seats</strong> (₹{ws.price || 0})</div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t-2 border-[#101D32]/10 flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-heading font-extrabold uppercase border border-[#101D32] ${
                      ws.status === 'PUBLISHED'
                        ? 'bg-[#FFD6B0] text-[#101D32]'
                        : 'bg-[#FFF5E9] text-[#101D32]'
                    }`}
                  >
                    {ws.status}
                  </span>
                  <button
                    onClick={() => navigateTo('workshop-detail', ws.id)}
                    className="text-xs font-heading font-bold text-[#F4511E] hover:underline cursor-pointer"
                  >
                    View Details &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Razorpay Payment Records */}
      {activeTab === 'payments' && (
        <div className="space-y-5 font-sans">
          {/* Payment Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-xl bg-white border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32]">
              <div className="text-[11px] font-heading font-extrabold text-[#101D32]/70 uppercase tracking-wider">
                Total Verified Revenue
              </div>
              <div className="text-xl sm:text-2xl font-heading font-extrabold text-[#F4511E] mt-1">
                ₹{paymentRecords
                  .filter((p) => p.status === 'SUCCESS')
                  .reduce((sum, p) => sum + (p.amountInRupees || (p.amount ? p.amount / 100 : 0)), 0)
                  .toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-[#101D32] font-semibold mt-0.5">
                Cryptographically Verified
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32]">
              <div className="text-[11px] font-heading font-extrabold text-[#101D32]/70 uppercase tracking-wider">
                Paid Transactions
              </div>
              <div className="text-xl sm:text-2xl font-heading font-extrabold text-[#101410] mt-1">
                {paymentRecords.filter((p) => p.status === 'SUCCESS').length}
              </div>
              <div className="text-[10px] text-[#101D32]/70 mt-0.5">
                Confirmed tickets issued
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32]">
              <div className="text-[11px] font-heading font-extrabold text-[#101D32]/70 uppercase tracking-wider">
                Pending Checkout
              </div>
              <div className="text-xl sm:text-2xl font-heading font-extrabold text-[#101D32] mt-1">
                {paymentRecords.filter((p) => p.status === 'ORDER_CREATED' || p.status === 'CREATED').length}
              </div>
              <div className="text-[10px] text-[#101D32]/70 mt-0.5">
                Awaiting payment completion
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32]">
              <div className="text-[11px] font-heading font-extrabold text-[#101D32]/70 uppercase tracking-wider">
                Failed / Cancelled
              </div>
              <div className="text-xl sm:text-2xl font-heading font-extrabold text-[#E84316] mt-1">
                {paymentRecords.filter((p) => p.status === 'FAILED').length}
              </div>
              <div className="text-[10px] text-[#101D32]/70 mt-0.5">
                Declined or signature mismatch
              </div>
            </div>
          </div>

          {/* Payment Filter & Action Bar */}
          <div className="bg-white p-4 rounded-xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#101D32]/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Razorpay Order ID, Payment ID, Attendee, or Workshop..."
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border-2 border-[#101D32] bg-white text-[#101410] focus:outline-none focus:ring-2 focus:ring-[#F4511E]"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-[#FFF5E9] p-1 rounded-lg border-2 border-[#101D32]">
                {(['ALL', 'SUCCESS', 'ORDER_CREATED', 'FAILED'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setPaymentStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-md text-xs font-heading font-bold transition-all cursor-pointer ${
                      paymentStatusFilter === st
                        ? 'bg-[#F4511E] text-white border border-[#101D32] shadow-[2px_2px_0px_0px_#101D32]'
                        : 'text-[#101D32] hover:bg-[#FFD6B0]'
                    }`}
                  >
                    {st === 'ALL' ? 'All Payments' : st === 'SUCCESS' ? 'Paid' : st === 'ORDER_CREATED' ? 'Pending' : 'Failed'}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  const filtered = paymentRecords.filter((p) => {
                    if (!searchQuery.trim()) return true;
                    const q = searchQuery.toLowerCase();
                    return (
                      (p.participantName && p.participantName.toLowerCase().includes(q)) ||
                      (p.participantEmail && p.participantEmail.toLowerCase().includes(q)) ||
                      (p.workshopTitle && p.workshopTitle.toLowerCase().includes(q)) ||
                      (p.razorpayOrderId && p.razorpayOrderId.toLowerCase().includes(q)) ||
                      (p.razorpayPaymentId && p.razorpayPaymentId.toLowerCase().includes(q)) ||
                      (p.id && p.id.toLowerCase().includes(q))
                    );
                  });
                  if (filtered.length === 0) return;
                  const headers = ['Ref', 'Razorpay Order ID', 'Razorpay Payment ID', 'Workshop', 'Attendee', 'Email', 'Amount (INR)', 'Status', 'Signature Verified', 'Created At'];
                  const rows = filtered.map((p) => [
                    `"${p.id || ''}"`,
                    `"${p.razorpayOrderId || ''}"`,
                    `"${p.razorpayPaymentId || ''}"`,
                    `"${(p.workshopTitle || '').replace(/"/g, '""')}"`,
                    `"${(p.participantName || '').replace(/"/g, '""')}"`,
                    `"${p.participantEmail || ''}"`,
                    `"${p.amountInRupees || (p.amount ? p.amount / 100 : 0)}"`,
                    `"${p.status || ''}"`,
                    `"${p.signatureVerified ? 'YES' : 'NO'}"`,
                    `"${p.createdAt || ''}"`,
                  ]);
                  const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
                  const a = document.createElement('a');
                  a.href = encodeURI(csv);
                  a.download = `razorpay-payments-${new Date().toISOString().slice(0, 10)}.csv`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
                className="px-3.5 py-2 text-xs font-heading font-bold text-[#101D32] bg-[#FFD6B0] hover:bg-[#FFD6B0]/80 rounded-lg border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={fetchPayments}
                disabled={loadingPayments}
                className="p-2 text-[#101D32] hover:bg-[#FFD6B0] rounded-lg border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] transition-colors cursor-pointer disabled:opacity-50"
                title="Refresh payments"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingPayments ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Payment Records Table */}
          <div className="bg-white rounded-xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FFF5E9] border-b-2 border-[#101D32] text-[#101D32] font-heading font-extrabold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3 sm:p-4">Payment Ref &amp; Order</th>
                    <th className="p-3 sm:p-4">Workshop</th>
                    <th className="p-3 sm:p-4">Attendee</th>
                    <th className="p-3 sm:p-4">Amount</th>
                    <th className="p-3 sm:p-4">Status</th>
                    <th className="p-3 sm:p-4">Signature</th>
                    <th className="p-3 sm:p-4">Date &amp; Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-[#101D32]/10">
                  {loadingPayments ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-[#101D32]/70 font-semibold">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#F4511E]" />
                        <span>Loading verified payment records...</span>
                      </td>
                    </tr>
                  ) : paymentRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-[#101D32]/70">
                        <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#101D32]" />
                        <p className="font-heading font-extrabold">No payment records found.</p>
                        <p className="text-[11px] mt-0.5">Paid registrations through Razorpay will appear here in real time.</p>
                      </td>
                    </tr>
                  ) : (
                    paymentRecords
                      .filter((p) => {
                        if (!searchQuery.trim()) return true;
                        const q = searchQuery.toLowerCase();
                        return (
                          (p.participantName && p.participantName.toLowerCase().includes(q)) ||
                          (p.participantEmail && p.participantEmail.toLowerCase().includes(q)) ||
                          (p.workshopTitle && p.workshopTitle.toLowerCase().includes(q)) ||
                          (p.razorpayOrderId && p.razorpayOrderId.toLowerCase().includes(q)) ||
                          (p.razorpayPaymentId && p.razorpayPaymentId.toLowerCase().includes(q)) ||
                          (p.id && p.id.toLowerCase().includes(q))
                        );
                      })
                      .map((p) => {
                        const isSuccess = p.status === 'SUCCESS';
                        const isFailed = p.status === 'FAILED';
                        const isPending = !isSuccess && !isFailed;
                        const amt = p.amountInRupees || (p.amount ? p.amount / 100 : 0);

                        return (
                          <tr key={p.id} className="hover:bg-[#FFF5E9]/50 transition-colors">
                            <td className="p-3 sm:p-4 space-y-0.5">
                              <div className="font-mono font-bold text-[#101410]">
                                {p.id}
                              </div>
                              <div className="text-[10px] font-mono text-[#101D32]/70">
                                Order: {p.razorpayOrderId || '—'}
                              </div>
                              {p.razorpayPaymentId && (
                                <div className="text-[10px] font-mono text-[#F4511E] font-bold">
                                  Pay ID: {p.razorpayPaymentId}
                                </div>
                              )}
                            </td>

                            <td className="p-3 sm:p-4">
                              <div className="font-heading font-bold text-[#101410] line-clamp-1">
                                {p.workshopTitle || 'Workshop Session'}
                              </div>
                              {p.ticketCode && (
                                <div className="text-[10px] font-mono text-[#F4511E] font-bold mt-0.5">
                                  Ticket: {p.ticketCode}
                                </div>
                              )}
                            </td>

                            <td className="p-3 sm:p-4">
                              <div className="font-bold text-[#101410]">
                                {p.participantName || 'Participant'}
                              </div>
                              <div className="text-[11px] text-[#101D32]/70">
                                {p.participantEmail || '—'}
                              </div>
                            </td>

                            <td className="p-3 sm:p-4 font-mono font-extrabold text-sm text-[#F4511E]">
                              ₹{amt}
                            </td>

                            <td className="p-3 sm:p-4">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-heading font-extrabold uppercase tracking-wider border border-[#101D32] ${
                                  isSuccess
                                    ? 'bg-[#FFD6B0] text-[#101D32]'
                                    : isFailed
                                    ? 'bg-[#E84316] text-white'
                                    : 'bg-[#FFF5E9] text-[#101D32]'
                                }`}
                              >
                                {isSuccess && <CheckCircle2 className="w-3 h-3 text-[#F4511E]" />}
                                {isFailed && <AlertTriangle className="w-3 h-3 text-white" />}
                                {isPending && <Clock className="w-3 h-3 text-[#101D32]" />}
                                {isSuccess ? 'PAID' : isFailed ? 'FAILED' : 'PENDING'}
                              </span>
                            </td>

                            <td className="p-3 sm:p-4">
                              {p.signatureVerified ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#101D32]">
                                  <ShieldCheck className="w-3.5 h-3.5 text-[#F4511E]" />
                                  <span>HMAC Verified</span>
                                </span>
                              ) : isFailed ? (
                                <span className="text-[11px] font-bold text-[#E84316]">
                                  Declined / Mismatch
                                </span>
                              ) : (
                                <span className="text-[11px] text-[#101D32]/70">
                                  Pending Checkout
                                </span>
                              )}
                            </td>

                            <td className="p-3 sm:p-4 text-[11px] text-[#101D32]/80">
                              {p.paidAt ? (
                                <div>
                                  <div className="font-bold text-[#101410]">
                                    {new Date(p.paidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </div>
                                  <div>
                                    {new Date(p.paidAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </div>
                              ) : p.createdAt ? (
                                <div>
                                  <div>{new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                  <div className="text-[10px]">{new Date(p.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                                </div>
                              ) : (
                                '—'
                              )}
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Suspend / Reactivate */}
      <AnimatePresence>
        {selectedUserToToggle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101D32]/70 backdrop-blur-sm font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full border-2 border-[#101D32] shadow-[8px_8px_0px_0px_#101D32] space-y-4"
            >
              <div className="flex items-center gap-3 text-[#E84316]">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h3 className="text-base font-heading font-extrabold text-[#101410]">
                  {selectedUserToToggle.accountStatus === 'SUSPENDED' ? 'Reactivate Account?' : 'Suspend User Account?'}
                </h3>
              </div>

              <p className="text-xs text-[#101D32]/80 leading-relaxed">
                Are you sure you want to {selectedUserToToggle.accountStatus === 'SUSPENDED' ? 'restore platform access for' : 'suspend'}{' '}
                <strong className="text-[#101410]">{selectedUserToToggle.fullName}</strong> ({selectedUserToToggle.email})?
                {selectedUserToToggle.accountStatus !== 'SUSPENDED' && (
                  <span className="block mt-2 text-[#E84316] font-bold">
                    The user will be immediately blocked from signing in and reserving seats.
                  </span>
                )}
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t-2 border-[#101D32]/10">
                <button
                  onClick={() => setSelectedUserToToggle(null)}
                  className="px-4 py-2 text-xs font-heading font-bold text-[#101D32] hover:bg-[#FFD6B0] border border-[#101D32] rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmToggle}
                  className={`px-4 py-2 text-xs font-heading font-bold text-white rounded-lg border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] transition-colors cursor-pointer ${
                    selectedUserToToggle.accountStatus === 'SUSPENDED'
                      ? 'bg-[#F4511E] hover:bg-[#E84316]'
                      : 'bg-[#E84316] hover:bg-rose-700'
                  }`}
                >
                  Confirm {selectedUserToToggle.accountStatus === 'SUSPENDED' ? 'Reactivation' : 'Suspension'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Role Modification Modal */}
      <AnimatePresence>
        {roleModalUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101D32]/70 backdrop-blur-sm font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full border-2 border-[#101D32] shadow-[8px_8px_0px_0px_#101D32] space-y-4"
            >
              <h3 className="text-base font-heading font-extrabold text-[#101410]">
                Modify Role for {roleModalUser.fullName}
              </h3>
              <p className="text-xs text-[#101D32]/80">
                Select the target privilege role within the academic platform.
              </p>

              <div className="space-y-2 pt-2">
                {(['PARTICIPANT', 'ORGANIZER', 'VOLUNTEER', 'SUPER_ADMIN'] as UserRole[]).map((r) => (
                  <label
                    key={r}
                    className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-colors text-xs font-bold ${
                      targetRole === r
                        ? 'border-[#101D32] bg-[#FFD6B0] text-[#101D32] shadow-[2px_2px_0px_0px_#101D32]'
                        : 'border-[#101D32]/30 text-[#101D32]/70 hover:bg-[#FFF5E9]'
                    }`}
                  >
                    <span>{r}</span>
                    <input
                      type="radio"
                      name="userRole"
                      value={r}
                      checked={targetRole === r}
                      onChange={() => setTargetRole(r)}
                      className="accent-[#F4511E]"
                    />
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t-2 border-[#101D32]/10">
                <button
                  onClick={() => setRoleModalUser(null)}
                  className="px-4 py-2 text-xs font-heading font-bold text-[#101D32] hover:bg-[#FFD6B0] border border-[#101D32] rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRoleChange}
                  className="px-4 py-2 text-xs font-heading font-bold text-white bg-[#F4511E] hover:bg-[#E84316] rounded-lg border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] transition-colors cursor-pointer"
                >
                  Save Role Change
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
