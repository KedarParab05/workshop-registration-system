import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateSeats } from '../../utils/workshopRules';
import { Workshop, Registration } from '../../types';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Studio Organizer Header Banner */}
      <div className="bg-[#101D32] rounded-2xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6 shadow-[8px_8px_0px_0px_#101D32] border-2 border-[#101D32] relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-heading font-extrabold uppercase tracking-wider text-[#101D32] bg-[#FFD6B0] border border-[#101D32] px-3 py-1 rounded-md shadow-[2px_2px_0px_0px_#101D32]">
              <Sparkles className="w-3.5 h-3.5 text-[#F4511E]" />
              <span>Faculty Organizer Studio</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl font-heading font-extrabold tracking-tight text-white">
            Organizer Studio: {currentUser?.fullName}
          </h1>
          <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
            Manage academic workshop sessions, configure venue GPS locations, assign gate volunteers with secure passcodes, and monitor attendee enrollment rosters.
          </p>
        </div>

        {/* Action Buttons: Appoint Volunteer & Create Workshop */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full md:w-auto shrink-0 relative z-10 font-sans">
          <button
            onClick={() => setAssignVolunteerOpen(true)}
            className="px-4 py-2.5 bg-white text-[#101D32] hover:bg-[#FFD6B0] font-heading font-bold text-xs rounded-lg border-2 border-[#101D32] shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-[#F4511E]" />
            <span>Manage / Appoint Volunteers</span>
          </button>
          <button
            onClick={handleCreateClick}
            className="px-5 py-2.5 bg-[#F4511E] hover:bg-[#E84316] text-white font-heading font-bold text-xs rounded-lg border-2 border-[#101D32] shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-white" />
            <span>Create Workshop</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-[#FFD6B0] border-2 border-[#101D32] text-[#101D32] flex items-center justify-center font-bold shrink-0 shadow-[2px_2px_0px_0px_#101D32]">
            <Calendar className="w-5 h-5 text-[#F4511E]" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-heading font-extrabold text-[#101410] font-mono">
              {myWorkshops.length}
            </div>
            <div className="text-[11px] text-[#101D32]/70 font-semibold">Hosted Workshops</div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-[#FFD6B0] border-2 border-[#101D32] text-[#101D32] flex items-center justify-center font-bold shrink-0 shadow-[2px_2px_0px_0px_#101D32]">
            <Users className="w-5 h-5 text-[#F4511E]" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-heading font-extrabold text-[#F4511E] font-mono">
              {confirmedRegistrations.length}
            </div>
            <div className="text-[11px] text-[#101D32]/70 font-semibold">Enrolled Attendees</div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-[#FFD6B0] border-2 border-[#101D32] text-[#101D32] flex items-center justify-center font-bold shrink-0 shadow-[2px_2px_0px_0px_#101D32]">
            <span className="text-lg font-extrabold text-[#F4511E]">₹</span>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-heading font-extrabold text-[#F4511E] font-mono">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-[#101D32]/70 font-semibold">Gross Revenue</div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-[#FFD6B0] border-2 border-[#101D32] text-[#101D32] flex items-center justify-center font-bold shrink-0 shadow-[2px_2px_0px_0px_#101D32]">
            <UserCheck className="w-5 h-5 text-[#F4511E]" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-heading font-extrabold text-[#101410] font-mono">
              {myVolunteers.length}
            </div>
            <div className="text-[11px] text-[#101D32]/70 font-semibold">Gate Volunteers</div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-[#FFD6B0] border-2 border-[#101D32] text-[#101D32] flex items-center justify-center font-bold shrink-0 shadow-[2px_2px_0px_0px_#101D32]">
            <TrendingUp className="w-5 h-5 text-[#F4511E]" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-heading font-extrabold text-[#F4511E] font-mono">
              {fillRate}%
            </div>
            <div className="text-[11px] text-[#101D32]/70 font-semibold">Seat Fill Rate</div>
          </div>
        </div>
      </div>

      {/* Main Studio View Controller: Tabs & Toolbar */}
      <div className="bg-white rounded-2xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] p-4 sm:p-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 border-b-2 border-[#101D32]/10 pb-4">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setActiveTab('workshops')}
              className={`px-3.5 sm:px-4 py-2 rounded-lg text-xs font-heading font-bold transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer border-2 border-[#101D32] ${
                activeTab === 'workshops'
                  ? 'bg-[#F4511E] text-white shadow-[2px_2px_0px_0px_#101D32]'
                  : 'bg-white text-[#101D32] hover:bg-[#FFD6B0]'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Workshops ({myWorkshops.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('attendees')}
              className={`px-3.5 sm:px-4 py-2 rounded-lg text-xs font-heading font-bold transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer border-2 border-[#101D32] ${
                activeTab === 'attendees'
                  ? 'bg-[#F4511E] text-white shadow-[2px_2px_0px_0px_#101D32]'
                  : 'bg-white text-[#101D32] hover:bg-[#FFD6B0]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Attendees ({confirmedRegistrations.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('volunteers')}
              className={`px-3.5 sm:px-4 py-2 rounded-lg text-xs font-heading font-bold transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer border-2 border-[#101D32] ${
                activeTab === 'volunteers'
                  ? 'bg-[#F4511E] text-white shadow-[2px_2px_0px_0px_#101D32]'
                  : 'bg-white text-[#101D32] hover:bg-[#FFD6B0]'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Volunteers ({myVolunteers.length})</span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#101D32]/70" />
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
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border-2 border-[#101D32] bg-white text-[#101410] focus:outline-none focus:ring-2 focus:ring-[#F4511E]"
            />
          </div>
        </div>

        {/* TAB 1: WORKSHOP MANAGEMENT */}
        {activeTab === 'workshops' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[#101D32] font-bold">Status:</span>
                {(['ALL', 'PUBLISHED', 'DRAFT'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-md text-xs font-heading font-bold transition-all cursor-pointer border border-[#101D32] ${
                      statusFilter === st
                        ? 'bg-[#F4511E] text-white shadow-[1px_1px_0px_0px_#101D32]'
                        : 'bg-white text-[#101D32] hover:bg-[#FFD6B0]'
                    }`}
                  >
                    {st === 'ALL' ? 'All Sessions' : st}
                  </button>
                ))}
              </div>

              <div className="text-[#101D32]/70 text-[11px] font-semibold">
                Showing {filteredWorkshops.length} of {myWorkshops.length} workshops
              </div>
            </div>

            {filteredWorkshops.length === 0 ? (
              <div className="border-2 border-dashed border-[#101D32] rounded-xl p-12 text-center space-y-3 bg-[#FFF5E9]">
                <Calendar className="w-10 h-10 text-[#101D32]/40 mx-auto" />
                <h3 className="text-sm font-heading font-extrabold text-[#101410]">
                  {myWorkshops.length === 0 ? 'No Workshops Created Yet' : 'No matching workshops found'}
                </h3>
                <p className="text-xs text-[#101D32]/70 max-w-sm mx-auto">
                  {myWorkshops.length === 0
                    ? 'Schedule your first academic workshop with GPS venue mapping and appoint volunteers to scan passes.'
                    : 'Try clearing your search query or status filter.'}
                </p>
                {myWorkshops.length === 0 && (
                  <button
                    onClick={handleCreateClick}
                    className="mt-2 px-5 py-2 bg-[#F4511E] hover:bg-[#E84316] text-white rounded-lg border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] text-xs font-heading font-bold cursor-pointer"
                  >
                    Create First Workshop
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border-2 border-[#101D32]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FFF5E9] text-[#101D32] border-b-2 border-[#101D32] font-heading font-extrabold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3.5 px-4">Workshop &amp; Venue</th>
                      <th className="py-3.5 px-4">Pricing</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Date &amp; Schedule</th>
                      <th className="py-3.5 px-4">Capacity / Seats</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-[#101D32]/10 text-[#101410]">
                    {filteredWorkshops.map((ws) => {
                      const seats = calculateSeats(ws, registrations);
                      const percent = ws.capacity > 0 ? Math.min(100, Math.round((seats.registeredCount / ws.capacity) * 100)) : 0;

                      return (
                        <tr key={ws.id} className="hover:bg-[#FFF5E9]/50 transition-colors">
                          {/* Title & Venue */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="font-heading font-extrabold text-[#101410] text-sm line-clamp-1">
                              {ws.title}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-[#101D32]/70 mt-0.5 truncate">
                              <MapPin className="w-3 h-3 text-[#F4511E] shrink-0" />
                              <span className="truncate">{ws.onlineMode ? 'Online Session' : (ws.venueAddress || ws.venue)}</span>
                              {ws.mapUrl && (
                                <a
                                  href={ws.mapUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="View on Google Maps"
                                  className="text-[#F4511E] hover:underline"
                                >
                                  <ExternalLink className="w-3 h-3 inline" />
                                </a>
                              )}
                            </div>
                          </td>

                          {/* Pricing */}
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-[#FFD6B0] border border-[#101D32] text-[#101D32]">
                              {ws.pricingType === 'PAID' ? `₹${ws.price}` : 'FREE'}
                            </span>
                          </td>

                          {/* Category */}
                          <td className="py-3.5 px-4 text-[#101D32] font-semibold">
                            <span className="px-2.5 py-0.5 bg-white text-[#101D32] rounded-md text-[11px] border border-[#101D32]">
                              {ws.category}
                            </span>
                          </td>

                          {/* Date & Schedule */}
                          <td className="py-3.5 px-4 font-mono text-[#101D32]/80 whitespace-nowrap">
                            <div className="font-bold text-[#101410]">{ws.date}</div>
                            <div className="text-[10px] text-[#101D32]/70 font-sans">{ws.startTime} - {ws.endTime}</div>
                          </td>

                          {/* Capacity / Seats Fill */}
                          <td className="py-3.5 px-4 min-w-[130px]">
                            <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                              <span className="font-bold text-[#101410]">{seats.registeredCount} / {ws.capacity}</span>
                              <span className="text-[#101D32]/70 font-bold">{percent}%</span>
                            </div>
                            <div className="w-full h-2 bg-[#FFF5E9] rounded-md border border-[#101D32] overflow-hidden">
                              <div
                                className={`h-full transition-all ${
                                  seats.isFull ? 'bg-[#E84316]' : 'bg-[#F4511E]'
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
                              className={`px-2.5 py-0.5 rounded-md text-[11px] font-heading font-extrabold border border-[#101D32] uppercase cursor-pointer ${
                                ws.status === 'PUBLISHED'
                                  ? 'bg-[#FFD6B0] text-[#101D32]'
                                  : 'bg-[#FFF5E9] text-[#101D32]'
                              }`}
                            >
                              <span>{ws.status}</span>
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                            <button
                              onClick={() => viewRosterForWorkshop(ws.id)}
                              title="View attendees for this session"
                              className="px-2.5 py-1 text-[#101D32] bg-white hover:bg-[#FFD6B0] border border-[#101D32] rounded text-xs font-heading font-bold inline-flex items-center gap-1 cursor-pointer shadow-[1px_1px_0px_0px_#101D32]"
                            >
                              <Users className="w-3.5 h-3.5 text-[#F4511E]" />
                              <span>Roster</span>
                            </button>

                            <button
                              onClick={() => handleEditClick(ws)}
                              title="Edit workshop details"
                              className="px-2 py-1 text-[#101D32] bg-white hover:bg-[#FFD6B0] border border-[#101D32] rounded text-xs font-heading font-bold cursor-pointer shadow-[1px_1px_0px_0px_#101D32]"
                            >
                              <Edit className="w-3.5 h-3.5 inline" />
                            </button>

                            <button
                              onClick={() => navigateTo('workshop-detail', ws.id)}
                              title="View public workshop page"
                              className="px-2 py-1 text-[#101D32] bg-white hover:bg-[#FFD6B0] border border-[#101D32] rounded text-xs font-heading font-bold cursor-pointer shadow-[1px_1px_0px_0px_#101D32]"
                            >
                              <Eye className="w-3.5 h-3.5 inline text-[#F4511E]" />
                            </button>

                            <button
                              onClick={() => setWorkshopToDelete(ws)}
                              title="Delete workshop"
                              className="px-2 py-1 text-rose-700 bg-white hover:bg-rose-100 border border-rose-300 rounded text-xs font-heading font-bold cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,0.2)]"
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
                  className="px-3 py-1.5 rounded-lg border-2 border-[#101D32] bg-white text-[#101410] font-bold"
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
                  className="px-3 py-1.5 rounded-lg border-2 border-[#101D32] bg-white text-[#101410] font-bold"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="CONFIRMED">Confirmed (Pending Gate Scan)</option>
                  <option value="ATTENDED">Attended (Gate Verified)</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <button
                onClick={exportCSV}
                className="px-3.5 py-1.5 bg-[#FFD6B0] hover:bg-[#FFD6B0]/80 text-[#101D32] rounded-lg border-2 border-[#101D32] font-heading font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-[2px_2px_0px_0px_#101D32]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV Roster</span>
              </button>
            </div>

            {filteredRegistrations.length === 0 ? (
              <div className="border-2 border-dashed border-[#101D32] rounded-xl p-12 text-center space-y-2 bg-[#FFF5E9]">
                <Users className="w-10 h-10 text-[#101D32]/40 mx-auto" />
                <h3 className="text-sm font-heading font-extrabold text-[#101410]">No Attendees Found</h3>
                <p className="text-xs text-[#101D32]/70 max-w-sm mx-auto">
                  No participant registrations match the current filters.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border-2 border-[#101D32]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FFF5E9] text-[#101D32] border-b-2 border-[#101D32] font-heading font-extrabold uppercase tracking-wider text-[11px]">
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
                  <tbody className="divide-y-2 divide-[#101D32]/10 text-[#101410]">
                    {filteredRegistrations.map((reg) => {
                      const ws = workshops.find((w) => w.id === reg.workshopId);
                      const isAttended = reg.status === 'ATTENDED' || reg.verified;
                      const isConfirmed = reg.status === 'CONFIRMED' && !isAttended;

                      return (
                        <tr key={reg.id} className="hover:bg-[#FFF5E9]/50 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-heading font-bold text-[#101410]">
                              {reg.participantName}
                            </div>
                            <div className="text-[#101D32]/70 font-mono text-[11px]">
                              {reg.participantEmail}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-[#F4511E] bg-[#FFF5E9] px-2 py-0.5 rounded-md text-[11px] border border-[#101D32]">
                              {reg.ticketCode || `TKT-${reg.id.substring(0, 8).toUpperCase()}`}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-[#101410] font-medium max-w-xs">
                            <div className="truncate font-bold">{ws?.title || 'Workshop'}</div>
                            <div className="text-[11px] text-[#101D32]/70">{ws?.date}</div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FFD6B0] text-[#101D32] border border-[#101D32]">
                              {reg.pricingTypeSnapshot === 'PAID' ? `₹${reg.amount} (${reg.paymentStatus || 'PAID'})` : 'FREE'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-[#101D32]/70 font-mono text-[11px] whitespace-nowrap">
                            {reg.registeredAt?.split('T')[0]}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {isAttended ? (
                              <span className="inline-flex items-center gap-1 text-[#101D32] font-bold text-xs bg-[#FFD6B0] px-2.5 py-0.5 rounded-md border border-[#101D32]">
                                <CheckCircle className="w-3.5 h-3.5 text-[#F4511E]" />
                                <span>Attended (Verified)</span>
                              </span>
                            ) : isConfirmed ? (
                              <span className="inline-flex items-center gap-1 text-[#101D32] font-bold text-xs bg-[#FFF5E9] px-2.5 py-0.5 rounded-md border border-[#101D32]">
                                <ShieldCheck className="w-3.5 h-3.5 text-[#F4511E]" />
                                <span>Pending Gate Scan</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[#E84316] font-bold text-xs bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-300">
                                <XCircle className="w-3.5 h-3.5" /> Cancelled
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                            {ws && (
                              <button
                                onClick={() => setViewTicketData({ registration: reg, workshop: ws })}
                                className="px-2.5 py-1 text-[#101D32] bg-white hover:bg-[#FFD6B0] border border-[#101D32] rounded text-xs font-heading font-bold inline-flex items-center gap-1 cursor-pointer shadow-[1px_1px_0px_0px_#101D32]"
                              >
                                <QrCode className="w-3.5 h-3.5 text-[#F4511E]" />
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
                <h3 className="text-sm font-heading font-extrabold text-[#101410]">
                  Appointed Gate Volunteers
                </h3>
                <p className="text-xs text-[#101D32]/70">
                  Volunteers log in at the Volunteer Portal with their organization access code to scan participant tickets at the gates.
                </p>
              </div>

              <button
                onClick={() => setAssignVolunteerOpen(true)}
                className="px-4 py-2 bg-[#F4511E] hover:bg-[#E84316] text-white font-heading font-bold text-xs rounded-lg border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Appoint Volunteer</span>
              </button>
            </div>

            {filteredVolunteers.length === 0 ? (
              <div className="border-2 border-dashed border-[#101D32] rounded-xl p-12 text-center space-y-3 bg-[#FFF5E9]">
                <UserCheck className="w-10 h-10 text-[#101D32]/40 mx-auto" />
                <h3 className="text-sm font-heading font-extrabold text-[#101410]">
                  No Volunteers Appointed Yet
                </h3>
                <p className="text-xs text-[#101D32]/70 max-w-sm mx-auto">
                  Appoint a volunteer to conduct gate ticket verification for your workshops. They will receive a secure access code.
                </p>
                <button
                  onClick={() => setAssignVolunteerOpen(true)}
                  className="mt-2 px-5 py-2 bg-[#F4511E] hover:bg-[#E84316] text-white rounded-lg border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] text-xs font-heading font-bold transition-colors cursor-pointer"
                >
                  Appoint First Volunteer
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border-2 border-[#101D32]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FFF5E9] text-[#101D32] border-b-2 border-[#101D32] font-heading font-extrabold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3.5 px-4">Volunteer</th>
                      <th className="py-3.5 px-4">Assigned Workshop</th>
                      <th className="py-3.5 px-4">Gate Access Code</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Scans Done</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-[#101D32]/10 text-[#101410]">
                    {filteredVolunteers.map((vol) => {
                      const isCopied = copiedCodeId === vol.id;
                      const isActive = vol.status === 'ACTIVE';

                      return (
                        <tr key={vol.id} className="hover:bg-[#FFF5E9]/50 transition-colors">
                          {/* Volunteer Info */}
                          <td className="py-3.5 px-4">
                            <div className="font-heading font-bold text-[#101410]">
                              {vol.name}
                            </div>
                            <div className="text-[#101D32]/70 font-mono text-[11px]">
                              {vol.email}
                            </div>
                            {vol.phoneNumber && (
                              <div className="text-[#F4511E] font-mono text-[11px] flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3 shrink-0" />
                                <span>{vol.phoneNumber}</span>
                              </div>
                            )}
                          </td>

                          {/* Assigned Workshop */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="font-bold text-[#101410] truncate">
                              {vol.assignedWorkshopTitle}
                            </div>
                            <div className="text-[11px] text-[#101D32]/70">
                              Appointed on {vol.createdAt?.split('T')[0]}
                            </div>
                          </td>

                          {/* Access Code */}
                          <td className="py-3.5 px-4">
                            {vol.accessCode ? (
                              <div className="inline-flex items-center gap-1.5 bg-[#FFF5E9] border border-[#101D32] px-2.5 py-1 rounded-md">
                                <KeyRound className="w-3.5 h-3.5 text-[#F4511E]" />
                                <span className="font-mono font-bold text-[#101410] tracking-wider">
                                  {vol.accessCode}
                                </span>
                                <button
                                  onClick={() => handleCopyCode(vol.id, vol.accessCode!)}
                                  title="Copy code to share with volunteer"
                                  className="p-0.5 text-[#101D32] hover:text-[#F4511E] transition-colors cursor-pointer"
                                >
                                  {isCopied ? <Check className="w-3.5 h-3.5 text-[#F4511E]" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-[#101D32]/70 italic">Code not issued yet</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {vol.status === 'PENDING_APPROVAL' ? (
                              <div className="flex items-center gap-1.5">
                                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#FFD6B0] text-[#101D32] border border-[#101D32] flex items-center gap-1">
                                  <span>Pending Approval</span>
                                </span>
                                <button
                                  onClick={() => approveVolunteerRequest(vol.id)}
                                  className="px-2 py-0.5 bg-[#F4511E] hover:bg-[#E84316] text-white rounded text-[10px] font-bold border border-[#101D32] transition-colors cursor-pointer"
                                  title="Approve request and issue gate access code"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => rejectVolunteerRequest(vol.id)}
                                  className="px-2 py-0.5 bg-white hover:bg-rose-100 text-rose-700 rounded text-[10px] font-bold border border-rose-300 transition-colors cursor-pointer"
                                  title="Reject request"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => toggleVolunteerStatus(vol.id)}
                                title="Click to toggle Active / Revoked"
                                className={`px-2.5 py-0.5 rounded-md text-[11px] font-heading font-extrabold border border-[#101D32] uppercase cursor-pointer ${
                                  isActive
                                    ? 'bg-[#FFD6B0] text-[#101D32]'
                                    : 'bg-rose-100 text-rose-700 border-rose-300'
                                }`}
                              >
                                <span>{vol.status}</span>
                              </button>
                            )}
                          </td>

                          {/* Total Scanned */}
                          <td className="py-3.5 px-4 font-mono font-bold text-[#101410]">
                            {vol.totalScanned || 0} passes
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                            {vol.status !== 'PENDING_APPROVAL' && (
                              <button
                                onClick={() => regenerateVolunteerCode(vol.id)}
                                title="Generate new access code"
                                className="px-2.5 py-1 text-[#101D32] bg-white hover:bg-[#FFD6B0] border border-[#101D32] rounded text-xs font-heading font-bold inline-flex items-center gap-1 cursor-pointer shadow-[1px_1px_0px_0px_#101D32]"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>New Code</span>
                              </button>
                            )}
                            <button
                              onClick={() => deleteVolunteer(vol.id)}
                              title="Revoke and delete volunteer"
                              className="px-2.5 py-1 text-rose-700 bg-white hover:bg-rose-100 border border-rose-300 rounded text-xs font-heading font-bold inline-flex items-center gap-1 cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,0.2)]"
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
            accessCode: res.volunteer?.accessCode || res.accessCode,
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101D32]/70 backdrop-blur-sm font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-[8px_8px_0px_0px_#101D32] border-2 border-[#101D32] z-10 text-xs text-[#101410]"
            >
              <div className="w-12 h-12 rounded-lg bg-[#FFD6B0] border-2 border-[#101D32] text-[#E84316] flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-heading font-extrabold text-[#101410] mb-2">
                Delete Academic Workshop?
              </h3>
              <p className="text-[#101D32]/80 mb-6 leading-relaxed">
                Are you sure you want to delete <strong>"{workshopToDelete.title}"</strong>? This will permanently remove the session and cancel existing participant bookings.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setWorkshopToDelete(null)}
                  className="px-4 py-2 rounded-lg border-2 border-[#101D32] text-[#101D32] font-heading font-bold hover:bg-[#FFD6B0] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded-lg bg-[#E84316] hover:bg-rose-700 text-white font-heading font-bold border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] cursor-pointer"
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
