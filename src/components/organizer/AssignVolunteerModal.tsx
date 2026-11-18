import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, UserCheck, KeyRound, Copy, Check, AlertCircle } from 'lucide-react';
import { Workshop } from '../../types';
import { validateIndianPhone, validateFullName, validateEmail } from '../../utils/validation';

interface AssignVolunteerModalProps {
  isOpen: boolean;
  onClose: () => void;
  workshops: Workshop[];
  onAssign: (data: { name: string; email: string; phoneNumber?: string; assignedWorkshopId: string }) => Promise<{ success: boolean; message: string; accessCode?: string }>;
}

export const AssignVolunteerModal: React.FC<AssignVolunteerModalProps> = ({
  isOpen,
  onClose,
  workshops,
  onAssign,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [assignedWorkshopId, setAssignedWorkshopId] = useState(workshops[0]?.id || '');
  const [submitting, setSubmitting] = useState(false);
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (workshops.length > 0) {
        if (!assignedWorkshopId || !workshops.some((w) => w.id === assignedWorkshopId)) {
          setAssignedWorkshopId(workshops[0].id);
        }
      } else {
        setAssignedWorkshopId('');
      }
      setError('');
      setCreatedCode(null);
      setCopied(false);
    }
  }, [isOpen, workshops]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const nameVal = validateFullName(name);
    if (!nameVal.isValid) {
      setError(nameVal.error || 'Volunteer name is required.');
      return;
    }

    const emailVal = validateEmail(email);
    if (!emailVal.isValid) {
      setError(emailVal.error || 'Valid volunteer email is required.');
      return;
    }

    let cleanPhone = '';
    if (phoneNumber.trim()) {
      const phoneVal = validateIndianPhone(phoneNumber);
      if (!phoneVal.isValid) {
        setError(phoneVal.error || 'Please enter a valid 10-digit Indian mobile number.');
        return;
      }
      cleanPhone = phoneVal.cleanPhone || phoneNumber.trim();
    }

    const targetWorkshopId = assignedWorkshopId || workshops[0]?.id;
    if (!targetWorkshopId) {
      setError('Please select an academic workshop.');
      return;
    }

    setSubmitting(true);
    const result = await onAssign({
      name: name.trim(),
      email: email.trim(),
      phoneNumber: cleanPhone,
      assignedWorkshopId: targetWorkshopId,
    });

    setSubmitting(false);
    if (result.success && result.accessCode) {
      setCreatedCode(result.accessCode);
    } else if (result.success) {
      onClose();
    } else {
      setError(result.message || 'Failed to appoint volunteer.');
    }
  };

  const handleCopy = () => {
    if (createdCode) {
      navigator.clipboard.writeText(createdCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDone = () => {
    setCreatedCode(null);
    setName('');
    setEmail('');
    setPhoneNumber('');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={createdCode ? handleDone : onClose}
          className="fixed inset-0 bg-[#101D32]/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative bg-[#FFF5E9] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-[8px_8px_0px_0px_#101D32] border-2 border-[#101D32] z-10 text-xs text-[#101D32] max-h-[92vh] overflow-y-auto my-auto"
        >
          <button
            onClick={createdCode ? handleDone : onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-[#101D32] hover:bg-[#FFD6B0] border-2 border-transparent hover:border-[#101D32] transition-all"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {!createdCode ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFD6B0] text-[#101D32] text-xs font-mono font-bold border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32]">
                    <UserCheck className="w-3.5 h-3.5 text-[#F4511E]" />
                    <span>Appoint Gate Volunteer</span>
                  </span>
                </div>
                <h3 className="text-xl font-heading font-black text-[#101410]">
                  Assign Gate Volunteer
                </h3>
                <p className="text-xs text-[#101D32]/75 mt-1 leading-relaxed font-medium">
                  Volunteers receive a unique access code to unlock the camera gate scanner and verify passes for your workshops.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-xl text-rose-700 text-xs font-bold">
                  {error}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block font-heading font-bold text-[#101D32] mb-1.5">
                  Volunteer Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Marcus Vance"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#101D32] bg-white text-[#101D32] font-medium shadow-[2px_2px_0px_0px_#101D32] focus:outline-none focus:bg-[#FFF5E9]"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block font-heading font-bold text-[#101D32] mb-1.5">
                  Volunteer Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. marcus@university.edu"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#101D32] bg-white text-[#101D32] font-medium shadow-[2px_2px_0px_0px_#101D32] focus:outline-none focus:bg-[#FFF5E9]"
                />
              </div>

              {/* Phone Number */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-heading font-bold text-[#101D32]">
                    Volunteer Mobile (10 Digits)
                  </label>
                  <span className={`text-[10px] font-mono font-bold ${phoneNumber.replace(/\D/g, '').length === 10 ? 'text-emerald-700' : 'text-[#101D32]/60'}`}>
                    {phoneNumber.replace(/\D/g, '').length}/10 digits
                  </span>
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs font-bold text-[#101D32]/70 select-none">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={16}
                    value={phoneNumber.replace(/^\+91\s*/, '')}
                    onChange={(e) => {
                      let val = e.target.value;
                      let digits = val.replace(/\D/g, '');
                      if (digits.startsWith('91') && digits.length > 10) {
                        digits = digits.substring(2);
                      } else if (digits.startsWith('0') && digits.length > 10) {
                        digits = digits.substring(1);
                      }
                      setPhoneNumber(digits.slice(0, 10));
                      if (error) setError('');
                    }}
                    placeholder="9820012345"
                    className="w-full pl-12 pr-3.5 py-2.5 rounded-xl border-2 border-[#101D32] bg-white text-[#101D32] font-medium shadow-[2px_2px_0px_0px_#101D32] focus:outline-none focus:bg-[#FFF5E9]"
                  />
                </div>
                <p className="text-[11px] text-[#101D32]/70 mt-1">
                  Optional. For SMS gate pass verification and coordinator alerts.
                </p>
              </div>

              {/* Workshop Selection */}
              <div>
                <label className="block font-heading font-bold text-[#101D32] mb-1.5">
                  Assigned Academic Workshop *
                </label>
                {workshops.length === 0 ? (
                  <div className="p-3 bg-amber-50 border-2 border-amber-300 rounded-xl text-amber-800 text-xs font-medium">
                    No scheduled workshops found. Please create a workshop first before assigning a volunteer.
                  </div>
                ) : (
                  <select
                    value={assignedWorkshopId || workshops[0]?.id}
                    onChange={(e) => setAssignedWorkshopId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#101D32] bg-white text-[#101D32] font-bold shadow-[2px_2px_0px_0px_#101D32] focus:outline-none focus:bg-[#FFF5E9]"
                  >
                    {workshops.map((ws) => (
                      <option key={ws.id} value={ws.id}>
                        {ws.title} — {ws.date} ({ws.venue})
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-[11px] text-[#101D32]/75 mt-1 font-medium">
                  The volunteer will strictly be restricted to scanning passes for this specific session.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border-2 border-[#101D32] bg-white hover:bg-[#FFD6B0] text-[#101D32] font-heading font-bold shadow-[2px_2px_0px_0px_#101D32] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || workshops.length === 0}
                  className="px-5 py-2.5 rounded-xl bg-[#F4511E] hover:bg-[#E84316] disabled:opacity-50 text-white font-heading font-extrabold border-2 border-[#101D32] shadow-[3px_3px_0px_0px_#101D32] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
                >
                  {submitting ? 'Generating Passcode...' : 'Appoint Volunteer'}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-4 py-2">
              <div className="w-14 h-14 rounded-2xl bg-[#FFD6B0] text-[#101D32] border-2 border-[#101D32] flex items-center justify-center mx-auto shadow-[3px_3px_0px_0px_#101D32]">
                <KeyRound className="w-7 h-7 text-[#F4511E]" />
              </div>

              <div>
                <h3 className="text-xl font-heading font-black text-[#101410]">
                  Volunteer Appointed!
                </h3>
                <p className="text-xs text-[#101D32]/75 mt-1 font-medium">
                  Share this Gate Access Code with <strong>{name}</strong>.
                </p>
              </div>

              {/* Code Display Box */}
              <div className="p-5 rounded-2xl bg-white border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] space-y-2">
                <div className="text-[11px] font-heading font-bold uppercase tracking-wider text-[#101D32]/75">
                  Gate Authorization Access Code
                </div>
                <div className="text-2xl sm:text-3xl font-mono font-black text-[#F4511E] tracking-wider">
                  {createdCode}
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-4 py-2 bg-[#FFF5E9] hover:bg-[#FFD6B0] border-2 border-[#101D32] rounded-xl text-xs font-heading font-bold text-[#101D32] shadow-[2px_2px_0px_0px_#101D32] hover:translate-x-[1px] hover:translate-y-[1px] transition-all inline-flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#F4511E]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Access Code'}</span>
                </button>
              </div>

              <p className="text-[11px] text-[#101D32]/75 leading-relaxed text-left font-medium">
                💡 Instructions: The volunteer selects <strong>"Login as Volunteer"</strong>, chooses your organization, and pastes this code to unlock the camera gate scanner.
              </p>

              <button
                type="button"
                onClick={handleDone}
                className="w-full py-3 bg-[#F4511E] hover:bg-[#E84316] text-white rounded-xl font-heading font-extrabold text-xs border-2 border-[#101D32] shadow-[3px_3px_0px_0px_#101D32] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
