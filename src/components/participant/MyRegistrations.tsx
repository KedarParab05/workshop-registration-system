import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  QrCode,
  ShieldCheck,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 transition-colors duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCE4D6] dark:border-[#233d2e] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-heading font-semibold bg-[#DAE7C7] text-[#08482D] mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Student Ticket Wallet</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#101410] dark:text-[#f0f5ee] tracking-tight">
            My Registrations & Tickets
          </h1>
          <p className="text-xs sm:text-sm text-[#5E5E61] dark:text-[#8ba895] mt-1">
            Access your workshop QR passes, review event logistics, or release your seat if your plans change.
          </p>
        </div>

        <button
          onClick={() => navigateTo('workshops')}
          className="px-5 py-2.5 bg-[#08482D] hover:bg-[#0c5c3b] text-[#F5F8EF] rounded-2xl text-xs font-heading font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-[#08482D]/20 self-start sm:self-auto"
        >
          <span>Find Workshops</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-[#14231b] p-4 rounded-3xl border border-[#DCE4D6] dark:border-[#233d2e] shadow-xs transition-colors">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#5E5E61] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by workshop title..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-2xl border border-[#DCE4D6] dark:border-[#233d2e] bg-[#F5F8EF]/60 dark:bg-[#1b3025] text-[#101410] dark:text-[#f0f5ee] focus:outline-none focus:ring-2 focus:ring-[#08482D]"
          />
        </div>

        <div className="grid grid-cols-2 sm:flex items-center gap-1 p-1 bg-[#F5F8EF] dark:bg-[#1b3025] rounded-2xl text-xs font-heading font-medium w-full md:w-auto border border-[#DCE4D6] dark:border-[#233d2e]">
          {(['ALL', 'CONFIRMED', 'ATTENDED', 'PENDING_PAYMENT', 'CANCELLED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-center transition-all ${
                statusFilter === tab
                  ? 'bg-[#08482D] text-[#F5F8EF] shadow-xs font-semibold'
                  : 'text-[#5E5E61] dark:text-[#8ba895] hover:text-[#101410] dark:hover:text-[#f0f5ee]'
              }`}
            >
              {tab === 'ALL'
                ? `All (${myRegistrations.length})`
                : tab === 'PENDING_PAYMENT'
                ? 'Pending Payment'
                : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Registrations List */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-[#14231b] p-12 rounded-3xl border border-[#DCE4D6] dark:border-[#233d2e] text-center space-y-3">
          <Compass className="w-10 h-10 text-[#5E5E61] dark:text-[#8ba895] mx-auto opacity-50" />
          <h3 className="font-heading font-bold text-base text-[#101410] dark:text-[#f0f5ee]">
            No workshop tickets found
          </h3>
          <p className="text-xs text-[#5E5E61] dark:text-[#8ba895] max-w-sm mx-auto">
            {searchQuery
              ? 'No registrations match your search keyword.'
              : 'You have no workshop registrations in this category.'}
          </p>
          <button
            onClick={() => navigateTo('workshops')}
            className="mt-2 px-5 py-2.5 bg-[#08482D] text-[#F5F8EF] rounded-xl text-xs font-heading font-semibold hover:bg-[#0c5c3b] transition-colors"
          >
            Explore Academic Schedule
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
              <motion.div
                key={reg.id}
                whileHover={{ y: -3 }}
                className="bg-white dark:bg-[#14231b] rounded-3xl border border-[#DCE4D6] dark:border-[#233d2e] p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-heading font-bold bg-[#DAE7C7] text-[#08482D]">
                      {ws?.category || 'Academic Session'}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-heading font-bold ${
                        isConfirmed
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : isAttended
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : isPendingPayment
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {isPendingPayment ? 'PENDING PAYMENT' : reg.status}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-base text-[#101410] dark:text-[#f0f5ee] mb-1.5 line-clamp-1">
                    {ws?.title || 'Workshop Session'}
                  </h3>

                  <div className="space-y-1 text-xs text-[#5E5E61] dark:text-[#8ba895] pt-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#08482D] dark:text-[#9ee2b8] shrink-0" />
                      <span>{ws?.date} ({ws?.startTime} - {ws?.endTime})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#08482D] dark:text-[#9ee2b8] shrink-0" />
                      <span className="truncate">{ws?.venue}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#DCE4D6]/70 dark:border-[#233d2e] flex items-center justify-between text-[11px] text-[#5E5E61] dark:text-[#8ba895] font-mono">
                    <span>Pass ID: <strong className="text-[#101410] dark:text-[#f0f5ee]">{reg.ticketCode || (isPendingPayment ? 'HELD-15MIN' : 'TKT-PENDING')}</strong></span>
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
                <div className="pt-3 border-t border-[#DCE4D6]/70 dark:border-[#233d2e] flex items-center justify-between gap-2">
                  {(isConfirmed || isAttended) && ws && (
                    <button
                      onClick={() => setSelectedTicket({ registration: reg, workshop: ws })}
                      className="px-3.5 py-1.5 bg-[#08482D] hover:bg-[#0c5c3b] text-[#F5F8EF] rounded-xl text-xs font-heading font-semibold transition-colors flex items-center gap-1.5 shadow-sm shadow-[#08482D]/20"
                    >
                      <QrCode className="w-3.5 h-3.5 text-[#DAE7C7]" />
                      <span>View Digital Pass</span>
                    </button>
                  )}

                  {isPendingPayment && ws && (
                    <button
                      onClick={() => navigateTo('workshop-detail', ws.id)}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-heading font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <span>Complete Payment (₹{reg.amount})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {isConfirmed && ws && (
                    <button
                      onClick={() => setSelectedRegToCancel({ id: reg.id, title: ws.title })}
                      className="px-3 py-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-xs font-heading font-semibold transition-colors"
                    >
                      Cancel Seat
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Cancellation Confirmation Dialog */}
      <AnimatePresence>
        {selectedRegToCancel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#14231b] rounded-3xl p-6 sm:p-7 max-w-md w-full border border-[#DCE4D6] dark:border-[#233d2e] shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h3 className="text-base font-heading font-bold text-[#101410] dark:text-[#f0f5ee]">
                  Cancel Workshop Seat?
                </h3>
              </div>

              <p className="text-xs text-[#5E5E61] dark:text-[#8ba895] leading-relaxed">
                Are you sure you want to release your seat for <strong className="text-[#101410] dark:text-[#f0f5ee]">{selectedRegToCancel.title}</strong>?
                Once cancelled, your seat is immediately restored to the available pool for fellow students.
              </p>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DCE4D6] dark:border-[#233d2e]">
                <button
                  onClick={() => setSelectedRegToCancel(null)}
                  className="px-4 py-2 text-xs font-heading font-semibold text-[#5E5E61] dark:text-[#95ad9e] hover:bg-[#E8F0DF] dark:hover:bg-[#1a3325] rounded-xl transition-colors cursor-pointer"
                >
                  Keep Seat
                </button>
                <button
                  onClick={handleConfirmCancel}
                  className="px-4 py-2 text-xs font-heading font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md transition-colors"
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
