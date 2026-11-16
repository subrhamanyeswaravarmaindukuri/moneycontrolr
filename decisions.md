# MoneyControlr — Architecture Decision Records (decisions.md)

This document tracks all meaningful architectural, engineering, and product decisions made during the development of **MoneyControlr**.

---

## ADR 0001: Initial Project Audit & Architectural Baseline
- **Date**: 2026-11-09
- **Status**: Accepted / Baseline

### 1. What was audited & changed
- Performed an initial environment and filesystem audit on the workspace root (`c:\Users\ippvl\OneDrive\Documents\Desktop\moneycontroller`).
- Discovered that the workspace is currently an empty directory with Node.js (`v24.13.0`), npm (`11.8.0`), and git (`2.50.1.windows.1`) pre-installed.
- Initialized this architectural decision log (`decisions.md`) to establish project governance before writing any code or installing dependencies.

### 2. Why this approach was chosen
- Auditing the environment before installing dependencies prevents version conflicts, inadvertent overwrites, and ensures clean greenfield scaffolding.
- Establishing an immutable decision log upfront guarantees transparency, helps teach software engineering principles step-by-step, and maintains traceability for all future architectural decisions.

### 3. Technology stack selection & alternatives considered
- **Framework: Next.js (App Router) + TypeScript**
  - *Alternatives considered*: Vite + React SPA, Remix/React Router v7, Astro.
  - *Why selected*: Next.js App Router provides built-in server-side rendering, React Server Components (RSC) for secure database queries without exposing API secrets, Next.js Route Handlers for robust backend validation, and zero-configuration Vercel deployment.
- **Styling: Tailwind CSS**
  - *Alternatives considered*: Plain CSS/Sass, CSS Modules, Styled Components, Chakra UI.
  - *Why selected*: Utility-first styling enables rapid development of a custom design system matching the strict palette (`#145C43`, `#EAF4EE`, `#FFFFFF`, `#252D29`) without runtime CSS overhead or bloated third-party component themes.
- **Backend & Database: Supabase (PostgreSQL + Supabase Auth)**
  - *Alternatives considered*: Custom Express/Node server + Prisma + standalone Postgres, Firebase, MongoDB.
  - *Why selected*: PostgreSQL offers enterprise-grade ACID transactions, strict numeric types (`numeric(12,2)`) critical for financial precision (avoiding floating-point rounding errors), native Row-Level Security (RLS) for multi-tenant data isolation, and integrated authentication.
  - *Simplification*: No external auth libraries (e.g., Better Auth) or secondary backend servers (Fly.io) will be introduced, adhering strictly to the minimal surface area principle.

### 4. Important trade-offs & limitations
- **Greenfield setup**: Scaffolding from an empty directory requires setting up Next.js, TypeScript, Tailwind CSS, ESLint, and Supabase client libraries from scratch in Milestone 01.
- **Package Manager**: npm will be used as the package manager because `pnpm` is not installed on the system path, avoiding extra prerequisite setup steps for the user.
- **Strict Separation of Concerns**: We will establish explicit boundaries between UI components, server actions/route handlers, calculation libraries, and Supabase clients from day one.



---

## ADR 0002: Project Foundation, Design System & Financial Calculation Engine
- **Date**: 2026-11-09
- **Status**: Accepted / Implemented

### 1. What was changed
- Scaffolding: Initialized Next.js 15+ App Router, TypeScript (`tsconfig.json`), and Tailwind CSS (`tailwind.config.ts`, `postcss.config.mjs`).
- Design System: Configured the official palette in Tailwind:
  - Primary: `#145C43` (Forest Green)
  - Background: `#EAF4EE` (Mint Mist)
  - Surface: `#FFFFFF` (Card White)
  - Text: `#252D29` (Deep Charcoal)
