import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateSeats, canRegister } from '../../utils/workshopRules';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Share2,
  Video,
  BookOpen,
  Info,
  ShieldCheck,
  Navigation,
  QrCode,
  HandHeart,
  Send,
  Check,
  Award,
  CreditCard,
  Tag,
  Ticket,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRTicketModal } from '../common/QRTicketModal';
import { Registration } from '../../types';

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

  React.useEffect(() => {
    refreshData();
  }, [refreshData]);

  const workshop = workshops.find((w) => w.id === selectedWorkshopId);

  if (!workshop) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-[#5E5E61] mx-auto" />
        <h2 className="text-xl font-heading font-bold text-[#101410] dark:text-[#f0f5ee]">Workshop Not Found</h2>
        <p className="text-sm text-[#5E5E61] dark:text-[#8ba895]">
          The requested workshop could not be located or has been archived.
        </p>
        <button
          onClick={() => navigateTo('workshops')}
          className="px-5 py-2.5 bg-[#08482D] text-[#F5F8EF] rounded-xl text-xs font-heading font-semibold hover:bg-[#0c5c3b]"
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
    setIsRegistering(true);
    setShowConfirmModal(false);
    try {
      const result = await registerForWorkshop(workshop.id, notes);
      if (result.success && result.registration) {
        setTicketToShow(result.registration);
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const handleVolunteerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setRequestingVolunteer(true);
    setVolunteerSuccessMsg('');

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
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 transition-colors duration-200">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateTo('workshops')}
          className="inline-flex items-center gap-1.5 text-xs font-heading font-semibold text-[#5E5E61] dark:text-[#8ba895] hover:text-[#08482D] dark:hover:text-[#9ee2b8] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Workshops</span>
        </button>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DCE4D6] dark:border-[#233d2e] bg-white dark:bg-[#14231b] hover:bg-[#E8F0DF] dark:hover:bg-[#1a3325] text-xs font-heading font-semibold text-[#101410] dark:text-[#f0f5ee] transition-colors shadow-xs cursor-pointer"
        >
          {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
        </button>
      </div>

      {/* Main Grid: Details (Left) + Registration Action Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Workshop Details */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header Card */}
          <div className="bg-white dark:bg-[#14231b] p-6 sm:p-8 rounded-3xl border border-[#DCE4D6] dark:border-[#233d2e] shadow-xs space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-heading font-bold bg-[#DAE7C7] text-[#08482D]">
                {workshop.category}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                workshop.pricingType === 'PAID'
                  ? 'bg-[#08482D] text-[#DAE7C7] border border-[#DAE7C7]/30'
                  : 'bg-[#08482D] text-[#F5F8EF]'
              }`}>
                {workshop.pricingType === 'PAID' ? `₹${workshop.price}` : '100% FREE'}
              </span>
              <span className="text-xs text-[#5E5E61] dark:text-[#8ba895]">
                Organized by <strong className="text-[#101410] dark:text-[#f0f5ee]">{workshop.organizerNameSnapshot}</strong>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-heading font-extrabold text-[#101410] dark:text-[#f0f5ee] tracking-tight leading-tight">
              {workshop.title}
            </h1>

            <p className="text-sm sm:text-base text-[#5E5E61] dark:text-[#8ba895] leading-relaxed">
              {workshop.summary}
            </p>

            {/* Quick Logistics Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-[#DCE4D6]/70 dark:border-[#233d2e] text-xs">
              <div className="flex items-center gap-2.5 text-[#5E5E61] dark:text-[#8ba895]">
                <Calendar className="w-4 h-4 text-[#08482D] dark:text-[#9ee2b8] shrink-0" />
                <div>
                  <span className="font-semibold text-[#101410] dark:text-[#f0f5ee] block">{workshop.date}</span>
                  <span>{workshop.startTime} – {workshop.endTime}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-[#5E5E61] dark:text-[#8ba895]">
                <MapPin className="w-4 h-4 text-[#08482D] dark:text-[#9ee2b8] shrink-0" />
                <div>
                  <span className="font-semibold text-[#101410] dark:text-[#f0f5ee] block">{workshop.venue}</span>
                  <span className="truncate block max-w-xs">{workshop.venueAddress || 'Campus Laboratory'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Banner Image */}
          <div className="rounded-3xl overflow-hidden border border-[#DCE4D6] dark:border-[#233d2e] shadow-sm max-h-[360px] sm:max-h-[440px] bg-[#E8F0DF] dark:bg-[#1b3025]">
            <img
              src={workshop.bannerImageUrl}
              alt={workshop.title}
              className="w-full h-full max-h-[360px] sm:max-h-[440px] object-cover transition-opacity duration-300"
              loading="eager"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/assets/images/fullstack-web-workshop-banner.jpg';
              }}
            />
          </div>

          {/* Learning Outcomes Checklist */}
          {workshop.learningOutcomes && workshop.learningOutcomes.length > 0 && (
            <div className="bg-white dark:bg-[#14231b] p-6 sm:p-8 rounded-3xl border border-[#DCE4D6] dark:border-[#233d2e] shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-base font-heading font-bold text-[#101410] dark:text-[#f0f5ee]">
                <Award className="w-5 h-5 text-[#08482D] dark:text-[#9ee2b8]" />
                <span>What You Will Learn & Build</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {workshop.learningOutcomes.map((outcome, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-[#5E5E61] dark:text-[#8ba895] bg-[#F5F8EF]/80 dark:bg-[#1b3025] p-3 rounded-2xl border border-[#DCE4D6]/70 dark:border-[#233d2e]">
                    <CheckCircle className="w-4 h-4 text-[#08482D] dark:text-[#9ee2b8] shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-medium text-[#101410] dark:text-[#f0f5ee]">{outcome}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Course Description */}
          <div className="bg-white dark:bg-[#14231b] p-6 sm:p-8 rounded-3xl border border-[#DCE4D6] dark:border-[#233d2e] shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-base font-heading font-bold text-[#101410] dark:text-[#f0f5ee]">
              <BookOpen className="w-5 h-5 text-[#08482D] dark:text-[#9ee2b8]" />
              <span>Full Workshop Syllabus & Scope</span>
            </div>
            <div className="text-xs sm:text-sm text-[#5E5E61] dark:text-[#8ba895] leading-relaxed whitespace-pre-line space-y-3">
              {workshop.description}
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Registration & Logistics Sidebar */}
        <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
          {/* Main Action Card */}
          <div className="bg-white dark:bg-[#14231b] p-6 rounded-3xl border border-[#DCE4D6] dark:border-[#233d2e] shadow-sm space-y-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-heading font-bold bg-[#DAE7C7] text-[#08482D]">
                {workshop.pricingType === 'PAID' ? (
                  <CreditCard className="w-3.5 h-3.5" />
                ) : (
                  <Tag className="w-3.5 h-3.5" />
                )}
                <span>
                  {workshop.pricingType === 'PAID' ? `₹${workshop.price} • Paid Workshop` : '100% Free Admission'}
                </span>
              </div>
              <h3 className="text-lg font-heading font-bold text-[#101410] dark:text-[#f0f5ee]">
                {workshop.pricingType === 'PAID' ? 'Register & Pay' : 'Reserve Your Seat'}
              </h3>
              <p className="text-xs text-[#5E5E61] dark:text-[#8ba895]">
                {workshop.pricingType === 'PAID'
                  ? 'Secure test checkout powered by Razorpay. Verified digital QR pass generated immediately upon payment confirmation.'
                  : 'Zero tuition, zero card requirements. Verified digital pass issued upon registration.'}
              </p>
            </div>

            {/* Capacity Progress Bar */}
            <div className="space-y-2 pt-2 border-t border-[#DCE4D6]/70 dark:border-[#233d2e]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#5E5E61] dark:text-[#8ba895]">Seat Availability:</span>
                <span className="font-heading font-bold text-[#08482D] dark:text-[#9ee2b8]">
                  {seats.availableSeats} of {workshop.capacity} left
                </span>
              </div>
              <div className="w-full bg-[#E8F0DF] dark:bg-[#1b3025] h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    seats.isFull ? 'bg-rose-500' : 'bg-[#08482D] dark:bg-[#9ee2b8]'
                  }`}
                  style={{ width: `${Math.min(100, (seats.registeredCount / workshop.capacity) * 100)}%` }}
                />
              </div>
            </div>

            {/* Registration State CTA Buttons */}
            {userRegistration ? (
              <div className="space-y-3 pt-2">
                <div className="p-3 bg-[#E8F0DF] dark:bg-[#1b3025] border border-[#DAE7C7] dark:border-[#233d2e] rounded-2xl text-xs text-[#08482D] dark:text-[#9ee2b8] flex items-center gap-2 font-medium">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>
                    {userRegistration.pricingTypeSnapshot === 'PAID'
                      ? `You are confirmed! (Paid ₹${userRegistration.amount})`
                      : 'You are confirmed for this workshop!'}
                  </span>
                </div>
                <button
                  onClick={() => setTicketToShow(userRegistration)}
                  className="w-full py-3 bg-[#08482D] hover:bg-[#0c5c3b] text-[#F5F8EF] font-heading font-semibold text-xs rounded-2xl shadow-md shadow-[#08482D]/20 transition-all flex items-center justify-center gap-2"
                >
                  <QrCode className="w-4 h-4 text-[#DAE7C7]" />
                  <span>View Digital Ticket Pass (QR)</span>
                </button>
              </div>
            ) : !currentUser ? (
              <div className="space-y-2 pt-2">
                <button
                  onClick={onOpenAuth}
                  className="w-full py-3.5 bg-[#08482D] hover:bg-[#0c5c3b] text-[#F5F8EF] font-heading font-semibold text-xs rounded-2xl shadow-md shadow-[#08482D]/20 transition-all"
                >
                  {workshop.pricingType === 'PAID'
                    ? `Sign In to Register & Pay (₹${workshop.price})`
                    : 'Sign In to Book Free Seat'}
                </button>
                <p className="text-[11px] text-center text-[#5E5E61] dark:text-[#8ba895]">
                  Instant access for verified academic accounts.
                </p>
              </div>
            ) : registrationCheck.allowed ? (
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => setShowConfirmModal(true)}
                  disabled={isRegistering}
                  className="w-full py-3.5 bg-[#08482D] hover:bg-[#0c5c3b] text-[#F5F8EF] font-heading font-semibold text-xs rounded-2xl shadow-md shadow-[#08482D]/20 transition-all disabled:opacity-60"
                >
                  {isRegistering
                    ? 'Processing...'
                    : workshop.pricingType === 'PAID'
                    ? `Pay ₹${workshop.price} & Register`
                    : 'Confirm Free Seat'}
                </button>
                <p className="text-[11px] text-center text-[#5E5E61] dark:text-[#8ba895]">
                  {workshop.pricingType === 'PAID'
                    ? 'Secured with Razorpay Test Mode checkout.'
                    : 'Instant confirmation with cryptographic QR ticket.'}
                </p>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl text-xs text-amber-800 dark:text-amber-300">
                {registrationCheck.reason || 'Registration is currently not available.'}
              </div>
            )}

            {/* GPS Directions Link */}
            {!workshop.onlineMode && (
              <div className="pt-2 border-t border-[#DCE4D6]/70 dark:border-[#233d2e]">
                <a
                  href={gpsMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-2xl border border-[#DCE4D6] dark:border-[#233d2e] bg-[#F5F8EF] dark:bg-[#1b3025] hover:bg-[#E8F0DF] dark:hover:bg-[#14231b] text-xs font-heading font-semibold text-[#101410] dark:text-[#f0f5ee] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#08482D] dark:text-[#9ee2b8]" />
                  <span>Get GPS Directions to Venue</span>
                </a>
              </div>
            )}
          </div>

          {/* Student Gate Volunteer Application Box */}
          {currentUser && currentUser.role === 'PARTICIPANT' && (
            <div className="bg-[#E8F0DF]/60 dark:bg-[#14231b] p-5 rounded-3xl border border-[#DCE4D6] dark:border-[#233d2e] space-y-2.5">
              <div className="flex items-center gap-2 font-heading font-bold text-xs text-[#08482D] dark:text-[#9ee2b8]">
                <HandHeart className="w-4 h-4" />
                <span>Volunteer at the Entrance Gate</span>
              </div>
              <p className="text-xs text-[#5E5E61] dark:text-[#8ba895] leading-relaxed">
                Want to assist the faculty coordinator by checking in attendees using our gate webcam scanner?
              </p>
              <button
                onClick={() => setShowVolunteerModal(true)}
                className="w-full py-2 bg-white dark:bg-[#1b3025] hover:bg-[#E8F0DF] dark:hover:bg-[#14231b] text-[#08482D] dark:text-[#9ee2b8] rounded-xl text-xs font-heading font-semibold border border-[#DCE4D6] dark:border-[#233d2e] transition-colors cursor-pointer"
              >
                Apply as Gate Volunteer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#14231b] rounded-3xl p-6 sm:p-7 max-w-md w-full border border-[#DCE4D6] dark:border-[#233d2e] shadow-2xl space-y-4"
            >
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-heading font-bold bg-[#DAE7C7] text-[#08482D]">
                  {workshop.pricingType === 'PAID' ? `Paid Registration • ₹${workshop.price}` : 'Free Enrollment'}
                </div>
                <h3 className="text-lg font-heading font-bold text-[#101410] dark:text-[#f0f5ee]">
                  {workshop.pricingType === 'PAID' ? 'Review Order & Pay' : 'Confirm Workshop Registration'}
                </h3>
                <p className="text-xs text-[#5E5E61] dark:text-[#8ba895]">
                  You are reserving a seat for <strong className="text-[#101410] dark:text-[#f0f5ee]">{workshop.title}</strong>.
                </p>
              </div>

              <div className="bg-[#F5F8EF] dark:bg-[#1b3025] p-3.5 rounded-2xl border border-[#DCE4D6] dark:border-[#233d2e] text-xs text-[#5E5E61] dark:text-[#8ba895] space-y-1.5">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[#08482D]" />
                  <span>{workshop.date} ({workshop.startTime} - {workshop.endTime})</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#08482D]" />
                  <span>{workshop.venue}</span>
                </div>
              </div>

              {workshop.pricingType === 'PAID' && (
                <div className="bg-[#E8F0DF]/60 dark:bg-[#1b3025]/80 p-3.5 rounded-2xl border border-[#DAE7C7] dark:border-[#233d2e] text-xs space-y-2">
                  <div className="flex justify-between items-center text-[#5E5E61] dark:text-[#8ba895]">
                    <span>Workshop Tuition:</span>
                    <span className="font-semibold text-[#101410] dark:text-[#f0f5ee]">₹{workshop.price}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#5E5E61] dark:text-[#8ba895]">
                    <span>Platform Service Fee:</span>
                    <span className="text-[#08482D] dark:text-[#9ee2b8] font-medium">₹0 (Academic Waiver)</span>
                  </div>
                  <div className="pt-2 border-t border-[#DCE4D6] dark:border-[#233d2e] flex justify-between items-center text-xs font-bold text-[#101410] dark:text-[#f0f5ee]">
                    <span>Total Payable:</span>
                    <span className="text-sm text-[#08482D] dark:text-[#9ee2b8]">₹{workshop.price}</span>
                  </div>
                  <div className="text-[10px] text-[#5E5E61] dark:text-[#8ba895] pt-0.5">
                    Mode: Razorpay Test Mode • Use simulated card/UPI
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-heading font-semibold text-[#101410] dark:text-[#f0f5ee] mb-1">
                  Notes for the Instructor (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Excited to learn about system scaling..."
                  rows={2}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#DCE4D6] dark:border-[#233d2e] bg-white dark:bg-[#14231b] text-[#101410] dark:text-[#f0f5ee] focus:outline-none focus:ring-2 focus:ring-[#08482D]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#DCE4D6] dark:border-[#233d2e]">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isRegistering}
                  className="px-4 py-2 text-xs font-heading font-semibold text-[#5E5E61] dark:text-[#8ba895] hover:bg-[#E8F0DF] dark:hover:bg-[#1a3325] rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRegisterConfirm}
                  disabled={isRegistering}
                  className="px-5 py-2 text-xs font-heading font-semibold text-[#F5F8EF] bg-[#08482D] hover:bg-[#0c5c3b] rounded-xl shadow-md shadow-[#08482D]/20 transition-all disabled:opacity-60"
                >
                  {isRegistering
                    ? 'Launching Checkout...'
                    : workshop.pricingType === 'PAID'
                    ? `Proceed to Pay ₹${workshop.price}`
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#14231b] rounded-3xl p-6 sm:p-7 max-w-md w-full border border-[#DCE4D6] dark:border-[#233d2e] shadow-2xl space-y-4"
            >
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-heading font-bold bg-[#DAE7C7] text-[#08482D]">
                  Gatekeeper Delegation
                </div>
                <h3 className="text-lg font-heading font-bold text-[#101410] dark:text-[#f0f5ee]">
                  Apply as Gate Volunteer
                </h3>
                <p className="text-xs text-[#5E5E61] dark:text-[#8ba895]">
                  Support entry verification for <strong className="text-[#101410] dark:text-[#f0f5ee]">{workshop.title}</strong>.
                </p>
              </div>

              {volunteerSuccessMsg ? (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  <span>{volunteerSuccessMsg}</span>
                </div>
              ) : (
                <form onSubmit={handleVolunteerSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-heading font-semibold text-[#101410] dark:text-[#f0f5ee] mb-1">
                      Message / Availability Note for Organizer
                    </label>
                    <textarea
                      value={volunteerNote}
                      onChange={(e) => setVolunteerNote(e.target.value)}
                      placeholder="e.g. Available 30 mins before start to set up the webcam gate..."
                      rows={3}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#DCE4D6] dark:border-[#233d2e] bg-[#F5F8EF]/60 dark:bg-[#1b3025] text-[#101410] dark:text-[#f0f5ee] focus:outline-none focus:ring-2 focus:ring-[#08482D]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#DCE4D6] dark:border-[#233d2e]">
                    <button
                      type="button"
                      onClick={() => setShowVolunteerModal(false)}
                      className="px-4 py-2 text-xs font-heading font-semibold text-[#5E5E61] dark:text-[#8ba895] hover:bg-[#E8F0DF] dark:hover:bg-[#1a3325] rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={requestingVolunteer}
                      className="px-5 py-2 text-xs font-heading font-semibold text-[#F5F8EF] bg-[#08482D] hover:bg-[#0c5c3b] rounded-xl shadow-md transition-all disabled:opacity-50"
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
    </div>
  );
};
