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
  User as UserIcon,
  ShieldAlert,
  Shield,
  GraduationCap,
  Scan,
  QrCode,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenAdminAuth?: () => void;
  onOpenRoleSelector?: () => void;
  onOpenProfile?: () => void;
  onOpenContact?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onOpenAdminAuth,
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

  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    setRoleDropdownOpen(false);

    const performScroll = () => {
      const el = document.getElementById(sectionId);
      if (el) {
        const headerOffset = 85;
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
    <header className="fixed top-0 left-0 right-0 z-40 h-20 bg-[#FFF5E9] border-b-2 border-[#101D32] flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand Logo with Orange Square & White Cap */}
        <BrandLogo
          size="md"
          onClick={() => {
            setMobileMenuOpen(false);
            navigateTo('home');
          }}
        />

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-heading font-bold text-[#101D32]">
          {/* 1. Discover */}
          <button
            onClick={() => navigateTo('workshops')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activePage === 'workshops'
                ? 'bg-[#F4511E] text-white border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32]'
                : 'hover:bg-[#FFD6B0] hover:text-[#101D32]'
            }`}
          >
            <span>Discover</span>
          </button>

          {/* 2. Process */}
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="px-3.5 py-2 rounded-xl transition-all hover:bg-[#FFD6B0] hover:text-[#101D32] cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>Process</span>
          </button>

          {/* 3. Our Story */}
          <button
            onClick={() => navigateTo('our-story')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activePage === 'our-story'
                ? 'bg-[#F4511E] text-white border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32]'
                : 'hover:bg-[#FFD6B0] hover:text-[#101D32]'
            }`}
          >
            <span>Our Story</span>
          </button>

          {/* 4. Contact */}
          <button
            onClick={() => navigateTo('contact')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activePage === 'contact'
                ? 'bg-[#F4511E] text-white border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32]'
                : 'hover:bg-[#FFD6B0] hover:text-[#101D32]'
            }`}
          >
            <span>Contact</span>
          </button>

          {/* Authenticated Role Links */}
          {currentUser?.role === 'SUPER_ADMIN' && (
            <button
              onClick={() => navigateTo('admin-dashboard')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                activePage === 'admin-dashboard'
                  ? 'bg-[#F4511E] text-white border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32]'
                  : 'hover:bg-[#FFD6B0] hover:text-[#101D32]'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-[#F4511E] group-hover:text-white shrink-0" />
              <span>Dashboard</span>
            </button>
          )}

          {(currentUser?.role === 'ORGANIZER' || currentUser?.role === 'SUPER_ADMIN') && (
            <button
              onClick={() => navigateTo('organizer-dashboard')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                activePage === 'organizer-dashboard'
                  ? 'bg-[#F4511E] text-white border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32]'
                  : 'hover:bg-[#FFD6B0] hover:text-[#101D32]'
              }`}
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span>Organizer Studio</span>
            </button>
          )}

          {(currentVolunteer || currentUser?.role === 'VOLUNTEER') && (
            <button
              onClick={() => navigateTo('volunteer-portal')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                activePage === 'volunteer-portal'
                  ? 'bg-[#F4511E] text-white border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32]'
                  : 'hover:bg-[#FFD6B0] hover:text-[#101D32]'
              }`}
            >
              <Scan className="w-4 h-4 shrink-0" />
              <span>Gate Station</span>
            </button>
          )}

          {currentUser?.role === 'PARTICIPANT' && (
            <>
              <button
                onClick={() => navigateTo('participant-dashboard')}
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  activePage === 'participant-dashboard'
                    ? 'bg-[#F4511E] text-white border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32]'
                    : 'hover:bg-[#FFD6B0] hover:text-[#101D32]'
                }`}
              >
                <GraduationCap className="w-4 h-4 shrink-0" />
                <span>Student Desk</span>
              </button>

              <button
                onClick={() => navigateTo('my-registrations')}
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  activePage === 'my-registrations'
                    ? 'bg-[#F4511E] text-white border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32]'
                    : 'hover:bg-[#FFD6B0] hover:text-[#101D32]'
                }`}
              >
                <QrCode className="w-4 h-4 shrink-0" />
                <span>My Passes</span>
              </button>
            </>
          )}
        </nav>

        {/* Right Controls: Profile / Auth Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {currentVolunteer ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenProfile}
                className="py-1.5 px-3.5 rounded-xl border-2 border-[#101D32] bg-[#FFD6B0] text-xs text-left shadow-[2px_2px_0px_0px_#101D32] cursor-pointer"
              >
                <span className="font-heading font-bold text-[#101D32] block leading-tight">
                  Volunteer: {currentVolunteer.name}
                </span>
                <span className="text-[10px] text-[#101D32]/70 hidden sm:block truncate max-w-[130px]">
                  {currentVolunteer.assignedWorkshopTitle}
                </span>
              </button>
              <button
                onClick={() => {
                  logoutVolunteer();
                  navigateTo('home');
                }}
                className="p-2 border-2 border-[#101D32] bg-white text-rose-600 hover:bg-rose-50 rounded-xl shadow-[2px_2px_0px_0px_#101D32] transition-colors cursor-pointer"
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
                className="flex items-center gap-2 py-1.5 px-3 rounded-xl border-2 border-[#101D32] bg-white shadow-[2px_2px_0px_0px_#101D32] transition-transform active:translate-x-0.5 active:translate-y-0.5 text-xs font-bold cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-[#FFD6B0] border border-[#101D32] text-[#101D32] flex items-center justify-center font-bold text-xs uppercase">
                  {currentUser.fullName.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="font-heading font-bold text-[#101D32] leading-tight truncate max-w-[120px]">
                    {currentUser.fullName}
                  </div>
                  <div className="text-[10px] text-[#F4511E] font-semibold">
                    {getRoleLabel(currentUser.role)}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#101D32]" />
              </button>

              <AnimatePresence>
                {roleDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border-2 border-[#101D32] shadow-[6px_6px_0px_0px_#101D32] py-2 z-50 text-xs"
                    onClick={() => setRoleDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b-2 border-[#101D32]/10 bg-[#FFF5E9]">
                      <p className="font-heading font-bold text-[#101D32] text-sm">
                        {currentUser.fullName}
                      </p>
                      <p className="text-[#101D32]/70 truncate text-[11px] font-mono mt-0.5">
                        {currentUser.email}
                      </p>
                      <span className="inline-block mt-1.5 text-[10px] font-bold tracking-wider text-white bg-[#F4511E] border border-[#101D32] px-2.5 py-0.5 rounded-md">
                        {currentUser.role}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setRoleDropdownOpen(false);
                        onOpenProfile?.();
                      }}
                      className="w-full text-left px-4 py-2.5 text-[#101D32] hover:bg-[#FFD6B0] flex items-center gap-2 font-semibold cursor-pointer"
                    >
                      <UserIcon className="w-4 h-4 text-[#F4511E]" />
                      <span>Profile & Settings</span>
                    </button>

                    {currentUser.role === 'SUPER_ADMIN' && (
                      <button
                        onClick={() => {
                          setRoleDropdownOpen(false);
                          navigateTo('admin-dashboard');
                        }}
                        className="w-full text-left px-4 py-2.5 text-[#101D32] hover:bg-[#FFD6B0] flex items-center gap-2 font-bold cursor-pointer"
                      >
                        <ShieldAlert className="w-4 h-4 text-[#F4511E]" />
                        <span>Admin Dashboard</span>
                      </button>
                    )}

                    {currentUser.role === 'ORGANIZER' && (
                      <button
                        onClick={() => navigateTo('organizer-dashboard')}
                        className="w-full text-left px-4 py-2.5 text-[#101D32] hover:bg-[#FFD6B0] flex items-center gap-2 font-bold cursor-pointer"
                      >
                        <PlusCircle className="w-4 h-4 text-[#F4511E]" />
                        <span>Organizer Studio</span>
                      </button>
                    )}

                    <div className="border-t-2 border-[#101D32]/10 my-1" />

                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2.5 text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-bold cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* Unauthenticated Buttons */
            <>
              {/* Desktop Auth Buttons */}
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={onOpenAdminAuth}
                  className="px-3.5 py-2 text-xs font-heading font-bold text-[#101D32] bg-white hover:bg-[#FFD6B0] rounded-xl border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] flex items-center gap-1.5 transition-all neo-btn cursor-pointer"
                  title="Super Admin Portal"
                >
                  <Shield className="w-3.5 h-3.5 text-[#F4511E]" />
                  <span>Admin</span>
                </button>
                <button
                  onClick={onOpenAuth}
                  className="px-4 py-2 text-sm font-heading font-bold text-[#101D32] hover:bg-[#FFD6B0] rounded-xl transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={onOpenRoleSelector}
                  className="px-5 py-2 text-sm font-heading font-bold text-white bg-[#F4511E] hover:bg-[#E84316] rounded-xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] neo-btn flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Mobile Quick Action Buttons (visible on phones) */}
              <div className="flex sm:hidden items-center gap-1.5">
                <button
                  onClick={onOpenAdminAuth}
                  className="px-2.5 py-1.5 text-[11px] font-heading font-bold text-[#101D32] bg-white hover:bg-[#FFD6B0] rounded-lg border-2 border-[#101D32] shadow-[1.5px_1.5px_0px_0px_#101D32] flex items-center gap-1 cursor-pointer"
                  title="Super Admin Portal"
                >
                  <Shield className="w-3 h-3 text-[#F4511E]" />
                  <span>Admin</span>
                </button>
                <button
                  onClick={onOpenAuth}
                  className="px-2.5 py-1.5 text-[11px] font-heading font-bold text-white bg-[#F4511E] rounded-lg border-2 border-[#101D32] shadow-[1.5px_1.5px_0px_0px_#101D32] cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            </>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-xl border-2 border-[#101D32] bg-white shadow-[2px_2px_0px_0px_#101D32] text-[#101D32] hover:bg-[#FFD6B0] transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5 stroke-[2.5]" /> : <Menu className="w-5 h-5 stroke-[2.5]" />}
          </button>
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
              className="fixed inset-0 bg-[#101D32]/40 backdrop-blur-xs z-30 pointer-events-auto lg:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="fixed top-22 left-4 right-4 max-h-[80vh] overflow-y-auto pointer-events-auto bg-[#FFF5E9] rounded-2xl border-2 border-[#101D32] shadow-[6px_6px_0px_0px_#101D32] p-5 space-y-2 text-sm font-heading font-bold z-40"
            >
              {/* Mobile Drawer Header */}
              <div className="flex items-center justify-between pb-3 mb-2 border-b-2 border-[#101D32]/15">
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
                  className="p-1.5 rounded-lg border border-[#101D32] hover:bg-[#FFD6B0] text-[#101D32] transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Items */}
              <button
                onClick={() => {
                  navigateTo('workshops');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left py-2.5 px-3.5 rounded-xl cursor-pointer transition-colors ${
                  activePage === 'workshops'
                    ? 'bg-[#F4511E] text-white border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32]'
                    : 'text-[#101D32] hover:bg-[#FFD6B0]'
                }`}
              >
                <span>Discover</span>
              </button>

              <button
                onClick={() => scrollToSection('how-it-works')}
                className="w-full text-left py-2.5 px-3.5 rounded-xl hover:bg-[#FFD6B0] text-[#101D32] cursor-pointer transition-colors"
              >
                <span>Process</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigateTo('our-story');
                }}
                className={`w-full text-left py-2.5 px-3.5 rounded-xl cursor-pointer transition-colors ${
                  activePage === 'our-story'
                    ? 'bg-[#F4511E] text-white border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32]'
                    : 'text-[#101D32] hover:bg-[#FFD6B0]'
                }`}
              >
                <span>Our Story</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigateTo('contact');
                }}
                className={`w-full text-left py-2.5 px-3.5 rounded-xl cursor-pointer transition-colors ${
                  activePage === 'contact'
                    ? 'bg-[#F4511E] text-white border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32]'
                    : 'text-[#101D32] hover:bg-[#FFD6B0]'
                }`}
              >
                <span>Contact</span>
              </button>

              {currentUser?.role === 'SUPER_ADMIN' && (
                <button
                  onClick={() => {
                    navigateTo('admin-dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2.5 px-3.5 rounded-xl text-[#F4511E] hover:bg-[#FFD6B0] flex items-center gap-2 cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Admin Dashboard</span>
                </button>
              )}

              {(currentUser?.role === 'ORGANIZER' || currentUser?.role === 'SUPER_ADMIN') && (
                <button
                  onClick={() => {
                    navigateTo('organizer-dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2.5 px-3.5 rounded-xl text-[#F4511E] hover:bg-[#FFD6B0] flex items-center gap-2 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 shrink-0" />
                  <span>Organizer Studio</span>
                </button>
              )}

              {currentUser?.role === 'PARTICIPANT' && (
                <>
                  <button
                    onClick={() => {
                      navigateTo('participant-dashboard');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2.5 px-3.5 rounded-xl text-[#101D32] hover:bg-[#FFD6B0] flex items-center gap-2 cursor-pointer"
                  >
                    <GraduationCap className="w-4 h-4 text-[#F4511E] shrink-0" />
                    <span>Student Desk</span>
                  </button>

                  <button
                    onClick={() => {
                      navigateTo('my-registrations');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2.5 px-3.5 rounded-xl text-[#101D32] hover:bg-[#FFD6B0] flex items-center gap-2 cursor-pointer"
                  >
                    <QrCode className="w-4 h-4 text-[#F4511E] shrink-0" />
                    <span>My Passes</span>
                  </button>
                </>
              )}

              {/* Mobile Auth CTAs if not logged in */}
              {!currentUser && !currentVolunteer && (
                <div className="pt-3 border-t-2 border-[#101D32]/15 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAdminAuth?.();
                    }}
                    className="w-full py-2.5 text-center font-bold text-[#101D32] bg-[#FFF5E9] hover:bg-[#FFD6B0] border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Shield className="w-4 h-4 text-[#F4511E]" />
                    <span>Admin Portal</span>
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth();
                    }}
                    className="w-full py-2.5 text-center font-bold text-[#101D32] bg-white border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] rounded-xl cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenRoleSelector?.();
                    }}
                    className="w-full py-2.5 text-center font-bold text-white bg-[#F4511E] border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] rounded-xl cursor-pointer"
                  >
                    Get Started
                  </button>
                </div>
              )}

              {/* Mobile Sign out if logged in */}
              {(currentUser || currentVolunteer) && (
                <div className="pt-3 border-t-2 border-[#101D32]/15">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (currentVolunteer) logoutVolunteer();
                      else logoutUser();
                      navigateTo('home');
                    }}
                    className="w-full py-2.5 text-center font-bold text-rose-600 bg-white border-2 border-rose-600 shadow-[2px_2px_0px_0px_#e11d48] rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
