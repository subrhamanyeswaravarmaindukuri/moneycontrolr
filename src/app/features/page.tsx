import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildPublicMetadata } from "@/lib/seo/metadata";
import {
  ArrowRight,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  Download,
  Lock,
  PieChart,
  Receipt,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const PAGE_TITLE = "Features";
const PAGE_DESCRIPTION =
  "Explore implemented MoneyControlr features: dynamic daily safe-to-spend limits, student onboarding, 50/30/20 analytics, CSV exports, and verified Supabase security.";

export const metadata: Metadata = buildPublicMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: "/features",
});

const IMPLEMENTED_FEATURES = [
  {
    icon: TrendingUp,
    badge: "Core Engine",
    title: "Dynamic Daily Safe-to-Spend Limit",
    description:
      "MoneyControlr divides your remaining monthly budget by the remaining days in your billing cycle. Spend less today and your daily allowance increases automatically tomorrow; overspend and it recalibrates so you avoid running short mid-month.",
    highlights: [
      "Integer-paise arithmetic (1 INR = 100 paise) prevents rounding drift",
      "Real-time progress bar with On Track, Caution, and Overspent status cues",
      "Transparent rollover calculation updated on every logged transaction",
    ],
  },
  {
    icon: SlidersHorizontal,
    badge: "Screen 01",
    title: "Guided Student Budget Onboarding",
    description:
      "Set up your monthly baseline in under two minutes by entering your allowance and selecting your primary income source—parental allowance, salary, scholarship, part-time work, freelance income, or other.",
    highlights: [
      "Live preview of daily allowance while adjusting your monthly figure",
      "Automatic 50/30/20 Needs, Wants, and Savings allocation baseline",
      "Flexible start and end controls accessible anytime from Budget Setup",
    ],
  },
  {
    icon: Receipt,
    badge: "Screens 03 & 04",
    title: "Fast Expense & Income Tracking",
    description:
      "Log daily transactions with category tags and payment methods (UPI, Cash, Card, NetBanking). Browse your history grouped chronologically by date with daily spend totals computed upfront.",
    highlights: [
      "Search across notes and categories plus filter by Type, Category, and Payment method",
      "Inline modal editing and delete confirmation dialogs to prevent accidental loss",
      "Separate tracking for extra monthly income alongside your base allowance",
    ],
  },
  {
    icon: PieChart,
    badge: "Screens 05 & 06",
    title: "50/30/20 Rule & Spending Analytics",
    description:
      "Move beyond raw transaction lists with dedicated spending breakdowns, calendar pacing checks, and weekly burn-rate tracking calibrated for monthly allowances.",
    highlights: [
      "Student Financial Health Score (0–100) with actionable pacing insights",
      "Ranked category breakdown showing share of spend, average ticket, and count",
      "4-week spending velocity bars and Monthly Budget Summary runway overview",
    ],
  },
  {
    icon: Download,
    badge: "Portability",
    title: "One-Click RFC 4180 CSV Export",
    description:
      "Download your transaction records anytime directly from the Transactions page as a cleanly formatted CSV spreadsheet with UTF-8 encoding.",
    highlights: [
      "Exports either your full history or only your currently filtered search view",
      "Standard CSV escaping for notes containing commas, quotes, or line breaks",
      "Client-side generation so your financial file never touches third-party storage",
    ],
  },
  {
    icon: ShieldCheck,
    badge: "Security",
    title: "Verified Accounts & Row-Level Isolation",
    description:
      "Built on Supabase Auth and PostgreSQL Row-Level Security (RLS) so financial records belong strictly to your verified account.",
    highlights: [
      "Mandatory email verification gate before accessing Dashboard, Budgets, or Transactions",
      "Database-enforced RLS policies isolating profiles, budgets, and transactions per user",
      "Server-validated actions and protected routes with automatic session verification",
    ],
  },
];

