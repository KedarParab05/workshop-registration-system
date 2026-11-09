import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Download,
  Navigation,
  ShieldCheck,
  User,
  Sparkles,
} from 'lucide-react';
import { Registration, Workshop } from '../../types';

interface QRTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: Registration | null;
  workshop: Workshop | null;
}

export const QRTicketModal: React.FC<QRTicketModalProps> = ({
  isOpen,
  onClose,
  registration,
  workshop,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const ticketCode = registration?.ticketCode || (registration ? `TKT-${registration.id.substring(0, 8).toUpperCase()}` : '');

  useEffect(() => {
    if (!registration || !workshop) return;

    const qrPayload = JSON.stringify({
      ticketCode,
      registrationId: registration.id,
      workshopId: workshop.id,
      workshopTitle: workshop.title,
      participantName: registration.participantName,
      date: workshop.date,
      venue: workshop.venue,
    });

    QRCode.toDataURL(qrPayload, {
      width: 260,
      margin: 1.5,
      color: {
        dark: '#08482D',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url: string) => setQrDataUrl(url))
      .catch((err: unknown) => console.error('Failed to generate QR code:', err));
  }, [registration, workshop, ticketCode]);

  if (!isOpen || !registration || !workshop) return null;

  const isAttended = registration.status === 'ATTENDED' || registration.verified;
  const isCancelled = registration.status === 'CANCELLED';

  // Build GPS Navigation Link
  const destinationQuery = encodeURIComponent(
    workshop.venueAddress || `${workshop.venue}, ${workshop.title}`
  );
  const gpsMapsUrl = workshop.mapUrl || (workshop.latitude && workshop.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${workshop.latitude},${workshop.longitude}`
    : `https://www.google.com/maps/dir/?api=1&destination=${destinationQuery}`);

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto print:p-0">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#08482D]/40 backdrop-blur-sm print:hidden"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white dark:bg-[#14231b] rounded-3xl max-w-md w-full shadow-2xl border border-[#DCE4D6] dark:border-[#203a2c] my-auto max-h-[92vh] overflow-y-auto z-10 text-[#101410] dark:text-[#E8F0DF] print:shadow-none print:border-none print:max-w-none print:w-full"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/15 transition-colors z-20 print:hidden"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Ticket Top Ribbon */}
          <div className="bg-[#08482D] text-white p-6 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#DAE7C7]/15 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-heading font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#DAE7C7] text-[#08482D]">
                <Sparkles className="w-3 h-3 text-[#08482D]" />
                Kaushalya Digital Pass
              </span>
              <span className="text-[11px] font-mono tracking-widest bg-white/15 text-[#DAE7C7] px-2 py-0.5 rounded-md font-semibold">
                {registration.pricingTypeSnapshot === 'PAID' ? `₹${registration.amount} PAID` : '100% FREE'}
              </span>
            </div>
            <h2 className="text-xl font-heading font-bold leading-tight pr-6 mt-1 text-white">
              {workshop.title}
            </h2>
            <p className="text-xs text-[#DAE7C7]/90 mt-1.5 flex items-center gap-1.5 font-medium">
              <span>{workshop.category}</span>
              <span>•</span>
              <span>{workshop.organizerNameSnapshot}</span>
            </p>
          </div>

          {/* Ticket Body */}
          <div className="p-6 space-y-5">
            {/* Validity Notice Banner */}
            {isCancelled ? (
              <div className="flex items-center gap-2.5 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl text-xs text-rose-800 dark:text-rose-300">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <div>
                  <strong>Registration Cancelled:</strong> This ticket has been relinquished and cannot be verified for entry.
                </div>
              </div>
            ) : isAttended ? (
              <div className="flex items-center gap-2.5 p-3.5 bg-[#E8F0DF] dark:bg-[#1b2f23] border border-[#DAE7C7] dark:border-[#2d4d3a] rounded-2xl text-xs text-[#08482D] dark:text-[#DAE7C7]">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#08482D] dark:text-[#a8d38d]" />
                <div>
                  <strong>Ticket Verified:</strong> Gate check-in was successfully recorded on {registration.verifiedAt ? new Date(registration.verifiedAt).toLocaleDateString() : 'event day'}.
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 p-3.5 bg-[#F5F8EF] dark:bg-[#1a2c22] border border-[#DCE4D6] dark:border-[#22392c] rounded-2xl text-xs text-[#08482D] dark:text-[#DAE7C7]">
                <ShieldCheck className="w-4 h-4 shrink-0 text-[#08482D] dark:text-[#a8d38d]" />
                <div>
                  <strong>Single-Use Pass:</strong> Present this code to the gate volunteer on <strong>{workshop.date}</strong>.
                </div>
              </div>
            )}

            {/* QR Code Canvas */}
            <div className="flex flex-col items-center justify-center py-2 relative">
              <span className="font-hand text-sm text-[#08482D] dark:text-[#DAE7C7] -rotate-3 mb-1">
                // show at security gate
              </span>
              <div className="p-3.5 bg-white rounded-2xl shadow-sm border border-[#DCE4D6] dark:border-emerald-950">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR Ticket ${ticketCode}`}
                    className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
                  />
                ) : (
                  <div className="w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center text-[#5E5E61] text-xs">
                    Generating secure QR code...
                  </div>
                )}
              </div>
              <div className="mt-2.5 text-center">
                <div className="text-[10px] text-[#5E5E61] dark:text-emerald-400 uppercase tracking-widest font-heading font-semibold">
                  TICKET CODE
                </div>
                <div className="font-mono font-bold text-base text-[#08482D] dark:text-[#DAE7C7] tracking-wider">
                  {ticketCode}
                </div>
              </div>
            </div>

            {/* Perforated Divider */}
            <div className="relative flex items-center py-1">
              <div className="w-full border-t-2 border-dashed border-[#DCE4D6] dark:border-[#203a2c]" />
              <div className="absolute -left-9 w-6 h-6 bg-[#F5F8EF] dark:bg-[#0b140e] rounded-full border border-[#DCE4D6] dark:border-[#203a2c]" />
              <div className="absolute -right-9 w-6 h-6 bg-[#F5F8EF] dark:bg-[#0b140e] rounded-full border border-[#DCE4D6] dark:border-[#203a2c]" />
            </div>

            {/* Participant & Session Details */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#F5F8EF] dark:bg-[#1b2b22] border border-[#DCE4D6] dark:border-[#22392c]">
                <div className="text-[11px] text-[#5E5E61] dark:text-emerald-400 flex items-center gap-1 font-medium">
                  <User className="w-3 h-3 text-[#08482D] dark:text-[#DAE7C7]" />
                  <span>Participant</span>
                </div>
                <div className="font-heading font-bold text-[#101410] dark:text-white truncate mt-0.5">
                  {registration.participantName}
                </div>
                <div className="text-[10px] text-[#5E5E61] dark:text-slate-400 truncate">
                  {registration.participantEmail}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#F5F8EF] dark:bg-[#1b2b22] border border-[#DCE4D6] dark:border-[#22392c]">
                <div className="text-[11px] text-[#5E5E61] dark:text-emerald-400 flex items-center gap-1 font-medium">
                  <Calendar className="w-3 h-3 text-[#08482D] dark:text-[#DAE7C7]" />
                  <span>Date & Schedule</span>
                </div>
                <div className="font-heading font-bold text-[#101410] dark:text-white mt-0.5">
                  {workshop.date}
                </div>
                <div className="text-[10px] text-[#5E5E61] dark:text-slate-400 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5 text-[#08482D] dark:text-[#DAE7C7]" />
                  <span>{workshop.startTime} - {workshop.endTime}</span>
                </div>
              </div>
            </div>

            {registration.pricingTypeSnapshot === 'PAID' && (
              <div className="p-3 rounded-2xl bg-[#E8F0DF]/60 dark:bg-[#1b2b22] border border-[#DAE7C7] dark:border-[#22392c] flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] uppercase font-semibold text-[#5E5E61] dark:text-emerald-400">Payment Verified</div>
                  <div className="font-mono text-[11px] text-[#08482D] dark:text-[#DAE7C7] font-bold">
                    ₹{registration.amount} INR • {registration.razorpayPaymentId || 'rzp_test_verified'}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#08482D] text-[#DAE7C7]">
                  Razorpay Confirmed
                </span>
              </div>
            )}

            {/* Location & GPS Maps Navigation */}
            <div className="p-3.5 rounded-2xl bg-[#F5F8EF] dark:bg-[#1b2b22] border border-[#DCE4D6] dark:border-[#22392c] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-heading font-semibold text-[#101410] dark:text-white">
                  <MapPin className="w-4 h-4 text-[#08482D] dark:text-[#DAE7C7] shrink-0" />
                  <span>{workshop.onlineMode ? 'Online Studio / Portal' : workshop.venue}</span>
                </div>
              </div>

              {workshop.venueAddress && !workshop.onlineMode && (
                <div className="text-[11px] text-[#5E5E61] dark:text-slate-400 pl-5.5">
                  {workshop.venueAddress}
                </div>
              )}

              {!workshop.onlineMode && (
                <div className="pt-1">
                  <a
                    href={gpsMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#08482D] hover:bg-[#0c5c3b] text-white rounded-xl text-xs font-heading font-semibold transition-colors shadow-sm"
                  >
                    <Navigation className="w-3.5 h-3.5 text-[#DAE7C7]" />
                    <span>Get GPS Directions to Center</span>
                  </a>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2 print:hidden">
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 py-2.5 px-4 bg-[#E8F0DF] dark:bg-[#203a2c] hover:bg-[#DCE4D6] dark:hover:bg-[#284837] text-[#08482D] dark:text-[#DAE7C7] font-heading font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Print / Save Pass</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-[#08482D] hover:bg-[#0c5c3b] text-white font-heading font-semibold text-xs rounded-xl shadow-md shadow-[#08482D]/20 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
