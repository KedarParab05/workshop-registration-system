import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, UserCheck, KeyRound, Copy, Check, Sparkles } from 'lucide-react';
import { Workshop } from '../../types';

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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Volunteer name is required.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Valid volunteer email is required.');
      return;
    }
    if (!assignedWorkshopId) {
      setError('Please select an academic workshop.');
      return;
    }

    setSubmitting(true);
    const result = await onAssign({
      name: name.trim(),
      email: email.trim(),
      phoneNumber: phoneNumber.trim(),
      assignedWorkshopId,
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
          className="fixed inset-0 bg-[#08482D]/40 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative bg-white dark:bg-[#14231b] rounded-3xl max-w-md w-full p-5 sm:p-8 shadow-2xl border border-[#DCE4D6] dark:border-[#203a2c] z-10 text-xs text-[#101410] dark:text-[#E8F0DF] max-h-[92vh] overflow-y-auto my-auto"
        >
          <button
            onClick={createdCode ? handleDone : onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-[#5E5E61] hover:text-[#101410] dark:hover:text-white hover:bg-[#F5F8EF] dark:hover:bg-[#18281f] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {!createdCode ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DAE7C7] text-[#08482D] text-xs font-semibold">
                    <UserCheck className="w-3.5 h-3.5 text-[#08482D]" />
                    <span>Appoint Gate Volunteer</span>
                  </span>
                  <span className="font-hand text-sm text-[#08482D] dark:text-[#DAE7C7] -rotate-1 hidden sm:inline">
                    // gate passcodes
                  </span>
                </div>
                <h3 className="text-xl font-heading font-bold text-[#101410] dark:text-white">
                  Assign Gate Volunteer
                </h3>
                <p className="text-xs text-[#5E5E61] dark:text-slate-400 mt-1 leading-relaxed">
                  Volunteers receive a unique access code to unlock the camera gate scanner and verify passes for your workshops.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-400 text-xs">
                  {error}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block font-heading font-semibold text-[#101410] dark:text-white mb-1">
                  Volunteer Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Marcus Vance"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE4D6] dark:border-[#22392c] bg-[#F5F8EF] dark:bg-[#18281f] text-[#101410] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#08482D]"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block font-heading font-semibold text-[#101410] dark:text-white mb-1">
                  Volunteer Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. marcus@university.edu"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE4D6] dark:border-[#22392c] bg-[#F5F8EF] dark:bg-[#18281f] text-[#101410] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#08482D]"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block font-heading font-semibold text-[#101410] dark:text-white mb-1">
                  Volunteer Phone Number (WhatsApp / Mobile)
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. +1 (555) 019-2834"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE4D6] dark:border-[#22392c] bg-[#F5F8EF] dark:bg-[#18281f] text-[#101410] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#08482D]"
                />
              </div>

              {/* Workshop Selection */}
              <div>
                <label className="block font-heading font-semibold text-[#101410] dark:text-white mb-1">
                  Assigned Academic Workshop *
                </label>
                <select
                  value={assignedWorkshopId}
                  onChange={(e) => setAssignedWorkshopId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE4D6] dark:border-[#22392c] bg-[#F5F8EF] dark:bg-[#18281f] text-[#101410] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#08482D] font-medium"
                >
                  {workshops.map((ws) => (
                    <option key={ws.id} value={ws.id}>
                      {ws.title} — {ws.date} ({ws.venue})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-[#5E5E61] dark:text-slate-400 mt-1">
                  The volunteer will strictly be restricted to scanning passes for this specific session.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-[#DCE4D6] dark:border-[#22392c] text-[#5E5E61] dark:text-slate-300 font-heading font-semibold hover:bg-[#F5F8EF] dark:hover:bg-[#18281f]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-[#08482D] hover:bg-[#0c5c3b] disabled:opacity-50 text-white font-heading font-semibold shadow-md shadow-[#08482D]/20"
                >
                  {submitting ? 'Generating Passcode...' : 'Appoint Volunteer'}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-4 py-2">
              <div className="w-14 h-14 rounded-2xl bg-[#E8F0DF] dark:bg-[#1a3325] text-[#08482D] dark:text-[#DAE7C7] flex items-center justify-center mx-auto shadow-sm">
                <KeyRound className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-xl font-heading font-bold text-[#101410] dark:text-white">
                  Volunteer Appointed!
                </h3>
                <p className="text-xs text-[#5E5E61] dark:text-slate-400 mt-1">
                  Share this Gate Access Code with <strong>{name}</strong>.
                </p>
              </div>

              {/* Code Display Box */}
              <div className="p-4 rounded-2xl bg-[#E8F0DF] dark:bg-[#1a3325] border border-[#DAE7C7] dark:border-[#2d4d3a] space-y-2">
                <div className="text-[11px] font-heading font-semibold uppercase tracking-wider text-[#08482D] dark:text-[#DAE7C7]">
                  Gate Authorization Access Code
                </div>
                <div className="text-2xl sm:text-3xl font-mono font-extrabold text-[#08482D] dark:text-[#DAE7C7] tracking-wider">
                  {createdCode}
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3.5 py-1.5 bg-white dark:bg-[#14231b] border border-[#DAE7C7] dark:border-[#2d4d3a] rounded-xl text-xs font-heading font-semibold text-[#08482D] dark:text-[#DAE7C7] hover:bg-[#F5F8EF] dark:hover:bg-[#18281f] transition-colors inline-flex items-center gap-1.5 shadow-sm"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#08482D] dark:text-[#a8d38d]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Access Code'}</span>
                </button>
              </div>

              <p className="text-[11px] text-[#5E5E61] dark:text-slate-400 leading-relaxed text-left">
                💡 Instructions: The volunteer selects <strong>"Login as Volunteer"</strong>, chooses your organization, and pastes this code to unlock the camera gate scanner.
              </p>

              <button
                type="button"
                onClick={handleDone}
                className="w-full py-2.5 bg-[#08482D] hover:bg-[#0c5c3b] text-white rounded-xl font-heading font-semibold text-xs shadow-md shadow-[#08482D]/20"
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
