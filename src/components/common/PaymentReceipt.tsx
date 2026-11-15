import React, { useRef, useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  CheckCircle2,
  Printer,
  Download,
  Copy,
  Check,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  Building2,
  Sparkles,
  Award,
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
  const [copiedCode, setCopiedCode] = useState(false);

  const ticketCode = registration.ticketCode || `TKT-${registration.id?.slice(-8).toUpperCase()}`;
  const invoiceNumber = `INV-${new Date().getFullYear()}-${registration.id?.slice(-6).toUpperCase()}`;
  const formattedDate = new Date(workshop.date).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const issueDate = new Date().toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  useEffect(() => {
    QRCode.toDataURL(
      JSON.stringify({
        ticketCode,
        invoiceNumber,
        workshopId: workshop.id,
        title: workshop.title,
        attendee: registration.participantName,
        amount: registration.amount,
        status: 'CONFIRMED',
      }),
      { width: 140, margin: 1, color: { dark: '#08482D', light: '#FFFFFF' } }
    ).then(setQrUrl).catch(() => {});
  }, [registration, workshop, ticketCode, invoiceNumber]);

  const handlePrint = () => window.print();

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(ticketCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownload = () => {
    if (!receiptRef.current) return;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Receipt - ${ticketCode}</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 30px; background: #f8faf6; color: #101410; }
      .container { max-width: 520px; margin: auto; background: #fff; border: 1px solid #dce4d6; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); }
      .header { background: #08482D; color: #dae7c7; padding: 24px; text-align: center; }
      .brand { font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #dae7c7; }
      .title { font-size: 18px; font-weight: 900; color: #fff; margin-top: 6px; }
      .body { padding: 24px; }
      .amount-box { background: #f5f8ef; border: 1px solid #dce4d6; border-radius: 16px; padding: 16px; text-align: center; margin-bottom: 20px; }
      .amount { font-size: 32px; font-weight: 900; color: #08482D; margin: 4px 0; }
      .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edf2e8; font-size: 12px; }
      .label { color: #5e5e61; font-weight: 500; }
      .value { font-weight: 700; color: #101410; text-align: right; max-width: 60%; }
      .qr { text-align: center; margin: 20px 0; }
      .qr img { width: 130px; height: 130px; border-radius: 12px; border: 1px solid #dce4d6; }
      .ticket { font-size: 16px; font-weight: 900; font-family: monospace; letter-spacing: 3px; color: #08482D; background: #edf3e5; padding: 8px 16px; border-radius: 8px; display: inline-block; }
      .footer { background: #fafcf8; border-top: 1px solid #edf2e8; padding: 16px; text-align: center; font-size: 10px; color: #5e5e61; }
    </style></head><body>
      <div class="container">
        <div class="header">
          <div class="brand">Kaushalya WorkshopHub • Official Tax Receipt & Gate Pass</div>
          <div class="title">${workshop.title}</div>
        </div>
        <div class="body">
          <div class="amount-box">
            <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #5e5e61;">Total Fee Paid</div>
            <div class="amount">₹${registration.amount} INR</div>
            <div style="font-size: 11px; color: #08482D; font-weight: 700;">Payment Status: Verified & Confirmed</div>
          </div>
          <div class="qr">
            <img src="${qrUrl}" alt="Gate Pass QR" />
            <div style="margin-top: 10px;"><span class="ticket">${ticketCode}</span></div>
          </div>
          <div class="row"><span class="label">Invoice Reference:</span><span class="value">${invoiceNumber}</span></div>
          <div class="row"><span class="label">Participant Name:</span><span class="value">${registration.participantName}</span></div>
          <div class="row"><span class="label">Email Address:</span><span class="value">${registration.participantEmail}</span></div>
          <div class="row"><span class="label">Session Date:</span><span class="value">${formattedDate}</span></div>
          <div class="row"><span class="label">Session Timing:</span><span class="value">${workshop.startTime} - ${workshop.endTime}</span></div>
          <div class="row"><span class="label">Venue Location:</span><span class="value">${workshop.onlineMode ? 'Online Webcast Studio' : workshop.venue}</span></div>
          <div class="row"><span class="label">Payment Mode:</span><span class="value">${paymentMethod}</span></div>
          <div class="row"><span class="label">Transaction Date:</span><span class="value">${issueDate}</span></div>
        </div>
        <div class="footer">
          Guru Nanak Institute of Management Studies • Academic Computing Services<br/>
          Present this official pass at the arrival checkpoint for verification.
        </div>
      </div>
    </body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `receipt-${ticketCode}.html`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 bg-black/75 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-[#111e16] rounded-3xl w-full max-w-md border border-[#DCE4D6] dark:border-[#233d2e] shadow-2xl overflow-hidden my-auto print:shadow-none print:border-none print:max-w-none"
      >
        {/* Official Header */}
        <div className="bg-[#08482D] p-5 text-white relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-heading font-extrabold uppercase tracking-widest text-[#DAE7C7] bg-[#DAE7C7]/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#DAE7C7]" />
              Official Tax Receipt & Gate Pass
            </span>
            <span className="text-[11px] font-mono text-[#DAE7C7] font-semibold">
              {invoiceNumber}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-heading font-bold text-white line-clamp-2 mt-1">
            {workshop.title}
          </h2>
          <div className="flex items-center gap-2 mt-2 text-xs text-[#DAE7C7]/90 font-medium">
            <ShieldCheck className="w-4 h-4 text-[#DAE7C7]" />
            <span>Verified Seat Reservation • Guru Nanak Institute</span>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div ref={receiptRef} className="p-5 sm:p-6 space-y-4 print:p-8">
          {/* Amount Paid Card */}
          <div className="bg-[#F5F8EF] dark:bg-[#16291e] border border-[#DCE4D6] dark:border-[#233d2e] rounded-2xl p-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-[#5E5E61] dark:text-[#8ba895]">Total Amount Paid</div>
              <div className="text-2xl sm:text-3xl font-heading font-black text-[#08482D] dark:text-[#DAE7C7]">₹{registration.amount}</div>
              <div className="text-[10px] text-[#5E5E61] dark:text-[#8ba895]">Settled via {paymentMethod}</div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          {/* QR Code & Gate Ticket Code Card */}
          <div className="p-4 bg-white dark:bg-[#14231b] border border-[#DCE4D6] dark:border-[#233d2e] rounded-2xl flex flex-col sm:flex-row items-center gap-4">
            <div className="p-2 bg-[#F5F8EF] dark:bg-[#1a2e22] rounded-xl border border-[#DCE4D6] dark:border-[#233d2e] shrink-0">
              {qrUrl ? (
                <img src={qrUrl} alt="Gate Pass QR" className="w-24 h-24 rounded-lg" />
              ) : (
                <div className="w-24 h-24 flex items-center justify-center text-[10px] text-[#5E5E61]">Generating...</div>
              )}
            </div>
            <div className="flex-1 space-y-1.5 w-full text-center sm:text-left">
              <div className="text-[10px] font-heading font-bold uppercase tracking-wider text-[#5E5E61] dark:text-[#8ba895]">Single-Use Gate Pass Code</div>
              <div className="flex items-center justify-center sm:justify-start gap-1.5">
                <code className="text-sm sm:text-base font-mono font-extrabold text-[#08482D] dark:text-[#DAE7C7] tracking-wider px-2 py-0.5 bg-[#F5F8EF] dark:bg-[#111e16] rounded-lg border border-[#DCE4D6] dark:border-[#233d2e]">
                  {ticketCode}
                </code>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg text-[#5E5E61] dark:text-[#8ba895] cursor-pointer"
                  title="Copy Ticket Code"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="text-[10px] text-[#5E5E61] dark:text-[#8ba895]">Present this code to the volunteer at gate check-in</div>
            </div>
          </div>

          {/* Detailed Transaction Ledger */}
          <div className="space-y-2 text-xs divide-y divide-[#DCE4D6]/60 dark:divide-[#233d2e]/60">
            {[
              { label: 'Participant Name', value: registration.participantName },
              { label: 'Email Address', value: registration.participantEmail },
              { label: 'Event Schedule', value: `${formattedDate} • ${workshop.startTime} - ${workshop.endTime}` },
              { label: 'Venue Location', value: workshop.onlineMode ? 'Online Webcast Studio' : workshop.venue },
              { label: 'Payment Gateway', value: paymentMethod },
              { label: 'Transaction Date', value: issueDate },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-1.5 pt-2">
                <span className="text-[#5E5E61] dark:text-[#8ba895] font-medium">{label}</span>
                <span className="font-bold text-[#101410] dark:text-[#f0f5ee] text-right truncate max-w-[60%]">{value}</span>
              </div>
            ))}
          </div>

          <div className="text-center text-[10px] text-[#5E5E61] dark:text-[#8ba895] pt-2 border-t border-[#DCE4D6] dark:border-[#233d2e]">
            Official Academic Event Pass • Guru Nanak Institute of Management Studies
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="p-4 bg-[#F5F8EF] dark:bg-[#16291e] border-t border-[#DCE4D6] dark:border-[#233d2e] flex items-center gap-2 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 bg-[#08482D] hover:bg-[#0c5c3b] text-white text-xs font-heading font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[#DAE7C7]" /> Print Receipt
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 py-2.5 bg-white dark:bg-[#111e16] border border-[#DCE4D6] dark:border-[#233d2e] text-[#08482D] dark:text-[#DAE7C7] text-xs font-heading font-bold rounded-xl hover:bg-[#E8F0DF] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Save File
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-transparent hover:bg-black/5 dark:hover:bg-white/10 text-[#5E5E61] dark:text-[#8ba895] text-xs font-heading font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

