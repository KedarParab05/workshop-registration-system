import React, { useEffect, useState, useRef } from 'react';
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
  Printer,
  Copy,
  Check,
  Building2,
  Ticket,
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
  const [copiedCode, setCopiedCode] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  const ticketCode =
    registration?.ticketCode ||
    (registration ? `TKT-${registration.id.substring(0, 8).toUpperCase()}` : '');

  const formattedDate = workshop?.date
    ? new Date(workshop.date).toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

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
      width: 280,
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
  const gpsMapsUrl =
    workshop.mapUrl ||
    (workshop.latitude && workshop.longitude
      ? `https://www.google.com/maps/dir/?api=1&destination=${workshop.latitude},${workshop.longitude}`
      : `https://www.google.com/maps/dir/?api=1&destination=${destinationQuery}`);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(ticketCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownload = () => {
    if (!ticketRef.current) return;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Pass - ${ticketCode}</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 30px; background: #f8faf6; color: #101410; }
      .container { max-width: 500px; margin: auto; background: #fff; border: 1px solid #dce4d6; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); }
      .header { background: #08482D; color: #dae7c7; padding: 24px; text-align: center; }
      .brand { font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #dae7c7; }
      .title { font-size: 18px; font-weight: 900; color: #fff; margin-top: 6px; }
      .body { padding: 24px; }
      .qr { text-align: center; margin: 16px 0; }
      .qr img { width: 160px; height: 160px; border-radius: 12px; border: 1px solid #dce4d6; }
      .ticket { font-size: 18px; font-weight: 900; font-family: monospace; letter-spacing: 3px; color: #08482D; background: #edf3e5; padding: 8px 16px; border-radius: 8px; display: inline-block; }
      .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edf2e8; font-size: 12px; }
      .label { color: #5e5e61; font-weight: 500; }
      .value { font-weight: 700; color: #101410; text-align: right; max-width: 60%; }
      .footer { background: #fafcf8; border-top: 1px solid #edf2e8; padding: 16px; text-align: center; font-size: 10px; color: #5e5e61; }
    </style></head><body>
      <div class="container">
        <div class="header">
          <div class="brand">Guru Nanak Institute of Management Studies • Official Entry Pass</div>
          <div class="title">${workshop.title}</div>
        </div>
        <div class="body">
          <div class="qr">
            <img src="${qrDataUrl}" alt="Gate Pass QR" />
            <div style="margin-top: 10px;"><span class="ticket">${ticketCode}</span></div>
          </div>
          <div class="row"><span class="label">Attendee Name:</span><span class="value">${registration.participantName}</span></div>
          <div class="row"><span class="label">Email Address:</span><span class="value">${registration.participantEmail}</span></div>
          <div class="row"><span class="label">Session Date:</span><span class="value">${formattedDate}</span></div>
          <div class="row"><span class="label">Timing:</span><span class="value">${workshop.startTime} - ${workshop.endTime}</span></div>
          <div class="row"><span class="label">Venue Location:</span><span class="value">${workshop.onlineMode ? 'Online Webcast Studio' : workshop.venue}</span></div>
          <div class="row"><span class="label">Status:</span><span class="value">${isAttended ? 'Verified Entry' : isCancelled ? 'Cancelled' : 'Valid Confirmed Pass'}</span></div>
          ${registration.pricingTypeSnapshot === 'PAID' ? `<div class="row"><span class="label">Fee:</span><span class="value">₹${registration.amount} INR (Paid)</span></div>` : '<div class="row"><span class="label">Category:</span><span class="value">Academic Seating (Free)</span></div>'}
        </div>
        <div class="footer">
          Show this QR code at campus security & gate verification.<br/>
          Kaushalya WorkshopHub • All Rights Reserved.
        </div>
      </div>
    </body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `pass-${ticketCode}.html`;
    a.click();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:p-0">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#08482D]/50 backdrop-blur-md print:hidden"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white dark:bg-[#121f17] rounded-3xl max-w-md w-full shadow-2xl border border-[#DCE4D6] dark:border-[#203a2c] my-auto max-h-[92vh] overflow-y-auto z-10 text-[#101410] dark:text-[#E8F0DF] print:shadow-none print:border-none print:max-w-none print:w-full"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/15 transition-colors z-20 print:hidden cursor-pointer"
            aria-label="Close pass"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Ticket Header Ribbon */}
          <div className="bg-[#08482D] text-white p-5 sm:p-6 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#DAE7C7]/15 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-heading font-extrabold tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-[#DAE7C7] text-[#08482D]">
                <Sparkles className="w-3 h-3 text-[#08482D]" />
                Official Campus Digital Pass
              </span>
              <span className="text-[11px] font-mono tracking-widest bg-white/15 text-[#DAE7C7] px-2.5 py-0.5 rounded-md font-bold">
                {registration.pricingTypeSnapshot === 'PAID' ? `₹${registration.amount} PAID` : '100% FREE'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-heading font-bold leading-tight pr-6 mt-1 text-white">
              {workshop.title}
            </h2>
            <div className="text-xs text-[#DAE7C7]/90 mt-1.5 flex items-center gap-2 font-medium">
              <span>{workshop.category}</span>
              <span>•</span>
              <span>{workshop.organizerNameSnapshot || 'GNIMS Faculty'}</span>
            </div>
          </div>

          {/* Ticket Body */}
          <div ref={ticketRef} className="p-5 sm:p-6 space-y-4 print:p-8">
            {/* Status Indicator */}
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
                  <strong>Entry Recorded:</strong> Check-in was verified at gate reception on {registration.verifiedAt ? new Date(registration.verifiedAt).toLocaleDateString() : 'event day'}.
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 p-3.5 bg-[#F5F8EF] dark:bg-[#1a2c22] border border-[#DCE4D6] dark:border-[#22392c] rounded-2xl text-xs text-[#08482D] dark:text-[#DAE7C7]">
                <ShieldCheck className="w-4 h-4 shrink-0 text-[#08482D] dark:text-[#a8d38d]" />
                <div>
                  <strong>Authorized Entry Pass:</strong> Present this code to security and registration volunteers at the venue on <strong>{workshop.date}</strong>.
                </div>
              </div>
            )}

            {/* QR Code Canvas */}
            <div className="flex flex-col items-center justify-center py-2 relative">
              <div className="p-3 bg-white rounded-2xl shadow-sm border-2 border-[#DCE4D6] dark:border-[#203a2c]">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR Ticket ${ticketCode}`}
                    className="w-44 h-44 sm:w-48 sm:h-48 object-contain"
                  />
                ) : (
                  <div className="w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center text-[#5E5E61] text-xs">
                    Generating secure QR code...
                  </div>
                )}
              </div>
              <div className="mt-3 text-center">
                <div className="text-[10px] text-[#5E5E61] dark:text-emerald-400 uppercase tracking-widest font-heading font-bold">
                  Single-Use Ticket Code
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-0.5">
                  <span className="font-mono font-extrabold text-base sm:text-lg text-[#08482D] dark:text-[#DAE7C7] tracking-wider px-2.5 py-0.5 bg-[#F5F8EF] dark:bg-[#16291e] rounded-lg border border-[#DCE4D6] dark:border-[#22392c]">
                    {ticketCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg text-[#5E5E61] dark:text-[#8ba895] cursor-pointer print:hidden"
                    title="Copy Code"
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
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
              <div className="p-3 rounded-2xl bg-[#F5F8EF] dark:bg-[#16291e] border border-[#DCE4D6] dark:border-[#22392c]">
                <div className="text-[11px] text-[#5E5E61] dark:text-emerald-400 flex items-center gap-1 font-medium">
                  <User className="w-3.5 h-3.5 text-[#08482D] dark:text-[#DAE7C7]" />
                  <span>Participant</span>
                </div>
                <div className="font-heading font-bold text-[#101410] dark:text-white truncate mt-1">
                  {registration.participantName}
                </div>
                <div className="text-[10px] text-[#5E5E61] dark:text-slate-400 truncate">
                  {registration.participantEmail}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#F5F8EF] dark:bg-[#16291e] border border-[#DCE4D6] dark:border-[#22392c]">
                <div className="text-[11px] text-[#5E5E61] dark:text-emerald-400 flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-[#08482D] dark:text-[#DAE7C7]" />
                  <span>Schedule</span>
                </div>
                <div className="font-heading font-bold text-[#101410] dark:text-white mt-1">
                  {formattedDate || workshop.date}
                </div>
                <div className="text-[10px] text-[#5E5E61] dark:text-slate-400 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5 text-[#08482D] dark:text-[#DAE7C7]" />
                  <span>{workshop.startTime} - {workshop.endTime}</span>
                </div>
              </div>
            </div>

            {registration.pricingTypeSnapshot === 'PAID' && (
              <div className="p-3 rounded-2xl bg-[#E8F0DF]/60 dark:bg-[#16291e] border border-[#DAE7C7] dark:border-[#22392c] flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#5E5E61] dark:text-emerald-400">Payment Status</div>
                  <div className="font-mono text-[11px] text-[#08482D] dark:text-[#DAE7C7] font-bold">
                    ₹{registration.amount} INR {registration.razorpayPaymentId ? `• ${registration.razorpayPaymentId}` : '• Verified'}
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#08482D] text-[#DAE7C7]">
                  Paid & Confirmed
                </span>
              </div>
            )}

            {/* Location & GPS Maps Navigation */}
            <div className="p-3.5 rounded-2xl bg-[#F5F8EF] dark:bg-[#16291e] border border-[#DCE4D6] dark:border-[#22392c] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-heading font-semibold text-[#101410] dark:text-white">
                  <MapPin className="w-4 h-4 text-[#08482D] dark:text-[#DAE7C7] shrink-0" />
                  <span>{workshop.onlineMode ? 'Online Studio / Webcast' : workshop.venue}</span>
                </div>
              </div>

              {workshop.venueAddress && !workshop.onlineMode && (
                <div className="text-[11px] text-[#5E5E61] dark:text-slate-400 pl-5.5">
                  {workshop.venueAddress}
                </div>
              )}

              {!workshop.onlineMode && (
                <div className="pt-1 print:hidden">
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

            <div className="text-center text-[10px] text-[#5E5E61] dark:text-[#8ba895] pt-1">
              Guru Nanak Institute of Management Studies • Academic Computing Services
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="p-4 bg-[#F5F8EF] dark:bg-[#16291e] border-t border-[#DCE4D6] dark:border-[#203a2c] flex items-center gap-2 print:hidden">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 py-2.5 px-3 bg-[#08482D] hover:bg-[#0c5c3b] text-white font-heading font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#DAE7C7]" />
              <span>Print Pass</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 py-2.5 px-3 bg-white dark:bg-[#121f17] border border-[#DCE4D6] dark:border-[#203a2c] hover:bg-[#E8F0DF] dark:hover:bg-[#1b2f23] text-[#08482D] dark:text-[#DAE7C7] font-heading font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save File</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-transparent hover:bg-black/5 dark:hover:bg-white/10 text-[#5E5E61] dark:text-[#8ba895] font-heading font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