- Reusable UI Components: Built `Button`, `Card`, `Input`, `Badge` in `src/components/ui/`.
- Supabase SSR Integration: Created `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/middleware.ts`, and `src/middleware.ts` supporting Next.js 15 async cookies and automatic JWT session refreshing.
- Database Schema Typing: Added TypeScript types (`src/types/database.types.ts`) for `profiles`, `budgets`, `categories`, and `transactions`.
- Financial Calculation Engine: Implemented `src/lib/calculations/finance.ts` using integer paise conversion (`toPaise`, `toRupees`) and dynamic daily limit balancing (`remainingBudget / remainingDays`).
- Automated Tests: Built test runner (`tests/finance.test.ts`) covering 14 assertions on precision, allowance calculations, rollover, and overspending guards (100% passing).
- Clean Home Page: Scaffolded `src/app/page.tsx` displaying the design system tokens, responsive mobile/desktop layout, and financial preview cards.

### 2. Why this approach was chosen
- Eliminates floating-point calculation bugs at the architecture level by converting all financial arithmetic into integer paise (`1 INR = 100 paise`).
- The dynamic daily allowance formula (`remainingMonthlyBudget / remainingDays`) automatically rolls over unspent money without complex database triggers: if a student spends less today, their daily limit for the remainder of the month automatically increases. If they overspend, it decreases to prevent running out of money.
- Built-in UI components ensure zero stylistic fragmentation across screens.
- Server/client Supabase separation prevents leaking secret credentials to the client browser while supporting SSR session hydration.

### 3. Why these libraries & methods were selected over alternatives
- `@supabase/ssr` was chosen over the legacy `@supabase/auth-helpers-nextjs` because `@supabase/ssr` is the official modern standard for Next.js App Router cookie handling.
- `lucide-react` was selected for icons because of its clean aesthetic, lightweight footprint, and tree-shakeable SVG exports.
- `clsx` + `tailwind-merge` (`cn()` helper) ensures tailwind class precedence without string concatenation collisions.
- Native Node 24 type stripping was selected for unit testing to avoid heavy Jest/Vitest setup overhead in the initial milestone.

### 4. Important trade-offs & limitations
- Supabase credentials in `.env.local` are currently configured with development placeholders; in Milestone 02, the user can plug in their live Supabase project URL and anon key to begin live database interactions.


---

## ADR 0003: Authentication Architecture, Database Schema & Screen 01 Onboarding
- **Date**: 2026-11-09
- **Status**: Accepted / Implemented

### 1. What was changed
- Database Schema & Migration: Created `supabase/migrations/20261109000000_init_schema.sql` defining:
  - `profiles`: user profile metadata linked to `auth.users` on cascade delete.
  - `budgets`: financial baseline with `numeric(12,2)` monthly allowance, budget period dates, and percentage splits (needs/wants/savings).
  - `categories`: system and custom transaction categories with icons, colors, and type checks.
  - `transactions`: immutable transaction records with category foreign keys, numeric amounts, payment source, and date indexing.
  - Row Level Security (RLS): enabled on all 4 tables with strict `auth.uid()` checks preventing any multi-tenant data leakage.
  - Automatic Profile Trigger: PostgreSQL trigger `on_auth_user_created` executing `handle_new_user()` to initialize user profiles immediately upon signup.
- Authentication Workflows:
  - Built Server Actions in `src/app/(auth)/actions.ts` for `login`, `signup`, `logout`, and `saveOnboardingBudget`.
  - Built `/login` with email/password authentication, error alerts, and redirect links.
  - Built `/signup` with client/server validation and name capture.
- Screen 01 (Onboarding):
  - Built `src/app/(auth)/onboarding/page.tsx` allowing new users to set their monthly allowance (e.g. ₹30,000).
  - Dynamic real-time preview showing safe daily limit (`allowance / days_in_month`), and automatic 50/30/20 breakdown for Needs, Wants, and Savings.
  - Interactive source selector (Parental allowance, Salary, Scholarship, Part-time, Freelance, Other).
  - Skip option pointing to `/dashboard`.
- Protected Routes:
  - Configured `src/middleware.ts` to redirect unauthenticated requests for protected routes (`/dashboard`, `/transactions`, `/budgets`, `/onboarding`) to `/login`.

