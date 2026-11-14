import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  GraduationCap,
  Briefcase,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  X,
  Scan,
  KeyRound,
  ArrowLeft,
  Phone,
  Mail,
  User as UserIcon,
  Send,
  Clock,
  CheckCircle,
  FileText,
  AlertCircle,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Volunteer } from '../../types';

interface RoleSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuthModal?: (role?: 'PARTICIPANT' | 'ORGANIZER' | 'VOLUNTEER') => void;
}

export const RoleSelectorModal: React.FC<RoleSelectorModalProps> = ({ isOpen, onClose, onOpenAuthModal }) => {
  const {
    verifyVolunteerLogin,
    requestVolunteering,
    checkMyVolunteerRequests,
    users,
    workshops,
    currentUser,
    currentVolunteer,
    navigateTo,
    showAlert,
    switchRoleQuickly,
  } = useApp();

  // Volunteer portal mode & sub-tabs
  const [volunteerMode, setVolunteerMode] = useState(false);
  const [volunteerTab, setVolunteerTab] = useState<'request' | 'enter-code'>('request');

  // Request form state
  const [reqWorkshopId, setReqWorkshopId] = useState('');
  const [reqName, setReqName] = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [reqPhone, setReqPhone] = useState('');
  const [reqNote, setReqNote] = useState('');
  const [submittingReq, setSubmittingReq] = useState(false);
  const [reqSuccessMsg, setReqSuccessMsg] = useState('');
  const [existingRequests, setExistingRequests] = useState<Volunteer[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Enter Code form state
  const [selectedOrganizerId, setSelectedOrganizerId] = useState<string>('ALL');
  const [volunteerCode, setVolunteerCode] = useState('');
  const [volunteerName, setVolunteerName] = useState('');
  const [volunteerEmail, setVolunteerEmail] = useState('');
  const [volunteerPhone, setVolunteerPhone] = useState('');
  const [verifyingVolunteer, setVerifyingVolunteer] = useState(false);
  const [volunteerError, setVolunteerError] = useState('');

  // Pre-fill volunteer info from currentUser if logged in
  useEffect(() => {
    if (currentUser) {
      if (!reqName) setReqName(currentUser.fullName);
      if (!reqEmail) setReqEmail(currentUser.email);
      if (!reqPhone && currentUser.phoneNumber) setReqPhone(currentUser.phoneNumber);

      if (!volunteerName) setVolunteerName(currentUser.fullName);
      if (!volunteerEmail) setVolunteerEmail(currentUser.email);
      if (!volunteerPhone && currentUser.phoneNumber) setVolunteerPhone(currentUser.phoneNumber);
    }
  }, [currentUser]);

  // Set default workshop for request
  useEffect(() => {
    if (workshops.length > 0 && !reqWorkshopId) {
      setReqWorkshopId(workshops[0].id);
    }
  }, [workshops, reqWorkshopId]);

  // Keyboard accessibility: Dismiss modal on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const availableWorkshops = workshops.filter((w) => w.status === 'PUBLISHED');
  const organizers = users.filter((u) => u.role === 'ORGANIZER' || u.role === 'SUPER_ADMIN');

  const handleSelectRole = (role: 'PARTICIPANT' | 'ORGANIZER' | 'VOLUNTEER') => {
    onClose();
    onOpenAuthModal?.(role);
  };

  const handleSelectVolunteer = () => {
    if (currentVolunteer) {
      showAlert(`Welcome back, Volunteer ${currentVolunteer.name}! Gate station active.`, 'success');
      navigateTo('volunteer-portal');
      onClose();
      return;
    }
    if (currentUser) {
      setVolunteerMode(true);
      fetchRequests(currentUser.email);
    } else {
      handleSelectRole('VOLUNTEER');
    }
  };

  const fetchRequests = async (email: string) => {
    if (!email || !email.includes('@')) return;
    setLoadingRequests(true);
    const res = await checkMyVolunteerRequests(email);
    setLoadingRequests(false);
    if (res.success) {
      setExistingRequests(res.requests);
    }
  };

  const handleQuickSwitch = async (role: 'PARTICIPANT' | 'ORGANIZER' | 'SUPER_ADMIN') => {
    onClose();
    await switchRoleQuickly(role);
  };

  // Submit Volunteer Application to Organizer
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setVolunteerError('');
    setReqSuccessMsg('');

    if (!reqWorkshopId) {
      setVolunteerError('Please select a workshop to volunteer for.');
      return;
    }
    if (!reqName.trim() || !reqEmail.trim()) {
      setVolunteerError('Name and Email are required.');
      return;
    }

    setSubmittingReq(true);
    const res = await requestVolunteering({
      name: reqName.trim(),
      email: reqEmail.trim().toLowerCase(),
      phoneNumber: reqPhone.trim() || undefined,
      assignedWorkshopId: reqWorkshopId,
      requestNote: reqNote.trim() || undefined,
    });
    setSubmittingReq(false);

    if (res.success) {
      if (res.alreadyApproved && res.accessCode) {
        setVolunteerCode(res.accessCode);
        setVolunteerTab('enter-code');
        showAlert(`Your application was already approved! Code: ${res.accessCode}`, 'success');
      } else {
        setReqSuccessMsg(res.message);
        fetchRequests(reqEmail.trim().toLowerCase());
      }
    } else {
      setVolunteerError(res.message || 'Failed to submit volunteering request.');
    }
  };

  // Login with Access Code provided by Organizer
  const handleVolunteerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setVolunteerError('');

    if (!volunteerCode.trim()) {
      setVolunteerError('Please enter the Access Code provided by your Workshop Organizer.');
      return;
    }

    setVerifyingVolunteer(true);
    const res = await verifyVolunteerLogin(volunteerCode.trim(), selectedOrganizerId, {
      name: volunteerName.trim() || undefined,
      email: volunteerEmail.trim().toLowerCase() || undefined,
      phoneNumber: volunteerPhone.trim() || undefined,
    });
    setVerifyingVolunteer(false);

    if (res.success) {
      setVolunteerMode(false);
      setVolunteerCode('');
      setVolunteerName('');
      setVolunteerEmail('');
      setVolunteerPhone('');
      onClose();
    } else {
      setVolunteerError(res.error || 'Invalid or revoked volunteer authorization code.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="role-selector-title"
          className="relative bg-white dark:bg-[#14231b] rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-[#DCE4D6] dark:border-[#233d2e] z-10 text-[#101410] dark:text-[#f0f5ee] transition-colors max-h-[92vh] overflow-y-auto my-auto"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-xl text-[#5E5E61] dark:text-[#8ba895] hover:text-[#101410] dark:hover:text-[#f0f5ee] hover:bg-[#E8F0DF] dark:hover:bg-[#1b3025] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#08482D]"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {!volunteerMode ? (
            <>
              {/* Header */}
              <div className="text-center mb-6 sm:mb-8 px-2 space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DAE7C7] text-[#08482D] text-xs font-heading font-semibold shadow-xs">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Choose Your Workspace</span>
                </div>
                <h2 id="role-selector-title" className="text-3xl sm:text-4xl font-heading font-extrabold text-[#101410] dark:text-[#f0f5ee] tracking-tight">
                  Who are you?
                </h2>
                <p className="text-xs sm:text-sm text-[#5E5E61] dark:text-[#8ba895] max-w-lg mx-auto">
                  Select your role to get started with Kaushalya. Dedicated portals for students, faculty organizers, and gate check-in.
                </p>
              </div>

              {/* 3 Large Role Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* 1. STUDENT CARD */}
                <motion.div
                  whileHover={{ y: -4, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectRole('PARTICIPANT')}
                  className="cursor-pointer group relative bg-[#F5F8EF]/70 dark:bg-[#1b3025]/60 p-6 rounded-3xl border border-[#DCE4D6] dark:border-[#233d2e] hover:border-[#08482D] dark:hover:border-[#9ee2b8] shadow-xs hover:shadow-xl transition-all flex flex-col justify-between focus-within:ring-2 focus-within:ring-[#08482D]"
                >
                  <div>
                    <div className="w-13 h-13 rounded-2xl bg-[#08482D] text-[#DAE7C7] flex items-center justify-center shadow-md shadow-[#08482D]/20 mb-4 group-hover:scale-105 transition-transform">
                      <GraduationCap className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-heading font-bold text-[#101410] dark:text-[#f0f5ee] group-hover:text-[#08482D] dark:group-hover:text-[#9ee2b8] transition-colors">
                      Student
                    </h3>
                    <p className="text-xs text-[#5E5E61] dark:text-[#8ba895] mt-1.5 mb-4 leading-relaxed font-medium">
                      Discover workshops and register for sessions.
                    </p>

                    <ul className="space-y-2 text-xs text-[#5E5E61] dark:text-[#8ba895]">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Free & paid technical workshops</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Instant digital QR tickets & passes</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Google Maps lab room directions</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectRole('PARTICIPANT');
                    }}
                    className="mt-6 w-full py-3 px-4 bg-[#08482D] text-[#F5F8EF] hover:bg-[#0c5c3b] font-heading font-bold text-xs rounded-2xl shadow-md shadow-[#08482D]/20 transition-all flex items-center justify-center gap-2 group-hover:shadow-lg cursor-pointer"
                  >
                    <span>Continue as Student</span>
                    <ArrowRight className="w-4 h-4 text-[#DAE7C7]" />
                  </button>
                </motion.div>

                {/* 2. FACULTY / ORGANIZER CARD */}
                <motion.div
                  whileHover={{ y: -4, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectRole('ORGANIZER')}
                  className="cursor-pointer group relative bg-[#F5F8EF]/70 dark:bg-[#1b3025]/60 p-6 rounded-3xl border border-[#DCE4D6] dark:border-[#233d2e] hover:border-[#08482D] dark:hover:border-[#9ee2b8] shadow-xs hover:shadow-xl transition-all flex flex-col justify-between focus-within:ring-2 focus-within:ring-[#08482D]"
                >
                  <div>
                    <div className="w-13 h-13 rounded-2xl bg-[#08482D] text-[#DAE7C7] flex items-center justify-center shadow-md shadow-[#08482D]/20 mb-4 group-hover:scale-105 transition-transform">
                      <Briefcase className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-heading font-bold text-[#101410] dark:text-[#f0f5ee] group-hover:text-[#08482D] dark:group-hover:text-[#9ee2b8] transition-colors">
                      Faculty / Organizer
                    </h3>
                    <p className="text-xs text-[#5E5E61] dark:text-[#8ba895] mt-1.5 mb-4 leading-relaxed font-medium">
                      Create workshops, manage registrations and track participants.
                    </p>

                    <ul className="space-y-2 text-xs text-[#5E5E61] dark:text-[#8ba895]">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Schedule free & paid sessions</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Real-time seat capacity governance</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Approve gate volunteers & CSV export</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectRole('ORGANIZER');
                    }}
                    className="mt-6 w-full py-3 px-4 bg-[#08482D] text-[#F5F8EF] hover:bg-[#0c5c3b] font-heading font-bold text-xs rounded-2xl shadow-md shadow-[#08482D]/20 transition-all flex items-center justify-center gap-2 group-hover:shadow-lg cursor-pointer"
                  >
                    <span>Continue as Organizer</span>
                    <ArrowRight className="w-4 h-4 text-[#DAE7C7]" />
                  </button>
                </motion.div>

                {/* 3. GATE VOLUNTEER CARD */}
                <motion.div
                  whileHover={{ y: -4, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSelectVolunteer}
                  className="cursor-pointer group relative bg-[#F5F8EF]/70 dark:bg-[#1b3025]/60 p-6 rounded-3xl border border-[#DCE4D6] dark:border-[#233d2e] hover:border-[#08482D] dark:hover:border-[#9ee2b8] shadow-xs hover:shadow-xl transition-all flex flex-col justify-between focus-within:ring-2 focus-within:ring-[#08482D]"
                >
                  <div>
                    <div className="w-13 h-13 rounded-2xl bg-[#08482D] text-[#DAE7C7] flex items-center justify-center shadow-md shadow-[#08482D]/20 mb-4 group-hover:scale-105 transition-transform">
                      <Scan className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-heading font-bold text-[#101410] dark:text-[#f0f5ee] group-hover:text-[#08482D] dark:group-hover:text-[#9ee2b8] transition-colors">
                      Gate Volunteer
                    </h3>
                    <p className="text-xs text-[#5E5E61] dark:text-[#8ba895] mt-1.5 mb-4 leading-relaxed font-medium">
                      Verify participant tickets and manage workshop check-in.
                    </p>

                    <ul className="space-y-2 text-xs text-[#5E5E61] dark:text-[#8ba895]">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Live camera QR ticket scanner</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Secure 6-digit access code entry</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Tamper & duplicate RSVP prevention</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectVolunteer();
                    }}
                    className="mt-6 w-full py-3 px-4 bg-[#08482D] text-[#F5F8EF] hover:bg-[#0c5c3b] font-heading font-bold text-xs rounded-2xl shadow-md shadow-[#08482D]/20 transition-all flex items-center justify-center gap-2 group-hover:shadow-lg cursor-pointer"
                  >
                    <span>Continue as Volunteer</span>
                    <ArrowRight className="w-4 h-4 text-[#DAE7C7]" />
                  </button>
                </motion.div>
              </div>

              {/* 1-Click Fast Demo Switcher Bar */}
              <div className="mt-6 pt-5 border-t border-[#DCE4D6] dark:border-[#233d2e] space-y-2.5">
                <div className="flex items-center justify-between text-xs text-[#5E5E61] dark:text-[#8ba895]">
                  <span className="font-heading font-semibold flex items-center gap-1.5 text-[#08482D] dark:text-[#9ee2b8]">
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>Instant Evaluation Personas (1-Click Switch):</span>
                  </span>
                  <span className="text-[10px]">No typing required</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => handleQuickSwitch('PARTICIPANT')}
                    className="p-2.5 rounded-xl border border-[#DCE4D6] dark:border-[#233d2e] bg-[#F5F8EF] dark:bg-[#1b3025] hover:bg-[#DAE7C7] hover:text-[#08482D] text-left transition-colors cursor-pointer"
                  >
                    <div className="text-[11px] font-heading font-bold text-[#101410] dark:text-[#f0f5ee] truncate">Aary Nikam</div>
                    <div className="text-[10px] text-[#5E5E61] dark:text-[#8ba895]">Student Participant</div>
                  </button>

                  <button
                    onClick={() => handleQuickSwitch('ORGANIZER')}
                    className="p-2.5 rounded-xl border border-[#DCE4D6] dark:border-[#233d2e] bg-[#F5F8EF] dark:bg-[#1b3025] hover:bg-[#DAE7C7] hover:text-[#08482D] text-left transition-colors"
                  >
                    <div className="text-[11px] font-heading font-bold text-[#101410] dark:text-[#f0f5ee] truncate">Dr. Sarah Lin</div>
                    <div className="text-[10px] text-[#5E5E61] dark:text-[#8ba895]">Faculty Organizer</div>
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      verifyVolunteerLogin('VOL-729104');
                    }}
                    className="p-2.5 rounded-xl border border-[#DCE4D6] dark:border-[#233d2e] bg-[#F5F8EF] dark:bg-[#1b3025] hover:bg-[#DAE7C7] hover:text-[#08482D] text-left transition-colors"
                  >
                    <div className="text-[11px] font-heading font-bold text-[#101410] dark:text-[#f0f5ee] truncate">Marcus Gate</div>
                    <div className="text-[10px] text-[#5E5E61] dark:text-[#8ba895]">Gate Volunteer (Code: VOL-729104)</div>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* VOLUNTEER WORKSPACE: 2-STEP FLOW (REQUEST -> CODE) */
            <div className="space-y-4 max-w-lg mx-auto py-1">
              <button
                type="button"
                onClick={() => {
                  setVolunteerMode(false);
                  setVolunteerError('');
                  setReqSuccessMsg('');
                }}
                className="text-xs font-heading font-semibold text-[#5E5E61] dark:text-[#95ad9e] hover:text-[#101410] dark:hover:text-[#f0f5ee] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Role Selection</span>
              </button>

              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-[#DAE7C7] text-[#08482D] flex items-center justify-center mx-auto mb-2 shadow-xs">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-heading font-bold text-[#101410] dark:text-[#f0f5ee]">
                  Volunteer Gate Station
                </h3>
                <p className="text-xs text-[#5E5E61] dark:text-[#8ba895] max-w-md mx-auto">
                  Step 1: Request volunteering. Step 2: Once approved, enter your 6-digit Access Code to unlock the webcam scanner!
                </p>
              </div>

              {/* Two Tabs */}
              <div className="flex rounded-2xl bg-[#F5F8EF] dark:bg-[#1b3025] p-1 border border-[#DCE4D6] dark:border-[#233d2e]">
                <button
                  type="button"
                  onClick={() => {
                    setVolunteerTab('request');
                    setVolunteerError('');
                  }}
                  className={`flex-1 py-2 text-xs font-heading font-semibold rounded-xl transition-all ${
                    volunteerTab === 'request'
                      ? 'bg-[#08482D] text-[#F5F8EF] shadow-xs'
                      : 'text-[#5E5E61] dark:text-[#8ba895]'
                  }`}
                >
                  1. Request Volunteering
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setVolunteerTab('enter-code');
                    setVolunteerError('');
                  }}
                  className={`flex-1 py-2 text-xs font-heading font-semibold rounded-xl transition-all ${
                    volunteerTab === 'enter-code'
                      ? 'bg-[#08482D] text-[#F5F8EF] shadow-xs'
                      : 'text-[#5E5E61] dark:text-[#8ba895]'
                  }`}
                >
                  2. Enter Access Code
                </button>
              </div>

              {volunteerError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs rounded-2xl">
                  {volunteerError}
                </div>
              )}

              {volunteerTab === 'request' ? (
                <form onSubmit={handleSubmitRequest} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-heading font-semibold text-[#101410] dark:text-[#f0f5ee] mb-1">
                      Target Academic Workshop *
                    </label>
                    <select
                      value={reqWorkshopId}
                      onChange={(e) => setReqWorkshopId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-[#DCE4D6] dark:border-[#233d2e] bg-white dark:bg-[#1b3025] text-xs text-[#101410] dark:text-[#f0f5ee]"
                    >
                      {availableWorkshops.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.title} ({w.date})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-heading font-semibold text-[#101410] dark:text-[#f0f5ee] mb-1">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={reqName}
                        onChange={(e) => setReqName(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-[#DCE4D6] dark:border-[#233d2e] bg-[#F5F8EF]/60 dark:bg-[#1b3025] text-xs text-[#101410] dark:text-[#f0f5ee]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-heading font-semibold text-[#101410] dark:text-[#f0f5ee] mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={reqEmail}
                        onChange={(e) => setReqEmail(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-[#DCE4D6] dark:border-[#233d2e] bg-[#F5F8EF]/60 dark:bg-[#1b3025] text-xs text-[#101410] dark:text-[#f0f5ee]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-heading font-semibold text-[#101410] dark:text-[#f0f5ee] mb-1">
                      Availability / Reason Note
                    </label>
                    <textarea
                      value={reqNote}
                      onChange={(e) => setReqNote(e.target.value)}
                      placeholder="e.g. Can be at venue gate 30 minutes early to scan passes..."
                      rows={2}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#DCE4D6] dark:border-[#233d2e] bg-[#F5F8EF]/60 dark:bg-[#1b3025] text-xs text-[#101410] dark:text-[#f0f5ee]"
                    />
                  </div>

                  {reqSuccessMsg && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs rounded-2xl flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span>{reqSuccessMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submittingReq}
                    className="w-full py-2.5 bg-[#08482D] hover:bg-[#0c5c3b] disabled:opacity-50 text-[#F5F8EF] font-heading font-semibold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submittingReq ? 'Submitting Application...' : 'Send Volunteer Request'}</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVolunteerLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-heading font-semibold text-[#101410] dark:text-[#f0f5ee] mb-1">
                      Gate Volunteer Access Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={volunteerCode}
                      onChange={(e) => setVolunteerCode(e.target.value.toUpperCase())}
                      placeholder="e.g. VOL-DEMO1 or VOL-729104"
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-[#DCE4D6] dark:border-[#233d2e] bg-[#F5F8EF]/60 dark:bg-[#1b3025] text-[#101410] dark:text-[#f0f5ee] font-mono text-xs uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#08482D]"
                    />
                    <p className="text-[11px] text-[#5E5E61] dark:text-[#8ba895] mt-1">
                      Issued by your faculty workshop organizer upon approval.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={verifyingVolunteer || !volunteerCode.trim()}
                    className="w-full py-2.5 bg-[#08482D] hover:bg-[#0c5c3b] disabled:opacity-50 text-[#F5F8EF] font-heading font-semibold text-xs rounded-2xl shadow-md shadow-[#08482D]/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Scan className="w-4 h-4" />
                    <span>{verifyingVolunteer ? 'Verifying Code...' : 'Verify Code & Launch Gate Scanner'}</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
