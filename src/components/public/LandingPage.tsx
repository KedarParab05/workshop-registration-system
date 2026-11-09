import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateSeats } from '../../utils/workshopRules';
import { Workshop } from '../../types';
import {
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  Code,
  Cpu,
  Cloud,
  Shield,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  CheckCircle2,
  Users,
  Compass,
  ArrowUpRight,
  ShieldCheck,
  QrCode,
  Scan,
  UserCheck,
  FileSpreadsheet,
  Download,
  KeyRound,
  Check,
  HelpCircle,
  ChevronDown,
  Mail,
  Send,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LandingPageProps {
  onOpenAuth: () => void;
  onOpenRoleSelector?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth, onOpenRoleSelector }) => {
  const { workshops, registrations, navigateTo, currentUser, switchRoleQuickly } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Interactive Product Tour active tab state
  const [tourTab, setTourTab] = useState<'catalog' | 'pass' | 'roster' | 'scanner'>('catalog');

  // FAQ Accordion active index
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Contact form submission state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const publishedWorkshops = workshops.filter((w) => w.status === 'PUBLISHED');

  const filteredWorkshops = selectedCategory === 'ALL'
    ? publishedWorkshops
    : publishedWorkshops.filter((w) => w.category === selectedCategory);

  // Workshop categories
  const categories = [
    { name: 'Web Development', icon: Code, desc: 'Microservices, React, modern web architecture and distributed systems.' },
    { name: 'Artificial Intelligence', icon: Cpu, desc: 'Neural networks, PyTorch, LLMs, computer vision, and predictive models.' },
    { name: 'Cloud Computing', icon: Cloud, desc: 'Kubernetes, Docker, AWS/GCP, infrastructure as code, and CI/CD pipelines.' },
    { name: 'Cybersecurity', icon: Shield, desc: 'Ethical hacking, cryptography, penetration testing, and zero-trust security.' },
    { name: 'Software Engineering', icon: Layers, desc: 'Design patterns, clean architecture, automated testing, and agile craftsmanship.' },
  ];

  // ─────────────────────────────────────────────────────────────
  // Reelmark-Inspired Curved Workshop Card Carousel (Starts Below Hero)
  // ─────────────────────────────────────────────────────────────
  const carouselContainerRef = useRef<HTMLDivElement>(null);
  const [carouselOffset, setCarouselOffset] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartOffset = useRef(0);
  const velocity = useRef(0);
  const lastPointerX = useRef(0);
  const lastTime = useRef(0);
  const animationFrameId = useRef<number | null>(null);

  const displayCards: Workshop[] = publishedWorkshops.length > 0
    ? publishedWorkshops.length >= 8
      ? publishedWorkshops
      : [...publishedWorkshops, ...publishedWorkshops, ...publishedWorkshops].slice(0, 10)
    : [];

  const CARD_WIDTH = 220;
  const CARD_GAP = 24;
  const TOTAL_ITEM_WIDTH = CARD_WIDTH + CARD_GAP;
  const TOTAL_TRACK_WIDTH = displayCards.length * TOTAL_ITEM_WIDTH;

  // Auto-drift and inertia physics animation
  useEffect(() => {
    let prevTimestamp: number | null = null;

    const animate = (timestamp: number) => {
      if (prevTimestamp !== null) {
        const delta = (timestamp - prevTimestamp) / 1000;

        if (!isDragging && TOTAL_TRACK_WIDTH > 0) {
          if (!isPaused) {
            velocity.current = velocity.current * Math.pow(0.05, delta);
            setCarouselOffset((prev) => {
              const next = prev - (42 + velocity.current) * delta;
              return ((next % TOTAL_TRACK_WIDTH) - TOTAL_TRACK_WIDTH) % TOTAL_TRACK_WIDTH;
            });
          }
        }
      }
      prevTimestamp = timestamp;
      animationFrameId.current = requestAnimationFrame(animate);
    };

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isPaused, isDragging, TOTAL_TRACK_WIDTH]);

  // Pointer drag controls
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartOffset.current = carouselOffset;
    lastPointerX.current = e.clientX;
    lastTime.current = performance.now();
    velocity.current = 0;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartX.current;
    const now = performance.now();
    const dt = (now - lastTime.current) / 1000;
    if (dt > 0) {
      velocity.current = (e.clientX - lastPointerX.current) / dt;
    }
    lastPointerX.current = e.clientX;
    lastTime.current = now;

    if (TOTAL_TRACK_WIDTH > 0) {
      const next = dragStartOffset.current + deltaX;
      setCarouselOffset(((next % TOTAL_TRACK_WIDTH) - TOTAL_TRACK_WIDTH) % TOTAL_TRACK_WIDTH);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const shiftManual = (direction: 'left' | 'right') => {
    const shift = direction === 'left' ? TOTAL_ITEM_WIDTH * 1.5 : -TOTAL_ITEM_WIDTH * 1.5;
    setCarouselOffset((prev) => prev + shift);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) return;
    setContactSubmitted(true);
    setTimeout(() => {
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    }, 1000);
  };

  return (
    <div className="space-y-20 sm:space-y-32 pb-24 transition-colors duration-200">
      {/* ─────────────────────────────────────────────────────────────
          SECTION 1 — HERO (EXCLUSIVELY OCCUPIES THE FIRST VIEWPORT)
          No carousel cards peek into this initial viewport!
      ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[calc(100vh-5rem)] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 border-b border-[#DCE4D6] dark:border-[#203a2c] bg-[#F5F8EF] dark:bg-[#0b140e] grid-background">
        {/* Subtle decorative handwritten accent */}
        <div className="absolute top-10 left-8 text-[#08482D]/20 dark:text-[#DAE7C7]/15 font-hand text-3xl select-none pointer-events-none hidden md:block -rotate-3">
          // कौशल्य · learn. build. grow.
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6 my-auto py-12">
          {/* Mint Trust Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#DAE7C7] text-[#08482D] text-xs font-heading font-semibold shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#08482D]" />
            <span>A Platform for Workshops, Skills, and Opportunities</span>
          </motion.div>

          {/* Big Bold Headline */}
          <div className="relative">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-heading font-extrabold text-[#101410] dark:text-[#f0f5ee] tracking-tight leading-[1.08] max-w-4xl mx-auto"
            >
              Good Ideas Start <br />
              <span className="text-[#08482D] dark:text-[#DAE7C7]">With Great Workshops.</span>
            </motion.h1>

            {/* Handwritten note right side: "Hands-on · Real skills" */}
            <div className="absolute -top-6 right-2 sm:right-6 lg:-right-8 hidden lg:block pointer-events-none select-none">
              <div className="font-hand text-xl text-[#08482D] dark:text-[#DAE7C7] rotate-12 flex flex-col items-center">
                <span>Hands-on · Real skills</span>
                <svg className="w-16 h-12 text-[#08482D] dark:text-[#DAE7C7] stroke-current fill-none" viewBox="0 0 60 50">
                  <path d="M10 5 Q 35 15, 45 42" strokeWidth="2" strokeLinecap="round" />
                  <polyline points="38 38, 46 43, 48 33" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* Supporting Copy */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg text-[#5E5E61] dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Discover hands-on technical workshops, learn from practitioners building in the field,
            and save your seat with an instant verified digital ticket pass.
          </motion.p>

          {/* CTAs with Doodled Arrow */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3 relative"
          >
            {/* Handwritten "Free & Paid · Direct RSVP" note pointing to CTA */}
            <div className="hidden sm:block absolute -left-2 sm:left-10 lg:left-24 -bottom-6 pointer-events-none select-none">
              <div className="font-hand text-lg text-[#08482D] dark:text-[#DAE7C7] -rotate-12 flex items-center gap-1.5">
                <span>Free & Paid · Direct RSVP</span>
                <svg className="w-10 h-7 text-[#08482D] dark:text-[#DAE7C7] stroke-current fill-none" viewBox="0 0 40 25">
                  <path d="M5 18 Q 20 22, 32 8" strokeWidth="1.8" strokeLinecap="round" />
                  <polyline points="24 7, 34 8, 32 17" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigateTo('workshops')}
              className="px-8 py-4 bg-[#08482D] hover:bg-[#0c5c3b] text-[#F5F8EF] font-heading font-bold text-sm rounded-2xl shadow-xl shadow-[#08482D]/20 transition-all flex items-center gap-2.5"
            >
              <span>Explore Workshops</span>
              <ArrowRight className="w-4 h-4 text-[#DAE7C7]" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => scrollToSection('how-it-works')}
              className="px-7 py-4 bg-white dark:bg-[#14231b] hover:bg-[#E8F0DF] dark:hover:bg-[#1f382a] text-[#101410] dark:text-[#f0f5ee] font-heading font-semibold text-sm rounded-2xl border border-[#DCE4D6] dark:border-[#203a2c] shadow-xs transition-colors flex items-center gap-2"
            >
              <span>How It Works</span>
              <ChevronDown className="w-4 h-4 text-[#08482D] dark:text-[#DAE7C7]" />
            </motion.button>
          </motion.div>
        </div>

        {/* Scroll Indicator at the base of the initial viewport */}
        <div
          onClick={() => scrollToSection('discover')}
          className="cursor-pointer pb-6 pt-2 flex flex-col items-center gap-1 text-[11px] font-heading font-medium text-[#5E5E61] dark:text-slate-400 hover:text-[#08482D] dark:hover:text-[#DAE7C7] transition-colors select-none"
        >
          <span>Scroll to discover sessions</span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          >
            <ChevronDown className="w-4 h-4 text-[#08482D] dark:text-[#DAE7C7]" />
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2 — WORKSHOP DISCOVERY / CAROUSEL (APPEARS AFTER SCROLL)
          Begins cleanly below the hero fold.
      ───────────────────────────────────────────────────────────── */}
      <section id="discover" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pt-6 scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#DCE4D6] dark:border-[#203a2c] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-heading font-semibold text-[#08482D] dark:text-[#DAE7C7] bg-[#DAE7C7]/50 dark:bg-[#14231b] px-3 py-1 rounded-full mb-2">
              <span className="w-2 h-2 rounded-full bg-[#08482D] dark:bg-[#DAE7C7] animate-pulse" />
              <span>Live Campus Session Carousel</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#101410] dark:text-[#f0f5ee]">
              Find a Workshop That Moves You Forward
            </h2>
            <p className="text-sm text-[#5E5E61] dark:text-slate-400 mt-1 max-w-xl">
              Explore practical sessions across the technologies and skills you're curious about. Free and subsidized seats for all students.
            </p>
          </div>

          {/* Carousel Controls */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => shiftManual('left')}
              className="p-2.5 rounded-xl border border-[#DCE4D6] dark:border-[#203a2c] bg-white dark:bg-[#14231b] hover:bg-[#E8F0DF] text-[#101410] dark:text-[#f0f5ee] transition-colors"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="px-3 py-2 rounded-xl border border-[#DCE4D6] dark:border-[#203a2c] bg-white dark:bg-[#14231b] hover:bg-[#E8F0DF] text-xs font-heading font-semibold text-[#08482D] dark:text-[#DAE7C7] transition-colors flex items-center gap-1.5"
              title={isPaused ? 'Resume auto-scroll' : 'Pause auto-scroll'}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-[#08482D]" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{isPaused ? 'Play' : 'Pause'}</span>
            </button>
            <button
              onClick={() => shiftManual('right')}
              className="p-2.5 rounded-xl border border-[#DCE4D6] dark:border-[#203a2c] bg-white dark:bg-[#14231b] hover:bg-[#E8F0DF] text-[#101410] dark:text-[#f0f5ee] transition-colors"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Pills Filter */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {['ALL', 'Web Development', 'Artificial Intelligence', 'Cloud Computing', 'Cybersecurity', 'Software Engineering'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-heading font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-[#08482D] text-white shadow-sm'
                  : 'bg-white dark:bg-[#14231b] border border-[#DCE4D6] dark:border-[#203a2c] text-[#5E5E61] dark:text-slate-300 hover:bg-[#E8F0DF]'
              }`}
            >
              {cat === 'ALL' ? 'All Sessions' : cat}
            </button>
          ))}
        </div>

        {/* Curved Workshop Carousel Viewport */}
        <div
          ref={carouselContainerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => { if (!isDragging) setIsPaused(false); }}
          className={`w-full overflow-hidden select-none py-4 cursor-${isDragging ? 'grabbing' : 'grab'} active:cursor-grabbing`}
          style={{ touchAction: 'pan-y' }}
        >
          <div
            className="flex items-center gap-6"
            style={{
              transform: `translateX(${carouselOffset}px)`,
              width: `${TOTAL_TRACK_WIDTH * 3}px`,
              transition: isDragging ? 'none' : 'transform 0.05s linear',
            }}
          >
            {[...displayCards, ...displayCards, ...displayCards].map((workshop, idx) => {
              const seats = calculateSeats(workshop, registrations);
              return (
                <div
                  key={`${workshop.id}-${idx}`}
                  onClick={() => {
                    if (!isDragging) {
                      navigateTo('workshop-detail', workshop.id);
                    }
                  }}
                  className="relative shrink-0 w-[220px] rounded-3xl overflow-hidden bg-white dark:bg-[#14231b] border border-[#DCE4D6] dark:border-[#203a2c] shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
                  style={{ height: '330px' }}
                >
                  <div className="relative h-44 overflow-hidden bg-[#E8F0DF] dark:bg-[#1a3325]">
                    <img
                      src={workshop.bannerImageUrl}
                      alt={workshop.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/assets/images/banner_fullstack_web.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                    <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-heading font-bold bg-[#DAE7C7] text-[#08482D] shadow-xs">
                      {workshop.category}
                    </div>
                    <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      workshop.pricingType === 'PAID'
                        ? 'bg-[#08482D] text-[#DAE7C7] border border-[#DAE7C7]/40'
                        : 'bg-[#08482D] text-[#F5F8EF]'
                    }`}>
                      {workshop.pricingType === 'PAID' ? `₹${workshop.price}` : '100% FREE'}
                    </div>
                    <div className="absolute bottom-2.5 left-3 right-3 text-white text-[11px] truncate flex items-center gap-1 font-medium">
                      <MapPin className="w-3 h-3 text-[#DAE7C7] shrink-0" />
                      <span className="truncate">{workshop.venue}</span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between bg-white dark:bg-[#14231b]">
                    <div>
                      <h4 className="font-heading font-bold text-xs sm:text-sm text-[#101410] dark:text-[#f0f5ee] line-clamp-2 leading-snug group-hover:text-[#08482D] dark:group-hover:text-[#DAE7C7] transition-colors">
                        {workshop.title}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#5E5E61] dark:text-slate-400 mt-1.5">
                        <Calendar className="w-3 h-3 shrink-0 text-[#08482D] dark:text-[#DAE7C7]" />
                        <span>{workshop.date}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#DCE4D6]/70 dark:border-[#203a2c] flex items-center justify-between text-xs">
                      <span className="text-[11px] font-medium text-[#5E5E61] dark:text-slate-400">
                        {seats.isFull ? (
                          <span className="text-rose-600 font-semibold">Fully Booked</span>
                        ) : (
                          <span><strong className="text-[#08482D] dark:text-[#DAE7C7] font-bold">{seats.availableSeats}</strong> seats left</span>
                        )}
                      </span>
                      <span className="text-[#08482D] dark:text-[#DAE7C7] font-heading font-bold text-[11px] group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                        <span>Details</span> &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3 — WHY KAUSHALYA (BENTO GRID OF CORE VALUES)
      ───────────────────────────────────────────────────────────── */}
      <section id="why-kaushalya" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-heading font-bold text-[#08482D] dark:text-[#DAE7C7] uppercase tracking-wider">
            Why Kaushalya
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#101410] dark:text-[#f0f5ee]">
            Engineered for Real Engineering Skills
          </h2>
          <p className="text-sm text-[#5E5E61] dark:text-slate-400 leading-relaxed">
            Eliminating ticketing markups, complicated check-in lines, and administrative chaos so students and faculty can focus on practical mastery.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Bento Card 1: 100% Free Seating */}
          <div className="md:col-span-2 p-7 rounded-3xl bg-white dark:bg-[#14231b] border border-[#DCE4D6] dark:border-[#203a2c] shadow-sm flex flex-col justify-between space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E8F0DF] dark:bg-[#1a3325] text-[#08482D] dark:text-[#DAE7C7] flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-heading font-semibold text-[#08482D] dark:text-[#DAE7C7] uppercase tracking-wider">
                Flexible Registration
              </span>
              <h3 className="text-xl font-heading font-bold text-[#101410] dark:text-white mt-1">
                Free & Paid Workshops with Razorpay Checkout
              </h3>
              <p className="text-xs sm:text-sm text-[#5E5E61] dark:text-slate-400 mt-2 leading-relaxed max-w-lg">
                Organizers choose Free or Paid pricing. Free workshops offer direct 1-click registration with zero fees. Paid masterclasses are powered by seamless, secure Razorpay checkout with instant digital QR passes upon payment.
              </p>
            </div>
          </div>

          {/* Bento Card 2: Cryptographic QR Passes */}
          <div className="p-7 rounded-3xl bg-white dark:bg-[#14231b] border border-[#DCE4D6] dark:border-[#203a2c] shadow-sm flex flex-col justify-between space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E8F0DF] dark:bg-[#1a3325] text-[#08482D] dark:text-[#DAE7C7] flex items-center justify-center font-bold">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-heading font-semibold text-[#08482D] dark:text-[#DAE7C7] uppercase tracking-wider">
                Verifiable Pass
              </span>
              <h3 className="text-lg font-heading font-bold text-[#101410] dark:text-white mt-1">
                Instant Single-Use QR Passes
              </h3>
              <p className="text-xs text-[#5E5E61] dark:text-slate-400 mt-2 leading-relaxed">
                Receive an encrypted digital pass upon registration, complete with venue GPS coordinates, printable layout, and gate verification credentials.
              </p>
            </div>
          </div>

          {/* Bento Card 3: Live Seat Governance */}
          <div className="p-7 rounded-3xl bg-white dark:bg-[#14231b] border border-[#DCE4D6] dark:border-[#203a2c] shadow-sm flex flex-col justify-between space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E8F0DF] dark:bg-[#1a3325] text-[#08482D] dark:text-[#DAE7C7] flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-heading font-semibold text-[#08482D] dark:text-[#DAE7C7] uppercase tracking-wider">
                Fair Allocation
              </span>
              <h3 className="text-lg font-heading font-bold text-[#101410] dark:text-white mt-1">
                Real-Time Seat Replenishment
              </h3>
              <p className="text-xs text-[#5E5E61] dark:text-slate-400 mt-2 leading-relaxed">
                Strict capacity caps prevent overbooking. When an attendee cancels, their seat is automatically replenished into the pool in real time.
              </p>
            </div>
          </div>

          {/* Bento Card 4: In-Browser Gate Scanning */}
          <div className="md:col-span-2 p-7 rounded-3xl bg-[#08482D] text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
            <div className="space-y-2 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DAE7C7] text-[#08482D] text-xs font-bold">
                <Scan className="w-3.5 h-3.5" />
                <span>Sub-Second Gate Check-In</span>
              </div>
              <h3 className="text-2xl font-heading font-extrabold">
                Live Webcam Scanner for Volunteers
              </h3>
              <p className="text-xs sm:text-sm text-[#DAE7C7]/80 max-w-lg leading-relaxed">
                Volunteers use their smartphone or laptop camera with our laser sweep reticle to verify attendees in under 2 seconds. No extra app downloads required.
              </p>
            </div>
            <button
              onClick={() => navigateTo('volunteer-portal')}
              className="px-5 py-3 bg-[#DAE7C7] hover:bg-[#c9ddb0] text-[#08482D] font-heading font-bold text-xs rounded-xl transition-all shadow-md shrink-0 relative z-10"
            >
              Open Gate Scanner
            </button>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4 — HOW IT WORKS (4-STEP VISUAL STEPPER)
      ───────────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-heading font-bold text-[#08482D] dark:text-[#DAE7C7] uppercase tracking-wider">
            Clear 4-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#101410] dark:text-[#f0f5ee]">
            How Registration & Entry Works
          </h2>
          <p className="text-sm text-[#5E5E61] dark:text-slate-400">
            A frictionless journey from discovering a new technical track to entering the workshop lab.
          </p>
        </div>

        {/* Stepper Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {/* Step 1 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#14231b] border border-[#DCE4D6] dark:border-[#203a2c] shadow-sm space-y-4 relative">
            <div className="w-10 h-10 rounded-2xl bg-[#08482D] text-[#DAE7C7] font-mono font-bold text-sm flex items-center justify-center shadow-md">
              01
            </div>
            <h3 className="font-heading font-bold text-[#101410] dark:text-white text-base">
              Discover Workshop
            </h3>
            <p className="text-xs text-[#5E5E61] dark:text-slate-400 leading-relaxed">
              Browse curated technical sessions by domain, schedule, and room venue. Inspect prerequisites and itemized learning outcomes.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#14231b] border border-[#DCE4D6] dark:border-[#203a2c] shadow-sm space-y-4 relative">
            <div className="w-10 h-10 rounded-2xl bg-[#08482D] text-[#DAE7C7] font-mono font-bold text-sm flex items-center justify-center shadow-md">
              02
            </div>
            <h3 className="font-heading font-bold text-[#101410] dark:text-white text-base">
              Instant RSVP & Payment
            </h3>
            <p className="text-xs text-[#5E5E61] dark:text-slate-400 leading-relaxed">
              Register instantly for free sessions or complete quick test checkout for paid sessions. Concurrency controls guarantee accurate capacity decrement.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#14231b] border border-[#DCE4D6] dark:border-[#203a2c] shadow-sm space-y-4 relative">
            <div className="w-10 h-10 rounded-2xl bg-[#08482D] text-[#DAE7C7] font-mono font-bold text-sm flex items-center justify-center shadow-md">
              03
            </div>
            <h3 className="font-heading font-bold text-[#101410] dark:text-white text-base">
              Get Digital Pass
            </h3>
            <p className="text-xs text-[#5E5E61] dark:text-slate-400 leading-relaxed">
              Receive a tamper-proof single-use QR ticket code. Access direct GPS directions to the campus lab room on Google Maps.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#14231b] border border-[#DCE4D6] dark:border-[#203a2c] shadow-sm space-y-4 relative">
            <div className="w-10 h-10 rounded-2xl bg-[#08482D] text-[#DAE7C7] font-mono font-bold text-sm flex items-center justify-center shadow-md">
              04
            </div>
            <h3 className="font-heading font-bold text-[#101410] dark:text-white text-base">
              Gate Check-In
            </h3>
            <p className="text-xs text-[#5E5E61] dark:text-slate-400 leading-relaxed">
              Show your digital pass to the volunteer at the entrance gate. A quick camera scan records attendance and unlocks lab entry.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 5 — WORKSHOP CATEGORIES GRID
      ───────────────────────────────────────────────────────────── */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-24">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-heading font-bold text-[#08482D] dark:text-[#DAE7C7] uppercase tracking-wider">
              Technical Disciplines
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#101410] dark:text-[#f0f5ee]">
              Explore Learning Tracks
            </h2>
          </div>
          <button
            onClick={() => navigateTo('workshops')}
            className="text-xs font-heading font-bold text-[#08482D] dark:text-[#DAE7C7] hover:underline flex items-center gap-1"
          >
            <span>View Full Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const count = workshops.filter((w) => w.category === cat.name).length;
            return (
              <div
                key={cat.name}
                onClick={() => {
                  setSelectedCategory(cat.name);
                  navigateTo('workshops');
                }}
                className="p-6 rounded-3xl bg-white dark:bg-[#14231b] border border-[#DCE4D6] dark:border-[#203a2c] hover:border-[#08482D] dark:hover:border-[#DAE7C7] transition-all cursor-pointer shadow-sm hover:shadow-lg group flex flex-col justify-between space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#E8F0DF] dark:bg-[#1a3325] text-[#08482D] dark:text-[#DAE7C7] flex items-center justify-center group-hover:bg-[#08482D] group-hover:text-white transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#E8F0DF] dark:bg-[#1a3325] text-[#08482D] dark:text-[#DAE7C7]">
                    {count} {count === 1 ? 'Session' : 'Sessions'}
                  </span>
                </div>

                <div>
                  <h3 className="font-heading font-bold text-base text-[#101410] dark:text-white group-hover:text-[#08482D] dark:group-hover:text-[#DAE7C7] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[#5E5E61] dark:text-slate-400 mt-1.5 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#DCE4D6]/60 dark:border-[#203a2c] flex items-center text-xs font-heading font-bold text-[#08482D] dark:text-[#DAE7C7]">
                  <span>Explore Track Sessions</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 6 — FOR ORGANIZERS (FACULTY & LAB LEADS)
      ───────────────────────────────────────────────────────────── */}
      <section id="for-organizers" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-24">
        <div className="bg-[#E8F0DF]/60 dark:bg-[#14231b]/60 border border-[#DCE4D6] dark:border-[#203a2c] rounded-3xl p-6 sm:p-12 transition-colors">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left Column: Feature Narrative */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DAE7C7] text-[#08482D] text-xs font-bold">
                <Users className="w-3.5 h-3.5" />
                <span>Faculty & Lab Organizers</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#101410] dark:text-[#f0f5ee] leading-tight">
                Complete Studio for Academic Event Governance
              </h2>

              <p className="text-sm text-[#5E5E61] dark:text-slate-300 leading-relaxed">
                Kaushalya provides department chairs, faculty mentors, and student society leads with the operational tools needed to run packed, high-integrity sessions.
              </p>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-3 text-xs">
                  <div className="w-5 h-5 rounded-full bg-[#08482D] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-[#DAE7C7]" />
                  </div>
                  <div>
                    <strong className="text-[#101410] dark:text-white font-heading font-bold">Session Lifecycle Management:</strong> Create, publish, adjust capacity limits, and configure GPS map coordinates.
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs">
                  <div className="w-5 h-5 rounded-full bg-[#08482D] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-[#DAE7C7]" />
                  </div>
                  <div>
                    <strong className="text-[#101410] dark:text-white font-heading font-bold">Live Attendee Roster & CSV Export:</strong> Track real-time attendance and export formatted CSV sheets for academic course credit.
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs">
                  <div className="w-5 h-5 rounded-full bg-[#08482D] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-[#DAE7C7]" />
                  </div>
                  <div>
                    <strong className="text-[#101410] dark:text-white font-heading font-bold">Gate Volunteer Delegation:</strong> Appoint student assistants and generate single-use 6-digit access codes to unlock door scanners.
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => {
                    switchRoleQuickly('ORGANIZER');
                    navigateTo('organizer-dashboard');
                  }}
                  className="px-6 py-3 bg-[#08482D] hover:bg-[#0c5c3b] text-white font-heading font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <span>Open Organizer Studio</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#DAE7C7]" />
                </button>
              </div>
            </div>

            {/* Right Column: Realistic UI Preview Mockup */}
            <div className="bg-white dark:bg-[#14231b] rounded-2xl border border-[#DCE4D6] dark:border-[#203a2c] shadow-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#DCE4D6] dark:border-[#203a2c] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-[11px] font-heading font-bold text-[#101410] dark:text-white ml-2">
                    Organizer Studio — Active Sessions
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-[#E8F0DF] dark:bg-[#1a3325] text-[#08482D] dark:text-[#DAE7C7] px-2 py-0.5 rounded">
                  84% Fill Rate
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-[#F5F8EF] dark:bg-[#18281f] border border-[#DCE4D6] dark:border-[#22392c] flex items-center justify-between">
                  <div>
                    <div className="font-heading font-bold text-[#101410] dark:text-white">
                      Modern Web Architecture with Microservices
                    </div>
                    <div className="text-[10px] text-[#5E5E61] dark:text-slate-400">
                      Engineering Hall Lab 201 • 28/30 Seats Confirmed
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    PUBLISHED
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#F5F8EF] dark:bg-[#18281f] border border-[#DCE4D6] dark:border-[#22392c] flex items-center justify-between">
                  <div>
                    <div className="font-heading font-bold text-[#101410] dark:text-white">
                      Applied Deep Learning & Transformer Models
                    </div>
                    <div className="text-[10px] text-[#5E5E61] dark:text-slate-400">
                      Turing AI Computing Center • 40/40 Seats Full
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    CAPACITY FULL
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-[#5E5E61] dark:text-slate-400">
                <span className="flex items-center gap-1 text-[11px]">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#08482D] dark:text-[#DAE7C7]" />
                  <span>1-Click CSV Roster Download Ready</span>
                </span>
                <span className="font-mono text-[11px] text-[#08482D] dark:text-[#DAE7C7] font-bold">
                  2 Volunteers Appointed
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 7 — VOLUNTEER / EVENT-DAY GATE EXPERIENCE
      ───────────────────────────────────────────────────────────── */}
      <section id="volunteer" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-24">
        <div className="bg-white dark:bg-[#14231b] border border-[#DCE4D6] dark:border-[#203a2c] rounded-3xl p-6 sm:p-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left Column: Scanner Reticle Preview */}
            <div className="relative rounded-3xl overflow-hidden bg-slate-950 aspect-video max-h-[340px] flex items-center justify-center border-2 border-[#DCE4D6] dark:border-[#203a2c] shadow-2xl p-6">
              <div className="w-56 h-56 border border-[#DAE7C7]/50 rounded-2xl relative flex items-center justify-center">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#DAE7C7] rounded-tl-lg -mt-1 -ml-1" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#DAE7C7] rounded-tr-lg -mt-1 -mr-1" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#DAE7C7] rounded-bl-lg -mb-1 -ml-1" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#DAE7C7] rounded-br-lg -mb-1 -mr-1" />

                <div className="absolute left-2 right-2 h-1 bg-gradient-to-r from-transparent via-[#DAE7C7] to-transparent shadow-[0_0_15px_rgba(218,231,199,1)] animate-laser-sweep rounded-full" />

                <div className="text-center space-y-1">
                  <QrCode className="w-12 h-12 text-[#DAE7C7]/40 mx-auto" />
                  <span className="text-[10px] font-mono text-[#DAE7C7] tracking-widest uppercase">
                    Scanner Ready
                  </span>
                </div>
              </div>

              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white/80">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Hardware Laser Engine Active</span>
                </span>
                <span className="text-[10px] font-mono text-[#DAE7C7]">VOL-DEMO1</span>
              </div>
            </div>

            {/* Right Column: Narrative */}
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DAE7C7] text-[#08482D] text-xs font-bold">
                <Scan className="w-3.5 h-3.5" />
                <span>Gate Volunteer Check-In</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#101410] dark:text-[#f0f5ee] leading-tight">
                Instant Event-Day Pass Verification
              </h2>

              <p className="text-sm text-[#5E5E61] dark:text-slate-300 leading-relaxed">
                Appointed volunteers unlock their assigned gate station using a secure access code. Mobile and paper QR tickets verify in under 2 seconds.
              </p>

              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#08482D] dark:text-[#DAE7C7] shrink-0" />
                  <span>Zero app install — operates directly inside any modern mobile browser.</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#08482D] dark:text-[#DAE7C7] shrink-0" />
                  <span>Instant dual-tone Web Audio synthesizer chime confirms admittance or warns of duplicates.</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#08482D] dark:text-[#DAE7C7] shrink-0" />
                  <span>Manual ticket code fallback for participants with cracked screens or low battery.</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => navigateTo('volunteer-portal')}
                  className="px-6 py-3 bg-[#08482D] hover:bg-[#0c5c3b] text-white font-heading font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
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
          SECTION 8 — PRODUCT PREVIEW / PLATFORM TOUR (TAB SWITCHER)
      ───────────────────────────────────────────────────────────── */}
      <section id="platform-tour" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-heading font-bold text-[#08482D] dark:text-[#DAE7C7] uppercase tracking-wider">
            Interactive Tour
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#101410] dark:text-[#f0f5ee]">
            Explore the Platform Experience
          </h2>
          <p className="text-sm text-[#5E5E61] dark:text-slate-400">
            A cohesive design system tailored for students, faculty mentors, and event gatekeepers.
          </p>
        </div>

        {/* Tab Switcher Controls */}
        <div className="flex justify-center">
          <div className="inline-flex p-1.5 rounded-2xl bg-white dark:bg-[#14231b] border border-[#DCE4D6] dark:border-[#203a2c] shadow-sm gap-1 text-xs font-heading font-semibold">
            {[
              { id: 'catalog', label: '1. Discovery Catalog' },
              { id: 'pass', label: '2. Digital QR Pass' },
              { id: 'roster', label: '3. Organizer Roster' },
              { id: 'scanner', label: '4. Gate Scanner' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTourTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl transition-all ${
                  tourTab === tab.id
                    ? 'bg-[#08482D] text-white shadow-sm font-bold'
                    : 'text-[#5E5E61] dark:text-slate-400 hover:text-[#101410] dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Showcase Card Display */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#14231b] border border-[#DCE4D6] dark:border-[#203a2c] shadow-lg max-w-4xl mx-auto">
          {tourTab === 'catalog' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#DCE4D6] dark:border-[#203a2c] pb-3">
                <span className="text-xs font-heading font-bold text-[#08482D] dark:text-[#DAE7C7] uppercase tracking-wider">
                  Student Catalog & Real-Time Availability
                </span>
                <span className="text-xs font-mono bg-[#E8F0DF] dark:bg-[#1a3325] text-[#08482D] dark:text-[#DAE7C7] px-2 py-0.5 rounded font-bold">
                  Free & Paid Options
                </span>
              </div>
              <h3 className="text-xl font-heading font-bold text-[#101410] dark:text-white">
                Frictionless Workshop Discovery
              </h3>
              <p className="text-xs text-[#5E5E61] dark:text-slate-400 leading-relaxed">
                Filter by technology domain, time slot, and venue. Each card features real-time seat math, mentor credentials, and direct GPS mapping.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => navigateTo('workshops')}
                  className="px-5 py-2.5 bg-[#08482D] text-white text-xs font-heading font-bold rounded-xl flex items-center gap-2"
                >
                  <span>Open Live Workshop Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#DAE7C7]" />
                </button>
              </div>
            </div>
          )}

          {tourTab === 'pass' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#DCE4D6] dark:border-[#203a2c] pb-3">
                <span className="text-xs font-heading font-bold text-[#08482D] dark:text-[#DAE7C7] uppercase tracking-wider">
                  Cryptographic Academic Pass
                </span>
                <span className="text-xs font-mono bg-[#E8F0DF] dark:bg-[#1a3325] text-[#08482D] dark:text-[#DAE7C7] px-2 py-0.5 rounded font-bold">
                  Single-Use Verified
                </span>
              </div>
              <h3 className="text-xl font-heading font-bold text-[#101410] dark:text-white">
                Instant Digital QR Pass
              </h3>
              <p className="text-xs text-[#5E5E61] dark:text-slate-400 leading-relaxed">
                Encodes ticket code, participant name, date, and lab room. Features 1-click Google Maps GPS navigation link and a printable voucher view.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => navigateTo('my-registrations')}
                  className="px-5 py-2.5 bg-[#08482D] text-white text-xs font-heading font-bold rounded-xl flex items-center gap-2"
                >
                  <span>View Student Pass Wallet</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#DAE7C7]" />
                </button>
              </div>
            </div>
          )}

          {tourTab === 'roster' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#DCE4D6] dark:border-[#203a2c] pb-3">
                <span className="text-xs font-heading font-bold text-[#08482D] dark:text-[#DAE7C7] uppercase tracking-wider">
                  Faculty Studio Dashboard
                </span>
                <span className="text-xs font-mono bg-[#E8F0DF] dark:bg-[#1a3325] text-[#08482D] dark:text-[#DAE7C7] px-2 py-0.5 rounded font-bold">
                  CSV Export Supported
                </span>
              </div>
              <h3 className="text-xl font-heading font-bold text-[#101410] dark:text-white">
                Attendee Roster & Gate Check-In Tracking
              </h3>
              <p className="text-xs text-[#5E5E61] dark:text-slate-400 leading-relaxed">
                Faculty leads inspect confirmed registrations, monitor gate admission live, and download CSV rosters formatted for institutional academic credit.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    switchRoleQuickly('ORGANIZER');
                    navigateTo('organizer-dashboard');
                  }}
                  className="px-5 py-2.5 bg-[#08482D] text-white text-xs font-heading font-bold rounded-xl flex items-center gap-2"
                >
                  <span>Explore Faculty Studio</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#DAE7C7]" />
                </button>
              </div>
            </div>
          )}

          {tourTab === 'scanner' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#DCE4D6] dark:border-[#203a2c] pb-3">
                <span className="text-xs font-heading font-bold text-[#08482D] dark:text-[#DAE7C7] uppercase tracking-wider">
                  In-Browser Laser Scanner
                </span>
                <span className="text-xs font-mono bg-[#E8F0DF] dark:bg-[#1a3325] text-[#08482D] dark:text-[#DAE7C7] px-2 py-0.5 rounded font-bold">
                  25 FPS Detection
                </span>
              </div>
              <h3 className="text-xl font-heading font-bold text-[#101410] dark:text-white">
                Live Gate Scanner Station
              </h3>
              <p className="text-xs text-[#5E5E61] dark:text-slate-400 leading-relaxed">
                Full-frame Nimiq QR scanning engine with hardware autofocus, flashlight toggle, audio chime feedback, and real-time gate history logs.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => navigateTo('volunteer-portal')}
                  className="px-5 py-2.5 bg-[#08482D] text-white text-xs font-heading font-bold rounded-xl flex items-center gap-2"
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
          SECTION 9 — ABOUT / OUR STORY
      ───────────────────────────────────────────────────────────── */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 scroll-mt-24">
        <div id="our-story" className="bg-[#E8F0DF]/60 dark:bg-[#14231b]/60 border border-[#DCE4D6] dark:border-[#203a2c] rounded-3xl p-8 sm:p-14 transition-colors">
          <div className="max-w-3xl mx-auto space-y-5 text-center">
            <span className="text-xs font-heading font-bold text-[#08482D] dark:text-[#DAE7C7] uppercase tracking-wider">
              About & Philosophy
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#101410] dark:text-[#f0f5ee]">
              Our Story: The Spirit of Kaushalya (कौशल्य)
            </h2>
            <p className="text-sm text-[#5E5E61] dark:text-slate-300 leading-relaxed">
              In Sanskrit, <strong>Kaushalya</strong> signifies skill, capability, mastery, and the dedication to craftsmanship.
              We created Kaushalya to bridge the gap between academic theory and the practical, hands-on engineering capabilities demanded by modern technology.
            </p>
            <p className="text-xs sm:text-sm text-[#5E5E61] dark:text-slate-300 leading-relaxed">
              We empower faculty to organize both 100% free community sessions and subsidized paid bootcamps with Razorpay Test Mode checkout. By combining transparent seat capacity governance, cryptographic digital ticketing, and volunteer-led gate verification, we ensure every curious learner has equal, frictionless access to practical mastery.
            </p>
            <div className="pt-2 flex items-center justify-center gap-4 text-xs font-heading font-bold text-[#08482D] dark:text-[#DAE7C7]">
              <span>Learn by Doing</span>
              <span>•</span>
              <span>Transparent Pricing</span>
              <span>•</span>
              <span>Built for Campus Communities</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 10 — FAQ ACCORDION
      ───────────────────────────────────────────────────────────── */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-24">
        <div className="text-center space-y-2">
          <span className="text-xs font-heading font-bold text-[#08482D] dark:text-[#DAE7C7] uppercase tracking-wider">
            Got Questions?
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#101410] dark:text-[#f0f5ee]">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-[#5E5E61] dark:text-slate-400">
            Everything you need to know about registrations, passes, and event operations.
          </p>
        </div>

        <div className="space-y-3">
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
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-heading font-bold text-sm text-[#101410] dark:text-white"
              >
                <span>{item.q}</span>
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
                    className="px-5 pb-5 text-xs text-[#5E5E61] dark:text-slate-400 leading-relaxed border-t border-[#DCE4D6]/50 dark:border-[#203a2c]/50 pt-3"
                  >
                    {item.a}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 11 — FINAL CALL TO ACTION
      ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#08482D] rounded-3xl p-8 sm:p-14 text-white text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#DAE7C7]/15 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-3 max-w-2xl mx-auto relative z-10">
            <span className="font-hand text-lg text-[#DAE7C7] -rotate-1 inline-block">
              // start building real portfolio skills today
            </span>
            <h2 className="text-3xl sm:text-5xl font-heading font-extrabold text-white tracking-tight">
              Your Next Learning Experience Starts Here.
            </h2>
            <p className="text-xs sm:text-sm text-[#DAE7C7]/80 leading-relaxed max-w-lg mx-auto">
              Save your seat in technical sessions designed to build real skills. Open to students and technical enthusiasts across departments.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2 relative z-10">
            <button
              onClick={() => navigateTo('workshops')}
              className="px-8 py-3.5 bg-[#DAE7C7] hover:bg-[#c9ddb0] text-[#08482D] font-heading font-bold text-sm rounded-2xl shadow-lg transition-all"
            >
              Explore Active Workshops
            </button>
            <button
              onClick={onOpenAuth}
              className="px-7 py-3.5 bg-white/10 hover:bg-white/20 text-[#DAE7C7] border border-[#DAE7C7]/30 font-heading font-semibold text-sm rounded-2xl transition-all"
            >
              Sign In / Create Account
            </button>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 12 — CONTACT PROJECT TEAM
      ───────────────────────────────────────────────────────────── */}
      <section id="contact" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-24">
        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#14231b] border border-[#DCE4D6] dark:border-[#203a2c] shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-heading font-bold text-[#08482D] dark:text-[#DAE7C7] uppercase tracking-wider">
              Get In Touch
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#101410] dark:text-[#f0f5ee]">
              Contact the Project Team
            </h2>
            <p className="text-xs sm:text-sm text-[#5E5E61] dark:text-slate-400 max-w-md mx-auto">
              Have questions about hosting an academic workshop or campus deployment? Send a message to our department coordinators.
            </p>
          </div>

          {contactSubmitted ? (
            <div className="p-6 rounded-2xl bg-[#E8F0DF] dark:bg-[#1a3325] border border-[#DAE7C7] dark:border-[#2d4d3a] text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-[#08482D] dark:text-[#DAE7C7] mx-auto" />
              <h3 className="font-heading font-bold text-sm text-[#08482D] dark:text-[#DAE7C7]">
                Thank you for your message!
              </h3>
              <p className="text-xs text-[#08482D] dark:text-slate-300 max-w-sm mx-auto">
                Your inquiry has been received by the Kaushalya maintenance team. We will review and respond promptly.
              </p>
              <button
                onClick={() => setContactSubmitted(false)}
                className="mt-2 text-xs font-heading font-bold text-[#08482D] dark:text-[#DAE7C7] hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-heading font-semibold text-[#101410] dark:text-white mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE4D6] dark:border-[#22392c] bg-[#F5F8EF] dark:bg-[#18281f] text-[#101410] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#08482D]"
                  />
                </div>
                <div>
                  <label className="block font-heading font-semibold text-[#101410] dark:text-white mb-1">
                    University Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="e.g. alex@student.edu"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE4D6] dark:border-[#22392c] bg-[#F5F8EF] dark:bg-[#18281f] text-[#101410] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#08482D]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-heading font-semibold text-[#101410] dark:text-white mb-1">
                  Message / Inquiry *
                </label>
                <textarea
                  rows={4}
                  required
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Tell us about your workshop proposal or question..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE4D6] dark:border-[#22392c] bg-[#F5F8EF] dark:bg-[#18281f] text-[#101410] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#08482D]"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-[#5E5E61] dark:text-slate-400">
                  Maintained by Department of Computer Science & Engineering.
                </span>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#08482D] hover:bg-[#0c5c3b] text-white font-heading font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-[#DAE7C7]" />
                  <span>Send Message</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