### 2. Why this approach was chosen
- Server Actions provide native Next.js form handling with `useActionState`, progressive enhancement, and zero exposure of client-side secrets.
- Live client-side calculation during onboarding gives college students immediate positive feedback and financial clarity before even saving to the database.
- Database triggers for profile creation ensure database consistency even if external auth providers or email confirmations are used in the future.

### 3. Important trade-offs & limitations
- Supabase requires users to run the SQL migration script once in their Supabase project dashboard (SQL Editor) to create the PostgreSQL tables and RLS policies.


---

## ADR 0004: Responsive Multi-Column Desktop Layout System & Navbar
- **Date**: 2026-11-09
- **Status**: Accepted / Implemented

### 1. What was changed
- Responsive Full-Width Top Navbar: Created `src/components/layout/navbar.tsx` providing desktop navigation links (`Dashboard`, `Transactions`, `Budget Setup`), action buttons (`Log In`, `Get Started`), and a responsive mobile drawer menu.
- Two-Column Split Layout for Authentication:
  - Redesigned `src/app/(auth)/signup/page.tsx` and `src/app/(auth)/login/page.tsx` with a dual-column layout on large screens (`grid lg:grid-cols-12`).
  - Left Column (Desktop): Full-height forest-green (`#145C43`) branded showcase with value propositions, student checkpoints, and interactive live calculation previews.
  - Right Column (Desktop & Mobile): Well-proportioned form container filling desktop viewports comfortably while remaining fully touch-friendly on mobile phones.
- Wide Responsive Layout for Screen 01 (Onboarding):
  - Updated `src/app/(auth)/onboarding/page.tsx` to a 2-column desktop grid (`max-w-6xl grid lg:grid-cols-12`).
  - Left Column: Form inputs for Monthly Allowance, primary money source selection, and 50/30/20 preferences.
  - Right Column: Sticky live financial projection card recalculating daily limits and category splits in real-time as the student types.
- Landing Page Redesign: Upgraded `src/app/page.tsx` to a multi-column desktop layout with hero headline, interactive dashboard card preview, and 3-column feature grid.
- Offline/Development Fallback: Enhanced `src/app/(auth)/actions.ts` to detect placeholder Supabase URLs and gracefully allow interface exploration in development without displaying red `fetch failed` network errors.

### 2. Why this approach was chosen
- Eliminates the "mobile-first trapped on desktop" anti-pattern where desktop users see a tiny 400px box in an ocean of empty background.
- Follows the design pattern of world-class fintech products (Stripe, Revolut, Linear).
- Establishing the multi-column desktop foundation now ensures that upcoming screens (Dashboard, Transactions feed) natively use desktop grid space effectively.


---

## ADR 0005: Milestone 03 — Transaction Management & Screens 03 and 04
- **Date**: 2026-11-09
- **Status**: Accepted / Implemented

### 1. What was changed
- Server Actions for Transaction CRUD: Built `src/app/transactions/actions.ts`:
  - `createTransaction`: Validates amounts (`amount > 0`), category foreign keys, transaction dates, and inserts with user ownership.
  - `updateTransaction`: Permits updating transaction details while enforcing `user_id = auth.uid()` Row Level Security.
  - `deleteTransaction`: Deletes a transaction owned by the user and revalidates cache.
  - `getCategories`: Fetches all categories ordered by name.
  - `getTransactions`: Retrieves the user's transactions with joined category relations.
- Screen 03 (Add Transaction):
  - Built `src/app/transactions/new/page.tsx` with dynamic category selection, payment method pills (UPI, Cash, Card, NetBanking), date selection, and live spending limit impact tips.
