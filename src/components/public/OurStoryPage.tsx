import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Layers,
  Users,
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
        'We believe student upskilling should never be gated behind predatory fees. Faculty can host 100% free community sessions with instant zero-cost enrollment or subsidized paid bootcamps with seamless instant checkout.',
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
        'Bridging textbook concepts and modern enterprise engineering practices (Distributed Systems, Applied Intelligence, Cloud Architecture, Zero-Trust Security).',
    },
    {
      label: 'Free & Paid Event Formats',
      detail:
        'One-click direct registration for community workshops, plus transparent encrypted digital checkout for premium masterclasses.',
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
      <section className="text-center max-w-3xl mx-auto space-y-6 pt-2 sm:pt-4">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="text-3xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-[#101410] tracking-tight leading-tight break-words px-2"
        >
          The Spirit of Kaushalya
          <span className="block text-2xl sm:text-3xl font-sans font-bold text-[#F4511E] mt-1.5">
            (कौशल्य)
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="text-base sm:text-lg text-[#101D32]/80 leading-relaxed font-sans"
        >
          In Sanskrit, <strong className="text-[#F4511E]">Kaushalya</strong> signifies skill, capability, mastery, and dedication to craft. We built Kaushalya to bridge the gap between academic theory and practical, hands-on engineering capabilities demanded by modern technology.
        </motion.p>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          NARRATIVE EDITORIAL SECTION (TWO-COLUMN SPREAD)
      ───────────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch font-sans">
        {/* Left Column: Origin Story */}
        <div className="lg:col-span-7 bg-[#FFF5E9] border-2 border-[#101D32] rounded-2xl p-8 sm:p-10 space-y-6 flex flex-col justify-between shadow-[4px_4px_0px_0px_#101D32]">
          <div className="space-y-4">
            <span className="text-xs font-heading font-extrabold uppercase tracking-wider text-[#F4511E] bg-[#FFD6B0] border border-[#101D32] px-2.5 py-1 rounded-md inline-block">
              Origin &amp; Mission
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#101410] tracking-tight">
              From Lecture Halls to Engineering Mastery
            </h2>
            <p className="text-sm text-[#101D32]/80 leading-relaxed">
              Every semester, collegiate engineering and computing departments host specialized workshops, lab bootcamps, and technical symposiums. Yet organizers historically wrestled with fragmented spreadsheets, uncontrolled walk-ins exceeding physical room fire capacities, lost attendance records, and cumbersome payment collection.
            </p>
            <p className="text-sm text-[#101D32]/80 leading-relaxed">
              Kaushalya was architected as an academic-first event governance studio. It empowers faculty mentors, department heads, and student society chairs to manage the complete lifecycle of technical sessions — from curriculum definition and GPS lab venue configuration to live seat reservation holds and verified gate check-in.
            </p>
          </div>

          <div className="pt-4 border-t-2 border-[#101D32]/20 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-heading font-extrabold text-[#F4511E]">100%</div>
              <div className="text-[11px] text-[#101D32]/70 font-bold uppercase tracking-wider">Verifiable Passes</div>
            </div>
            <div>
              <div className="text-2xl font-heading font-extrabold text-[#F4511E]">Zero</div>
              <div className="text-[11px] text-[#101D32]/70 font-bold uppercase tracking-wider">Seat Overbooking</div>
            </div>
            <div>
              <div className="text-2xl font-heading font-extrabold text-[#F4511E]">4 Roles</div>
              <div className="text-[11px] text-[#101D32]/70 font-bold uppercase tracking-wider">Governance</div>
            </div>
          </div>
        </div>

        {/* Right Column: Architectural Highlights */}
        <div className="lg:col-span-5 bg-white border-2 border-[#101D32] rounded-2xl p-8 sm:p-10 space-y-6 flex flex-col justify-between shadow-[4px_4px_0px_0px_#101D32]">
          <div className="space-y-4">
            <span className="text-xs font-heading font-extrabold uppercase tracking-wider text-[#101D32] bg-[#FFD6B0] border border-[#101D32] px-2.5 py-1 rounded-md inline-block">
              Platform Architecture
            </span>
            <h3 className="text-xl font-heading font-extrabold text-[#101410]">
              Academic Event Governance Pillars
            </h3>
            <div className="space-y-3.5 pt-1">
              {pillars.map((pillar, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded bg-[#F4511E] text-white flex items-center justify-center shrink-0 mt-0.5 border border-[#101D32]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-heading font-extrabold text-[#101410]">
                      {pillar.label}
                    </h4>
                    <p className="text-[11px] text-[#101D32]/70 leading-snug">
                      {pillar.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t-2 border-[#101D32]/20">
            <button
              onClick={() => navigateTo('workshops')}
              className="w-full py-3 px-4 bg-[#F4511E] hover:bg-[#E84316] text-white font-heading font-bold text-xs rounded-lg border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore Available Workshops</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          CORE GUIDING PRINCIPLES (4-CARD GRID)
      ───────────────────────────────────────────────────────────── */}
      <section className="space-y-8 font-sans">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-heading font-extrabold text-[#F4511E] uppercase tracking-wider bg-[#FFD6B0] border border-[#101D32] px-2.5 py-0.5 rounded-md inline-block">
            Foundations
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#101410] tracking-tight">
            Guiding Principles
          </h2>
          <p className="text-xs sm:text-sm text-[#101D32]/80">
            Four commitments that shape every line of code, operational feature, and user interaction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {principles.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="p-7 rounded-2xl bg-white border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-[#FFD6B0] border-2 border-[#101D32] text-[#101D32] flex items-center justify-center shadow-[2px_2px_0px_0px_#101D32]">
                    <Icon className="w-5 h-5 text-[#F4511E]" />
                  </div>
                  <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-[#101D32] bg-[#FFF5E9] border border-[#101D32] px-2.5 py-1 rounded-md">
                    {p.badge}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-heading font-extrabold text-[#101410]">
                    {p.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#101D32]/80 leading-relaxed font-sans">
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
      <section className="p-8 sm:p-12 rounded-2xl bg-[#FFF5E9] border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] text-center space-y-4 font-sans">
        <h3 className="text-2xl font-heading font-extrabold text-[#101410]">
          Ready to experience hands-on learning?
        </h3>
        <p className="text-xs sm:text-sm text-[#101D32]/80 max-w-lg mx-auto">
          Browse upcoming academic workshops across Web Development, Artificial Intelligence, Cloud Infrastructure, and Cybersecurity.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigateTo('workshops')}
            className="px-6 py-2.5 bg-[#F4511E] hover:bg-[#E84316] text-white font-heading font-bold text-xs rounded-lg border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Browse Workshop Catalog</span>
            <ArrowRight className="w-3.5 h-3.5 text-white" />
          </button>
          <button
            onClick={() => navigateTo('contact')}
            className="px-6 py-2.5 bg-white border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] hover:bg-[#FFD6B0] text-[#101410] font-heading font-bold text-xs rounded-lg transition-all cursor-pointer"
          >
            Contact Department Team
          </button>
        </div>
      </section>
    </div>
  );
};
