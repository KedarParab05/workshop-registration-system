# Kaushalya (कौशल्य) — Academic Workshop & Skills Platform

> **Tagline**: *Learn. Build. Grow.*  
> **Mission**: *A dedicated academic platform for university workshops, practical engineering skills, and career opportunities.*

---

## 1. Project Summary & Core Highlights

**Kaushalya** (Devanagari: **कौशल्य**) is a full-stack academic workshop registration, capacity management, and event governance platform built for universities, technical clubs, and student engineering communities.

- **Floating Centered Rounded Capsule Navbar**: Centered floating capsule (`rounded-full`) with refined borders, subtle shadow, larger high-contrast typography, distinct "Sign In" and "Get Started" buttons, and responsive mobile navigation.
- **Dedicated "Who Are You?" Role Onboarding**: Clicking "Get Started" opens a prominent three-card role selection screen (Student, Faculty / Organizer, Gate Volunteer) with clear value propositions, avoiding any automatic display on page refresh.
- **Secure Manual Email/Password Authentication**: Complete manual registration and login powered by Spring Boot, MongoDB Atlas, and JWT tokens. Passwords hashed using BCrypt. Google OAuth has been completely removed to provide an unhindered, reliable authentication flow. Strict backend role authorization governs user access.
- **Free & Paid Workshops with Razorpay Integration**: Organizers choose whether a workshop is Free or Paid. Free workshops offer direct 1-click registration without payment gateway overhead. Paid workshops utilize Razorpay Test Mode with backend-only order creation, 15-minute seat reservations, cryptographic HMAC-SHA256 signature verification, and Organizer Studio revenue analytics.
- **Soft Mint Studio Aesthetic**: Warm off-white canvas (`#F5F8EF`), deep forest green (`#08482D`), mint badge pills (`#DAE7C7`), soft sage surfaces (`#E8F0DF`), subtle borders (`#DCE4D6`), dark charcoal ink (`#101410`), and hand-drawn annotations in Caveat.
- **Architectural Grid Background**: Subtle 40px/44px isometric grid lines (`.grid-background` and `.grid-background-subtle`) across light and dark modes.
- **First-Viewport Hero Isolation**: Hero section is strictly contained within the initial desktop viewport (`1440×900`, `1440×1080`), with workshop discovery and all subsequent sections beginning strictly **below the fold**.
- **12-Section Long-Form SaaS Homepage**:
  1. Hero (first viewport, badges, headlines, CTAs, hand-drawn doodles)
  2. Workshop Discovery Carousel (horizontal cylinder-arched carousel with 1:1 drag physics)
  3. Why Kaushalya (6-card bento grid)
  4. How It Works (4-step horizontal stepper)
  5. Workshop Categories (interactive track cards)
  6. For Organizers (feature narrative + Organizer Studio UI preview)
  7. Volunteer Gate Experience (narrative + animated laser scanner preview)
  8. Platform Tour (interactive 4-tab switcher)
  9. About Kaushalya / Our Story (meaning of कौशल्य)
  10. Frequently Asked Questions (expandable FAQ accordion)
  11. Final Call-to-Action banner
  12. Contact Team & Master Institutional Footer
- **4-Role Governance**:
  - **Participant (Student)**: Browse catalog, 1-click free booking, Razorpay checkout for paid sessions, digital QR pass, GPS directions, cancel to restore seats.
  - **Organizer (Faculty / Lead)**: Dedicated Organizer Studio, create/edit free and paid workshops, live attendee rosters, CSV export, gate volunteer delegation.
  - **Volunteer (Gatekeeper / Staff)**: Dedicated `/volunteer-portal`, access-code login, live webcam QR scanner with laser reticle, manual ticket fallback.
  - **Super Admin (Platform Governance)**: Institutional oversight, user activation/suspension, global audit log inspection.
- **Resilient Real-Time Capacity**: Instant seat decrement upon RSVP; prevents duplicate registrations; automatically replenishes seats upon cancellation.

---

## 2. Technology Stack

| Layer | Technologies | Purpose |
|---|---|---|
| **Frontend UI** | React 19, TypeScript, Tailwind CSS v4, Motion (`motion/react`) | Single-page application, responsive layouts, spring animations, draggable cylinder carousel |
| **Icons & Media** | Lucide React, Google Fonts (Inter Tight, Inter, Caveat, JetBrains Mono), qrcode, qr-scanner | Typography, icons, high-error-correction QR passes, live webcam stream decoder |
| **Backend API** | Java 17 LTS, Spring Boot 3.2.5, Spring Security 6, JJWT | Enterprise RESTful endpoints, JWT stateless bearer authentication, BCrypt hashing |
| **Payment Gateway** | Razorpay Test Mode, HMAC-SHA256 Signatures | Order creation, payment verification, webhook listener, and ticket issuance |
| **Server-Side Views** | Spring MVC, Tomcat Embed Jasper, JSP, JSTL | Classic server-rendered enterprise templates |
| **Database** | MongoDB Atlas (`kaushalya_db`) | Isolated cloud-hosted NoSQL document collections for users, workshops, registrations, and audit logs |