- Screen 04 (Transactions History):
  - Built `src/app/transactions/page.tsx` and `src/components/transactions/transactions-view.tsx`.
  - Date-based grouping (Today, Yesterday, Date) with **Daily Spending Totals** computed per group.
  - Search bar (by note or category name).
  - Multi-filtering: by Type (All, Expense, Income), Category, and Payment source.
  - Summary metric cards: Total Spent (negative in red), Total Income (positive in green), and Net Cashflow.
  - Safe confirmation modal (`DeleteDialog`) before any record deletion.
  - Inline Edit Modal allowing fast modifications without leaving the page.
  - Empty state with direct "+ Add Transaction" button.

### 2. Why this approach was chosen
- Grouping by date with bold daily totals directly answers competitor complaint #4 & #5: students need to see what they spent today at a glance rather than calculating it manually.
- Confirmation dialogs protect against accidental data loss.
- Server-side validation guarantees relational and currency integrity.

---

## ADR 0006: Milestone 04 — Dashboard & Screen 02 Implementation
- **Date**: 2026-11-09
- **Status**: Accepted / Implemented

### 1. What was changed
- Dashboard Server Action: Created `src/app/dashboard/actions.ts`:
  - `getDashboardData`: Authenticates user session, pulls profile data, reads the active monthly budget, calculates dynamic budget periods, fetches all transactions within the billing cycle, and executes the core financial calculation engine (`calculateFinancialSummary`).
  - Aggregates category spending towards 50/30/20 rule (Needs, Wants, Savings).
- Screen 02 Components:
  - Flagship Spending Meter (`src/components/dashboard/spending-hero.tsx`): Displays today's safe-to-spend limit, real-time spent vs. remaining progress bar, rollover amount badge, and status warnings (On Track, Caution, Overspent).
  - Monthly Metric Cards (`src/components/dashboard/metric-cards.tsx`): 4-card overview presenting Monthly Allowance, Remaining Monthly Budget, Total Spent This Month, and Extra Income.
  - 50/30/20 Budget Allocation Split (`src/components/dashboard/budget-split-card.tsx`): Visualizes Needs (50%), Wants (30%), and Savings (20%) targets against actual spending.
  - Recent Transactions Feed (`src/components/dashboard/recent-activity.tsx`): Shows the latest 5 recorded transactions with category badges, payment methods, and timestamps.
- Screen 02 Entry Page:
  - Implemented `src/app/dashboard/page.tsx` with dynamic server rendering (`force-dynamic`), responsive desktop grid (`max-w-[1440px]`), and an empty-state card guiding first-time users to Onboarding if no budget exists.

### 2. Why this approach was chosen
- The daily self-balancing allowance solves competitor complaint #1 (rigid weekly/monthly limits that don't adapt when a user underspends or overspends on a given day).
- React Server Component architecture ensures zero client-side data leakage of financial aggregates while eliminating loading spinners on initial route visit.

---

## ADR 0007: Milestone 05 — Spending & Budgets Breakdown (Screen 05) & Budget Summary (Screen 06)
- **Date**: 2026-11-10
- **Status**: Accepted / Implemented

### 1. What was changed
- Analytics Calculation Engine (`src/lib/calculations/analytics.ts`):
  - Category Classification: Evaluates category names to deterministically separate essential expenses ("Needs": food, rent, travel, utilities, medicine, education) from discretionary expenses ("Wants": shopping, entertainment, dining out).
  - Category Breakdown Ranking: Aggregates expenditure per category, calculates exact percentage of total spends, average spend per transaction, and transaction frequency.
  - 50/30/20 Rule Deep Dive: Evaluates actual spending against student target percentages (Needs 50%, Wants 30%, Savings 20%), detects overages, and calculates capital preserved in savings.
  - Weekly Spending Velocity: Partitions monthly billing cycles into 4 chronological 7-day windows to identify which week in the month incurred peak spending and tracks daily run-rates.
  - Financial Health Engine: Computes a student Financial Health Score (0–100) based on calendar pacing, wants ratio control, and daily overspending events, while generating actionable personalized student insights.
