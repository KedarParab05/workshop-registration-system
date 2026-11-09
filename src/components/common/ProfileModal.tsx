import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, User as UserIcon, Mail, Phone, Building, ShieldCheck, Check, Loader2, Sparkles, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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

  useEffect(() => {
    if (isOpen) {
      setFullName(activeName || '');
      setPhoneNumber(activePhone || '');
      setDepartment(currentUser?.department || '');
    }
  }, [isOpen, activeName, activePhone, currentUser]);

  if (!isOpen || (!currentUser && !currentVolunteer)) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isVolunteer && currentVolunteer) {
        await updateVolunteerProfile(currentVolunteer.id, fullName, currentVolunteer.email, phoneNumber);
      } else if (currentUser) {
        await updateProfile(fullName, department, phoneNumber);
      }
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
    'w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-[#DCE4D6] dark:border-[#233d2e] bg-[#F5F8EF]/60 dark:bg-[#1b3025] text-[#101410] dark:text-[#f0f5ee] text-xs placeholder:text-[#5E5E61] focus:outline-none focus:ring-2 focus:ring-[#08482D] transition';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative bg-white dark:bg-[#14231b] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#DCE4D6] dark:border-[#233d2e] z-10 text-xs text-[#101410] dark:text-[#f0f5ee] transition-colors max-h-[92vh] overflow-y-auto my-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-[#5E5E61] dark:text-[#8ba895] hover:text-[#101410] dark:hover:text-[#f0f5ee] hover:bg-[#E8F0DF] dark:hover:bg-[#1b3025] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Profile Header & Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#08482D] text-[#DAE7C7] font-heading font-extrabold text-2xl flex items-center justify-center shadow-md shadow-[#08482D]/20 shrink-0 uppercase">
              {(fullName || 'U').charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-heading font-bold text-[#101410] dark:text-[#f0f5ee]">
                  {fullName || 'My Account'}
                </h2>
                <ShieldCheck className="w-4 h-4 text-[#08482D] dark:text-[#9ee2b8]" />
              </div>
              <p className="text-xs text-[#5E5E61] dark:text-[#8ba895] truncate max-w-[200px] font-mono">
                {activeEmail}
              </p>
              <div className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-heading font-bold bg-[#DAE7C7] text-[#08482D]">
                <Sparkles className="w-3 h-3" />
                <span>{getRoleLabel()}</span>
              </div>
            </div>
          </div>

          {/* Volunteer specific notice */}
          {isVolunteer && currentVolunteer && (
            <div className="mb-4 p-3.5 bg-[#E8F0DF] dark:bg-[#1b3025] border border-[#DAE7C7] dark:border-[#233d2e] rounded-2xl text-[11px] space-y-1">
              <div className="font-heading font-bold text-[#08482D] dark:text-[#9ee2b8] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Assigned Gate Workshop</span>
              </div>
              <p className="text-[#101410] dark:text-[#f0f5ee] font-medium">
                {currentVolunteer.assignedWorkshopTitle}
              </p>
              <div className="pt-1 text-[10px] text-[#5E5E61] dark:text-[#8ba895]">
                Host: <strong className="text-[#101410] dark:text-[#f0f5ee]">{currentVolunteer.organizerName}</strong> · Access Code:{' '}
                <span className="font-mono font-bold text-[#08482D] dark:text-[#9ee2b8]">{currentVolunteer.accessCode}</span>
              </div>
            </div>
          )}

          {/* Profile Edit Form */}
          <form onSubmit={handleSave} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block font-heading font-semibold text-[#101410] dark:text-[#f0f5ee] mb-1">
                Full Name *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#5E5E61] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className={inputCls}
                />
              </div>
            </div>

            {/* Email (Read-Only) */}
            <div>
              <label className="block font-heading font-semibold text-[#101410] dark:text-[#f0f5ee] mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#5E5E61] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  disabled
                  value={activeEmail || ''}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-[#DCE4D6] dark:border-[#233d2e] bg-[#F5F8EF] dark:bg-[#1b3025]/50 text-[#5E5E61] dark:text-[#8ba895] cursor-not-allowed font-mono text-[11px]"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block font-heading font-semibold text-[#101410] dark:text-[#f0f5ee] mb-1">
                Phone Number (WhatsApp / Mobile) *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#5E5E61] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. +1 (555) 234-5678"
                  className={inputCls}
                />
              </div>
            </div>

            {/* Department */}
            {!isVolunteer && (
              <div>
                <label className="block font-heading font-semibold text-[#101410] dark:text-[#f0f5ee] mb-1">
                  Department / Academic Unit
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-[#5E5E61] absolute left-3.5 top-1/2 -translate-y-1/2" />
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
                className="w-1/2 py-2.5 border border-[#DCE4D6] dark:border-[#233d2e] hover:bg-[#E8F0DF] dark:hover:bg-[#1b3025] rounded-2xl font-heading font-semibold text-[#5E5E61] dark:text-[#8ba895] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="w-1/2 py-2.5 bg-[#08482D] hover:bg-[#0c5c3b] text-[#F5F8EF] font-heading font-semibold rounded-2xl shadow-md shadow-[#08482D]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
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
