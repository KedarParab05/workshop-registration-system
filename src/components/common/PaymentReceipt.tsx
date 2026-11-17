import React, { useRef, useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { motion } from 'motion/react';
import {
  Check,
  Download,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Home,
  CheckCircle2,
  Mail,
  Globe,
  GraduationCap,
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
    if (c.includes('web')) return 'Design. Build. Deliver.';
    if (c.includes('ai') || c.includes('machine') || c.includes('deep')) return 'Train. Predict. Innovate.';
    if (c.includes('cloud') || c.includes('devops') || c.includes('infrastructure')) return 'Automate. Scale. Deliver.';
    if (c.includes('cyber') || c.includes('security')) return 'Defend. Audit. Secure.';
    if (c.includes('data') || c.includes('algorithm')) return 'Analyze. Optimize. Solve.';
    if (c.includes('software') || c.includes('architecture')) return 'Design. Structure. Elevate.';
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
      { width: 280, margin: 1, color: { dark: '#101D32', light: '#FFFFFF' } }
    ).then(setQrUrl).catch(() => {});
  }, [registration, workshop, ticketCode, receiptNo]);

  // Download Ticket Pass as clean Neo-Brutalist HTML
  const handleDownloadTicket = () => {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Ticket - ${ticketCode}</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; margin: 0; padding: 40px; background: #FFF5E9; color: #101D32; display: flex; justify-content: center; }
      .ticket { width: 780px; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 8px 8px 0px 0px #101D32; display: flex; border: 2px solid #101D32; }
      .poster { width: 260px; background: #101D32; color: #fff; padding: 28px 24px; display: flex; flex-direction: column; justify-content: space-between; border-right: 2px solid #101D32; }
      .details { flex: 1; padding: 28px; background: #fff; }
      .stub { width: 220px; background: #FFF5E9; border-left: 2px dashed #101D32; padding: 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
      .pill { background: #F4511E; color: #fff; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 8px; border: 2px solid #101D32; display: inline-block; text-transform: uppercase; margin-bottom: 12px; }
      .row { margin-bottom: 10px; font-size: 12px; }
      .label { color: #101D32; opacity: 0.7; font-size: 11px; text-transform: uppercase; font-weight: 700; }
      .val { font-weight: 800; color: #101D32; font-size: 13px; }
    </style></head><body>
      <div class="ticket">
        <div class="poster">
          <div>
            <div style="font-weight:900;font-size:18px;">Kaushalya</div>
            <div style="font-size:9px;opacity:0.8;text-transform:uppercase;">Learn • Build • Grow</div>
          </div>
          <div>
            <div style="font-size:22px;font-weight:900;line-height:1.2;">${workshop.title}</div>
            <div style="font-size:13px;font-style:italic;color:#FFD6B0;margin-top:4px;">${tagline}</div>
          </div>
          <div style="font-size:11px;background:#F4511E;padding:4px 8px;border-radius:6px;text-align:center;font-weight:800;letter-spacing:1px;text-transform:uppercase;">Workshop Pass</div>
        </div>
        <div class="details">
          <div class="pill">Your Ticket</div>
          <div class="row"><div class="label">Attendee Name</div><div class="val" style="font-size:16px;">${registration.participantName}</div></div>
          <div class="row"><div class="label">Registration ID</div><div class="val" style="font-family:monospace;color:#F4511E;">${ticketCode}</div></div>
          <div class="row"><div class="label">Workshop Date</div><div class="val">${formattedDate}</div></div>
          <div class="row"><div class="label">Time</div><div class="val">${workshop.startTime} – ${workshop.endTime}</div></div>
          <div class="row"><div class="label">Venue</div><div class="val">${workshop.onlineMode ? 'Online Studio / Webcast' : workshop.venue}</div></div>
        </div>
        <div class="stub">
          <img src="${qrUrl}" style="width:130px;height:130px;border-radius:8px;border:2px solid #101D32;" />
          <div style="font-size:12px;font-weight:800;margin-top:10px;color:#101D32;text-transform:uppercase;">Scan this QR</div>
          <div style="font-size:10px;color:#101D32;opacity:0.7;">at entry gate</div>
        </div>
      </div>
    </body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `ticket-${ticketCode}.html`;
    a.click();
  };

  // Download Payment Receipt HTML
  const handleDownloadReceipt = () => {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Receipt - ${receiptNo}</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; margin: 0; padding: 40px; background: #FFF5E9; color: #101D32; display: flex; justify-content: center; }
      .card { width: 680px; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 8px 8px 0px 0px #101D32; border: 2px solid #101D32; }
      .header { background: #101D32; color: #fff; padding: 24px 30px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #101D32; }
      .body { padding: 30px; }
      .grid { display: flex; justify-content: space-between; gap: 30px; margin-top: 20px; }
      .col { flex: 1; }
      .item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #101D32; font-size: 13px; }
      .total-box { background: #FFD6B0; border-radius: 8px; border: 2px solid #101D32; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; font-weight: 800; font-size: 16px; color: #101D32; margin-top: 14px; }
      .footer { background: #FFF5E9; padding: 18px 30px; text-align: center; font-size: 11px; color: #101D32; font-weight: 600; border-top: 2px solid #101D32; }
    </style></head><body>
      <div class="card">
        <div class="header">
          <div>
            <div style="font-size:18px;font-weight:900;">Kaushalya • Official Tax Receipt</div>
            <div style="font-size:11px;color:#FFD6B0;margin-top:2px;">${workshop.title}</div>
          </div>
          <div style="background:#F4511E;color:#fff;padding:6px 14px;border-radius:8px;border:2px solid #fff;font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;">
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
              <div style="font-size:13px;font-weight:900;margin-bottom:8px;color:#101D32;text-transform:uppercase;">Charges Summary</div>
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5 bg-[#101D32]/70 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-3xl border-2 border-[#101D32] shadow-[8px_8px_0px_0px_#101D32] overflow-hidden my-auto print:shadow-none print:border-none print:max-w-none text-[#101D32]"
      >
        <div ref={receiptRef} className="p-6 sm:p-8 space-y-6">
          {/* ════════════ TOP HEADER BAR ════════════ */}
          <div className="flex items-center justify-between pb-4 border-b-2 border-[#101D32]">
            <div className="flex items-center gap-3">
              {/* Brand Logo */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-[#F4511E] border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] flex items-center justify-center text-white shrink-0">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-base font-heading font-black text-[#101D32] leading-tight">
                    Kaushalya
                  </div>
                  <div className="text-[9px] font-heading font-bold text-[#101D32]/70 uppercase tracking-wider">
                    Learn • Build • Grow
                  </div>
                </div>
              </div>

              {/* Vertical divider */}
              <div className="hidden sm:block h-6 w-px bg-[#101D32]/30 mx-1" />

              {/* Workshop Title & Tagline in header */}
              <div className="hidden sm:block min-w-0">
                <div className="text-sm font-heading font-black text-[#101D32] truncate">
                  {workshop.title}
                </div>
                <div className="text-[11px] font-heading italic text-[#F4511E] font-bold">
                  {tagline}
                </div>
              </div>
            </div>

            {/* Decorative dot matrix */}
            <div className="grid grid-cols-4 gap-1 opacity-60">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#101D32]" />
              ))}
            </div>
          </div>

          {/* ════════════ HERO CELEBRATION ════════════ */}
          <div className="text-center py-2 relative">
            <div className="relative inline-flex items-center justify-center mb-3">
              <div className="w-16 h-16 rounded-xl bg-[#F4511E] border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] text-white flex items-center justify-center">
                <Check className="w-9 h-9 stroke-[3]" />
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-heading font-black text-[#101D32] tracking-tight">
              Registration Successful!
            </h1>
            <p className="text-xs sm:text-sm text-[#101D32]/80 max-w-lg mx-auto mt-1 leading-relaxed font-sans">
              Thank you for registering for the <strong className="text-[#101D32]">{workshop.title}</strong>. Your payment has been confirmed and your seat is booked.
            </p>
          </div>

          {/* ════════════ "YOUR TICKET" PREVIEW CARD ════════════ */}
          <div className="bg-white rounded-xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] overflow-hidden flex flex-col md:flex-row">
            {/* Left Dark Poster (1/3) */}
            <div className="md:w-60 bg-[#101D32] text-white p-5 flex flex-col justify-between shrink-0 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded bg-[#F4511E] border border-white flex items-center justify-center text-white">
                  <GraduationCap className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-xs font-heading font-black tracking-wide">Kaushalya</span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-heading font-black leading-snug line-clamp-2">
                  {workshop.title}
                </h3>
                <div className="text-[11px] italic text-[#FFD6B0] mt-0.5">
                  {tagline}
                </div>
              </div>

              <div className="mt-4 text-[9px] uppercase tracking-wider text-white bg-[#F4511E] border border-white py-1 px-2 rounded-md font-heading font-extrabold text-center">
                Workshop Pass
              </div>
            </div>

            {/* Middle Details (1/3) */}
            <div className="flex-1 p-5 space-y-3 font-sans">
              <span className="inline-block bg-[#F4511E] text-white text-[10px] font-heading font-extrabold uppercase tracking-wider px-3 py-1 rounded-md border border-[#101D32]">
                Your Ticket
              </span>

              <div className="space-y-2 text-xs">
                <div>
                  <div className="text-[10px] font-heading font-bold text-[#101D32]/70 uppercase">
                    Attendee Name
                  </div>
                  <div className="text-sm font-heading font-black text-[#101D32] mt-0.5">
                    {registration.participantName}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-heading font-bold text-[#101D32]/70 uppercase">
                    Registration ID
                  </div>
                  <div className="font-mono text-xs font-bold text-[#F4511E] mt-0.5">
                    {ticketCode}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-heading font-bold text-[#101D32]/70 uppercase">
                    Workshop Date
                  </div>
                  <div className="font-heading font-bold text-[#101D32] mt-0.5">
                    {formattedDate}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-heading font-bold text-[#101D32]/70 uppercase">
                    Time
                  </div>
                  <div className="text-[#101D32] mt-0.5 font-medium">
                    {workshop.startTime} – {workshop.endTime}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-heading font-bold text-[#101D32]/70 uppercase">
                    Venue
                  </div>
                  <div className="text-[#101D32] mt-0.5 truncate font-medium">
                    {workshop.onlineMode ? 'Online Webcast Studio' : workshop.venue}
                  </div>
                </div>
              </div>
            </div>

            {/* Right QR Stub (1/3) */}
            <div className="md:w-56 bg-[#FFF5E9] p-5 flex flex-col items-center justify-center text-center border-t md:border-t-0 md:border-l-2 border-dashed border-[#101D32] shrink-0 font-sans">
              <div className="p-2 bg-white rounded-lg border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] relative">
                {qrUrl ? (
                  <img src={qrUrl} alt="Pass QR" className="w-28 h-28 object-contain" />
                ) : (
                  <div className="w-28 h-28 flex items-center justify-center text-[10px] text-[#101D32]">Generating...</div>
                )}
              </div>

              <div className="text-xs font-heading font-extrabold text-[#101D32] mt-2 uppercase">
                Scan this QR code
              </div>
              <div className="text-[10px] text-[#101D32]/70 font-medium">
                at the venue for entry
              </div>
            </div>
          </div>

          {/* ════════════ "PAYMENT RECEIPT" LEDGER CARD ════════════ */}
          <div className="rounded-xl border-2 border-[#101D32] overflow-hidden bg-white shadow-[4px_4px_0px_0px_#101D32]">
            {/* Header Ribbon */}
            <div className="bg-[#FFF5E9] px-4 py-2.5 border-b-2 border-[#101D32] flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#101D32] text-white rounded-md text-xs font-heading font-bold">
                <FileText className="w-3.5 h-3.5 text-white" />
                <span>Payment Receipt</span>
              </div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#FFD6B0] border border-[#101D32] text-[#101D32] rounded-md text-xs font-heading font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#F4511E]" />
                <span>Payment Successful</span>
              </div>
            </div>

            {/* Two-Column Ledger */}
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-sans">
              {/* Left Column: Transaction Metadata */}
              <div className="space-y-2">
                <div className="flex items-center justify-between py-1 border-b border-[#101D32]/20">
                  <span className="text-[#101D32]/70">Receipt No.</span>
                  <span className="font-mono font-bold text-[#101D32]">{receiptNo}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-[#101D32]/20">
                  <span className="text-[#101D32]/70">Payment Date</span>
                  <span className="font-semibold text-[#101D32]">{paymentDateFormatted}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-[#101D32]/20">
                  <span className="text-[#101D32]/70">Payment Method</span>
                  <span className="font-semibold text-[#101D32]">{paymentMethod}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-[#101D32]/20">
                  <span className="text-[#101D32]/70">Transaction ID</span>
                  <span className="font-mono font-bold text-[#F4511E] truncate max-w-[160px]">{transactionId}</span>
                </div>
              </div>

              {/* Right Column: Charges Summary */}
              <div className="space-y-2">
                <div className="font-heading font-extrabold text-[#101D32] pb-1 uppercase">
                  Charges Summary
                </div>
                <div className="flex items-center justify-between py-1 border-b border-[#101D32]/20">
                  <span className="text-[#101D32]/70">Workshop Seat</span>
                  <span className="font-semibold text-[#101D32]">₹{registration.amount}.00</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-[#101D32]/20">
                  <span className="text-[#101D32]/70">Convenience Fee</span>
                  <span className="font-semibold text-[#101D32]">₹0.00</span>
                </div>

                {/* Peach Highlight Bar */}
                <div className="mt-2 p-2.5 bg-[#FFD6B0] border-2 border-[#101D32] rounded-lg flex items-center justify-between font-heading font-black text-sm text-[#101D32]">
                  <span>Total Paid</span>
                  <span>₹${registration.amount}.00</span>
                </div>
              </div>
            </div>
          </div>

          {/* ════════════ ACTION BUTTONS TOOLBAR ════════════ */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 print:hidden">
            <button
              type="button"
              onClick={handleDownloadTicket}
              className="py-2.5 px-4 bg-[#F4511E] hover:bg-[#E84316] text-white text-xs font-heading font-bold rounded-lg border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#101D32] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-white" />
              <span>Download Ticket (PDF)</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadReceipt}
              className="py-2.5 px-4 bg-[#101D32] hover:bg-[#101D32]/90 text-white text-xs font-heading font-bold rounded-lg border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#101D32] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-white" />
              <span>Download Receipt (PDF)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-5 bg-white border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] hover:bg-[#FFD6B0] text-[#101D32] text-xs font-heading font-bold rounded-lg hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#101D32] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-2 cursor-pointer"
            >
              <Home className="w-4 h-4 text-[#F4511E]" />
              <span>Go to Dashboard</span>
            </button>
          </div>

          {/* ════════════ FOOTER FLOURISH ════════════ */}
          <div className="pt-2 text-center space-y-3 font-sans">
            <div className="flex items-center justify-center gap-3 text-xs text-[#101D32]/70 font-semibold">
              <div className="h-px w-16 bg-[#101D32]/30" />
              <span>We look forward to seeing you at the workshop!</span>
              <div className="h-px w-16 bg-[#101D32]/30" />
            </div>

            <div className="pt-3 border-t-2 border-[#101D32]/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#101D32]/70">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#F4511E] border border-[#101D32] flex items-center justify-center text-white">
                  <GraduationCap className="w-3 h-3 text-white" />
                </div>
                <strong className="text-[#101D32]">Kaushalya</strong> • Learn • Build • Grow
              </div>

              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 font-medium">
                  <Mail className="w-3.5 h-3.5 text-[#F4511E]" />
                  <span>support@kaushalya.edu</span>
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <Globe className="w-3.5 h-3.5 text-[#F4511E]" />
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
