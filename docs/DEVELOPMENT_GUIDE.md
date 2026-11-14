# Kaushalya (कौशल्य) — Developer & Contributor Guide

A comprehensive technical reference for engineers developing, testing, deploying, and maintaining the **Kaushalya** academic workshop platform.

---

## 1. Architecture Overview

Kaushalya is a unified full-stack academic workshop governance platform combining:
- **Frontend SPA**: React 19, TypeScript, Tailwind CSS v4, Motion (`motion/react`), Lucide React.
- **Backend API**: Java 17 LTS, Spring Boot 3.2.5, Spring Security 6, JJWT (stateless JWT authentication), MongoDB Data repositories.
- **Database**: MongoDB Atlas (`kaushalya_db` database).
- **Payment Gateway**: Razorpay Test Mode with backend order generation, HMAC-SHA256 signature verification, and seat reservation concurrency holds.
- **QR Gate Verification**: Nimiq QR Scanner engine + HTML5 Canvas, Web Audio API feedback, and instant attendance auditing.

---

## 2. Prerequisites & Environment Setup

### Prerequisites
- **Node.js**: v18+ or v20+
- **JDK**: Java 17 LTS (`$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"`)
- **Maven**: Bundled Maven Wrapper (`./mvnw.cmd` on Windows, `./mvnw` on Linux/macOS)

### Environment Configuration (`.env`)
Create a `.env` file in the project root (never commit real credentials to git):
```env
SPRING_DATA_MONGODB_URI=mongodb+srv://<db_username>:<db_password>@cluster0.tbhl9le.mongodb.net/kaushalya_db?retryWrites=true&w=majority
APP_JWT_SECRET=super_secret_jwt_signing_key_at_least_32_characters_long_for_hs256!
APP_JWT_EXPIRATION_MS=86400000
RAZORPAY_KEY_ID=rzp_test_placeholder
RAZORPAY_KEY_SECRET=placeholder_secret
VITE_RAZORPAY_KEY_ID=rzp_test_placeholder
PORT=8080
```

---

## 3. Typography System & Font Standards

### Display Typography (Hero & Major Display Titles)
- **Primary Design Reference**: `Neue Machina`
  - Desktop specs: `font-size: 61px; line-height: 65px; letter-spacing: -1.53px; font-weight: 400/500;`
  - Responsive scaling via Tailwind clamp utilities (`text-[34px] sm:text-[46px] md:text-[54px] lg:text-[61px] leading-[40px] sm:leading-[52px] md:leading-[60px] lg:leading-[65px] tracking-[-0.8px] sm:tracking-[-1.1px] lg:tracking-[-1.53px]`).
- **Web Fallback**: `Space Grotesk` (Google Fonts)
  - CSS Font Stack: `font-family: "Neue Machina", "Space Grotesk", system-ui, -apple-system, sans-serif;`
  - If licensed `Neue Machina` font files (`.woff2`) are added by the institution in `public/assets/fonts/`, declare `@font-face` in `src/index.css`. Until then, `Space Grotesk` serves as the high-character geometric/technical fallback.

### Section Heading Typography
- **Primary Design Reference**: `Manrope` (Google Fonts)
  - Desktop specs: `font-size: 46px; font-weight: 500; line-height: 59px; letter-spacing: -0.02em;`
  - Scaled across breakpoints: `text-[28px] sm:text-[36px] lg:text-[46px] leading-[36px] sm:leading-[46px] lg:leading-[59px]`.
  - CSS Font Stack: `font-family: 'Manrope', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;`

### Body & Interface Typography
- **Primary**: `Manrope` & `Plus Jakarta Sans`
  - Crisp readability, balanced x-height, and neutral neutral grotesk geometry.
  - CSS Font Stack: `font-family: 'Manrope', 'Plus Jakarta Sans', system-ui, sans-serif;`

### Monospace / Stamp Typography
- **Primary**: `JetBrains Mono`
  - Used for ticket codes, access credentials, pass hashes, and time coordinates.

---

## 4. Brand Palette & Color Tokens

| Token | Light Mode Hex | Dark Mode Hex | Usage |
|---|---|---|---|
| `--bg-warm` | `#F5F8EF` | `#0a130e` | Canvas background |
| `--color-forest` | `#08482D` | `#10442b` | Primary brand accent & button surfaces |
| `--color-forest-hover` | `#0c5c3b` | `#165637` | Hover button background |
| `--color-mint` | `#DAE7C7` | `#254432` | Accent badges, icons, highlights |
| `--color-mint-subtle` | `#EDF4E5` | `#162a1f` | Soft card tints |
| `--color-sage` | `#E8F0DF` | `#132219` | Secondary cards & stat boxes |
| `--color-sage-border` | `#DCE4D6` | `#22382b` | Card borders & dividers |
| `--color-ink` | `#101410` | `#f0f5ee` | High-contrast body text |
| `--color-ink-muted` | `#5E5E61` | `#95ad9e` | Secondary/supporting copy |

> [!NOTE]
> Light mode is the default for all first-time visitors (verified in `index.html` inline bootstrap script and `AppContext.tsx`). An explicit toggle persists the user's preference in `localStorage.getItem('wh_theme')`.

---

## 5. Development & Testing Commands

### Run Frontend Development Server
```powershell
npm run dev
# Starts Vite on http://localhost:3000/ with reverse proxy to http://localhost:8080/
```

### Run Spring Boot API Daemon
```powershell
$env:JAVA_HOME="C:\Program Files\Java\jdk-17"
.\mvnw.cmd spring-boot:run
# Listens on http://localhost:8080/
```

### Run Unit Tests
```powershell
npx tsx --test src/utils/workshopRules.test.ts
# Executes 12 comprehensive unit tests covering capacity, roles, pricing, and cancellations.
```

### Type Check & Production Build
```powershell
npx tsc --noEmit
npm run build
```

---

## 6. Seed Demo Accounts & Roles

| Role | Email | Password | Access / Capabilities |
|---|---|---|---|
| **Student (Participant)** | `student@demo.edu` | `password123` | Workshop discovery, 1-click free registration, Razorpay paid checkout, QR pass locker |
| **Faculty (Organizer)** | `organizer@demo.edu` | `password123` | Organizer Studio, workshop creation, capacity management, attendee rosters, CSV export |
| **Gatekeeper (Volunteer)** | `volunteer@demo.edu` | `password123` | Gate scanner portal (`/volunteer-portal`), hardware camera scanner, manual code fallback |
| **Super Admin** | `admin@demo.edu` | `password123` | System oversight, user account suspension/activation, global audit log trails |

---

## 7. Operational Best Practices
- **No Direct Mutation of Reserved Sections**: Do not restore the homepage carousel or learning tracks section without explicit stakeholder directive.
- **Image Naming**: All banner assets must use lowercase kebab-case (`*-banner.jpg`, `*-hero.jpg`).
- **Secrets Management**: Never commit connection strings, Razorpay private keys, or JWT secrets to version control.
