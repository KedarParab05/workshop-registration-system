import React from 'react';
import { useApp } from '../../context/AppContext';
import { BrandLogo } from '../common/BrandLogo';
import { RefreshCw, ShieldCheck, Mail, MapPin, Phone, Compass, BookOpen, ArrowRight, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  onOpenAuth?: () => void;
  onOpenRoleSelector?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAuth, onOpenRoleSelector }) => {
  const { navigateTo, resetToDemoData, activePage, currentUser, currentVolunteer } = useApp();

  const scrollToSection = (sectionId: string) => {
    if (activePage !== 'home') {
      navigateTo('home');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <footer className="bg-[#08482D] dark:bg-[#07160f] text-[#DAE7C7]/80 dark:text-[#95ad9e] text-xs border-t border-[#0b5c3b] dark:border-[#1a3826] mt-auto transition-colors relative overflow-hidden grid-background-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-8 mb-10 sm:mb-12">
          {/* Brand & Mission Column */}
          <div className="space-y-4 lg:col-span-2">
            <BrandLogo
              size="md"
              inverseText={true}
              onClick={() => navigateTo('home')}
            />

            <p className="text-[#DAE7C7]/80 dark:text-[#95ad9e] text-xs leading-relaxed max-w-sm font-sans">
              An academic-first workshop discovery and seat capacity governance platform. Dedicated to hands-on technical learning, tamper-proof digital QR passes, and transparent collegiate event operations.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0b5c3b]/70 dark:bg-[#12281c] text-[#DAE7C7] text-[11px] font-heading font-medium border border-[#DAE7C7]/20 shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#DAE7C7] shrink-0" />
              <span>Free &amp; Paid Academic Sessions · Razorpay Secure Checkout</span>
            </div>
          </div>

          {/* Explore Column */}
          <div className="space-y-3.5">
            <h4 className="text-white font-heading font-bold text-xs tracking-wider uppercase">
              Explore
            </h4>
            <ul className="space-y-2.5 font-medium">
              <li>
                <button
                  onClick={() => navigateTo('workshops')}
                  className="hover:text-white dark:hover:text-[#DAE7C7] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5 text-[#DAE7C7]" />
                  <span>Discover Workshops</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="hover:text-white dark:hover:text-[#DAE7C7] transition-colors cursor-pointer"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('workshops')}
                  className="hover:text-white dark:hover:text-[#DAE7C7] transition-colors cursor-pointer"
                >
                  Technical Tracks
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('faq')}
                  className="hover:text-white dark:hover:text-[#DAE7C7] transition-colors cursor-pointer"
                >
                  Frequently Asked Questions
                </button>
              </li>
            </ul>
          </div>

          {/* Platform & Community Column */}
          <div className="space-y-3.5">
            <h4 className="text-white font-heading font-bold text-xs tracking-wider uppercase">
              Platform
            </h4>
            <ul className="space-y-2.5 font-medium">
              <li>
                <button
                  onClick={() => navigateTo('our-story')}
                  className="hover:text-white dark:hover:text-[#DAE7C7] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#DAE7C7]" />
                  <span>Our Story &amp; Philosophy</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (currentUser?.role === 'ORGANIZER') {
                      navigateTo('organizer-dashboard');
                    } else if (onOpenRoleSelector) {
                      onOpenRoleSelector();
                    } else {
                      scrollToSection('why-kaushalya');
                    }
                  }}
                  className="hover:text-white dark:hover:text-[#DAE7C7] transition-colors cursor-pointer"
                >
                  For Faculty Organizers
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('volunteer-portal')}
                  className="hover:text-white dark:hover:text-[#DAE7C7] transition-colors cursor-pointer"
                >
                  Volunteer Gate Station
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('contact')}
                  className="hover:text-white dark:hover:text-[#DAE7C7] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-[#DAE7C7]" />
                  <span>Contact Project Team</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Account / Role Destinations & Maintainer Info */}
          <div className="space-y-3.5">
            <h4 className="text-white font-heading font-bold text-xs tracking-wider uppercase">
              {currentUser ? 'Your Workspace' : 'Get Connected'}
            </h4>

            {currentUser ? (
              <div className="space-y-2.5">
                <div className="text-[11px] text-white/90">
                  Signed in as <strong className="text-white font-semibold">{currentUser.fullName}</strong>
                  <span className="block text-[10px] text-[#DAE7C7] uppercase font-mono mt-0.5">
                    {currentUser.role}
                  </span>
                </div>

                {currentUser.role === 'PARTICIPANT' && (
                  <button
                    onClick={() => navigateTo('my-registrations')}
                    className="w-full text-left py-1.5 text-xs text-white hover:text-[#DAE7C7] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>My Digital Passes</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}

                {currentUser.role === 'ORGANIZER' && (
                  <button
                    onClick={() => navigateTo('organizer-dashboard')}
                    className="w-full text-left py-1.5 text-xs text-white hover:text-[#DAE7C7] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Organizer Studio</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}

                {currentUser.role === 'VOLUNTEER' && (
                  <button
                    onClick={() => navigateTo('volunteer-portal')}
                    className="w-full text-left py-1.5 text-xs text-white hover:text-[#DAE7C7] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Gate Scanner Portal</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}

                {currentUser.role === 'SUPER_ADMIN' && (
                  <button
                    onClick={() => navigateTo('admin-dashboard')}
                    className="w-full text-left py-1.5 text-xs text-white hover:text-[#DAE7C7] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Governance Console</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            ) : currentVolunteer ? (
              <div className="space-y-2">
                <span className="text-[11px] text-white/90 block">
                  Volunteer: <strong className="text-white">{currentVolunteer.name}</strong>
                </span>
                <button
                  onClick={() => navigateTo('volunteer-portal')}
                  className="text-xs text-white hover:text-[#DAE7C7] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Return to Scanner</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={onOpenAuth}
                  className="block text-left text-xs text-white hover:text-[#DAE7C7] font-semibold transition-colors cursor-pointer"
                >
                  Sign In to Account &rarr;
                </button>
                <button
                  onClick={onOpenRoleSelector}
                  className="block text-left text-xs text-white hover:text-[#DAE7C7] font-semibold transition-colors cursor-pointer"
                >
                  Role Switcher &amp; Demos &rarr;
                </button>
              </div>
            )}

            {/* Department info */}
            <div className="pt-2 border-t border-[#0b5c3b] dark:border-[#1a3826] text-[11px] text-[#DAE7C7]/80 dark:text-[#95ad9e] space-y-1.5">
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#DAE7C7] shrink-0 mt-0.5" />
                <span>Guru Nanak Institute of Management Studies, Mumbai</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#DAE7C7] shrink-0" />
                <a href="tel:+912224043928" className="hover:text-white dark:hover:text-[#DAE7C7] transition-colors">
                  +91 (022) 2404 3928
                </a>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#DAE7C7] shrink-0" />
                <button
                  onClick={() => navigateTo('contact')}
                  className="font-mono hover:text-white dark:hover:text-[#DAE7C7] underline cursor-pointer"
                >
                  campus-desk@kaushalya.edu
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Verification Row */}
        <div className="pt-8 border-t border-[#0b5c3b] dark:border-[#1a3826] flex flex-col sm:flex-row items-center justify-between gap-4 text-[#DAE7C7]/80 dark:text-[#95ad9e] text-[11px] text-center sm:text-left">
          <div>
            &copy; {new Date().getFullYear()} Kaushalya (कौशल्य). Learn. Build. Grow.
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-3 text-center sm:text-right">
            <span>Production Academic Platform</span>
            <span>·</span>
            <span>256-Bit Encrypted Payments</span>
            <span>·</span>
            <span className="flex items-center gap-1 text-white font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#DAE7C7]" />
              <span>Academic Integrity Verified</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};