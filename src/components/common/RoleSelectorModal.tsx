import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  GraduationCap,
  Briefcase,
  ArrowRight,
  CheckCircle2,
  X,
  Scan,
  KeyRound,
  ArrowLeft,
  User as UserIcon,
  Send,
  CheckCircle,
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
  const [, setExistingRequests] = useState<Volunteer[]>([]);
  const [, setLoadingRequests] = useState(false);

  // Enter Code form state
  const [selectedOrganizerId] = useState<string>('ALL');
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
          className="fixed inset-0 bg-[#101D32]/70 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="role-selector-title"
          className="relative bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-[8px_8px_0px_0px_#101D32] border-2 border-[#101D32] z-10 text-[#101410] max-h-[92vh] overflow-y-auto my-auto"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-lg text-[#101D32] hover:bg-[#FFD6B0] border-2 border-transparent hover:border-[#101D32] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {!volunteerMode ? (
            <>
              {/* Header */}
              <div className="text-center mb-6 sm:mb-8 px-2 space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#FFD6B0] border border-[#101D32] text-[#101D32] text-xs font-heading font-extrabold uppercase tracking-wider">
                  <Briefcase className="w-3.5 h-3.5 text-[#F4511E]" />
                  <span>Choose Your Workspace</span>
                </div>
                <h2 id="role-selector-title" className="text-3xl sm:text-4xl font-heading font-extrabold text-[#101D32] tracking-tight">
                  Who are you?
                </h2>
                <p className="text-xs sm:text-sm text-[#101D32]/80 max-w-lg mx-auto font-sans">
                  Select your role to get started with Kaushalya. Dedicated portals for students, faculty organizers, and gate check-in.
                </p>
              </div>

              {/* 3 Large Role Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* 1. STUDENT CARD */}
                <div
                  onClick={() => handleSelectRole('PARTICIPANT')}
                  className="cursor-pointer group relative bg-[#FFF5E9] p-6 rounded-xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#101D32] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-lg bg-[#F4511E] text-white border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] flex items-center justify-center mb-4">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-heading font-extrabold text-[#101410] group-hover:text-[#F4511E] transition-colors">
                      Student
                    </h3>
                    <p className="text-xs text-[#101D32]/80 mt-1.5 mb-4 leading-relaxed font-sans">
                      Discover workshops and register for technical sessions.
                    </p>

                    <ul className="space-y-2 text-xs text-[#101D32]/80 font-sans">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#F4511E] shrink-0" />
                        <span>Free &amp; paid workshops</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#F4511E] shrink-0" />
                        <span>Instant digital QR passes</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#F4511E] shrink-0" />
                        <span>Directions &amp; receipts</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectRole('PARTICIPANT');
                    }}
                    className="mt-6 w-full py-2.5 px-4 bg-[#F4511E] text-white hover:bg-[#E84316] font-heading font-bold text-xs rounded-lg border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Continue as Student</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* 2. FACULTY / ORGANIZER CARD */}
                <div
                  onClick={() => handleSelectRole('ORGANIZER')}
                  className="cursor-pointer group relative bg-[#FFF5E9] p-6 rounded-xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#101D32] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-lg bg-[#101D32] text-white border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] flex items-center justify-center mb-4">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-heading font-extrabold text-[#101410] group-hover:text-[#F4511E] transition-colors">
                      Faculty Organizer
                    </h3>
                    <p className="text-xs text-[#101D32]/80 mt-1.5 mb-4 leading-relaxed font-sans">
                      Create workshops, manage registrations and track participants.
                    </p>

                    <ul className="space-y-2 text-xs text-[#101D32]/80 font-sans">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#F4511E] shrink-0" />
                        <span>Schedule technical sessions</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#F4511E] shrink-0" />
                        <span>Real-time seat capacity</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#F4511E] shrink-0" />
                        <span>Manage gate volunteers</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectRole('ORGANIZER');
                    }}
                    className="mt-6 w-full py-2.5 px-4 bg-[#101D32] text-white hover:bg-[#101D32]/90 font-heading font-bold text-xs rounded-lg border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Continue as Organizer</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* 3. GATE VOLUNTEER CARD */}
                <div
                  onClick={handleSelectVolunteer}
                  className="cursor-pointer group relative bg-[#FFF5E9] p-6 rounded-xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#101D32] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-lg bg-[#FFD6B0] text-[#101D32] border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] flex items-center justify-center mb-4">
                      <Scan className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-heading font-extrabold text-[#101410] group-hover:text-[#F4511E] transition-colors">
                      Gate Volunteer
                    </h3>
                    <p className="text-xs text-[#101D32]/80 mt-1.5 mb-4 leading-relaxed font-sans">
                      Verify participant tickets and manage workshop check-in.
                    </p>

                    <ul className="space-y-2 text-xs text-[#101D32]/80 font-sans">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#F4511E] shrink-0" />
                        <span>Camera QR ticket scanner</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#F4511E] shrink-0" />
                        <span>Secure access code login</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#F4511E] shrink-0" />
                        <span>Duplicate check prevention</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectVolunteer();
                    }}
                    className="mt-6 w-full py-2.5 px-4 bg-white text-[#101D32] hover:bg-[#FFD6B0] font-heading font-bold text-xs rounded-lg border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Continue as Volunteer</span>
                    <ArrowRight className="w-4 h-4 text-[#101D32]" />
                  </button>
                </div>
              </div>

              {/* 1-Click Fast Switcher Bar */}
              <div className="mt-6 pt-5 border-t-2 border-[#101D32]/20 space-y-2.5 font-sans">
                <div className="flex items-center justify-between text-xs text-[#101D32]">
                  <span className="font-heading font-bold flex items-center gap-1.5 text-[#101D32]">
                    <UserIcon className="w-3.5 h-3.5 text-[#F4511E]" />
                    <span>Instant Evaluation Personas (1-Click Switch):</span>
                  </span>
                  <span className="text-[10px] text-[#101D32]/70 font-semibold">No typing required</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => handleQuickSwitch('PARTICIPANT')}
                    className="p-2.5 rounded-lg border-2 border-[#101D32] bg-white hover:bg-[#FFD6B0] text-left transition-colors cursor-pointer shadow-[2px_2px_0px_0px_#101D32]"
                  >
                    <div className="text-[11px] font-heading font-extrabold text-[#101D32] truncate">Aary Nikam</div>
                    <div className="text-[10px] text-[#101D32]/70">Student (GNIMS MCA)</div>
                  </button>

                  <button
                    onClick={() => handleQuickSwitch('ORGANIZER')}
                    className="p-2.5 rounded-lg border-2 border-[#101D32] bg-white hover:bg-[#FFD6B0] text-left transition-colors cursor-pointer shadow-[2px_2px_0px_0px_#101D32]"
                  >
                    <div className="text-[11px] font-heading font-extrabold text-[#101D32] truncate">Dr. Sarah Lin</div>
                    <div className="text-[10px] text-[#101D32]/70">Faculty Organizer</div>
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      verifyVolunteerLogin('VOL-729104');
                    }}
                    className="p-2.5 rounded-lg border-2 border-[#101D32] bg-white hover:bg-[#FFD6B0] text-left transition-colors cursor-pointer shadow-[2px_2px_0px_0px_#101D32]"
                  >
                    <div className="text-[11px] font-heading font-extrabold text-[#101D32] truncate">Marcus Gate</div>
                    <div className="text-[10px] text-[#101D32]/70">Gate Volunteer (VOL-729104)</div>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* VOLUNTEER WORKSPACE: 2-STEP FLOW (REQUEST -> CODE) */
            <div className="space-y-4 max-w-lg mx-auto py-1 font-sans">
              <button
                type="button"
                onClick={() => {
                  setVolunteerMode(false);
                  setVolunteerError('');
                  setReqSuccessMsg('');
                }}
                className="text-xs font-heading font-bold text-[#101D32] hover:text-[#F4511E] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Role Selection</span>
              </button>

              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-lg bg-[#FFD6B0] border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] text-[#101D32] flex items-center justify-center mx-auto mb-2">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-heading font-extrabold text-[#101410]">
                  Volunteer Gate Station
                </h3>
                <p className="text-xs text-[#101D32]/80 max-w-md mx-auto">
                  Step 1: Request volunteering. Step 2: Once approved, enter your access code to unlock the webcam scanner!
                </p>
              </div>

              {/* Two Tabs */}
              <div className="flex rounded-lg bg-[#FFF5E9] p-1 border-2 border-[#101D32]">
                <button
                  type="button"
                  onClick={() => {
                    setVolunteerTab('request');
                    setVolunteerError('');
                  }}
                  className={`flex-1 py-2 text-xs font-heading font-bold rounded-md transition-all ${
                    volunteerTab === 'request'
                      ? 'bg-[#F4511E] text-white shadow-[2px_2px_0px_0px_#101D32] border border-[#101D32]'
                      : 'text-[#101D32] hover:bg-[#FFD6B0]'
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
                  className={`flex-1 py-2 text-xs font-heading font-bold rounded-md transition-all ${
                    volunteerTab === 'enter-code'
                      ? 'bg-[#F4511E] text-white shadow-[2px_2px_0px_0px_#101D32] border border-[#101D32]'
                      : 'text-[#101D32] hover:bg-[#FFD6B0]'
                  }`}
                >
                  2. Enter Access Code
                </button>
              </div>

              {volunteerError && (
                <div className="p-3 bg-[#FFD6B0] border-2 border-[#101D32] text-[#101D32] text-xs font-semibold rounded-lg shadow-[2px_2px_0px_0px_#101D32]">
                  {volunteerError}
                </div>
              )}

              {volunteerTab === 'request' ? (
                <form onSubmit={handleSubmitRequest} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-heading font-bold text-[#101410] mb-1">
                      Target Academic Workshop *
                    </label>
                    <select
                      value={reqWorkshopId}
                      onChange={(e) => setReqWorkshopId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border-2 border-[#101D32] bg-white text-xs text-[#101410] font-sans font-medium"
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
                      <label className="block text-xs font-heading font-bold text-[#101410] mb-1">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={reqName}
                        onChange={(e) => setReqName(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-lg border-2 border-[#101D32] bg-white text-xs text-[#101410]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-heading font-bold text-[#101410] mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={reqEmail}
                        onChange={(e) => setReqEmail(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-lg border-2 border-[#101D32] bg-white text-xs text-[#101410]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-heading font-bold text-[#101410] mb-1">
                      Availability / Reason Note
                    </label>
                    <textarea
                      value={reqNote}
                      onChange={(e) => setReqNote(e.target.value)}
                      placeholder="e.g. Can be at venue gate 30 minutes early to scan passes..."
                      rows={2}
                      className="w-full px-3.5 py-2 rounded-lg border-2 border-[#101D32] bg-white text-xs text-[#101410]"
                    />
                  </div>

                  {reqSuccessMsg && (
                    <div className="p-3 bg-[#FFF5E9] border-2 border-[#101D32] text-[#101D32] text-xs font-bold rounded-lg flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 shrink-0 text-[#F4511E]" />
                      <span>{reqSuccessMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submittingReq}
                    className="w-full py-2.5 bg-[#F4511E] hover:bg-[#E84316] disabled:opacity-50 text-white font-heading font-bold text-xs rounded-lg border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submittingReq ? 'Submitting Application...' : 'Send Volunteer Request'}</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVolunteerLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-heading font-bold text-[#101410] mb-1">
                      Gate Volunteer Access Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={volunteerCode}
                      onChange={(e) => setVolunteerCode(e.target.value.toUpperCase())}
                      placeholder="e.g. VOL-DEMO1 or VOL-729104"
                      className="w-full px-3.5 py-2.5 rounded-lg border-2 border-[#101D32] bg-white text-[#101410] font-mono text-xs uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#F4511E]"
                    />
                    <p className="text-[11px] text-[#101D32]/70 mt-1">
                      Issued by your faculty workshop organizer upon approval.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={verifyingVolunteer || !volunteerCode.trim()}
                    className="w-full py-2.5 bg-[#F4511E] hover:bg-[#E84316] disabled:opacity-50 text-white font-heading font-bold text-xs rounded-lg border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] transition-all flex items-center justify-center gap-2 cursor-pointer"
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
