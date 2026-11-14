# Project Structure & Repository Organization — Kaushalya (कौशल्य)

This document provides a comprehensive map of the unified full-stack Kaushalya repository. The project combines a modern React 19 single-page application frontend with an enterprise Java 17 / Spring Boot 3.2.5 backend and MongoDB Atlas cloud database.

---

## 1. Directory Tree Overview

```
workshop-registration-system/
├── index.html                               # Root HTML with Google Fonts & light-mode initialization
├── package.json                             # Frontend dependencies & scripts
├── vite.config.ts                           # Vite bundler configuration & backend API reverse proxy
├── pom.xml                                  # Maven project descriptor & Java dependencies
├── README.md                                # Project overview, quickstart & credentials
├── PROJECT_DETAILS.md                       # Complete platform feature specification
├── .env.example                             # Sanitized environment configuration template
│
├── docs/                                    # EVALUATION DOCUMENTATION
│   ├── PROJECT_STRUCTURE.md                 # Complete repository directory and file map (this file)
│   ├── ARCHITECTURE.md                      # System architecture, data flow & security model
│   └── DEVELOPMENT_GUIDE.md                 # Developer guide, setup, testing & scripts
│
├── public/                                  # STATIC PUBLIC ASSETS (Vite Root)
│   └── assets/
│       └── images/                          # Kebab-case production photography & banner assets
│           ├── ai-machine-learning-workshop-banner.jpg
│           ├── cloud-devops-workshop-banner.jpg
│           ├── cybersecurity-workshop-banner.jpg
│           ├── fullstack-web-workshop-banner.jpg
│           └── workshop-collaboration-hero.jpg
│
├── scripts/                                 # DATABASE MANAGEMENT SCRIPTS
│   └── seed_database.cjs                    # Cloud MongoDB Atlas seeder with demo workshops & users
│
├── src/                                     # REACT 19 + TYPESCRIPT FRONTEND SOURCE
│   ├── main.tsx                             # Application DOM mounting & root initialization
│   ├── App.tsx                              # View routing, navigation state, modal host & alerts
│   ├── index.css                            # Tailwind CSS v4, Instrument Serif + Plus Jakarta Sans, grid tokens
│   │
│   ├── context/
│   │   └── AppContext.tsx                   # Central state management (auth, workshops, registrations, theme)
│   │
│   ├── types/
│   │   └── index.ts                         # Core TypeScript interfaces, types and enums
│   │
│   ├── utils/
│   │   ├── api.ts                           # JWT-aware fetch wrapper for Spring Boot REST endpoints
│   │   ├── workshopRules.ts                 # Pure business logic: capacity math, seat replenishment, eligibility
│   │   └── workshopRules.test.ts            # Node.js test suite for seat rules & validation (12 tests)
│   │
│   ├── data/
│   │   └── seedData.ts                      # Client-side fallback dataset & image constants
│   │
│   └── components/                          # MODULAR COMPONENT LIBRARY
│       ├── admin/
│       │   └── SuperAdminDashboard.tsx      # Platform governance, user suspension & audit trail inspection
│       │
│       ├── auth/
│       │   └── AuthModal.tsx                # Manual email/password register & login modal
│       │
│       ├── common/
│       │   ├── ProfileModal.tsx             # User profile editor & password management
│       │   ├── RoleSelectorModal.tsx        # "Get Started" role onboarding & demo role switcher
│       │   └── QRTicketModal.tsx            # Digital QR pass modal with printable ticket & GPS navigation
│       │
│       ├── layout/
│       │   ├── Navbar.tsx                   # Floating capsule navbar with role-aware navigation
│       │   └── Footer.tsx                   # Deep forest-green footer with role access & campus desk links
│       │
│       ├── organizer/
│       │   ├── OrganizerDashboard.tsx       # Faculty Studio: metrics, revenue, workshop management
│       │   ├── ManageWorkshops.tsx          # Workshop status management & deletion controls
│       │   ├── WorkshopFormModal.tsx        # Workshop creation/editing modal (Free/Paid, GPS, venue)
│       │   ├── WorkshopRegistrations.tsx    # Attendee roster, check-in tracking & CSV export
│       │   ├── VolunteerManagementModal.tsx # Volunteer delegation modal & 6-digit access code generator
│       │   └── QRVerifierModal.tsx          # Organizer manual ticket verification tool
│       │
│       ├── participant/
│       │   ├── ParticipantDashboard.tsx     # Student workspace: overview, quick links, active sessions
│       │   └── MyRegistrations.tsx          # Student Pass Wallet: QR passes, cancellation, GPS directions
│       │
│       ├── public/
│       │   ├── LandingPage.tsx              # Editorial homepage (Hero, Bento, Stepper, Gate, Tour, FAQ)
│       │   ├── WorkshopList.tsx             # Workshop catalog page with search, track filters & sorting
│       │   ├── WorkshopDetail.tsx           # Workshop details page with RSVP & Razorpay checkout
│       │   ├── OurStoryPage.tsx             # Dedicated "/our-story" editorial philosophy & principles page
│       │   └── ContactPage.tsx              # Dedicated "/contact" form connected to backend REST endpoint
│       │
│       └── volunteer/
│           └── VolunteerGatePortal.tsx      # High-speed webcam scanner station for gate volunteers
│
└── src/main/                                # SPRING BOOT 3.2.5 JAVA BACKEND SOURCE
    ├── java/com/workshophub/
    │   ├── WorkshopHubApplication.java      # Spring Boot main application class
    │   │
    │   ├── config/                          # CONFIGURATION BEANS
    │   │   ├── CorsConfig.java              # Global CORS configuration (credentials & wildcard patterns)
    │   │   ├── DataInitializer.java         # MongoDB startup seeder with demo accounts & workshops
    │   │   ├── JwtAuthenticationFilter.java # Stateless JWT extraction & security context population
    │   │   ├── RazorpayConfig.java          # Razorpay client bean initialized from environment variables
    │   │   └── SecurityConfig.java          # Spring Security 6 filter chain, BCrypt encoder, public/private rules
    │   │
    │   ├── controller/api/                  # RESTful API ENDPOINTS
    │   │   ├── AuthRestController.java      # POST /api/auth/register, /login, /me, /switch-demo
    │   │   ├── WorkshopRestController.java  # GET/POST/PUT/DELETE /api/workshops
    │   │   ├── RegistrationRestController.java # GET/POST /api/registrations (Free & Paid reservation)
    │   │   ├── PaymentRestController.java   # POST /api/payments/create-order, /verify, /webhook
    │   │   ├── VolunteerRestController.java # GET/POST /api/volunteers, /verify-ticket, /login
    │   │   ├── AdminRestController.java     # GET/POST /api/admin/users, /audit-logs
    │   │   └── ContactRestController.java   # POST /api/contact (Inquiry submission & audit logging)
    │   │
    │   ├── model/                           # MONGODB DOCUMENT ENTITIES
    │   │   ├── User.java                    # User entity with roles (PARTICIPANT, ORGANIZER, VOLUNTEER, SUPER_ADMIN)
    │   │   ├── Workshop.java                # Workshop entity with pricingType (FREE, PAID) & GPS venue
    │   │   ├── Registration.java            # Registration entity with ticketCode, status, paymentDetails
    │   │   ├── Volunteer.java               # Gate volunteer entity with assigned workshop & access code
    │   │   ├── AuditLog.java                # Immutable security & operational audit trail
    │   │   └── Role.java                    # User role enum
    │   │
    │   ├── repository/                      # SPRING DATA REPOSITORIES
    │   │   ├── UserRepository.java          # MongoRepository for users by email
    │   │   ├── WorkshopRepository.java      # MongoRepository for workshops by category/organizer
    │   │   ├── RegistrationRepository.java  # MongoRepository for registrations by user/workshop/ticket
    │   │   ├── VolunteerRepository.java     # MongoRepository for volunteers by code/workshop
    │   │   └── AuditLogRepository.java      # MongoRepository for system audit events
    │   │
    │   ├── service/                         # BUSINESS LOGIC SERVICES
    │   │   ├── AuthService.java             # User registration, BCrypt verification, JWT minting
    │   │   ├── WorkshopService.java         # Workshop lifecycle, capacity validation, status transitions
    │   │   ├── RegistrationService.java     # Concurrency-safe seat decrement, QR ticket generation
    │   │   ├── PaymentService.java          # Razorpay order generation & HMAC-SHA256 signature verification
    │   │   ├── VolunteerService.java        # Volunteer access code verification & live ticket check-in
    │   │   ├── AdminService.java            # User governance & audit log queries
    │   │   ├── AuditService.java            # Audit record persistence
    │   │   └── JwtService.java              # HMAC-SHA256 JWT generation, parsing & claims extraction
    │   │
    │   └── dto/                             # REQUEST & RESPONSE DTOs
    │       ├── AuthRequest.java
    │       ├── AuthResponse.java
    │       ├── PaymentOrderRequest.java
    │       ├── PaymentVerifyRequest.java
    │       └── WorkshopRequest.java
    │
    ├── resources/                           # BACKEND APPLICATION RESOURCES
    │   ├── application.properties           # Spring Boot configuration (MongoDB, JWT, Razorpay)
    │   └── static/assets/images/            # Static assets mirrored for Spring MVC JSP fallback views
    │
    └── webapp/WEB-INF/jsp/                  # CLASSIC SPRING MVC JSP TEMPLATES (FALLBACK)
        ├── common/header.jsp & footer.jsp
        └── public/index.jsp, workshops.jsp, workshop-details.jsp
```

