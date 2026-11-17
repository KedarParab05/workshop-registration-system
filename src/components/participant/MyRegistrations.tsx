import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  Search,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  QrCode,
  Compass,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRTicketModal } from '../common/QRTicketModal';
import { Registration, Workshop } from '../../types';

export const MyRegistrations: React.FC = () => {
  const {
    currentUser,
    registrations,
    workshops,
    cancelWorkshopRegistration,
    navigateTo,
    refreshData,
  } = useApp();

  React.useEffect(() => {
    refreshData();
  }, [refreshData]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CONFIRMED' | 'ATTENDED' | 'PENDING_PAYMENT' | 'CANCELLED'>('ALL');
  const [selectedRegToCancel, setSelectedRegToCancel] = useState<{ id: string; title: string } | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<{ registration: Registration; workshop: Workshop } | null>(null);

  const myRegistrations = registrations.filter(
    (r) =>
      r.participantId === currentUser?.id ||
      (currentUser?.email && r.participantEmail?.toLowerCase() === currentUser.email?.toLowerCase())
  );

  const filtered = myRegistrations.filter((reg) => {
    const ws = workshops.find((w) => w.id === reg.workshopId);
    const title = ws?.title || '';

    if (searchQuery.trim() && !title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    if (statusFilter !== 'ALL' && reg.status !== statusFilter) {
      return false;
    }

    return true;
  });

  const handleConfirmCancel = () => {
    if (selectedRegToCancel) {
      cancelWorkshopRegistration(selectedRegToCancel.id);
      setSelectedRegToCancel(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-[#FFF5E9] text-[#101D32]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#101D32] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-heading font-extrabold bg-[#FFD6B0] text-[#101D32] border border-[#101D32] mb-2 shadow-[2px_2px_0px_0px_#101D32]">
            <Sparkles className="w-3.5 h-3.5 text-[#F4511E]" />
            <span>Student Ticket Wallet</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#101D32] tracking-tight">
            My Registrations &amp; Passes
          </h1>
          <p className="text-xs sm:text-sm text-[#101D32]/70 mt-1 font-medium">
            Access your workshop QR passes, review event logistics, or release your seat if your plans change.
          </p>
        </div>

        <button
          onClick={() => navigateTo('workshops')}
          className="px-5 py-2.5 bg-[#F4511E] hover:bg-[#E84316] text-white rounded-xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] neo-btn text-xs font-heading font-extrabold flex items-center justify-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <span>Find Workshops</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32]">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#101D32]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by workshop title..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border-2 border-[#101D32] bg-[#FFF5E9] text-[#101D32] font-medium focus:outline-none focus:ring-2 focus:ring-[#F4511E]"
          />
        </div>

        <div className="grid grid-cols-2 sm:flex items-center gap-1 p-1 bg-[#FFF5E9] rounded-xl text-xs font-heading font-bold w-full md:w-auto border-2 border-[#101D32]">
          {(['ALL', 'CONFIRMED', 'ATTENDED', 'PENDING_PAYMENT', 'CANCELLED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                statusFilter === tab
                  ? 'bg-[#F4511E] text-white shadow-[2px_2px_0px_0px_#101D32] font-extrabold border border-[#101D32]'
                  : 'text-[#101D32]/70 hover:text-[#101D32]'
              }`}
            >
              {tab === 'ALL'
                ? `All (${myRegistrations.length})`
                : tab === 'PENDING_PAYMENT'
                ? 'Pending'
                : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Registrations List */}
      {filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] text-center space-y-3">
          <Compass className="w-10 h-10 text-[#101D32]/40 mx-auto" />
          <h3 className="font-heading font-extrabold text-base text-[#101D32]">
            No workshop tickets found
          </h3>
          <p className="text-xs text-[#101D32]/70 max-w-sm mx-auto font-medium">
            {searchQuery
              ? 'No registrations match your search keyword.'
              : 'You have no workshop registrations in this category.'}
          </p>
          <button
            onClick={() => navigateTo('workshops')}
            className="mt-2 px-6 py-2.5 bg-[#F4511E] hover:bg-[#E84316] text-white rounded-xl border-2 border-[#101D32] shadow-[3px_3px_0px_0px_#101D32] neo-btn text-xs font-heading font-extrabold cursor-pointer"
          >
            Explore Workshop Schedule
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((reg) => {
            const ws = workshops.find((w) => w.id === reg.workshopId);
            const isConfirmed = reg.status === 'CONFIRMED';
            const isAttended = reg.status === 'ATTENDED';
            const isPendingPayment = reg.status === 'PENDING_PAYMENT';
            const isCancelled = reg.status === 'CANCELLED';

            return (
              <div
                key={reg.id}
                className="bg-white rounded-xl border-2 border-[#101D32] p-6 shadow-[4px_4px_0px_0px_#101D32] flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-heading font-extrabold bg-[#FFD6B0] text-[#101D32] border border-[#101D32]">
                      {ws?.category || 'Academic Session'}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-heading font-extrabold border border-[#101D32] ${
                        isConfirmed
                          ? 'bg-[#FFD6B0] text-[#101D32]'
                          : isAttended
                          ? 'bg-blue-100 text-blue-900'
                          : isPendingPayment
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-rose-100 text-rose-900'
                      }`}
                    >
                      {isPendingPayment ? 'PENDING PAYMENT' : reg.status}
                    </span>
                  </div>

                  <h3 className="font-heading font-extrabold text-base text-[#101D32] mb-1.5 line-clamp-1">
                    {ws?.title || 'Workshop Session'}
                  </h3>

                  <div className="space-y-1 text-xs text-[#101D32]/70 font-medium pt-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#F4511E] shrink-0" />
                      <span>{ws?.date} ({ws?.startTime} - {ws?.endTime})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#F4511E] shrink-0" />
                      <span className="truncate">{ws?.venue}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t-2 border-[#101D32]/10 flex items-center justify-between text-[11px] text-[#101D32]/70 font-mono">
                    <span>Pass ID: <strong className="text-[#101D32] font-bold">{reg.ticketCode || (isPendingPayment ? 'HELD-15MIN' : 'TKT-PENDING')}</strong></span>
                    <span>
                      {reg.pricingTypeSnapshot === 'PAID'
                        ? isPendingPayment
                          ? `₹${reg.amount} Due`
                          : `₹${reg.amount} Paid`
                        : 'Free Seat'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t-2 border-[#101D32]/10 flex items-center justify-between gap-2">
                  {(isConfirmed || isAttended) && ws && (
                    <button
                      onClick={() => setSelectedTicket({ registration: reg, workshop: ws })}
                      className="px-3.5 py-1.5 bg-[#F4511E] hover:bg-[#E84316] text-white rounded-xl border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] neo-btn text-xs font-heading font-extrabold flex items-center gap-1.5 cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5 text-white" />
                      <span>View Digital Pass</span>
                    </button>
                  )}

                  {isPendingPayment && ws && (
                    <button
                      onClick={() => navigateTo('workshop-detail', ws.id)}
                      className="px-3.5 py-1.5 bg-[#F4511E] hover:bg-[#E84316] text-white rounded-xl border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] neo-btn text-xs font-heading font-extrabold flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Complete Payment (₹{reg.amount})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {isConfirmed && ws && (
                    <button
                      onClick={() => setSelectedRegToCancel({ id: reg.id, title: ws.title })}
                      className="px-3 py-1.5 text-rose-600 hover:text-rose-700 text-xs font-heading font-extrabold hover:underline cursor-pointer"
                    >
                      Cancel Seat
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Confirmation Dialog */}
      <AnimatePresence>
        {selectedRegToCancel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101D32]/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 sm:p-7 max-w-md w-full border-2 border-[#101D32] shadow-[8px_8px_0px_0px_#101D32] space-y-4"
            >
              <div className="flex items-center gap-3 text-[#F4511E]">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h3 className="text-base font-heading font-extrabold text-[#101D32]">
                  Cancel Workshop Seat?
                </h3>
              </div>

              <p className="text-xs text-[#101D32]/70 leading-relaxed font-medium">
                Are you sure you want to release your seat for <strong className="text-[#101D32]">{selectedRegToCancel.title}</strong>?
                Once cancelled, your seat is immediately restored to the available pool for fellow students.
              </p>

              <div className="flex items-center justify-end gap-2 pt-3 border-t-2 border-[#101D32]/10">
                <button
                  onClick={() => setSelectedRegToCancel(null)}
                  className="px-4 py-2 text-xs font-heading font-bold text-[#101D32] hover:bg-[#FFD6B0] rounded-xl transition-colors cursor-pointer"
                >
                  Keep Seat
                </button>
                <button
                  onClick={handleConfirmCancel}
                  className="px-4 py-2 text-xs font-heading font-extrabold text-white bg-rose-600 hover:bg-rose-500 rounded-xl border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] cursor-pointer"
                >
                  Confirm Cancellation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Digital QR Pass Modal */}
      {selectedTicket && (
        <QRTicketModal
          isOpen={true}
          onClose={() => setSelectedTicket(null)}
          registration={selectedTicket.registration}
          workshop={selectedTicket.workshop}
        />
      )}
    </div>
  );
};
