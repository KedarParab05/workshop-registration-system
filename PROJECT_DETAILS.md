# Kaushalya (कौशल्य) — Comprehensive System Architecture & Operational Guide

> **Tagline**: *Learn. Build. Grow.*  
> **Mission**: *A dedicated academic platform for university workshops, practical engineering skills, and career opportunities.*

---

## 1. Executive Summary & Project Overview

**Kaushalya** (कौशल्य — the Sanskrit and Hindi word for *skill*, *dexterity*, and *practical mastery*) is an enterprise-grade, full-stack academic workshop registration, capacity management, and event governance platform. It is engineered specifically for universities, academic departments, technical clubs, and student engineering communities to organize, discover, and conduct hands-on learning sessions.

### 1.1. Core Philosophy & Distinctions
* **Soft Mint Studio Visual Identity**: Inspired by modern minimalist design systems (warm off-white `#F5F8EF`, deep forest green `#08482D`, mint badge pills `#DAE7C7`, sage surfaces `#E8F0DF`, architectural subtle borders `#DCE4D6`, charcoal ink `#101410`, and hand-drawn annotations in Caveat font).
* **Subtle Architectural CSS Grid Background**: Clean 40px/44px isometric architectural grid lines (`.grid-background` and `.grid-background-subtle`) layered beneath sections in both light (`rgba(8, 72, 45, 0.04)`) and dark (`rgba(218, 231, 199, 0.035)`) themes with zero pointer event interference.
* **First-Viewport Hero Isolation**: The desktop landing screen (`1440×900`, `1440×1080`, `1366×768`) is dedicated strictly to the high-impact hero message with action buttons and hand-drawn doodles. The workshop carousel, session cards, and all subsequent content begin strictly **below the fold**, accessible via natural scrolling or the primary CTA.
* **12-Section Long-Form Production SaaS Landing Page**: Complete journey comprising Hero, Workshop Discovery Carousel, Why Kaushalya (bento grid), How It Works (stepper), Workshop Categories (track filter), For Organizers (feature narrative + UI preview), Volunteer Gate Experience (webcam scanner preview), Platform Tour (interactive 4-tab switcher), About / Our Story, FAQ Accordion, Final Call-to-Action, and Master Institutional Footer.
* **Flexible Free & Paid Workshop Model (with Razorpay Test Mode)**: Organizers can configure each workshop as either Free or Paid. Free workshops offer direct 1-click registration with zero fees. Paid workshops integrate with Razorpay Test Mode featuring server-side order creation, 15-minute seat reservations, cryptographic HMAC-SHA256 signature verification, idempotent webhook reconciliation, and Organizer Studio revenue analytics. Razorpay Key Secrets remain strictly server-side.
* **Role-Governed Multi-Persona Ecosystem**: Granular access control across four distinct user roles:
  1. **Participant (Student)**: Free 1-click reservations, personal pass locker, GPS navigation to venue, instant seat cancellation.
  2. **Organizer (Faculty / Club Lead)**: Organizer Studio, workshop lifecycle CRUD, live attendee rosters, CSV export, gate volunteer delegation.
  3. **Volunteer (Gatekeeper / Staff)**: Dedicated `/volunteer-portal`, access-code authentication, live webcam QR scanner with laser reticle, manual ticket fallback.
  4. **Super Admin (Platform Governance)**: Institutional oversight, user activation/suspension, global audit log inspection.
* **Digital QR Ticketing & Fast Gate Check-In**: Instant cryptographic single-use QR pass generation for attendees, coupled with an in-browser live webcam scanner with laser reticle sweep for gate volunteers to scan and verify attendees in under 2 seconds.
* **Resilient Capacity Engine**: Real-time seat tracking that blocks duplicate registrations, enforces capacity thresholds, and immediately replenishes seats upon cancellation.
* **Dual-Architecture Implementation**: Features a high-speed **React 19 Single Page Application (SPA)** with Tailwind CSS v4 and Framer Motion, paired with an enterprise **Java 17 & Spring Boot 3.2.5** backend exposing both RESTful APIs and classic **JSP/JSTL server-side rendered** views.

