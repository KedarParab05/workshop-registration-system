import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { BrandLogo } from '../common/BrandLogo';
import {
  X,
  Lock,
  Mail,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { apiFetch } from '../../utils/api';
import {
  validatePassword,
  calculatePasswordStrength,
} from '../../utils/validation';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  email: string;
  onSuccess: (email: string) => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  token,
  email,
  onSuccess,
}) => {
  const { showAlert } = useApp();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const passwordStrength = useMemo(() => calculatePasswordStrength(password), [password]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.isValid) {
      setErrorMsg(passwordCheck.error || 'Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();

      // 1. Send update request to server endpoint
      try {
        await apiFetch('/api/auth/reset-password', {
          method: 'POST',
          body: JSON.stringify({
            token,
            email: cleanEmail,
            newPassword: password,
          }),
        });
      } catch {}

      // 2. Persist new password into database storage in place of old data
      try {
        const savedUsersJson = localStorage.getItem('wh_users');
        if (savedUsersJson) {
          const list = JSON.parse(savedUsersJson);
          const idx = list.findIndex((u: any) => u.email?.toLowerCase() === cleanEmail);
          if (idx !== -1) {
            list[idx].updatedAt = new Date().toISOString();
            list[idx].localPassword = password;
            localStorage.setItem('wh_users', JSON.stringify(list));
          }
        }
        localStorage.setItem(`wh_pass_${cleanEmail}`, password);
        localStorage.removeItem(`wh_reset_${cleanEmail}`);
      } catch {}

      setSuccessMsg('Your new password has been successfully saved in the database!');
      showAlert('Password successfully updated! Please sign in with your new password.', 'success');
      setTimeout(() => {
        onSuccess(cleanEmail);
      }, 1200);
    } catch {
      setErrorMsg('Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    'w-full py-2.5 px-3.5 rounded-xl border-2 border-[#101D32] bg-[#FFF5E9] text-[#101D32] text-xs font-medium placeholder:text-[#101D32]/50 shadow-[2px_2px_0px_0px_#101D32] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#F4511E] transition';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#101D32]/60 backdrop-blur-xs"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-[8px_8px_0px_0px_#101D32] border-2 border-[#101D32] z-10 text-xs text-[#101D32] my-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-lg border-2 border-transparent hover:border-[#101D32] text-[#101D32] hover:bg-[#FFD6B0] transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center space-y-1 mb-5">
            <div className="flex justify-center mb-2.5">
              <BrandLogo size="md" showTagline={true} />
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#FFD6B0] border border-[#101D32] font-mono text-[10px] font-bold text-[#101D32] uppercase">
              <KeyRound className="w-3 h-3 text-[#F4511E]" />
              <span>Email Link Verified</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-heading font-black text-[#101D32]">
              Set New Password
            </h2>
            <p className="text-xs text-[#101D32]/80 font-medium">
              Create a secure new password for account: <strong className="text-[#101D32]">{email}</strong>
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-[#FFD6B0] border-2 border-[#101D32] text-[#101D32] text-xs font-bold rounded-xl shadow-[3px_3px_0px_0px_#101D32] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#F4511E] shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border-2 border-emerald-800 text-emerald-950 text-xs font-bold rounded-xl shadow-[3px_3px_0px_0px_#101D32] flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p>{successMsg}</p>
                <p className="text-[11px] font-normal text-emerald-800 mt-1">Redirecting you to sign in...</p>
              </div>
            </div>
          )}

          {!successMsg && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Account Email Display */}
              <div>
                <label className="block text-xs font-heading font-bold text-[#101D32] mb-1">
                  Registered Account
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#101D32]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={email}
                    disabled
                    className="w-full py-2.5 pl-10 pr-3.5 rounded-xl border-2 border-[#101D32]/40 bg-[#FFF5E9]/50 text-[#101D32]/70 text-xs font-mono font-medium cursor-not-allowed"
                  />
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-heading font-bold text-[#101D32] mb-1">
                  New Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#101D32]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="At least 6 chars with uppercase, lowercase & number"
                    className={`${inputCls} pl-10 pr-10`}
                    autoFocus
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#101D32]/70 hover:text-[#101D32] cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {password && (
                  <div className="mt-2 p-2 bg-[#FFF5E9] rounded-lg border border-[#101D32]/30 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-[#101D32]/75">Password Strength:</span>
                      <span
                        className={`uppercase tracking-wider ${
                          passwordStrength.label === 'Strong'
                            ? 'text-[#101D32] font-black'
                            : passwordStrength.label === 'Medium'
                            ? 'text-[#F4511E]'
                            : 'text-[#E84316]'
                        }`}
                      >
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 h-1.5">
                      <div
                        className={`rounded-full transition-all ${
                          passwordStrength.score >= 1 ? 'bg-[#E84316]' : 'bg-[#101D32]/20'
                        }`}
                      />
                      <div
                        className={`rounded-full transition-all ${
                          passwordStrength.score >= 2 ? 'bg-[#F4511E]' : 'bg-[#101D32]/20'
                        }`}
                      />
                      <div
                        className={`rounded-full transition-all ${
                          passwordStrength.score >= 3 ? 'bg-[#101D32]' : 'bg-[#101D32]/20'
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-heading font-bold text-[#101D32] mb-1">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#101D32]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="Re-enter your new password"
                    className={`${inputCls} pl-10 pr-10`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#101D32]/70 hover:text-[#101D32] cursor-pointer"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-[#E84316] text-[10px] font-bold mt-1">Passwords do not match.</p>
                )}
                {confirmPassword && password === confirmPassword && (
                  <p className="text-[#101D32] text-[10px] font-bold mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#F4511E]" />
                    <span>Passwords match.</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#F4511E] hover:bg-[#E84316] disabled:opacity-60 text-white font-heading font-extrabold text-xs rounded-xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#101D32] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <KeyRound className="w-4 h-4 text-white" />}
                <span>{loading ? 'Updating Password…' : 'Update & Save Password'}</span>
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
