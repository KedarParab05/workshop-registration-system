import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateSeats } from '../../utils/workshopRules';
import { Workshop, Registration, Volunteer } from '../../types';
import { WorkshopFormModal } from './WorkshopFormModal';
import { AssignVolunteerModal } from './AssignVolunteerModal';
import { QRTicketModal } from '../common/QRTicketModal';
import {
  Calendar,
  Users,
  PlusCircle,
  TrendingUp,
  Sparkles,
  Search,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  MapPin,
  ExternalLink,
  QrCode,
  ShieldCheck,
  AlertTriangle,
  Download,
  UserCheck,
  KeyRound,
  Copy,
  Check,
  RefreshCw,
  Phone,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const OrganizerDashboard: React.FC = () => {
  const {
    currentUser,
    workshops,
    registrations,
    volunteers,
    deleteWorkshop,
    togglePublishStatus,
    createVolunteer,
    approveVolunteerRequest,
    rejectVolunteerRequest,
    deleteVolunteer,
    toggleVolunteerStatus,
    regenerateVolunteerCode,
    navigateTo,
    refreshData,
  } = useApp();

  React.useEffect(() => {
    refreshData();
  }, [refreshData]);

  const [activeTab, setActiveTab] = useState<'workshops' | 'attendees' | 'volunteers'>('workshops');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [rosterWorkshopFilter, setRosterWorkshopFilter] = useState<string>('ALL');
  const [rosterStatusFilter, setRosterStatusFilter] = useState<'ALL' | 'CONFIRMED' | 'ATTENDED' | 'CANCELLED'>('ALL');

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [assignVolunteerOpen, setAssignVolunteerOpen] = useState(false);
  const [workshopToEdit, setWorkshopToEdit] = useState<Workshop | null>(null);
  const [workshopToDelete, setWorkshopToDelete] = useState<Workshop | null>(null);
  const [viewTicketData, setViewTicketData] = useState<{ registration: Registration; workshop: Workshop } | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Filter workshops hosted by current organizer (or all if super admin)
  const myWorkshops = workshops.filter(
    (w) =>
      currentUser?.role === 'SUPER_ADMIN' ||
      w.organizerId === currentUser?.id ||
      (currentUser?.fullName && w.organizerNameSnapshot === currentUser.fullName)
  );

  const myWorkshopIds = new Set(myWorkshops.map((w) => w.id));

  // Registrations belonging to my workshops
  const myRegistrations = registrations.filter((r) => myWorkshopIds.has(r.workshopId));
  const confirmedRegistrations = myRegistrations.filter((r) => r.status === 'CONFIRMED' || r.status === 'ATTENDED');

  // Volunteers belonging to this organizer (or assigned to this organizer's workshops)
  const myVolunteers = volunteers.filter(
    (v) =>
      currentUser?.role === 'SUPER_ADMIN' ||
      v.organizerId === currentUser?.id ||
      myWorkshopIds.has(v.assignedWorkshopId)
  );

  // Metrics
  const totalCapacity = myWorkshops.reduce((sum, w) => sum + w.capacity, 0);
  const fillRate = totalCapacity > 0 ? Math.round((confirmedRegistrations.length / totalCapacity) * 100) : 0;
  const totalRevenue = confirmedRegistrations
    .filter((r) => r.pricingTypeSnapshot === 'PAID' && r.amount)
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  // Filtered workshops for management tab
  const filteredWorkshops = myWorkshops.filter((w) => {
    if (statusFilter !== 'ALL' && w.status !== statusFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      w.title.toLowerCase().includes(q) ||
      w.category.toLowerCase().includes(q) ||
      w.venue.toLowerCase().includes(q) ||
      (w.venueAddress && w.venueAddress.toLowerCase().includes(q))
    );
  });

  // Filtered registrations for attendee roster tab
  const filteredRegistrations = myRegistrations.filter((reg) => {
    if (rosterWorkshopFilter !== 'ALL' && reg.workshopId !== rosterWorkshopFilter) return false;
    if (rosterStatusFilter !== 'ALL' && reg.status !== rosterStatusFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      reg.participantName.toLowerCase().includes(q) ||
      reg.participantEmail.toLowerCase().includes(q) ||
      (reg.ticketCode && reg.ticketCode.toLowerCase().includes(q))
    );
  });

  // Filtered volunteers for volunteer tab
  const filteredVolunteers = myVolunteers.filter((v) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      v.name.toLowerCase().includes(q) ||
      v.email.toLowerCase().includes(q) ||
      v.assignedWorkshopTitle.toLowerCase().includes(q) ||
      (v.accessCode ? v.accessCode.toLowerCase().includes(q) : false)
    );
  });

  const handleCreateClick = () => {
    setWorkshopToEdit(null);
    setModalOpen(true);
  };

  const handleEditClick = (ws: Workshop) => {
    setWorkshopToEdit(ws);
    setModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (workshopToDelete) {
      deleteWorkshop(workshopToDelete.id);
      setWorkshopToDelete(null);
    }
  };

  const viewRosterForWorkshop = (workshopId: string) => {
    setRosterWorkshopFilter(workshopId);
    setActiveTab('attendees');
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const exportCSV = () => {
    const headers = ['Registration ID', 'Ticket Code', 'Workshop Title', 'Pricing Type', 'Amount (INR)', 'Payment Status', 'Payment Ref', 'Participant Name', 'Email', 'Date', 'Status', 'Verified At', 'Notes'];
    const rows = filteredRegistrations.map((r) => {
      const ws = workshops.find((w) => w.id === r.workshopId);
      return [
        r.id,
        r.ticketCode || '',
        `"${ws?.title || ''}"`,
        r.pricingTypeSnapshot || 'FREE',
        r.amount || 0,
        r.paymentStatus || 'NOT_REQUIRED',
        r.razorpayPaymentId || r.razorpayOrderId || '',
        `"${r.participantName}"`,
        r.participantEmail,
        r.registeredAt,
        r.status,
        r.verifiedAt || '',
        `"${r.notes || ''}"`,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kaushalya_roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 transition-colors duration-200">
      {/* Soft Mint Studio Organizer Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#08482D] rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6 shadow-xl border border-[#0b5435] relative overflow-hidden"
      >
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#DAE7C7]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-heading font-semibold text-[#08482D] bg-[#DAE7C7] px-3 py-1 rounded-full shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#08482D]" />
              <span>Faculty Organizer Studio</span>
            </span>
            <span className="font-hand text-sm text-[#DAE7C7] rotate-2 hidden sm:inline">
              // campus session control
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl font-heading font-bold tracking-tight text-white">
            Organizer Studio: {currentUser?.fullName}
          </h1>
          <p className="text-xs sm:text-sm text-[#DAE7C7]/80 max-w-2xl leading-relaxed">
            Manage academic workshop sessions, configure venue GPS locations, assign gate volunteers with secure passcodes, and monitor attendee enrollment rosters.
          </p>
        </div>

        {/* Action Buttons: Appoint Volunteer & Create Workshop */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full md:w-auto shrink-0 relative z-10">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setAssignVolunteerOpen(true)}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-[#DAE7C7] border border-[#DAE7C7]/30 font-heading font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <UserCheck className="w-4 h-4 text-[#DAE7C7]" />
            <span>Manage / Appoint Volunteers</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateClick}
            className="px-5 py-2.5 bg-[#DAE7C7] hover:bg-[#c9ddb0] text-[#08482D] font-heading font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4 text-[#08482D]" />
            <span>Create Workshop</span>
          </motion.button>
        </div>
      </motion.div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-[#14231b] p-4 sm:p-5 rounded-2xl border border-[#DCE4D6] dark:border-[#203a2c] shadow-sm flex items-center gap-3.5 transition-colors"
        >
          <div className="w-11 h-11 rounded-xl bg-[#E8F0DF] dark:bg-[#1a3325] text-[#08482D] dark:text-[#DAE7C7] flex items-center justify-center font-bold shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-heading font-bold text-[#101410] dark:text-white font-mono">
              {myWorkshops.length}
            </div>
            <div className="text-[11px] text-[#5E5E61] dark:text-emerald-400 font-medium">Hosted Workshops</div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-[#14231b] p-4 sm:p-5 rounded-2xl border border-[#DCE4D6] dark:border-[#203a2c] shadow-sm flex items-center gap-3.5 transition-colors"
        >
          <div className="w-11 h-11 rounded-xl bg-[#DAE7C7] dark:bg-[#1f3d2d] text-[#08482D] dark:text-[#a8d38d] flex items-center justify-center font-bold shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-heading font-bold text-[#08482D] dark:text-[#DAE7C7] font-mono">
              {confirmedRegistrations.length}
            </div>
            <div className="text-[11px] text-[#5E5E61] dark:text-emerald-400 font-medium">Enrolled Attendees</div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-[#14231b] p-4 sm:p-5 rounded-2xl border border-[#DCE4D6] dark:border-[#203a2c] shadow-sm flex items-center gap-3.5 transition-colors"
        >
          <div className="w-11 h-11 rounded-xl bg-[#DAE7C7] dark:bg-[#1f3d2d] text-[#08482D] dark:text-[#a8d38d] flex items-center justify-center font-bold shrink-0">
            <span className="text-lg font-bold">₹</span>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-heading font-bold text-[#08482D] dark:text-[#DAE7C7] font-mono">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-[#5E5E61] dark:text-emerald-400 font-medium">Gross Revenue</div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-[#14231b] p-4 sm:p-5 rounded-2xl border border-[#DCE4D6] dark:border-[#203a2c] shadow-sm flex items-center gap-3.5 transition-colors"
        >
          <div className="w-11 h-11 rounded-xl bg-[#E8F0DF] dark:bg-[#1a3325] text-[#08482D] dark:text-[#DAE7C7] flex items-center justify-center font-bold shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-heading font-bold text-[#08482D] dark:text-[#DAE7C7] font-mono">
              {myVolunteers.length}
            </div>
            <div className="text-[11px] text-[#5E5E61] dark:text-emerald-400 font-medium">Gate Volunteers</div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-[#14231b] p-4 sm:p-5 rounded-2xl border border-[#DCE4D6] dark:border-[#203a2c] shadow-sm flex items-center gap-3.5 transition-colors"
        >
          <div className="w-11 h-11 rounded-xl bg-[#E8F0DF] dark:bg-[#1a3325] text-[#08482D] dark:text-[#DAE7C7] flex items-center justify-center font-bold shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-heading font-bold text-[#08482D] dark:text-[#DAE7C7] font-mono">
              {fillRate}%
            </div>
            <div className="text-[11px] text-[#5E5E61] dark:text-emerald-400 font-medium">Seat Fill Rate</div>
          </div>
        </motion.div>
      </div>

      {/* Main Studio View Controller: Tabs & Toolbar */}
      <div className="bg-white dark:bg-[#14231b] rounded-3xl border border-[#DCE4D6] dark:border-[#203a2c] shadow-sm p-4 sm:p-6 space-y-6 transition-colors">
        {/* Navigation Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 border-b border-[#DCE4D6] dark:border-[#203a2c] pb-4">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setActiveTab('workshops')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-heading font-semibold transition-all flex items-center gap-1.5 sm:gap-2 ${
                activeTab === 'workshops'
                  ? 'bg-[#08482D] text-white shadow-sm'
                  : 'text-[#5E5E61] dark:text-slate-400 hover:bg-[#F5F8EF] dark:hover:bg-[#1b2f23]'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Workshops ({myWorkshops.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('attendees')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-heading font-semibold transition-all flex items-center gap-1.5 sm:gap-2 ${
                activeTab === 'attendees'
                  ? 'bg-[#08482D] text-white shadow-sm'
                  : 'text-[#5E5E61] dark:text-slate-400 hover:bg-[#F5F8EF] dark:hover:bg-[#1b2f23]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Attendees ({confirmedRegistrations.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('volunteers')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-heading font-semibold transition-all flex items-center gap-1.5 sm:gap-2 ${
                activeTab === 'volunteers'
                  ? 'bg-[#08482D] text-white shadow-sm'
                  : 'text-[#5E5E61] dark:text-slate-400 hover:bg-[#F5F8EF] dark:hover:bg-[#1b2f23]'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Volunteers ({myVolunteers.length})</span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5E5E61] dark:text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'workshops'
                  ? 'Search workshops, venue...'
                  : activeTab === 'attendees'
                  ? 'Search attendees, ticket...'
                  : 'Search volunteers, code...'
              }
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-[#DCE4D6] dark:border-[#22392c] bg-[#F5F8EF] dark:bg-[#18281f] text-[#101410] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#08482D]"
            />
          </div>
        </div>

        {/* TAB 1: WORKSHOP MANAGEMENT */}
        {activeTab === 'workshops' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[#5E5E61] dark:text-emerald-400 font-medium">Status:</span>
                {(['ALL', 'PUBLISHED', 'DRAFT'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-heading font-semibold transition-colors ${
                      statusFilter === st
                        ? 'bg-[#08482D] text-white dark:bg-[#DAE7C7] dark:text-[#08482D]'
                        : 'text-[#5E5E61] hover:bg-[#F5F8EF] dark:hover:bg-[#1b2f23]'
                    }`}
                  >
                    {st === 'ALL' ? 'All Sessions' : st}
                  </button>
                ))}
              </div>

              <div className="text-[#5E5E61] dark:text-slate-400 text-[11px]">
                Showing {filteredWorkshops.length} of {myWorkshops.length} workshops
              </div>
            </div>

            {filteredWorkshops.length === 0 ? (
              <div className="border border-dashed border-[#DCE4D6] dark:border-[#22392c] rounded-2xl p-12 text-center space-y-3 bg-[#F5F8EF]/30 dark:bg-[#14231b]/30">
                <Calendar className="w-10 h-10 text-[#5E5E61]/50 dark:text-emerald-700 mx-auto" />
                <h3 className="text-sm font-heading font-bold text-[#101410] dark:text-white">
                  {myWorkshops.length === 0 ? 'No Workshops Created Yet' : 'No matching workshops found'}
                </h3>
                <p className="text-xs text-[#5E5E61] dark:text-slate-400 max-w-sm mx-auto">
                  {myWorkshops.length === 0
                    ? 'Schedule your first academic workshop with GPS venue mapping and appoint volunteers to scan passes.'
                    : 'Try clearing your search query or status filter.'}
                </p>
                {myWorkshops.length === 0 && (
                  <button
                    onClick={handleCreateClick}
                    className="mt-2 px-5 py-2 bg-[#08482D] hover:bg-[#0c5c3b] text-white rounded-xl text-xs font-heading font-semibold transition-colors"
                  >
                    Create First Workshop
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-[#DCE4D6] dark:border-[#22392c]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F5F8EF] dark:bg-[#18281f] text-[#5E5E61] dark:text-emerald-400 border-b border-[#DCE4D6] dark:border-[#22392c] font-heading font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3.5 px-4">Workshop & Venue</th>
                      <th className="py-3.5 px-4">Pricing</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Date & Schedule</th>
                      <th className="py-3.5 px-4">Capacity / Seats</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCE4D6]/70 dark:divide-[#22392c] text-[#101410] dark:text-slate-200">
                    {filteredWorkshops.map((ws) => {
                      const seats = calculateSeats(ws, registrations);
                      const percent = ws.capacity > 0 ? Math.min(100, Math.round((seats.registeredCount / ws.capacity) * 100)) : 0;

                      return (
                        <tr key={ws.id} className="hover:bg-[#F5F8EF]/60 dark:hover:bg-[#1b2b22] transition-colors">
                          {/* Title & Venue with GPS Indicator */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="font-heading font-bold text-[#101410] dark:text-white text-sm line-clamp-1">
                              {ws.title}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-[#5E5E61] dark:text-slate-400 mt-0.5 truncate">
                              <MapPin className="w-3 h-3 text-[#08482D] dark:text-[#DAE7C7] shrink-0" />
                              <span className="truncate">{ws.onlineMode ? 'Online Session' : (ws.venueAddress || ws.venue)}</span>
                              {ws.mapUrl && (
                                <a
                                  href={ws.mapUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="View on Google Maps"
                                  className="text-[#08482D] dark:text-[#DAE7C7] hover:underline"
                                >
                                  <ExternalLink className="w-3 h-3 inline" />
                                </a>
                              )}
                            </div>
                          </td>

                          {/* Pricing */}
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                              ws.pricingType === 'PAID'
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                : 'bg-[#E8F0DF] dark:bg-[#1f382a] text-[#08482D] dark:text-[#DAE7C7] border border-[#DCE4D6] dark:border-[#284837]'
                            }`}>
                              {ws.pricingType === 'PAID' ? `₹${ws.price}` : 'FREE'}
                            </span>
                          </td>

                          {/* Category */}
                          <td className="py-3.5 px-4 text-[#5E5E61] dark:text-slate-300 font-medium">
                            <span className="px-2.5 py-0.5 bg-[#E8F0DF] dark:bg-[#1f382a] text-[#08482D] dark:text-[#DAE7C7] rounded-md text-[11px] font-medium border border-[#DCE4D6] dark:border-[#284837]">
                              {ws.category}
                            </span>
                          </td>

                          {/* Date & Schedule */}
                          <td className="py-3.5 px-4 font-mono text-[#5E5E61] dark:text-slate-300 whitespace-nowrap">
                            <div>{ws.date}</div>
                            <div className="text-[10px] text-[#5E5E61] dark:text-slate-400 font-sans">{ws.startTime} - {ws.endTime}</div>
                          </td>

                          {/* Capacity / Seats Fill */}
                          <td className="py-3.5 px-4 min-w-[130px]">
                            <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                              <span className="font-semibold text-[#101410] dark:text-white">{seats.registeredCount} / {ws.capacity}</span>
                              <span className="text-[#5E5E61] dark:text-slate-400">{percent}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-[#E8F0DF] dark:bg-[#1b2b22] rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${
                                  seats.isFull ? 'bg-rose-500' : percent > 75 ? 'bg-amber-500' : 'bg-[#08482D] dark:bg-[#a8d38d]'
                                }`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </td>

                          {/* Publication Status Toggle */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <button
                              onClick={() => togglePublishStatus(ws.id)}
                              title="Click to toggle Draft / Published"
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-transform active:scale-95 inline-flex items-center gap-1 ${
                                ws.status === 'PUBLISHED'
                                  ? 'bg-[#E8F0DF] dark:bg-[#1b2f23] text-[#08482D] dark:text-[#DAE7C7] border border-[#DAE7C7] dark:border-[#2d4d3a]'
                                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              <span>{ws.status}</span>
                            </button>
                          </td>

                          {/* Actions: Roster, Edit, View, Delete */}
                          <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                            {/* View Roster */}
                            <button
                              onClick={() => viewRosterForWorkshop(ws.id)}
                              title="View attendees for this session"
                              className="px-2.5 py-1 text-[#08482D] dark:text-[#DAE7C7] hover:bg-[#E8F0DF] dark:hover:bg-[#1b2f23] rounded-lg text-xs font-heading font-semibold inline-flex items-center gap-1"
                            >
                              <Users className="w-3.5 h-3.5" />
                              <span>Roster</span>
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => handleEditClick(ws)}
                              title="Edit workshop details"
                              className="px-2 py-1 text-[#5E5E61] dark:text-slate-300 hover:bg-[#F5F8EF] dark:hover:bg-[#1b2f23] rounded-lg text-xs font-heading font-semibold"
                            >
                              <Edit className="w-3.5 h-3.5 inline" />
                            </button>

                            {/* Public View */}
                            <button
                              onClick={() => navigateTo('workshop-detail', ws.id)}
                              title="View public workshop page"
                              className="px-2 py-1 text-[#08482D] dark:text-[#DAE7C7] hover:bg-[#E8F0DF] dark:hover:bg-[#1b2f23] rounded-lg text-xs font-heading font-semibold"
                            >
                              <Eye className="w-3.5 h-3.5 inline" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => setWorkshopToDelete(ws)}
                              title="Delete workshop"
                              className="px-2 py-1 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-xs font-heading font-semibold"
                            >
                              <Trash2 className="w-3.5 h-3.5 inline" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ATTENDEE ROSTER */}
        {activeTab === 'attendees' && (
          <div className="space-y-4">
            {/* Filter & Export Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={rosterWorkshopFilter}
                  onChange={(e) => setRosterWorkshopFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-[#DCE4D6] dark:border-[#22392c] bg-[#F5F8EF] dark:bg-[#18281f] text-[#101410] dark:text-white font-medium"
                >
                  <option value="ALL">All Hosted Workshops</option>
                  {myWorkshops.map((ws) => (
                    <option key={ws.id} value={ws.id}>
                      {ws.title} ({ws.date})
                    </option>
                  ))}
                </select>

                <select
                  value={rosterStatusFilter}
                  onChange={(e) => setRosterStatusFilter(e.target.value as any)}
                  className="px-3 py-1.5 rounded-xl border border-[#DCE4D6] dark:border-[#22392c] bg-[#F5F8EF] dark:bg-[#18281f] text-[#101410] dark:text-white font-medium"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="CONFIRMED">Confirmed (Pending Gate Scan)</option>
                  <option value="ATTENDED">Attended (Gate Verified)</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <button
                onClick={exportCSV}
                className="px-3.5 py-1.5 bg-[#E8F0DF] dark:bg-[#1a3325] hover:bg-[#DCE4D6] dark:hover:bg-[#224431] text-[#08482D] dark:text-[#DAE7C7] rounded-xl font-heading font-semibold text-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV Roster</span>
              </button>
            </div>

            {filteredRegistrations.length === 0 ? (
              <div className="border border-dashed border-[#DCE4D6] dark:border-[#22392c] rounded-2xl p-12 text-center space-y-2">
                <Users className="w-10 h-10 text-[#5E5E61]/50 dark:text-emerald-700 mx-auto" />
                <h3 className="text-sm font-heading font-bold text-[#101410] dark:text-white">No Attendees Found</h3>
                <p className="text-xs text-[#5E5E61] dark:text-slate-400 max-w-sm mx-auto">
                  No participant registrations match the current filters.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-[#DCE4D6] dark:border-[#22392c]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F5F8EF] dark:bg-[#18281f] text-[#5E5E61] dark:text-emerald-400 border-b border-[#DCE4D6] dark:border-[#22392c] font-heading font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3.5 px-4">Participant</th>
                      <th className="py-3.5 px-4">Ticket Pass Code</th>
                      <th className="py-3.5 px-4">Workshop Session</th>
                      <th className="py-3.5 px-4">Payment</th>
                      <th className="py-3.5 px-4">Registered</th>
                      <th className="py-3.5 px-4">Gate Status</th>
                      <th className="py-3.5 px-4 text-right">Pass Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCE4D6]/70 dark:divide-[#22392c] text-[#101410] dark:text-slate-200">
                    {filteredRegistrations.map((reg) => {
                      const ws = workshops.find((w) => w.id === reg.workshopId);
                      const isAttended = reg.status === 'ATTENDED' || reg.verified;
                      const isConfirmed = reg.status === 'CONFIRMED' && !isAttended;

                      return (
                        <tr key={reg.id} className="hover:bg-[#F5F8EF]/60 dark:hover:bg-[#1b2b22] transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-heading font-bold text-[#101410] dark:text-white">
                              {reg.participantName}
                            </div>
                            <div className="text-[#5E5E61] dark:text-slate-400 font-mono text-[11px]">
                              {reg.participantEmail}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-[#08482D] dark:text-[#DAE7C7] bg-[#E8F0DF] dark:bg-[#1a3325] px-2 py-0.5 rounded-md text-[11px] border border-[#DAE7C7] dark:border-[#2d4d3a]">
                              {reg.ticketCode || `TKT-${reg.id.substring(0, 8).toUpperCase()}`}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-[#101410] dark:text-slate-200 font-medium max-w-xs">
                            <div className="truncate">{ws?.title || 'Workshop'}</div>
                            <div className="text-[11px] text-[#5E5E61] dark:text-slate-400">{ws?.date}</div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              reg.pricingTypeSnapshot === 'PAID'
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                : 'bg-[#E8F0DF] dark:bg-[#1f382a] text-[#08482D] dark:text-[#DAE7C7] border border-[#DCE4D6] dark:border-[#284837]'
                            }`}>
                              {reg.pricingTypeSnapshot === 'PAID' ? `₹${reg.amount} (${reg.paymentStatus || 'PAID'})` : 'FREE'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-[#5E5E61] dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">
                            {reg.registeredAt?.split('T')[0]}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {isAttended ? (
                              <span className="inline-flex items-center gap-1 text-[#08482D] dark:text-[#DAE7C7] font-semibold text-xs bg-[#E8F0DF] dark:bg-[#1b2f23] px-2.5 py-0.5 rounded-full border border-[#DAE7C7] dark:border-[#2d4d3a]">
                                <CheckCircle className="w-3.5 h-3.5 text-[#08482D] dark:text-[#a8d38d]" />
                                <span>Attended (Verified)</span>
                              </span>
                            ) : isConfirmed ? (
                              <span className="inline-flex items-center gap-1 text-[#08482D] dark:text-[#DAE7C7] font-semibold text-xs bg-[#F5F8EF] dark:bg-[#18281f] px-2.5 py-0.5 rounded-full border border-[#DCE4D6] dark:border-[#22392c]">
                                <ShieldCheck className="w-3.5 h-3.5 text-[#08482D] dark:text-[#a8d38d]" />
                                <span>Pending Gate Scan</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-slate-400 font-semibold text-xs bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                                <XCircle className="w-3.5 h-3.5" /> Cancelled
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                            {ws && (
                              <button
                                onClick={() => setViewTicketData({ registration: reg, workshop: ws })}
                                className="px-2.5 py-1 text-[#08482D] dark:text-[#DAE7C7] hover:bg-[#E8F0DF] dark:hover:bg-[#1b2f23] rounded-lg text-xs font-heading font-semibold inline-flex items-center gap-1"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                                <span>View QR Pass</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MANAGE GATE VOLUNTEERS */}
        {activeTab === 'volunteers' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-heading font-bold text-[#101410] dark:text-white">
                  Appointed Gate Volunteers
                </h3>
                <p className="text-xs text-[#5E5E61] dark:text-slate-400">
                  Volunteers log in at the Volunteer Portal with their organization access code to scan participant tickets at the gates.
                </p>
              </div>

              <button
                onClick={() => setAssignVolunteerOpen(true)}
                className="px-4 py-2 bg-[#08482D] hover:bg-[#0c5c3b] text-white font-heading font-semibold text-xs rounded-xl transition-colors shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Appoint Volunteer</span>
              </button>
            </div>

            {filteredVolunteers.length === 0 ? (
              <div className="border border-dashed border-[#DCE4D6] dark:border-[#22392c] rounded-2xl p-12 text-center space-y-3">
                <UserCheck className="w-10 h-10 text-[#5E5E61]/50 dark:text-emerald-700 mx-auto" />
                <h3 className="text-sm font-heading font-bold text-[#101410] dark:text-white">
                  No Volunteers Appointed Yet
                </h3>
                <p className="text-xs text-[#5E5E61] dark:text-slate-400 max-w-sm mx-auto">
                  Appoint a volunteer to conduct gate ticket verification for your workshops. They will receive a secure access code.
                </p>
                <button
                  onClick={() => setAssignVolunteerOpen(true)}
                  className="mt-2 px-5 py-2 bg-[#08482D] hover:bg-[#0c5c3b] text-white rounded-xl text-xs font-heading font-semibold transition-colors"
                >
                  Appoint First Volunteer
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-[#DCE4D6] dark:border-[#22392c]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F5F8EF] dark:bg-[#18281f] text-[#5E5E61] dark:text-emerald-400 border-b border-[#DCE4D6] dark:border-[#22392c] font-heading font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3.5 px-4">Volunteer</th>
                      <th className="py-3.5 px-4">Assigned Workshop</th>
                      <th className="py-3.5 px-4">Gate Access Code</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Scans Done</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCE4D6]/70 dark:divide-[#22392c] text-[#101410] dark:text-slate-200">
                    {filteredVolunteers.map((vol) => {
                      const isCopied = copiedCodeId === vol.id;
                      const isActive = vol.status === 'ACTIVE';

                      return (
                        <tr key={vol.id} className="hover:bg-[#F5F8EF]/60 dark:hover:bg-[#1b2b22] transition-colors">
                          {/* Volunteer Info */}
                          <td className="py-3.5 px-4">
                            <div className="font-heading font-bold text-[#101410] dark:text-white">
                              {vol.name}
                            </div>
                            <div className="text-[#5E5E61] dark:text-slate-400 font-mono text-[11px]">
                              {vol.email}
                            </div>
                            {vol.phoneNumber && (
                              <div className="text-[#08482D] dark:text-[#DAE7C7] font-mono text-[11px] flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3 shrink-0" />
                                <span>{vol.phoneNumber}</span>
                              </div>
                            )}
                          </td>

                          {/* Assigned Workshop */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="font-medium text-[#101410] dark:text-white truncate">
                              {vol.assignedWorkshopTitle}
                            </div>
                            <div className="text-[11px] text-[#5E5E61] dark:text-slate-400">
                              Appointed on {vol.createdAt?.split('T')[0]}
                            </div>
                          </td>

                          {/* Access Code with Copy Button */}
                          <td className="py-3.5 px-4">
                            {vol.accessCode ? (
                              <div className="inline-flex items-center gap-1.5 bg-[#E8F0DF] dark:bg-[#1a3325] border border-[#DAE7C7] dark:border-[#2d4d3a] px-2.5 py-1 rounded-lg">
                                <KeyRound className="w-3.5 h-3.5 text-[#08482D] dark:text-[#DAE7C7]" />
                                <span className="font-mono font-bold text-[#08482D] dark:text-[#DAE7C7] tracking-wider">
                                  {vol.accessCode}
                                </span>
                                <button
                                  onClick={() => handleCopyCode(vol.id, vol.accessCode!)}
                                  title="Copy code to share with volunteer"
                                  className="p-0.5 text-[#08482D] dark:text-[#DAE7C7] hover:opacity-75 transition-opacity"
                                >
                                  {isCopied ? <Check className="w-3.5 h-3.5 text-[#08482D] dark:text-[#a8d38d]" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-[#5E5E61] italic">Code not issued yet</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {vol.status === 'PENDING_APPROVAL' ? (
                              <div className="flex items-center gap-1.5">
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                  <span>Pending Approval</span>
                                </span>
                                <button
                                  onClick={() => approveVolunteerRequest(vol.id)}
                                  className="px-2 py-0.5 bg-[#08482D] hover:bg-[#0c5c3b] text-white rounded-lg text-[10px] font-semibold transition-colors shadow-sm"
                                  title="Approve request and issue gate access code"
                                >
                                  Approve & Issue Code
                                </button>
                                <button
                                  onClick={() => rejectVolunteerRequest(vol.id)}
                                  className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 hover:bg-rose-500 hover:text-white text-slate-700 dark:text-slate-200 rounded-lg text-[10px] font-semibold transition-colors"
                                  title="Reject request"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => toggleVolunteerStatus(vol.id)}
                                title="Click to toggle Active / Revoked"
                                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-transform active:scale-95 inline-flex items-center gap-1 ${
                                  isActive
                                    ? 'bg-[#E8F0DF] dark:bg-[#1b2f23] text-[#08482D] dark:text-[#DAE7C7] border border-[#DAE7C7] dark:border-[#2d4d3a]'
                                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                                }`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                <span>{vol.status}</span>
                              </button>
                            )}
                          </td>

                          {/* Total Scanned */}
                          <td className="py-3.5 px-4 font-mono font-semibold text-[#101410] dark:text-slate-300">
                            {vol.totalScanned || 0} passes
                          </td>

                          {/* Actions: Regenerate Code, Delete */}
                          <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                            {vol.status !== 'PENDING_APPROVAL' && (
                              <button
                                onClick={() => regenerateVolunteerCode(vol.id)}
                                title="Generate new access code"
                                className="px-2.5 py-1 text-[#5E5E61] dark:text-slate-300 hover:bg-[#F5F8EF] dark:hover:bg-[#1b2f23] rounded-lg text-xs font-heading font-semibold inline-flex items-center gap-1"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>New Code</span>
                              </button>
                            )}
                            <button
                              onClick={() => deleteVolunteer(vol.id)}
                              title="Revoke and delete volunteer"
                              className="px-2.5 py-1 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-xs font-heading font-semibold inline-flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Workshop Create/Edit Modal */}
      <WorkshopFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        workshopToEdit={workshopToEdit}
      />

      {/* Assign Volunteer Modal */}
      <AssignVolunteerModal
        isOpen={assignVolunteerOpen}
        onClose={() => setAssignVolunteerOpen(false)}
        workshops={myWorkshops}
        onAssign={async (data) => {
          const res = await createVolunteer({
            ...data,
            organizerId: currentUser?.id,
          });
          return {
            success: res.success,
            message: res.message,
            accessCode: res.volunteer?.accessCode,
          };
        }}
      />

      {/* Participant Digital Ticket Pass Preview */}
      {viewTicketData && (
        <QRTicketModal
          isOpen={true}
          onClose={() => setViewTicketData(null)}
          registration={viewTicketData.registration}
          workshop={viewTicketData.workshop}
        />
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {workshopToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setWorkshopToDelete(null)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white dark:bg-[#14231b] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#DCE4D6] dark:border-[#22392c] z-10 text-xs text-[#101410] dark:text-[#E8F0DF]"
            >
              <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-heading font-bold text-[#101410] dark:text-white mb-2">
                Delete Academic Workshop?
              </h3>
              <p className="text-[#5E5E61] dark:text-slate-400 mb-6 leading-relaxed">
                Are you sure you want to delete <strong>"{workshopToDelete.title}"</strong>? This will remove the session from MongoDB Atlas and cancel existing participant bookings.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setWorkshopToDelete(null)}
                  className="px-4 py-2 rounded-xl border border-[#DCE4D6] dark:border-[#22392c] text-[#5E5E61] dark:text-slate-300 font-heading font-semibold hover:bg-[#F5F8EF] dark:hover:bg-[#18281f]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-heading font-semibold shadow-md shadow-rose-500/20"
                >
                  Delete Workshop
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