---

## 2. Brand Identity & Preserved Technical Identifiers

### 2.1. Brand Assets & Typography
* **Brand Name**: **Kaushalya** (Devanagari: **कौशल्य**)
* **Tagline**: *"Learn. Build. Grow."* / *"A platform for workshops, skills, and opportunities."*
* **Logo Mark**: Stylized forest-green seedling leaf with mint accent badge and Devanagari script.
* **Headlines**: **Inter Tight** (Bold / 700 / 800) with optical tracking.
* **Body / UI**: **Inter** (Regular 400 / Medium 500 / SemiBold 600).
* **Hand-Drawn Notes**: **Caveat** (SemiBold 600) with custom CSS rotations (`-rotate-3`, `rotate-12`, `rotate-16`).
* **Passcodes & Ticket Identifiers**: **JetBrains Mono** / Monospace font.

### 2.2. Intentional Technical Identifiers (Backward Compatibility)
Per the system design specification, safe internal technical identifiers have been deliberately retained to guarantee complete backward compatibility with running databases, active sessions, and enterprise packages:
* **Java Package**: `com.workshophub.*` (preserves Spring Component Scanning, Classpaths, and Bean wiring).
* **Spring Boot Class**: `WorkshopHubApplication.java` (preserves Maven build configuration and Docker entrypoints).
* **MongoDB Database Name**: `workshophub_db` (preserves existing Atlas document collections and indices).
* **Spring Configuration Properties**: `workshophub.admin.email`, `workshophub.admin.password`.
* **Local Storage Keys**: `wh_token`, `wh_user`, `wh_theme`, `wh_role_selected` (ensures browser backward compatibility across active demo sessions).

---

## 3. Technology Stack & Tooling Breakdown

The platform integrates modern frontend tooling with robust enterprise backend technologies:

### 3.1. Frontend Architecture (React SPA)
| Technology / Library | Version | Purpose in Project |
|---|---|---|
| **React** | `19.0.1` | Modern component-based UI library powering interactive client views |
| **TypeScript** | `7.0.2` | Strong type safety across entities, props, state, and API contracts |
| **Vite** | `8.3.5` | Next-generation bundler and HMR dev server (running on port `3000`) |
| **Tailwind CSS** | `4.3.3` | Utility-first CSS engine with dark/light themes, Soft Mint tokens, and custom animations |
| **Google Fonts** | Hosted | Inter Tight (bold headlines), Inter (UI copy), Caveat (hand-drawn notes), JetBrains Mono (passcodes) |
| **Motion (`motion/react`)** | `12.23.24` | Smooth transitions, modal spring animations, scanner laser sweeps, draggable cylinder carousel |
| **Lucide React** | `0.546.0` | Comprehensive iconography system for academic & dashboard controls |
| **qrcode** | `1.5.4` | High-error-correction (`Level H`) QR Code canvas and image generator |
| **qr-scanner** / **jsqr** | `1.4.2` / `1.4.0` | Browser webcam stream processing and real-time QR code decoding |

### 3.2. Backend Architecture (Spring Boot & Enterprise Services)
| Technology / Framework | Version | Purpose in Project |
|---|---|---|
| **Java** | `17 LTS` | Core programming language for business logic, services, and security |
| **Spring Boot** | `3.2.5` | Standalone enterprise framework managing DI, web routing, and lifecycle |
| **Spring Data MongoDB** | `3.2.5` | Document-object mapping, query abstraction, and Mongo Atlas connectivity |
| **Spring Security** | `6.x` | Role-based authorization, BCrypt password hashing, and filter chains |
| **JJWT (Java JWT)** | `0.12.6` | Stateless token creation, signing, and verification (`JwtAuthFilter`) |
| **Jakarta Bean Validation** | `3.x` | Declarative input constraint validation across model payloads |
| **Tomcat Embed Jasper & JSTL** | `10.x` | Embedded Tomcat JSP compilation for server-side view rendering |