- Screen 05 (Spending & Budgets Breakdown):
  - Implemented `src/app/budgets/page.tsx` with dynamic server rendering (`force-dynamic`).
  - Built `HealthMeterCard`: Circular SVG progress gauge displaying health score (0-100), rating badge, daily run-rate velocity, and projected end-of-month savings.
  - Built `InsightsBanner`: Context-sensitive student cards offering recommendations (e.g. wants restraint alerts, target savings pacing).
  - Built `CategoryBreakdownCard`: Visual progress bars ranked by total expenditure with category colors, icons, and transaction stats.
  - Built `Rule503020Card`: Comprehensive breakdown cards for Needs, Wants, and Savings with progress bars and remaining allowances.
  - Built `WeeklyVelocityCard`: 4-week bar comparison illustrating chronological money burn across the month.
- Screen 06 (Monthly Budget Summary & Financial Status):
  - Implemented `src/app/budgets/summary/page.tsx`.
  - Master 4-card cashflow overview (Monthly Allowance, Total Spent This Cycle, Remaining Allowance, Projected Savings).
  - Calendar burn pacing analysis comparing percentage of days elapsed versus percentage of budget consumed.
  - Active Allocation Parameters card showcasing baseline preferences and direct link to reconfigure budgets.
- Navigation Upgrade (`src/components/layout/navbar.tsx`):
  - Added direct link to `Budgets & Analytics` (`/budgets`) in desktop navbar and mobile drawer menu.
- Verification & Integrity:
  - Created automated test suite `tests/analytics.test.ts` (100% passing across classification, category ranks, 50/30/20 splits, weekly windows, and health scoring).
  - Configured `package.json` to run both test suites via `npm test`.
  - Verified with `npx tsc --noEmit` (0 errors).

### 2. Why this approach was chosen
- Solves competitor complaint #2 (no category breakdown and lack of visual analytics) and competitor complaint #3 (inability to see whether the user is on track to save their monthly target).
- Pure computational functions in `analytics.ts` allow instant unit testing without database or network mocks.

---

## ADR 0008: Milestone 06 — Data Safety, CSV Export & Production Release
- **Date**: 2026-11-10
- **Status**: Accepted / Production Ready

### 1. What was changed
- CSV Data Export Engine (`src/lib/export/csv.ts`):
  - Conforms to RFC 4180 standard escaping for quotes, commas, and linebreaks (`escapeCSVCell`).
  - Serializes transaction history with structured headers: `Date`, `Type`, `Category`, `Amount (INR)`, `Payment Method`, `Notes`, `Transaction ID`.
  - Implements browser download mechanism (`downloadTransactionsCSV`) using dynamic Blobs with UTF-8 byte order mark (`\uFEFF`) and timestamped filenames (`moneycontrolr_transactions_YYYY-MM-DD.csv`).
- Screen 04 Enhancement (`src/components/transactions/transactions-view.tsx`):
  - Added primary **"Export CSV"** action button in the transactions header alongside transaction count.
  - Dynamically exports currently filtered / searched transactions so students can export specific expense queries (e.g. only Food, or only UPI).
- Application Resilience & Error Boundaries:
  - Created Branded 404 Page (`src/app/not-found.tsx`): Custom forest-green fintech theme guiding lost users back to Dashboard or Homepage.
  - Created Global Error Boundary (`src/app/error.tsx`): Catches unexpected client/server errors gracefully with "Try Again" state reset button without crashing the app.
  - Created Global Loading Skeleton (`src/app/loading.tsx`): Pulsing brand loader with financial calculation indicator for smooth route transitions.
- Testing & Code Quality:
  - Created unit test suite `tests/csv.test.ts` (100% passing across RFC 4180 escaping, formatting, and row serialization).
  - Consolidated `npm test` script to run all 3 test suites (`finance.test.ts`, `analytics.test.ts`, `csv.test.ts`) with 21/21 passing assertions.
  - Verified full TypeScript integrity (`npx tsc --noEmit` passes with 0 errors).

### 2. Why this approach was chosen
- Resolves competitor complaint #5 ("no export feature, students can't download their expense history or share it with parents/accountants").
- Client-side CSV generation creates zero server load or storage overhead and works instantly even under poor network conditions.
- Error boundaries and custom not-found pages provide production-level fault tolerance, preventing raw React stack traces from reaching end users.

