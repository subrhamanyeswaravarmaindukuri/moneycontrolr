import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { buildPublicMetadata } from "@/lib/seo/metadata";
import { buildFaqStructuredData, type FaqItem } from "@/lib/seo/structured-data";
import { AllowanceCalculator } from "@/components/calculator/allowance-calculator";
import {
  ArrowRight,
  Calculator as CalcIcon,
  CheckCircle2,
  ChevronDown,
  HelpCircle,
  PiggyBank,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";

const PAGE_TITLE = "Student Daily Allowance Calculator – MoneyControlr";
const PAGE_DESCRIPTION =
  "Calculate your daily safe-to-spend limit, plan your 50/30/20 college budget, and keep your monthly allowance from vanishing before month-end.";

export const metadata: Metadata = buildPublicMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: "/calculator",
  useAbsoluteTitle: true,
});

const FAQ_ITEMS: readonly FaqItem[] = [
  {
    question: "How is the daily safe-to-spend allowance calculated?",
    answer:
      "MoneyControlr divides your total monthly allowance (or remaining balance) by the exact number of days left in your billing cycle. For example, if you have ₹15,000 for a 30-day month, your starting safe limit is ₹500 per day. As you log daily expenses, MoneyControlr dynamically recalculates your remaining safe allowance for every future day.",
  },
  {
    question: "What is the 50/30/20 budget rule for college students?",
    answer:
      "The 50/30/20 rule is an intuitive budgeting framework: 50% of your allowance goes toward Needs (hostel mess, canteen food, books, commuting, mobile recharge), 30% goes toward Wants (hangouts with friends, café visits, movies, streaming subscriptions), and 20% is set aside for Savings or emergency buffers.",
  },
  {
    question: "What happens if I overspend on one day in MoneyControlr?",
    answer:
      "MoneyControlr never locks your account or shames you. Instead, it transparently rolls over the deficit across your remaining days. If your safe limit is ₹500 and you spend ₹700 today, your daily limit for the remaining days gently drops to keep your total monthly budget strictly on track.",
  },
  {
    question: "Is the MoneyControlr daily allowance calculator free?",
    answer:
      "Yes. The daily allowance calculator and the full MoneyControlr platform are completely free for students. You can calculate your numbers anytime without creating an account, or sign up to track your daily expenses in real time.",
  },
  {
    question: "Can I install MoneyControlr on my Android phone or iPhone?",
    answer:
      "Yes! MoneyControlr is a modern Progressive Web App (PWA). On Android, tap the 'Install App' banner or choose 'Add to Home Screen' in Chrome. On iPhone, tap the Share icon in Safari and select 'Add to Home Screen'. It opens instantly in full screen just like a native mobile app.",
  },
  {
    question: "How does MoneyControlr protect my financial data?",
    answer:
      "MoneyControlr runs on Supabase with strict Row Level Security (RLS) policies at the database engine level. Every financial row is cryptographically isolated to your verified account. We do not sell user data, and your calculations are performed with exact integer-paise arithmetic to eliminate floating-point errors.",
  },
];

