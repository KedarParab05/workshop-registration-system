import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Compass,
  Sparkles,
  BookOpen,
  Award,
  Users,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Layers,
  Cpu,
  Ticket,
  QrCode,
  DollarSign,
} from 'lucide-react';
import { motion } from 'motion/react';

export const OurStoryPage: React.FC = () => {
  const { navigateTo } = useApp();

  const principles = [
    {
      title: 'Learn by Doing',
      badge: 'Core Philosophy',
      icon: Layers,
      description:
        'Lectures provide theory; engineering requires hands-on craftsmanship. Every workshop hosted on Kaushalya is structured around live implementation, code execution, and demonstrable portfolio outcomes.',
    },
    {
      title: 'Transparent Pricing & Open Access',
      badge: 'Economic Clarity',
      icon: DollarSign,
      description:
        'We believe student upskilling should never be gated behind predatory fees. Faculty can host 100% free community sessions with instant zero-cost enrollment or subsidized paid bootcamps with Razorpay Test Mode checkout.',
    },
    {
      title: 'Seat Capacity Governance',
      badge: 'Fair Operations',
      icon: ShieldCheck,
      description:
        'Physical computer labs and seminar rooms have rigid fire safety and seating limits. Kaushalya enforces strict seat reservation holds, automatic waitlisting, and cryptographic digital QR passes to eliminate overcrowding.',
    },
    {
      title: 'Built for Campus Communities',
      badge: 'Campus Ecosystem',
      icon: Users,
      description:
        'Designed specifically for college departments, student societies, faculty mentors, and gate volunteers. Kaushalya bridges administrative governance with an intuitive modern consumer software experience.',
    },
  ];

  const pillars = [
    {
      label: 'Academic Theory to Practice',
      detail:
        'Bridging textbook concepts and modern industry tech stacks (Microservices, PyTorch, Kubernetes, Zero-Trust Security).',
    },
    {
      label: 'Free & Paid Event Formats',
      detail:
        'One-click direct registration for community workshops, plus transparent Razorpay Test Mode checkout for premium masterclasses.',
    },
    {
      label: 'Cryptographic QR Gate Passes',
      detail:
        'Single-use, anti-tamper QR code tickets displayed on mobile screens or printable for offline door verification.',
    },
    {
      label: 'Volunteer-Led Door Scanning',
      detail:
        'Organizers appoint trusted student volunteers using 6-digit access codes to unlock high-speed camera verification stations.',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-16">
      {/* ─────────────────────────────────────────────────────────────
          HERO EDITORIAL HEADER
      ───────────────────────────────────────────────────────────── */}
      <section className="text-center max-w-3xl mx-auto space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#DAE7C7] text-[#08482D] text-xs font-heading font-bold"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>About & Philosophy</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="text-3xl sm:text-5xl lg:text-6xl font-display font-normal sm:font-medium text-[#101410] dark:text-[#f0f5ee] tracking-tight leading-tight break-words px-2"
        >
          The Spirit of Kaushalya
          <span className="block text-2xl sm:text-3xl font-sans font-medium text-[#08482D] dark:text-[#DAE7C7] mt-1">
            (कौशल्य)
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="text-base sm:text-lg text-[#5E5E61] dark:text-slate-300 leading-relaxed font-sans"
        >
          In Sanskrit, <strong className="text-[#08482D] dark:text-[#DAE7C7]">Kaushalya</strong> signifies skill, capability, mastery, and dedication to craft. We built Kaushalya to bridge the gap between academic theory and the practical, hands-on engineering capabilities demanded by modern technology.
        </motion.p>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          NARRATIVE EDITORIAL SECTION (TWO-COLUMN SPREAD)
      ───────────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: Origin Story */}
        <div className="lg:col-span-7 bg-[#E8F0DF]/60 dark:bg-[#14231b]/60 border border-[#DCE4D6] dark:border-[#203a2c] rounded-3xl p-8 sm:p-10 space-y-6 flex flex-col justify-between transition-colors">
          <div className="space-y-4">
            <span className="text-xs font-heading font-bold uppercase tracking-wider text-[#08482D] dark:text-[#DAE7C7]">
              Origin & Mission
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-medium text-[#101410] dark:text-[#f0f5ee] tracking-tight">
              From Lecture Halls to Engineering Mastery
            </h2>
            <p className="text-sm text-[#5E5E61] dark:text-slate-300 leading-relaxed">
              Every semester, collegiate engineering and computing departments host specialized workshops, lab bootcamps, and technical symposiums. Yet organizers historically wrestled with fragmented spreadsheets, uncontrolled walk-ins exceeding physical room fire capacities, lost attendance records, and cumbersome payment collection.
            </p>
            <p className="text-sm text-[#5E5E61] dark:text-slate-300 leading-relaxed">
              Kaushalya was architected as an academic-first event governance studio. It empowers faculty mentors, department heads, and student society chairs to manage the complete lifecycle of technical sessions — from curriculum definition and GPS lab venue configuration to live seat reservation holds and verified gate check-in.
            </p>
          </div>

          <div className="pt-4 border-t border-[#DCE4D6] dark:border-[#203a2c] grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-heading font-extrabold text-[#08482D] dark:text-[#DAE7C7]">100%</div>
              <div className="text-[11px] text-[#5E5E61] dark:text-slate-400">Verifiable Passes</div>
            </div>
            <div>
              <div className="text-2xl font-heading font-extrabold text-[#08482D] dark:text-[#DAE7C7]">Zero</div>
              <div className="text-[11px] text-[#5E5E61] dark:text-slate-400">Seat Overbooking</div>
            </div>
            <div>
              <div className="text-2xl font-heading font-extrabold text-[#08482D] dark:text-[#DAE7C7]">4 Roles</div>
              <div className="text-[11px] text-[#5E5E61] dark:text-slate-400">Collaborative Governance</div>
            </div>
          </div>
        </div>

        {/* Right Column: Architectural Highlights */}
        <div className="lg:col-span-5 bg-white dark:bg-[#14231b] border border-[#DCE4D6] dark:border-[#203a2c] rounded-3xl p-8 sm:p-10 space-y-6 flex flex-col justify-between shadow-xs">
          <div className="space-y-4">
            <span className="text-xs font-heading font-bold uppercase tracking-wider text-[#08482D] dark:text-[#DAE7C7]">
              Platform Architecture
            </span>
            <h3 className="text-xl font-heading font-bold text-[#101410] dark:text-white">
              Academic Event Governance Pillars
            </h3>
            <div className="space-y-3.5 pt-1">
              {pillars.map((pillar, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#E8F0DF] dark:bg-[#192f22] text-[#08482D] dark:text-[#DAE7C7] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-heading font-bold text-[#101410] dark:text-white">
                      {pillar.label}
                    </h4>
                    <p className="text-[11px] text-[#5E5E61] dark:text-slate-400 leading-snug">
                      {pillar.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#DCE4D6] dark:border-[#203a2c]">
            <button
              onClick={() => navigateTo('workshops')}
              className="w-full py-3 px-4 bg-[#08482D] hover:bg-[#0c5c3b] text-white font-heading font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Explore Available Workshops</span>
              <ArrowRight className="w-4 h-4 text-[#DAE7C7]" />
            </button>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          CORE GUIDING PRINCIPLES (4-CARD GRID)
      ───────────────────────────────────────────────────────────── */}
      <section className="space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-heading font-bold text-[#08482D] dark:text-[#DAE7C7] uppercase tracking-wider">
            Foundations
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-medium text-[#101410] dark:text-[#f0f5ee] tracking-tight">
            Guiding Principles
          </h2>
          <p className="text-xs sm:text-sm text-[#5E5E61] dark:text-slate-400">
            Four commitments that shape every line of code, operational feature, and user interaction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {principles.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="p-7 rounded-3xl bg-white dark:bg-[#14231b] border border-[#DCE4D6] dark:border-[#203a2c] shadow-xs space-y-4 hover:border-[#08482D]/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-[#E8F0DF] dark:bg-[#1a3325] text-[#08482D] dark:text-[#DAE7C7] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-[#08482D] dark:text-[#DAE7C7] bg-[#DAE7C7]/50 dark:bg-[#192f22] px-2.5 py-1 rounded-full">
                    {p.badge}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-heading font-bold text-[#101410] dark:text-white">
                    {p.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5E5E61] dark:text-slate-400 leading-relaxed font-sans">
                    {p.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          BOTTOM CALLOUT TO EXPLORE OR CONTACT
      ───────────────────────────────────────────────────────────── */}
      <section className="p-8 sm:p-12 rounded-3xl bg-[#E8F0DF]/60 dark:bg-[#14231b]/60 border border-[#DCE4D6] dark:border-[#203a2c] text-center space-y-4">
        <h3 className="text-2xl font-heading font-extrabold text-[#101410] dark:text-[#f0f5ee]">
          Ready to experience hands-on learning?
        </h3>
        <p className="text-xs sm:text-sm text-[#5E5E61] dark:text-slate-400 max-w-lg mx-auto">
          Browse upcoming academic workshops across Web Development, Artificial Intelligence, Cloud Infrastructure, and Cybersecurity.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigateTo('workshops')}
            className="px-6 py-2.5 bg-[#08482D] hover:bg-[#0c5c3b] text-white font-heading font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <span>Browse Workshop Catalog</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#DAE7C7]" />
          </button>
          <button
            onClick={() => navigateTo('contact')}
            className="px-6 py-2.5 bg-white dark:bg-[#18281f] border border-[#DCE4D6] dark:border-[#22392c] hover:bg-[#E8F0DF] dark:hover:bg-[#1b2b22] text-[#101410] dark:text-white font-heading font-bold text-xs rounded-xl transition-all"
          >
            Contact Department Team
          </button>
        </div>
      </section>
    </div>
  );
};

