import React, { useRef, useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { motion } from 'motion/react';
import {
  X,
  Check,
  Download,
  Calendar,
  Clock,
  MapPin,
  User,
  Ticket,
  FileText,
  Home,
  CheckCircle2,
  Mail,
  Globe,
  Youtube,
  Linkedin,
  Github,
  Twitter,
} from 'lucide-react';
import { Workshop, Registration } from '../../types';

interface PaymentReceiptProps {
  registration: Registration;
  workshop: Workshop;
  paymentMethod: string;
  onClose: () => void;
}

export const PaymentReceipt: React.FC<PaymentReceiptProps> = ({
  registration,
  workshop,
  paymentMethod,
  onClose,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [qrUrl, setQrUrl] = useState('');

  const ticketCode =
    registration.ticketCode || `WLK${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${registration.id?.slice(-4).toUpperCase()}`;
  const receiptNo = `RCP${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${registration.id?.slice(-4).toUpperCase()}`;
  const transactionId =
    registration.razorpayPaymentId || `T${Date.now().toString().slice(-14)}`;

  // Format Date: e.g. "16 Nov 2026 (Monday)"
  const formatEventDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = d.toLocaleDateString('en-IN', { day: 'numeric' });
      const month = d.toLocaleDateString('en-IN', { month: 'short' });
      const year = d.toLocaleDateString('en-IN', { year: 'numeric' });
      const weekday = d.toLocaleDateString('en-IN', { weekday: 'long' });
      return `${day} ${month} ${year} (${weekday})`;
    } catch {
      return dateStr;
    }
  };

  const formattedDate = formatEventDate(workshop.date);

  const paymentDateFormatted = new Date().toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  // Dynamic Tagline
  const getTagline = (category?: string, summary?: string) => {
    const c = (category || '').toLowerCase();
    if (c.includes('web')) return 'Build. Code. Deploy.';
    if (c.includes('ai') || c.includes('machine') || c.includes('deep')) return 'Train. Predict. Innovate.';
    if (c.includes('cloud') || c.includes('devops') || c.includes('docker')) return 'Automate. Scale. Deliver.';
    if (c.includes('cyber') || c.includes('security')) return 'Defend. Audit. Secure.';
    if (c.includes('data') || c.includes('algorithm') || c.includes('dsa')) return 'Analyze. Optimize. Solve.';
    if (c.includes('java') || c.includes('architecture')) return 'Design. Structure. Elevate.';
    return summary ? summary.substring(0, 36) : 'Learn. Build. Grow.';
  };

  const tagline = getTagline(workshop.category, workshop.summary);

  useEffect(() => {
    QRCode.toDataURL(
      JSON.stringify({
        ticketCode,
        receiptNo,
        workshopId: workshop.id,
        title: workshop.title,
        attendee: registration.participantName,
        amount: registration.amount,
        status: 'CONFIRMED',
      }),
      { width: 280, margin: 1, color: { dark: '#08482D', light: '#FFFFFF' } }
    ).then(setQrUrl).catch(() => {});
  }, [registration, workshop, ticketCode, receiptNo]);

  // Download Ticket Pass as clean self-contained HTML/PDF
  const handleDownloadTicket = () => {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Ticket - ${ticketCode}</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; margin: 0; padding: 40px; background: #eef2eb; display: flex; justify-content: center; }
      .ticket { width: 780px; background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 16px 36px rgba(0,0,0,0.1); display: flex; border: 1px solid #dce4d6; }
      .poster { width: 260px; background: linear-gradient(135deg, #08482D, #041c11); color: #fff; padding: 28px 24px; display: flex; flex-direction: column; justify-content: space-between; }
      .details { flex: 1; padding: 28px; }
      .stub { width: 220px; background: #fbfdf9; border-left: 2px dashed #dce4d6; padding: 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
      .pill { background: #08482D; color: #fff; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 20px; display: inline-block; text-transform: uppercase; margin-bottom: 12px; }
      .row { margin-bottom: 10px; font-size: 12px; }
      .label { color: #5E5E61; font-size: 11px; text-transform: uppercase; }
      .val { font-weight: 700; color: #101410; font-size: 13px; }
    </style></head><body>
      <div class="ticket">
        <div class="poster">
          <div>
            <div style="font-weight:900;font-size:16px;">Kaushalya</div>
            <div style="font-size:9px;opacity:0.8;">Learn • Build • Grow</div>
          </div>
          <div>
            <div style="font-size:22px;font-weight:900;line-height:1.2;">${workshop.title}</div>
            <div style="font-size:13px;font-style:italic;color:#DAE7C7;margin-top:4px;">${tagline}</div>
          </div>
          <div style="font-size:11px;opacity:0.75;">Workshop Pass</div>
        </div>
        <div class="details">
          <div class="pill">Your Ticket</div>
          <div class="row"><div class="label">Attendee Name</div><div class="val" style="font-size:16px;">${registration.participantName}</div></div>
          <div class="row"><div class="label">Registration ID</div><div class="val" style="font-family:monospace;color:#08482D;">${ticketCode}</div></div>
          <div class="row"><div class="label">Workshop Date</div><div class="val">${formattedDate}</div></div>
          <div class="row"><div class="label">Time</div><div class="val">${workshop.startTime} – ${workshop.endTime}</div></div>
          <div class="row"><div class="label">Venue</div><div class="val">${workshop.onlineMode ? 'Online Studio / Webcast' : workshop.venue}</div></div>
        </div>
        <div class="stub">
          <img src="${qrUrl}" style="width:130px;height:130px;border-radius:10px;border:1px solid #dce4d6;" />
          <div style="font-size:12px;font-weight:800;margin-top:10px;color:#101410;">Scan this QR code</div>
          <div style="font-size:10px;color:#5E5E61;">at the venue for entry</div>
        </div>
      </div>
    </body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `ticket-${ticketCode}.html`;
    a.click();
  };

  // Download Payment Receipt HTML/PDF
  const handleDownloadReceipt = () => {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Receipt - ${receiptNo}</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; margin: 0; padding: 40px; background: #eef2eb; display: flex; justify-content: center; }
      .card { width: 680px; background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 16px 36px rgba(0,0,0,0.08); border: 1px solid #dce4d6; }
      .header { background: #08482D; color: #fff; padding: 24px 30px; display: flex; justify-content: space-between; align-items: center; }
      .body { padding: 30px; }
      .grid { display: flex; justify-content: space-between; gap: 30px; margin-top: 20px; }
      .col { flex: 1; }
      .item { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #eee; font-size: 13px; }
      .total-box { background: #E8F0DF; border-radius: 12px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; font-weight: 800; font-size: 16px; color: #08482D; margin-top: 14px; }
      .footer { background: #fbfdf9; padding: 18px 30px; text-align: center; font-size: 11px; color: #5E5E61; border-top: 1px solid #eee; }
    </style></head><body>
      <div class="card">
        <div class="header">
          <div>
            <div style="font-size:18px;font-weight:900;">Kaushalya • Official Tax Receipt</div>
            <div style="font-size:11px;color:#DAE7C7;margin-top:2px;">${workshop.title}</div>
          </div>
          <div style="background:#DAE7C7;color:#08482D;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:800;">
            ✓ Payment Successful
          </div>
        </div>
        <div class="body">
          <div class="grid">
            <div class="col">
              <div class="item"><span>Receipt No.</span><strong style="font-family:monospace;">${receiptNo}</strong></div>
              <div class="item"><span>Payment Date</span><strong>${paymentDateFormatted}</strong></div>
              <div class="item"><span>Payment Method</span><strong>${paymentMethod}</strong></div>
              <div class="item"><span>Transaction ID</span><strong style="font-family:monospace;">${transactionId}</strong></div>
              <div class="item"><span>Participant</span><strong>${registration.participantName}</strong></div>
            </div>
            <div class="col">
              <div style="font-size:13px;font-weight:800;margin-bottom:8px;color:#101410;">Charges Summary</div>
              <div class="item"><span>Workshop Seat</span><strong>₹${registration.amount}.00</strong></div>
              <div class="item"><span>Convenience Fee</span><strong>₹0.00</strong></div>
              <div class="total-box">
                <span>Total Paid</span>
                <span>₹${registration.amount}.00</span>
              </div>
            </div>
          </div>
        </div>
        <div class="footer">
          We look forward to seeing you at the workshop! • Guru Nanak Institute of Management Studies
        </div>
      </div>
    </body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `receipt-${receiptNo}.html`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-[#111e16] rounded-3xl w-full max-w-3xl border border-[#DCE4D6] dark:border-[#233d2e] shadow-2xl overflow-hidden my-auto print:shadow-none print:border-none print:max-w-none text-[#101410] dark:text-[#E8F0DF]"
      >
        <div ref={receiptRef} className="p-6 sm:p-8 space-y-6">
          {/* ════════════ TOP HEADER BAR ════════════ */}
          <div className="flex items-center justify-between pb-4 border-b border-[#DCE4D6] dark:border-[#233d2e]">
            <div className="flex items-center gap-3">
              {/* Brand Logo */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#E8F0DF] dark:bg-[#1b3025] flex items-center justify-center text-[#08482D] dark:text-[#DAE7C7] shrink-0">
                  <svg className="w-5 h-5 text-[#08482D] dark:text-[#DAE7C7]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-base font-heading font-black text-[#08482D] dark:text-[#DAE7C7] leading-tight">
                    Kaushalya
                  </div>
                  <div className="text-[9px] font-heading font-semibold text-[#5E5E61] dark:text-[#8ba895] uppercase tracking-wider">
                    Learn • Build • Grow
                  </div>
                </div>
              </div>

              {/* Vertical divider */}
              <div className="hidden sm:block h-6 w-px bg-[#DCE4D6] dark:bg-[#233d2e] mx-1" />

              {/* Workshop Title & Tagline in header */}
              <div className="hidden sm:block min-w-0">
                <div className="text-sm font-heading font-black text-[#101410] dark:text-white truncate">
                  {workshop.title}
                </div>
                <div className="text-[11px] font-heading italic text-[#08482D] dark:text-[#DAE7C7]">
                  {tagline}
                </div>
              </div>
            </div>

            {/* Decorative dot matrix */}
            <div className="grid grid-cols-4 gap-1 opacity-40">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#08482D] dark:bg-[#DAE7C7]" />
              ))}
            </div>
          </div>

          {/* ════════════ HERO CELEBRATION ════════════ */}
          <div className="text-center py-2 relative">
            {/* Glowing Big Checkmark Circle with Confetti Sprinkles */}
            <div className="relative inline-flex items-center justify-center mb-3">
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-500/25">
                <Check className="w-9 h-9 stroke-[3]" />
              </div>
              {/* Confetti pieces */}
              <span className="absolute -top-1 -left-5 w-2.5 h-2.5 bg-emerald-400 rounded-xs transform rotate-12" />
              <span className="absolute -top-3 right-1 w-3 h-2 bg-amber-400 rounded-xs transform -rotate-45" />
              <span className="absolute bottom-1 -right-6 w-2.5 h-2.5 bg-teal-400 rounded-xs transform rotate-45" />
              <span className="absolute bottom-2 -left-6 w-3 h-1.5 bg-sky-400 rounded-xs transform -rotate-12" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-heading font-black text-[#101410] dark:text-white tracking-tight">
              Registration Successful!
            </h1>
            <p className="text-xs sm:text-sm text-[#5E5E61] dark:text-[#8ba895] max-w-lg mx-auto mt-1 leading-relaxed">
              Thank you for registering for the <strong className="text-[#101410] dark:text-white">{workshop.title}</strong>. Your payment has been confirmed and your seat is booked.
            </p>
          </div>

          {/* ════════════ "YOUR TICKET" PREVIEW CARD ════════════ */}
          <div className="bg-white dark:bg-[#14231b] rounded-2xl border border-[#DCE4D6] dark:border-[#233d2e] shadow-md overflow-hidden flex flex-col md:flex-row">
            {/* Left Dark Poster (1/3) */}
            <div className="md:w-60 bg-gradient-to-br from-[#08482D] to-[#041c11] text-white p-5 flex flex-col justify-between shrink-0 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-[#DAE7C7]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
                <span className="text-xs font-heading font-black tracking-wide">Kaushalya</span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-heading font-black leading-snug line-clamp-2">
                  {workshop.title}
                </h3>
                <div className="text-[11px] italic text-[#DAE7C7] mt-0.5">
                  {tagline}
                </div>
              </div>

              {/* Glowing Laptop Illustration */}
              <div className="my-3 flex items-center justify-center">
                <div className="relative w-20 h-14 flex items-center justify-center">
                  <div className="w-14 h-9 bg-[#101410] rounded-t-md border border-[#DAE7C7]/50 flex items-center justify-center shadow-lg">
                    <code className="text-[#DAE7C7] font-mono text-[9px] font-bold">&lt;/&gt;</code>
                  </div>
                  <div className="absolute bottom-1 w-18 h-1 bg-[#DAE7C7] rounded-b-sm" />
                </div>
              </div>

              <div className="text-[9px] uppercase tracking-wider text-[#DAE7C7]/80 font-heading font-bold">
                Workshop Pass
              </div>
            </div>

            {/* Middle Details (1/3) */}
            <div className="flex-1 p-5 space-y-3">
              <span className="inline-block bg-[#08482D] text-white text-[10px] font-heading font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                Your Ticket
              </span>

              <div className="space-y-2 text-xs">
                <div>
                  <div className="text-[10px] font-heading font-bold text-[#5E5E61] dark:text-[#8ba895] uppercase">
                    Attendee Name
                  </div>
                  <div className="text-sm font-heading font-black text-[#101410] dark:text-white mt-0.5">
                    {registration.participantName}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-heading font-bold text-[#5E5E61] dark:text-[#8ba895] uppercase">
                    Registration ID
                  </div>
                  <div className="font-mono text-xs font-bold text-[#08482D] dark:text-[#DAE7C7] mt-0.5">
                    {ticketCode}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-heading font-bold text-[#5E5E61] dark:text-[#8ba895] uppercase">
                    Workshop Date
                  </div>
                  <div className="font-heading font-semibold text-[#101410] dark:text-white mt-0.5">
                    {formattedDate}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-heading font-bold text-[#5E5E61] dark:text-[#8ba895] uppercase">
                    Time
                  </div>
                  <div className="text-[#101410] dark:text-white mt-0.5">
                    {workshop.startTime} – {workshop.endTime}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-heading font-bold text-[#5E5E61] dark:text-[#8ba895] uppercase">
                    Venue
                  </div>
                  <div className="text-[#101410] dark:text-white mt-0.5 truncate">
                    {workshop.onlineMode ? 'Online Webcast Studio' : workshop.venue}
                  </div>
                </div>
              </div>
            </div>

            {/* Right QR Stub (1/3) */}
            <div className="md:w-56 bg-[#fbfdf9] dark:bg-[#121f17] p-5 flex flex-col items-center justify-center text-center border-t md:border-t-0 md:border-l border-dashed border-[#DCE4D6] dark:border-[#233d2e] shrink-0">
              <div className="p-2 bg-white rounded-xl shadow-xs border border-[#DCE4D6] relative">
                {qrUrl ? (
                  <img src={qrUrl} alt="Pass QR" className="w-28 h-28 object-contain" />
                ) : (
                  <div className="w-28 h-28 flex items-center justify-center text-[10px] text-[#5E5E61]">Generating...</div>
                )}
                {/* Corner bracket accents */}
                <div className="absolute top-0.5 left-0.5 w-2 h-2 border-t-2 border-l-2 border-[#08482D]" />
                <div className="absolute top-0.5 right-0.5 w-2 h-2 border-t-2 border-r-2 border-[#08482D]" />
                <div className="absolute bottom-0.5 left-0.5 w-2 h-2 border-b-2 border-l-2 border-[#08482D]" />
                <div className="absolute bottom-0.5 right-0.5 w-2 h-2 border-b-2 border-r-2 border-[#08482D]" />
              </div>

              <div className="text-xs font-heading font-bold text-[#101410] dark:text-white mt-2">
                Scan this QR code
              </div>
              <div className="text-[10px] text-[#5E5E61] dark:text-[#8ba895]">
                at the venue for entry
              </div>
            </div>
          </div>

          {/* ════════════ "PAYMENT RECEIPT" LEDGER CARD ════════════ */}
          <div className="rounded-2xl border border-[#DCE4D6] dark:border-[#233d2e] overflow-hidden bg-white dark:bg-[#14231b] shadow-xs">
            {/* Header Ribbon */}
            <div className="bg-[#F5F8EF] dark:bg-[#16291e] px-4 py-2.5 border-b border-[#DCE4D6] dark:border-[#233d2e] flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#08482D] text-white rounded-lg text-xs font-heading font-bold shadow-xs">
                <FileText className="w-3.5 h-3.5 text-[#DAE7C7]" />
                <span>Payment Receipt</span>
              </div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-full text-xs font-heading font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Payment Successful</span>
              </div>
            </div>

            {/* Two-Column Ledger */}
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Left Column: Transaction Metadata */}
              <div className="space-y-2">
                <div className="flex items-center justify-between py-1 border-b border-[#DCE4D6]/60 dark:border-[#233d2e]">
                  <span className="text-[#5E5E61] dark:text-[#8ba895]">Receipt No.</span>
                  <span className="font-mono font-bold text-[#101410] dark:text-white">{receiptNo}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-[#DCE4D6]/60 dark:border-[#233d2e]">
                  <span className="text-[#5E5E61] dark:text-[#8ba895]">Payment Date</span>
                  <span className="font-semibold text-[#101410] dark:text-white">{paymentDateFormatted}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-[#DCE4D6]/60 dark:border-[#233d2e]">
                  <span className="text-[#5E5E61] dark:text-[#8ba895]">Payment Method</span>
                  <span className="font-semibold text-[#101410] dark:text-white">{paymentMethod}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-[#DCE4D6]/60 dark:border-[#233d2e]">
                  <span className="text-[#5E5E61] dark:text-[#8ba895]">Transaction ID</span>
                  <span className="font-mono font-bold text-[#08482D] dark:text-[#DAE7C7] truncate max-w-[160px]">{transactionId}</span>
                </div>
              </div>

              {/* Right Column: Charges Summary */}
              <div className="space-y-2">
                <div className="font-heading font-bold text-[#101410] dark:text-white pb-1">
                  Charges Summary
                </div>
                <div className="flex items-center justify-between py-1 border-b border-[#DCE4D6]/60 dark:border-[#233d2e]">
                  <span className="text-[#5E5E61] dark:text-[#8ba895]">Workshop Seat</span>
                  <span className="font-semibold text-[#101410] dark:text-white">₹{registration.amount}.00</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-[#DCE4D6]/60 dark:border-[#233d2e]">
                  <span className="text-[#5E5E61] dark:text-[#8ba895]">Convenience Fee</span>
                  <span className="font-semibold text-[#101410] dark:text-white">₹0.00</span>
                </div>

                {/* Mint Green Highlight Bar */}
                <div className="mt-2 p-2.5 bg-[#E8F0DF] dark:bg-[#16291e] border border-[#DAE7C7] dark:border-[#233d2e] rounded-xl flex items-center justify-between font-heading font-black text-sm text-[#08482D] dark:text-[#DAE7C7]">
                  <span>Total Paid</span>
                  <span>₹{registration.amount}.00</span>
                </div>
              </div>
            </div>
          </div>

          {/* ════════════ ACTION BUTTONS TOOLBAR ════════════ */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 print:hidden">
            <button
              type="button"
              onClick={handleDownloadTicket}
              className="py-2.5 px-4 bg-[#08482D] hover:bg-[#0c5c3b] text-white text-xs font-heading font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#DAE7C7]" />
              <span>Download Ticket (PDF)</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadReceipt}
              className="py-2.5 px-4 bg-[#08482D] hover:bg-[#0c5c3b] text-white text-xs font-heading font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#DAE7C7]" />
              <span>Download Receipt (PDF)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-5 bg-white dark:bg-[#14231b] border border-[#DCE4D6] dark:border-[#233d2e] hover:bg-[#F5F8EF] dark:hover:bg-[#1b3025] text-[#101410] dark:text-white text-xs font-heading font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <Home className="w-4 h-4 text-[#08482D] dark:text-[#DAE7C7]" />
              <span>Go to Dashboard</span>
            </button>
          </div>

          {/* ════════════ FOOTER FLOURISH ════════════ */}
          <div className="pt-2 text-center space-y-3">
            <div className="flex items-center justify-center gap-3 text-xs text-[#5E5E61] dark:text-[#8ba895] font-medium">
              <div className="h-px w-16 bg-[#DCE4D6] dark:bg-[#233d2e]" />
              <span>We look forward to seeing you at the workshop!</span>
              <div className="h-px w-16 bg-[#DCE4D6] dark:bg-[#233d2e]" />
            </div>

            <div className="pt-3 border-t border-[#DCE4D6] dark:border-[#233d2e] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#5E5E61] dark:text-[#8ba895]">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#08482D] dark:text-[#DAE7C7]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
                <strong className="text-[#08482D] dark:text-[#DAE7C7]">Kaushalya</strong> • Learn • Build • Grow
              </div>

              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#08482D] dark:text-[#DAE7C7]" />
                  <span>support@kaushalya.edu</span>
                </span>
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-[#08482D] dark:text-[#DAE7C7]" />
                  <span>www.kaushalya.edu</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
