import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  LogOut,
  ChevronDown,
  Menu,
  X,
  PlusCircle,
  Sun,
  Moon,
  Sparkles,
  User as UserIcon,
  ShieldAlert,
  Compass,
  HelpCircle,
  Info,
  BookOpen,
  Mail,
  GraduationCap,
  Briefcase,
  Scan,
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
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);

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

  // Smooth scroll handler for homepage sections
  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);

    if (activePage !== 'home') {
      navigateTo('home');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <header className="fixed top-3 sm:top-4 left-0 right-0 z-40 flex flex-col items-center px-3 sm:px-6 pointer-events-none">
      {/* ─────────────────────────────────────────────────────────────
          FLOATING CENTERED ROUNDED CAPSULE NAVBAR
      ───────────────────────────────────────────────────────────── */}
      <div className="w-full max-w-6xl pointer-events-auto bg-[#F5F8EF]/95 dark:bg-[#0c1610]/95 backdrop-blur-md rounded-full border border-[#DCE4D6] dark:border-[#203a2c] shadow-lg shadow-[#08482D]/5 px-4 sm:px-6 py-2.5 transition-all duration-200">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {/* Brand: Kaushalya (कौशल्य) */}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              navigateTo('home');
            }}
            className="flex items-center gap-3 text-left group shrink-0 transition-transform active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#08482D] rounded-full"
            aria-label="Kaushalya Home"
          >
            <div className="w-10 h-10 rounded-full bg-[#08482D] text-[#DAE7C7] flex items-center justify-center shadow-md shadow-[#08482D]/20 group-hover:bg-[#0c5c3b] transition-colors">
              <svg
                className="w-5 h-5 text-[#DAE7C7]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-extrabold text-xl tracking-tight text-[#101410] dark:text-[#f0f5ee] leading-none">
                  Kaushalya
                </span>
                <span className="text-[11px] font-sans font-medium text-[#08482D] dark:text-[#DAE7C7] bg-[#DAE7C7]/70 dark:bg-[#1f3d2d] px-1.5 py-0.5 rounded-md">
                  कौशल्य
                </span>
              </div>
              <span className="text-[10px] text-[#5E5E61] dark:text-emerald-400 font-medium tracking-wide uppercase block mt-0.5">
                Learn. Build. Grow.
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links (Visibly Larger text-sm font-semibold) */}
          <nav className="hidden lg:flex items-center gap-2 xl:gap-3 text-sm font-heading font-semibold text-[#5E5E61] dark:text-[#8ba895]">
            <button
              onClick={() => navigateTo('workshops')}
              className={`px-3.5 py-2 rounded-full transition-all flex items-center gap-1.5 ${
                activePage === 'workshops'
                  ? 'text-[#08482D] dark:text-[#DAE7C7] bg-[#DAE7C7]/60 dark:bg-[#192f22] font-bold'
                  : 'hover:text-[#101410] dark:hover:text-[#f0f5ee] hover:bg-[#E8F0DF] dark:hover:bg-[#192f22]'
              }`}
            >
              <Compass className="w-4 h-4 text-[#08482D] dark:text-[#DAE7C7]" />
              <span>Discover Workshops</span>
            </button>

            <button
              onClick={() => scrollToSection('how-it-works')}
              className="px-3.5 py-2 rounded-full transition-all hover:text-[#101410] dark:hover:text-[#f0f5ee] hover:bg-[#E8F0DF] dark:hover:bg-[#192f22]"
            >
              How It Works
            </button>

            <button
              onClick={() => {
                if (currentUser?.role === 'ORGANIZER') {
                  navigateTo('organizer-dashboard');
                } else {
                  scrollToSection('for-organizers');
                }
              }}
              className={`px-3.5 py-2 rounded-full transition-all ${
                activePage === 'organizer-dashboard'
                  ? 'text-[#08482D] dark:text-[#DAE7C7] bg-[#DAE7C7]/60 dark:bg-[#192f22] font-bold'
                  : 'hover:text-[#101410] dark:hover:text-[#f0f5ee] hover:bg-[#E8F0DF] dark:hover:bg-[#192f22]'
              }`}
            >
              For Organizers
            </button>

            <button
              onClick={() => {
                if (currentVolunteer || currentUser?.role === 'VOLUNTEER') {
                  navigateTo('volunteer-portal');
                } else {
                  scrollToSection('volunteer');
                }
              }}
              className={`px-3.5 py-2 rounded-full transition-all flex items-center gap-1.5 ${
                activePage === 'volunteer-portal'
                  ? 'text-[#08482D] dark:text-[#DAE7C7] bg-[#DAE7C7]/60 dark:bg-[#192f22] font-bold'
                  : 'hover:text-[#101410] dark:hover:text-[#f0f5ee] hover:bg-[#E8F0DF] dark:hover:bg-[#192f22]'
              }`}
            >
              <span>Volunteer</span>
            </button>

            {/* About & More Dropdown */}
            <div className="relative">
              <button
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                className="px-3.5 py-2 rounded-full transition-all hover:text-[#101410] dark:hover:text-[#f0f5ee] hover:bg-[#E8F0DF] dark:hover:bg-[#192f22] flex items-center gap-1"
                aria-expanded={moreDropdownOpen}
              >
                <span>About & More</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {moreDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 mt-2 w-52 bg-white dark:bg-[#14231b] rounded-2xl shadow-xl border border-[#DCE4D6] dark:border-[#203a2c] py-2 z-50 text-xs"
                    onClick={() => setMoreDropdownOpen(false)}
                  >
                    <button
                      onClick={() => scrollToSection('about')}
                      className="w-full text-left px-4 py-2.5 text-[#101410] dark:text-[#f0f5ee] hover:bg-[#E8F0DF] dark:hover:bg-[#1b2b22] flex items-center gap-2 font-medium"
                    >
                      <Info className="w-4 h-4 text-[#08482D] dark:text-[#DAE7C7]" />
                      <span>About Kaushalya</span>
                    </button>
                    <button
                      onClick={() => scrollToSection('our-story')}
                      className="w-full text-left px-4 py-2.5 text-[#101410] dark:text-[#f0f5ee] hover:bg-[#E8F0DF] dark:hover:bg-[#1b2b22] flex items-center gap-2 font-medium"
                    >
                      <BookOpen className="w-4 h-4 text-[#08482D] dark:text-[#DAE7C7]" />
                      <span>Our Story</span>
                    </button>
                    <button
                      onClick={() => scrollToSection('faq')}
                      className="w-full text-left px-4 py-2.5 text-[#101410] dark:text-[#f0f5ee] hover:bg-[#E8F0DF] dark:hover:bg-[#1b2b22] flex items-center gap-2 font-medium"
                    >
                      <HelpCircle className="w-4 h-4 text-[#08482D] dark:text-[#DAE7C7]" />
                      <span>FAQ & Support</span>
                    </button>
                    <div className="border-t border-[#DCE4D6] dark:border-[#203a2c] my-1" />
                    <button
                      onClick={() => scrollToSection('contact')}
                      className="w-full text-left px-4 py-2.5 text-[#101410] dark:text-[#f0f5ee] hover:bg-[#E8F0DF] dark:hover:bg-[#1b2b22] flex items-center gap-2 font-medium"
                    >
                      <Mail className="w-4 h-4 text-[#08482D] dark:text-[#DAE7C7]" />
                      <span>Contact Team</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Student Shortcut */}
            {currentUser?.role === 'PARTICIPANT' && (
              <button
                onClick={() => navigateTo('my-registrations')}
                className={`px-3.5 py-2 rounded-full transition-all flex items-center gap-1.5 ${
                  activePage === 'my-registrations'
                    ? 'text-[#08482D] dark:text-[#DAE7C7] bg-[#DAE7C7]/60 dark:bg-[#192f22] font-bold'
                    : 'hover:text-[#101410] dark:hover:text-[#f0f5ee] hover:bg-[#E8F0DF] dark:hover:bg-[#192f22]'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>My Passes</span>
              </button>
            )}

            {/* Admin Shortcut */}
            {currentUser?.role === 'SUPER_ADMIN' && (
              <button
                onClick={() => navigateTo('admin-dashboard')}
                className={`px-3.5 py-2 rounded-full transition-all flex items-center gap-1.5 ${
                  activePage === 'admin-dashboard'
                    ? 'text-[#08482D] dark:text-[#DAE7C7] bg-[#DAE7C7]/60 dark:bg-[#192f22] font-bold'
                    : 'hover:text-[#101410] dark:hover:text-[#f0f5ee] hover:bg-[#E8F0DF] dark:hover:bg-[#192f22]'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-[#08482D] dark:text-[#DAE7C7]" />
                <span>Governance Console</span>
              </button>
            )}
          </nav>

          {/* Right Controls: Theme Toggle & Prominent Auth Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
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
              <div className="relative">
                <button
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className="flex items-center gap-2 py-1.5 px-3 rounded-full border border-[#DCE4D6] dark:border-[#203a2c] bg-white dark:bg-[#14231b] hover:border-[#08482D]/40 transition-colors text-xs font-medium shadow-xs"
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
                          onClick={() => navigateTo('admin-dashboard')}
                          className="w-full text-left px-4 py-2.5 text-[#08482D] dark:text-[#DAE7C7] hover:bg-[#E8F0DF] dark:hover:bg-[#1b2b22] flex items-center gap-2 font-semibold"
                        >
                          <ShieldAlert className="w-4 h-4" />
                          <span>Governance Console</span>
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
              /* Distinct Sign In and Get Started Pills */
              <div className="flex items-center gap-2 sm:gap-2.5">
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
              className="lg:hidden p-2 rounded-full text-[#101410] dark:text-[#f0f5ee] hover:bg-[#E8F0DF] dark:hover:bg-[#14231b] transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Card floating cleanly below pill) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-sm pointer-events-auto mt-2 bg-white dark:bg-[#14231b] rounded-3xl border border-[#DCE4D6] dark:border-[#203a2c] shadow-2xl p-5 space-y-2 text-sm font-heading font-semibold"
          >
            <button
              onClick={() => {
                navigateTo('workshops');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2.5 px-3 rounded-2xl hover:bg-[#E8F0DF] dark:hover:bg-[#1b2b22] text-[#101410] dark:text-[#f0f5ee] flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-[#08482D] dark:text-[#DAE7C7]" />
              <span>Discover Workshops</span>
            </button>

            <button
              onClick={() => scrollToSection('how-it-works')}
              className="w-full text-left py-2.5 px-3 rounded-2xl hover:bg-[#E8F0DF] dark:hover:bg-[#1b2b22] text-[#101410] dark:text-[#f0f5ee]"
            >
              How It Works
            </button>

            <button
              onClick={() => scrollToSection('for-organizers')}
              className="w-full text-left py-2.5 px-3 rounded-2xl hover:bg-[#E8F0DF] dark:hover:bg-[#1b2b22] text-[#101410] dark:text-[#f0f5ee]"
            >
              For Organizers
            </button>

            <button
              onClick={() => scrollToSection('volunteer')}
              className="w-full text-left py-2.5 px-3 rounded-2xl hover:bg-[#E8F0DF] dark:hover:bg-[#1b2b22] text-[#101410] dark:text-[#f0f5ee]"
            >
              Gate Volunteer Station
            </button>

            <button
              onClick={() => scrollToSection('about')}
              className="w-full text-left py-2.5 px-3 rounded-2xl hover:bg-[#E8F0DF] dark:hover:bg-[#1b2b22] text-[#101410] dark:text-[#f0f5ee]"
            >
              About Kaushalya
            </button>

            <button
              onClick={() => scrollToSection('our-story')}
              className="w-full text-left py-2.5 px-3 rounded-2xl hover:bg-[#E8F0DF] dark:hover:bg-[#1b2b22] text-[#101410] dark:text-[#f0f5ee]"
            >
              Our Story
            </button>

            <button
              onClick={() => scrollToSection('faq')}
              className="w-full text-left py-2.5 px-3 rounded-2xl hover:bg-[#E8F0DF] dark:hover:bg-[#1b2b22] text-[#101410] dark:text-[#f0f5ee]"
            >
              FAQ & Support
            </button>

            <button
              onClick={() => scrollToSection('contact')}
              className="w-full text-left py-2.5 px-3 rounded-2xl hover:bg-[#E8F0DF] dark:hover:bg-[#1b2b22] text-[#101410] dark:text-[#f0f5ee]"
            >
              Contact Team
            </button>

            {currentUser?.role === 'PARTICIPANT' && (
              <button
                onClick={() => {
                  navigateTo('my-registrations');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2.5 px-3 rounded-2xl bg-[#DAE7C7]/40 text-[#08482D] dark:text-[#DAE7C7]"
              >
                My Passes & Registrations
              </button>
            )}

            <div className="pt-3 border-t border-[#DCE4D6] dark:border-[#203a2c] space-y-2">
              {currentUser ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="w-full text-center py-3 text-rose-600 font-semibold rounded-2xl bg-rose-50 dark:bg-rose-950/40"
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
                    className="w-full text-center py-2.5 text-[#101410] dark:text-[#f0f5ee] font-semibold border border-[#DCE4D6] dark:border-[#203a2c] rounded-2xl"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenRoleSelector?.();
                    }}
                    className="w-full text-center py-2.5 text-white font-bold bg-[#08482D] rounded-2xl shadow-md"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
