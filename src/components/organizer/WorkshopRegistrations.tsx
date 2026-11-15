import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Download,
  Search,
  Users,
  CheckCircle,
  XCircle,
  Calendar,
  Sparkles,
  Scan,
  QrCode,
  ShieldCheck,
  MapPin,
  Clock,
  Camera,
  Layers,
} from 'lucide-react';
import { motion } from 'motion/react';
import { QRVerifierModal } from './QRVerifierModal';
import { QRTicketModal } from '../common/QRTicketModal';
import { Registration, Workshop } from '../../types';

export const WorkshopRegistrations: React.FC = () => {
  const { currentUser, workshops, registrations } = useApp();

  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CONFIRMED' | 'ATTENDED' | 'CANCELLED'>('ALL');
  const [isVerifierOpen, setIsVerifierOpen] = useState(false);
  const [verifierTargetWorkshopId, setVerifierTargetWorkshopId] = useState<string | undefined>(undefined);
  const [viewTicketData, setViewTicketData] = useState<{ registration: Registration; workshop: Workshop } | null>(null);

  // Only workshops owned by current organizer (or all if super admin)
  const myWorkshops = workshops.filter(
    (w) =>
      currentUser?.role === 'SUPER_ADMIN' ||
      w.organizerId === currentUser?.id ||
      (currentUser?.fullName && w.organizerNameSnapshot === currentUser.fullName)
  );
  const myWorkshopIds = new Set(myWorkshops.map((w) => w.id));

  // Registrations belonging to my workshops
  const myRegistrations = registrations.filter((r) => myWorkshopIds.has(r.workshopId));

  // Current selected workshop details if filtered
  const activeWorkshop = selectedWorkshopId !== 'ALL'
    ? myWorkshops.find((w) => w.id === selectedWorkshopId)
    : undefined;

  // Filtered registrations
  const filteredRegistrations = myRegistrations.filter((reg) => {
    if (selectedWorkshopId !== 'ALL' && reg.workshopId !== selectedWorkshopId) {
      return false;
    }

    if (statusFilter !== 'ALL' && reg.status !== statusFilter) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = reg.participantName.toLowerCase().includes(q);
      const matchEmail = reg.participantEmail.toLowerCase().includes(q);
      const matchTicket = reg.ticketCode?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchTicket) return false;
    }

    return true;
  });

  // Gate stats for the currently selected workshop (or overall)
  const relevantRegistrations = selectedWorkshopId !== 'ALL'
    ? myRegistrations.filter((r) => r.workshopId === selectedWorkshopId)
    : myRegistrations;

  const totalRegistered = relevantRegistrations.filter((r) => r.status !== 'CANCELLED').length;
  const totalAttended = relevantRegistrations.filter((r) => r.status === 'ATTENDED' || r.verified).length;
  const pendingScan = totalRegistered - totalAttended;

  const handleLaunchScanner = (workshopId?: string) => {
    setVerifierTargetWorkshopId(workshopId || (selectedWorkshopId !== 'ALL' ? selectedWorkshopId : undefined));
    setIsVerifierOpen(true);
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
    link.setAttribute('download', `kaushalya_gate_roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 transition-colors duration-200">
      {/* Top Banner: Gate Verification Command Station */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#08482D] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-[#0b5435] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden"
      >
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-[#DAE7C7]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-heading font-semibold text-[#08482D] bg-[#DAE7C7] px-3 py-1 rounded-full shadow-sm">
              <Scan className="w-3.5 h-3.5 text-[#08482D]" />
              <span>Gate Verification Console</span>
            </span>
            </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight text-white">
            Official Gate Scanner & Attendee Roster
          </h1>
          <p className="text-xs sm:text-sm text-[#DAE7C7]/80 max-w-xl leading-relaxed">
            Verify attendees on the day of their workshop. Passes are validated strictly via the camera gate scanner to ensure single-use integrity and venue matching.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto relative z-10">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleLaunchScanner()}
            className="px-6 py-3 bg-[#DAE7C7] hover:bg-[#c9ddb0] text-[#08482D] font-heading font-bold text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2.5 transition-all"
          >
            <Camera className="w-5 h-5 text-[#08482D]" />
            <span>Launch Camera Scanner</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Gate Station Selection & Real-Time Counters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Gate Selection Card */}
        <div className="md:col-span-2 bg-white dark:bg-[#14231b] p-5 rounded-2xl border border-[#DCE4D6] dark:border-[#203a2c] shadow-sm space-y-2 transition-colors">
          <label className="block text-xs font-heading font-semibold text-[#101410] dark:text-[#E8F0DF]">
            Operating Gate For Workshop:
          </label>
          <select
            value={selectedWorkshopId}
            onChange={(e) => setSelectedWorkshopId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE4D6] dark:border-[#22392c] bg-[#F5F8EF] dark:bg-[#18281f] text-[#101410] dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#08482D]"
          >
            <option value="ALL">All Hosted Workshops (Multi-Gate Mode)</option>
            {myWorkshops.map((ws) => (
              <option key={ws.id} value={ws.id}>
                {ws.title} — {ws.date} ({ws.venue})
              </option>
            ))}
          </select>
          {activeWorkshop && (
            <div className="pt-1 flex items-center gap-3 text-[11px] text-[#5E5E61] dark:text-emerald-400">
              <span className="flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 text-[#08482D] dark:text-[#DAE7C7] shrink-0" />
                <span className="truncate">{activeWorkshop.venueAddress || activeWorkshop.venue}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 shrink-0">
                <Clock className="w-3 h-3 text-[#08482D] dark:text-[#DAE7C7]" />
                <span>{activeWorkshop.startTime} - {activeWorkshop.endTime}</span>
              </span>
            </div>
          )}
        </div>

        {/* Counter: Attended / Verified at Gate */}
        <div className="bg-white dark:bg-[#14231b] p-5 rounded-2xl border border-[#DCE4D6] dark:border-[#203a2c] shadow-sm flex items-center gap-3.5 transition-colors">
          <div className="w-11 h-11 rounded-xl bg-[#E8F0DF] dark:bg-[#1a3325] text-[#08482D] dark:text-[#DAE7C7] flex items-center justify-center font-bold shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-heading font-bold text-[#08482D] dark:text-[#DAE7C7] font-mono">
              {totalAttended}
            </div>
            <div className="text-[11px] text-[#5E5E61] dark:text-emerald-400 font-medium">Verified at Gate</div>
          </div>
        </div>

        {/* Counter: Pending Entry */}
        <div className="bg-white dark:bg-[#14231b] p-5 rounded-2xl border border-[#DCE4D6] dark:border-[#203a2c] shadow-sm flex items-center gap-3.5 transition-colors">
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-heading font-bold text-amber-600 dark:text-amber-400 font-mono">
              {pendingScan}
            </div>
            <div className="text-[11px] text-[#5E5E61] dark:text-slate-400 font-medium">Pending Scan Entry</div>
          </div>
        </div>
      </div>

      {/* Main Table: Attendee Roster with Strict Gate Verification */}
      <div className="bg-white dark:bg-[#14231b] rounded-3xl border border-[#DCE4D6] dark:border-[#203a2c] shadow-sm p-6 space-y-6 transition-colors">
        {/* Table Filters & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCE4D6] dark:border-[#203a2c] pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#5E5E61] dark:text-emerald-400">Status:</span>
            {(['ALL', 'CONFIRMED', 'ATTENDED', 'CANCELLED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-heading font-semibold transition-colors ${
                  statusFilter === st
                    ? 'bg-[#08482D] text-white dark:bg-[#DAE7C7] dark:text-[#08482D]'
                    : 'text-[#5E5E61] hover:bg-[#F5F8EF] dark:hover:bg-[#18281f]'
                }`}
              >
                {st === 'ALL'
                  ? 'All Attendees'
                  : st === 'CONFIRMED'
                  ? 'Pending Scan'
                  : st === 'ATTENDED'
                  ? 'Attended'
                  : 'Cancelled'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5E5E61] dark:text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, email, ticket code..."
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-[#DCE4D6] dark:border-[#22392c] bg-[#F5F8EF] dark:bg-[#18281f] text-[#101410] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#08482D]"
              />
            </div>

            <button
              onClick={exportCSV}
              className="px-3.5 py-2 bg-[#E8F0DF] dark:bg-[#1a3325] hover:bg-[#DCE4D6] dark:hover:bg-[#224431] text-[#08482D] dark:text-[#DAE7C7] rounded-xl font-heading font-semibold text-xs flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Attendee Table */}
        {filteredRegistrations.length === 0 ? (
          <div className="border border-dashed border-[#DCE4D6] dark:border-[#203a2c] rounded-2xl p-12 text-center space-y-2">
            <Users className="w-10 h-10 text-[#5E5E61]/50 dark:text-emerald-700 mx-auto" />
            <h3 className="text-sm font-heading font-bold text-[#101410] dark:text-white">No Attendees Found</h3>
            <p className="text-xs text-[#5E5E61] dark:text-slate-400 max-w-sm mx-auto">
              No participants match the selected workshop or search criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[#DCE4D6] dark:border-[#203a2c]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F8EF] dark:bg-[#18281f] text-[#5E5E61] dark:text-emerald-400 border-b border-[#DCE4D6] dark:border-[#203a2c] font-heading font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Participant Details</th>
                  <th className="py-3.5 px-4">Ticket Pass Code</th>
                  <th className="py-3.5 px-4">Workshop Session</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Registered Date</th>
                  <th className="py-3.5 px-4">Gate Status</th>
                  <th className="py-3.5 px-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE4D6]/70 dark:divide-[#22392c] text-[#101410] dark:text-slate-200">
                {filteredRegistrations.map((reg) => {
                  const ws = workshops.find((w) => w.id === reg.workshopId);
                  const isAttended = reg.status === 'ATTENDED' || reg.verified;
                  const isConfirmed = reg.status === 'CONFIRMED' && !isAttended;

                  return (
                    <tr key={reg.id} className="hover:bg-[#F5F8EF]/60 dark:hover:bg-[#1b2b22] transition-colors">
                      {/* Participant */}
                      <td className="py-3.5 px-4">
                        <div className="font-heading font-bold text-[#101410] dark:text-white">
                          {reg.participantName}
                        </div>
                        <div className="text-[#5E5E61] dark:text-slate-400 font-mono text-[11px]">
                          {reg.participantEmail}
                        </div>
                      </td>

                      {/* Ticket Code */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-[#08482D] dark:text-[#DAE7C7] bg-[#E8F0DF] dark:bg-[#1a3325] px-2 py-0.5 rounded-md text-[11px] border border-[#DAE7C7] dark:border-[#2d4d3a]">
                          {reg.ticketCode || `TKT-${reg.id.substring(0, 8).toUpperCase()}`}
                        </span>
                      </td>

                      {/* Workshop */}
                      <td className="py-3.5 px-4 text-[#101410] dark:text-slate-200 font-medium max-w-xs">
                        <div className="truncate">{ws?.title || 'Workshop'}</div>
                        <div className="text-[11px] text-[#5E5E61] dark:text-slate-400">{ws?.date} • {ws?.venue}</div>
                      </td>

                      {/* Payment */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          reg.pricingTypeSnapshot === 'PAID'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : 'bg-[#E8F0DF] dark:bg-[#1f382a] text-[#08482D] dark:text-[#DAE7C7] border border-[#DCE4D6] dark:border-[#284837]'
                        }`}>
                          {reg.pricingTypeSnapshot === 'PAID' ? `₹${reg.amount} (${reg.paymentStatus || 'PAID'})` : 'FREE'}
                        </span>
                      </td>

                      {/* Registered Date */}
                      <td className="py-3.5 px-4 text-[#5E5E61] dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {reg.registeredAt?.split('T')[0]}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isAttended ? (
                          <span className="inline-flex items-center gap-1 text-[#08482D] dark:text-[#DAE7C7] font-semibold text-xs bg-[#E8F0DF] dark:bg-[#1b2f23] px-2.5 py-0.5 rounded-full border border-[#DAE7C7] dark:border-[#2d4d3a]">
                            <CheckCircle className="w-3.5 h-3.5 text-[#08482D] dark:text-[#a8d38d]" />
                            <span>Attended (Gate Verified)</span>
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

                      {/* Verification Action */}
                      <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                        {ws && (
                          <button
                            onClick={() => setViewTicketData({ registration: reg, workshop: ws })}
                            className="px-2.5 py-1 text-[#08482D] dark:text-[#DAE7C7] hover:bg-[#E8F0DF] dark:hover:bg-[#1b2f23] rounded-lg text-xs font-heading font-semibold inline-flex items-center gap-1"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>View Pass</span>
                          </button>
                        )}
                        {isConfirmed && (
                          <button
                            onClick={() => handleLaunchScanner(reg.workshopId)}
                            className="px-3 py-1 bg-[#08482D] hover:bg-[#0c5c3b] text-white rounded-lg text-xs font-heading font-semibold transition-colors inline-flex items-center gap-1 shadow-sm"
                          >
                            <Scan className="w-3.5 h-3.5 text-[#DAE7C7]" />
                            <span>Scan at Gate</span>
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

      {/* Camera Gate Scanner Modal */}
      <QRVerifierModal
        isOpen={isVerifierOpen}
        onClose={() => setIsVerifierOpen(false)}
        workshopFilterId={verifierTargetWorkshopId}
      />

      {/* Participant Digital Pass Preview */}
      {viewTicketData && (
        <QRTicketModal
          isOpen={true}
          onClose={() => setViewTicketData(null)}
          registration={viewTicketData.registration}
          workshop={viewTicketData.workshop}
        />
      )}
    </div>
  );
};