### 3.3. Database & Cloud Services
* **MongoDB Atlas**: Cloud-hosted NoSQL document database (`workshophub_db`) providing persistent collections for users, workshops, registrations, volunteers, and audit logs.
* **Authentication & Authorization**: Built with Spring Security 6, BCrypt password hashing, and stateless HMAC-SHA256 JWT tokens. Google Sign-In has been replaced with dedicated manual email/password authentication.
* **Docker Multi-Stage Build**: Complete containerization setup (Node.js build stage $\to$ Maven build stage $\to$ Alpine JRE runtime).

---

## 4. Homepage Architecture (12-Section SaaS Structure)

The Kaushalya homepage (`src/components/public/LandingPage.tsx`) is designed as a long-form, production-ready SaaS presentation:

```
┌─────────────────────────────────────────────────────────────┐
│ SECTION 1: FIRST-VIEWPORT HERO                              │
│ • Height: min-h-[calc(100vh-5rem)] (Strict first screen)    │
│ • Trust Badge: "Academic Excellence Platform • 100% Free"   │
│ • Headline: "Master Practical Engineering & Applied Skills" │
│ • CTAs: "Explore Workshops" / "How It Works"                │
│ • Hand-drawn Caveat notes & arrow doodles                   │
│ • Bouncing scroll indicator (Cards start strictly below)    │
└─────────────────────────────────────────────────────────────┘
                             │ (Scroll Down)
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ SECTION 2: WORKSHOP DISCOVERY CAROUSEL                      │
│ • Horizontal cylinder-arched carousel with 1:1 drag physics │
│ • Category filter pills (All, Web, AI, Cloud, Cyber)        │
│ • Live seat badges, session timing, speaker metadata        │
│ • Previous / Next controls + Play / Pause animation toggle  │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ SECTION 3: WHY KAUSHALYA (BENTO GRID)                       │
│ • 6 architectural cards highlighting key differentiators:    │
│   1. 100% Free Guaranteed Academic Access                   │
│   2. Single-Use Cryptographic QR Passes                     │
│   3. Dynamic Capacity & Instant Seat Restoral               │
│   4. Dedicated In-Browser Volunteer Gate Station            │
│   5. Role-Governed Academic Workspaces                      │
│   6. Campus Navigation & Directions Engine                  │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ SECTION 4: HOW IT WORKS (4-STEP STEPPER)                    │
│ • 01 Discover Sessions                                      │
│ • 02 Free 1-Click RSVP                                      │
│ • 03 Instant Digital Pass                                   │
│ • 04 Event-Day Gate Check-In                                │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ SECTION 5: WORKSHOP CATEGORIES                              │
│ • Interactive track cards for Web, AI, Cloud, Cyber, etc.   │
│ • 1-click filter triggering discovery jump                  │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ SECTION 6: FOR ORGANIZERS (FACULTY & LEADS)                 │
│ • 2-column layout: feature narrative + realistic UI preview │
│ • Capacity alerts, CSV exports, volunteer access codes      │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ SECTION 7: VOLUNTEER / EVENT-DAY GATE EXPERIENCE            │
│ • 2-column layout: security workflow + webcam UI preview    │
│ • Animated laser sweep reticle and verification badge       │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ SECTION 8: PLATFORM TOUR / INTERACTIVE PREVIEW              │
│ • 4-tab interactive switcher:                               │
│   Tab 1: Student Discovery Catalog                          │
│   Tab 2: Digital QR Pass & GPS Directions                   │
│   Tab 3: Organizer Studio & Live Roster                     │
│   Tab 4: Volunteer In-Browser Gate Scanner                  │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ SECTION 9: ABOUT KAUSHALYA / OUR STORY                      │
│ • Meaning of कौशल्य (Skill, Competence, Mastery)             │
│ • Bridging theory with practical campus engineering         │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ SECTION 10: FREQUENTLY ASKED QUESTIONS (FAQ ACCORDION)      │
│ • 6 interactive expandable accordion items                  │
│ • Addresses fees, attendance, cancellations, gate passes    │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ SECTION 11: FINAL CALL TO ACTION (CTA BANNER)               │
│ • Deep forest green backdrop with mint accent buttons       │
│ • "Your Next Learning Experience Starts Here."              │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ SECTION 12: CONTACT TEAM & MASTER INSTITUTIONAL FOOTER      │
│ • Interactive message form with validation & success alert  │
│ • 5-column directory: Brand, Tracks, Portals, Institutional │
│ • Persona Switcher shortcut & Copyright notice              │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. What Has Been Implemented (Feature Matrix)

### 5.1. Participant (Student) Experience
1. **Interactive Workshop Catalog**:
   - Filter by technology domain: Web Architecture, AI & Machine Learning, Cloud & DevOps, Cybersecurity, Mobile, Data Engineering.
   - Real-time search by keyword (title, summary, venue, instructor).
   - Workshop status indicators: `Upcoming`, `In Progress`, `Completed`, `Full / Waitlist`.
2. **Detailed Workshop Exploration**:
   - Full workshop descriptions, instructor credentials, prerequisites, and itemized learning outcomes.
   - Interactive logistics panel showing date, time slot, duration, physical venue address, or virtual meeting URL.
   - One-click **GPS Directions** link resolving directly to Google Maps navigation coordinates.
3. **Frictionless One-Click Registration**:
   - Immediate seat reservation with instantaneous seat count decrement across the system.
   - Guardrails preventing overbooking, duplicate enrollments, or registrations on past sessions.
4. **My Registrations & Digital Pass Management**:
   - Personal registration history tracking (`CONFIRMED`, `ATTENDED`, `CANCELLED`).
   - Modal-based **Kaushalya Digital Pass** with printable ticket layout, QR verification code, venue details, and download options.
   - Easy self-service cancellation that instantly returns reserved seats back to the public pool.

### 5.2. Organizer (Faculty / Department Lead) Studio
1. **Organizer Analytics Dashboard**:
   - At-a-glance metrics: Total Workshops Created, Active Published Sessions, Confirmed Student Registrations, Seat Utilization %.
2. **Workshop Lifecycle CRUD**:
   - Modal-driven creation and editing form with built-in validation rules.
   - Fields: Title, Category, Summary, Rich Description, Banner Preset/Custom URL, Event Date, Start & End Times, Seat Capacity, Physical Venue or Online Webcast URL, Registration Deadline, and Per-line Learning Outcomes.
   - Safe cancellation rules: If a session has active attendees, system marks status as `CANCELLED` rather than hard deleting, safeguarding student records.
3. **Attendee Roster & Management**:
   - Searchable, filterable table of registered participants per workshop.
   - Live attendance status toggle (`CONFIRMED` $\leftrightarrow$ `ATTENDED`).
   - One-click **CSV Export** (`kaushalya_roster_YYYY-MM-DD.csv`) formatted for academic grading and attendance records.
4. **Gatekeeper Delegation System (Volunteer Management)**:
   - Organizers can appoint student volunteers for physical venue check-ins.
   - Issue unique 6-digit alphanumeric access codes (e.g. `VOL-748921`).
   - Review incoming volunteer applications, approve/issue codes, revoke active credentials, or regenerate codes on demand.
5. **Integrated Gate Scanner**:
   - Organizers can directly launch the gate camera scanner modal to verify passes without needing a separate station.

### 5.3. Volunteer Gate Portal (Access-Controlled Check-In Station)
1. **Dedicated Check-In Portal (`/volunteer-portal`)**:
   - Passwordless, high-security gate access using the assigned Volunteer Access Code.
   - Displays assigned workshop details, room assignment, and real-time scanned attendee counters.
2. **Live Webcam QR Scanner**:
   - Uses device camera with real-time video feed analysis.
   - Switchable front/rear cameras for mobile devices and tablets.
   - Animated visual laser scan line sweep and viewfinder pulse indicator.
   - Audio chime feedback: high pleasant chime on valid pass; double alert tone on invalid/duplicate pass.
3. **Manual Fallback Entry**:
   - Keyboard input field allows typing raw ticket codes (e.g. `TKT-48F9A2`) if a student's phone screen is cracked or camera cannot read the code.
4. **Scan History Feed**:
   - Live chronological feed of scanned attendees with timestamp, student name, and grant/denial badge.
5. **Rehearsal Date Bypass**:
   - Optional toggle allowing volunteers to test passes prior to the official event date.

### 5.4. Super Admin Platform Governance
1. **Institutional Oversight**:
   - Complete visibility over all users, workshops, and registrations across departments.
2. **User Account Governance**:
   - Activate or Suspend student or faculty accounts.
   - Role modifications and identity management.
3. **Audit Trail Logging**:
   - Automatic recording of critical platform events (user creation, workshop updates, seat cancellations, gate verifications).
   - Tracks actor ID, actor name, action verb, entity type, entity ID, and timestamp.

### 5.5. Free & Paid Registration and Razorpay Test Mode Architecture

Kaushalya supports both Free academic workshops and Paid technical bootcamps:

1. **Organizer Pricing Governance**:
   - **Free Workshops**: Zero admission fees. Direct 1-click registration without payment gateway overhead. `pricingType: FREE`, `price: 0`, `paymentStatus: NOT_REQUIRED`.
   - **Paid Workshops**: Positive tuition fees in INR (`pricingType: PAID`, `price > 0`). Preset quick buttons (`₹99`, `₹199`, `₹299`, `₹499`, `₹999`) or custom amount input.
   - **Pricing Immutability Lock**: Once any confirmed or attended registrations exist, the workshop pricing type and amount cannot be modified.

2. **15-Minute Seat Capacity Reservation Engine**:
   - When a participant initiates paid checkout, a registration record in `PENDING_PAYMENT` status is created with a `reservationExpiresAt` timestamp (+15 minutes).
   - Capacity calculations count: $\text{Available} = \text{Capacity} - (\text{Confirmed} + \text{Attended} + \text{Unexpired Reservations})$.
   - Prevents overselling during high-demand workshop launches.
   - Expired reservations are automatically released on next check or timeout.

3. **Cryptographic Payment Verification**:
   - Razorpay orders are generated server-side using Java 17 built-in `HttpClient` (zero third-party SDK dependencies).
   - Client executes test checkout using Razorpay Checkout SDK.
   - Client submits `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature` to `/api/payments/verify`.
   - Backend calculates HMAC-SHA256 hash using the secret key: $\text{HMAC}(\text{order\_id} + "|" + \text{payment\_id}, \text{secret})$.
   - Registration moves to `CONFIRMED` and `paymentStatus` moves to `SUCCESS` **only** upon cryptographic signature match. Digital QR pass is issued only after verification.

4. **Idempotent Webhook Processing (`/api/payments/webhook`)**:
   - Listens to Razorpay async events (`order.paid`, `payment.captured`, `payment.failed`).
   - Validates `X-Razorpay-Signature` against raw request body.
   - Deduplicates incoming events using MongoDB `webhook_events` collection.

5. **Organizer Financial Analytics**:
   - Gross revenue KPI card in Organizer Studio: `₹{totalRevenue}`.
   - Paid vs Free breakdown counters.
   - CSV Roster exports include: Pricing Type, Amount, Payment Status, and Razorpay Payment Reference ID.

### 5.6. System Utilities & Cross-Cutting Concerns
* **1-Click Quick Persona Switcher**: Embedded switch allowing instant switching between demo personas (Alex Morgan, Dr. Sarah Lin, Prof. Vikram Rao, Super Admin, Volunteer) to test end-to-end workflows in seconds.
* **Dual Theme Engine**: Dark mode and Light mode with persistent preference storage and custom Soft Mint tokens.
* **Auto-Polling Synchronization**: Multi-endpoint parallel fetch every 5 seconds keeps seat capacity and gate check-ins synchronized across separate browser tabs and devices in real time.

---

## 6. Project Directory & Architecture Map

```
workshop-registration-system/
├── package.json                          # Frontend package configuration (Kaushalya)
├── tsconfig.json                         # TypeScript configuration (strict, ES2022)
├── vite.config.ts                        # Vite configuration & /api proxy to :8080
├── pom.xml                               # Maven project descriptor & Java dependencies
├── Dockerfile                            # 3-stage container build (Vite + Maven + JRE)
├── render.yaml                           # Render cloud deployment blueprint
├── vercel.json                           # Vercel client-side routing rewrites
├── index.html                            # Root HTML template with Kaushalya metadata
├── PROJECT_DETAILS.md                    # This master project specification document
├── README.md                             # Quick-start documentation
│
├── src/                                  # FRONTEND SOURCE ROOT (REACT 19 + VITE)
│   ├── main.tsx                          # React 19 root bootstrap & DOM mounting
│   ├── App.tsx                           # Main route switcher, alerts, modal host
│   ├── index.css                         # Tailwind CSS v4 setup, fonts, .grid-background
│   │
│   ├── context/                          # STATE MANAGEMENT
│   │   └── AppContext.tsx                # Central state provider (users, workshops,
│   │                                     # registrations, volunteers, real-time polling)
│   ├── types/                            # TYPE DEFINITIONS
│   │   └── index.ts                      # Interfaces: User, Workshop, Registration,
│   │                                     # Volunteer, AuditLog, WorkshopFormData
│   ├── utils/                            # CLIENT UTILITIES
│   │   ├── api.ts                        # apiFetch wrapper with JWT Bearer header
│   │   └── workshopRules.ts              # Seat math, input validations, permission checks
│   ├── data/                             # SEED DATA
│   │   └── seedData.ts                   # Banner assets, initial mock fallbacks
│   │
│   └── components/                       # REACT UI COMPONENTS
│       ├── admin/
│       │   └── SuperAdminDashboard.tsx   # Institutional governance, user management, audit logs
│       ├── auth/
│       │   └── AuthModal.tsx             # Manual Email/Password Login & Registration modal
│       ├── common/
│       │   ├── ProfileModal.tsx          # User & volunteer profile editor
│       │   ├── QRTicketModal.tsx         # Kaushalya Digital Pass with GPS link & print button
│       │   └── RoleSelectorModal.tsx     # Role chooser & volunteer access code entry
│       ├── layout/
│       │   ├── Navbar.tsx                # Global topbar with Kaushalya leaf mark, SaaS links
│       │   └── Footer.tsx                # 5-column institutional footer & copyright notice
│       ├── public/
│       │   ├── LandingPage.tsx           # 12-section SaaS homepage with isolated hero
│       │   ├── WorkshopList.tsx          # Search bar, category filters, session cards
│       │   └── WorkshopDetail.tsx        # In-depth workshop info, syllabus, register CTA
│       ├── participant/
│       │   ├── ParticipantDashboard.tsx  # Overview of upcoming sessions & stats
│       │   └── MyRegistrations.tsx       # Pass locker, status badges, cancel button
│       ├── organizer/
│       │   ├── OrganizerDashboard.tsx    # Tabs for workshops, attendee roster, volunteers
│       │   ├── ManageWorkshops.tsx       # Workshop table with CRUD and status toggles
│       │   ├── WorkshopFormModal.tsx     # Create/edit workshop modal dialog
│       │   ├── WorkshopRegistrations.tsx # Attendee table with scan & CSV export buttons
│       │   ├── AssignVolunteerModal.tsx  # Volunteer appointment modal
│       │   └── QRVerifierModal.tsx       # Live camera QR scanner for organizers
│       └── volunteer/
│           └── VolunteerGatePortal.tsx   # Volunteer gate check-in station & camera scanner
│
└── src/main/                             # BACKEND SOURCE ROOT (SPRING BOOT 3)
    ├── resources/
    │   ├── application.properties        # Server port, MongoDB URI, JWT secret, logging
    │   └── static/assets/images/         # High-resolution workshop banner images
    │
    ├── webapp/WEB-INF/jsp/               # SERVER-SIDE RENDERED VIEWS (JSP)
    │   ├── admin/dashboard.jsp           # Super Admin JSP dashboard
    │   ├── auth/login.jsp                # Server-rendered login form
    │   ├── auth/register.jsp             # Server-rendered registration form
    │   ├── organizer/dashboard.jsp       # Organizer management JSP
    │   ├── organizer/workshop-form.jsp   # Server-rendered workshop form
    │   ├── participant/my-registrations.jsp # Student registrations JSP
    │   └── public/index.jsp              # Server-rendered landing page
    │
    └── java/com/workshophub/             # JAVA BACKEND LOGIC (PRESERVED PACKAGE)
        ├── WorkshopHubApplication.java   # Spring Boot entry point (WAR & JAR initializer)
        ├── config/
        │   ├── CorsConfig.java           # Cross-Origin Resource Sharing policy
        │   ├── DataInitializer.java      # First-run database seeder (demo personas)
        │   ├── JwtAuthFilter.java        # Request interceptor extracting JWT tokens
        │   ├── JwtUtil.java              # JWT creation, claims parsing, validation
        │   └── SecurityConfig.java       # Spring Security stateless filter chain
        ├── model/                        # MONGODB ENTITIES
        │   ├── User.java                 # User account entity
        │   ├── Workshop.java             # Workshop session entity
        │   ├── Registration.java         # Seat booking & ticket record
        │   ├── Volunteer.java            # Gate volunteer appointment entity
        │   ├── AuditLog.java             # System audit trail entity
        │   └── enums/                    # UserRole, WorkshopStatus, RegistrationStatus
        ├── repository/                   # SPRING DATA MONGO REPOSITORIES
        │   ├── UserRepository.java
        │   ├── WorkshopRepository.java
        │   ├── RegistrationRepository.java
        │   ├── VolunteerRepository.java
        │   └── AuditLogRepository.java
        ├── service/                      # BUSINESS LOGIC SERVICES
        │   ├── UserService.java          # Authentication, BCrypt hashing, JWT issuance
        │   ├── WorkshopService.java      # Workshop lifecycle, capacity checks
        │   ├── RegistrationService.java  # Booking transactions, ticket validation
        │   └── ImageStorageService.java  # Image upload & asset handling
        └── controller/
            ├── HomeController.java       # JSP public page controller
            ├── AuthController.java       # JSP authentication controller
            ├── ParticipantController.java# JSP student controller
            ├── OrganizerController.java  # JSP organizer controller
            ├── AdminController.java      # JSP super-admin controller
            └── api/                      # RESTFUL API CONTROLLERS
                ├── AuthRestController.java       # /api/auth (login, register, me, switch)
                ├── WorkshopRestController.java   # /api/workshops (CRUD, status, query)
                ├── RegistrationRestController.java# /api/registrations (book, cancel, verify)
                ├── VolunteerRestController.java  # /api/volunteers (request, approve, gate)
                └── AdminAnalyticsRestController.java # /api/admin (stats, audit logs)
