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
- **Clean, Editorial Technical Typography**: Hero display typography inspired by `Neue Machina` (`Space Grotesk` web fallback) with desktop reference `61px / 65px / -1.53px` tracking, paired with `Manrope` section headings (`46px / 59px / 500 weight`) and clean grotesk interface typography.
- **Warm Ivory & Forest Green Brand Palette**: Ivory/warm off-white canvas (`#F5F8EF`), deep forest green (`#08482D`), luminous mint accents (`#DAE7C7`), soft sage surfaces (`#E8F0DF`), subtle borders (`#DCE4D6`), and deep ink (`#101410`). Light mode is the default for first-time visitors with an instant dark mode toggle.
- **Architectural Grid Background**: Crisp, subtle isometric grid lines across hero and footer surfaces without obscuring content legibility.
- **Direct, Focused Homepage**: The unwanted carousel and learning tracks sections have been removed from the homepage for a focused, editorial flow:
  1. Hero (Technical display headline, concise value proposition, Explore Workshops and How It Works CTAs)
  2. Why Kaushalya (Bento grid highlighting flexible seating, cryptographic QR passes, and live seat replenishment)
  3. How It Works (4-step visual stepper: Discover, Instant RSVP & Payment, Digital Pass, Gate Check-In)
  4. Volunteer Gate Check-In (Live webcam scanner preview with laser sweep reticle)
  5. Interactive Platform Tour (4-tab switcher covering Catalog, Pass, Roster, Scanner)
  6. Frequently Asked Questions (Interactive accordion + direct link to contact team)
- **Preserved Workshop Capabilities**: All workshop discovery (`/workshops`), details (`/workshops/:id`), 1-click free registration, Razorpay Test Mode checkout, seat capacity governance, and organizer tools remain 100% operational.
- **Dedicated Public Pages**:
  - `OurStoryPage` (`#our-story`): Explores the philosophical origin and mission of Kaushalya (कौशल्य).
  - `ContactPage` (`#contact`): Interactive inquiry form integrated with backend `POST /api/contact` audit logging.
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
| **Frontend UI** | React 19, TypeScript, Tailwind CSS v4, Motion (`motion/react`) | Single-page application, responsive layouts, spring animations |
| **Icons & Media** | Lucide React, Google Fonts (Space Grotesk, Manrope, JetBrains Mono, Plus Jakarta Sans), qrcode, qr-scanner | Distinctive technical & editorial typography, icons, QR passes, live webcam stream decoder |
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

## 5. Seeded Demo Accounts & Instant Demo Login

You can log in directly using manual email/password (`Password123!`) or click the 1-click **Instant Demo Login** cards in the sign-in modal:

### Named Student Accounts
| Student Name | Department | Email | Default Password | Initial Registrations |
|---|---|---|---|---|
| **Aary Nikam** | Computer Science & Eng. | `aary.nikam@student.edu` | `Password123!` | 4 passes (Web, AI ₹499, Java Attended, Docker) |
| **Kedar Parab** | Information Technology | `kedar.parab@student.edu` | `Password123!` | 4 passes (AWS ₹299, SQL ₹199 Attended, Cyber, Web) |
| **Omkar Parelkar** | AI & Data Science | `omkar.parelkar@student.edu` | `Password123!` | 4 passes (Web, Cyber, Java Attended, Spring API ₹399) |
| **Vaibhavi Parmar** | Electronics & Telecom. | `vaibhavi.parmar@student.edu` | `Password123!` | 4 passes (IoT, AI ₹499, SQL Attended, DSA Cancelled) |
| **Sonal Sharma** | Cyber Security & Forensics | `sonal.sharma@student.edu` | `Password123!` | 4 passes (Cyber, Docker, Java Attended, AWS ₹299) |

### Faculty Organizers & Administration
| Persona | Role | Email | Password | Access Rights |
|---|---|---|---|---|
| **Dr. Sarah Lin** | `ORGANIZER` | `sarah.lin@faculty.edu` | `Password123!` | Full-Stack Web, Java, Docker, REST APIs |
| **Omkar Parelkar** | `ORGANIZER` | `omkar.parelkar@faculty.edu` | `Password123!` | Practical AI Studio, IoT Systems, DSA in Java |
| **Prof. Vikram Rao** | `ORGANIZER` | `vikram.rao@faculty.edu` | `Password123!` | Cloud & AWS Architecture, Cybersecurity, SQL Masterclass |
| **System Administrator** | `SUPER_ADMIN` | `admin@workshophub.edu` | `Password123!` | Platform Governance, User Suspensions, Audit Logs |
| **Marcus Vance** | `VOLUNTEER` | `marcus.gate@volunteer.edu` | Code: `VOL-729104` | Gate Station: Full-Stack Web Development |
| **Elena Rostova** | `VOLUNTEER` | `elena.volunteer@university.edu` | Code: `VOL-495946` | Gate Station: Practical AI Studio |

---

## 6. License & Governance

Academic Open Source — Built for universities and engineering student organizations.
