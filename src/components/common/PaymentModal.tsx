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
  const orderPromiseRef = useRef<Promise<any> | null>(null);

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

  // ── Create Razorpay Order in Background ──
  const initOrder = async (): Promise<any> => {
    setLoadingOrder(true);
    setOrderError(null);
    setPaymentError(null);

    const promise = (async () => {
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
          return null;
        }

        setOrderData(data);
        activeOrderIdRef.current = data.orderId;
        return data;
      } catch (err: any) {
        setOrderError(err.message || 'Network error connecting to payment gateway.');
        return null;
      } finally {
        setLoadingOrder(false);
      }
    })();

    orderPromiseRef.current = promise;
    return promise;
  };

  useEffect(() => {
    if (isOpen && !receipt) {
      loadRazorpayScript().catch(() => {});
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
    if (launchingRazorpay || isVerifying) return;

    setLaunchingRazorpay(true);
    setPaymentError(null);

    let activeOrder = orderData;
    if (!activeOrder && orderPromiseRef.current) {
      activeOrder = await orderPromiseRef.current;
    }
    if (!activeOrder) {
      activeOrder = await initOrder();
    }

    if (!activeOrder || !activeOrder.orderId) {
      setLaunchingRazorpay(false);
      return;
    }

    const loaded = await loadRazorpayScript();
    if (!loaded || !(window as any).Razorpay) {
      setLaunchingRazorpay(false);
      setPaymentError('Could not load Razorpay SDK. Please check your internet connection and try again.');
      showAlert('Could not load Razorpay SDK.', 'error');
      return;
    }

    const RazorpayClass = (window as any).Razorpay;

    const options = {
      key: activeOrder.keyId || (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || '',
      amount: activeOrder.amount,
      currency: activeOrder.currency || 'INR',
      name: 'Kaushalya Workshops',
      description: `${workshop.title} Registration`,
      order_id: activeOrder.orderId,
      prefill: {
        name: currentUser?.fullName || activeOrder.participantName || '',
        email: currentUser?.email || activeOrder.participantEmail || '',
        contact: currentUser?.phoneNumber || '',
      },
      notes: {
        workshopId: workshop.id,
        paymentAttemptId: activeOrder.paymentAttemptId,
        registrationId: activeOrder.registrationId,
      },
      theme: {
        color: '#F4511E', // Kaushalya primary orange
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
              paymentAttemptId: activeOrder.paymentAttemptId,
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
                    paymentAttemptId: activeOrder.paymentAttemptId,
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#101D32]/70 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl w-full max-w-xl border-2 border-[#101D32] shadow-[8px_8px_0px_0px_#101D32] overflow-hidden flex flex-col my-auto"
          >
            {/* ── Modal Header ── */}
            <div className="p-4 sm:p-5 bg-[#FFF5E9] border-b-2 border-[#101D32] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#F4511E] text-white border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-[#101D32] bg-[#FFD6B0] border border-[#101D32] px-2 py-0.5 rounded-md">
                      Razorpay Secure Checkout
                    </span>
                    <div className="flex items-center gap-1 text-[11px] font-mono text-[#101D32] font-bold">
                      <Clock className="w-3.5 h-3.5 text-[#F4511E]" />
                      <span>{formatTimer(timeLeft)}</span>
                    </div>
                  </div>
                  <h2 className="text-sm sm:text-base font-heading font-extrabold text-[#101D32] line-clamp-1 mt-0.5">
                    {workshop.title}
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-[10px] font-heading font-bold text-[#101D32]/70 uppercase">Total</div>
                  <div className="text-xl sm:text-2xl font-heading font-extrabold text-[#F4511E]">₹{price}</div>
                </div>
                <button
                  onClick={onClose}
                  disabled={isVerifying || launchingRazorpay}
                  className="w-8 h-8 rounded-lg border-2 border-transparent hover:border-[#101D32] hover:bg-[#FFD6B0] flex items-center justify-center text-[#101D32] transition-colors cursor-pointer disabled:opacity-50"
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
                  <div className="w-16 h-16 rounded-full border-4 border-[#FFD6B0] border-t-[#F4511E] animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lock className="w-6 h-6 text-[#101D32]" />
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-heading font-extrabold text-[#101D32]">
                    Verifying Payment
                  </h3>
                  <p className="text-xs text-[#101D32]/80 font-medium animate-pulse mt-1">
                    {verifyStep || 'Validating cryptographic signature with Razorpay...'}
                  </p>
                </div>
              </div>
            )}

            {/* ── Main Checkout Content ── */}
            {!isVerifying && (
              <div className="p-5 sm:p-6 space-y-5">
                {/* 1. Workshop & Attendee Overview Card */}
                <div className="p-4 rounded-xl bg-[#FFF5E9] border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-[#101D32] bg-[#FFD6B0] border border-[#101D32] px-2 py-0.5 rounded-md">
                        {workshop.category}
                      </span>
                      <h3 className="text-sm font-heading font-extrabold text-[#101D32] mt-1 line-clamp-1">
                        {workshop.title}
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#101D32]/80 pt-2 border-t-2 border-[#101D32]/20 font-sans">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-[#F4511E]" />
                      <span>{workshop.date} ({workshop.startTime} - {workshop.endTime})</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#F4511E]" />
                      <span className="truncate">{workshop.venue}</span>
                    </div>
                    {currentUser && (
                      <div className="flex items-center gap-1.5 sm:col-span-2 font-medium">
                        <UserIcon className="w-3.5 h-3.5 text-[#F4511E]" />
                        <span>Attendee: <strong className="text-[#101D32]">{currentUser.fullName}</strong> ({currentUser.email})</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Price Ledger Breakdown */}
                <div className="p-4 rounded-xl bg-white border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] space-y-2 text-xs font-sans">
                  <div className="flex items-center justify-between text-[#101D32]/80">
                    <span>Workshop Seat Registration</span>
                    <span className="font-mono font-bold text-[#101D32]">₹{price}.00</span>
                  </div>
                  <div className="flex items-center justify-between text-[#101D32]/80">
                    <span>Convenience / Processing Fee</span>
                    <span className="font-mono text-[#F4511E] font-bold">FREE (₹0.00)</span>
                  </div>
                  <div className="pt-2 border-t-2 border-[#101D32]/20 flex items-center justify-between font-heading font-extrabold text-sm text-[#101D32]">
                    <span>Total Amount Payable</span>
                    <span className="font-mono text-base text-[#F4511E]">₹{price}.00</span>
                  </div>
                </div>

                {/* 3. Razorpay Gateway Exclusive Badge */}
                <div className="p-4 rounded-xl bg-[#FFF5E9] border-2 border-[#101D32] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md bg-[#101D32] text-white flex items-center justify-center">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-heading font-extrabold text-[#101D32]">
                          Official Razorpay Gateway
                        </div>
                        <div className="text-[10px] text-[#101D32]/70 font-medium">
                          256-Bit SSL Encrypted &amp; PCI-DSS Certified
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[#101D32] bg-[#FFD6B0] border border-[#101D32] px-2 py-0.5 rounded-md">
                      Instant Verification
                    </span>
                  </div>

                  <p className="text-xs text-[#101D32]/80 leading-relaxed font-sans">
                    Click <strong>Pay with Razorpay</strong> to open the secure Razorpay Checkout. Complete your payment using your preferred method:
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] font-bold text-[#101D32]">
                    <div className="p-2 rounded-lg bg-white border-2 border-[#101D32] flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#101D32]">
                      <Smartphone className="w-3.5 h-3.5 text-[#F4511E] shrink-0" />
                      <span>UPI &amp; QR</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white border-2 border-[#101D32] flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#101D32]">
                      <CreditCard className="w-3.5 h-3.5 text-[#F4511E] shrink-0" />
                      <span>Cards</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white border-2 border-[#101D32] flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#101D32]">
                      <Building2 className="w-3.5 h-3.5 text-[#F4511E] shrink-0" />
                      <span>NetBanking</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white border-2 border-[#101D32] flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#101D32]">
                      <Wallet className="w-3.5 h-3.5 text-[#F4511E] shrink-0" />
                      <span>Wallets</span>
                    </div>
                  </div>
                </div>

                {/* 4. Error Message (if any) */}
                {(orderError || paymentError) && (
                  <div className="p-3.5 rounded-xl bg-[#FFD6B0] border-2 border-[#101D32] flex items-start gap-2.5 text-xs text-[#101D32] shadow-[4px_4px_0px_0px_#101D32]">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#E84316]" />
                    <div className="flex-1">
                      <p className="font-heading font-extrabold">{orderError ? 'Order Initialization Error' : 'Payment Status'}</p>
                      <p className="mt-0.5 text-[11px] font-medium">{orderError || paymentError}</p>
                    </div>
                  </div>
                )}

                {/* 5. Primary Action Button */}
                <div className="pt-2 space-y-2">
                  <button
                    onClick={orderError ? initOrder : handlePayNow}
                    disabled={launchingRazorpay || isVerifying}
                    className="w-full py-3.5 bg-[#F4511E] hover:bg-[#E84316] disabled:bg-[#101D32]/40 text-white font-heading font-extrabold text-sm rounded-xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#101D32] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {loadingOrder ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>Initializing Razorpay Order...</span>
                      </>
                    ) : launchingRazorpay ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
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
                        <Lock className="w-4 h-4 text-white" />
                        <span>Pay ₹{price} with Razorpay</span>
                        <ArrowRight className="w-4 h-4 text-white" />
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-center text-[#101D32]/70 font-medium font-sans">
                    Your seat is temporarily held for 15 minutes. Official confirmed pass generated upon payment.
                  </p>
                </div>
              </div>
            )}

            {/* ── Modal Footer ── */}
            {!isVerifying && (
              <div className="p-3 sm:p-4 bg-[#FFF5E9] border-t-2 border-[#101D32] flex items-center justify-between text-xs text-[#101D32]/80 font-sans">
                <div className="flex items-center gap-1.5 text-[11px] font-medium">
                  <Lock className="w-3.5 h-3.5 text-[#F4511E]" />
                  <span>Powered by Razorpay · NPCI &amp; RBI Compliant</span>
                </div>
                <button
                  onClick={onClose}
                  disabled={isVerifying || launchingRazorpay}
                  className="px-3 py-1 text-xs font-heading font-bold text-[#101D32] hover:bg-[#FFD6B0] border border-[#101D32] rounded-lg transition-colors cursor-pointer"
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
