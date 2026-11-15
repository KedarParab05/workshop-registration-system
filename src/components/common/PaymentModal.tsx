import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ShieldCheck,
  Clock,
  Lock,
  RefreshCw,
  AlertCircle,
  CreditCard,
  Building2,
  Smartphone,
  Wallet,
  CheckCircle2,
  Calendar,
  MapPin,
  User as UserIcon,
  ArrowRight,
} from 'lucide-react';
import { Workshop, Registration } from '../../types';
import { apiFetch, saveToken, getToken } from '../../utils/api';
import { loadRazorpayScript } from '../../utils/razorpay';
import { useApp } from '../../context/AppContext';
import { PaymentReceipt } from './PaymentReceipt';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  workshop: Workshop;
  notes?: string;
  onSuccess: (registration: Registration) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  workshop,
  notes,
  onSuccess,
}) => {
  const { currentUser, refreshData, showAlert } = useApp();
  const price = workshop.price ?? 0;

  // Order state
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Gateway launch & verification state
  const [launchingRazorpay, setLaunchingRazorpay] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStep, setVerifyStep] = useState('');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Reservation countdown timer (15 minutes)
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  // Receipt state (rendered upon successful verification)
  const [receipt, setReceipt] = useState<{ reg: Registration; method: string } | null>(null);

  // Keep track of active order ID for background polling
  const activeOrderIdRef = useRef<string | null>(null);

  // ── Reservation Timer ──
  useEffect(() => {
    if (!isOpen || receipt) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, receipt]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ── Create Razorpay Order on Mount ──
  const initOrder = async () => {
    setLoadingOrder(true);
    setOrderError(null);
    setPaymentError(null);

    try {
      let res = await apiFetch('/api/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({
          workshopId: workshop.id,
          notes: notes?.trim() || '',
          participantId: currentUser?.id,
        }),
      });

      if (res.status === 401 && getToken()) {
        const refreshRes = await apiFetch('/api/auth/refresh-token', { method: 'POST' });
        if (refreshRes.ok) {
          const refreshed = await refreshRes.json();
          if (refreshed.token) {
            saveToken(refreshed.token);
            res = await apiFetch('/api/payments/create-order', {
              method: 'POST',
              body: JSON.stringify({
                workshopId: workshop.id,
                notes: notes?.trim() || '',
                participantId: currentUser?.id,
              }),
            });
          }
        }
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        setOrderError(data.error || 'Failed to initialize payment gateway.');
        return;
      }

      setOrderData(data);
      activeOrderIdRef.current = data.orderId;
    } catch (err: any) {
      setOrderError(err.message || 'Network error connecting to payment gateway.');
    } finally {
      setLoadingOrder(false);
    }
  };

  useEffect(() => {
    if (isOpen && !receipt) {
      initOrder();
    }
  }, [isOpen, workshop.id]);

  // ── Background Poller (every 3s) to detect completed payments via webhooks ──
  useEffect(() => {
    if (!isOpen || receipt || !orderData?.orderId) return;

    const poller = setInterval(async () => {
      if (isVerifying || receipt) return;
      try {
        const checkRes = await apiFetch(
          `/api/payments/status?orderId=${encodeURIComponent(orderData.orderId)}&paymentAttemptId=${encodeURIComponent(orderData.paymentAttemptId || '')}`
        );
        if (checkRes.ok) {
          const checkData = await checkRes.json();
          if (checkData.paid && checkData.registration) {
            setReceipt({ reg: checkData.registration, method: 'Razorpay' });
            await refreshData();
          }
        }
      } catch (err) {
        // Silently continue polling
      }
    }, 3000);

    return () => clearInterval(poller);
  }, [isOpen, orderData, isVerifying, receipt]);

  // ── Launch Official Razorpay Checkout ──
  const handlePayNow = async () => {
    if (!orderData || launchingRazorpay || isVerifying) return;

    setLaunchingRazorpay(true);
    setPaymentError(null);

    // 1. Ensure official Razorpay script is loaded
    const loaded = await loadRazorpayScript();
    if (!loaded || !(window as any).Razorpay) {
      setLaunchingRazorpay(false);
      setPaymentError('Could not load Razorpay SDK. Please check your internet connection and try again.');
      showAlert('Could not load Razorpay SDK.', 'error');
      return;
    }

    const RazorpayClass = (window as any).Razorpay;

    // 2. Build official Razorpay Checkout options
    const options = {
      key: orderData.keyId || (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name: 'Kaushalya Workshops',
      description: `${workshop.title} Registration`,
      order_id: orderData.orderId,
      prefill: {
        name: currentUser?.fullName || orderData.participantName || '',
        email: currentUser?.email || orderData.participantEmail || '',
        contact: currentUser?.phoneNumber || '',
      },
      notes: {
        workshopId: workshop.id,
        paymentAttemptId: orderData.paymentAttemptId,
        registrationId: orderData.registrationId,
      },
      theme: {
        color: '#08482D', // Kaushalya primary forest green
      },
      handler: async (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => {
        setLaunchingRazorpay(false);
        setIsVerifying(true);
        setVerifyStep('Verifying payment signature with Razorpay...');

        try {
          let verifyRes = await apiFetch('/api/payments/verify', {
            method: 'POST',
            body: JSON.stringify({
              paymentAttemptId: orderData.paymentAttemptId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          if (verifyRes.status === 401 && getToken()) {
            const refreshRes = await apiFetch('/api/auth/refresh-token', { method: 'POST' });
            if (refreshRes.ok) {
              const refreshed = await refreshRes.json();
              if (refreshed.token) {
                saveToken(refreshed.token);
                verifyRes = await apiFetch('/api/payments/verify', {
                  method: 'POST',
                  body: JSON.stringify({
                    paymentAttemptId: orderData.paymentAttemptId,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                  }),
                });
              }
            }
          }

          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            setVerifyStep('Payment verified! Generating confirmed ticket pass...');
            await refreshData();
            setTimeout(() => {
              setIsVerifying(false);
              setReceipt({
                reg: verifyData.registration,
                method: 'Razorpay',
              });
            }, 600);
          } else {
            setIsVerifying(false);
            setPaymentError(verifyData.error || 'Payment signature verification failed.');
            showAlert(verifyData.error || 'Payment verification failed.', 'error');
          }
        } catch (err: any) {
          setIsVerifying(false);
          setPaymentError('Network error while verifying payment with server. Please try again.');
          showAlert('Error verifying payment.', 'error');
        }
      },
      modal: {
        ondismiss: () => {
          setLaunchingRazorpay(false);
          setPaymentError('Payment window was closed before completion. You can safely retry below.');
        },
      },
    };

    try {
      const rzpInstance = new RazorpayClass(options);
      rzpInstance.on('payment.failed', (resp: any) => {
        setLaunchingRazorpay(false);
        const reason = resp?.error?.description || 'Payment was declined by bank.';
        setPaymentError(`Payment failed: ${reason}`);
      });
      rzpInstance.open();
    } catch (e: any) {
      setLaunchingRazorpay(false);
      setPaymentError(`Failed to launch Razorpay checkout: ${e?.message || 'Unknown error'}`);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* ── Payment Receipt Screen (shown on verified success) ── */}
      {receipt && (
        <PaymentReceipt
          registration={receipt.reg}
          workshop={workshop}
          paymentMethod="Razorpay"
          onClose={() => {
            setReceipt(null);
            onSuccess(receipt.reg);
            onClose();
          }}
        />
      )}

      {/* ── Main Razorpay Checkout Modal ── */}
      {!receipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-[#121f17] rounded-3xl w-full max-w-xl border border-[#DCE4D6] dark:border-[#233d2e] shadow-2xl overflow-hidden flex flex-col my-auto"
          >
            {/* ── Modal Header ── */}
            <div className="p-4 sm:p-5 bg-[#F5F8EF] dark:bg-[#16291e] border-b border-[#DCE4D6] dark:border-[#233d2e] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#08482D] text-[#DAE7C7] flex items-center justify-center shadow-md shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-[#08482D] dark:text-[#DAE7C7] bg-[#DAE7C7]/50 dark:bg-[#08482D]/40 px-2 py-0.5 rounded-full">
                      Razorpay Secure Checkout
                    </span>
                    <div className="flex items-center gap-1 text-[11px] font-mono text-[#5E5E61] dark:text-[#8ba895]">
                      <Clock className="w-3 h-3 text-amber-500" />
                      <span>{formatTimer(timeLeft)}</span>
                    </div>
                  </div>
                  <h2 className="text-sm sm:text-base font-heading font-bold text-[#101410] dark:text-[#f0f5ee] line-clamp-1 mt-0.5">
                    {workshop.title}
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-[10px] font-heading text-[#5E5E61] dark:text-[#8ba895] uppercase">Total</div>
                  <div className="text-xl sm:text-2xl font-heading font-extrabold text-[#08482D] dark:text-[#DAE7C7]">₹{price}</div>
                </div>
                <button
                  onClick={onClose}
                  disabled={isVerifying || launchingRazorpay}
                  className="w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-[#5E5E61] dark:text-[#8ba895] transition-colors cursor-pointer disabled:opacity-50"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── Verifying State Overlay ── */}
            {isVerifying && (
              <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-[#08482D]/20 border-t-[#08482D] animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lock className="w-6 h-6 text-[#08482D] dark:text-[#DAE7C7]" />
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-heading font-bold text-[#101410] dark:text-[#f0f5ee]">
                    Verifying Payment
                  </h3>
                  <p className="text-xs text-[#5E5E61] dark:text-[#8ba895] animate-pulse mt-1">
                    {verifyStep || 'Validating cryptographic signature with Razorpay...'}
                  </p>
                </div>
              </div>
            )}

            {/* ── Main Checkout Content ── */}
            {!isVerifying && (
              <div className="p-5 sm:p-6 space-y-5">
                {/* 1. Workshop & Attendee Overview Card */}
                <div className="p-4 rounded-2xl bg-[#F5F8EF] dark:bg-[#16291e] border border-[#DCE4D6] dark:border-[#233d2e] space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-[#08482D] dark:text-[#DAE7C7] bg-[#DAE7C7]/50 dark:bg-[#08482D]/40 px-2 py-0.5 rounded-full">
                        {workshop.category}
                      </span>
                      <h3 className="text-sm font-heading font-bold text-[#101410] dark:text-[#f0f5ee] mt-1 line-clamp-1">
                        {workshop.title}
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#5E5E61] dark:text-[#8ba895] pt-2 border-t border-[#DCE4D6]/60 dark:border-[#233d2e]">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#08482D] dark:text-[#DAE7C7]" />
                      <span>{workshop.date} ({workshop.startTime} - {workshop.endTime})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#08482D] dark:text-[#DAE7C7]" />
                      <span className="truncate">{workshop.venue}</span>
                    </div>
                    {currentUser && (
                      <div className="flex items-center gap-1.5 sm:col-span-2">
                        <UserIcon className="w-3.5 h-3.5 text-[#08482D] dark:text-[#DAE7C7]" />
                        <span>Attendee: <strong className="text-[#101410] dark:text-[#f0f5ee]">{currentUser.fullName}</strong> ({currentUser.email})</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Price Ledger Breakdown */}
                <div className="p-4 rounded-2xl bg-white dark:bg-[#14231b] border border-[#DCE4D6] dark:border-[#233d2e] space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[#5E5E61] dark:text-[#8ba895]">
                    <span>Workshop Seat Registration</span>
                    <span className="font-mono font-medium text-[#101410] dark:text-[#f0f5ee]">₹{price}.00</span>
                  </div>
                  <div className="flex items-center justify-between text-[#5E5E61] dark:text-[#8ba895]">
                    <span>Convenience / Processing Fee</span>
                    <span className="font-mono text-emerald-600 font-semibold">FREE (₹0.00)</span>
                  </div>
                  <div className="pt-2 border-t border-[#DCE4D6] dark:border-[#233d2e] flex items-center justify-between font-heading font-bold text-sm text-[#101410] dark:text-[#f0f5ee]">
                    <span>Total Amount Payable</span>
                    <span className="font-mono text-base text-[#08482D] dark:text-[#DAE7C7]">₹{price}.00</span>
                  </div>
                </div>

                {/* 3. Razorpay Gateway Exclusive Badge */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-[#F5F8EF] to-emerald-50/50 dark:from-[#16291e] dark:via-[#13231a] dark:to-[#16291e] border border-[#DAE7C7] dark:border-[#22392c] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#08482D] text-[#DAE7C7] flex items-center justify-center">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-heading font-bold text-[#101410] dark:text-[#f0f5ee]">
                          Official Razorpay Gateway
                        </div>
                        <div className="text-[10px] text-[#5E5E61] dark:text-[#8ba895]">
                          256-Bit SSL Encrypted &amp; PCI-DSS Certified
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                      Instant Verification
                    </span>
                  </div>

                  <p className="text-xs text-[#5E5E61] dark:text-[#8ba895] leading-relaxed">
                    Click <strong>Pay with Razorpay</strong> to open the secure Razorpay Checkout. Complete your payment using your preferred method:
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] font-medium text-[#101410] dark:text-[#d3e2d6]">
                    <div className="p-2 rounded-xl bg-white dark:bg-[#1a3025] border border-[#DCE4D6] dark:border-[#233d2e] flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>UPI &amp; QR</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-[#1a3025] border border-[#DCE4D6] dark:border-[#233d2e] flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>Cards</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-[#1a3025] border border-[#DCE4D6] dark:border-[#233d2e] flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>NetBanking</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-[#1a3025] border border-[#DCE4D6] dark:border-[#233d2e] flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>Wallets</span>
                    </div>
                  </div>
                </div>

                {/* 4. Error Message (if any) */}
                {(orderError || paymentError) && (
                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-300">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    <div className="flex-1">
                      <p className="font-semibold">{orderError ? 'Order Initialization Error' : 'Payment Status'}</p>
                      <p className="mt-0.5 text-[11px] opacity-90">{orderError || paymentError}</p>
                    </div>
                  </div>
                )}

                {/* 5. Primary Action Button */}
                <div className="pt-2 space-y-2">
                  <button
                    onClick={orderError ? initOrder : handlePayNow}
                    disabled={loadingOrder || launchingRazorpay || isVerifying}
                    className="w-full py-3.5 bg-[#08482D] hover:bg-[#0c5c3b] disabled:bg-[#08482D]/60 text-[#F5F8EF] font-heading font-bold text-sm rounded-2xl shadow-lg shadow-[#08482D]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {loadingOrder ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-[#DAE7C7]" />
                        <span>Initializing Razorpay Order...</span>
                      </>
                    ) : launchingRazorpay ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-[#DAE7C7]" />
                        <span>Opening Razorpay Checkout...</span>
                      </>
                    ) : orderError ? (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        <span>Retry Connection</span>
                      </>
                    ) : paymentError ? (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        <span>Retry Payment of ₹{price}</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-[#DAE7C7]" />
                        <span>Pay ₹{price} with Razorpay</span>
                        <ArrowRight className="w-4 h-4 text-[#DAE7C7]" />
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-center text-[#5E5E61] dark:text-[#8ba895]">
                    Your seat is temporarily held for 15 minutes. Official confirmed pass generated upon payment.
                  </p>
                </div>
              </div>
            )}

            {/* ── Modal Footer ── */}
            {!isVerifying && (
              <div className="p-3 sm:p-4 bg-[#F5F8EF] dark:bg-[#16291e] border-t border-[#DCE4D6] dark:border-[#233d2e] flex items-center justify-between text-xs text-[#5E5E61] dark:text-[#8ba895]">
                <div className="flex items-center gap-1.5 text-[11px]">
                  <Lock className="w-3.5 h-3.5 text-[#08482D] dark:text-[#DAE7C7]" />
                  <span>Powered by Razorpay · NPCI &amp; RBI Compliant</span>
                </div>
                <button
                  onClick={onClose}
                  disabled={isVerifying || launchingRazorpay}
                  className="px-3 py-1 text-xs font-heading font-semibold hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
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
