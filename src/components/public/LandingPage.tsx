import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  QrCode,
  Scan,
  HelpCircle,
  ChevronDown,
  Sparkles,
  BookOpen,
  Code,
  Users,
  TrendingUp,
  Layers,
  GraduationCap,
  Briefcase,
  Building,
  Star,
  Terminal,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LandingPageProps {
  onOpenAuth: () => void;
  onOpenRoleSelector?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onOpenRoleSelector,
}) => {
  const { navigateTo, switchRoleQuickly } = useApp();

  // FAQ Accordion active index
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
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

  return (
    <div className="w-full bg-[#FFF5E9] text-[#101D32] transition-colors duration-200 overflow-x-hidden">
      {/* ─────────────────────────────────────────────────────────────
          SECTION 1 — HERO SECTION
          Preserves the existing centered hero identity & messaging,
          incorporating warm cream/orange Neo-Brutalist elements.
          Viewport-aware height: min-h-[calc(100svh-5rem)] to prevent
          premature peeking of subsequent sections on laptops & desktops.
      ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 bg-[#FFF5E9] dot-pattern min-h-[calc(100svh-5rem)] pt-24 sm:pt-28 pb-12 sm:pb-16 border-b-2 border-[#101D32]">
        {/* Subtle Decorative Orange Dots */}
        <div className="hidden lg:block absolute top-16 left-16 w-4 h-4 rounded-full bg-[#F4511E] border border-[#101D32]" />
        <div className="hidden lg:block absolute bottom-20 right-20 w-5 h-5 rounded-full bg-[#FFD6B0] border border-[#101D32]" />
        <div className="hidden lg:block absolute top-1/3 right-12 w-3 h-3 rounded-full bg-[#F4511E] opacity-70" />
        <div className="hidden lg:block absolute bottom-1/3 left-12 w-3 h-3 rounded-full bg-[#101D32] opacity-40" />

        {/* Floating Supporting Cards (Left & Right) — Complementary & Subtle */}
        <div className="hidden xl:flex absolute left-8 top-1/2 -translate-y-1/2 -rotate-6 flex-col gap-2 p-3.5 bg-white border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] rounded-xl select-none z-10 max-w-[200px]">
          <div className="w-9 h-9 rounded-lg bg-[#FFD6B0] border border-[#101D32] flex items-center justify-center text-[#F4511E]">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="font-heading font-extrabold text-xs text-[#101D32]">Verified Passes</div>
            <div className="text-[10px] text-[#101D32]/70 font-sans">Instant tamper-proof entry passes</div>
          </div>
        </div>

        <div className="hidden xl:flex absolute right-8 top-1/2 -translate-y-1/2 rotate-6 flex-col gap-2 p-3.5 bg-white border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] rounded-xl select-none z-10 max-w-[200px]">
          <div className="w-9 h-9 rounded-lg bg-[#F4511E] border border-[#101D32] flex items-center justify-center text-white">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="font-heading font-extrabold text-xs text-[#101D32]">Hands-On Labs</div>
            <div className="text-[10px] text-[#101D32]/70 font-sans">Real code &amp; live architecture</div>
          </div>
        </div>

        {/* Centered Hero Content */}
        <div className="max-w-4xl mx-auto text-center relative z-20 space-y-6 sm:space-y-8">
          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="font-heading text-[clamp(2.1rem,6vw,4.5rem)] leading-[1.08] sm:leading-[1.06] tracking-[-0.035em] font-extrabold text-[#101D32] max-w-4xl mx-auto break-words px-2"
          >
            Good Ideas Start{' '}
            <br className="hidden sm:inline" />
            <span className="text-[#F4511E] block sm:inline mt-1 sm:mt-0 underline decoration-[#101D32] decoration-4 underline-offset-8">
              With Great Workshops.
            </span>
          </motion.h1>

          {/* Descriptive Copy */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="text-sm sm:text-base lg:text-lg text-[#101D32]/80 max-w-xl sm:max-w-2xl mx-auto font-sans font-medium leading-relaxed px-2"
          >
            Discover practical workshops led by practitioners, build real-world skills, and reserve your place with a verified digital pass.
          </motion.p>

          {/* CTA Group with Neo-Brutalist Push Effect */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3 sm:pt-4 w-full sm:w-auto max-w-sm sm:max-w-none mx-auto"
          >
            <button
              onClick={() => navigateTo('workshops')}
              className="w-full sm:w-auto px-8 py-4 bg-[#F4511E] hover:bg-[#E84316] text-white font-heading font-extrabold text-sm sm:text-base rounded-xl border-2 border-[#101D32] shadow-[8px_8px_0px_0px_#101D32] neo-btn-8 flex items-center justify-center gap-2.5 cursor-pointer shrink-0"
            >
              <span>Explore Workshops</span>
              <ArrowRight className="w-5 h-5 text-white" />
            </button>

            <button
              onClick={() => scrollToSection('how-it-works')}
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-[#FFD6B0] text-[#101D32] font-heading font-bold text-sm sm:text-base rounded-xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] neo-btn flex items-center justify-center gap-2.5 cursor-pointer shrink-0"
            >
              <span>How It Works</span>
              <ChevronDown className="w-5 h-5 text-[#F4511E]" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2 — SOCIAL PROOF MARQUEE
          Full-width dark navy bar with continuous horizontal scroll
      ───────────────────────────────────────────────────────────── */}
      <section className="w-full bg-[#101D32] border-b-2 border-[#101D32] py-4 overflow-hidden relative select-none">
        <div className="animate-marquee items-center gap-10 whitespace-nowrap text-xs sm:text-sm font-heading font-extrabold tracking-wider text-[#FFF5E9] uppercase">
          {[...Array(4)].map((_, loopIdx) => (
            <React.Fragment key={loopIdx}>
              <span className="flex items-center gap-3">
                <span>ACME TECH</span>
                <span className="w-2 h-2 rounded-full bg-[#F4511E]" />
              </span>
              <span className="flex items-center gap-3">
                <span>GLOBEX CAMPUS</span>
                <span className="w-2 h-2 rounded-full bg-[#F4511E]" />
              </span>
              <span className="flex items-center gap-3">
                <span>INNOVEX LABS</span>
                <span className="w-2 h-2 rounded-full bg-[#F4511E]" />
              </span>
              <span className="flex items-center gap-3">
                <span>TECHMIND INSTITUTES</span>
                <span className="w-2 h-2 rounded-full bg-[#F4511E]" />
              </span>
              <span className="flex items-center gap-3">
                <span>SKILLHUB GLOBAL</span>
                <span className="w-2 h-2 rounded-full bg-[#F4511E]" />
              </span>
              <span className="flex items-center gap-3">
                <span>EDUBRIDGE ALLIANCE</span>
                <span className="w-2 h-2 rounded-full bg-[#F4511E]" />
              </span>
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3 — PROBLEM VS SOLUTION (THE KAUSHALYA WAY)
          Side-by-side high-contrast comparison
      ───────────────────────────────────────────────────────────── */}
      <section id="problem-solution" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-10 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto space-y-3.5 px-3">
          <span className="text-xs font-heading font-extrabold text-[#F4511E] uppercase tracking-wider bg-white border-2 border-[#101D32] px-3.5 py-1 rounded-full inline-block shadow-[2px_2px_0px_0px_#101D32]">
            Why Kaushalya
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-[#101D32] tracking-tight">
            Engineered for Real Engineering Skills
          </h2>
          <p className="text-xs sm:text-sm lg:text-base text-[#101D32]/70 font-sans font-medium leading-relaxed max-w-xl mx-auto">
            Eliminating ticketing markups, paper queues, and manual gate chaos so students and faculty can focus on practical mastery.
          </p>
        </div>

        {/* Two-card comparison layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Card A: The Old Way (Problem) */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#FFF5E9] border-2 border-dashed border-[#101D32] space-y-6">
            <div className="flex items-center justify-between pb-4 border-b-2 border-[#101D32]/10">
              <span className="font-heading font-extrabold text-lg text-[#101D32]/70 uppercase tracking-wider">
                The Old Way
              </span>
              <div className="w-8 h-8 rounded-lg bg-rose-100 border border-rose-300 text-rose-600 flex items-center justify-center font-bold">
                <X className="w-5 h-5 stroke-[2.5]" />
              </div>
            </div>

            <ul className="space-y-4 text-xs sm:text-sm font-sans font-medium text-[#101D32]/70">
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <span>Overbooked venues with no real-time capacity locks or automated seat replenishment.</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <span>Manual paper sign-in sheets that take 15–20 minutes at the door before every lab.</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <span>Opaque ticket fees, delayed confirmations, and lost email receipts.</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <span>Zero verified digital pass credentials for student academic portfolios.</span>
              </li>
            </ul>
          </div>

          {/* Card B: The Kaushalya Way (Solution) */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#FFD6B0] border-2 border-[#101D32] shadow-[8px_8px_0px_0px_#101D32] space-y-6">
            <div className="flex items-center justify-between pb-4 border-b-2 border-[#101D32]/20">
              <span className="font-heading font-extrabold text-lg text-[#101D32] uppercase tracking-wider flex items-center gap-2">
                <span>The Kaushalya Way</span>
                <span className="text-[10px] bg-[#F4511E] text-white px-2 py-0.5 rounded border border-[#101D32]">
                  PROVEN
                </span>
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#F4511E] border-2 border-[#101D32] text-white flex items-center justify-center font-bold shadow-[2px_2px_0px_0px_#101D32]">
                <Check className="w-5 h-5 stroke-[3]" />
              </div>
            </div>

            <ul className="space-y-4 text-xs sm:text-sm font-sans font-bold text-[#101D32]">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#F4511E] shrink-0 mt-0.5" />
                <span>Atomic seat capacity controls — direct zero-fee RSVP for Free workshops, instant Razorpay for Paid tracks.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#F4511E] shrink-0 mt-0.5" />
                <span>Sub-2 second in-browser webcam scanner for gate volunteers with zero app downloads.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#F4511E] shrink-0 mt-0.5" />
                <span>Cryptographic single-use digital QR tickets with venue GPS navigation links.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#F4511E] shrink-0 mt-0.5" />
                <span>Real-time seat replenishment: when an attendee cancels, their seat returns to the live pool instantly.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4 — FEATURE GRID
          3-column grid of white cards with 16x16 icon boxes & hover state
      ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#FFF5E9] py-16 sm:py-24 border-t-2 border-[#101D32]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3.5">
            <span className="text-xs font-heading font-extrabold text-[#F4511E] uppercase tracking-wider bg-white border-2 border-[#101D32] px-3.5 py-1 rounded-full inline-block shadow-[2px_2px_0px_0px_#101D32]">
              Core Capabilities
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-[#101D32] tracking-tight">
              Everything You Need for Workshop Excellence
            </h2>
            <p className="text-xs sm:text-sm lg:text-base text-[#101D32]/70 font-sans font-medium leading-relaxed">
              Carefully crafted tooling for technical organizers, student learners, and campus departments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: BookOpen,
                title: 'Curated Workshops',
                desc: 'Hand-picked technical masterclasses across AI, DevOps, Cloud, and Embedded Systems led by industry practitioners.',
              },
              {
                icon: Code,
                title: 'Hands-on Learning',
                desc: 'Every workshop requires active terminal, lab, or code participation with itemized learning outcomes.',
              },
              {
                icon: QrCode,
                title: 'Verified Digital Passes',
                desc: 'Tamper-proof encrypted QR tickets issued instantly with GPS lab venue navigation and printable layouts.',
              },
              {
                icon: Users,
                title: 'Industry Mentors',
                desc: 'Direct interaction with experienced faculty leaders and guest technology evangelists during every session.',
              },
              {
                icon: TrendingUp,
                title: 'Track Your Growth',
                desc: 'Student Desk history tracks all attended workshops, technical domains explored, and certified credits earned.',
              },
              {
                icon: Layers,
                title: 'All-in-One Platform',
                desc: 'From attendee registration and payments to volunteer scanning and live governance — zero third-party software needed.',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group p-6 sm:p-7 bg-white rounded-xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] hover:shadow-[6px_6px_0px_0px_#101D32] transition-all flex flex-col justify-between space-y-5"
              >
                {/* 16x16 Icon Box with Hover Inversion */}
                <div className="w-16 h-16 rounded-xl bg-[#FFD6B0] group-hover:bg-[#F4511E] border-2 border-[#101D32] flex items-center justify-center transition-colors shadow-[2px_2px_0px_0px_#101D32]">
                  <feature.icon className="w-8 h-8 text-[#F4511E] group-hover:text-white transition-colors" />
                </div>

                <div className="space-y-2">
                  <h3 className="font-heading font-extrabold text-xl text-[#101D32]">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-sans font-medium text-[#101D32]/70 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 5 — HOW IT WORKS
          Dark navy high-contrast section with 3-step numbered flow
      ───────────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="bg-[#101D32] text-white py-16 sm:py-24 border-y-2 border-[#101D32] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3.5">
            <span className="text-xs font-heading font-extrabold text-[#101D32] uppercase tracking-wider bg-[#FFD6B0] border-2 border-[#101D32] px-3.5 py-1 rounded-full inline-block shadow-[2px_2px_0px_0px_#F4511E]">
              Clear 3-Step Process
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-white tracking-tight">
              How Kaushalya Works
            </h2>
            <p className="text-xs sm:text-sm lg:text-base text-[#FFF5E9]/80 font-sans font-medium leading-relaxed">
              A streamlined, reliable journey from discovering a new technical workshop to walking into the campus lab.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="p-6 sm:p-8 rounded-xl bg-white/5 border-2 border-white/20 flex flex-col items-center text-center space-y-4 relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#F4511E] border-2 border-[#101D32] flex items-center justify-center font-heading font-extrabold text-2xl sm:text-3xl text-white shadow-[4px_4px_0px_0px_#FFF5E9]">
                01
              </div>
              <h3 className="font-heading font-extrabold text-xl text-white">
                Discover
              </h3>
              <p className="text-xs sm:text-sm text-[#FFF5E9]/80 font-sans font-medium leading-relaxed">
                Explore curated engineering workshops by domain, venue coordinates, and itemized prerequisites.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 sm:p-8 rounded-xl bg-white/5 border-2 border-white/20 flex flex-col items-center text-center space-y-4 relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#FFD6B0] border-2 border-[#101D32] flex items-center justify-center font-heading font-extrabold text-2xl sm:text-3xl text-[#101D32] shadow-[4px_4px_0px_0px_#F4511E]">
                02
              </div>
              <h3 className="font-heading font-extrabold text-xl text-white">
                Register &amp; Pay
              </h3>
              <p className="text-xs sm:text-sm text-[#FFF5E9]/80 font-sans font-medium leading-relaxed">
                Confirm your seat in one click for free tracks or complete encrypted Razorpay checkout for paid masterclasses.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 sm:p-8 rounded-xl bg-white/5 border-2 border-white/20 flex flex-col items-center text-center space-y-4 relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white border-2 border-[#101D32] flex items-center justify-center font-heading font-extrabold text-2xl sm:text-3xl text-[#101D32] shadow-[4px_4px_0px_0px_#F4511E]">
                03
              </div>
              <h3 className="font-heading font-extrabold text-xl text-white">
                Attend &amp; Verify
              </h3>
              <p className="text-xs sm:text-sm text-[#FFF5E9]/80 font-sans font-medium leading-relaxed">
                Present your single-use QR ticket code at the door. Gate volunteers verify admission in under two seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 6 — USE CASE PERSONAS
          3-column Bento grid with color hierarchy
      ───────────────────────────────────────────────────────────── */}
      <section className="bg-white py-16 sm:py-24 border-b-2 border-[#101D32]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3.5">
            <span className="text-xs font-heading font-extrabold text-[#F4511E] uppercase tracking-wider bg-[#FFF5E9] border-2 border-[#101D32] px-3.5 py-1 rounded-full inline-block shadow-[2px_2px_0px_0px_#101D32]">
              Built For Everyone
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-[#101D32] tracking-tight">
              Tailored for Campus Stakeholders
            </h2>
            <p className="text-xs sm:text-sm lg:text-base text-[#101D32]/70 font-sans font-medium leading-relaxed">
              Dedicated interfaces that support each user's unique role and responsibilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Card 1: Students */}
            <div className="p-7 sm:p-8 rounded-xl bg-[#FFD6B0] border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="inline-block px-3 py-1 rounded-full bg-white border border-[#101D32] text-[11px] font-heading font-extrabold text-[#101D32]">
                  Students &amp; Learners
                </span>
                <div className="w-12 h-12 rounded-xl bg-white border-2 border-[#101D32] flex items-center justify-center text-[#F4511E]">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <h3 className="font-heading font-extrabold text-2xl text-[#101D32]">
                  Master Modern Tech Tracks
                </h3>
                <p className="text-xs sm:text-sm font-sans font-medium text-[#101D32]/80 leading-relaxed">
                  Browse real-time workshops, access Google Maps lab navigation, save offline printable ticket vouchers, and build verifiable skill profiles.
                </p>
              </div>

              <button
                onClick={() => navigateTo('workshops')}
                className="w-full py-3 bg-[#101D32] hover:bg-[#101D32]/90 text-white font-heading font-extrabold text-xs rounded-xl neo-btn flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_0px_#F4511E]"
              >
                <span>Browse Student Catalog</span>
                <ArrowRight className="w-4 h-4 text-[#F4511E]" />
              </button>
            </div>

            {/* Card 2: Faculty & Organizers */}
            <div className="p-7 sm:p-8 rounded-xl bg-[#F4511E] border-2 border-[#101D32] shadow-[8px_8px_0px_0px_#101D32] text-white space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="inline-block px-3 py-1 rounded-full bg-white border border-[#101D32] text-[11px] font-heading font-extrabold text-[#101D32]">
                  Faculty Organizers
                </span>
                <div className="w-12 h-12 rounded-xl bg-white border-2 border-[#101D32] flex items-center justify-center text-[#F4511E]">
                  <Briefcase className="w-7 h-7" />
                </div>
                <h3 className="font-heading font-extrabold text-2xl text-white">
                  Effortless Event Management
                </h3>
                <p className="text-xs sm:text-sm font-sans font-medium text-white/90 leading-relaxed">
                  Publish workshops in seconds, configure seat limits, export institutional attendance CSVs, and appoint gate volunteers with 6-digit access codes.
                </p>
              </div>

              <button
                onClick={() => {
                  switchRoleQuickly('ORGANIZER');
                  navigateTo('organizer-dashboard');
                }}
                className="w-full py-3 bg-white hover:bg-[#FFF5E9] text-[#101D32] font-heading font-extrabold text-xs rounded-xl neo-btn flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_0px_#101D32]"
              >
                <span>Open Faculty Studio</span>
                <ArrowRight className="w-4 h-4 text-[#F4511E]" />
              </button>
            </div>

            {/* Card 3: Gate Volunteers */}
            <div className="p-7 sm:p-8 rounded-xl bg-[#101D32] border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] text-white space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="inline-block px-3 py-1 rounded-full bg-white border border-[#101D32] text-[11px] font-heading font-extrabold text-[#101D32]">
                  Gate Volunteers
                </span>
                <div className="w-12 h-12 rounded-xl bg-[#FFD6B0] border-2 border-white flex items-center justify-center text-[#101D32]">
                  <Scan className="w-7 h-7" />
                </div>
                <h3 className="font-heading font-extrabold text-2xl text-white">
                  Sub-Second Check-In
                </h3>
                <p className="text-xs sm:text-sm font-sans font-medium text-[#FFF5E9]/80 leading-relaxed">
                  Log in with a single access code, use your phone camera as a high-speed laser scanner, and verify attendees with immediate audio-visual feedback.
                </p>
              </div>

              <button
                onClick={() => navigateTo('volunteer-portal')}
                className="w-full py-3 bg-[#FFD6B0] hover:bg-[#ffd1a3] text-[#101D32] font-heading font-extrabold text-xs rounded-xl neo-btn flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_0px_#F4511E]"
              >
                <span>Launch Gate Scanner</span>
                <ArrowRight className="w-4 h-4 text-[#F4511E]" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 7 — TESTIMONIALS
          3 cards with asymmetric corner rounding & 5-star ratings
      ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#FFF5E9] py-16 sm:py-24 border-b-2 border-[#101D32]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3.5">
            <span className="text-xs font-heading font-extrabold text-[#F4511E] uppercase tracking-wider bg-white border-2 border-[#101D32] px-3.5 py-1 rounded-full inline-block shadow-[2px_2px_0px_0px_#101D32]">
              Community Voices
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-[#101D32] tracking-tight">
              Trusted Across Campus Labs
            </h2>
            <p className="text-xs sm:text-sm lg:text-base text-[#101D32]/70 font-sans font-medium leading-relaxed">
              Read how students and instructors experience seamless workshop registration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                stars: 5,
                quote:
                  'The QR ticket pass with direct Google Maps lab coordinates meant zero lost students wandering campus hallways. Gate check-in was instantaneous!',
                author: 'Dr. Sarah Lin',
                role: 'Professor of Computer Science',
                initials: 'SL',
              },
              {
                stars: 5,
                quote:
                  'Booking a seat for the Distributed Systems workshop took 5 seconds. When I had to cancel one track, my seat was immediately given to a classmate on the waitlist.',
                author: 'Alex Morgan',
                role: 'MCA Graduate Student',
                initials: 'AM',
              },
              {
                stars: 5,
                quote:
                  'Volunteering at the entrance gate with the camera scanner was so smooth. We checked in over 60 students in under 4 minutes with zero app crashes.',
                author: 'Marcus Gate',
                role: 'Student Volunteer Coordinator',
                initials: 'MG',
              },
            ].map((testi, idx) => (
              <div
                key={idx}
                className="p-6 sm:p-7 bg-white border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] rounded-tr-3xl rounded-bl-3xl rounded-tl-sm rounded-br-sm space-y-4 flex flex-col justify-between"
              >
                {/* 5-star rating */}
                <div className="flex items-center gap-1">
                  {[...Array(testi.stars)].map((_, sIdx) => (
                    <Star
                      key={sIdx}
                      className="w-4 h-4 fill-[#F4511E] text-[#F4511E]"
                    />
                  ))}
                </div>

                <p className="text-xs sm:text-sm font-sans font-medium text-[#101D32] leading-relaxed italic">
                  "{testi.quote}"
                </p>

                <div className="flex items-center gap-3 pt-3 border-t-2 border-[#101D32]/10">
                  <div className="w-10 h-10 rounded-full bg-[#FFD6B0] border-2 border-[#101D32] text-[#F4511E] flex items-center justify-center font-heading font-extrabold text-sm">
                    {testi.initials}
                  </div>
                  <div>
                    <h4 className="font-heading font-extrabold text-sm text-[#101D32]">
                      {testi.author}
                    </h4>
                    <p className="text-[11px] font-sans text-[#101D32]/70">
                      {testi.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 8 — FREQUENTLY ASKED QUESTIONS
          Neo-Brutalist accordion layout with two-column balance
      ───────────────────────────────────────────────────────────── */}
      <section id="faq" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 scroll-mt-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-14 items-start">
          {/* Left Column: Heading & Support Action */}
          <div className="md:col-span-5 space-y-6 md:sticky md:top-28">
            <div className="space-y-3.5">
              <span className="text-xs font-heading font-extrabold text-[#F4511E] uppercase tracking-wider bg-white border-2 border-[#101D32] px-3.5 py-1 rounded-full inline-block shadow-[2px_2px_0px_0px_#101D32]">
                Got Questions?
              </span>
              <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-[#101D32] tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-xs sm:text-sm text-[#101D32]/70 font-sans font-medium leading-relaxed">
                Everything you need to know about seat capacity, free vs paid workshops, instant digital checkout, and verified QR ticket passes.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] space-y-3">
              <div className="flex items-center gap-2 text-xs font-heading font-extrabold text-[#101D32]">
                <HelpCircle className="w-4 h-4 text-[#F4511E] shrink-0" />
                <span>Need tailored assistance?</span>
              </div>
              <p className="text-xs text-[#101D32]/70 font-sans font-medium leading-relaxed">
                Have specific inquiries regarding faculty hosting, GPS lab mapping, or campus department licensing?
              </p>
              <button
                onClick={() => navigateTo('contact')}
                className="pt-1 text-xs font-heading font-extrabold text-[#F4511E] hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <span>Contact Department Team</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column: Accordion */}
          <div className="md:col-span-7 space-y-3">
            {[
              {
                q: 'How does workshop pricing work on Kaushalya?',
                a: 'Organizers can designate workshops as either Free or Paid. Free sessions require zero payment and confirm in one click. Paid masterclasses are powered by official encrypted payment gateways with cryptographic signature verification, seat reservation holds, and instant QR ticket generation upon verified payment.',
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
                className="rounded-xl border-2 border-[#101D32] bg-white shadow-[3px_3px_0px_0px_#101D32] overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-heading font-extrabold text-sm sm:text-base text-[#101D32] cursor-pointer"
                  aria-expanded={openFaqIndex === idx}
                >
                  <span className="leading-snug">{item.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#F4511E] shrink-0 transition-transform ${
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
                      transition={{ duration: 0.18 }}
                      className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs sm:text-sm text-[#101D32]/80 leading-relaxed font-sans font-medium border-t-2 border-[#101D32]/10 pt-3"
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

      {/* ─────────────────────────────────────────────────────────────
          SECTION 9 — FINAL CTA
          Warm cream with peach wave accents and centered Neo-Brutalist CTAs
      ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#FFF5E9] py-16 sm:py-24 border-t-2 border-[#101D32] relative overflow-hidden text-center px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 relative z-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#FFD6B0] border-2 border-[#101D32] text-xs font-heading font-extrabold text-[#101D32] shadow-[2px_2px_0px_0px_#101D32]">
            Ready to Begin?
          </span>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-[#101D32] tracking-tight leading-tight">
            Build Real Skills with{' '}
            <span className="text-[#F4511E] underline decoration-[#101D32] decoration-4 underline-offset-8">
              Kaushalya Today.
            </span>
          </h2>

          <p className="text-xs sm:text-base text-[#101D32]/80 font-sans font-medium max-w-xl mx-auto leading-relaxed">
            Join hundreds of engineering students and faculty leads elevating hands-on campus skills with digital clarity.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => navigateTo('workshops')}
              className="w-full sm:w-auto px-8 py-4 bg-[#F4511E] hover:bg-[#E84316] text-white font-heading font-extrabold text-sm sm:text-base rounded-xl border-2 border-[#101D32] shadow-[8px_8px_0px_0px_#101D32] neo-btn-8 flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <span>Explore All Workshops</span>
              <ArrowRight className="w-5 h-5 text-white" />
            </button>

            <button
              onClick={() => onOpenRoleSelector?.()}
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-[#FFD6B0] text-[#101D32] font-heading font-bold text-sm sm:text-base rounded-xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] neo-btn flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <span>Switch Demo Persona</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