const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "Verify & Set Allowance",
    detail:
      "Confirm your email address and enter your monthly budget in Onboarding to establish your starting safe daily limit.",
    icon: CalendarClock,
  },
  {
    step: "02",
    title: "Log Daily Spending",
    detail:
      "Record UPI, cash, card, or net-banking expenses in seconds and see your remaining allowance adjust right away.",
    icon: BarChart3,
  },
  {
    step: "03",
    title: "Review & Export",
    detail:
      "Inspect your 50/30/20 split, spot high-spend weeks early, and export clean CSV summaries whenever you need them.",
    icon: Lock,
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <JsonLd
        pageTitle={`${PAGE_TITLE} | MoneyControlr`}
        pageDescription={PAGE_DESCRIPTION}
        pagePath="/features"
      />
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="py-14 sm:py-20 px-4 sm:px-8 lg:px-12 xl:px-16 border-b border-border/60 bg-surface">
          <div className="max-w-5xl mx-auto text-center space-y-5">
            <Badge variant="primary" className="gap-1.5 px-3 py-1">
              <Sparkles className="w-3.5 h-3.5" />
              Implemented Product Capabilities
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-apptext tracking-tight leading-tight">
              Every tool you need to control daily spending without guesswork.
            </h1>
            <p className="text-base sm:text-lg text-apptext-muted max-w-2xl mx-auto leading-relaxed">
              MoneyControlr turns a fixed monthly allowance into a clear daily number, backed by
              clean analytics, instant search, CSV portability, and server-verified security.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center h-12 px-7 text-sm sm:text-base font-medium rounded-btn bg-primary text-white hover:bg-primary-hover shadow-sm transition-colors gap-2"
              >
                Create Free Account
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center h-12 px-6 text-sm sm:text-base font-medium rounded-btn border border-border bg-surface text-apptext hover:bg-background transition-colors"
              >
                Read Our Student Vision
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-14 sm:py-20 px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="max-w-2xl space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-apptext tracking-tight">
                What is live in MoneyControlr today
              </h2>
              <p className="text-sm sm:text-base text-apptext-muted">
                Every capability below is actively implemented and running in the application.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {IMPLEMENTED_FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.title} className="flex flex-col justify-between h-full">
                    <div className="space-y-4">
                      <CardHeader className="p-0 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="w-11 h-11 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">
                            <Icon className="w-5 h-5" />
                          </div>
                          <Badge variant="neutral" size="sm">
                            {feature.badge}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                      </CardHeader>

                      <CardContent className="p-0 space-y-4">
                        <p className="text-sm text-apptext-muted leading-relaxed">
                          {feature.description}
                        </p>
                        <ul className="space-y-2 pt-2 border-t border-border/60">
                          {feature.highlights.map((item) => (
                            <li
                              key={item}
                              className="flex items-start gap-2 text-xs sm:text-sm text-apptext"
                            >
                              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* How it works strip */}
        <section className="py-14 sm:py-16 px-4 sm:px-8 lg:px-12 xl:px-16 bg-surface border-y border-border/60">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-apptext tracking-tight">
                A simple rhythm built for monthly cashflow
              </h2>
              <p className="text-sm sm:text-base text-apptext-muted">
                Three lightweight steps keep your daily spending aligned with the end of the month.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {WORKFLOW_STEPS.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.step}
                    className="rounded-card border border-border bg-background/60 p-6 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-primary">
                        Step {item.step}
                      </span>
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-apptext">{item.title}</h3>
                    <p className="text-sm text-apptext-muted leading-relaxed">{item.detail}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-14 px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="max-w-4xl mx-auto rounded-card bg-primary text-white p-8 sm:p-10 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">
                Ready to see today&apos;s safe spending limit?
              </h2>
              <p className="text-sm text-white/80 max-w-xl">
                Start tracking your monthly budget with verified email security and instant daily
                recalculation.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center h-11 px-5 text-sm font-semibold rounded-btn bg-surface text-primary hover:bg-primary-light transition-colors gap-2"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center h-11 px-5 text-sm font-medium rounded-btn border border-white/30 text-white hover:bg-white/10 transition-colors"
              >
                Ask a Question
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

