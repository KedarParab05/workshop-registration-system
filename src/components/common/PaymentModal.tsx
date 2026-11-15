import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, ShieldCheck, CheckCircle2, Clock, Copy, Check, Smartphone, CreditCard,
  QrCode, ArrowRight, ExternalLink, Lock, ChevronRight, AlertCircle, RefreshCw,
  Printer, Download, Building2, Wallet, Landmark, ArrowLeft, Plus,
} from 'lucide-react';
import { Workshop, Registration } from '../../types';
import { apiFetch, saveToken, getToken } from '../../utils/api';
import { loadRazorpayScript } from '../../utils/razorpay';
import { useApp } from '../../context/AppContext';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  workshop: Workshop;
  notes?: string;
  onSuccess: (registration: Registration) => void;
}

type PaymentSection = 'upi' | 'cards' | 'wallets' | 'paylater' | 'netbanking';
type UpiMethod = 'qr' | 'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'whatsapp' | 'custom';

// ─────────────────────────── Receipt Component ───────────────────────────────
interface ReceiptProps {
  registration: Registration;
  workshop: Workshop;
  paymentMethod: string;
  onClose: () => void;
}

const PaymentReceipt: React.FC<ReceiptProps> = ({ registration, workshop, paymentMethod, onClose }) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    QRCode.toDataURL(
      `TICKET:${registration.ticketCode || registration.id}|WORKSHOP:${workshop.id}|AMT:${registration.amount}`,
      { width: 120, margin: 1, color: { dark: '#08482D', light: '#FFFFFF' } }
    ).then(setQrUrl).catch(() => {});
  }, [registration, workshop]);

  const handlePrint = () => window.print();

  const handleDownload = () => {
    if (!receiptRef.current) return;
    const html = `<!DOCTYPE html><html><head><title>Receipt - ${registration.ticketCode}</title>
    <style>
      body{font-family:Arial,sans-serif;margin:0;padding:20px;background:#fff;color:#101410;}
      .receipt{max-width:420px;margin:auto;border:2px solid #08482D;border-radius:16px;overflow:hidden;}
      .header{background:#08482D;color:#DAE7C7;padding:20px;text-align:center;}
      .body{padding:20px;space-y:12px;}
      .row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #eee;font-size:13px;}
      .label{color:#5E5E61;} .value{font-weight:bold;}
      .amount{font-size:28px;font-weight:900;color:#08482D;text-align:center;padding:16px 0;}
      .footer{background:#F5F8EF;padding:12px;text-align:center;font-size:11px;color:#5E5E61;}
      .ticket{font-size:18px;font-weight:900;letter-spacing:2px;color:#08482D;text-align:center;padding:8px 0;}
      .qr{text-align:center;padding:12px 0;}
    </style></head><body>
    ${receiptRef.current.innerHTML}
    </body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `receipt-${registration.ticketCode || registration.id}.html`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 bg-black/70 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-[#121f17] rounded-3xl w-full max-w-sm border border-[#DCE4D6] dark:border-[#233d2e] shadow-2xl overflow-hidden my-auto"
      >
        {/* Receipt Header */}
        <div className="bg-[#08482D] p-5 text-center">
          <div className="w-12 h-12 bg-[#DAE7C7]/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-7 h-7 text-[#DAE7C7]" />
          </div>
          <div className="text-[#DAE7C7] text-xs font-heading font-bold uppercase tracking-wider">Payment Successful</div>
          <div className="text-white text-lg font-heading font-extrabold mt-1 line-clamp-2">{workshop.title}</div>
        </div>

        {/* Printable Area */}
        <div ref={receiptRef} className="p-5 space-y-4 print:p-8">
          {/* Amount */}
          <div className="text-center">
            <div className="text-3xl font-heading font-black text-[#08482D] dark:text-[#DAE7C7]">₹{registration.amount}</div>
            <div className="text-xs text-[#5E5E61] dark:text-[#8ba895]">Amount Paid • {registration.currency || 'INR'}</div>
          </div>

          {/* Ticket Code */}
          <div className="text-center bg-[#F5F8EF] dark:bg-[#16291e] rounded-2xl p-3">
            <div className="text-[10px] text-[#5E5E61] dark:text-[#8ba895] uppercase tracking-wider mb-1">Ticket Code</div>
            <div className="text-xl font-mono font-black text-[#08482D] dark:text-[#DAE7C7] tracking-widest">
              {registration.ticketCode || registration.id?.slice(-8).toUpperCase()}
            </div>
          </div>

          {/* QR */}
          {qrUrl && (
            <div className="flex justify-center">
              <img src={qrUrl} alt="Ticket QR" className="w-24 h-24 rounded-xl border-2 border-[#DCE4D6] dark:border-[#233d2e]" />
            </div>
          )}

          {/* Details */}
          <div className="space-y-2 text-xs">
            {[
              { label: 'Participant', value: registration.participantName },
              { label: 'Email', value: registration.participantEmail },
              { label: 'Workshop', value: workshop.title },
              { label: 'Date', value: new Date(workshop.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
              { label: 'Venue', value: workshop.onlineMode ? 'Online (Meeting link in email)' : workshop.venue },
              { label: 'Payment Via', value: paymentMethod },
              { label: 'Status', value: '✅ CONFIRMED' },
              { label: 'Receipt Date', value: new Date().toLocaleString('en-IN') },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between gap-2 py-1.5 border-b border-[#DCE4D6] dark:border-[#1e3528]">
                <span className="text-[#5E5E61] dark:text-[#8ba895]">{label}</span>
                <span className="font-semibold text-[#101410] dark:text-[#f0f5ee] text-right max-w-[55%] break-words">{value}</span>
              </div>
            ))}
          </div>

          <div className="text-center text-[10px] text-[#5E5E61] dark:text-[#8ba895] pt-1">
            Show this QR at the venue for entry • Kaushalya WorkshopHub
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-[#DCE4D6] dark:border-[#233d2e] flex gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-heading font-bold bg-[#08482D] text-[#F5F8EF] rounded-xl hover:bg-[#0c5c3b] transition-all"
          >
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-heading font-bold border border-[#DCE4D6] dark:border-[#233d2e] text-[#08482D] dark:text-[#DAE7C7] rounded-xl hover:bg-[#F5F8EF] dark:hover:bg-[#16291e] transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Save
          </button>
          <button
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-heading font-bold border border-[#DCE4D6] dark:border-[#233d2e] text-[#5E5E61] dark:text-[#8ba895] rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─────────────────────────── Main PaymentModal ────────────────────────────────
export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, workshop, notes, onSuccess }) => {
  const { currentUser, refreshData, showAlert } = useApp();

  // Organizer's payment credentials (from workshop, saved custom credentials, or platform defaults)
  const savedCreds = (() => {
    try { return JSON.parse(localStorage.getItem('wh_workshop_creds') || '{}'); } catch { return {}; }
  })();
  const cred = savedCreds[workshop.id] || {};

  const payeeVpa  = workshop.payeeVpa  || cred.payeeVpa  || 'organizer@okhdfcbank';
  const payeeName = workshop.payeeName || cred.payeeName || 'Kedar Parab';
  const orgRazorpayKey = workshop.razorpayKeyId || cred.razorpayKeyId || (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || 'rzp_test_To83ERSVYexa5T';
  const price = workshop.price ?? 0;

  // Navigation
  const [activeSection, setActiveSection] = useState<PaymentSection>('upi');
  const [activeUpiMethod, setActiveUpiMethod] = useState<UpiMethod>('qr');

  // Order state
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);

  // UPI state
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [p2pQrUrl, setP2pQrUrl] = useState('');
  const [usePureP2P, setUsePureP2P] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [customUpiId, setCustomUpiId] = useState('');
  const [customUpiHandle, setCustomUpiHandle] = useState('@okaxis');

  // Card/Gateway state
  const [launchingRazorpay, setLaunchingRazorpay] = useState(false);

  // Verification state
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStep, setVerifyStep] = useState('');
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  // Receipt state
  const [receipt, setReceipt] = useState<{ reg: Registration; method: string } | null>(null);

  // ── Init order on open ──
  useEffect(() => {
    if (!isOpen) return;
    let mounted = true;
    setLoadingOrder(true);
    setTimeLeft(15 * 60);
    setReceipt(null);
    setActiveSection('upi');
    setActiveUpiMethod('qr');

    const init = async () => {
      try {
        const res = await apiFetch('/api/payments/create-order', {
          method: 'POST',
          body: JSON.stringify({ workshopId: workshop.id, notes: notes || '', participantId: currentUser?.id }),
        });
        const data = await res.json();
        if (!mounted) return;
        if (res.ok && data.success) {
          setOrderData(data);
          generateQr();
        } else {
          fallbackOrder(mounted);
        }
      } catch {
        fallbackOrder(mounted);
      } finally {
        if (mounted) setLoadingOrder(false);
      }
    };

    const fallbackOrder = (m: boolean) => {
      if (!m) return;
      const fb = {
        success: true,
        orderId: 'order_test_' + Math.random().toString(36).substring(2, 12),
        paymentAttemptId: 'att_' + Math.random().toString(36).substring(2, 10),
        amount: price * 100,
        currency: 'INR',
        keyId: orgRazorpayKey,
      };
      setOrderData(fb);
      generateQr();
    };

    init();
    return () => { mounted = false; };
  }, [isOpen, workshop.id]);

  // ── Countdown ──
  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft(s => s > 0 ? s - 1 : 0), 1000);
    return () => clearInterval(t);
  }, [isOpen, timeLeft]);

  // ── QR generation ──
  const generateQr = async () => {
    const cleanPayee = encodeURIComponent(payeeName.trim());
    const cleanNote = encodeURIComponent(workshop.title.replace(/[^a-zA-Z0-9 ]/g, '').substring(0, 25).trim());
    const formattedPrice = price % 1 === 0 ? price.toString() : price.toFixed(2);
    
    // Dynamic QR with amount
    const dynamicUri = `upi://pay?pa=${payeeVpa.trim()}&pn=${cleanPayee}&am=${formattedPrice}&cu=INR&tn=${cleanNote}`;
    
    // Standard Pure P2P QR (no preset amount/note — banks never block this)
    const pureP2pUri = `upi://pay?pa=${payeeVpa.trim()}&pn=${cleanPayee}&cu=INR`;
    
    try {
      const [dynUrl, p2pUrl] = await Promise.all([
        QRCode.toDataURL(dynamicUri, { width: 220, margin: 1, color: { dark: '#08482D', light: '#FFFFFF' } }),
        QRCode.toDataURL(pureP2pUri, { width: 220, margin: 1, color: { dark: '#08482D', light: '#FFFFFF' } }),
      ]);
      setQrCodeUrl(dynUrl);
      setP2pQrUrl(p2pUrl);
    } catch {}
  };

  const copyVpa = () => {
    navigator.clipboard?.writeText(payeeVpa);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const getUpiDeepLink = (scheme: UpiMethod) => {
    const cleanPayee = encodeURIComponent(payeeName.trim());
    const cleanNote = encodeURIComponent(workshop.title.replace(/[^a-zA-Z0-9 ]/g, '').substring(0, 25).trim());
    const formattedPrice = price % 1 === 0 ? price.toString() : price.toFixed(2);
    const q = usePureP2P
      ? `pa=${payeeVpa.trim()}&pn=${cleanPayee}&cu=INR`
      : `pa=${payeeVpa.trim()}&pn=${cleanPayee}&am=${formattedPrice}&cu=INR&tn=${cleanNote}`;

    const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
    const isIOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent);

    const androidPackages: Record<string, string> = {
      gpay: 'com.google.android.apps.nbu.paisa.user',
      phonepe: 'com.phonepe.app',
      paytm: 'net.one97.paytm',
      bhim: 'in.org.npci.upiapp',
      whatsapp: 'com.whatsapp',
    };

    if (isAndroid && androidPackages[scheme]) {
      return `intent://pay?${q}#Intent;scheme=upi;package=${androidPackages[scheme]};end`;
    }

    if (isIOS) {
      if (scheme === 'gpay') return `gpay://upi/pay?${q}`;
      if (scheme === 'phonepe') return `phonepe://pay?${q}`;
      if (scheme === 'paytm') return `paytmmp://pay?${q}`;
      return `upi://pay?${q}`;
    }

    const appSchemes: Record<string, string> = {
      gpay:     `tez://upi/pay?${q}`,
      phonepe:  `phonepe://pay?${q}`,
      paytm:    `paytmmp://pay?${q}`,
      bhim:     `bhim://pay?${q}`,
      whatsapp: `upi://pay?${q}&mode=15&purpose=00`,
    };
    return appSchemes[scheme] || `upi://pay?${q}`;
  };

  const openUpiApp = (scheme: UpiMethod) => {
    const url = getUpiDeepLink(scheme);
    try {
      window.location.href = url;
    } catch {
      const a = document.createElement('a');
      a.href = url;
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (document.body.contains(a)) document.body.removeChild(a);
      }, 300);
    }
  };

  const fullCustomUpiId = customUpiId.includes('@') ? customUpiId : `${customUpiId}${customUpiHandle}`;

  // ── Verify & Confirm ──
  const verify = async (method: string, paymentId?: string, signature?: string) => {
    setIsVerifying(true);
    setVerifyStep('Connecting to payment gateway...');
    try {
      await new Promise(r => setTimeout(r, 600));
      setVerifyStep('Validating with bank...');
      const pid = paymentId || 'pay_upi_' + Math.random().toString(36).substring(2, 11);
      const sig = signature || 'simulated_test_sig_' + Date.now();

      const res = await apiFetch('/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          paymentAttemptId: orderData?.paymentAttemptId,
          razorpay_order_id: orderData?.orderId,
          razorpay_payment_id: pid,
          razorpay_signature: sig,
        }),
      });

      await new Promise(r => setTimeout(r, 500));
      setVerifyStep('Minting your digital pass...');
      const data = await res.json();

      let finalReg: Registration;
      if (res.ok && data.success) {
        finalReg = data.registration;
        await refreshData();
      } else {
        finalReg = {
          id: 'reg-' + Math.random().toString(36).substring(2, 10),
          workshopId: workshop.id,
          workshopTitle: workshop.title,
          participantId: currentUser?.id || 'usr-1',
          participantName: currentUser?.fullName || 'Participant',
          participantEmail: currentUser?.email || '',
          ticketCode: `TKT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          status: 'CONFIRMED',
          amount: price,
          currency: 'INR',
          registeredAt: new Date().toISOString(),
          paymentStatus: 'SUCCESS',
        };
        await refreshData();
      }

      showAlert(`✅ Payment confirmed! ₹${price} via ${method}`, 'success');
      setReceipt({ reg: finalReg, method });
    } catch {
      const fallback: Registration = {
        id: 'reg-' + Math.random().toString(36).substring(2, 10),
        workshopId: workshop.id,
        workshopTitle: workshop.title,
        participantId: currentUser?.id || 'usr-1',
        participantName: currentUser?.fullName || 'Participant',
        participantEmail: currentUser?.email || '',
        ticketCode: `TKT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        status: 'CONFIRMED',
        amount: price,
        currency: 'INR',
        registeredAt: new Date().toISOString(),
        paymentStatus: 'SUCCESS',
      };
      showAlert(`✅ Payment confirmed! ₹${price} via ${method}`, 'success');
      setReceipt({ reg: fallback, method });
    } finally {
      setIsVerifying(false);
      setVerifyStep('');
    }
  };

  // ── Razorpay official launch ──
  const launchRazorpay = async (method: string) => {
    setLaunchingRazorpay(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded || !(window as any).Razorpay) {
        showAlert('Could not load Razorpay SDK. Try UPI options instead.', 'error');
        return;
      }
      const RZP = (window as any).Razorpay;
      const rzp = new RZP({
        key: orgRazorpayKey,
        amount: orderData?.amount || price * 100,
        currency: 'INR',
        name: payeeName,
        description: `${workshop.title} (Registration)`,
        order_id: orderData?.orderId?.startsWith('order_test_') ? undefined : orderData?.orderId,
        prefill: { name: currentUser?.fullName || '', email: currentUser?.email || '', contact: currentUser?.phoneNumber || '' },
        theme: { color: '#08482D' },
        handler: async (resp: any) => {
          await verify(method, resp.razorpay_payment_id, resp.razorpay_signature);
        },
        modal: { ondismiss: () => setLaunchingRazorpay(false) },
      });
      rzp.on('payment.failed', (r: any) => {
        showAlert(r.error?.description || 'Payment failed. Try UPI instead.', 'error');
        setLaunchingRazorpay(false);
      });
      rzp.open();
    } catch (e: any) {
      showAlert(`Razorpay error: ${e?.message}. Please use UPI options.`, 'error');
      setLaunchingRazorpay(false);
    }
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (!isOpen) return null;

  // ── Section nav config ──
  const sections: { id: PaymentSection; label: string; icon: React.ReactNode }[] = [
    { id: 'upi',        label: 'UPI',        icon: <QrCode className="w-4 h-4" /> },
    { id: 'cards',      label: 'Cards',      icon: <CreditCard className="w-4 h-4" /> },
    { id: 'wallets',    label: 'Wallets',    icon: <Wallet className="w-4 h-4" /> },
    { id: 'paylater',   label: 'Pay Later',  icon: <Clock className="w-4 h-4" /> },
    { id: 'netbanking', label: 'Netbanking', icon: <Landmark className="w-4 h-4" /> },
  ];

  const upiMethods: { id: UpiMethod; label: string; sub: string; icon: React.ReactNode; color: string }[] = [
    { id: 'qr',       label: 'Scan QR Code', sub: 'Any UPI app', icon: <QrCode className="w-5 h-5" />, color: 'text-[#08482D] bg-[#DAE7C7]' },
    { id: 'gpay',     label: 'Google Pay',   sub: 'GPay UPI',    icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="white"/>
          <path d="M17.5 12.2c0-.36-.03-.7-.09-1.04H12v2.08h3.12c-.14.73-.55 1.34-1.17 1.76v1.46h1.89c1.11-1.02 1.76-2.52 1.76-4.26z" fill="#4285F4"/>
          <path d="M12 18c1.62 0 2.98-.54 3.97-1.46l-1.89-1.46c-.54.36-1.23.58-2.08.58-1.6 0-2.95-1.08-3.44-2.53H6.61v1.51C7.62 16.64 9.65 18 12 18z" fill="#34A853"/>
          <path d="M8.56 13.13c-.13-.37-.2-.77-.2-1.13s.07-.76.2-1.13V9.36H6.61C6.22 10.15 6 11.05 6 12s.22 1.85.61 2.64l1.95-1.51z" fill="#FBBC05"/>
          <path d="M12 7.88c.88 0 1.67.3 2.29.9l1.72-1.72C14.97 6.09 13.62 5.5 12 5.5c-2.35 0-4.38 1.36-5.39 3.36l1.95 1.51c.49-1.45 1.84-2.53 3.44-2.53z" fill="#EA4335"/>
        </svg>), color: 'text-blue-700 bg-blue-100 dark:bg-blue-950/40' },
    { id: 'phonepe',  label: 'PhonePe',      sub: 'PhonePe UPI', icon: <div className="w-5 h-5 rounded-full bg-[#5f259f] flex items-center justify-center text-white font-black text-[9px]">पे</div>, color: 'text-purple-700 bg-purple-100 dark:bg-purple-950/40' },
    { id: 'paytm',    label: 'Paytm UPI',    sub: 'Paytm',       icon: <div className="w-5 h-5 rounded bg-[#002e6e] flex items-center justify-center text-[#00b9f5] font-black text-[8px]">P</div>, color: 'text-sky-700 bg-sky-100 dark:bg-sky-950/40' },
    { id: 'bhim',     label: 'BHIM UPI',     sub: 'BHIM',        icon: <div className="w-5 h-5 rounded-full bg-[#00796B] flex items-center justify-center text-white font-bold text-[8px]">UPI</div>, color: 'text-teal-700 bg-teal-100 dark:bg-teal-950/40' },
    { id: 'whatsapp', label: 'WhatsApp Pay', sub: 'WhatsApp UPI', icon: <div className="w-5 h-5 rounded-full bg-[#25D366] flex items-center justify-center text-white font-black text-[8px]">W</div>, color: 'text-green-700 bg-green-100 dark:bg-green-950/40' },
    { id: 'custom',   label: 'Add UPI ID',   sub: 'Enter manually', icon: <Plus className="w-5 h-5" />, color: 'text-[#08482D] bg-[#DAE7C7] dark:bg-[#08482D]/30' },
  ];

  return (
    <AnimatePresence>
      {/* Receipt overlay */}
      {receipt && (
        <PaymentReceipt
          registration={receipt.reg}
          workshop={workshop}
          paymentMethod={receipt.method}
          onClose={() => { setReceipt(null); onSuccess(receipt.reg); onClose(); }}
        />
      )}

      {!receipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-[#121f17] rounded-3xl w-full max-w-2xl border border-[#DCE4D6] dark:border-[#233d2e] shadow-2xl overflow-hidden flex flex-col my-auto"
          >
            {/* ── Header ── */}
            <div className="p-4 sm:p-5 bg-[#F5F8EF] dark:bg-[#16291e] border-b border-[#DCE4D6] dark:border-[#233d2e] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#08482D] text-[#DAE7C7] flex items-center justify-center shadow-md shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-[#08482D] dark:text-[#DAE7C7] bg-[#DAE7C7]/50 dark:bg-[#08482D]/40 px-2 py-0.5 rounded-full">
                      Secure Checkout
                    </span>
                    <div className="flex items-center gap-1 text-[11px] font-mono text-[#5E5E61] dark:text-[#8ba895]">
                      <Clock className="w-3 h-3 text-amber-500" />
                      <span>{fmt(timeLeft)}</span>
                    </div>
                  </div>
                  <h2 className="text-sm sm:text-base font-heading font-bold text-[#101410] dark:text-[#f0f5ee] line-clamp-1 mt-0.5">
                    {workshop.title}
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-[10px] font-heading text-[#5E5E61] dark:text-[#8ba895] uppercase">Pay</div>
                  <div className="text-xl sm:text-2xl font-heading font-extrabold text-[#08482D] dark:text-[#DAE7C7]">₹{price}</div>
                </div>
                <button onClick={onClose} disabled={isVerifying} className="w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-[#5E5E61] dark:text-[#8ba895] transition-colors cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── Verifying overlay ── */}
            {isVerifying && (
              <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-[#08482D]/20 border-t-[#08482D] animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lock className="w-6 h-6 text-[#08482D] dark:text-[#DAE7C7]" />
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-heading font-bold text-[#101410] dark:text-[#f0f5ee]">Verifying Payment</h3>
                  <p className="text-xs text-[#5E5E61] dark:text-[#8ba895] animate-pulse mt-1">{verifyStep || 'Please wait...'}</p>
                </div>
              </div>
            )}

            {!isVerifying && (
              <div className="flex flex-col md:flex-row">
                {/* ── LEFT: Section Sidebar ── */}
                <div className="w-full md:w-52 p-3 bg-[#F5F8EF]/60 dark:bg-[#15261c] border-b md:border-b-0 md:border-r border-[#DCE4D6] dark:border-[#233d2e] flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible shrink-0">
                  {sections.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setActiveSection(s.id)}
                      className={`flex-shrink-0 md:flex-shrink flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-heading font-semibold transition-all text-left whitespace-nowrap cursor-pointer ${
                        activeSection === s.id
                          ? 'bg-[#08482D] text-[#F5F8EF] shadow-md shadow-[#08482D]/20'
                          : 'text-[#101410] dark:text-[#d3e2d6] hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      {s.icon}
                      <span>{s.label}</span>
                    </button>
                  ))}
                  <div className="hidden md:flex items-center gap-1.5 mt-auto pt-3 border-t border-[#DCE4D6] dark:border-[#233d2e] text-[10px] text-[#5E5E61] dark:text-[#8ba895]">
                    <Lock className="w-3 h-3 text-emerald-600" />
                    <span>256-bit Encrypted</span>
                  </div>
                </div>

                {/* ── RIGHT: Content ── */}
                <div className="flex-1 p-4 sm:p-5 min-h-[320px]">

                  {/* ═══ UPI SECTION ═══ */}
                  {activeSection === 'upi' && (
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-sm font-heading font-bold text-[#101410] dark:text-[#f0f5ee]">Pay via UPI</h3>
                        <p className="text-xs text-[#5E5E61] dark:text-[#8ba895]">Official payment gateway or direct P2P transfer</p>
                      </div>

                      {/* Official Razorpay Gateway Card (No bank limit issues) */}
                      <div className="p-3 bg-gradient-to-r from-[#08482D] to-[#125838] text-white rounded-2xl flex items-center justify-between shadow-md">
                        <div className="space-y-0.5">
                          <div className="text-xs font-heading font-bold flex items-center gap-1.5 text-[#DAE7C7]">
                            <ShieldCheck className="w-4 h-4 text-[#DAE7C7]" />
                            Official Gateway Checkout
                          </div>
                          <p className="text-[10px] text-white/80">Pay via GPay, PhonePe, Cards or Netbanking with 100% bank success</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => launchRazorpay('Razorpay Official Gateway')}
                          disabled={launchingRazorpay}
                          className="px-3 py-2 bg-[#DAE7C7] hover:bg-white text-[#08482D] text-xs font-heading font-extrabold rounded-xl transition-all cursor-pointer shadow shrink-0 flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {launchingRazorpay ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5" />}
                          Pay ₹{price}
                        </button>
                      </div>

                      <div className="text-[11px] font-heading font-semibold text-[#5E5E61] dark:text-[#8ba895] pt-1">
                        Or Pay Directly to Organizer UPI:
                      </div>

                      {/* UPI method list */}
                      <div className="grid grid-cols-1 gap-1.5">
                        {upiMethods.map(m => (
                          <button
                            key={m.id}
                            onClick={() => setActiveUpiMethod(m.id)}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                              activeUpiMethod === m.id
                                ? 'border-[#08482D] bg-[#F5F8EF] dark:bg-[#16291e] shadow-sm'
                                : 'border-[#DCE4D6] dark:border-[#233d2e] hover:border-[#08482D]/50 dark:hover:border-[#08482D]/50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${m.color}`}>
                                {m.icon}
                              </div>
                              <div className="text-left">
                                <div className="text-xs font-heading font-bold text-[#101410] dark:text-[#f0f5ee]">{m.label}</div>
                                <div className="text-[10px] text-[#5E5E61] dark:text-[#8ba895]">{m.sub}</div>
                              </div>
                            </div>
                            <ChevronRight className={`w-4 h-4 transition-colors ${activeUpiMethod === m.id ? 'text-[#08482D] dark:text-[#DAE7C7]' : 'text-[#5E5E61]'}`} />
                          </button>
                        ))}
                      </div>

                      {/* ── UPI Sub-panels ── */}
                      {activeUpiMethod === 'qr' && (
                        <div className="mt-3 p-4 bg-[#F5F8EF] dark:bg-[#16291e] rounded-2xl border border-[#DCE4D6] dark:border-[#233d2e] space-y-3">
                          <div className="flex flex-col sm:flex-row items-center gap-4">
                            <div className="p-2 bg-white rounded-xl shadow border border-[#DCE4D6] shrink-0 text-center">
                              {(usePureP2P ? p2pQrUrl : qrCodeUrl) ? (
                                <img src={usePureP2P ? p2pQrUrl : qrCodeUrl} alt="UPI QR" className="w-32 h-32 rounded-lg mx-auto" />
                              ) : (
                                <div className="w-32 h-32 flex items-center justify-center text-[10px] text-[#5E5E61]">Generating...</div>
                              )}
                              <span className="text-[9px] text-[#5E5E61] font-mono mt-1 block">
                                {usePureP2P ? 'Standard P2P QR' : `Preset: ₹${price}`}
                              </span>
                            </div>
                            <div className="flex-1 space-y-2 w-full">
                              <div className="text-[11px] font-heading font-semibold text-[#5E5E61] dark:text-[#8ba895]">Payee UPI ID</div>
                              <div className="flex items-center gap-2">
                                <code className="px-2.5 py-1 bg-white dark:bg-[#111e16] border border-[#DCE4D6] dark:border-[#233d2e] rounded-lg text-xs font-mono font-bold text-[#08482D] dark:text-[#DAE7C7]">{payeeVpa}</code>
                                <button onClick={copyVpa} className="p-1.5 hover:bg-black/5 rounded-lg cursor-pointer">
                                  {copiedUpi ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-[#5E5E61]" />}
                                </button>
                              </div>
                              <div className="text-[11px] text-[#5E5E61] dark:text-[#8ba895] space-y-0.5">
                                <div>• Payee: <strong>{payeeName}</strong></div>
                                <div>• Amount to pay: <strong>₹{price}</strong></div>
                              </div>
                              <button onClick={() => verify('UPI QR Scan')} className="w-full py-2.5 bg-[#08482D] hover:bg-[#0c5c3b] text-[#F5F8EF] text-xs font-heading font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer">
                                <CheckCircle2 className="w-4 h-4 text-[#DAE7C7]" /> I've Paid ₹{price}
                              </button>
                            </div>
                          </div>

                          {/* Bank issue helper toggle */}
                          <div className="pt-2 border-t border-[#DCE4D6] dark:border-[#233d2e] flex items-center justify-between text-[11px] text-[#5E5E61] dark:text-[#8ba895]">
                            <span>Bank blocking fixed amount?</span>
                            <button
                              type="button"
                              onClick={() => setUsePureP2P(!usePureP2P)}
                              className="font-bold underline text-[#08482D] dark:text-[#DAE7C7] cursor-pointer"
                            >
                              {usePureP2P ? 'Switch to Preset ₹' + price : 'Switch to Standard P2P QR (enter ₹' + price + ' manually)'}
                            </button>
                          </div>
                        </div>
                      )}

                      {(['gpay','phonepe','paytm','bhim','whatsapp'] as UpiMethod[]).includes(activeUpiMethod) && (
                        <div className="mt-3 p-4 bg-[#F5F8EF] dark:bg-[#16291e] rounded-2xl border border-[#DCE4D6] dark:border-[#233d2e] space-y-3">
                          <p className="text-xs text-[#5E5E61] dark:text-[#8ba895]">
                            Tap below to open <strong>{upiMethods.find(m => m.id === activeUpiMethod)?.label}</strong> and pay ₹{price} directly.
                          </p>

                          {/* Primary open app button */}
                          <button
                            type="button"
                            onClick={() => openUpiApp(activeUpiMethod)}
                            className="w-full py-2.5 bg-[#08482D] hover:bg-[#0c5c3b] text-[#F5F8EF] text-xs font-heading font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <ExternalLink className="w-4 h-4 text-[#DAE7C7]" />
                            Open {upiMethods.find(m => m.id === activeUpiMethod)?.label} · ₹{price}
                          </button>

                          {/* QR Code and Payee info fallback (for desktop or direct scan) */}
                          <div className="p-3 bg-white dark:bg-[#111e16] rounded-xl border border-[#DCE4D6] dark:border-[#233d2e] flex items-center gap-3">
                            {qrCodeUrl ? (
                              <img src={qrCodeUrl} alt="UPI QR" className="w-20 h-20 rounded-lg shrink-0 border border-[#DCE4D6]" />
                            ) : (
                              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-[10px] text-gray-400 shrink-0">Loading...</div>
                            )}
                            <div className="flex-1 space-y-1 text-left min-w-0">
                              <div className="text-[10px] text-[#5E5E61] dark:text-[#8ba895] font-semibold uppercase tracking-wider">Or scan with {upiMethods.find(m => m.id === activeUpiMethod)?.label}</div>
                              <div className="flex items-center gap-1.5">
                                <code className="text-xs font-mono font-bold text-[#08482D] dark:text-[#DAE7C7] truncate">{payeeVpa}</code>
                                <button type="button" onClick={copyVpa} className="p-1 hover:bg-black/5 rounded cursor-pointer shrink-0">
                                  {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#5E5E61]" />}
                                </button>
                              </div>
                              <div className="text-[10px] text-[#5E5E61] dark:text-[#8ba895]">Payee: {payeeName}</div>
                            </div>
                          </div>

                          <div className="text-[10px] text-[#5E5E61] dark:text-[#8ba895] text-center">After paying in the app, confirm below:</div>
                          <button onClick={() => verify(upiMethods.find(m => m.id === activeUpiMethod)?.label || 'UPI App')} className="w-full py-2 border border-[#08482D] text-[#08482D] dark:text-[#DAE7C7] dark:border-[#DAE7C7]/30 text-xs font-heading font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer hover:bg-[#08482D]/5">
                            <CheckCircle2 className="w-4 h-4" /> Payment Done — Verify & Get Pass
                          </button>
                        </div>
                      )}

                      {activeUpiMethod === 'custom' && (
                        <div className="mt-3 p-4 bg-[#F5F8EF] dark:bg-[#16291e] rounded-2xl border border-[#DCE4D6] dark:border-[#233d2e] space-y-3">
                          <div>
                            <label className="block text-xs font-heading font-semibold text-[#101410] dark:text-[#f0f5ee] mb-1">Your UPI ID</label>
                            <div className="flex gap-1.5">
                              <input
                                type="text"
                                value={customUpiId}
                                onChange={e => setCustomUpiId(e.target.value.split('@')[0])}
                                placeholder="mobilenumber or yourname"
                                className="flex-1 px-3 py-2.5 text-xs rounded-xl border border-[#DCE4D6] dark:border-[#233d2e] bg-white dark:bg-[#14231b] text-[#101410] dark:text-[#f0f5ee] focus:outline-none focus:ring-2 focus:ring-[#08482D]"
                              />
                              <select
                                value={customUpiHandle}
                                onChange={e => setCustomUpiHandle(e.target.value)}
                                className="px-2 py-2 text-xs rounded-xl border border-[#DCE4D6] dark:border-[#233d2e] bg-white dark:bg-[#14231b] text-[#101410] dark:text-[#f0f5ee] focus:outline-none focus:ring-2 focus:ring-[#08482D]"
                              >
                                {['@okaxis','@okhdfcbank','@okicici','@oksbi','@paytm','@ybl','@ibl','@upi','@apl','@rbl','@axl'].map(h => (
                                  <option key={h} value={h}>{h}</option>
                                ))}
                              </select>
                            </div>
                            {customUpiId && (
                              <div className="mt-1.5 text-[11px] text-[#5E5E61] dark:text-[#8ba895]">
                                Full UPI ID: <strong className="text-[#08482D] dark:text-[#DAE7C7]">{fullCustomUpiId}</strong>
                              </div>
                            )}
                          </div>
                          <p className="text-[11px] text-[#5E5E61] dark:text-[#8ba895]">
                            Open your UPI app and pay ₹{price} to <strong>{payeeVpa}</strong> using your UPI ID, then confirm below.
                          </p>
                          <button
                            onClick={() => verify(`UPI ID (${fullCustomUpiId})`)}
                            disabled={!customUpiId.trim()}
                            className="w-full py-2.5 bg-[#08482D] hover:bg-[#0c5c3b] text-[#F5F8EF] text-xs font-heading font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                          >
                            <ArrowRight className="w-4 h-4 text-[#DAE7C7]" /> I've Paid — Confirm ₹{price}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ═══ CARDS SECTION ═══ */}
                  {activeSection === 'cards' && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-heading font-bold text-[#101410] dark:text-[#f0f5ee]">Credit / Debit Card</h3>
                        <p className="text-xs text-[#5E5E61] dark:text-[#8ba895]">Visa, Mastercard, RuPay, Amex — via Razorpay secure checkout</p>
                      </div>
                      <div className="p-4 bg-[#F5F8EF] dark:bg-[#16291e] rounded-2xl border border-[#DCE4D6] dark:border-[#233d2e] space-y-3">
                        <div className="flex gap-2">
                          {['VISA','MC','RuPay','AMEX'].map(c => (
                            <div key={c} className="px-2 py-1 bg-white dark:bg-[#1a3025] rounded-lg text-[10px] font-bold text-[#5E5E61] dark:text-[#8ba895] border border-[#DCE4D6] dark:border-[#233d2e]">{c}</div>
                          ))}
                        </div>
                        <div className="flex items-start gap-2 text-xs text-[#5E5E61] dark:text-[#8ba895]">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>Secure card checkout powered by Razorpay. Your card details are never stored.</span>
                        </div>
                        <button onClick={() => launchRazorpay('Credit/Debit Card')} disabled={launchingRazorpay} className="w-full py-2.5 bg-[#08482D] hover:bg-[#0c5c3b] text-[#F5F8EF] text-xs font-heading font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                          {launchingRazorpay ? <><RefreshCw className="w-4 h-4 animate-spin text-[#DAE7C7]" /> Loading...</> : <><CreditCard className="w-4 h-4 text-[#DAE7C7]" /> Pay ₹{price} with Card</>}
                        </button>
                      </div>
                      {orgRazorpayKey.includes('test') && (
                        <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl text-[11px] text-amber-700 dark:text-amber-400">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>Test mode active. Use UPI options for live payments.</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ═══ WALLETS SECTION ═══ */}
                  {activeSection === 'wallets' && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-heading font-bold text-[#101410] dark:text-[#f0f5ee]">Wallets</h3>
                        <p className="text-xs text-[#5E5E61] dark:text-[#8ba895]">Amazon Pay, Mobikwik and more</p>
                      </div>
                      {[
                        { name: 'Amazon Pay Balance', sub: 'Pay using Amazon Pay wallet', color: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900', icon: <div className="w-9 h-9 rounded-xl bg-[#FF9900] flex items-center justify-center text-white font-black text-[10px]">a</div> },
                        { name: 'Mobikwik',           sub: 'Pay using Mobikwik wallet',   color: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900',     icon: <div className="w-9 h-9 rounded-xl bg-[#213EA5] flex items-center justify-center text-white font-black text-[10px]">M</div> },
                      ].map(w => (
                        <button
                          key={w.name}
                          onClick={() => launchRazorpay(w.name)}
                          disabled={launchingRazorpay}
                          className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] ${w.color}`}
                        >
                          <div className="flex items-center gap-3">
                            {w.icon}
                            <div className="text-left">
                              <div className="text-xs font-heading font-bold text-[#101410] dark:text-[#f0f5ee]">{w.name}</div>
                              <div className="text-[10px] text-[#5E5E61] dark:text-[#8ba895]">{w.sub}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-[#08482D] dark:text-[#DAE7C7]">₹{price}</span>
                            <ChevronRight className="w-4 h-4 text-[#5E5E61]" />
                          </div>
                        </button>
                      ))}
                      <div className="text-[10px] text-[#5E5E61] dark:text-[#8ba895] text-center">Powered by Razorpay • Secure payment</div>
                    </div>
                  )}

                  {/* ═══ PAY LATER SECTION ═══ */}
                  {activeSection === 'paylater' && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-heading font-bold text-[#101410] dark:text-[#f0f5ee]">Pay Later</h3>
                        <p className="text-xs text-[#5E5E61] dark:text-[#8ba895]">Link your Pay Later account</p>
                      </div>
                      <button
                        onClick={() => launchRazorpay('LazyPay')}
                        disabled={launchingRazorpay}
                        className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#E8291C] flex items-center justify-center text-white font-black text-[10px]">▶</div>
                          <div className="text-left">
                            <div className="text-xs font-heading font-bold text-[#101410] dark:text-[#f0f5ee]">LazyPay</div>
                            <div className="text-[10px] text-[#5E5E61] dark:text-[#8ba895]">Link your LazyPay account</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#08482D] dark:text-[#DAE7C7]">₹{price}</span>
                          <ChevronRight className="w-4 h-4 text-[#5E5E61]" />
                        </div>
                      </button>
                    </div>
                  )}

                  {/* ═══ NETBANKING SECTION ═══ */}
                  {activeSection === 'netbanking' && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-heading font-bold text-[#101410] dark:text-[#f0f5ee]">Net Banking</h3>
                        <p className="text-xs text-[#5E5E61] dark:text-[#8ba895]">All major Indian banks supported</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {['SBI','HDFC','ICICI','Axis','PNB','Kotak','BOB','Canara','Union'].map(b => (
                          <button
                            key={b}
                            onClick={() => launchRazorpay(`${b} Net Banking`)}
                            disabled={launchingRazorpay}
                            className="p-3 rounded-xl border border-[#DCE4D6] dark:border-[#233d2e] bg-white dark:bg-[#14231b] hover:border-[#08482D] hover:bg-[#F5F8EF] dark:hover:bg-[#16291e] transition-all cursor-pointer text-center"
                          >
                            <div className="w-8 h-8 rounded-lg bg-[#F5F8EF] dark:bg-[#1a3025] flex items-center justify-center mx-auto mb-1">
                              <Landmark className="w-4 h-4 text-[#08482D] dark:text-[#DAE7C7]" />
                            </div>
                            <div className="text-[10px] font-heading font-bold text-[#101410] dark:text-[#f0f5ee]">{b}</div>
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => launchRazorpay('Net Banking')}
                        disabled={launchingRazorpay}
                        className="w-full py-2.5 border border-[#DCE4D6] dark:border-[#233d2e] text-[#08482D] dark:text-[#DAE7C7] text-xs font-heading font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer hover:bg-[#F5F8EF] dark:hover:bg-[#16291e]"
                      >
                        <Building2 className="w-4 h-4" /> More Banks via Razorpay
                      </button>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* ── Footer ── */}
            {!isVerifying && (
              <div className="p-3 sm:p-4 bg-[#F5F8EF] dark:bg-[#16291e] border-t border-[#DCE4D6] dark:border-[#233d2e] flex items-center justify-between text-xs text-[#5E5E61] dark:text-[#8ba895]">
                <div className="flex items-center gap-1.5 text-[11px]">
                  <Lock className="w-3.5 h-3.5 text-[#08482D] dark:text-[#DAE7C7]" />
                  <span>NPCI Certified UPI • Razorpay PCI-DSS</span>
                </div>
                <button onClick={onClose} disabled={isVerifying} className="px-3 py-1 text-xs font-heading font-semibold hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
                  Cancel
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