---

## 2. Where to Find Specific Features

| Feature | Frontend File | Backend Controller / Service |
|---|---|---|
| **Authentication & JWT** | `src/components/auth/AuthModal.tsx` | `AuthRestController.java`, `AuthService.java` |
| **Workshop Catalog** | `src/components/public/WorkshopList.tsx` | `WorkshopRestController.java`, `WorkshopService.java` |
| **Free / Paid RSVP** | `src/components/public/WorkshopDetail.tsx` | `RegistrationRestController.java`, `RegistrationService.java` |
| **Razorpay Checkout** | `src/components/public/WorkshopDetail.tsx` | `PaymentRestController.java`, `PaymentService.java` |
| **QR Ticket Pass** | `src/components/common/QRTicketModal.tsx` | `RegistrationService.java` (ticketCode generation) |
| **Faculty Organizer Studio** | `src/components/organizer/OrganizerDashboard.tsx` | `WorkshopRestController.java`, `RegistrationRestController.java` |
| **Gate Volunteer Scanner** | `src/components/volunteer/VolunteerGatePortal.tsx` | `VolunteerRestController.java`, `VolunteerService.java` |
| **Super Admin Console** | `src/components/admin/SuperAdminDashboard.tsx` | `AdminRestController.java`, `AdminService.java` |
| **Our Story Page** | `src/components/public/OurStoryPage.tsx` | Client route (`#our-story`) |
| **Contact Inquiries** | `src/components/public/ContactPage.tsx` | `ContactRestController.java` (`POST /api/contact`) |
| **Theme & Dark Mode** | `src/context/AppContext.tsx`, `src/index.css` | Client state (`localStorage.getItem('wh_theme')`) |
| **Design Tokens & Fonts** | `index.html`, `src/index.css` | Google Fonts (Instrument Serif, Plus Jakarta Sans) |