```

---

## 7. Pre-Configured Demo Accounts & Personas

The application features ready-to-test academic personas pre-seeded in the database:

| Persona | Role | Email | Password | Primary Capabilities |
|---|---|---|---|---|
| **Alex Morgan** | `PARTICIPANT` | `alex@student.edu` | `Student123!` | Browse catalog, book free seats, view Kaushalya passes, cancel bookings |
| **Dr. Sarah Lin** | `ORGANIZER` | `sarah@faculty.edu` | `Faculty123!` | Organizer Studio, manage Web & AI workshops, export CSV rosters, appoint gate volunteers |
| **Prof. Vikram Rao** | `ORGANIZER` | `vikram@faculty.edu` | `Faculty123!` | Manages Cloud & DevOps workshops, monitors attendee capacity |
| **System Administrator** | `SUPER_ADMIN` | `admin@workshophub.edu` | `AdminPass123!` | Institutional governance, toggle user account statuses, view audit logs |
| **Gate Volunteer** | `VOLUNTEER` | N/A (Access Code) | Code: `VOL-DEMO1` | Access gate station, scan student QR passes with webcam, verify check-ins |

> **Pro Tip**: Use the **"Switch Persona"** pill in the top navigation bar to instantaneously switch identities with a single click without manually typing credentials.

---

## 8. How to Run the Project (Step-by-Step Instructions)

Follow these clear instructions to run the application anytime.

### 8.1. Prerequisites
Ensure the following are installed on your machine:
* **Node.js**: Version 18.x or 20.x or higher ([nodejs.org](https://nodejs.org/))
* **Java Development Kit (JDK)**: Version 17 LTS ([adoptium.net](https://adoptium.net/))
* **Maven**: Version 3.8+ (optional, or use embedded IDE Maven)

---

### 8.2. Starting the Frontend (React + Vite)

The frontend runs on port **3000** and connects to the backend API via Vite's built-in reverse proxy:

1. Open PowerShell or a terminal in the project directory:
   ```powershell
   Set-Location "c:\Users\HP\Desktop\workshop-registration-system"
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Launch the Vite development server using the local binary:
   ```powershell
   .\node_modules\.bin\vite.cmd --port 3000 --host 0.0.0.0
   ```
   *(Or standard npm script: `npm run dev`)*