---

## ADR 0009: Authentication Hardening, Navigation Auth State & Email Verification Gate
- **Date**: 2026-11-10
- **Status**: Accepted / Implemented

### 1. What was changed
- Navbar Dynamic Authentication State (`src/components/layout/navbar.tsx`):
  - Subscribed to Supabase client auth state using `supabase.auth.onAuthStateChange` and initial cached `getUser()`.
  - When user is authenticated: hides "Log In" and "Get Started" buttons, replaces them with user identity pill and direct "Log Out" action.
  - When user is unauthenticated: renders public "Log In" and "Get Started" buttons.
  - Cleans up listener subscription on unmount to prevent duplicate memory leaks.
- Email Verification Route Handler (`src/app/auth/callback/route.ts`):
  - Created server-side callback endpoint to exchange PKCE `code` or OTP `token_hash` securely into active session cookies.
  - Redirects verified accounts to `/dashboard` or `/onboarding` and routes expired/invalid links to `/verify-email?error=expired_or_invalid_link`.
- Verification-Pending Screen (`src/app/(auth)/verify-email/page.tsx`):
  - Built student guidance screen displaying the registered email.
  - Implemented interactive "Resend Verification Email" button with 60-second cooldown timer.
  - Added "Log Out / Use Different Email" and "Back to Login" actions.
- Server-Side Route Protection (`src/middleware.ts`):
  - Enforced verification check: `Boolean(user && user.email_confirmed_at)`.
  - Unverified users attempting to access `/dashboard`, `/transactions`, `/budgets`, or `/onboarding` are redirected to `/verify-email`.
  - Verified users visiting auth routes are routed to `/dashboard`.
- Server Actions Hardening (`src/app/(auth)/actions.ts`):
  - Added strict email format validation regex.
  - Enforced `user.email_confirmed_at` check on login, rejecting unverified logins even if the password matches.
  - Added `resendVerificationEmail` server action.
- Defense-in-Depth in Data Actions (`dashboard/actions.ts`, `transactions/actions.ts`, `budgets/actions.ts`):
  - Replaced basic `if (!user)` checks with `if (!user || !user.email_confirmed_at) return null;` to protect all financial data reads and mutations.
- Automated Test Suite:
  - Created `tests/auth.test.ts` validating email regex, password minimums, and verification guards (4/4 tests pass).
  - Consolidated into `npm test` (25/25 total passing assertions).

### 2. Why this approach was chosen
- Relying purely on client-side state is unsafe. Server-side middleware and action checks ensure fake/unverified emails cannot touch financial data even through API calls or direct URL navigation.
- Real-time `onAuthStateChange` eliminates authentication flickering and avoids full-page browser reloads.





---

## ADR 0010: Official Branding Assets, Favicons, Public SEO Architecture & Public Marketing Pages
- **Date**: 2026-11-11
- **Status**: Accepted / Implemented

### 1. What was changed
- **Official Logo & Favicon Assets**:
  - Copied the user-supplied MoneyControlr brand mark verbatim to `public/images/moneycontrolr-logo.jpg` (`1024x745`).
  - Extracted only the standalone `MC` monogram emblem (preserving exact geometry, dark slate `#1F2D37` and green `#009C41` tones) onto crisp `#FFFFFF` square surfaces in `public/images/mc-emblem.png` (`256x256`), `src/app/icon.png` (`512x512`), `src/app/apple-icon.png` (`180x180`), and multi-resolution `src/app/favicon.ico` (`16x16`, `32x32`, `48x48`).
  - Omitted `icon.svg` intentionally because no vector source was supplied, avoiding fabricated or distorted logo traces.
