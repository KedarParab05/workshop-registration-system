import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Download,
  Search,
  Users,
  CheckCircle,
  XCircle,
  Scan,
  QrCode,
  ShieldCheck,
  MapPin,
  Clock,
  Camera,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner: Gate Verification Command Station */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#101D32] rounded-3xl p-6 sm:p-8 text-white shadow-[6px_6px_0px_0px_#101D32] border-2 border-[#101D32] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden"
      >
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#101D32] bg-[#FFD6B0] px-3 py-1 rounded-full border border-[#101D32] shadow-[2px_2px_0px_0px_#101D32]">
              <Scan className="w-3.5 h-3.5 text-[#F4511E]" />
              <span>Gate Verification Console</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-white">
            Official Gate Scanner & Attendee Roster
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Verify attendees on the day of their workshop. Passes are validated strictly via the camera gate scanner to ensure single-use integrity and venue matching.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto relative z-10">
          <button
            onClick={() => handleLaunchScanner()}
            className="px-6 py-3 bg-[#F4511E] hover:bg-[#E84316] text-white font-heading font-extrabold text-sm rounded-2xl border-2 border-[#101D32] shadow-[3px_3px_0px_0px_#101D32] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-2.5 transition-all cursor-pointer"
          >
            <Camera className="w-5 h-5 text-white" />
            <span>Launch Camera Scanner</span>
          </button>
        </div>
      </motion.div>

      {/* Gate Station Selection & Real-Time Counters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Gate Selection Card */}
        <div className="md:col-span-2 bg-white p-5 rounded-2xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] space-y-2">
          <label className="block text-xs font-heading font-bold text-[#101410]">
            Operating Gate For Workshop:
          </label>
          <select
            value={selectedWorkshopId}
            onChange={(e) => setSelectedWorkshopId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#101D32] bg-[#FFF5E9] text-[#101D32] text-xs font-bold shadow-[2px_2px_0px_0px_#101D32] focus:outline-none focus:bg-white"
          >
            <option value="ALL">All Hosted Workshops (Multi-Gate Mode)</option>
            {myWorkshops.map((ws) => (
              <option key={ws.id} value={ws.id}>
                {ws.title} — {ws.date} ({ws.venue})
              </option>
            ))}
          </select>
          {activeWorkshop && (
            <div className="pt-1 flex items-center gap-3 text-[11px] text-[#101D32]/75 font-medium">
              <span className="flex items-center gap-1 truncate">
                <MapPin className="w-3.5 h-3.5 text-[#F4511E] shrink-0" />
                <span className="truncate">{activeWorkshop.venueAddress || activeWorkshop.venue}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 shrink-0">
                <Clock className="w-3.5 h-3.5 text-[#F4511E] shrink-0" />
                <span>{activeWorkshop.startTime} - {activeWorkshop.endTime}</span>
              </span>
            </div>
          )}
        </div>

        {/* Counter: Attended / Verified at Gate */}
        <div className="bg-white p-5 rounded-2xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#FFD6B0] text-[#101D32] border-2 border-[#101D32] flex items-center justify-center font-bold shrink-0 shadow-[2px_2px_0px_0px_#101D32]">
            <CheckCircle className="w-6 h-6 text-[#101D32]" />
          </div>
          <div>
            <div className="text-2xl font-heading font-black text-[#101D32] font-mono">
              {totalAttended}
            </div>
            <div className="text-[11px] text-[#101D32]/75 font-bold">Verified at Gate</div>
          </div>
        </div>

        {/* Counter: Pending Entry */}
        <div className="bg-white p-5 rounded-2xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#FFF5E9] text-[#F4511E] border-2 border-[#101D32] flex items-center justify-center font-bold shrink-0 shadow-[2px_2px_0px_0px_#101D32]">
            <Clock className="w-6 h-6 text-[#F4511E]" />
          </div>
          <div>
            <div className="text-2xl font-heading font-black text-[#F4511E] font-mono">
              {pendingScan}
            </div>
            <div className="text-[11px] text-[#101D32]/75 font-bold">Pending Scan Entry</div>
          </div>
        </div>
      </div>

      {/* Main Table: Attendee Roster with Strict Gate Verification */}
      <div className="bg-white rounded-3xl border-2 border-[#101D32] shadow-[6px_6px_0px_0px_#101D32] p-6 space-y-6">
        {/* Table Filters & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#101D32] pb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-[#101D32]">Status:</span>
            {(['ALL', 'CONFIRMED', 'ATTENDED', 'CANCELLED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-[#101D32] transition-all ${
                  statusFilter === st
                    ? 'bg-[#F4511E] text-white shadow-[2px_2px_0px_0px_#101D32]'
                    : 'bg-white text-[#101D32] hover:bg-[#FFD6B0]'
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
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#101D32]/60" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, email, ticket..."
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border-2 border-[#101D32] bg-[#FFF5E9] text-[#101D32] font-medium shadow-[2px_2px_0px_0px_#101D32] focus:outline-none focus:bg-white"
              />
            </div>

            <button
              onClick={exportCSV}
              className="px-3.5 py-2 bg-white hover:bg-[#FFD6B0] text-[#101D32] rounded-xl font-heading font-bold text-xs border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-[#F4511E]" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Attendee Table */}
        {filteredRegistrations.length === 0 ? (
          <div className="border-2 border-dashed border-[#101D32] rounded-2xl p-12 text-center space-y-2 bg-[#FFF5E9]/50">
            <Users className="w-10 h-10 text-[#101D32]/40 mx-auto" />
            <h3 className="text-sm font-heading font-black text-[#101410]">No Attendees Found</h3>
            <p className="text-xs text-[#101D32]/75 max-w-sm mx-auto font-medium">
              No participants match the selected workshop or search criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border-2 border-[#101D32]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF5E9] text-[#101D32] border-b-2 border-[#101D32] font-heading font-black uppercase tracking-wider text-[11px]">
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
              <tbody className="divide-y-2 divide-[#101D32]/20 text-[#101D32]">
                {filteredRegistrations.map((reg) => {
                  const ws = workshops.find((w) => w.id === reg.workshopId);
                  const isAttended = reg.status === 'ATTENDED' || reg.verified;
                  const isConfirmed = reg.status === 'CONFIRMED' && !isAttended;

                  return (
                    <tr key={reg.id} className="hover:bg-[#FFF5E9]/50 transition-colors">
                      {/* Participant */}
                      <td className="py-3.5 px-4">
                        <div className="font-heading font-black text-[#101410]">
                          {reg.participantName}
                        </div>
                        <div className="text-[#101D32]/75 font-mono text-[11px]">
                          {reg.participantEmail}
                        </div>
                      </td>

                      {/* Ticket Code */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-[#101D32] bg-[#FFD6B0] px-2 py-0.5 rounded-md text-[11px] border border-[#101D32]">
                          {reg.ticketCode || `TKT-${reg.id.substring(0, 8).toUpperCase()}`}
                        </span>
                      </td>

                      {/* Workshop */}
                      <td className="py-3.5 px-4 text-[#101D32] font-medium max-w-xs">
                        <div className="truncate font-bold">{ws?.title || 'Workshop'}</div>
                        <div className="text-[11px] text-[#101D32]/75">{ws?.date} • {ws?.venue}</div>
                      </td>

                      {/* Payment */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-[#101D32] ${
                          reg.pricingTypeSnapshot === 'PAID'
                            ? 'bg-[#FFD6B0] text-[#101D32]'
                            : 'bg-[#FFF5E9] text-[#101D32]'
                        }`}>
                          {reg.pricingTypeSnapshot === 'PAID' ? `₹${reg.amount} (${reg.paymentStatus || 'PAID'})` : 'FREE'}
                        </span>
                      </td>

                      {/* Registered Date */}
                      <td className="py-3.5 px-4 text-[#101D32]/75 font-mono text-[11px] whitespace-nowrap font-medium">
                        {reg.registeredAt?.split('T')[0]}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isAttended ? (
                          <span className="inline-flex items-center gap-1.5 text-[#101D32] font-bold text-xs bg-[#FFD6B0] px-3 py-1 rounded-full border-2 border-[#101D32]">
                            <CheckCircle className="w-3.5 h-3.5 text-[#F4511E]" />
                            <span>Attended (Verified)</span>
                          </span>
                        ) : isConfirmed ? (
                          <span className="inline-flex items-center gap-1.5 text-[#101D32] font-bold text-xs bg-[#FFF5E9] px-3 py-1 rounded-full border-2 border-[#101D32]">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#101D32]" />
                            <span>Pending Gate Scan</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-500 font-bold text-xs bg-slate-100 px-3 py-1 rounded-full border border-slate-300">
                            <XCircle className="w-3.5 h-3.5" /> Cancelled
                          </span>
                        )}
                      </td>

                      {/* Verification Action */}
                      <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                        {ws && (
                          <button
                            onClick={() => setViewTicketData({ registration: reg, workshop: ws })}
                            className="px-3 py-1 text-[#101D32] hover:bg-[#FFD6B0] rounded-lg text-xs font-heading font-bold border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] inline-flex items-center gap-1 transition-all"
                          >
                            <QrCode className="w-3.5 h-3.5 text-[#F4511E]" />
                            <span>View Pass</span>
                          </button>
                        )}
                        {isConfirmed && (
                          <button
                            onClick={() => handleLaunchScanner(reg.workshopId)}
                            className="px-3 py-1 bg-[#F4511E] hover:bg-[#E84316] text-white rounded-lg text-xs font-heading font-extrabold border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all inline-flex items-center gap-1"
                          >
                            <Scan className="w-3.5 h-3.5 text-white" />
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
