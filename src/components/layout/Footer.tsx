import React from 'react';
import { useApp } from '../../context/AppContext';
import { RefreshCw, Sparkles, ShieldCheck, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigateTo, resetToDemoData, activePage } = useApp();

  const scrollToSection = (sectionId: string) => {
    if (activePage !== 'home') {
      navigateTo('home');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-white dark:bg-[#0b140e] text-[#5E5E61] dark:text-[#8ba895] text-xs border-t border-[#DCE4D6] dark:border-[#203a2c] mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-10">
          {/* Brand Info */}
          <div className="space-y-3.5 md:col-span-2">
            <div className="flex items-center gap-2.5 text-[#101410] dark:text-[#f0f5ee] font-heading font-extrabold text-lg">
              <div className="w-8 h-8 rounded-xl bg-[#08482D] text-[#DAE7C7] flex items-center justify-center shadow-sm">
                <svg
                  className="w-4 h-4 text-[#DAE7C7]"
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
              <div className="flex items-center gap-1.5">
                <span>Kaushalya</span>
                <span className="text-[11px] font-sans font-medium text-[#08482D] dark:text-[#DAE7C7] bg-[#DAE7C7]/60 dark:bg-[#1f3d2d] px-1.5 py-0.2 rounded">
                  कौशल्य
                </span>
              </div>
            </div>
            <p className="text-[#5E5E61] dark:text-slate-400 text-xs leading-relaxed max-w-md">
              A modern, production-grade academic workshop registration and capacity governance platform.
              Dedicated to hands-on technical learning, verifiable digital QR passes, and transparent event operations.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F0DF] dark:bg-[#14231b] text-[#08482D] dark:text-[#DAE7C7] text-[11px] font-heading font-semibold border border-[#DCE4D6] dark:border-[#203a2c]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Free & Paid Academic Workshops — Powered by Razorpay</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-[#101410] dark:text-[#f0f5ee] font-heading font-bold text-xs tracking-wider uppercase mb-3.5">
              Explore
            </h4>
            <ul className="space-y-2 font-medium">
              <li>
                <button
                  onClick={() => navigateTo('workshops')}
                  className="hover:text-[#08482D] dark:hover:text-[#DAE7C7] transition-colors"
                >
                  Discover Workshops
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="hover:text-[#08482D] dark:hover:text-[#DAE7C7] transition-colors"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('categories')}
                  className="hover:text-[#08482D] dark:hover:text-[#DAE7C7] transition-colors"
                >
                  Technical Tracks
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('platform-tour')}
                  className="hover:text-[#08482D] dark:hover:text-[#DAE7C7] transition-colors"
                >
                  Platform Tour
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('faq')}
                  className="hover:text-[#08482D] dark:hover:text-[#DAE7C7] transition-colors"
                >
                  FAQ & Common Questions
                </button>
              </li>
            </ul>
          </div>

          {/* Roles & Governance */}
          <div>
            <h4 className="text-[#101410] dark:text-[#f0f5ee] font-heading font-bold text-xs tracking-wider uppercase mb-3.5">
              Roles & Portals
            </h4>
            <ul className="space-y-2 font-medium">
              <li>
                <button
                  onClick={() => navigateTo('participant-dashboard')}
                  className="hover:text-[#08482D] dark:hover:text-[#DAE7C7] transition-colors"
                >
                  Student Desk & Passes
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('organizer-dashboard')}
                  className="hover:text-[#08482D] dark:hover:text-[#DAE7C7] transition-colors"
                >
                  Faculty Organizer Studio
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('volunteer-portal')}
                  className="hover:text-[#08482D] dark:hover:text-[#DAE7C7] transition-colors"
                >
                  Volunteer Gate Scanner
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('admin-dashboard')}
                  className="hover:text-[#08482D] dark:hover:text-[#DAE7C7] transition-colors"
                >
                  Super Admin Governance
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('our-story')}
                  className="hover:text-[#08482D] dark:hover:text-[#DAE7C7] transition-colors"
                >
                  Our Story & Philosophy
                </button>
              </li>
            </ul>
          </div>

          {/* Project Maintenance & Evaluation */}
          <div>
            <h4 className="text-[#101410] dark:text-[#f0f5ee] font-heading font-bold text-xs tracking-wider uppercase mb-3.5">
              Maintainer Info
            </h4>
            <p className="text-xs text-[#5E5E61] dark:text-slate-400 leading-relaxed mb-3">
              Built with React 19, TypeScript, Tailwind CSS v4, Spring Boot 3.2.5, and MongoDB Atlas.
            </p>
            <div className="space-y-1.5 text-[11px] text-[#5E5E61] dark:text-slate-400 mb-3">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#08482D] dark:text-[#DAE7C7] shrink-0" />
                <span>Department of Computer Science & Engineering</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#08482D] dark:text-[#DAE7C7] shrink-0" />
                <span className="font-mono">[Project Team Contact Placeholder]</span>
              </div>
            </div>
            <button
              onClick={resetToDemoData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DCE4D6] dark:border-[#203a2c] bg-[#F5F8EF] dark:bg-[#14231b] hover:bg-[#E8F0DF] dark:hover:bg-[#1b2b22] text-[#08482D] dark:text-[#DAE7C7] text-xs font-heading font-semibold transition-colors shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Demo Seed Records</span>
            </button>
          </div>
        </div>

        <div className="pt-8 border-t border-[#DCE4D6] dark:border-[#203a2c] flex flex-col sm:flex-row items-center justify-between gap-4 text-[#5E5E61] dark:text-slate-400 text-[11px]">
          <div>
            &copy; {new Date().getFullYear()} Kaushalya (कौशल्य). Learn. Build. Grow.
          </div>
          <div className="flex items-center gap-3">
            <span>Free & Paid Workshops</span>
            <span>·</span>
            <span>Inter Tight & Caveat</span>
            <span>·</span>
            <span className="flex items-center gap-1 text-[#08482D] dark:text-[#DAE7C7] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Academic Integrity Verified</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