- **UI Brand Integration (`BrandEmblem` & `Footer`)**:
  - Built `src/components/layout/brand-logo.tsx` rendering the official `mc-emblem.png` beside sharp HTML `"MoneyControlr"` wordmarks at fixed explicit dimensions (`width`/`height`) to prevent Cumulative Layout Shift (CLS).
  - Updated `src/components/layout/navbar.tsx` (adding flicker-free public links for `Features`, `About`, and `Contact` when unauthenticated/on public routes while preserving existing authenticated links), `src/app/(auth)/login/page.tsx`, `src/app/(auth)/signup/page.tsx`, `src/app/(auth)/onboarding/page.tsx`, and `src/app/(auth)/verify-email/page.tsx` to replace generic wallet placeholder icons with `<BrandEmblem />`.
  - Created `src/components/layout/footer.tsx` and mounted it across public pages (`/` landing page, `/features`, `/about`, `/contact`).
- **Environment-Safe Technical SEO (`NEXT_PUBLIC_SITE_URL`)**:
  - Added `NEXT_PUBLIC_SITE_URL` to `.env.example` (plus commented server-only `RESEND_API_KEY` and `CONTACT_TO_EMAIL` guidance) and `.env.local` (`http://localhost:5000` for development).
  - Created `src/lib/seo/metadata.ts` and `src/lib/seo/structured-data.ts`:
    - Strictly rejects unset, invalid, or `localhost` / loopback URLs (`getProductionSiteUrl()` returns `null`).
    - When no production domain is verified, automatically enforces `noindex, nofollow`, omits canonical/Open Graph localhost URLs, omits Schema.org JSON-LD (`<JsonLd />`), returns empty `src/app/sitemap.ts`, and serves `Disallow: /` in `src/app/robots.ts`.
    - When a valid non-localhost HTTPS domain is configured, dynamically enables indexing on public routes (`/`, `/features`, `/about`, `/contact`, `/login`), emits Schema.org `Organization` + `WebSite` + `WebPage` JSON-LD, populates `sitemap.xml`, and disallows private/authenticated routes in `robots.txt`.
  - Applied `NOINDEX_ROBOTS` explicitly to `/dashboard`, `/transactions`, `/transactions/new`, `/budgets`, `/budgets/summary`, `/signup`, `/onboarding`, and `/verify-email`.
  - Updated `src/middleware.ts` matcher to allow `robots.txt`, `sitemap.xml`, and `.ico` requests through without unnecessary session overhead.
- **Public Pages (`/features`, `/about`, `/contact`)**:
  - Built `src/app/features/page.tsx` documenting only implemented product capabilities (`finance.ts` dynamic daily limit, Onboarding, Transaction CRUD + date-grouped history, 50/30/20 analytics, RFC 4180 CSV export, and Supabase Auth + RLS security).
  - Built `src/app/about/page.tsx` communicating MoneyControlr's student-first philosophy without fabricated team details or testimonials.
  - Built `src/app/contact/page.tsx`, `src/components/contact/contact-form.tsx`, `src/app/contact/actions.ts`, and `src/lib/contact/validation.ts`:
    - Enforces strict server-side input length/format validation, HTML escaping, invisible honeypot + fill-duration anti-spam guards, and in-memory IP rate limiting without persisting PII or inventing fake contact details.
    - Reads `RESEND_API_KEY` and `CONTACT_TO_EMAIL` strictly on the server and honestly reports unconfigured status rather than claiming an email was sent when delivery credentials are absent.
- **Testing & Verification**:
  - Created `tests/seo.test.ts` validating domain guards, canonicals, JSON-LD, sitemap/robots behavior, contact validation, escaping, and spam traps, wired into `npm test`.

### 2. Why this approach was chosen
- Next.js App Router file-based icon conventions (`src/app/favicon.ico`, `icon.png`, `apple-icon.png`) automatically wire all desktop, bookmark, and Apple touch metadata without duplicate `<link>` tags.
- Keeping `NEXT_PUBLIC_SITE_URL` strictly gated on non-localhost origins guarantees preview/development deployments never accidentally leak localhost links or get indexed by search engines prior to custom domain verification.
- Using `Node --experimental-strip-types` for `tests/seo.test.ts` aligns seamlessly with existing unit test suites without adding third-party test frameworks.

