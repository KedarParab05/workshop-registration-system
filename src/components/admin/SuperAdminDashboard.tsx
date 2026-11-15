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
  Filter,
  RefreshCw,
  Sparkles,
  Lock,
  Unlock,
  UserCheck,
  FileText,
  Clock,
  ChevronRight,
  TrendingUp,
  CreditCard,
  Download,
  ShieldCheck,
  DollarSign,
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
  const suspendedUsers = users.filter((u) => u.accountStatus === 'SUSPENDED').length;
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 transition-colors duration-200">
      {/* Super Admin Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#08482D] rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl border border-[#0c5c3b] relative overflow-hidden"
      >
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#DAE7C7] text-[#08482D]">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Super Administrator Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight text-[#F5F8EF]">
            Institutional Governance & Oversight
          </h1>
          <p className="text-xs sm:text-sm text-[#DAE7C7]/90 max-w-2xl leading-relaxed">
            Monitor platform-wide academic workshops, regulate user accounts, review immutable audit logs,
            and ensure compliant access control across all university departments.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 relative z-10">
          <button
            onClick={() => refreshData()}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-[#F5F8EF] font-heading font-semibold text-xs rounded-xl border border-white/15 transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Live Records</span>
          </button>
        </div>
      </motion.div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-[#14231b] p-5 rounded-2xl border border-[#DCE4D6] dark:border-[#233d2e] shadow-sm flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-[#E8F0DF] dark:bg-[#1b3025] text-[#08482D] dark:text-[#9ee2b8] flex items-center justify-center font-bold shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-heading font-bold text-[#101410] dark:text-[#f0f5ee]">
              {totalUsers}
            </div>
            <div className="text-xs text-[#5E5E61] dark:text-[#8ba895] font-medium">
              Registered Accounts ({activeUsers} active)
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-[#14231b] p-5 rounded-2xl border border-[#DCE4D6] dark:border-[#233d2e] shadow-sm flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-[#E8F0DF] dark:bg-[#1b3025] text-[#08482D] dark:text-[#9ee2b8] flex items-center justify-center font-bold shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-heading font-bold text-[#101410] dark:text-[#f0f5ee]">
              {publishedWorkshops}
            </div>
            <div className="text-xs text-[#5E5E61] dark:text-[#8ba895] font-medium">
              Active Sessions ({totalWorkshops} total)
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-[#14231b] p-5 rounded-2xl border border-[#DCE4D6] dark:border-[#233d2e] shadow-sm flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-[#E8F0DF] dark:bg-[#1b3025] text-[#08482D] dark:text-[#9ee2b8] flex items-center justify-center font-bold shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-heading font-bold text-[#101410] dark:text-[#f0f5ee]">
              {totalBookings}
            </div>
            <div className="text-xs text-[#5E5E61] dark:text-[#8ba895] font-medium">
              Seat Enrollments (100% Free)
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-[#14231b] p-5 rounded-2xl border border-[#DCE4D6] dark:border-[#233d2e] shadow-sm flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-[#E8F0DF] dark:bg-[#1b3025] text-[#08482D] dark:text-[#9ee2b8] flex items-center justify-center font-bold shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-heading font-bold text-[#101410] dark:text-[#f0f5ee]">
              {auditLogs.length}
            </div>
            <div className="text-xs text-[#5E5E61] dark:text-[#8ba895] font-medium">
              Logged System Events
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#DCE4D6] dark:border-[#233d2e] pb-1">
        <button
          onClick={() => { setActiveTab('users'); setSearchQuery(''); }}
          className={`px-4 py-2.5 font-heading font-semibold text-xs rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-[#08482D] text-[#F5F8EF] shadow-md shadow-[#08482D]/20'
              : 'text-[#5E5E61] dark:text-[#8ba895] hover:text-[#101410] dark:hover:text-[#f0f5ee] hover:bg-[#E8F0DF]/60 dark:hover:bg-[#14231b]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Governance ({users.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('audit'); setSearchQuery(''); }}
          className={`px-4 py-2.5 font-heading font-semibold text-xs rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'bg-[#08482D] text-[#F5F8EF] shadow-md shadow-[#08482D]/20'
              : 'text-[#5E5E61] dark:text-[#8ba895] hover:text-[#101410] dark:hover:text-[#f0f5ee] hover:bg-[#E8F0DF]/60 dark:hover:bg-[#14231b]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Audit Logs ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('workshops'); setSearchQuery(''); }}
          className={`px-4 py-2.5 font-heading font-semibold text-xs rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'workshops'
              ? 'bg-[#08482D] text-[#F5F8EF] shadow-md shadow-[#08482D]/20'
              : 'text-[#5E5E61] dark:text-[#8ba895] hover:text-[#101410] dark:hover:text-[#f0f5ee] hover:bg-[#E8F0DF]/60 dark:hover:bg-[#14231b]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Workshops Catalog ({workshops.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('payments'); setSearchQuery(''); }}
          className={`px-4 py-2.5 font-heading font-semibold text-xs rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'payments'
              ? 'bg-[#08482D] text-[#F5F8EF] shadow-md shadow-[#08482D]/20'
              : 'text-[#5E5E61] dark:text-[#8ba895] hover:text-[#101410] dark:hover:text-[#f0f5ee] hover:bg-[#E8F0DF]/60 dark:hover:bg-[#14231b]'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Razorpay Payments ({paymentRecords.length})</span>
        </button>
      </div>

      {/* Tab 1: User Governance */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white dark:bg-[#14231b] p-4 rounded-2xl border border-[#DCE4D6] dark:border-[#233d2e] shadow-sm flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#5E5E61] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user by name, email, or department..."
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-[#DCE4D6] dark:border-[#233d2e] bg-[#F5F8EF]/60 dark:bg-[#1b3025] text-[#101410] dark:text-[#f0f5ee] focus:outline-none focus:ring-2 focus:ring-[#08482D]"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-[#DCE4D6] dark:border-[#233d2e] bg-[#F5F8EF]/60 dark:bg-[#1b3025] text-[#101410] dark:text-[#f0f5ee] focus:outline-none"
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
                className="px-3 py-2 text-xs rounded-xl border border-[#DCE4D6] dark:border-[#233d2e] bg-[#F5F8EF]/60 dark:bg-[#1b3025] text-[#101410] dark:text-[#f0f5ee] focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>

          {/* User Table */}
          <div className="bg-white dark:bg-[#14231b] rounded-2xl border border-[#DCE4D6] dark:border-[#233d2e] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#E8F0DF]/60 dark:bg-[#1b3025] border-b border-[#DCE4D6] dark:border-[#233d2e] text-[#5E5E61] dark:text-[#8ba895] font-heading font-semibold">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE4D6]/70 dark:divide-[#233d2e]">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#5E5E61] dark:text-[#8ba895]">
                        No matching user accounts found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const isSelf = user.id === currentUser?.id;
                      const isSuspended = user.accountStatus === 'SUSPENDED';

                      return (
                        <tr key={user.id} className="hover:bg-[#F5F8EF]/80 dark:hover:bg-[#1b3025]/50 transition-colors">
                          <td className="py-3 px-4 font-medium text-[#101410] dark:text-[#f0f5ee] flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-[#DAE7C7] text-[#08482D] flex items-center justify-center font-bold text-xs uppercase">
                              {user.fullName.charAt(0)}
                            </div>
                            <div>
                              <span className="font-semibold block">{user.fullName}</span>
                              {isSelf && (
                                <span className="text-[10px] text-[#08482D] dark:text-[#9ee2b8] font-bold">
                                  (You)
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-[#5E5E61] dark:text-[#8ba895] font-mono text-[11px]">
                            {user.email}
                          </td>
                          <td className="py-3 px-4 text-[#5E5E61] dark:text-[#8ba895]">
                            {user.department || 'General Academic'}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${
                                user.role === 'SUPER_ADMIN'
                                  ? 'bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                                  : user.role === 'ORGANIZER'
                                  ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                  : user.role === 'VOLUNTEER'
                                  ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                  : 'bg-[#DAE7C7]/70 dark:bg-[#1b3025] text-[#08482D] dark:text-[#9ee2b8] border border-[#DCE4D6] dark:border-[#233d2e]'
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 w-fit ${
                                isSuspended
                                  ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                  : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isSuspended ? 'bg-rose-500' : 'bg-emerald-500'}`} />
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
                                className="px-2.5 py-1 text-[11px] font-heading font-semibold text-[#08482D] dark:text-[#9ee2b8] hover:bg-[#E8F0DF] dark:hover:bg-[#1b3025] rounded-lg transition-colors disabled:opacity-40"
                                title="Change role"
                              >
                                Modify Role
                              </button>

                              {/* Toggle Status Button */}
                              <button
                                onClick={() => setSelectedUserToToggle(user)}
                                disabled={isSelf}
                                className={`px-2.5 py-1 text-[11px] font-heading font-semibold rounded-lg transition-colors disabled:opacity-40 flex items-center gap-1 ${
                                  isSuspended
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                    : 'bg-rose-600 hover:bg-rose-500 text-white'
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
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#14231b] p-4 rounded-2xl border border-[#DCE4D6] dark:border-[#233d2e] shadow-sm flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#5E5E61] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search audit trail by actor, action, or entity..."
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-[#DCE4D6] dark:border-[#233d2e] bg-[#F5F8EF]/60 dark:bg-[#1b3025] text-[#101410] dark:text-[#f0f5ee] focus:outline-none focus:ring-2 focus:ring-[#08482D]"
              />
            </div>
            <div className="text-xs text-[#5E5E61] dark:text-[#8ba895]">
              Showing {filteredLogs.length} logged entries
            </div>
          </div>

          <div className="bg-white dark:bg-[#14231b] rounded-2xl border border-[#DCE4D6] dark:border-[#233d2e] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#E8F0DF]/60 dark:bg-[#1b3025] border-b border-[#DCE4D6] dark:border-[#233d2e] text-[#5E5E61] dark:text-[#8ba895] font-heading font-semibold">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Entity Type</th>
                    <th className="py-3 px-4">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE4D6]/70 dark:divide-[#233d2e]">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[#5E5E61] dark:text-[#8ba895]">
                        No audit logs recorded yet.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#F5F8EF]/80 dark:hover:bg-[#1b3025]/50 transition-colors">
                        <td className="py-3 px-4 text-[#5E5E61] dark:text-[#8ba895] font-mono text-[11px] whitespace-nowrap">
                          {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'Recent'}
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#101410] dark:text-[#f0f5ee] whitespace-nowrap">
                          {log.actorName}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#DAE7C7] text-[#08482D] border border-[#08482D]/20">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#5E5E61] dark:text-[#8ba895] font-semibold text-[11px]">
                          {log.entityType}
                        </td>
                        <td className="py-3 px-4 text-[#101410] dark:text-[#f0f5ee]">
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
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {workshops.map((ws) => (
              <div
                key={ws.id}
                className="bg-white dark:bg-[#14231b] p-5 rounded-2xl border border-[#DCE4D6] dark:border-[#233d2e] shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-[#5E5E61] dark:text-[#8ba895] mb-2">
                    <span className="px-2 py-0.5 rounded-full bg-[#DAE7C7] text-[#08482D] font-semibold text-[10px]">
                      {ws.category}
                    </span>
                    <span className="font-mono">{ws.date}</span>
                  </div>
                  <h3 className="font-heading font-bold text-sm text-[#101410] dark:text-[#f0f5ee] mb-1">
                    {ws.title}
                  </h3>
                  <p className="text-xs text-[#5E5E61] dark:text-[#8ba895] line-clamp-2 mb-3">
                    {ws.summary}
                  </p>
                  <div className="text-[11px] text-[#5E5E61] dark:text-[#8ba895] space-y-1">
                    <div>Organizer: <strong className="text-[#101410] dark:text-[#f0f5ee]">{ws.organizerNameSnapshot}</strong></div>
                    <div>Capacity: <strong className="text-[#101410] dark:text-[#f0f5ee]">{ws.capacity} seats</strong> (100% Free)</div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-[#DCE4D6] dark:border-[#233d2e] flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      ws.status === 'PUBLISHED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {ws.status}
                  </span>
                  <button
                    onClick={() => navigateTo('workshop-detail', ws.id)}
                    className="text-xs font-heading font-semibold text-[#08482D] dark:text-[#9ee2b8] hover:underline"
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
        <div className="space-y-5">
          {/* Payment Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#14231b] border border-[#DCE4D6] dark:border-[#233d2e] shadow-sm">
              <div className="text-[11px] font-heading font-semibold text-[#5E5E61] dark:text-[#8ba895] uppercase tracking-wider">
                Total Verified Revenue
              </div>
              <div className="text-xl sm:text-2xl font-heading font-extrabold text-[#08482D] dark:text-[#DAE7C7] mt-1">
                ₹{paymentRecords
                  .filter((p) => p.status === 'SUCCESS')
                  .reduce((sum, p) => sum + (p.amountInRupees || (p.amount ? p.amount / 100 : 0)), 0)
                  .toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                Cryptographically Verified
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#14231b] border border-[#DCE4D6] dark:border-[#233d2e] shadow-sm">
              <div className="text-[11px] font-heading font-semibold text-[#5E5E61] dark:text-[#8ba895] uppercase tracking-wider">
                Paid Transactions
              </div>
              <div className="text-xl sm:text-2xl font-heading font-extrabold text-[#101410] dark:text-[#f0f5ee] mt-1">
                {paymentRecords.filter((p) => p.status === 'SUCCESS').length}
              </div>
              <div className="text-[10px] text-[#5E5E61] dark:text-[#8ba895] mt-0.5">
                Confirmed tickets issued
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#14231b] border border-[#DCE4D6] dark:border-[#233d2e] shadow-sm">
              <div className="text-[11px] font-heading font-semibold text-[#5E5E61] dark:text-[#8ba895] uppercase tracking-wider">
                Pending Checkout
              </div>
              <div className="text-xl sm:text-2xl font-heading font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                {paymentRecords.filter((p) => p.status === 'ORDER_CREATED' || p.status === 'CREATED').length}
              </div>
              <div className="text-[10px] text-[#5E5E61] dark:text-[#8ba895] mt-0.5">
                Awaiting payment completion
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#14231b] border border-[#DCE4D6] dark:border-[#233d2e] shadow-sm">
              <div className="text-[11px] font-heading font-semibold text-[#5E5E61] dark:text-[#8ba895] uppercase tracking-wider">
                Failed / Cancelled
              </div>
              <div className="text-xl sm:text-2xl font-heading font-extrabold text-rose-600 dark:text-rose-400 mt-1">
                {paymentRecords.filter((p) => p.status === 'FAILED').length}
              </div>
              <div className="text-[10px] text-[#5E5E61] dark:text-[#8ba895] mt-0.5">
                Declined or signature mismatch
              </div>
            </div>
          </div>

          {/* Payment Filter & Action Bar */}
          <div className="bg-white dark:bg-[#14231b] p-4 rounded-2xl border border-[#DCE4D6] dark:border-[#233d2e] shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#5E5E61] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Razorpay Order ID, Payment ID, Attendee, or Workshop..."
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-[#DCE4D6] dark:border-[#233d2e] bg-[#F5F8EF]/60 dark:bg-[#1b3025] text-[#101410] dark:text-[#f0f5ee] focus:outline-none focus:ring-2 focus:ring-[#08482D]"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-[#F5F8EF] dark:bg-[#1b3025] p-1 rounded-xl border border-[#DCE4D6] dark:border-[#233d2e]">
                {(['ALL', 'SUCCESS', 'ORDER_CREATED', 'FAILED'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setPaymentStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-heading font-semibold transition-all ${
                      paymentStatusFilter === st
                        ? 'bg-[#08482D] text-[#F5F8EF] shadow-xs'
                        : 'text-[#5E5E61] dark:text-[#8ba895] hover:text-[#101410] dark:hover:text-[#f0f5ee]'
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
                className="px-3.5 py-2 text-xs font-heading font-semibold text-[#08482D] dark:text-[#DAE7C7] bg-[#DAE7C7]/50 dark:bg-[#08482D]/40 hover:bg-[#DAE7C7] rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={fetchPayments}
                disabled={loadingPayments}
                className="p-2 text-[#5E5E61] dark:text-[#8ba895] hover:text-[#101410] dark:hover:text-[#f0f5ee] rounded-xl border border-[#DCE4D6] dark:border-[#233d2e] transition-colors cursor-pointer disabled:opacity-50"
                title="Refresh payments"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingPayments ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Payment Records Table */}
          <div className="bg-white dark:bg-[#14231b] rounded-2xl border border-[#DCE4D6] dark:border-[#233d2e] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F8EF] dark:bg-[#1b3025] border-b border-[#DCE4D6] dark:border-[#233d2e] text-[#5E5E61] dark:text-[#8ba895] font-heading font-semibold uppercase tracking-wider text-[10px]">
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
                <tbody className="divide-y divide-[#DCE4D6]/60 dark:divide-[#233d2e]/60">
                  {loadingPayments ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-[#5E5E61] dark:text-[#8ba895]">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#08482D] dark:text-[#DAE7C7]" />
                        <span>Loading verified payment records from database...</span>
                      </td>
                    </tr>
                  ) : paymentRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-[#5E5E61] dark:text-[#8ba895]">
                        <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#5E5E61]" />
                        <p className="font-heading font-semibold">No payment records found.</p>
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
                          <tr key={p.id} className="hover:bg-[#F5F8EF]/40 dark:hover:bg-[#16291e] transition-colors">
                            <td className="p-3 sm:p-4 space-y-0.5">
                              <div className="font-mono font-bold text-[#101410] dark:text-[#f0f5ee]">
                                {p.id}
                              </div>
                              <div className="text-[10px] font-mono text-[#5E5E61] dark:text-[#8ba895]">
                                Order: {p.razorpayOrderId || '—'}
                              </div>
                              {p.razorpayPaymentId && (
                                <div className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400">
                                  Pay ID: {p.razorpayPaymentId}
                                </div>
                              )}
                            </td>

                            <td className="p-3 sm:p-4">
                              <div className="font-heading font-semibold text-[#101410] dark:text-[#f0f5ee] line-clamp-1">
                                {p.workshopTitle || 'Workshop Session'}
                              </div>
                              {p.ticketCode && (
                                <div className="text-[10px] font-mono text-[#08482D] dark:text-[#DAE7C7] mt-0.5">
                                  Ticket: {p.ticketCode}
                                </div>
                              )}
                            </td>

                            <td className="p-3 sm:p-4">
                              <div className="font-medium text-[#101410] dark:text-[#f0f5ee]">
                                {p.participantName || 'Participant'}
                              </div>
                              <div className="text-[11px] text-[#5E5E61] dark:text-[#8ba895]">
                                {p.participantEmail || '—'}
                              </div>
                            </td>

                            <td className="p-3 sm:p-4 font-mono font-bold text-sm text-[#08482D] dark:text-[#DAE7C7]">
                              ₹{amt}
                            </td>

                            <td className="p-3 sm:p-4">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-heading font-bold uppercase tracking-wider ${
                                  isSuccess
                                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                    : isFailed
                                    ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                                    : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                                }`}
                              >
                                {isSuccess && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                                {isFailed && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                                {isPending && <Clock className="w-3 h-3 text-amber-600" />}
                                {isSuccess ? 'PAID' : isFailed ? 'FAILED' : 'PENDING'}
                              </span>
                            </td>

                            <td className="p-3 sm:p-4">
                              {p.signatureVerified ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>HMAC Verified</span>
                                </span>
                              ) : isFailed ? (
                                <span className="text-[11px] font-medium text-rose-600">
                                  Declined / Mismatch
                                </span>
                              ) : (
                                <span className="text-[11px] text-[#5E5E61] dark:text-[#8ba895]">
                                  Pending Checkout
                                </span>
                              )}
                            </td>

                            <td className="p-3 sm:p-4 text-[11px] text-[#5E5E61] dark:text-[#8ba895]">
                              {p.paidAt ? (
                                <div>
                                  <div className="font-medium text-[#101410] dark:text-[#f0f5ee]">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#14231b] rounded-2xl p-6 max-w-md w-full border border-[#DCE4D6] dark:border-[#233d2e] shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h3 className="text-base font-heading font-bold text-[#101410] dark:text-[#f0f5ee]">
                  {selectedUserToToggle.accountStatus === 'SUSPENDED' ? 'Reactivate Account?' : 'Suspend User Account?'}
                </h3>
              </div>

              <p className="text-xs text-[#5E5E61] dark:text-[#8ba895] leading-relaxed">
                Are you sure you want to {selectedUserToToggle.accountStatus === 'SUSPENDED' ? 'restore platform access for' : 'suspend'}{' '}
                <strong className="text-[#101410] dark:text-[#f0f5ee]">{selectedUserToToggle.fullName}</strong> ({selectedUserToToggle.email})?
                {selectedUserToToggle.accountStatus !== 'SUSPENDED' && (
                  <span className="block mt-2 text-rose-600 dark:text-rose-400 font-semibold">
                    The user will be immediately blocked from signing in and reserving seats.
                  </span>
                )}
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#DCE4D6] dark:border-[#233d2e]">
                <button
                  onClick={() => setSelectedUserToToggle(null)}
                  className="px-4 py-2 text-xs font-heading font-semibold text-[#5E5E61] dark:text-[#8ba895] hover:bg-[#E8F0DF] dark:hover:bg-[#1b3025] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmToggle}
                  className={`px-4 py-2 text-xs font-heading font-semibold text-white rounded-xl shadow-md transition-colors ${
                    selectedUserToToggle.accountStatus === 'SUSPENDED'
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                      : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#14231b] rounded-2xl p-6 max-w-md w-full border border-[#DCE4D6] dark:border-[#233d2e] shadow-2xl space-y-4"
            >
              <h3 className="text-base font-heading font-bold text-[#101410] dark:text-[#f0f5ee]">
                Modify Role for {roleModalUser.fullName}
              </h3>
              <p className="text-xs text-[#5E5E61] dark:text-[#8ba895]">
                Select the target privilege role within the academic platform.
              </p>

              <div className="space-y-2 pt-2">
                {(['PARTICIPANT', 'ORGANIZER', 'VOLUNTEER', 'SUPER_ADMIN'] as UserRole[]).map((r) => (
                  <label
                    key={r}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors text-xs ${
                      targetRole === r
                        ? 'border-[#08482D] bg-[#E8F0DF]/60 dark:bg-[#1b3025] font-semibold text-[#08482D] dark:text-[#9ee2b8]'
                        : 'border-[#DCE4D6] dark:border-[#233d2e] text-[#5E5E61] dark:text-[#8ba895] hover:bg-[#F5F8EF] dark:hover:bg-[#1b3025]'
                    }`}
                  >
                    <span>{r}</span>
                    <input
                      type="radio"
                      name="userRole"
                      value={r}
                      checked={targetRole === r}
                      onChange={() => setTargetRole(r)}
                      className="accent-[#08482D]"
                    />
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#DCE4D6] dark:border-[#233d2e]">
                <button
                  onClick={() => setRoleModalUser(null)}
                  className="px-4 py-2 text-xs font-heading font-semibold text-[#5E5E61] dark:text-[#8ba895] hover:bg-[#E8F0DF] dark:hover:bg-[#1b3025] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRoleChange}
                  className="px-4 py-2 text-xs font-heading font-semibold text-white bg-[#08482D] hover:bg-[#0c5c3b] rounded-xl shadow-md transition-colors"
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

