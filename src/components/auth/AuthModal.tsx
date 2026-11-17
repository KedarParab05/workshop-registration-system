import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { BrandLogo } from '../common/BrandLogo';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Building,
  KeyRound,
  Loader2,
  Phone,
  Eye,
  EyeOff,
  GraduationCap,
  Briefcase,
  LogIn,
  UserPlus,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { apiFetch, saveToken } from '../../utils/api';
import { UserRole } from '../../types';
import {
  validateIndianPhone,
  validatePassword,
  calculatePasswordStrength,
  validateFullName,
  validateEmail,
} from '../../utils/validation';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: UserRole;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialRole,
  initialMode = 'login',
}) => {
  const { setCurrentUser, showAlert, navigateTo, users } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [activeDemoEmail, setActiveDemoEmail] = useState<string | null>(null);
  const [showAllStudents, setShowAllStudents] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState<'PARTICIPANT' | 'ORGANIZER'>('PARTICIPANT');

  // Dynamic Password Strength
  const passwordStrength = useMemo(() => calculatePasswordStrength(password), [password]);

  useEffect(() => {
    if (isOpen) {
      setMode(initialRole ? 'register' : initialMode);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFullName('');
      setPhoneNumber('');
      setDepartment('');
      setErrorMsg('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      if (initialRole === 'ORGANIZER') {
        setRole('ORGANIZER');
      } else {
        setRole('PARTICIPANT');
      }
    }
  }, [isOpen, initialRole, initialMode]);

  if (!isOpen) return null;

  const applyBackendUser = (userData: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    accountStatus: string;
    department?: string;
    phoneNumber?: string;
    createdAt?: string;
  }) => {
    const mapped = {
      id: userData.id,
      fullName: userData.fullName,
      email: userData.email,
      role: userData.role as any,
      accountStatus: userData.accountStatus as any,
      department: userData.department,
      phoneNumber: userData.phoneNumber,
      createdAt: userData.createdAt || new Date().toISOString(),
    };
    setCurrentUser(mapped);
    localStorage.removeItem('wh_logged_out');
    localStorage.setItem('wh_user', JSON.stringify(mapped));
    localStorage.setItem('wh_current_user_email', mapped.email);
    localStorage.setItem('wh_role_selected', mapped.role);

    // Strictly redirect according to database role
    if (mapped.role === 'SUPER_ADMIN') {
      navigateTo('admin-dashboard');
    } else if (mapped.role === 'ORGANIZER') {
      navigateTo('organizer-dashboard');
    } else if (mapped.role === 'VOLUNTEER') {
      navigateTo('volunteer-portal');
    } else {
      navigateTo('participant-dashboard');
    }
  };

  const parseAuthResponse = async (res: Response) => {
    let data: any = {};
    try {
      data = await res.json();
    } catch {
      data = {};
    }
    return data;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      setErrorMsg(emailCheck.error || 'Please enter a valid email address.');
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await parseAuthResponse(res);

      if (res.ok && data.success && data.token) {
        saveToken(data.token);
        applyBackendUser(data.user);
        showAlert(`Welcome back, ${data.user.fullName}!`, 'success');
        onClose();
      } else if (res.status === 429) {
        setErrorMsg(data.error || 'Too many failed login attempts. Please try again later.');
      } else if (res.status === 401) {
        setErrorMsg(data.error || 'Invalid email or password.');
      } else if (res.status === 403) {
        setErrorMsg('Your account has been suspended.');
      } else if (data.error) {
        setErrorMsg(data.error);
      } else {
        setErrorMsg('Something went wrong. Please try again shortly.');
      }
    } catch {
      setErrorMsg("We couldn't connect to the server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // 1. Full name validation
    const nameCheck = validateFullName(fullName);
    if (!nameCheck.isValid) {
      setErrorMsg(nameCheck.error || 'Full name must be at least 2 characters.');
      return;
    }

    // 2. Email validation
    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      setErrorMsg(emailCheck.error || 'Please enter a valid email address.');
      return;
    }

    // 3. Indian Phone number validation (mandatory or validated if entered)
    let cleanedPhone: string | undefined = undefined;
    if (phoneNumber && phoneNumber.trim()) {
      const phoneCheck = validateIndianPhone(phoneNumber);
      if (!phoneCheck.isValid) {
        setErrorMsg(phoneCheck.error || 'Please enter a valid Indian mobile number.');
        return;
      }
      cleanedPhone = phoneCheck.cleanPhone;
    }

    // 4. Password complexity validation
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.isValid) {
      setErrorMsg(passwordCheck.error || 'Password must be at least 6 characters.');
      return;
    }

    // 5. Password confirmation validation
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
          department: department.trim() || undefined,
          phoneNumber: cleanedPhone,
        }),
      });

      const data = await parseAuthResponse(res);

      if (res.ok && data.success && data.token) {
        saveToken(data.token);
        applyBackendUser(data.user);
        showAlert(`Welcome to Kaushalya, ${data.user.fullName}!`, 'success');
        onClose();
      } else if (res.status === 400 && data.error && data.error.toLowerCase().includes('already exists')) {
        setErrorMsg('An account with this email already exists.');
      } else if (data.error) {
        setErrorMsg(data.error);
      } else {
        setErrorMsg('Something went wrong. Please try again shortly.');
      }
    } catch {
      setErrorMsg("We couldn't connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Fast Switch for Evaluators
  const handleDemoSwitch = async (demoEmail: string) => {
    if (loading) return;
    setErrorMsg('');
    setLoading(true);
    setActiveDemoEmail(demoEmail);
    try {
      const res = await apiFetch('/api/auth/switch-demo', {
        method: 'POST',
        body: JSON.stringify({ email: demoEmail }),
      });
      const data = await parseAuthResponse(res);
      if (res.ok && data.success && data.user) {
        if (data.token) saveToken(data.token);
        applyBackendUser(data.user);
        showAlert(`Welcome back, ${data.user.fullName}!`, 'success');
        onClose();
      } else {
        const localMatched = users.find((u) => u.email?.toLowerCase() === demoEmail.toLowerCase());
        if (localMatched) {
          applyBackendUser(localMatched);
          showAlert(`Welcome back, ${localMatched.fullName}!`, 'success');
          onClose();
          return;
        }
        setErrorMsg(data.error || 'Failed to switch demo account.');
      }
    } catch {
      const localMatched = users.find((u) => u.email?.toLowerCase() === demoEmail.toLowerCase());
      if (localMatched) {
        applyBackendUser(localMatched);
        showAlert(`Welcome back, ${localMatched.fullName}!`, 'success');
        onClose();
      } else {
        setErrorMsg('Could not connect to server for demo login.');
      }
    } finally {
      setLoading(false);
      setActiveDemoEmail(null);
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
          className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-[8px_8px_0px_0px_#101D32] border-2 border-[#101D32] z-10 text-xs text-[#101D32] max-h-[94vh] overflow-y-auto my-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-lg border-2 border-transparent hover:border-[#101D32] text-[#101D32] hover:bg-[#FFD6B0] transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header with Standardized BrandLogo */}
          <div className="text-center space-y-1 mb-5">
            <div className="flex justify-center mb-2.5">
              <BrandLogo size="md" showTagline={true} />
            </div>
            <h2 className="text-xl sm:text-2xl font-heading font-black text-[#101D32]">
              {mode === 'login' ? 'Sign In to Your Account' : 'Create an Account'}
            </h2>
            <p className="text-xs text-[#101D32]/80 font-medium">
              {mode === 'login'
                ? 'Enter your credentials to access your dashboard and passes.'
                : 'Join the academic skills platform to attend or host workshops.'}
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex rounded-xl bg-[#FFF5E9] p-1 border-2 border-[#101D32] mb-4 shadow-[2px_2px_0px_0px_#101D32]">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-heading font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-[#F4511E] text-white shadow-[2px_2px_0px_0px_#101D32] border border-[#101D32]'
                  : 'text-[#101D32] hover:bg-[#FFD6B0]'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-heading font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-[#F4511E] text-white shadow-[2px_2px_0px_0px_#101D32] border border-[#101D32]'
                  : 'text-[#101D32] hover:bg-[#FFD6B0]'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-[#FFD6B0] border-2 border-[#101D32] text-[#101D32] text-xs font-bold rounded-xl shadow-[3px_3px_0px_0px_#101D32] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#F4511E] shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              SIGN IN FORM
          ───────────────────────────────────────────────────────────── */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-heading font-bold text-[#101D32] mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#101D32]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="e.g. participant@university.edu"
                    className={`${inputCls} pl-10`}
                    autoFocus
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-heading font-bold text-[#101D32] mb-1.5">
                  Password *
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
                    placeholder="Enter your password"
                    className={`${inputCls} pl-10 pr-10`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#101D32]/70 hover:text-[#101D32] cursor-pointer"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#F4511E] hover:bg-[#E84316] disabled:opacity-60 text-white font-heading font-extrabold text-xs rounded-xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#101D32] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <LogIn className="w-4 h-4 text-white" />}
                <span>{loading ? 'Authenticating…' : 'Sign In'}</span>
              </button>

              <div className="text-center pt-1">
                <span className="text-xs text-[#101D32]/80 font-medium">
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setErrorMsg('');
                    }}
                    className="text-[#F4511E] font-bold hover:underline cursor-pointer"
                  >
                    Create Account
                  </button>
                </span>
              </div>
            </form>
          ) : (
            /* ─────────────────────────────────────────────────────────────
                REGISTRATION FORM
            ───────────────────────────────────────────────────────────── */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-heading font-bold text-[#101D32] mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#101D32]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="e.g. Alex Morgan"
                    className={`${inputCls} pl-10`}
                    autoFocus
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-heading font-bold text-[#101D32] mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#101D32]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="e.g. alex.morgan@university.edu"
                    className={`${inputCls} pl-10`}
                    required
                  />
                </div>
              </div>

              {/* Phone Number (Indian 10-Digit Mobile Number) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-heading font-bold text-[#101D32]">
                    Mobile Phone Number *
                  </label>
                  <span className="text-[10px] text-[#101D32]/70 font-mono font-bold">10 digits Indian mobile</span>
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none text-[#101D32] font-bold text-xs">
                    <Phone className="w-3.5 h-3.5 text-[#F4511E]" />
                    <span className="text-[11px] font-mono text-[#101D32]/70">+91</span>
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    maxLength={10}
                    onChange={(e) => {
                      // Only allow numeric input
                      const raw = e.target.value.replace(/\D/g, '');
                      setPhoneNumber(raw);
                      setErrorMsg('');
                    }}
                    placeholder="9876543210"
                    className={`${inputCls} pl-16 font-mono font-bold`}
                    required
                  />
                </div>
                <p className="text-[10px] text-[#101D32]/70 mt-1">
                  Must start with 6, 7, 8, or 9 and contain exactly 10 digits.
                </p>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-heading font-bold text-[#101D32] mb-1">
                  I want to join as *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('PARTICIPANT')}
                    className={`p-2.5 rounded-xl border-2 text-left transition-all flex items-center gap-2 cursor-pointer ${
                      role === 'PARTICIPANT'
                        ? 'border-[#101D32] bg-[#FFD6B0] text-[#101D32] font-bold shadow-[2px_2px_0px_0px_#101D32]'
                        : 'border-[#101D32]/40 bg-white text-[#101D32]/80 hover:bg-[#FFF5E9]'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 shrink-0 text-[#F4511E]" />
                    <div>
                      <div className="text-xs font-heading font-bold">Student</div>
                      <div className="text-[10px] font-normal opacity-80">Attendee</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('ORGANIZER')}
                    className={`p-2.5 rounded-xl border-2 text-left transition-all flex items-center gap-2 cursor-pointer ${
                      role === 'ORGANIZER'
                        ? 'border-[#101D32] bg-[#FFD6B0] text-[#101D32] font-bold shadow-[2px_2px_0px_0px_#101D32]'
                        : 'border-[#101D32]/40 bg-white text-[#101D32]/80 hover:bg-[#FFF5E9]'
                    }`}
                  >
                    <Briefcase className="w-4 h-4 shrink-0 text-[#F4511E]" />
                    <div>
                      <div className="text-xs font-heading font-bold">Organizer</div>
                      <div className="text-[10px] font-normal opacity-80">Faculty / Host</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-heading font-bold text-[#101D32] mb-1">
                  Password *
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
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#101D32]/70 hover:text-[#101D32] cursor-pointer"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
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
                    {/* Visual Segmented Bar */}
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
                  Confirm Password *
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
                    placeholder="Re-enter your password"
                    className={`${inputCls} pl-10 pr-10`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#101D32]/70 hover:text-[#101D32] cursor-pointer"
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
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

              {/* Department */}
              <div>
                <label className="block text-xs font-heading font-bold text-[#101D32] mb-1">
                  Department / Institution <span className="font-normal text-[#101D32]/70">(optional)</span>
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-[#101D32]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Computer Science & AI"
                    className={`${inputCls} pl-10`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#F4511E] hover:bg-[#E84316] disabled:opacity-60 text-white font-heading font-extrabold text-xs rounded-xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#101D32] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <UserPlus className="w-4 h-4 text-white" />}
                <span>{loading ? 'Creating Account…' : 'Create Account'}</span>
              </button>

              <div className="text-center pt-1">
                <span className="text-xs text-[#101D32]/80 font-medium">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMsg('');
                    }}
                    className="text-[#F4511E] font-bold hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </span>
              </div>
            </form>
          )}

          {/* ─────────────────────────────────────────────────────────────
              EVALUATOR QUICK-LOGIN PERSONAS (Demo Fast-Track)
          ───────────────────────────────────────────────────────────── */}
          <div className="mt-5 pt-4 border-t-2 border-[#101D32] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-heading font-extrabold uppercase tracking-wider text-[#101D32] flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#F4511E]" />
                <span>Instant Demo Login (Evaluators)</span>
              </span>
              <span className="text-[10px] text-[#101D32]/70 font-mono font-bold bg-[#FFD6B0] px-2 py-0.5 rounded-full border border-[#101D32]">
                1-Click JWT Switch
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Super Admin */}
              <button
                type="button"
                onClick={() => handleDemoSwitch('admin@workshophub.edu')}
                disabled={loading}
                className="p-2.5 rounded-xl border-2 border-[#101D32] bg-white hover:bg-[#FFD6B0] text-left transition-all shadow-[2px_2px_0px_0px_#101D32] hover:translate-x-[1px] hover:translate-y-[1px] disabled:opacity-50 cursor-pointer"
              >
                <div className="flex items-center gap-1.5 font-heading font-extrabold text-xs text-[#101D32]">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#F4511E]" />
                  <span>Super Admin</span>
                </div>
                <div className="text-[10px] text-[#101D32]/70 truncate font-mono mt-0.5">
                  admin@workshophub.edu
                </div>
              </button>

              {/* Faculty Organizer */}
              <button
                type="button"
                onClick={() => handleDemoSwitch('vikram.rao@faculty.edu')}
                disabled={loading}
                className="p-2.5 rounded-xl border-2 border-[#101D32] bg-white hover:bg-[#FFD6B0] text-left transition-all shadow-[2px_2px_0px_0px_#101D32] hover:translate-x-[1px] hover:translate-y-[1px] disabled:opacity-50 cursor-pointer"
              >
                <div className="flex items-center gap-1.5 font-heading font-extrabold text-xs text-[#101D32]">
                  <Briefcase className="w-3.5 h-3.5 text-[#F4511E]" />
                  <span>Prof. Vikram Rao</span>
                </div>
                <div className="text-[10px] text-[#101D32]/70 truncate font-mono mt-0.5">
                  vikram.rao@faculty.edu
                </div>
              </button>
            </div>

            {/* Students list expandable */}
            <div className="space-y-1.5 pt-1">
              <button
                type="button"
                onClick={() => setShowAllStudents(!showAllStudents)}
                className="w-full py-1.5 px-2 bg-[#FFF5E9] hover:bg-[#FFD6B0] border border-[#101D32] rounded-lg text-[11px] font-heading font-bold text-[#101D32] flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Student Attendee Personas ({users.filter(u => u.role === 'PARTICIPANT').length || 4})</span>
                {showAllStudents ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showAllStudents && (
                <div className="grid grid-cols-2 gap-1.5 pt-1 max-h-36 overflow-y-auto">
                  {[
                    { name: 'Omkar Parelkar', email: 'mca26.omkar.parelkar@gnims.com' },
                    { name: 'Marcus Vance', email: 'marcus@university.edu' },
                    { name: 'Elena Rostova', email: 'elena@university.edu' },
                    { name: 'Priya Sharma', email: 'priya@university.edu' },
                  ].map((s) => (
                    <button
                      key={s.email}
                      type="button"
                      onClick={() => handleDemoSwitch(s.email)}
                      disabled={loading}
                      className="p-1.5 bg-white hover:bg-[#FFD6B0] border border-[#101D32] rounded-lg text-left text-[10px] transition-colors truncate cursor-pointer"
                    >
                      <div className="font-bold text-[#101D32] truncate">{s.name}</div>
                      <div className="text-[#101D32]/70 truncate font-mono">{s.email}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
