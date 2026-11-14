import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Users,
  QrCode,
  Scan,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LandingPageProps {
  onOpenAuth: () => void;
  onOpenRoleSelector?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = () => {
  const { navigateTo, switchRoleQuickly } = useApp();

  // Interactive Product Tour active tab state
  const [tourTab, setTourTab] = useState<'catalog' | 'pass' | 'roster' | 'scanner'>('catalog');

  // FAQ Accordion active index
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="pb-24 transition-colors duration-200">
      {/* ─────────────────────────────────────────────────────────────
          SECTION 1 — HERO SECTION
          Neue Machina-inspired technical display typography (fallback: Space Grotesk).
          Desktop reference: 61px / 65px / -1.53px letter-spacing.
          Brand palette: Deep ink primary text, forest green emphasis.
          Balanced spacing, subtle grid, no decorative pills or arrows.
      ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 border-b border-[#DCE4D6] dark:border-[#203a2c] bg-[#F5F8EF] dark:bg-[#0a130e] grid-background-hero min-h-[58vh] sm:min-h-[64vh] lg:min-h-[68vh] pt-24 sm:pt-28 lg:pt-32 pb-10 sm:pb-14 lg:pb-16">
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6 sm:space-y-7">
          {/* Main Technical Display Headline with Responsive clamp() */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="font-display text-[clamp(2rem,6vw,3.8125rem)] leading-[1.14] sm:leading-[1.08] tracking-[-0.03em] font-normal sm:font-medium text-[#101410] dark:text-[#f0f5ee] max-w-4xl mx-auto break-words px-2"
          >
            Good Ideas Start{' '}
            <br className="hidden sm:inline" />
            <span className="text-[#08482D] dark:text-[#9ee2b8] font-medium block sm:inline mt-1 sm:mt-0">
              With Great Workshops.
            </span>
          </motion.h1>

          {/* Concise Supporting Copy */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="text-sm sm:text-base lg:text-lg text-[#5E5E61] dark:text-[#95ad9e] max-w-2xl mx-auto font-sans leading-relaxed px-2"
          >
            Discover practical workshops led by practitioners, build real-world skills, and reserve your place with a verified digital pass.
          </motion.p>

          {/* Primary and Secondary Actions */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2 sm:pt-4 w-full max-w-xs sm:max-w-none mx-auto"
          >
            <button
              onClick={() => navigateTo('workshops')}
              className="w-full sm:w-auto px-7 py-3.5 bg-[#08482D] hover:bg-[#0c5c3b] dark:bg-[#106b43] dark:hover:bg-[#158052] text-[#F5F8EF] font-heading font-semibold text-sm sm:text-base rounded-full shadow-md shadow-[#08482D]/15 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#08482D] active:scale-95"
            >
              <span>Explore Workshops</span>
              <ArrowRight className="w-4 h-4 text-[#DAE7C7]" />
            </button>

            <button
              onClick={() => scrollToSection('how-it-works')}
              className="w-full sm:w-auto px-7 py-3.5 bg-white dark:bg-[#14231b] hover:bg-[#E8F0DF] dark:hover:bg-[#1a3325] text-[#101410] dark:text-[#f0f5ee] font-heading font-semibold text-sm sm:text-base rounded-full border border-[#DCE4D6] dark:border-[#203a2c] shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#08482D] active:scale-95"
            >
              <span>How It Works</span>
              <ChevronDown className="w-4 h-4 text-[#08482D] dark:text-[#DAE7C7]" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Main content sections container with intentional, unified vertical rhythm */}
      <div className="pt-16 sm:pt-24 lg:pt-32 space-y-20 sm:space-y-28 lg:space-y-36">
        {/* ─────────────────────────────────────────────────────────────
            SECTION 2 — WHY KAUSHALYA (BENTO GRID OF CORE VALUES)
        ───────────────────────────────────────────────────────────── */}
        <section id="why-kaushalya" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto space-y-3 px-2">
            <span className="text-xs font-heading font-bold text-[#08482D] dark:text-[#DAE7C7] uppercase tracking-wider bg-[#DAE7C7]/50 dark:bg-[#192f22] px-3 py-1 rounded-full inline-block">
              Why Kaushalya
            </span>
            <h2 className="text-[24px] xs:text-[28px] sm:text-[36px] lg:text-[46px] leading-[1.2] lg:leading-[59px] font-heading font-medium text-[#101410] dark:text-[#f0f5ee] tracking-[-0.02em] break-words">
              Engineered for Real Engineering Skills
            </h2>
            <p className="text-xs sm:text-sm lg:text-base text-[#5E5E61] dark:text-slate-400 leading-relaxed font-sans max-w-xl mx-auto">
              Eliminating ticketing markups, complicated check-in lines, and administrative chaos so students and faculty can focus on practical mastery.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Bento Card 1: Free & Paid Seating */}
            <div className="md:col-span-2 p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#14231b] border border-[#DCE4D6] dark:border-[#203a2c] shadow-sm flex flex-col justify-between space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F0DF] dark:bg-[#1a3325] text-[#08482D] dark:text-[#DAE7C7] flex items-center justify-center font-bold">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-heading font-semibold text-[#08482D] dark:text-[#DAE7C7] uppercase tracking-wider">
                  Flexible Registration
                </span>
                <h3 className="text-lg sm:text-xl font-heading font-bold text-[#101410] dark:text-white mt-1">
                  Free &amp; Paid Workshops with Razorpay Checkout
                </h3>
                <p className="text-xs sm:text-sm text-[#5E5E61] dark:text-slate-400 mt-2 leading-relaxed max-w-lg font-sans">
                  Organizers choose Free or Paid pricing. Free workshops offer direct 1-click registration with zero fees. Paid masterclasses are powered by seamless, secure Razorpay checkout with instant digital QR passes upon payment.
                </p>
              </div>
            </div>

            {/* Bento Card 2: Cryptographic QR Passes */}
            <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#14231b] border border-[#DCE4D6] dark:border-[#203a2c] shadow-sm flex flex-col justify-between space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F0DF] dark:bg-[#1a3325] text-[#08482D] dark:text-[#DAE7C7] flex items-center justify-center font-bold">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-heading font-semibold text-[#08482D] dark:text-[#DAE7C7] uppercase tracking-wider">
                  Verifiable Pass
                </span>
                <h3 className="text-base sm:text-lg font-heading font-bold text-[#101410] dark:text-white mt-1">
                  Instant Single-Use QR Passes
                </h3>
                <p className="text-xs text-[#5E5E61] dark:text-slate-400 mt-2 leading-relaxed font-sans">
                  Receive an encrypted digital pass upon registration, complete with venue GPS coordinates, printable layout, and gate verification credentials.
                </p>
              </div>
            </div>

            {/* Bento Card 3: Live Seat Governance */}
            <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#14231b] border border-[#DCE4D6] dark:border-[#203a2c] shadow-sm flex flex-col justify-between space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F0DF] dark:bg-[#1a3325] text-[#08482D] dark:text-[#DAE7C7] flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-heading font-semibold text-[#08482D] dark:text-[#DAE7C7] uppercase tracking-wider">
                  Fair Allocation
                </span>
                <h3 className="text-base sm:text-lg font-heading font-bold text-[#101410] dark:text-white mt-1">
                  Real-Time Seat Replenishment
                </h3>
                <p className="text-xs text-[#5E5E61] dark:text-slate-400 mt-2 leading-relaxed font-sans">
                  Strict capacity caps prevent overbooking. When an attendee cancels, their seat is automatically replenished into the pool in real time.
                </p>
              </div>
            </div>

            {/* Bento Card 4: In-Browser Gate Scanning */}
            <div className="md:col-span-2 p-5 sm:p-7 rounded-3xl bg-[#08482D] text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
              <div className="space-y-2 relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DAE7C7] text-[#08482D] text-xs font-bold">
                  <Scan className="w-3.5 h-3.5" />
                  <span>Sub-Second Gate Check-In</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-heading font-extrabold">
                  Live Webcam Scanner for Volunteers
                </h3>
                <p className="text-xs sm:text-sm text-[#DAE7C7]/80 max-w-lg leading-relaxed font-sans">
                  Volunteers use their smartphone or laptop camera with our laser sweep reticle to verify attendees in under 2 seconds. No extra app downloads required.
                </p>
              </div>
              <button
                onClick={() => navigateTo('volunteer-portal')}
                className="w-full md:w-auto px-5 py-3 bg-[#DAE7C7] hover:bg-[#c9ddb0] text-[#08482D] font-heading font-bold text-xs rounded-xl transition-all shadow-md shrink-0 relative z-10 cursor-pointer text-center"
              >
                Open Gate Scanner
              </button>
            </div>
          </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3 — HOW IT WORKS (4-STEP VISUAL STEPPER)
      ───────────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto space-y-3 px-2">
          <span className="text-xs font-heading font-bold text-[#08482D] dark:text-[#DAE7C7] uppercase tracking-wider bg-[#DAE7C7]/50 dark:bg-[#192f22] px-3 py-1 rounded-full inline-block">
            Clear 4-Step Process
          </span>
          <h2 className="text-[24px] xs:text-[28px] sm:text-[36px] lg:text-[46px] leading-[1.2] lg:leading-[59px] font-heading font-medium text-[#101410] dark:text-[#f0f5ee] tracking-[-0.02em] break-words">
            How Registration &amp; Entry Works
          </h2>
          <p className="text-xs sm:text-sm lg:text-base text-[#5E5E61] dark:text-slate-400 font-sans max-w-xl mx-auto">
            A frictionless journey from discovering a new technical track to entering the workshop lab.
          </p>
        </div>

        {/* Stepper Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative">
          {/* Step 1 */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#14231b] border border-[#DCE4D6] dark:border-[#203a2c] shadow-sm space-y-3.5 relative">
            <div className="w-10 h-10 rounded-2xl bg-[#08482D] text-[#DAE7C7] font-mono font-bold text-sm flex items-center justify-center shadow-md">
              01
            </div>
            <h3 className="font-heading font-bold text-[#101410] dark:text-white text-base">
              Discover Workshop
            </h3>
            <p className="text-xs text-[#5E5E61] dark:text-slate-400 leading-relaxed font-sans">
              Browse curated technical sessions by domain, schedule, and room venue. Inspect prerequisites and itemized learning outcomes.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#14231b] border border-[#DCE4D6] dark:border-[#203a2c] shadow-sm space-y-3.5 relative">
            <div className="w-10 h-10 rounded-2xl bg-[#08482D] text-[#DAE7C7] font-mono font-bold text-sm flex items-center justify-center shadow-md">
              02
            </div>
            <h3 className="font-heading font-bold text-[#101410] dark:text-white text-base">
              Instant RSVP &amp; Payment
            </h3>
            <p className="text-xs text-[#5E5E61] dark:text-slate-400 leading-relaxed font-sans">
              Register instantly for free sessions or complete quick test checkout for paid sessions. Concurrency controls guarantee accurate capacity decrement.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#14231b] border border-[#DCE4D6] dark:border-[#203a2c] shadow-sm space-y-3.5 relative">
            <div className="w-10 h-10 rounded-2xl bg-[#08482D] text-[#DAE7C7] font-mono font-bold text-sm flex items-center justify-center shadow-md">
              03
            </div>
            <h3 className="font-heading font-bold text-[#101410] dark:text-white text-base">
              Get Digital Pass
            </h3>
            <p className="text-xs text-[#5E5E61] dark:text-slate-400 leading-relaxed font-sans">
              Receive a tamper-proof single-use QR ticket code. Access direct GPS directions to the campus lab room on Google Maps.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#14231b] border border-[#DCE4D6] dark:border-[#203a2c] shadow-sm space-y-3.5 relative">
            <div className="w-10 h-10 rounded-2xl bg-[#08482D] text-[#DAE7C7] font-mono font-bold text-sm flex items-center justify-center shadow-md">
              04
            </div>
            <h3 className="font-heading font-bold text-[#101410] dark:text-white text-base">
              Gate Check-In
            </h3>
            <p className="text-xs text-[#5E5E61] dark:text-slate-400 leading-relaxed font-sans">
              Show your digital pass to the volunteer at the entrance gate. A quick camera scan records attendance and unlocks lab entry.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4 — VOLUNTEER / EVENT-DAY GATE EXPERIENCE
      ───────────────────────────────────────────────────────────── */}
      <section id="volunteer" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-24">
        <div className="bg-white dark:bg-[#14231b] border border-[#DCE4D6] dark:border-[#203a2c] rounded-3xl p-5 sm:p-8 lg:p-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">
            {/* Left Column: Scanner Reticle Preview */}
            <div className="relative rounded-3xl overflow-hidden bg-slate-950 aspect-video max-h-[340px] flex items-center justify-center border-2 border-[#DCE4D6] dark:border-[#203a2c] shadow-2xl p-4 sm:p-6">
              <div className="w-44 h-44 xs:w-52 xs:h-52 sm:w-56 sm:h-56 max-w-full max-h-full border border-[#DAE7C7]/50 rounded-2xl relative flex items-center justify-center">
                <div className="absolute top-0 left-0 w-5 h-5 sm:w-6 sm:h-6 border-t-4 border-l-4 border-[#DAE7C7] rounded-tl-lg -mt-1 -ml-1" />
                <div className="absolute top-0 right-0 w-5 h-5 sm:w-6 sm:h-6 border-t-4 border-r-4 border-[#DAE7C7] rounded-tr-lg -mt-1 -mr-1" />
                <div className="absolute bottom-0 left-0 w-5 h-5 sm:w-6 sm:h-6 border-b-4 border-l-4 border-[#DAE7C7] rounded-bl-lg -mb-1 -ml-1" />
                <div className="absolute bottom-0 right-0 w-5 h-5 sm:w-6 sm:h-6 border-b-4 border-r-4 border-[#DAE7C7] rounded-br-lg -mb-1 -mr-1" />

                <div className="absolute left-2 right-2 h-1 bg-gradient-to-r from-transparent via-[#DAE7C7] to-transparent shadow-[0_0_15px_rgba(218,231,199,1)] animate-laser-sweep rounded-full" />

                <div className="text-center space-y-1">
                  <QrCode className="w-10 h-10 sm:w-12 sm:h-12 text-[#DAE7C7]/40 mx-auto" />
                  <span className="text-[9px] sm:text-[10px] font-mono text-[#DAE7C7] tracking-widest uppercase">
                    Scanner Ready
                  </span>
                </div>
              </div>

              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white/80">
                <span className="flex items-center gap-1.5 text-[10px] sm:text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Hardware Laser Engine Active</span>
                </span>
                <span className="text-[10px] font-mono text-[#DAE7C7]">VOL-DEMO1</span>
              </div>
            </div>

            {/* Right Column: Narrative */}
            <div className="space-y-4 sm:space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DAE7C7] text-[#08482D] text-xs font-bold">
                <Scan className="w-3.5 h-3.5" />
                <span>Gate Volunteer Check-In</span>
              </div>

              <h2 className="text-[22px] xs:text-[26px] sm:text-[34px] lg:text-[42px] leading-[1.2] lg:leading-[52px] font-heading font-medium text-[#101410] dark:text-[#f0f5ee] tracking-[-0.02em] break-words">
                Instant Event-Day Pass Verification
              </h2>

              <p className="text-xs sm:text-sm text-[#5E5E61] dark:text-slate-300 leading-relaxed font-sans">
                Appointed volunteers unlock their assigned gate station using a secure access code. Mobile and paper QR tickets verify in under 2 seconds.
              </p>

              <div className="space-y-2.5 sm:space-y-3 text-xs font-sans">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#08482D] dark:text-[#DAE7C7] shrink-0 mt-0.5" />
                  <span>Zero app install — operates directly inside any modern mobile browser.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#08482D] dark:text-[#DAE7C7] shrink-0 mt-0.5" />
                  <span>Instant dual-tone Web Audio synthesizer chime confirms admittance or warns of duplicates.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#08482D] dark:text-[#DAE7C7] shrink-0 mt-0.5" />
                  <span>Manual ticket code fallback for participants with cracked screens or low battery.</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => navigateTo('volunteer-portal')}
                  className="w-full sm:w-auto px-6 py-3 bg-[#08482D] hover:bg-[#0c5c3b] text-white font-heading font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
                >
                  <span>Launch Volunteer Gate Portal</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#DAE7C7]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 5 — PRODUCT PREVIEW / PLATFORM TOUR (TAB SWITCHER)
      ───────────────────────────────────────────────────────────── */}
      <section id="platform-tour" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto space-y-3 px-2">
          <span className="text-xs font-heading font-bold text-[#08482D] dark:text-[#DAE7C7] uppercase tracking-wider bg-[#DAE7C7]/50 dark:bg-[#192f22] px-3 py-1 rounded-full inline-block">
            Interactive Tour
          </span>
          <h2 className="text-[24px] xs:text-[28px] sm:text-[36px] lg:text-[46px] leading-[1.2] lg:leading-[59px] font-heading font-medium text-[#101410] dark:text-[#f0f5ee] tracking-[-0.02em] break-words">
            Explore the Platform Experience
          </h2>
          <p className="text-xs sm:text-sm lg:text-base text-[#5E5E61] dark:text-slate-400 font-sans max-w-xl mx-auto">
            A cohesive design system tailored for students, faculty mentors, and event gatekeepers.
          </p>
        </div>

        {/* Tab Switcher Controls (Mobile-safe, wrapped & overflow-protected) */}
        <div className="flex justify-center w-full px-2">
          <div className="flex sm:inline-flex p-1.5 rounded-2xl bg-white dark:bg-[#14231b] border border-[#DCE4D6] dark:border-[#203a2c] shadow-sm gap-1 text-xs font-heading font-semibold max-w-full overflow-x-auto scrollbar-none">
            {[
              { id: 'catalog', full: '1. Discovery Catalog', short: '1. Catalog' },
              { id: 'pass', full: '2. Digital QR Pass', short: '2. QR Pass' },
              { id: 'roster', full: '3. Organizer Roster', short: '3. Roster' },
              { id: 'scanner', full: '4. Gate Scanner', short: '4. Scanner' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTourTab(tab.id as any)}
                className={`px-3 sm:px-4 py-2 rounded-xl transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                  tourTab === tab.id
                    ? 'bg-[#08482D] text-white shadow-sm font-bold'
                    : 'text-[#5E5E61] dark:text-slate-400 hover:text-[#101410] dark:hover:text-white'
                }`}
              >
                <span className="hidden sm:inline">{tab.full}</span>
                <span className="inline sm:hidden">{tab.short}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Showcase Card Display */}
        <div className="p-5 sm:p-8 lg:p-10 rounded-3xl bg-white dark:bg-[#14231b] border border-[#DCE4D6] dark:border-[#203a2c] shadow-lg max-w-4xl mx-auto">
          {tourTab === 'catalog' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#DCE4D6] dark:border-[#203a2c] pb-3 gap-2">
                <span className="text-xs font-heading font-bold text-[#08482D] dark:text-[#DAE7C7] uppercase tracking-wider">
                  Student Catalog &amp; Real-Time Availability
                </span>
                <span className="text-xs font-mono bg-[#E8F0DF] dark:bg-[#1a3325] text-[#08482D] dark:text-[#DAE7C7] px-2 py-0.5 rounded font-bold w-fit">
                  Free &amp; Paid Options
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-heading font-bold text-[#101410] dark:text-white">
                Frictionless Workshop Discovery
              </h3>
              <p className="text-xs sm:text-sm text-[#5E5E61] dark:text-slate-400 leading-relaxed font-sans">
                Filter by technology domain, time slot, and venue. Each card features real-time seat math, mentor credentials, and direct GPS mapping.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => navigateTo('workshops')}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#08482D] text-white text-xs font-heading font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-[#0c5c3b] transition-colors"
                >
                  <span>Open Live Workshop Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#DAE7C7]" />
                </button>
              </div>
            </div>
          )}

          {tourTab === 'pass' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#DCE4D6] dark:border-[#203a2c] pb-3 gap-2">
                <span className="text-xs font-heading font-bold text-[#08482D] dark:text-[#DAE7C7] uppercase tracking-wider">
                  Cryptographic Academic Pass
                </span>
                <span className="text-xs font-mono bg-[#E8F0DF] dark:bg-[#1a3325] text-[#08482D] dark:text-[#DAE7C7] px-2 py-0.5 rounded font-bold w-fit">
                  Single-Use Verified
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-heading font-bold text-[#101410] dark:text-white">
                Instant Digital QR Pass
              </h3>
              <p className="text-xs sm:text-sm text-[#5E5E61] dark:text-slate-400 leading-relaxed font-sans">
                Encodes ticket code, participant name, date, and lab room. Features 1-click Google Maps GPS navigation link and a printable voucher view.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => navigateTo('my-registrations')}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#08482D] text-white text-xs font-heading font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-[#0c5c3b] transition-colors"
                >
                  <span>View Student Pass Wallet</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#DAE7C7]" />
                </button>
              </div>
            </div>
          )}

          {tourTab === 'roster' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#DCE4D6] dark:border-[#203a2c] pb-3 gap-2">
                <span className="text-xs font-heading font-bold text-[#08482D] dark:text-[#DAE7C7] uppercase tracking-wider">
                  Faculty Studio Dashboard
                </span>
                <span className="text-xs font-mono bg-[#E8F0DF] dark:bg-[#1a3325] text-[#08482D] dark:text-[#DAE7C7] px-2 py-0.5 rounded font-bold w-fit">
                  CSV Export Supported
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-heading font-bold text-[#101410] dark:text-white">
                Attendee Roster &amp; Gate Check-In Tracking
              </h3>
              <p className="text-xs sm:text-sm text-[#5E5E61] dark:text-slate-400 leading-relaxed font-sans">
                Faculty leads inspect confirmed registrations, monitor gate admission live, and download CSV rosters formatted for institutional academic credit.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    switchRoleQuickly('ORGANIZER');
                    navigateTo('organizer-dashboard');
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#08482D] text-white text-xs font-heading font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-[#0c5c3b] transition-colors"
                >
                  <span>Explore Faculty Studio</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#DAE7C7]" />
                </button>
              </div>
            </div>
          )}

          {tourTab === 'scanner' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#DCE4D6] dark:border-[#203a2c] pb-3 gap-2">
                <span className="text-xs font-heading font-bold text-[#08482D] dark:text-[#DAE7C7] uppercase tracking-wider">
                  In-Browser Laser Scanner
                </span>
                <span className="text-xs font-mono bg-[#E8F0DF] dark:bg-[#1a3325] text-[#08482D] dark:text-[#DAE7C7] px-2 py-0.5 rounded font-bold w-fit">
                  25 FPS Detection
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-heading font-bold text-[#101410] dark:text-white">
                Live Gate Scanner Station
              </h3>
              <p className="text-xs sm:text-sm text-[#5E5E61] dark:text-slate-400 leading-relaxed font-sans">
                Full-frame Nimiq QR scanning engine with hardware autofocus, flashlight toggle, audio chime feedback, and real-time gate history logs.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => navigateTo('volunteer-portal')}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#08482D] text-white text-xs font-heading font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-[#0c5c3b] transition-colors"
                >
                  <span>Open Volunteer Gate Scanner</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#DAE7C7]" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 6 — FREQUENTLY ASKED QUESTIONS (BALANCED TWO-COLUMN LAYOUT)
      ───────────────────────────────────────────────────────────── */}
      <section id="faq" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Eyebrow, Heading, Description & Contact Action */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
            <div className="space-y-3">
              <span className="text-xs font-heading font-bold text-[#08482D] dark:text-[#DAE7C7] uppercase tracking-wider bg-[#DAE7C7]/50 dark:bg-[#192f22] px-3 py-1 rounded-full inline-block">
                Got Questions?
              </span>
              <h2 className="text-[24px] xs:text-[28px] sm:text-[36px] lg:text-[46px] leading-[1.2] lg:leading-[54px] font-heading font-medium text-[#101410] dark:text-[#f0f5ee] tracking-[-0.02em] break-words">
                Frequently Asked Questions
              </h2>
              <p className="text-sm text-[#5E5E61] dark:text-slate-300 leading-relaxed font-sans">
                Everything you need to know about seat capacity, free vs paid workshops, Razorpay Test Mode checkout, and digital QR ticket passes.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#E8F0DF]/60 dark:bg-[#14231b]/60 border border-[#DCE4D6] dark:border-[#203a2c] space-y-3 transition-colors">
              <div className="flex items-center gap-2 text-xs font-heading font-bold text-[#08482D] dark:text-[#DAE7C7]">
                <HelpCircle className="w-4 h-4 shrink-0" />
                <span>Need tailored assistance?</span>
              </div>
              <p className="text-xs text-[#5E5E61] dark:text-slate-400 leading-relaxed font-sans">
                Have specific questions regarding faculty workshop hosting, lab coordinates, or department deployment?
              </p>
              <button
                onClick={() => navigateTo('contact')}
                className="pt-1 text-xs font-heading font-bold text-[#08482D] dark:text-[#DAE7C7] hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <span>Contact Department Team</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column: Accordion */}
          <div className="lg:col-span-7 space-y-3">
            {[
              {
                q: 'How does workshop pricing work on Kaushalya?',
                a: 'Organizers can designate workshops as either Free or Paid. Free sessions require zero payment and confirm in one click. Paid masterclasses are powered by Razorpay Test Mode with full cryptographic signature verification, seat reservation holds, and instant QR ticket generation upon verified payment.',
              },
              {
                q: 'How do I receive and present my QR ticket pass?',
                a: 'Once registered, your single-use digital ticket pass is generated immediately in your Student Desk wallet. You can view it on your phone screen or print it for door verification.',
              },
              {
                q: 'What happens if I register but can no longer attend?',
                a: 'You can easily cancel your booking from "My Registrations" at any time. Your seat is immediately replenished into the pool so another student can attend.',
              },
              {
                q: 'How do faculty members and organizers schedule a workshop?',
                a: 'Organizers log into the Organizer Studio, specify session topics, set physical lab venues with Google Maps GPS coordinates, configure capacity limits, and publish in one click.',
              },
              {
                q: 'What is the role of a gate volunteer and how do they get access?',
                a: 'Volunteers assist with event-day check-in. The workshop organizer appoints volunteers and issues a 6-digit access code (e.g. VOL-DEMO1) that unlocks the camera gate scanner.',
              },
              {
                q: 'Do I need to download or install a separate mobile app?',
                a: 'No app download is required. Kaushalya runs entirely in modern web browsers with high-performance camera scanning and instant responsive views.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-[#DCE4D6] dark:border-[#203a2c] bg-white dark:bg-[#14231b] overflow-hidden transition-colors shadow-xs"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-heading font-bold text-sm text-[#101410] dark:text-white cursor-pointer"
                  aria-expanded={openFaqIndex === idx}
                >
                  <span className="leading-snug">{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#08482D] dark:text-[#DAE7C7] transition-transform ${
                      openFaqIndex === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {openFaqIndex === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-5 pb-5 text-xs text-[#5E5E61] dark:text-slate-300 leading-relaxed border-t border-[#DCE4D6]/50 dark:border-[#203a2c]/50 pt-3 font-sans"
                    >
                      {item.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>
      </div>
    </div>
  );
};