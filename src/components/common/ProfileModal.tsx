import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, User as UserIcon, Mail, Phone, Building, ShieldCheck, Check, Loader2, Sparkles, Calendar, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { validateIndianPhone, validateFullName } from '../../utils/validation';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, currentVolunteer, updateProfile, updateVolunteerProfile, showAlert } = useApp();

  const isVolunteer = Boolean(currentVolunteer && !currentUser);
  const activeName = isVolunteer ? currentVolunteer?.name : currentUser?.fullName;
  const activeEmail = isVolunteer ? currentVolunteer?.email : currentUser?.email;
  const activePhone = isVolunteer ? currentVolunteer?.phoneNumber : currentUser?.phoneNumber;
  const activeRole = isVolunteer ? 'VOLUNTEER' : currentUser?.role || 'PARTICIPANT';

  const [fullName, setFullName] = useState(activeName || '');
  const [phoneNumber, setPhoneNumber] = useState(activePhone || '');
  const [department, setDepartment] = useState(currentUser?.department || '');
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFullName(activeName || '');
      setPhoneNumber(activePhone || '');
      setDepartment(currentUser?.department || '');
      setNameError('');
      setPhoneError('');
    }
  }, [isOpen, activeName, activePhone, currentUser]);

  if (!isOpen || (!currentUser && !currentVolunteer)) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameVal = validateFullName(fullName);
    if (!nameVal.isValid) {
      setNameError(nameVal.error || 'Please enter a valid full name.');
      return;
    }
    setNameError('');

    const phoneVal = validateIndianPhone(phoneNumber);
    if (!phoneVal.isValid) {
      setPhoneError(phoneVal.error || 'Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    setPhoneError('');

    const cleanPhone = phoneVal.cleanPhone || phoneNumber.trim();

    setSaving(true);
    try {
      if (isVolunteer && currentVolunteer) {
        await updateVolunteerProfile(currentVolunteer.id, fullName.trim(), currentVolunteer.email, cleanPhone);
      } else if (currentUser) {
        await updateProfile(fullName.trim(), department.trim(), cleanPhone);
      }
      showAlert('Profile updated successfully!', 'success');
      onClose();
    } catch {
      showAlert('Could not update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getRoleLabel = () => {
    if (isVolunteer) return 'Gate Volunteer Attendant';
    if (activeRole === 'ORGANIZER') return 'Faculty Workshop Organizer';
    if (activeRole === 'SUPER_ADMIN') return 'Super Administrator';
    return 'Student Participant';
  };

  const inputCls =
    'w-full pl-10 pr-3.5 py-2.5 rounded-xl border-2 border-[#101D32] bg-[#FFF5E9] text-[#101D32] text-xs font-medium placeholder:text-[#101D32]/50 focus:outline-none focus:ring-2 focus:ring-[#F4511E] transition';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#101D32]/60 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-[8px_8px_0px_0px_#101D32] border-2 border-[#101D32] z-10 text-xs text-[#101D32] max-h-[92vh] overflow-y-auto my-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-lg border border-[#101D32] text-[#101D32] hover:bg-[#FFD6B0] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Profile Header & Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-[#F4511E] text-white font-heading font-extrabold text-2xl flex items-center justify-center border-2 border-[#101D32] shadow-[3px_3px_0px_0px_#101D32] shrink-0 uppercase">
              {(fullName || 'U').charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-heading font-extrabold text-[#101D32]">
                  {fullName || 'My Account'}
                </h2>
                <ShieldCheck className="w-4 h-4 text-[#F4511E]" />
              </div>
              <p className="text-xs text-[#101D32]/70 truncate max-w-[200px] font-mono">
                {activeEmail}
              </p>
              <div className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-heading font-extrabold bg-[#FFD6B0] text-[#101D32] border border-[#101D32]">
                <Sparkles className="w-3 h-3 text-[#F4511E]" />
                <span>{getRoleLabel()}</span>
              </div>
            </div>
          </div>

          {/* Volunteer specific notice */}
          {isVolunteer && currentVolunteer && (
            <div className="mb-4 p-3.5 bg-[#FFD6B0] border-2 border-[#101D32] rounded-xl text-[11px] space-y-1">
              <div className="font-heading font-extrabold text-[#101D32] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#F4511E]" />
                <span>Assigned Gate Workshop</span>
              </div>
              <p className="text-[#101D32] font-bold">
                {currentVolunteer.assignedWorkshopTitle}
              </p>
              <div className="pt-1 text-[10px] text-[#101D32]/80">
                Host: <strong className="text-[#101D32]">{currentVolunteer.organizerName}</strong> · Access Code:{' '}
                <span className="font-mono font-bold text-[#F4511E]">{currentVolunteer.accessCode}</span>
              </div>
            </div>
          )}

          {/* Profile Edit Form */}
          <form onSubmit={handleSave} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block font-heading font-bold text-[#101D32] mb-1">
                Full Name *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#101D32]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (nameError) setNameError('');
                  }}
                  placeholder="e.g. Alex Morgan"
                  className={`${inputCls} ${nameError ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
              </div>
              {nameError && (
                <p className="mt-1 text-[11px] text-red-600 font-bold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{nameError}</span>
                </p>
              )}
            </div>

            {/* Email (Read-Only) */}
            <div>
              <label className="block font-heading font-bold text-[#101D32] mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#101D32]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  disabled
                  value={activeEmail || ''}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border-2 border-[#101D32]/30 bg-[#FFF5E9]/50 text-[#101D32]/50 cursor-not-allowed font-mono text-[11px]"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-heading font-bold text-[#101D32]">
                  Mobile Number (10 Digits) *
                </label>
                <span className="text-[10px] text-[#101D32]/60 font-mono">Indian Format (6-9)</span>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-xs font-bold text-[#101D32]/70 select-none">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={phoneNumber.replace(/^\+91\s*/, '')}
                  onChange={(e) => {
                    const onlyNums = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setPhoneNumber(onlyNums);
                    if (phoneError) setPhoneError('');
                  }}
                  placeholder="9820012345"
                  className={`w-full pl-12 pr-3.5 py-2.5 rounded-xl border-2 border-[#101D32] bg-[#FFF5E9] text-[#101D32] text-xs font-medium placeholder:text-[#101D32]/40 focus:outline-none focus:ring-2 focus:ring-[#F4511E] transition ${
                    phoneError ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                />
              </div>
              {phoneError ? (
                <p className="mt-1 text-[11px] text-red-600 font-bold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{phoneError}</span>
                </p>
              ) : (
                <p className="mt-1 text-[10px] text-[#101D32]/60">
                  Accepts exactly 10 digits starting with 6, 7, 8, or 9.
                </p>
              )}
            </div>

            {/* Department */}
            {!isVolunteer && (
              <div>
                <label className="block font-heading font-bold text-[#101D32] mb-1">
                  Department / Academic Unit
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-[#101D32]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Computer Science & AI"
                    className={inputCls}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 py-2.5 border-2 border-[#101D32] hover:bg-[#FFD6B0] rounded-xl font-heading font-bold text-[#101D32] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="w-1/2 py-2.5 bg-[#F4511E] hover:bg-[#E84316] text-white font-heading font-extrabold rounded-xl border-2 border-[#101D32] shadow-[3px_3px_0px_0px_#101D32] neo-btn transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
