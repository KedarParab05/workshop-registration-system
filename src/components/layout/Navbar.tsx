import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { BrandLogo } from '../common/BrandLogo';
import {
  LogOut,
  ChevronDown,
  Menu,
  X,
  PlusCircle,
  Sun,
  Moon,
  User as UserIcon,
  ShieldAlert,
  GraduationCap,
  Scan,
  QrCode,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenRoleSelector?: () => void;
  onOpenProfile?: () => void;
  onOpenContact?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onOpenRoleSelector,
  onOpenProfile,
}) => {
  const {
    currentUser,
    activePage,
    navigateTo,
    logoutUser,
    currentVolunteer,
    logoutVolunteer,
    theme,
    toggleTheme,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const roleDropdownRef = React.useRef<HTMLDivElement>(null);

  // Close menus on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setRoleDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close role dropdown on click outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target as Node)) {
        setRoleDropdownOpen(false);
      }
    };
    if (roleDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [roleDropdownOpen]);

  // Prevent background scrolling when mobile menu is open
  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'ORGANIZER':
        return 'Faculty Organizer';
      case 'SUPER_ADMIN':
        return 'Super Admin';
      case 'VOLUNTEER':
        return 'Gate Volunteer';
      default:
        return 'Student';
    }
  };

  const handleSignOut = () => {
    logoutUser();
    setRoleDropdownOpen(false);
    navigateTo('home');
  };

  // Smooth scroll handler for homepage sections with offset compensation
  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    setRoleDropdownOpen(false);

    const performScroll = () => {
      const el = document.getElementById(sectionId);
      if (el) {
        const headerOffset = 90;
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    };

    if (activePage !== 'home') {
      navigateTo('home');
      setTimeout(performScroll, 120);
    } else {
      performScroll();
    }
  };

  return (
    <header className="fixed top-3 sm:top-4 left-0 right-0 z-40 flex flex-col items-center px-3 sm:px-6 pointer-events-none">
      {/* ─────────────────────────────────────────────────────────────
          FLOATING CENTERED ROUNDED CAPSULE NAVBAR
      ───────────────────────────────────────────────────────────── */}
      <div className="w-full max-w-7xl pointer-events-auto bg-[#F5F8EF]/95 dark:bg-[#0c1610]/95 backdrop-blur-md rounded-full border border-[#DCE4D6] dark:border-[#203a2c] shadow-lg shadow-[#08482D]/5 px-4 sm:px-6 py-2 sm:py-2.5 transition-all duration-200">
        <div className="flex items-center justify-between gap-3 lg:gap-6">
          {/* Brand: Kaushalya Official Standardized Logo */}
          <BrandLogo
            size="md"
            onClick={() => {
              setMobileMenuOpen(false);
              navigateTo('home');
            }}
          />

          {/* Desktop Navigation Links — Centered, No Two-Line Wrapping */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs xl:text-sm font-heading font-semibold text-[#5E5E61] dark:text-[#9eb3a2]">
            {/* 1. Discover */}
            <button
              onClick={() => navigateTo('workshops')}
              className={`px-3 xl:px-3.5 py-2 rounded-full transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activePage === 'workshops'
                  ? 'text-[#08482D] dark:text-[#DAE7C7] bg-[#DAE7C7]/60 dark:bg-[#1a3826] font-bold shadow-xs'
                  : 'hover:text-[#101410] dark:hover:text-[#f0f5ee] hover:bg-[#E8F0DF] dark:hover:bg-[#18281f]'
              }`}
            >
              <span>Discover</span>
            </button>

            {/* 2. Process */}
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="px-3 xl:px-3.5 py-2 rounded-full transition-all hover:text-[#101410] dark:hover:text-[#f0f5ee] hover:bg-[#E8F0DF] dark:hover:bg-[#18281f] cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>Process</span>
            </button>

            {/* 3. Our Story */}
            <button
              onClick={() => navigateTo('our-story')}
              className={`px-3 xl:px-3.5 py-2 rounded-full transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activePage === 'our-story'
                  ? 'text-[#08482D] dark:text-[#DAE7C7] bg-[#DAE7C7]/60 dark:bg-[#1a3826] font-bold shadow-xs'
                  : 'hover:text-[#101410] dark:hover:text-[#f0f5ee] hover:bg-[#E8F0DF] dark:hover:bg-[#18281f]'
              }`}
            >
              <span>Our Story</span>
            </button>

            {/* 4. Contact */}
            <button
              onClick={() => navigateTo('contact')}
              className={`px-3 xl:px-3.5 py-2 rounded-full transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activePage === 'contact'
                  ? 'text-[#08482D] dark:text-[#DAE7C7] bg-[#DAE7C7]/60 dark:bg-[#1a3826] font-bold shadow-xs'
                  : 'hover:text-[#101410] dark:hover:text-[#f0f5ee] hover:bg-[#E8F0DF] dark:hover:bg-[#18281f]'
              }`}
            >
              <span>Contact</span>
            </button>

            {/* Role-Aware Authenticated Navigation (Strictly Role-Specific) */}
            {currentUser?.role === 'SUPER_ADMIN' && (
              <button
                onClick={() => navigateTo('admin-dashboard')}
                className={`px-3 xl:px-3.5 py-2 rounded-full transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  activePage === 'admin-dashboard'
                    ? 'text-[#08482D] dark:text-[#DAE7C7] bg-[#DAE7C7]/60 dark:bg-[#1a3826] font-bold shadow-xs'
                    : 'hover:text-[#101410] dark:hover:text-[#f0f5ee] hover:bg-[#E8F0DF] dark:hover:bg-[#18281f]'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-[#08482D] dark:text-[#DAE7C7] shrink-0" />
                <span>Dashboard</span>
              </button>
            )}

            {currentUser?.role === 'ORGANIZER' && (
              <button
                onClick={() => navigateTo('organizer-dashboard')}
                className={`px-3 xl:px-3.5 py-2 rounded-full transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  activePage === 'organizer-dashboard'
                    ? 'text-[#08482D] dark:text-[#DAE7C7] bg-[#DAE7C7]/60 dark:bg-[#1a3826] font-bold shadow-xs'
                    : 'hover:text-[#101410] dark:hover:text-[#f0f5ee] hover:bg-[#E8F0DF] dark:hover:bg-[#18281f]'
                }`}
              >
                <PlusCircle className="w-4 h-4 text-[#08482D] dark:text-[#DAE7C7] shrink-0" />
                <span>Organizer Studio</span>
              </button>
            )}

            {(currentVolunteer || currentUser?.role === 'VOLUNTEER') && (
              <button
                onClick={() => navigateTo('volunteer-portal')}
                className={`px-3 xl:px-3.5 py-2 rounded-full transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  activePage === 'volunteer-portal'
                    ? 'text-[#08482D] dark:text-[#DAE7C7] bg-[#DAE7C7]/60 dark:bg-[#1a3826] font-bold shadow-xs'
                    : 'hover:text-[#101410] dark:hover:text-[#f0f5ee] hover:bg-[#E8F0DF] dark:hover:bg-[#18281f]'
                }`}
              >
                <Scan className="w-4 h-4 text-[#08482D] dark:text-[#DAE7C7] shrink-0" />
                <span>Gate Station</span>
              </button>
            )}

            {currentUser?.role === 'PARTICIPANT' && (
              <>
                <button
                  onClick={() => navigateTo('participant-dashboard')}
                  className={`px-3 xl:px-3.5 py-2 rounded-full transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                    activePage === 'participant-dashboard'
                      ? 'text-[#08482D] dark:text-[#DAE7C7] bg-[#DAE7C7]/60 dark:bg-[#1a3826] font-bold shadow-xs'
                      : 'hover:text-[#101410] dark:hover:text-[#f0f5ee] hover:bg-[#E8F0DF] dark:hover:bg-[#18281f]'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-[#08482D] dark:text-[#DAE7C7] shrink-0" />
                  <span>Student Desk</span>
                </button>

                <button
                  onClick={() => navigateTo('my-registrations')}
                  className={`px-3 xl:px-3.5 py-2 rounded-full transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                    activePage === 'my-registrations'
                      ? 'text-[#08482D] dark:text-[#DAE7C7] bg-[#DAE7C7]/60 dark:bg-[#1a3826] font-bold shadow-xs'
                      : 'hover:text-[#101410] dark:hover:text-[#f0f5ee] hover:bg-[#E8F0DF] dark:hover:bg-[#18281f]'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-[#08482D] dark:text-[#DAE7C7] shrink-0" />
                  <span>My Passes</span>
                </button>
              </>
            )}
          </nav>

          {/* Right Controls: Theme Toggle & Prominent Auth Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Theme Toggle */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2.5 rounded-full border border-[#DCE4D6] dark:border-[#203a2c] bg-white dark:bg-[#14231b] text-[#101410] dark:text-[#f0f5ee] hover:bg-[#E8F0DF] dark:hover:bg-[#1b2b22] transition-colors shadow-xs"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-[#08482D]" />
              )}
            </motion.button>

            {/* User Profile Pill or Login/Get Started */}
            {currentVolunteer ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onOpenProfile}
                  className="py-1.5 px-3.5 rounded-full border border-[#DAE7C7] dark:border-[#203a2c] bg-[#DAE7C7]/50 dark:bg-[#14231b] text-xs text-left hover:bg-[#DAE7C7] dark:hover:bg-[#1b2b22] transition-colors"
                >
                  <span className="font-heading font-semibold text-[#08482D] dark:text-[#DAE7C7] block leading-tight">
                    Volunteer: {currentVolunteer.name}
                  </span>
                  <span className="text-[10px] text-[#5E5E61] dark:text-slate-400 hidden sm:block truncate max-w-[130px]">
                    {currentVolunteer.assignedWorkshopTitle}
                  </span>
                </button>
                <button
                  onClick={() => {
                    logoutVolunteer();
                    navigateTo('home');
                  }}
                  className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-full transition-colors"
                  title="Exit Gate Station"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : currentUser ? (
              <div className="relative" ref={roleDropdownRef}>
                <button
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  aria-expanded={roleDropdownOpen}
                  aria-haspopup="true"
                  className="flex items-center gap-2 py-1.5 px-3 rounded-full border border-[#DCE4D6] dark:border-[#203a2c] bg-white dark:bg-[#14231b] hover:border-[#08482D]/40 transition-colors text-xs font-medium shadow-xs cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-[#DAE7C7] text-[#08482D] flex items-center justify-center font-bold text-xs uppercase">
                    {currentUser.fullName.charAt(0)}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="font-heading font-bold text-[#101410] dark:text-[#f0f5ee] leading-tight truncate max-w-[120px]">
                      {currentUser.fullName}
                    </div>
                    <div className="text-[10px] text-[#5E5E61] dark:text-emerald-400">
                      {getRoleLabel(currentUser.role)}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#5E5E61]" />
                </button>

                <AnimatePresence>
                  {roleDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#14231b] rounded-3xl shadow-xl border border-[#DCE4D6] dark:border-[#203a2c] py-2 z-50 text-xs"
                      onClick={() => setRoleDropdownOpen(false)}
                    >
                      <div className="px-4 py-2.5 border-b border-[#DCE4D6] dark:border-[#203a2c]">
                        <p className="font-heading font-bold text-[#101410] dark:text-[#f0f5ee] text-sm">
                          {currentUser.fullName}
                        </p>
                        <p className="text-[#5E5E61] dark:text-slate-400 truncate text-[11px] font-mono mt-0.5">
                          {currentUser.email}
                        </p>
                        <span className="inline-block mt-1.5 text-[10px] font-semibold tracking-wider text-[#08482D] dark:text-[#DAE7C7] bg-[#DAE7C7] dark:bg-[#1e3828] px-2.5 py-0.5 rounded-full">
                          {currentUser.role}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setRoleDropdownOpen(false);
                          onOpenProfile?.();
                        }}
                        className="w-full text-left px-4 py-2.5 text-[#101410] dark:text-[#f0f5ee] hover:bg-[#E8F0DF] dark:hover:bg-[#1b2b22] flex items-center gap-2 font-medium"
                      >
                        <UserIcon className="w-4 h-4 text-[#08482D] dark:text-[#DAE7C7]" />
                        <span>Profile & Department Settings</span>
                      </button>

                      {currentUser.role === 'SUPER_ADMIN' && (
                        <button
                          onClick={() => {
                            setRoleDropdownOpen(false);
                            navigateTo('admin-dashboard');
                          }}
                          className="w-full text-left px-4 py-2.5 text-[#08482D] dark:text-[#DAE7C7] hover:bg-[#E8F0DF] dark:hover:bg-[#1b2b22] flex items-center gap-2 font-semibold cursor-pointer"
                        >
                          <ShieldAlert className="w-4 h-4" />
                          <span>Dashboard</span>
                        </button>
                      )}

                      {currentUser.role === 'ORGANIZER' && (
                        <button
                          onClick={() => navigateTo('organizer-dashboard')}
                          className="w-full text-left px-4 py-2.5 text-[#08482D] dark:text-[#DAE7C7] hover:bg-[#E8F0DF] dark:hover:bg-[#1b2b22] flex items-center gap-2 font-semibold"
                        >
                          <PlusCircle className="w-4 h-4" />
                          <span>Organizer Studio</span>
                        </button>
                      )}

                      <div className="border-t border-[#DCE4D6] dark:border-[#203a2c] my-1" />

                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 font-semibold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Desktop Sign In and Get Started Pills (Hidden on mobile to guarantee zero navbar overflow) */
              <div className="hidden md:flex items-center gap-2 sm:gap-2.5">
                <button
                  onClick={onOpenAuth}
                  className="px-4 py-2 text-sm font-heading font-semibold text-[#101410] dark:text-[#f0f5ee] hover:bg-[#E8F0DF] dark:hover:bg-[#192f22] rounded-full transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={onOpenRoleSelector}
                  className="px-5 py-2 text-sm font-heading font-bold text-[#F5F8EF] bg-[#08482D] hover:bg-[#0c5c3b] rounded-full transition-all shadow-md shadow-[#08482D]/20 hover:shadow-lg active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <span>Get Started</span>
                </button>
              </div>
            )}

            {/* Mobile hamburger button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full text-[#101410] dark:text-[#f0f5ee] hover:bg-[#E8F0DF] dark:hover:bg-[#14231b] transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer & Backdrop Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 pointer-events-auto lg:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-[calc(100vw-24px)] sm:max-w-sm max-h-[85vh] overflow-y-auto pointer-events-auto mt-2 bg-white/95 dark:bg-[#122218]/95 backdrop-blur-xl rounded-3xl border border-[#DCE4D6] dark:border-[#203a2c] shadow-2xl p-4 sm:p-5 space-y-1.5 text-sm font-heading font-semibold z-40 relative"
            >
              {/* Mobile Drawer Header with Compact BrandLogo & Close */}
              <div className="flex items-center justify-between pb-3 mb-1 border-b border-[#DCE4D6]/70 dark:border-[#203a2c]/70">
                <BrandLogo
                  size="sm"
                  showTagline={false}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateTo('home');
                  }}
                />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-full hover:bg-[#E8F0DF] dark:hover:bg-[#18281f] text-[#5E5E61] dark:text-[#9eb3a2] transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 1. Discover */}
              <button
                onClick={() => {
                  navigateTo('workshops');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left py-2.5 px-3.5 rounded-2xl cursor-pointer transition-colors ${
                  activePage === 'workshops'
                    ? 'bg-[#DAE7C7]/70 dark:bg-[#1a3826] text-[#08482D] dark:text-[#DAE7C7] font-bold'
                    : 'text-[#101410] dark:text-[#f0f5ee] hover:bg-[#E8F0DF] dark:hover:bg-[#18281f]'
                }`}
              >
                <span>Discover</span>
              </button>

              {/* 2. Process */}
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="w-full text-left py-2.5 px-3.5 rounded-2xl hover:bg-[#E8F0DF] dark:hover:bg-[#18281f] text-[#101410] dark:text-[#f0f5ee] cursor-pointer transition-colors"
              >
                <span>Process</span>
              </button>

              {/* 3. Our Story */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigateTo('our-story');
                }}
                className={`w-full text-left py-2.5 px-3.5 rounded-2xl cursor-pointer transition-colors ${
                  activePage === 'our-story'
                    ? 'bg-[#DAE7C7]/70 dark:bg-[#1a3826] text-[#08482D] dark:text-[#DAE7C7] font-bold'
                    : 'text-[#101410] dark:text-[#f0f5ee] hover:bg-[#E8F0DF] dark:hover:bg-[#18281f]'
                }`}
              >
                <span>Our Story</span>
              </button>

              {/* 4. Contact */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigateTo('contact');
                }}
                className={`w-full text-left py-2.5 px-3.5 rounded-2xl cursor-pointer transition-colors ${
                  activePage === 'contact'
                    ? 'bg-[#DAE7C7]/70 dark:bg-[#1a3826] text-[#08482D] dark:text-[#DAE7C7] font-bold'
                    : 'text-[#101410] dark:text-[#f0f5ee] hover:bg-[#E8F0DF] dark:hover:bg-[#18281f]'
                }`}
              >
                <span>Contact</span>
              </button>

            {/* Role-Specific Navigation Items */}
            {currentUser?.role === 'SUPER_ADMIN' && (
              <button
                onClick={() => {
                  navigateTo('admin-dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2.5 px-3.5 rounded-2xl bg-[#DAE7C7]/50 dark:bg-[#1a3826] text-[#08482D] dark:text-[#DAE7C7] flex items-center gap-2 cursor-pointer font-semibold"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
            )}

            {currentUser?.role === 'ORGANIZER' && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigateTo('organizer-dashboard');
                }}
                className="w-full text-left py-2.5 px-3.5 rounded-2xl bg-[#DAE7C7]/50 dark:bg-[#1a3826] text-[#08482D] dark:text-[#DAE7C7] flex items-center gap-2 cursor-pointer font-semibold"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Organizer Studio</span>
              </button>
            )}

            {(currentVolunteer || currentUser?.role === 'VOLUNTEER') && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigateTo('volunteer-portal');
                }}
                className="w-full text-left py-2.5 px-3.5 rounded-2xl bg-[#DAE7C7]/50 dark:bg-[#1a3826] text-[#08482D] dark:text-[#DAE7C7] flex items-center gap-2 cursor-pointer font-semibold"
              >
                <Scan className="w-4 h-4" />
                <span>Gate Volunteer Station</span>
              </button>
            )}

            {currentUser?.role === 'PARTICIPANT' && (
              <>
                <button
                  onClick={() => {
                    navigateTo('participant-dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2.5 px-3.5 rounded-2xl bg-[#DAE7C7]/50 dark:bg-[#1a3826] text-[#08482D] dark:text-[#DAE7C7] flex items-center gap-2 cursor-pointer font-semibold"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Student Learning Desk</span>
                </button>
                <button
                  onClick={() => {
                    navigateTo('my-registrations');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2.5 px-3.5 rounded-2xl hover:bg-[#E8F0DF] dark:hover:bg-[#18281f] text-[#101410] dark:text-[#f0f5ee] flex items-center gap-2 cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-[#08482D] dark:text-[#DAE7C7]" />
                  <span>My Passes & QR Tickets</span>
                </button>
              </>
            )}

            <div className="pt-3 border-t border-[#DCE4D6] dark:border-[#203a2c] space-y-2">
              {currentUser ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="w-full text-center py-3 text-rose-600 dark:text-rose-400 font-semibold rounded-2xl bg-rose-50 dark:bg-rose-950/40 cursor-pointer"
                >
                  Sign Out
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth();
                    }}
                    className="w-full text-center py-2.5 text-[#101410] dark:text-[#f0f5ee] font-semibold border border-[#DCE4D6] dark:border-[#203a2c] rounded-2xl cursor-pointer hover:bg-[#E8F0DF] dark:hover:bg-[#18281f]"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenRoleSelector?.();
                    }}
                    className="w-full text-center py-2.5 text-white font-bold bg-[#08482D] hover:bg-[#0c5c3b] rounded-2xl shadow-md cursor-pointer"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
