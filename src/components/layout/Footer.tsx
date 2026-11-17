import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BrandLogo } from '../common/BrandLogo';
import {
  ShieldCheck,
  Compass,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Send,
  Github,
  Twitter,
  Linkedin,
  Instagram,
} from 'lucide-react';

interface FooterProps {
  onOpenAuth?: () => void;
  onOpenRoleSelector?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAuth, onOpenRoleSelector }) => {
  const { navigateTo, activePage, currentUser, currentVolunteer } = useApp();
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

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

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
      setEmailInput('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-[#101D32] text-white text-xs border-t-2 border-[#101D32] mt-auto relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-12">
          {/* Column 1: Platform & Brand */}
          <div className="space-y-4">
            <BrandLogo
              size="md"
              inverseText={true}
              onClick={() => navigateTo('home')}
            />

            <p className="text-[#FFF5E9]/80 text-xs leading-relaxed max-w-sm font-sans">
              A modern Neo-Brutalist platform for workshops, skills, and opportunities. Empowering learners and mentors with verified digital passes and live capacity governance.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 text-[#FFD6B0] text-[11px] font-heading font-bold border border-white/20">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#F4511E] shrink-0" />
              <span>Razorpay Verified · Single-Use QR Passes</span>
            </div>

            {/* Social Icons in Neo-Brutalist Square Boxes */}
            <div className="flex items-center gap-2 pt-2">
              {[
                { icon: Twitter, href: '#', label: 'Twitter' },
                { icon: Linkedin, href: '#', label: 'LinkedIn' },
                { icon: Github, href: '#', label: 'GitHub' },
                { icon: Instagram, href: '#', label: 'Instagram' },
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  aria-label={social.label}
                  className="w-8 h-8 rounded-lg bg-[#FFF5E9] text-[#101D32] border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] flex items-center justify-center hover:bg-[#F4511E] hover:text-white transition-all transform hover:translate-x-0.5 hover:translate-y-0.5"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Platform Links */}
          <div className="space-y-3.5">
            <h4 className="text-white font-heading font-extrabold text-sm tracking-wider uppercase border-b-2 border-white/20 pb-1.5">
              Platform
            </h4>
            <ul className="space-y-2.5 font-medium">
              <li>
                <button
                  onClick={() => navigateTo('workshops')}
                  className="text-[#FFF5E9]/80 hover:text-[#F4511E] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5 text-[#F4511E]" />
                  <span>Discover Workshops</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="text-[#FFF5E9]/80 hover:text-[#F4511E] transition-colors cursor-pointer"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('problem-solution')}
                  className="text-[#FFF5E9]/80 hover:text-[#F4511E] transition-colors cursor-pointer"
                >
                  The Kaushalya Way
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('volunteer-portal')}
                  className="text-[#FFF5E9]/80 hover:text-[#F4511E] transition-colors cursor-pointer"
                >
                  Volunteer Gate Station
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Company & Resources */}
          <div className="space-y-3.5">
            <h4 className="text-white font-heading font-extrabold text-sm tracking-wider uppercase border-b-2 border-white/20 pb-1.5">
              Resources
            </h4>
            <ul className="space-y-2.5 font-medium">
              <li>
                <button
                  onClick={() => navigateTo('our-story')}
                  className="text-[#FFF5E9]/80 hover:text-[#F4511E] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#F4511E]" />
                  <span>Our Story &amp; Vision</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('contact')}
                  className="text-[#FFF5E9]/80 hover:text-[#F4511E] transition-colors cursor-pointer"
                >
                  Contact Support
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('faq')}
                  className="text-[#FFF5E9]/80 hover:text-[#F4511E] transition-colors cursor-pointer"
                >
                  Frequently Asked Questions
                </button>
              </li>
              {currentUser ? (
                <li>
                  <button
                    onClick={() => {
                      if (currentUser.role === 'SUPER_ADMIN') navigateTo('admin-dashboard');
                      else if (currentUser.role === 'ORGANIZER') navigateTo('organizer-dashboard');
                      else navigateTo('participant-dashboard');
                    }}
                    className="text-[#FFD6B0] hover:text-white font-bold transition-colors cursor-pointer"
                  >
                    Open Workspace &rarr;
                  </button>
                </li>
              ) : (
                <li>
                  <button
                    onClick={onOpenRoleSelector}
                    className="text-[#FFD6B0] hover:text-white font-bold transition-colors cursor-pointer"
                  >
                    Role Switcher &amp; Demos &rarr;
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Column 4: Stay Updated (Newsletter Box) */}
          <div className="space-y-3.5">
            <h4 className="text-white font-heading font-extrabold text-sm tracking-wider uppercase border-b-2 border-white/20 pb-1.5">
              Stay Updated
            </h4>
            <p className="text-[#FFF5E9]/80 text-xs font-sans leading-relaxed">
              Get notified when new engineering workshops, masterclasses, and certified hackathons launch.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white text-[#101D32] placeholder-[#101D32]/50 border-2 border-[#101D32] shadow-[3px_3px_0px_0px_#F4511E] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#F4511E]"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[#F4511E] hover:bg-[#E84316] text-white font-heading font-bold rounded-xl border-2 border-[#101D32] shadow-[3px_3px_0px_0px_#101D32] neo-btn flex items-center justify-center shrink-0 cursor-pointer"
                  aria-label="Subscribe"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              {subscribed && (
                <p className="text-[#FFD6B0] text-[11px] font-bold flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#F4511E]" />
                  <span>Subscribed! Welcome to Kaushalya updates.</span>
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Giant Oversized Brand Typography Section */}
        <div className="py-8 sm:py-12 border-t-2 border-white/10 w-full overflow-hidden select-none">
          <div className="w-full flex flex-col items-center justify-center text-center">
            {/* Tagline */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-3 sm:mb-5">
              <span className="w-2 h-2 rounded-full bg-[#F4511E] animate-pulse" />
              <p className="text-[11px] sm:text-xs md:text-sm font-heading font-black tracking-[0.25em] sm:tracking-[0.35em] uppercase text-[#F4511E]">
                LEARN. BUILD. GROW.
              </p>
            </div>
            {/* Massive Responsive Wordmark */}
            <div className="w-full overflow-hidden flex justify-center">
              <h1 className="w-full text-center font-heading font-black tracking-tighter leading-none text-white text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] xl:text-[13rem] 2xl:text-[14.5rem] select-none hover:text-[#FFF5E9] transition-colors">
                KAUSHALYA
              </h1>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t-2 border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[#FFF5E9]/70 text-[11px] text-center sm:text-left">
          <div>
            &copy; {new Date().getFullYear()} Kaushalya (कौशल्य). Built with Neo-Brutalist Craftsmanship. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 font-semibold">
            <button
              onClick={() => navigateTo('contact')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span>·</span>
            <button
              onClick={() => navigateTo('contact')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <span>·</span>
            <span className="flex items-center gap-1 text-white">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F4511E]" />
              <span>Academic Integrity Verified</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
