import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateSeats, canRegister } from '../../utils/workshopRules';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Share2,
  BookOpen,
  Navigation,
  QrCode,
  HandHeart,
  Check,
  Award,
  CreditCard,
  Tag,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRTicketModal } from '../common/QRTicketModal';
import { PaymentModal } from '../common/PaymentModal';
import { Registration } from '../../types';
import { normalizeBannerUrl } from '../../data/seedData';

interface WorkshopDetailProps {
  onOpenAuth: () => void;
}

export const WorkshopDetail: React.FC<WorkshopDetailProps> = ({ onOpenAuth }) => {
  const {
    selectedWorkshopId,
    workshops,
    registrations,
    currentUser,
    registerForWorkshop,
    requestVolunteering,
    showAlert,
    navigateTo,
    refreshData,
  } = useApp();

  const [notes, setNotes] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [ticketToShow, setTicketToShow] = useState<Registration | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // Volunteering request modal state
  const [showVolunteerModal, setShowVolunteerModal] = useState(false);
  const [volunteerNote, setVolunteerNote] = useState('');
  const [requestingVolunteer, setRequestingVolunteer] = useState(false);
  const [volunteerSuccessMsg, setVolunteerSuccessMsg] = useState('');
  const [volunteerErrorMsg, setVolunteerErrorMsg] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  React.useEffect(() => {
    refreshData();
  }, [refreshData]);

  const workshop = workshops.find((w) => w.id === selectedWorkshopId);

  if (!workshop) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4 font-sans">
        <AlertCircle className="w-12 h-12 text-[#101D32]/40 mx-auto" />
        <h2 className="text-xl font-heading font-extrabold text-[#101410]">Workshop Not Found</h2>
        <p className="text-sm text-[#101D32]/80">
          The requested workshop could not be located or has been archived.
        </p>
        <button
          onClick={() => navigateTo('workshops')}
          className="px-5 py-2.5 bg-[#F4511E] text-white rounded-lg border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] text-xs font-heading font-bold hover:bg-[#E84316] cursor-pointer"
        >
          Return to Workshops
        </button>
      </div>
    );
  }

  const seats = calculateSeats(workshop, registrations);

  const userRegistration = currentUser
    ? registrations.find(
        (r) =>
          r.workshopId === workshop.id &&
          (r.participantId === currentUser.id ||
            (currentUser.email && r.participantEmail?.toLowerCase() === currentUser.email?.toLowerCase())) &&
          (r.status === 'CONFIRMED' || r.status === 'ATTENDED')
      )
    : null;

  const registrationCheck = canRegister(workshop, currentUser, registrations);

  const destinationQuery = encodeURIComponent(
    workshop.venueAddress || `${workshop.venue}`
  );
  const gpsMapsUrl = workshop.mapUrl || (workshop.latitude && workshop.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${workshop.latitude},${workshop.longitude}`
    : `https://www.google.com/maps/dir/?api=1&destination=${destinationQuery}`);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      showAlert('Workshop link copied to clipboard.', 'info');
    }
  };

  const handleRegisterConfirm = async () => {
    setShowConfirmModal(false);
    if (workshop.pricingType === 'PAID' && (workshop.price || 0) > 0) {
      setShowPaymentModal(true);
    } else {
      setIsRegistering(true);
      const res = await registerForWorkshop(workshop.id, notes);
      setIsRegistering(false);
      if (res.success && res.registration) {
        setTicketToShow(res.registration);
      }
    }
  };

  const handleVolunteerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setRequestingVolunteer(true);
    setVolunteerSuccessMsg('');
    setVolunteerErrorMsg('');

    const res = await requestVolunteering({
      name: currentUser.fullName,
      email: currentUser.email,
      phoneNumber: currentUser.phoneNumber,
      assignedWorkshopId: workshop.id,
      requestNote: volunteerNote.trim(),
    });

    setRequestingVolunteer(false);
    if (res.success) {
      setVolunteerSuccessMsg(res.message);
      setVolunteerNote('');
      setTimeout(() => {
        setShowVolunteerModal(false);
        setVolunteerSuccessMsg('');
      }, 3500);
    } else {
      setVolunteerErrorMsg(res.message || 'Failed to submit volunteering application. Please try again.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between font-sans">
        <button
          onClick={() => navigateTo('workshops')}
          className="inline-flex items-center gap-1.5 text-xs font-heading font-bold text-[#101D32] hover:text-[#F4511E] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Workshops</span>
        </button>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-[#101D32] bg-white hover:bg-[#FFD6B0] text-xs font-heading font-bold text-[#101410] transition-colors shadow-[2px_2px_0px_0px_#101D32] cursor-pointer"
        >
          {copiedLink ? <Check className="w-3.5 h-3.5 text-[#F4511E]" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
        </button>
      </div>

      {/* Main Grid: Details (Left) + Registration Action Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Workshop Details */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header Card */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-md text-xs font-heading font-extrabold uppercase tracking-wider bg-[#FFD6B0] border border-[#101D32] text-[#101D32]">
                {workshop.category}
              </span>
              <span className="px-3 py-1 rounded-md text-xs font-mono font-bold bg-[#F4511E] text-white border border-[#101D32]">
                {workshop.pricingType === 'PAID' ? `₹${workshop.price}` : '100% FREE'}
              </span>
              <span className="text-xs text-[#101D32]/80 font-sans">
                Organized by <strong className="text-[#101410] font-semibold">{workshop.organizerNameSnapshot}</strong>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-heading font-extrabold text-[#101410] tracking-tight leading-tight">
              {workshop.title}
            </h1>

            <p className="text-sm sm:text-base text-[#101D32]/80 leading-relaxed font-sans">
              {workshop.summary}
            </p>

            {/* Quick Logistics Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t-2 border-[#101D32]/10 text-xs font-sans">
              <div className="flex items-center gap-2.5 text-[#101D32]/80">
                <Calendar className="w-4 h-4 text-[#F4511E] shrink-0" />
                <div>
                  <span className="font-bold text-[#101410] block">{workshop.date}</span>
                  <span>{workshop.startTime} – {workshop.endTime}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-[#101D32]/80">
                <MapPin className="w-4 h-4 text-[#F4511E] shrink-0" />
                <div>
                  <span className="font-bold text-[#101410] block">{workshop.venue}</span>
                  <span className="truncate block max-w-xs">{workshop.venueAddress || 'Campus Laboratory'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Banner Image */}
          <div className="rounded-2xl overflow-hidden border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] max-h-[360px] sm:max-h-[440px] bg-[#FFF5E9]">
            <img
              src={normalizeBannerUrl(workshop.bannerImageUrl, workshop)}
              alt={workshop.title}
              className="w-full h-full max-h-[360px] sm:max-h-[440px] object-cover transition-opacity duration-300"
              loading="eager"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = normalizeBannerUrl('', workshop);
              }}
            />
          </div>

          {/* Learning Outcomes Checklist */}
          {workshop.learningOutcomes && workshop.learningOutcomes.length > 0 && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] space-y-4">
              <div className="flex items-center gap-2 text-base font-heading font-extrabold text-[#101410]">
                <Award className="w-5 h-5 text-[#F4511E]" />
                <span>What You Will Learn &amp; Build</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {workshop.learningOutcomes.map((outcome, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-[#101D32] bg-[#FFF5E9] p-3 rounded-xl border border-[#101D32]">
                    <CheckCircle className="w-4 h-4 text-[#F4511E] shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-medium font-sans">{outcome}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Course Description */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] space-y-4 font-sans">
            <div className="flex items-center gap-2 text-base font-heading font-extrabold text-[#101410]">
              <BookOpen className="w-5 h-5 text-[#F4511E]" />
              <span>Full Workshop Syllabus &amp; Scope</span>
            </div>
            <div className="text-xs sm:text-sm text-[#101D32]/80 leading-relaxed whitespace-pre-line space-y-3">
              {workshop.description}
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Registration & Logistics Sidebar */}
        <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-24 font-sans">
          {/* Main Action Card */}
          <div className="bg-white p-6 rounded-2xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] space-y-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-heading font-extrabold uppercase tracking-wider bg-[#FFD6B0] border border-[#101D32] text-[#101D32]">
                {workshop.pricingType === 'PAID' ? (
                  <CreditCard className="w-3.5 h-3.5 text-[#F4511E]" />
                ) : (
                  <Tag className="w-3.5 h-3.5 text-[#F4511E]" />
                )}
                <span>
                  {workshop.pricingType === 'PAID' ? `₹${workshop.price} • Paid Workshop` : '100% Free Admission'}
                </span>
              </div>
              <h3 className="text-lg font-heading font-extrabold text-[#101410]">
                {workshop.pricingType === 'PAID' ? 'Register & Pay' : 'Reserve Your Seat'}
              </h3>
              <p className="text-xs text-[#101D32]/80">
                {workshop.pricingType === 'PAID'
                  ? 'Secure checkout powered by Razorpay. Verified digital QR pass generated immediately upon payment confirmation.'
                  : 'Zero tuition, zero card requirements. Verified digital pass issued upon registration.'}
              </p>
            </div>

            {/* Capacity Progress Bar */}
            <div className="space-y-2 pt-2 border-t-2 border-[#101D32]/10">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#101D32]/80 font-medium">Seat Availability:</span>
                <span className="font-heading font-extrabold text-[#F4511E]">
                  {seats.availableSeats} of {workshop.capacity} left
                </span>
              </div>
              <div className="w-full bg-[#FFF5E9] h-3 rounded-md border border-[#101D32] overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    seats.isFull ? 'bg-[#E84316]' : 'bg-[#F4511E]'
                  }`}
                  style={{ width: `${Math.min(100, (seats.registeredCount / workshop.capacity) * 100)}%` }}
                />
              </div>
            </div>

            {/* Registration State CTA Buttons */}
            {userRegistration ? (
              <div className="space-y-3 pt-2">
                <div className="p-3 bg-[#FFF5E9] border-2 border-[#101D32] rounded-xl text-xs text-[#101D32] flex items-center gap-2 font-bold shadow-[2px_2px_0px_0px_#101D32]">
                  <CheckCircle className="w-4 h-4 text-[#F4511E] shrink-0" />
                  <span>
                    {userRegistration.pricingTypeSnapshot === 'PAID'
                      ? `You are confirmed! (Paid ₹${userRegistration.amount})`
                      : 'You are confirmed for this workshop!'}
                  </span>
                </div>
                <button
                  onClick={() => setTicketToShow(userRegistration)}
                  className="w-full py-3 bg-[#F4511E] hover:bg-[#E84316] text-white font-heading font-bold text-xs rounded-lg border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#101D32] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-white" />
                  <span>View Digital Ticket Pass (QR)</span>
                </button>
              </div>
            ) : !currentUser ? (
              <div className="space-y-2 pt-2">
                <button
                  onClick={onOpenAuth}
                  className="w-full py-3.5 bg-[#F4511E] hover:bg-[#E84316] text-white font-heading font-extrabold text-xs rounded-lg border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#101D32] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all cursor-pointer"
                >
                  Sign In to Register &amp; Pay (₹{workshop.price || 199})
                </button>
                <p className="text-[11px] text-center text-[#101D32]/70 font-medium">
                  Instant access for verified academic accounts.
                </p>
              </div>
            ) : registrationCheck.allowed ? (
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => setShowConfirmModal(true)}
                  disabled={isRegistering}
                  className="w-full py-3.5 bg-[#F4511E] hover:bg-[#E84316] text-white font-heading font-extrabold text-xs rounded-lg border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#101D32] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-60 cursor-pointer"
                >
                  Pay ₹{workshop.price || 199} with Razorpay
                </button>
                <p className="text-[11px] text-center text-[#101D32]/70 font-medium">
                  Secured with encrypted Razorpay instant checkout.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-[#FFD6B0] border-2 border-[#101D32] rounded-xl text-xs text-[#101D32] font-semibold shadow-[2px_2px_0px_0px_#101D32]">
                {registrationCheck.reason || 'Registration is currently not available.'}
              </div>
            )}

            {/* GPS Directions Link */}
            {!workshop.onlineMode && (
              <div className="pt-2 border-t-2 border-[#101D32]/10">
                <a
                  href={gpsMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-lg border-2 border-[#101D32] bg-white hover:bg-[#FFD6B0] text-xs font-heading font-bold text-[#101410] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_0px_#101D32]"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#F4511E]" />
                  <span>Get GPS Directions to Venue</span>
                </a>
              </div>
            )}
          </div>

          {/* Student Gate Volunteer Application Box */}
          {!currentUser ? (
            <div className="bg-[#FFF5E9] p-5 rounded-2xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] space-y-2.5">
              <div className="flex items-center gap-2 font-heading font-extrabold text-xs text-[#101D32]">
                <HandHeart className="w-4 h-4 text-[#F4511E]" />
                <span>Volunteer at the Entrance Gate</span>
              </div>
              <p className="text-xs text-[#101D32]/80 leading-relaxed font-sans">
                Want to assist the faculty coordinator by checking in attendees using our gate webcam scanner? Sign in with your student account to apply.
              </p>
              <button
                onClick={onOpenAuth}
                className="w-full py-2 bg-white hover:bg-[#FFD6B0] text-[#101D32] rounded-lg text-xs font-heading font-bold border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] transition-all cursor-pointer"
              >
                Sign In as Student to Apply
              </button>
            </div>
          ) : currentUser.role === 'PARTICIPANT' ? (
            <div className="bg-[#FFF5E9] p-5 rounded-2xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] space-y-2.5">
              <div className="flex items-center gap-2 font-heading font-extrabold text-xs text-[#101D32]">
                <HandHeart className="w-4 h-4 text-[#F4511E]" />
                <span>Volunteer at the Entrance Gate</span>
              </div>
              <p className="text-xs text-[#101D32]/80 leading-relaxed font-sans">
                Want to assist the faculty coordinator by checking in attendees using our gate webcam scanner?
              </p>
              <button
                onClick={() => {
                  setVolunteerErrorMsg('');
                  setVolunteerSuccessMsg('');
                  setShowVolunteerModal(true);
                }}
                className="w-full py-2 bg-white hover:bg-[#FFD6B0] text-[#101D32] rounded-lg text-xs font-heading font-bold border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] transition-all cursor-pointer"
              >
                Apply as Gate Volunteer
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101D32]/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 sm:p-7 max-w-md w-full border-2 border-[#101D32] shadow-[8px_8px_0px_0px_#101D32] space-y-4 font-sans"
            >
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-heading font-extrabold uppercase tracking-wider bg-[#FFD6B0] border border-[#101D32] text-[#101D32]">
                  {workshop.pricingType === 'PAID' ? `Paid Registration • ₹${workshop.price}` : 'Free Enrollment'}
                </div>
                <h3 className="text-lg font-heading font-extrabold text-[#101410]">
                  {workshop.pricingType === 'PAID' ? 'Review Order & Pay' : 'Confirm Workshop Registration'}
                </h3>
                <p className="text-xs text-[#101D32]/80">
                  You are reserving a seat for <strong className="text-[#101410]">{workshop.title}</strong>.
                </p>
              </div>

              <div className="bg-[#FFF5E9] p-3.5 rounded-xl border-2 border-[#101D32] text-xs text-[#101D32] space-y-1.5 font-medium">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[#F4511E]" />
                  <span>{workshop.date} ({workshop.startTime} - {workshop.endTime})</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#F4511E]" />
                  <span>{workshop.venue}</span>
                </div>
              </div>

              {workshop.pricingType === 'PAID' ? (
                <div className="bg-white p-3.5 rounded-xl border-2 border-[#101D32] text-xs space-y-2">
                  <div className="flex justify-between items-center text-[#101D32]/80">
                    <span>Workshop Tuition:</span>
                    <span className="font-bold text-[#101410]">₹{workshop.price || 199}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#101D32]/80">
                    <span>Platform Service Fee:</span>
                    <span className="text-[#F4511E] font-bold">₹0 (Academic Waiver)</span>
                  </div>
                  <div className="pt-2 border-t-2 border-[#101D32]/10 flex justify-between items-center text-xs font-bold text-[#101410]">
                    <span>Total Payable:</span>
                    <span className="text-base text-[#F4511E] font-mono">₹{workshop.price || 199}</span>
                  </div>
                  <div className="text-[10px] text-[#101D32]/70 pt-0.5">
                    Payment Gateway: Razorpay Secure Checkout
                  </div>
                </div>
              ) : (
                <div className="bg-white p-3.5 rounded-xl border-2 border-[#101D32] text-xs space-y-1">
                  <div className="flex justify-between items-center text-[#101D32]/80">
                    <span>Registration Cost:</span>
                    <span className="font-bold text-[#F4511E]">100% Free</span>
                  </div>
                  <p className="text-[11px] text-[#101D32]/70">
                    Instant seat confirmation. No payment required.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-heading font-bold text-[#101410] mb-1">
                  Notes for the Instructor (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Excited to learn about system scaling..."
                  rows={2}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border-2 border-[#101D32] bg-white text-[#101410] focus:outline-none focus:ring-2 focus:ring-[#F4511E]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t-2 border-[#101D32]/10">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isRegistering}
                  className="px-4 py-2 text-xs font-heading font-bold text-[#101D32] hover:bg-[#FFD6B0] border border-[#101D32] rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRegisterConfirm}
                  disabled={isRegistering}
                  className="px-5 py-2 text-xs font-heading font-bold text-white bg-[#F4511E] hover:bg-[#E84316] rounded-lg border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] transition-all disabled:opacity-60 cursor-pointer"
                >
                  {isRegistering
                    ? 'Processing...'
                    : workshop.pricingType === 'PAID'
                    ? `Proceed to Pay ₹${workshop.price} with Razorpay`
                    : 'Complete Registration'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Volunteer Application Modal */}
      <AnimatePresence>
        {showVolunteerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101D32]/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 sm:p-7 max-w-md w-full border-2 border-[#101D32] shadow-[8px_8px_0px_0px_#101D32] space-y-4 font-sans"
            >
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-heading font-extrabold uppercase tracking-wider bg-[#FFD6B0] border border-[#101D32] text-[#101D32]">
                  Gatekeeper Delegation
                </div>
                <h3 className="text-lg font-heading font-extrabold text-[#101410]">
                  Apply as Gate Volunteer
                </h3>
                <p className="text-xs text-[#101D32]/80">
                  Support entry verification for <strong className="text-[#101410]">{workshop.title}</strong>.
                </p>
              </div>

              {volunteerSuccessMsg ? (
                <div className="p-4 bg-[#FFF5E9] border-2 border-[#101D32] rounded-xl text-[#101D32] text-xs font-bold flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[#F4511E] shrink-0" />
                  <span>{volunteerSuccessMsg}</span>
                </div>
              ) : (
                <form onSubmit={handleVolunteerSubmit} className="space-y-3">
                  {volunteerErrorMsg && (
                    <div className="p-3 bg-[#FFD6B0] border-2 border-[#101D32] text-[#101D32] rounded-lg text-xs font-semibold">
                      {volunteerErrorMsg}
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-heading font-bold text-[#101410] mb-1">
                      Message / Availability Note for Organizer
                    </label>
                    <textarea
                      value={volunteerNote}
                      onChange={(e) => setVolunteerNote(e.target.value)}
                      placeholder="e.g. Available 30 mins before start to set up the webcam gate..."
                      rows={3}
                      className="w-full px-3.5 py-2 text-xs rounded-lg border-2 border-[#101D32] bg-white text-[#101410] focus:outline-none focus:ring-2 focus:ring-[#F4511E]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2 border-t-2 border-[#101D32]/10">
                    <button
                      type="button"
                      onClick={() => setShowVolunteerModal(false)}
                      className="px-4 py-2 text-xs font-heading font-bold text-[#101D32] hover:bg-[#FFD6B0] border border-[#101D32] rounded-lg transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={requestingVolunteer}
                      className="px-5 py-2 text-xs font-heading font-bold text-white bg-[#F4511E] hover:bg-[#E84316] rounded-lg border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {requestingVolunteer ? 'Submitting...' : 'Send Application'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Digital QR Ticket Modal */}
      {ticketToShow && (
        <QRTicketModal
          isOpen={true}
          onClose={() => setTicketToShow(null)}
          registration={ticketToShow}
          workshop={workshop}
        />
      )}

      {/* Razorpay Exclusive Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        workshop={workshop}
        notes={notes}
        onSuccess={(registration) => {
          setShowPaymentModal(false);
          setTicketToShow(registration);
        }}
      />
    </div>
  );
};
