# MoneyControlr

> **Know your money. Control your day.**  
> A smart daily allowance and financial discipline engine built for students and young adults.

[![Production](https://img.shields.io/badge/Production-moneycontrolr.site-145C43?style=flat-square)](https://moneycontrolr.site)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.3-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20Postgres%20RLS-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![Resend](https://img.shields.io/badge/Resend-Custom%20SMTP-000000?style=flat-square&logo=resend)](https://resend.com)

---

## The Problem

Most students receive their allowance or stipend as a lump sum once a month (e.g., ₹15,000 or ₹30,000). Without daily pacing, discretionary spending spikes in the first 10 days, leaving students stressed and overspent before month-end.

## The Solution: Dynamic Daily Rollover

MoneyControlr turns your monthly budget into an adaptive daily spending guide:
- **Automatic Daily Allowance:** `Monthly Budget ÷ Days in Cycle` gives your baseline safe daily limit.
- **Dynamic Rollover:** Save money today? It automatically rolls forward, boosting your daily limit across remaining days.
- **Self-Balancing Protection:** Overspend today? The system dynamically adjusts tomorrow's limit downwards to safeguard your savings target.
- **50 / 30 / 20 Student Framework:** Tracks your essentials (Needs 50%), personal treats (Wants 30%), and emergency fund (Savings 20%).

---

## Key Features

1. **Live Spending Hero & Metric Dashboard (`/dashboard`)**
   - Real-time **Safe-to-Spend Today** card.
   - Live cycle burn-rate, days remaining, and dynamic rollover calculations.
   - 50/30/20 target progress and recent activity stream.

2. **Fast Transaction Entry (`/transactions/new`)**
   - Record expenses and income in seconds.
   - Supports UPI, Cash, Debit Card, and Net Banking.
   - Instant re-calculation across all financial views.

3. **In-Depth Financial Analytics (`/budgets` & `/budgets/summary`)**
   - **Financial Health Scorecard:** 0–100 discipline rating based on spending velocity and pacing.
   - Category breakdowns with Needs vs. Wants classification.
   - Weekly velocity comparisons (Week 1 through Week 4+).
   - Comprehensive monthly financial statements.

4. **Hardened Security & Privacy**
   - **Row Level Security (RLS):** Enforced via PostgreSQL with `private.is_email_verified()` so verified users can only access their own records.
   - **Resend Custom SMTP:** Domain-verified (`moneycontrolr.site`) DKIM and SPF email delivery.
   - **Hybrid Auth & Recovery:** PKCE authorization + token-hash email verification + 6- to 8-digit numeric OTP recovery fallback.
   - **Double-Confirmation Email Changes:** Protects accounts by requiring verification from both current and new inboxes.
   - **Anti-Enumeration:** Login and signup flows never leak user account existence.

5. **Financial Precision & Data Portability**
   - **Zero Float Drift:** Every calculation is performed in integer paise (`₹1 = 100 paise`), eliminating IEEE-754 rounding errors.
   - **RFC 4180 CSV Export:** Export complete spending history with spreadsheet formula-injection protection (escapes `=`, `+`, `-`, `@`, tab).

6. **Mobile PWA & Public Student Calculator (`/calculator`)**
   - **Interactive Allowance Calculator:** Test any monthly allowance (₹1,000–₹1,00,000) with live daily safe-to-spend limits, weekly targets, and weekday vs. weekend pacing.
   - **50/30/20 College Framework:** Instant allocation preview for student Needs (50%), Wants (30%), and Savings (20%).
   - **Schema.org FAQPage Rich Snippets:** Structured JSON-LD enabling expandable question-and-answer snippets directly on Google Search results.
   - **Progressive Web App (PWA):** Web App Manifest with standalone full-screen mobile experience and 1-tap "Add to Home Screen" installation on Android and iOS.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router, Server Actions) |
| **UI Library** | React 19, Tailwind CSS, Lucide Icons |
| **Database & Auth** | Supabase (PostgreSQL with RLS, GoTrue Auth) |
| **Email Delivery** | Resend SMTP (Verified Domain: `moneycontrolr.site`) |
| **Deployment** | Vercel Serverless & Edge Network |
| **DNS & Domains** | GoDaddy DNS, Tokyo AWS region (`ap-northeast-1`) |

---

## Getting Started Locally

### Prerequisites
- Node.js 18.18+ or 20+
- npm or pnpm

### 1. Clone the repository
```bash
git clone https://github.com/subrhamanyeswaravarmaindukuri/moneycontrolr.git
cd moneycontrolr
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:5000

# Optional server-only contact form delivery
RESEND_API_KEY=re_your_resend_api_key
CONTACT_FROM_EMAIL=no-reply@moneycontrolr.site
CONTACT_TO_EMAIL=your-email@gmail.com
```

### 4. Run database migrations
Execute the SQL files located in `supabase/migrations/` inside your Supabase SQL Editor:
1. `supabase/migrations/20261109000000_init_schema.sql`
2. `supabase/migrations/20261111000000_security_and_integrity_hardening.sql`

### 5. Start the development server
```bash
npm run dev
```
Open [http://localhost:5000](http://localhost:5000) in your browser.

---

## Automated Test Suites

Run the 5 comprehensive integrity test suites:
```bash
npm test
```

Included test suites:
- `tests/finance.test.ts` — Integer paise precision, rollover limit, safe-to-spend clamps, date math (20/20 checks).
- `tests/analytics.test.ts` — 50/30/20 categorization, spending velocity, health score engine.
- `tests/csv.test.ts` — RFC 4180 CSV serialization, formula-injection neutralization.
- `tests/auth.test.ts` — Open-redirect prevention, strong password rules, rate limiters, anti-enumeration.
- `tests/seo.test.ts` — Production canonicals, JSON-LD, sitemap, and robots allowlist.

---

## License

Private / Proprietary — MoneyControlr

