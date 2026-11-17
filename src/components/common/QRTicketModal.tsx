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
  AlertTriangle,
  CheckCircle2,
  GraduationCap,
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
    if (c.includes('web')) return 'Design. Build. Deliver.';
    if (c.includes('ai') || c.includes('machine') || c.includes('deep')) return 'Train. Predict. Innovate.';
    if (c.includes('cloud') || c.includes('devops') || c.includes('infrastructure')) return 'Automate. Scale. Deliver.';
    if (c.includes('cyber') || c.includes('security')) return 'Defend. Audit. Secure.';
    if (c.includes('data') || c.includes('algorithm')) return 'Analyze. Optimize. Solve.';
    if (c.includes('software') || c.includes('architecture')) return 'Design. Structure. Elevate.';
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
        dark: '#101D32',
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

  // Generate self-contained downloadable HTML matching Neo-Brutalist format
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
      background: #FFF5E9;
      color: #101D32;
      padding: 40px 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .ticket-container {
      width: 820px;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 8px 8px 0px 0px #101D32;
      display: flex;
      position: relative;
      overflow: hidden;
      border: 2px solid #101D32;
    }
    .main-pass {
      flex: 1;
      padding: 32px 36px;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .badge-corner {
      position: absolute;
      top: 0;
      right: 0;
      background: #F4511E;
      color: #ffffff;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      padding: 8px 24px;
      border-bottom-left-radius: 12px;
      border-bottom: 2px solid #101D32;
      border-left: 2px solid #101D32;
    }
    .brand-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
    }
    .brand-logo-sq {
      width: 32px;
      height: 32px;
      background: #F4511E;
      border: 2px solid #101D32;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 900;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 900;
      color: #101D32;
      line-height: 1.1;
      letter-spacing: -0.5px;
    }
    .brand-sub {
      font-size: 10px;
      color: #101D32;
      letter-spacing: 1px;
      text-transform: uppercase;
      font-weight: 700;
      opacity: 0.7;
    }
    .ws-title {
      font-size: 26px;
      font-weight: 900;
      color: #101D32;
      line-height: 1.2;
      margin-bottom: 4px;
      letter-spacing: -0.5px;
      max-width: 82%;
    }
    .ws-tagline {
      font-size: 13px;
      font-style: italic;
      color: #F4511E;
      font-weight: 700;
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
      border-radius: 6px;
      background: #FFD6B0;
      border: 2px solid #101D32;
      color: #101D32;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      flex-shrink: 0;
      font-weight: bold;
    }
    .info-label {
      font-weight: 800;
      color: #101D32;
    }
    .attendee-box {
      background: #FFF5E9;
      border: 2px solid #101D32;
      border-radius: 12px;
      padding: 14px 18px;
      margin-bottom: 18px;
      box-shadow: 3px 3px 0px 0px #101D32;
      max-width: 420px;
    }
    .attendee-label {
      font-size: 11px;
      color: #101D32;
      opacity: 0.8;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .attendee-name {
      font-size: 18px;
      font-weight: 900;
      color: #101D32;
      margin: 2px 0;
    }
    .attendee-id {
      font-size: 12px;
      color: #F4511E;
      font-weight: 800;
      font-family: monospace;
    }
    .main-footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .happy-learning {
      font-size: 16px;
      font-weight: 900;
      color: #F4511E;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .perforation {
      width: 0;
      border-right: 2px dashed #101D32;
      position: relative;
    }
    .cutout-top {
      position: absolute;
      top: -14px;
      left: -14px;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #FFF5E9;
      border: 2px solid #101D32;
    }
    .cutout-bottom {
      position: absolute;
      bottom: -14px;
      left: -14px;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #FFF5E9;
      border: 2px solid #101D32;
    }
    .ticket-stub {
      width: 260px;
      background: #FFF5E9;
      padding: 28px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      text-align: center;
    }
    .ticket-id-pill {
      background: #101D32;
      color: #ffffff;
      border: 2px solid #101D32;
      border-radius: 8px;
      padding: 8px 14px;
      width: 100%;
      box-shadow: 2px 2px 0px 0px rgba(0,0,0,0.2);
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
      border: 2px solid #101D32;
      border-radius: 12px;
      padding: 10px;
      margin: 14px 0;
      box-shadow: 4px 4px 0px 0px #101D32;
    }
    .qr-frame img {
      width: 140px;
      height: 140px;
      display: block;
    }
    .scan-title {
      font-size: 13px;
      font-weight: 900;
      color: #101D32;
      text-transform: uppercase;
    }
    .scan-sub {
      font-size: 11px;
      color: #101D32;
      opacity: 0.7;
      margin-top: 2px;
    }
    .stub-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 14px;
    }
    .stub-brand-text {
      font-size: 13px;
      font-weight: 900;
      color: #101D32;
      text-align: left;
    }
    .stub-brand-sub {
      font-size: 8px;
      color: #101D32;
      opacity: 0.7;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    @media print {
      body { background: #ffffff; padding: 0; }
      .ticket-container { box-shadow: none; border: 2px solid #101D32; }
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
          <div class="brand-logo-sq">K</div>
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
        <div class="brand-logo-sq" style="width: 24px; height: 24px; font-size: 11px;">K</div>
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
          className="fixed inset-0 bg-[#101D32]/70 backdrop-blur-sm print:hidden"
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
            className="absolute -top-11 right-0 sm:right-2 p-2 rounded-lg text-white hover:bg-white/20 transition-colors print:hidden cursor-pointer flex items-center gap-1.5 text-xs font-heading font-bold"
            aria-label="Close pass"
          >
            <span>Close</span>
            <X className="w-4 h-4" />
          </button>

          {/* Status Alert if Cancelled or Attended */}
          {(isCancelled || isAttended) && (
            <div className="mb-3 print:hidden">
              {isCancelled ? (
                <div className="flex items-center gap-2.5 p-3 bg-[#FFD6B0] border-2 border-[#101D32] rounded-xl text-xs text-[#101D32] shadow-[4px_4px_0px_0px_#101D32] font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-[#E84316]" />
                  <span><strong>Registration Cancelled:</strong> This pass has been relinquished and is no longer valid.</span>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 p-3 bg-[#FFF5E9] border-2 border-[#101D32] rounded-xl text-xs text-[#101D32] shadow-[4px_4px_0px_0px_#101D32] font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#F4511E]" />
                  <span><strong>Ticket Verified:</strong> Check-in was confirmed at gate reception.</span>
                </div>
              )}
            </div>
          )}

          {/* ═════════════════ AUTHENTIC PHYSICAL PASS CONTAINER ═════════════════ */}
          <div
            ref={ticketRef}
            className="relative bg-white rounded-2xl shadow-[8px_8px_0px_0px_#101D32] border-2 border-[#101D32] overflow-hidden flex flex-col md:flex-row print:shadow-none print:border-2 print:border-[#101D32] print:rounded-none"
          >
            {/* ── LEFT: Main Pass Section ── */}
            <div className="flex-1 p-6 sm:p-8 relative flex flex-col justify-between overflow-hidden">
              {/* Top-Right Angled Badge */}
              <div className="absolute top-0 right-0 overflow-hidden pointer-events-none">
                <div className="bg-[#F4511E] text-white text-[11px] font-heading font-extrabold uppercase tracking-wider py-1.5 px-6 rounded-bl-xl border-b-2 border-l-2 border-[#101D32]">
                  Workshop Pass
                </div>
              </div>

              {/* Top: Brand Header */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-md bg-[#F4511E] border-2 border-[#101D32] flex items-center justify-center text-white shrink-0 shadow-[2px_2px_0px_0px_#101D32]">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm sm:text-base font-heading font-black text-[#101D32] tracking-tight leading-none">
                      Kaushalya • WorkshopHub
                    </div>
                    <div className="text-[9px] font-heading font-bold text-[#101D32]/70 uppercase tracking-wider mt-0.5">
                      Learn • Build • Grow
                    </div>
                  </div>
                </div>

                {/* Title Row */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-[#101D32] tracking-tight leading-tight pr-4">
                      {workshop.title}
                    </h1>
                    <div className="text-xs sm:text-sm italic font-heading font-bold text-[#F4511E] mt-1">
                      {tagline}
                    </div>
                  </div>
                </div>

                {/* Logistics List (Date, Time, Venue) */}
                <div className="space-y-2.5 text-xs text-[#101D32] mb-5 font-sans">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-md bg-[#FFD6B0] border-2 border-[#101D32] text-[#101D32] flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#101D32]">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-heading font-bold text-[#101D32]">Date:</span>{' '}
                      <span className="text-[#101D32]/90 font-medium">{formattedDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-md bg-[#FFD6B0] border-2 border-[#101D32] text-[#101D32] flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#101D32]">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-heading font-bold text-[#101D32]">Time:</span>{' '}
                      <span className="text-[#101D32]/90 font-medium">{workshop.startTime} – {workshop.endTime}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-md bg-[#FFD6B0] border-2 border-[#101D32] text-[#101D32] flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#101D32]">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <span className="font-heading font-bold text-[#101D32]">Venue:</span>{' '}
                      <span className="text-[#101D32]/90 font-medium">
                        {workshop.onlineMode ? 'Online Studio / Webcast' : workshop.venue}
                        {workshop.venueAddress && !workshop.onlineMode && ` (${workshop.venueAddress})`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Neo-Brutalist Attendee Info Card */}
                <div className="bg-[#FFF5E9] border-2 border-[#101D32] rounded-xl p-3.5 sm:p-4 max-w-md shadow-[4px_4px_0px_0px_#101D32]">
                  <div className="text-[10px] uppercase font-heading font-bold text-[#101D32]/70 tracking-wider">
                    Attendee Name:
                  </div>
                  <div className="text-base sm:text-lg font-heading font-extrabold text-[#101D32] mt-0.5">
                    {registration.participantName}
                  </div>
                  <div className="text-xs font-mono font-bold text-[#F4511E] mt-1 flex items-center gap-2">
                    <span>Registration ID: {ticketCode}</span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="p-1 hover:bg-[#FFD6B0] border border-[#101D32] rounded cursor-pointer print:hidden transition-colors"
                      title="Copy ID"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-[#101D32]" /> : <Copy className="w-3.5 h-3.5 text-[#101D32]" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="mt-4 pt-2 flex items-end justify-between relative">
                <div className="text-sm sm:text-base font-heading font-extrabold uppercase tracking-wider text-[#F4511E]">
                  Happy Learning!
                </div>
              </div>
            </div>

            {/* ── Perforation Divider with Half-Circle Cutouts ── */}
            <div className="relative flex md:flex-col items-center justify-center">
              {/* Dashed line */}
              <div className="w-full md:w-0 md:h-full border-t-2 md:border-t-0 md:border-r-2 border-dashed border-[#101D32]" />
              {/* Top Notch Cutout */}
              <div className="hidden md:block absolute -top-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-[#101D32] border-2 border-[#101D32] z-20 pointer-events-none print:hidden" />
              {/* Bottom Notch Cutout */}
              <div className="hidden md:block absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-[#101D32] border-2 border-[#101D32] z-20 pointer-events-none print:hidden" />
            </div>

            {/* ── RIGHT: Tear-off Stub Section ── */}
            <div className="w-full md:w-64 bg-[#FFF5E9] p-6 sm:p-7 flex flex-col items-center justify-between text-center border-t md:border-t-0 border-[#101D32]">
              {/* Ticket ID Pill */}
              <div className="w-full bg-[#101D32] text-white rounded-lg py-2 px-3 border-2 border-[#101D32] shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
                <div className="text-[10px] font-heading font-bold uppercase tracking-wider text-[#FFD6B0]">
                  Ticket ID
                </div>
                <div className="text-xs sm:text-sm font-mono font-black tracking-widest text-white mt-0.5">
                  {ticketCode}
                </div>
              </div>

              {/* Centered QR Code */}
              <div className="my-4 p-2.5 bg-white rounded-xl shadow-[4px_4px_0px_0px_#101D32] border-2 border-[#101D32]">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR Pass ${ticketCode}`}
                    className="w-36 h-36 sm:w-40 sm:h-40 object-contain mx-auto"
                  />
                ) : (
                  <div className="w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center text-[10px] text-[#101D32]">
                    Generating pass...
                  </div>
                )}
              </div>

              {/* Scan at Entry instructions */}
              <div className="mb-2">
                <div className="text-xs font-heading font-black text-[#101D32] uppercase tracking-wide">
                  Scan at Entry
                </div>
                <div className="text-[10px] text-[#101D32]/70 font-medium mt-0.5">
                  Show this QR code for verification
                </div>
              </div>

              {/* Bottom Brand Stamp */}
              <div className="pt-3 border-t-2 border-[#101D32]/20 w-full flex items-center justify-center gap-2">
                <div className="w-5 h-5 rounded bg-[#F4511E] border border-[#101D32] flex items-center justify-center text-white shrink-0">
                  <GraduationCap className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-[11px] font-heading font-black text-[#101D32] leading-tight">
                    Kaushalya
                  </div>
                  <div className="text-[8px] font-heading font-bold text-[#101D32]/70 uppercase tracking-wider">
                    Learn • Build • Grow
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ═════════════════ ACTION TOOLBAR ═════════════════ */}
          <div className="mt-4 p-3 bg-[#FFF5E9] rounded-xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] flex flex-wrap items-center justify-between gap-2.5 print:hidden">
            <div className="flex items-center gap-2 flex-1 sm:flex-initial">
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 sm:flex-initial py-2.5 px-4 bg-[#F4511E] hover:bg-[#E84316] text-white text-xs font-heading font-bold rounded-lg border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#101D32] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-white" />
                <span>Print Pass</span>
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 sm:flex-initial py-2.5 px-4 bg-white hover:bg-[#FFD6B0] text-[#101D32] text-xs font-heading font-bold rounded-lg border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#101D32] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
                  className="py-2.5 px-3 bg-white hover:bg-[#FFD6B0] text-[#101D32] border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] text-xs font-heading font-bold rounded-lg transition-all flex items-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#F4511E]" />
                  <span>GPS Directions</span>
                </a>
              )}
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 bg-transparent hover:bg-[#101D32]/10 text-[#101D32] text-xs font-heading font-bold rounded-lg border-2 border-transparent hover:border-[#101D32] transition-colors cursor-pointer"
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
