import Link from "next/link";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { JsonLd } from "@/components/seo/json-ld";
import {
  buildPublicMetadata,
  HOMEPAGE_DESCRIPTION,
  HOMEPAGE_TITLE,
} from "@/lib/seo/metadata";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Calendar,
  Sparkles,
  Coffee,
  Bus,
  CheckCircle2,
  Clock,
  Layers,
  Zap,
  ArrowUpRight,
  Sliders,
  DollarSign,
  Smartphone,
  ChevronRight,
} from "lucide-react";

export const metadata: Metadata = buildPublicMetadata({
  title: HOMEPAGE_TITLE,
  description: HOMEPAGE_DESCRIPTION,
  path: "/",
  useAbsoluteTitle: true,
});

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-primary-light selection:text-primary">
      <JsonLd
        pageTitle={HOMEPAGE_TITLE}
        pageDescription={HOMEPAGE_DESCRIPTION}
        pagePath="/"
      />
      {/* 1. Full-Width Responsive Navbar */}
      <Navbar />

      {/* 2. Hero Section (Wide-Screen Desktop 1440px Container) */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-8 pb-16 sm:pt-14 sm:pb-24 lg:pt-18 lg:pb-28">
          {/* Subtle ambient gradient highlights for depth on wide screens */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary-light/40 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
            <div className="grid lg:grid-cols-12 gap-10 xl:gap-16 items-center">

              {/* LEFT CONTENT COLUMN: Big, Confident Fintech Headline & Actions */}
              <div className="lg:col-span-7 xl:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
                {/* Pill Badge */}
                <div className="inline-flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-primary bg-surface border border-primary/20 px-4 py-2 rounded-full shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Personal Finance Built For College Students
                </div>

                {/* Main Headline */}
                <h1 className="text-4xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight text-apptext leading-[1.12]">
                  Never run out of money{" "}
                  <span className="text-primary underline decoration-primary/20 decoration-8 underline-offset-8">
                    before the month ends.
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-base sm:text-xl text-apptext-muted max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                  MoneyControlr calculates exactly how much you can safely spend today based on your monthly allowance and remaining days. If you spend less today, your future daily limit increases automatically.
                </p>

                {/* CTA Action Buttons: Substantial, Prominent, Desktop-First & Mobile-Optimized */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                  <Link href="/signup" className="w-full sm:w-auto">
                    <Button
                      size="xl"
                      className="w-full sm:w-auto font-bold px-9 text-base shadow-cardHover hover:shadow-lg transition-all"
                    >
                      Get Started Free
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>

                  <Link href="/onboarding" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="xl"
                      className="w-full sm:w-auto font-bold px-8 text-base border-border hover:border-primary/40 transition-all bg-surface"
                    >
                      Try Budget Setup
                    </Button>
                  </Link>
                </div>

                {/* Feature Checkpoints */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-border-subtle text-left">
                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-surface/60 border border-border/50">
                    <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-primary shrink-0 mt-0.5">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-apptext">Daily Safe Limits</h4>
                      <p className="text-[11px] text-apptext-muted">Self-balancing allowance</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-surface/60 border border-border/50">
                    <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-primary shrink-0 mt-0.5">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-apptext">Paise-Precision</h4>
                      <p className="text-[11px] text-apptext-muted">Zero floating-point errors</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-surface/60 border border-border/50">
                    <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-primary shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-apptext">100% Data Privacy</h4>
                      <p className="text-[11px] text-apptext-muted">Row-Level Security (RLS)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Generous, High-Fidelity Interactive Preview Card */}
              <div className="lg:col-span-5 xl:col-span-5 w-full">
                <div className="relative">
                  {/* Decorative glowing card ring behind */}
                  <div className="absolute -inset-1.5 bg-gradient-to-r from-primary to-emerald-600 rounded-3xl blur-lg opacity-20 pointer-events-none" />

                  <Card variant="elevated" className="relative border-border shadow-cardHover overflow-hidden bg-surface">
                    {/* Primary Green Header */}
                    <div className="bg-primary text-white p-6 sm:p-7 rounded-t-card -m-5 sm:-m-6 mb-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                          Today's Spending Limit
                        </span>
                        <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full text-white">
                          Day 1 of 30
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                          {formatCurrency(1000)}
                        </span>
                        <span className="text-sm font-medium text-white/80">/ safe today</span>
                      </div>

                      {/* Spending Progress Bar */}
                      <div className="mt-5 space-y-2">
                        <div className="flex justify-between text-xs text-white/95 font-semibold">
                          <span>Spent Today: {formatCurrency(350)}</span>
                          <span className="text-emerald-200">Safe to spend: {formatCurrency(650)}</span>
                        </div>
                        <div className="w-full h-3 bg-black/25 rounded-full overflow-hidden p-0.5">
                          <div
                            className="h-full bg-white rounded-full transition-all duration-500 shadow-sm"
                            style={{ width: "35%" }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Sub-metrics Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-5 pt-2">
                      <div className="p-4 rounded-xl bg-background border border-border">
                        <span className="text-xs text-apptext-muted font-medium block mb-1">
                          Monthly Allowance
                        </span>
                        <span className="text-lg sm:text-xl font-bold text-apptext">
                          {formatCurrency(30000)}
                        </span>
                      </div>
                      <div className="p-4 rounded-xl bg-primary-light/50 border border-primary/20">
                        <span className="text-xs text-primary font-semibold block mb-1">
                          Remaining Month
                        </span>
                        <span className="text-lg sm:text-xl font-bold text-primary">
                          {formatCurrency(29650)}
                        </span>
                      </div>
                    </div>

                    {/* Recent Transactions List */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-apptext border-b border-border-subtle pb-2">
                        <span>Recent Transactions</span>
                        <span className="text-primary font-semibold">Today</span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border-subtle hover:bg-background transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-primary-light flex items-center justify-center text-primary font-bold">
                              <Coffee className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm font-bold text-apptext">Breakfast & Coffee</p>
                              <p className="text-[11px] text-apptext-muted font-medium">Food & Drink • UPI</p>
                            </div>
                          </div>
                          <span className="text-xs sm:text-sm font-bold text-status-danger">-₹100.00</span>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border-subtle hover:bg-background transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-primary-light flex items-center justify-center text-primary font-bold">
                              <Bus className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm font-bold text-apptext">Campus Metro Recharge</p>
                              <p className="text-[11px] text-apptext-muted font-medium">Travel • UPI</p>
                            </div>
                          </div>
                          <span className="text-xs sm:text-sm font-bold text-status-danger">-₹150.00</span>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border-subtle hover:bg-background transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-primary-light flex items-center justify-center text-primary font-bold">
                              <Coffee className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm font-bold text-apptext">Evening Snacks & Chai</p>
                              <p className="text-[11px] text-apptext-muted font-medium">Food & Drink • Cash</p>
                            </div>
                          </div>
                          <span className="text-xs sm:text-sm font-bold text-status-danger">-₹100.00</span>
                        </div>
                      </div>

                      {/* Bottom Alert Pill */}
                      <div className="p-3 rounded-xl bg-primary-subtle border border-primary/20 flex items-center justify-between text-xs">
                        <span className="text-apptext font-medium">Unspent rollover tomorrow:</span>
                        <span className="font-bold text-primary">+₹650 saved</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 3. Three Pillars Section: Full-Width Multi-Card Feature Grid */}
        <section className="bg-surface border-t border-border py-16 sm:py-24">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-apptext tracking-tight">
                Built specifically to solve student finance problems.
              </h2>
              <p className="text-sm sm:text-base text-apptext-muted max-w-xl mx-auto leading-relaxed">
                No complex stock trading, no crypto nonsense. Just pure, simple, and reliable daily expense control.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <Card variant="flat" className="p-7 sm:p-8 space-y-4 border-border hover:border-primary/50 transition-all hover:shadow-cardHover">
                <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center text-primary">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl font-bold">Dynamic Daily Rollover</CardTitle>
                <CardDescription className="text-sm leading-relaxed text-apptext-muted">
                  Save ₹300 today? Your daily allowance for the rest of the month automatically recalculates and goes up. Overspend? It gently dials back so you never run out before the 30th.
                </CardDescription>
              </Card>

              <Card variant="flat" className="p-7 sm:p-8 space-y-4 border-border hover:border-primary/50 transition-all hover:shadow-cardHover">
                <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center text-primary">
                  <Zap className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl font-bold">Fast Expense Logging</CardTitle>
                <CardDescription className="text-sm leading-relaxed text-apptext-muted">
                  Log your tea, canteen lunch, or printout bills in 5 seconds. Preset UPI, Cash, and Card tags ensure frictionless entry right when you tap your phone.
                </CardDescription>
              </Card>

              <Card variant="flat" className="p-7 sm:p-8 space-y-4 border-border hover:border-primary/50 transition-all hover:shadow-cardHover">
                <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center text-primary">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl font-bold">Zero Math Drift & Full Privacy</CardTitle>
                <CardDescription className="text-sm leading-relaxed text-apptext-muted">
                  Every financial record is safeguarded by PostgreSQL Row-Level Security. All math runs in integer paise to eliminate floating-point rounding bugs forever.
                </CardDescription>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* 4. Full-Width Footer */}
      <Footer />
    </div>
  );
}
