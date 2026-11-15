import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Download,
  Printer,
  Copy,
  Check,
  Navigation,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
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

  const formattedDate = workshop ? formatEventDate(workshop.date) : '';

  // Dynamic Tagline based on workshop category
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

  const tagline = workshop ? getTagline(workshop.category, workshop.summary) : 'Learn. Build. Grow.';

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
      width: 320,
      margin: 1,
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

  // Generate self-contained downloadable HTML matching the exact ticket format
  const handleDownload = () => {
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Workshop Pass - ${ticketCode}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #eef2eb;
      color: #101410;
      padding: 40px 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .ticket-container {
      width: 820px;
      background: #ffffff;
      border-radius: 20px;
      box-shadow: 0 16px 40px rgba(8, 72, 45, 0.12);
      display: flex;
      position: relative;
      overflow: hidden;
      border: 1px solid #dce4d6;
    }
    .main-pass {
      flex: 1;
      padding: 32px 36px;
      position: relative;
      display: flex;
      flex-col;
      justify-content: space-between;
    }
    .badge-corner {
      position: absolute;
      top: 0;
      right: 0;
      background: #08482D;
      color: #ffffff;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      padding: 10px 28px 10px 24px;
      border-bottom-left-radius: 18px;
    }
    .brand-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 900;
      color: #08482D;
      line-height: 1.1;
    }
    .brand-sub {
      font-size: 10px;
      color: #5E5E61;
      letter-spacing: 1px;
      text-transform: uppercase;
      font-weight: 600;
    }
    .ws-title {
      font-size: 26px;
      font-weight: 900;
      color: #101410;
      line-height: 1.2;
      margin-bottom: 4px;
      max-width: 80%;
    }
    .ws-tagline {
      font-size: 14px;
      font-style: italic;
      color: #08482D;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .info-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 22px;
      font-size: 13px;
    }
    .info-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .icon-badge {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #08482D;
      color: #DAE7C7;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      flex-shrink: 0;
    }
    .info-label {
      font-weight: 700;
      color: #101410;
    }
    .attendee-box {
      background: #E8F0DF;
      border-radius: 14px;
      padding: 14px 18px;
      margin-bottom: 18px;
      max-width: 420px;
    }
    .attendee-label {
      font-size: 11px;
      color: #4a5e4e;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .attendee-name {
      font-size: 18px;
      font-weight: 900;
      color: #101410;
      margin: 2px 0;
    }
    .attendee-id {
      font-size: 12px;
      color: #08482D;
      font-weight: 700;
      font-family: monospace;
    }
    .main-footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .happy-learning {
      font-size: 18px;
      font-style: italic;
      font-weight: 700;
      color: #08482D;
    }
    .perforation {
      width: 0;
      border-right: 2px dashed #cfdac6;
      position: relative;
    }
    .cutout-top {
      position: absolute;
      top: -14px;
      left: -14px;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #eef2eb;
      border: 1px solid #dce4d6;
    }
    .cutout-bottom {
      position: absolute;
      bottom: -14px;
      left: -14px;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #eef2eb;
      border: 1px solid #dce4d6;
    }
    .ticket-stub {
      width: 260px;
      background: #fbfdf9;
      padding: 28px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      text-align: center;
    }
    .ticket-id-pill {
      background: #08482D;
      color: #ffffff;
      border-radius: 12px;
      padding: 8px 14px;
      width: 100%;
    }
    .ticket-id-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      opacity: 0.85;
    }
    .ticket-id-val {
      font-size: 13px;
      font-family: monospace;
      font-weight: 900;
      letter-spacing: 1px;
    }
    .qr-frame {
      background: #ffffff;
      border: 1px solid #dce4d6;
      border-radius: 14px;
      padding: 10px;
      margin: 14px 0;
      box-shadow: 0 4px 12px rgba(0,0,0,0.04);
    }
    .qr-frame img {
      width: 140px;
      height: 140px;
      display: block;
    }
    .scan-title {
      font-size: 13px;
      font-weight: 800;
      color: #101410;
    }
    .scan-sub {
      font-size: 10px;
      color: #5E5E61;
      margin-top: 2px;
    }
    .stub-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 14px;
    }
    .stub-brand-text {
      font-size: 12px;
      font-weight: 800;
      color: #08482D;
      text-align: left;
    }
    .stub-brand-sub {
      font-size: 8px;
      color: #5E5E61;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    @media print {
      body { background: #ffffff; padding: 0; }
      .ticket-container { box-shadow: none; border: 1px solid #999; }
      .cutout-top, .cutout-bottom { display: none; }
    }
  </style>
</head>
<body>
  <div class="ticket-container">
    <div class="main-pass">
      <div class="badge-corner">Workshop Pass</div>
      <div>
        <div class="brand-header">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#08482D">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/>
          </svg>
          <div>
            <div class="brand-title">Kaushalya • WorkshopHub</div>
            <div class="brand-sub">Learn • Build • Grow</div>
          </div>
        </div>

        <div class="ws-title">${workshop.title}</div>
        <div class="ws-tagline">${tagline}</div>

        <div class="info-list">
          <div class="info-row">
            <div class="icon-badge">📅</div>
            <div><span class="info-label">Date:</span> ${formattedDate}</div>
          </div>
          <div class="info-row">
            <div class="icon-badge">🕒</div>
            <div><span class="info-label">Time:</span> ${workshop.startTime} – ${workshop.endTime}</div>
          </div>
          <div class="info-row">
            <div class="icon-badge">📍</div>
            <div><span class="info-label">Venue:</span> ${workshop.onlineMode ? 'Online Studio / Webcast' : workshop.venue}${workshop.venueAddress && !workshop.onlineMode ? ` (${workshop.venueAddress})` : ''}</div>
          </div>
        </div>

        <div class="attendee-box">
          <div class="attendee-label">Attendee Name:</div>
          <div class="attendee-name">${registration.participantName}</div>
          <div class="attendee-id">Registration ID: ${ticketCode}</div>
        </div>
      </div>

      <div class="main-footer">
        <div class="happy-learning">Happy Learning!</div>
      </div>
    </div>

    <div class="perforation">
      <div class="cutout-top"></div>
      <div class="cutout-bottom"></div>
    </div>

    <div class="ticket-stub">
      <div class="ticket-id-pill">
        <div class="ticket-id-label">Ticket ID</div>
        <div class="ticket-id-val">${ticketCode}</div>
      </div>

      <div class="qr-frame">
        <img src="${qrDataUrl}" alt="Ticket QR" />
      </div>

      <div>
        <div class="scan-title">Scan at Entry</div>
        <div class="scan-sub">Show this QR code for verification</div>
      </div>

      <div class="stub-brand">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#08482D">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/>
        </svg>
        <div>
          <div class="stub-brand-text">Kaushalya</div>
          <div class="stub-brand-sub">Learn • Build • Grow</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `workshop-pass-${ticketCode}.html`;
    a.click();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto print:p-0">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#08482D]/60 backdrop-blur-md print:hidden"
        />

        {/* Modal Wrapper */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.2 }}
          className="relative max-w-4xl w-full my-auto z-10 print:max-w-none print:w-full"
        >
          {/* Close Button at top corner */}
          <button
            onClick={onClose}
            className="absolute -top-11 right-0 sm:right-2 p-2 rounded-full text-white/90 hover:text-white hover:bg-white/15 transition-colors print:hidden cursor-pointer flex items-center gap-1.5 text-xs font-heading font-semibold"
            aria-label="Close pass"
          >
            <span>Close</span>
            <X className="w-4 h-4" />
          </button>

          {/* Status Alert if Cancelled or Attended */}
          {(isCancelled || isAttended) && (
            <div className="mb-3 print:hidden">
              {isCancelled ? (
                <div className="flex items-center gap-2.5 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 shadow-md">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span><strong>Registration Cancelled:</strong> This pass has been relinquished and is no longer valid.</span>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 p-3 bg-[#E8F0DF] border border-[#DAE7C7] rounded-2xl text-xs text-[#08482D] shadow-md">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#08482D]" />
                  <span><strong>Ticket Verified:</strong> Check-in was confirmed at gate reception.</span>
                </div>
              )}
            </div>
          )}

          {/* ═════════════════ AUTHENTIC PHYSICAL PASS CONTAINER ═════════════════ */}
          <div
            ref={ticketRef}
            className="relative bg-white rounded-3xl shadow-2xl border border-[#DCE4D6] overflow-hidden flex flex-col md:flex-row print:shadow-none print:border print:rounded-none"
          >
            {/* ── LEFT: Main Pass Section ── */}
            <div className="flex-1 p-6 sm:p-8 relative flex flex-col justify-between overflow-hidden">
              {/* Top-Right Angled Badge */}
              <div className="absolute top-0 right-0 overflow-hidden pointer-events-none">
                <div className="bg-[#08482D] text-[#F5F8EF] text-[11px] font-heading font-extrabold uppercase tracking-wider py-1.5 px-6 rounded-bl-2xl shadow-sm">
                  Workshop Pass
                </div>
              </div>

              {/* Top: Brand Header */}
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-full bg-[#E8F0DF] flex items-center justify-center text-[#08482D] shrink-0">
                    <svg className="w-5 h-5 text-[#08482D]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm sm:text-base font-heading font-black text-[#08482D] tracking-tight leading-none">
                      Kaushalya • WorkshopHub
                    </div>
                    <div className="text-[9px] font-heading font-semibold text-[#5E5E61] uppercase tracking-wider mt-0.5">
                      Learn • Build • Grow
                    </div>
                  </div>
                </div>

                {/* Title + Tech Graphic Row */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-heading font-black text-[#101410] leading-tight pr-4">
                      {workshop.title}
                    </h1>
                    <div className="text-xs sm:text-sm italic font-heading font-semibold text-[#08482D] mt-1">
                      {tagline}
                    </div>
                  </div>

                  {/* Tech Graphic: Laptop with Code Screen */}
                  <div className="hidden sm:flex relative w-20 h-16 shrink-0 items-center justify-center">
                    <div className="absolute inset-0 bg-[#E8F0DF] rounded-2xl blur-xs transform scale-95" />
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-14 h-9 bg-[#101410] rounded-t-md border-2 border-[#08482D] flex items-center justify-center shadow-sm">
                        <span className="text-[#DAE7C7] font-mono text-[9px] font-bold">&lt;/&gt;</span>
                      </div>
                      <div className="w-18 h-1 bg-[#08482D] rounded-b-sm shadow-xs" />
                    </div>
                  </div>
                </div>

                {/* Logistics List (Date, Time, Venue) with Circular Green Badges */}
                <div className="space-y-2.5 text-xs text-[#101410] mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#08482D] text-[#DAE7C7] flex items-center justify-center shrink-0 shadow-xs">
                      <Calendar className="w-3.5 h-3.5 text-[#DAE7C7]" />
                    </div>
                    <div>
                      <span className="font-heading font-bold text-[#101410]">Date:</span>{' '}
                      <span className="text-[#2b3a2f] font-medium">{formattedDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#08482D] text-[#DAE7C7] flex items-center justify-center shrink-0 shadow-xs">
                      <Clock className="w-3.5 h-3.5 text-[#DAE7C7]" />
                    </div>
                    <div>
                      <span className="font-heading font-bold text-[#101410]">Time:</span>{' '}
                      <span className="text-[#2b3a2f] font-medium">{workshop.startTime} – {workshop.endTime}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#08482D] text-[#DAE7C7] flex items-center justify-center shrink-0 shadow-xs">
                      <MapPin className="w-3.5 h-3.5 text-[#DAE7C7]" />
                    </div>
                    <div className="truncate">
                      <span className="font-heading font-bold text-[#101410]">Venue:</span>{' '}
                      <span className="text-[#2b3a2f] font-medium">
                        {workshop.onlineMode ? 'Online Studio / Webcast' : workshop.venue}
                        {workshop.venueAddress && !workshop.onlineMode && ` (${workshop.venueAddress})`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mint Attendee Info Card */}
                <div className="bg-[#E8F0DF] border border-[#DAE7C7] rounded-2xl p-3.5 sm:p-4 max-w-md shadow-xs">
                  <div className="text-[10px] uppercase font-heading font-bold text-[#445b49] tracking-wider">
                    Attendee Name:
                  </div>
                  <div className="text-base sm:text-lg font-heading font-extrabold text-[#101410] mt-0.5">
                    {registration.participantName}
                  </div>
                  <div className="text-xs font-mono font-bold text-[#08482D] mt-1 flex items-center gap-2">
                    <span>Registration ID: {ticketCode}</span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="p-1 hover:bg-black/5 rounded-md cursor-pointer print:hidden"
                      title="Copy ID"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5 text-[#08482D]" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Happy Learning + Skyline Silhouette */}
              <div className="mt-4 pt-2 flex items-end justify-between relative">
                <div className="text-lg font-heading font-bold italic text-[#08482D]">
                  Happy Learning!
                </div>

                {/* University Skyline Silhouette */}
                <svg
                  className="w-44 sm:w-56 h-9 text-[#08482D]/15 fill-current pointer-events-none"
                  viewBox="0 0 200 36"
                  preserveAspectRatio="none"
                >
                  <path d="M0,36 L0,28 L6,28 L6,20 L10,20 L10,16 L14,16 L14,20 L18,20 L18,28 L24,28 L24,24 L28,24 L28,12 L32,6 L36,12 L36,24 L42,24 L42,28 L48,28 L48,18 L54,18 L54,14 L60,14 L60,18 L66,18 L66,28 L74,28 L74,10 L80,4 L86,10 L86,28 L94,28 L94,20 L102,20 L102,28 L110,28 L110,14 L116,14 L116,8 L122,8 L122,14 L130,14 L130,28 L138,28 L138,22 L144,22 L144,12 L150,6 L156,12 L156,22 L164,22 L164,28 L172,28 L172,16 L178,16 L178,28 L186,28 L186,18 L192,18 L192,36 Z" />
                </svg>
              </div>
            </div>

            {/* ── Perforation Divider with Half-Circle Cutouts ── */}
            <div className="relative flex md:flex-col items-center justify-center">
              {/* Dashed line */}
              <div className="w-full md:w-0 md:h-full border-t-2 md:border-t-0 md:border-r-2 border-dashed border-[#cfdac6]" />
              {/* Top Notch Cutout */}
              <div className="hidden md:block absolute -top-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-[#08482D]/60 border border-[#DCE4D6] shadow-inner z-20 pointer-events-none print:hidden" />
              {/* Bottom Notch Cutout */}
              <div className="hidden md:block absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-[#08482D]/60 border border-[#DCE4D6] shadow-inner z-20 pointer-events-none print:hidden" />
            </div>

            {/* ── RIGHT: Tear-off Stub Section ── */}
            <div className="w-full md:w-64 bg-[#fbfdf9] p-6 sm:p-7 flex flex-col items-center justify-between text-center border-t md:border-t-0 border-[#DCE4D6]">
              {/* Ticket ID Pill */}
              <div className="w-full bg-[#08482D] text-white rounded-xl py-2 px-3 shadow-xs">
                <div className="text-[10px] font-heading font-semibold uppercase tracking-wider text-[#DAE7C7]/90">
                  Ticket ID
                </div>
                <div className="text-xs sm:text-sm font-mono font-black tracking-widest text-white mt-0.5">
                  {ticketCode}
                </div>
              </div>

              {/* Centered QR Code */}
              <div className="my-4 p-2 bg-white rounded-2xl shadow-sm border border-[#DCE4D6]">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR Pass ${ticketCode}`}
                    className="w-36 h-36 sm:w-40 sm:h-40 object-contain mx-auto"
                  />
                ) : (
                  <div className="w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center text-[10px] text-[#5E5E61]">
                    Generating pass...
                  </div>
                )}
              </div>

              {/* Scan at Entry instructions */}
              <div className="mb-2">
                <div className="text-xs font-heading font-black text-[#101410] uppercase tracking-wide">
                  Scan at Entry
                </div>
                <div className="text-[10px] text-[#5E5E61] mt-0.5">
                  Show this QR code for verification
                </div>
              </div>

              {/* Bottom Brand Stamp */}
              <div className="pt-3 border-t border-[#DCE4D6]/70 w-full flex items-center justify-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#E8F0DF] flex items-center justify-center text-[#08482D] shrink-0">
                  <svg className="w-3.5 h-3.5 text-[#08482D]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-[11px] font-heading font-black text-[#08482D] leading-tight">
                    Kaushalya
                  </div>
                  <div className="text-[8px] font-heading font-semibold text-[#5E5E61] uppercase tracking-wider">
                    Learn • Build • Grow
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ═════════════════ ACTION TOOLBAR ═════════════════ */}
          <div className="mt-4 p-3 bg-white/95 dark:bg-[#121f17]/95 backdrop-blur-md rounded-2xl border border-[#DCE4D6] dark:border-[#233d2e] shadow-lg flex flex-wrap items-center justify-between gap-2.5 print:hidden">
            <div className="flex items-center gap-2 flex-1 sm:flex-initial">
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 sm:flex-initial py-2.5 px-4 bg-[#08482D] hover:bg-[#0c5c3b] text-white text-xs font-heading font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-[#DAE7C7]" />
                <span>Print Pass</span>
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 sm:flex-initial py-2.5 px-4 bg-white dark:bg-[#1b2b22] border border-[#DCE4D6] dark:border-[#233d2e] hover:bg-[#E8F0DF] text-[#08482D] dark:text-[#DAE7C7] text-xs font-heading font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Pass</span>
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {!workshop.onlineMode && (
                <a
                  href={gpsMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 bg-[#F5F8EF] dark:bg-[#1b2b22] hover:bg-[#E8F0DF] text-[#08482D] dark:text-[#DAE7C7] border border-[#DCE4D6] dark:border-[#233d2e] text-xs font-heading font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#08482D]" />
                  <span>GPS Directions</span>
                </a>
              )}
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 bg-transparent hover:bg-black/5 dark:hover:bg-white/10 text-[#5E5E61] dark:text-[#8ba895] text-xs font-heading font-bold rounded-xl transition-colors cursor-pointer"
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