export default function CalculatorPage() {
  const structuredData = buildFaqStructuredData({
    pageTitle: `${PAGE_TITLE} | MoneyControlr`,
    pageDescription: PAGE_DESCRIPTION,
    pagePath: "/calculator",
    faqs: FAQ_ITEMS,
  });

  return (
    <div className="min-h-screen flex flex-col bg-background text-apptext">
      {structuredData && <JsonLd data={structuredData} />}
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-12 sm:py-16 md:py-20 px-4 sm:px-8 lg:px-12 xl:px-16 border-b border-border bg-gradient-to-b from-primary-light/40 to-background">
          <div className="max-w-5xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-primary/20 text-primary text-xs font-bold tracking-wide shadow-xs">
              <CalcIcon className="w-3.5 h-3.5" />
              Interactive Student Tool
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-apptext tracking-tight">
              Student Daily Allowance &amp; Budget Calculator
            </h1>

            <p className="text-base sm:text-lg text-apptext-muted max-w-2xl mx-auto leading-relaxed">
              Find out exactly how much you can spend every day so your pocket money lasts all month.
              Test different monthly amounts and see your 50/30/20 college breakdown in seconds.
            </p>
          </div>
        </section>

        {/* Interactive Calculator Section */}
        <section className="py-10 sm:py-14 px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="max-w-5xl mx-auto">
            <AllowanceCalculator />
          </div>
        </section>

        {/* Educational Content: Why Daily Limit Beats Monthly Lump Sum */}
        <section className="py-14 px-4 sm:px-8 lg:px-12 xl:px-16 border-t border-border bg-surface/50">
          <div className="max-w-5xl mx-auto space-y-10">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                The College Spending Dilemma
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-apptext">
                Why Standard Monthly Budgets Fail Students
              </h2>
              <p className="text-sm text-apptext-muted">
                Understanding the &quot;Day 1 Illusion&quot; is the key to mastering your money.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card variant="flat" className="p-6 bg-surface border-border shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-card bg-amber-500/10 flex items-center justify-center text-amber-600 font-black">
                  1
                </div>
                <h3 className="text-base font-bold text-apptext">The Day 1 Rich Illusion</h3>
                <p className="text-xs text-apptext-muted leading-relaxed">
                  When pocket money hits your account on the 1st of the month, ₹15,000 feels like an endless fortune. You order premium food and treat friends—burning 40% of your funds in the first 7 days.
                </p>
              </Card>

              <Card variant="flat" className="p-6 bg-surface border-border shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-card bg-red-500/10 flex items-center justify-center text-red-600 font-black">
                  2
                </div>
                <h3 className="text-base font-bold text-apptext">The Month-End Crisis</h3>
                <p className="text-xs text-apptext-muted leading-relaxed">
                  By the 22nd, you are down to ₹800 with 8 days to go. You are forced to borrow from friends, skip social plans, or eat instant noodles while waiting for next month&apos;s transfer.
                </p>
              </Card>

              <Card variant="flat" className="p-6 bg-surface border-border shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-card bg-primary/10 flex items-center justify-center text-primary font-black">
                  3
                </div>
                <h3 className="text-base font-bold text-apptext">The Daily Limit Solution</h3>
                <p className="text-xs text-apptext-muted leading-relaxed">
                  By translating ₹15,000 into a daily target of ₹500, your brain has a crystal-clear boundary for every single day. If you spend ₹350 today, you save ₹150 and tomorrow automatically gets ₹650!
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Comprehensive FAQ Section with Rich Schema.org markup */}
        <section className="py-14 px-4 sm:px-8 lg:px-12 xl:px-16 border-t border-border">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-light text-primary text-xs font-bold">
                <HelpCircle className="w-3.5 h-3.5" />
                Frequently Asked Questions
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-apptext">
                Got Questions About Student Budgeting?
              </h2>
              <p className="text-sm text-apptext-muted">
                Here is everything you need to know about calculating and controlling your daily allowance.
              </p>
            </div>

            <div className="space-y-4">
              {FAQ_ITEMS.map((item, idx) => (
                <details
                  key={idx}
                  className="group rounded-card border border-border bg-surface p-5 open:bg-surface open:shadow-xs transition-all cursor-pointer"
                >
                  <summary className="flex items-center justify-between font-bold text-sm sm:text-base text-apptext list-none select-none">
                    <span>{item.question}</span>
                    <ChevronDown className="w-4 h-4 text-apptext-muted transition-transform group-open:rotate-180 shrink-0 ml-3" />
                  </summary>
                  <p className="mt-3 text-xs sm:text-sm text-apptext-muted leading-relaxed pt-2 border-t border-border/50">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-14 px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="max-w-4xl mx-auto rounded-card bg-primary text-white p-8 sm:p-10 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">
                Ready to take control of your daily allowance?
              </h2>
              <p className="text-sm text-white/80 max-w-xl">
                Set up your student budget in 2 minutes. Install MoneyControlr on your phone for instant 1-tap tracking.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center h-11 px-5 text-sm font-semibold rounded-btn bg-surface text-primary hover:bg-primary-light transition-colors gap-2"
              >
                Start Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/features"
                className="inline-flex items-center justify-center h-11 px-5 text-sm font-medium rounded-btn border border-white/30 text-white hover:bg-white/10 transition-colors"
              >
                See All Features
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
