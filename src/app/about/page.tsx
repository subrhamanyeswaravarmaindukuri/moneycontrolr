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
  Compass,
  GraduationCap,
  HeartHandshake,
  Lock,
  Scale,
  ShieldCheck,
} from "lucide-react";

const PAGE_TITLE = "About MoneyControlr – Built for Student Finance";
const PAGE_DESCRIPTION =
  "Learn why MoneyControlr was built for college students: turn a monthly allowance into calm daily financial clarity with dynamic limits.";

export const metadata: Metadata = buildPublicMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: "/about",
  useAbsoluteTitle: true,
});

const PRINCIPLES = [
  {
    icon: GraduationCap,
    title: "Built Student-First",
    description:
      "Most expense apps assume corporate salaries or complicated multi-bank syncing. Students typically manage a fixed monthly allowance, stipend, scholarship, or part-time income and simply need to know what is safe to spend today.",
  },
  {
    icon: Scale,
    title: "Dynamic Instead of Rigid",
    description:
      "A static daily cap feels punishing after a small surprise expense and unhelpful after a frugal day. MoneyControlr recalculates remaining funds across remaining calendar days so every decision stays realistic.",
  },
  {
    icon: Lock,
    title: "Private & Account-Isolated",
    description:
      "Your financial habits belong to you. Access to dashboards, budgets, and transactions requires email verification and PostgreSQL Row-Level Security policies tied strictly to your authenticated account.",
  },
  {
    icon: Compass,
    title: "Calm Budgeting Clarity",
    description:
      "No noisy feeds, upsells, or bloated spreadsheets—just focused daily metrics, 50/30/20 Needs-Wants-Savings visibility, weekly pace checks, and clean CSV portability whenever you want offline copies.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <JsonLd
        pageTitle={`${PAGE_TITLE} | MoneyControlr`}
        pageDescription={PAGE_DESCRIPTION}
        pagePath="/about"
      />
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="py-14 sm:py-20 px-4 sm:px-8 lg:px-12 xl:px-16 bg-surface border-b border-border/60">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <Badge variant="primary" className="gap-1.5 px-3 py-1">
                <HeartHandshake className="w-3.5 h-3.5" />
                Why MoneyControlr Exists
              </Badge>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-apptext tracking-tight leading-tight">
                Know your money.
                <span className="block text-primary mt-1">Control your day.</span>
              </h1>
              <p className="text-base sm:text-lg text-apptext-muted leading-relaxed">
                MoneyControlr was designed around one practical problem: getting an allowance on the
                first of the month feels comfortable, yet running low by week three is all too
                common without a clear daily pace.
              </p>
            </div>

            <div className="lg:col-span-5">
              <Card variant="elevated" className="bg-primary text-white border-0 p-6 sm:p-8 space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary-light bg-white/10 px-3 py-1 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Our Philosophy
                </div>
                <p className="text-lg sm:text-xl font-bold leading-snug">
                  &ldquo;When you know today&apos;s safe limit before buying lunch or booking a ride,
                  staying within your month becomes effortless.&rdquo;
                </p>
                <p className="text-xs text-white/75 leading-relaxed">
                  Focused on college students and anyone budgeting daily &amp; monthly cashflow with
                  discipline instead of guesswork.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Core Principles */}
        <section className="py-14 sm:py-20 px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="max-w-2xl space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-apptext tracking-tight">
                Design principles behind every screen
              </h2>
              <p className="text-sm sm:text-base text-apptext-muted">
                Every workflow in MoneyControlr—from Onboarding to Analytics—prioritizes accuracy,
                clarity, and trust.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {PRINCIPLES.map((item) => {
                const Icon = item.icon;
                return (
                  <Card key={item.title} className="h-full">
                    <CardHeader className="p-0 pb-3 flex-row items-center gap-3 space-y-0">
                      <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <p className="text-sm text-apptext-muted leading-relaxed">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Independence & Security Commitment */}
        <section className="py-12 px-4 sm:px-8 lg:px-12 xl:px-16 border-t border-border/80">
          <div className="max-w-5xl mx-auto rounded-card border border-border bg-surface p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary-light text-primary flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-apptext tracking-tight">
                Independent Platform &amp; Privacy Commitment
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-apptext-muted leading-relaxed">
              <strong>MoneyControlr</strong> is an independent personal finance project built specifically for college students managing a monthly allowance. We have <strong>no affiliation, partnership, or connection</strong> with Moneycontrol.com, Network18, or any commercial securities trading platform.
            </p>
            <div className="grid sm:grid-cols-3 gap-3 pt-2 text-xs text-apptext-muted">
              <div className="p-3 rounded-xl bg-background border border-border space-y-1">
                <span className="font-bold text-apptext block">Zero Investment Products</span>
                <span>We do not offer demat accounts, stock tips, mutual funds, or trading services.</span>
              </div>
              <div className="p-3 rounded-xl bg-background border border-border space-y-1">
                <span className="font-bold text-apptext block">100% Manual Tracking</span>
                <span>We never ask for bank accounts, net-banking passwords, or UPI PINs.</span>
              </div>
              <div className="p-3 rounded-xl bg-background border border-border space-y-1">
                <span className="font-bold text-apptext block">Data Protection</span>
                <span>All budget records are strictly isolated via PostgreSQL Row-Level Security.</span>
              </div>
            </div>
          </div>
        </section>

        {/* Precision & Portability Note */}
        <section className="py-14 px-4 sm:px-8 lg:px-12 xl:px-16 bg-surface border-t border-border/60">
          <div className="max-w-5xl mx-auto rounded-card border border-border bg-background/60 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <h2 className="text-xl sm:text-2xl font-bold text-apptext tracking-tight">
                See how every calculation and feature works
              </h2>
              <p className="text-sm text-apptext-muted leading-relaxed">
                Explore the daily safe-to-spend calculator, 50/30/20 analytics, and CSV export
                capabilities or reach out through the Contact page.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                href="/features"
                className="inline-flex items-center justify-center h-11 px-5 text-sm font-semibold rounded-btn bg-primary text-white hover:bg-primary-hover transition-colors gap-2"
              >
                Explore Features
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center h-11 px-5 text-sm font-medium rounded-btn border border-border bg-surface text-apptext hover:bg-background transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