4. Open your web browser and navigate to:
   ```
   http://localhost:3000
   ```

---

### 8.3. Starting the Backend (Spring Boot + MongoDB)

The backend provides the REST APIs and JSP views on port **8080**:

1. Open a second PowerShell or terminal window:
   ```powershell
   Set-Location "c:\Users\HP\Desktop\workshop-registration-system"
   ```

2. Compile and launch the Spring Boot application using Maven:
   ```bash
   mvn spring-boot:run
   ```
   *(Or open the project in IntelliJ IDEA, Eclipse, or VS Code and run `WorkshopHubApplication.java`)*

3. Once started, the Spring Boot service will be live at:
   * **API Base**: `http://localhost:8080/api/`
   * **JSP Web Views**: `http://localhost:8080/`
   * **Database**: Automatically connects to MongoDB Atlas using the configured connection string in `src/main/resources/application.properties`.

---

### 8.4. Running Everything via Docker (Production Single-Command)

If Docker Desktop is installed, run both frontend and backend combined in a single container:

1. Build the Docker image:
   ```bash
   docker build -t kaushalya:latest .
   ```

2. Run the container:
   ```bash
   docker run -p 8080:8080 kaushalya:latest
   ```

3. Open your browser at:
   ```
   http://localhost:8080
   ```