### 3. Important trade-offs & limitations
- Production search indexing and `sitemap.xml` / `robots.txt` allowlisting remain intentionally disabled until a live custom domain is configured in Vercel (`NEXT_PUBLIC_SITE_URL`) and Google Search Console verification is completed.
- The Contact form validates inputs immediately in development and safely previews delivery feedback, while live inbox forwarding requires configuring server-only `RESEND_API_KEY` and `CONTACT_TO_EMAIL` environment variables.

---

## ADR 0009: Mobile PWA & Interactive Student Allowance Calculator with Google FAQPage Schema
- **Date**: 2026-11-16
- **Status**: Accepted / Implemented

### 1. What was changed
- **Mobile Progressive Web App (PWA)**:
  - Created `src/app/manifest.ts` adhering to Next.js 15 `MetadataRoute.Manifest` standards:
    - Display mode: `standalone`
    - Brand palette: `background_color: "#EAF4EE"`, `theme_color: "#145C43"`
    - Full icon definitions pointing to `/icon.png` (`512x512`), `/apple-icon.png` (`180x180`), and maskable `/images/mc-emblem.png` (`512x512`).
  - Added `appleWebApp: { capable: true, statusBarStyle: "default", title: "MoneyControlr" }` to `src/app/layout.tsx` metadata for iOS full-screen execution without Safari chrome.
  - Implemented `src/components/layout/pwa-install-banner.tsx` listening to `beforeinstallprompt` on Android Chrome with an "Install App" button, with iOS Safari "Add to Home Screen" instructions and session-based dismissal.
- **Interactive Daily Allowance & 50/30/20 Calculator (`/calculator`)**:
  - Created `src/app/calculator/page.tsx` and `src/components/calculator/allowance-calculator.tsx`:
    - Real-time monthly allowance slider and input (₹1,000 to ₹1,00,000, default ₹15,000).
    - Quick preset buttons for common student scenarios (₹6,000, ₹12,000, ₹18,000, ₹25,000).
    - Dynamic calculation of daily safe spending limit, weekly targets, and weekday vs. weekend pacing strategies (weekday ₹425 vs. weekend ₹675).
    - 50/30/20 student budget breakdown (Needs, Wants, Savings & emergency buffer).
    - High-intent student FAQ accordion explaining daily allowance calculation, overspending rollovers, and free access.
- **SEO & Google Search Snippet Enhancement**:
  - Implemented `buildFaqStructuredData` in `src/lib/seo/structured-data.ts` generating Schema.org `FAQPage` JSON-LD to unlock expandable question snippets in Google search results.
  - Updated `src/components/seo/json-ld.tsx` to support both automatic page structured data and specialized `data` graphs.
  - Added `/calculator` to `src/app/sitemap.ts` (priority `0.95`) and `src/app/robots.ts` allowlist.
  - Integrated public links to `/calculator` in `src/components/layout/navbar.tsx` and `src/components/layout/footer.tsx`.
- **Integrity & Zero-Regression Verification**:
  - Updated `tests/seo.test.ts` to assert `/calculator` presence in sitemap and test `buildFaqStructuredData` output.
  - Verified 100% test passing across all 5 test suites (`npm test`) and zero compilation errors (`npx tsc --noEmit`).
  - Zero modifications to Supabase database schema, RLS policies, authentication routes, or existing protected screens.

### 2. Why this approach was chosen
- Combining the public calculator with mobile PWA gives MoneyControlr an organic viral loop: prospective students find the calculator via high-intent Google searches (e.g. "student daily allowance calculator", "how to control daily spending"), calculate their daily limit, and are immediately prompted to install the mobile app or start tracking in MoneyControlr.
- Standard Next.js `manifest.ts` requires no heavy external PWA libraries (like `next-pwa`) that often conflict with Next.js 15 Turbopack or App Router server actions.
- Schema.org `FAQPage` markup directly aligns with Google's rich result guidelines for informational finance tools.