---

## 3. Directory Structure

```
workshop-registration-system/
├── index.html                                # Root HTML with Kaushalya metadata & fonts
├── package.json                              # Node dependencies (Vite, React 19, Tailwind CSS v4)
├── vite.config.ts                            # Bundler configuration & /api reverse proxy
├── pom.xml                                   # Maven descriptor & Java dependencies
├── PROJECT_DETAILS.md                        # Comprehensive system architecture & operational guide
├── README.md                                 # Quick-start documentation
├── .env.example                              # Sanitized environment configuration template
│
├── scripts/                                  # DATABASE SEEDING
│   └── seed_database.cjs                     # MongoDB Atlas seeder for kaushalya_db
│
├── src/                                      # FRONTEND SOURCE ROOT
│   ├── main.tsx                              # React 19 entry point
│   ├── App.tsx                               # Root router, modal host, alerts
│   ├── index.css                             # Soft Mint theme tokens, fonts, .grid-background
│   ├── context/AppContext.tsx                # Central state provider & auto-polling
│   ├── types/index.ts                        # TypeScript interfaces & enums
│   ├── utils/                                # API fetch wrapper & seat calculation rules
│   └── components/
│       ├── admin/SuperAdminDashboard.tsx     # Institutional governance & audit trails
│       ├── auth/AuthModal.tsx                # Manual email/password auth modal
│       ├── common/                           # Profile, Kaushalya Digital Pass, Role Selector Modal
│       ├── layout/Navbar.tsx & Footer.tsx    # Floating centered capsule navbar & 5-col footer
│       ├── organizer/                        # Organizer Studio, CRUD form, roster, CSV export
│       ├── participant/                      # Student dashboard & My Registrations pass locker
│       ├── public/LandingPage.tsx            # 12-section production SaaS homepage
│       └── volunteer/VolunteerGatePortal.tsx # Webcam QR scanner station
│
└── src/main/java/com/workshophub/            # SPRING BOOT ENTERPRISE BACKEND
    ├── WorkshopHubApplication.java           # Application entrypoint
    ├── config/                               # Security, JWT filter, CORS, DataInitializer
    ├── controller/api/                       # REST controllers (Auth, Workshops, Payments, Admin)
    ├── model/                                # MongoDB entities (User, Workshop, Registration, etc.)
    ├── repository/                           # Spring Data Mongo repositories
    └── service/                              # Core business logic services
```

---

## 4. Quick Start & Setup

### Prerequisites
- **Node.js**: v18+ or v20+ ([nodejs.org](https://nodejs.org/))
- **Java JDK**: 17 LTS ([adoptium.net](https://adoptium.net/))

### Environment Configuration
Copy the template to `.env`:
```powershell
cp .env.example .env
```
Ensure your MongoDB Atlas URI points to `kaushalya_db` and your Razorpay Test Mode keys are set.

### Seed Database
Seed realistic demo users, workshops (Free & Paid), registrations, and access codes into MongoDB Atlas:
```powershell
npm run seed
```

### 1. Run the Frontend (React + Vite)
```powershell
npm install
npm run dev
```
Open **`http://localhost:3000`** in your browser.

### 2. Run the Backend (Spring Boot + MongoDB)
```powershell
mvn spring-boot:run
```
Backend API will be live at **`http://localhost:8080/api/`**.

---

## 5. Seeded Demo Accounts

You can log in directly using manual email/password or use the 1-click evaluator persona buttons:

| Persona | Role | Email | Password | Access Rights |
|---|---|---|---|---|
| **Alex Morgan** | `PARTICIPANT` | `alex.morgan@student.edu` | `Password123!` | Explore catalog, book free/paid seats, view Kaushalya passes |
| **Dr. Sarah Lin** | `ORGANIZER` | `sarah.lin@faculty.edu` | `Password123!` | Organizer Studio, create free/paid workshops, export CSV roster |
| **Prof. Vikram Rao** | `ORGANIZER` | `vikram.rao@faculty.edu` | `Password123!` | Manages Cloud & DevOps sessions |
| **Marcus Gate** | `VOLUNTEER` | N/A (Access Code) | Code: `VOL-729104` | Access gate station, scan student QR passes with webcam |
| **System Admin** | `SUPER_ADMIN` | `admin@workshophub.edu` | `AdminPass123!` | Institutional governance, user account management |

---

## 6. License & Governance

Academic Open Source — Built for universities and engineering student organizations.