---

## 9. Troubleshooting & Common Pitfalls

| Issue | Root Cause | Solution |
|---|---|---|
| **Vite 4 vs Vite 8 Conflict** | Global or parent `node_modules` contains older Vite version (`Vite 4.5.3`) incompatible with `@tailwindcss/vite` | Run directly using local binary: `.\node_modules\.bin\vite.cmd --port 3000 --host 0.0.0.0` |
| **Port 3000 Already in Use** | A previous Node.js process is holding port 3000 | In PowerShell, run `Get-Process node \| Stop-Process -Force` and restart Vite |
| **Port 8080 Already in Use** | An existing Java or Tomcat process is running | Stop the existing Java process or change `server.port=8081` in `application.properties` |
| **Camera Access Blocked in Scanner** | Browser permission denied for webcam stream | Click the lock/tune icon in the browser address bar, set **Camera** to **Allow**, and reload |
| **MongoDB Connection Failure** | IP address not allowlisted on MongoDB Atlas | Ensure your current IP is allowed under MongoDB Atlas Network Access, or verify internet connectivity |

---

## 10. Summary of Architectural Achievements

* **Brand Excellence**: Full identity transformation to **Kaushalya** (कौशल्य), tagline *"Learn. Build. Grow."*, with soft mint studio color palette, Inter Tight headlines, and Caveat handwritten notes.
* **First-Screen Precision**: First viewport contains strictly the high-impact hero message with zero peek from cards or lower sections.
* **12-Section SaaS Journey**: Comprehensive homepage covering bento benefits, 4-step workflow, interactive categories, organizer and volunteer previews, 4-tab product tour, story, FAQ, and contact form.
* **Security & Auth**: Stateless JWT bearer tokens with BCrypt encrypted credentials, role validation, and volunteer access codes.
* **Integrity & Concurrency**: Real-time seat calculation prevents overbooking even under simultaneous clicks, with instant replenishment on cancellation.
* **Academic Mission**: 100% free sessions, attendee roster exports, GPS venue navigation, and student volunteer delegation.
