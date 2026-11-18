import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { buildPublicMetadata } from "@/lib/seo/metadata";
import { buildFaqStructuredData, type FaqItem } from "@/lib/seo/structured-data";
import {
  ArrowRight,
  BookOpen,
  Calculator,
  Calendar,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  HelpCircle,
  PiggyBank,
  QrCode,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";

const PAGE_TITLE = "Student Budgeting Guide & Daily Allowance Handbook – MoneyControlr";
const PAGE_DESCRIPTION =
  "Complete student personal finance guide: learn how college daily allowance management works, how dynamic daily spending limits adapt, how rollover balances deficits, and how to track UPI and cash expenses.";

export const metadata: Metadata = buildPublicMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: "/guide",
  useAbsoluteTitle: true,
});

const GUIDE_FAQS: readonly FaqItem[] = [
  {
    question: "Why do monthly lump-sum budgets fail for college students?",
    answer:
      "Most students receive an allowance, stipend, or pocket money on the 1st of the month. Because a lump sum feels artificially large in week one, students unintentionally overspend on hangouts or impulse buys, leaving them short of money during the last 10 days of the month. Breaking the monthly amount into an adaptive daily spending limit eliminates this boom-and-bust cycle.",
  },
  {
    question: "How does the MoneyControlr daily safe-to-spend limit adapt?",
    answer:
      "MoneyControlr divides your remaining monthly balance by the exact number of days left in your current billing cycle. If you save money on Monday, your daily limit for Tuesday through the end of the month automatically rises. If you overspend on Friday, your future daily limit gently recalibrates downward so your month-end remains protected.",
  },
  {
    question: "How should students track fast UPI payments and small cash spends?",
    answer:
      "Small UPI transactions (chai, snacks, photocopies, rickshaws) add up quickly. MoneyControlr is optimized for rapid logging with high-contrast categories. By logging expenses immediately after paying via UPI apps (Google Pay, PhonePe, Paytm) or cash, your daily progress bar reflects your true remaining limit instantly.",
  },
  {
    question: "What is the 50/30/20 budget framework for students?",
    answer:
      "The 50/30/20 guideline recommends allocating 50% of your allowance to absolute Needs (mess fees, commuting, books, groceries, recharge), 30% to Wants (dining out, streaming, events, shopping), and 20% to Savings or an emergency buffer for unexpected college expenses.",
  },
  {
    question: "How does MoneyControlr handle fixed recurring commitments like rent or mess fees?",
    answer:
      "MoneyControlr's Recurring Bills Manager allows you to reserve fixed monthly obligations before calculating your daily limit. This ensures your rent or mess payment is never accidentally spent on daily discretionary expenses.",
  },
];

export default function GuidePage() {
  const structuredData = buildFaqStructuredData({
    pageTitle: PAGE_TITLE,
    pageDescription: PAGE_DESCRIPTION,
    pagePath: "/guide",
    faqs: GUIDE_FAQS,
  });

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-primary-light selection:text-primary">
      {structuredData && <JsonLd data={structuredData} />}
      <Navbar />

      <main className="flex-1">
        {/* Header Hero */}
        <section className="relative overflow-hidden pt-8 pb-14 sm:pt-14 sm:pb-20 border-b border-border/80">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
            <div className="max-w-3xl space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-primary/20 text-primary text-xs font-bold tracking-wide shadow-xs">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Student Financial Education &amp; Best Practices</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-apptext leading-tight">
                The College Student Guide to Daily Allowance &amp; Expense Control
              </h1>

              <p className="text-base sm:text-lg text-apptext-muted leading-relaxed">
                Everything you need to know about managing college allowances, preventing month-end debt, tracking UPI micro-spends, and using self-balancing daily limits to stay financially independent.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href="/calculator">
                  <Button size="md" className="font-bold gap-2">
                    <Calculator className="w-4 h-4" />
                    Calculate Your Daily Limit
                  </Button>
                </Link>
                <Link href="/features">
                  <Button variant="outline" size="md" className="font-semibold">
                    Explore Platform Features
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* In-Depth Guide Content */}
        <section className="py-12 sm:py-16 px-4 sm:px-8 lg:px-12 xl:px-16 max-w-[1440px] mx-auto">
          <div className="grid lg:grid-cols-12 gap-10">
            {/* Table of Contents / Sidebar */}
            <aside className="lg:col-span-4 space-y-6">
              <div className="sticky top-24 space-y-6">
                <Card variant="flat" className="p-5 bg-surface border-border shadow-xs space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-apptext-muted">
                    Guide Chapters
                  </h3>
                  <nav className="space-y-1 text-xs sm:text-sm font-semibold">
                    <a href="#managing-allowance" className="block py-1.5 text-apptext hover:text-primary transition-colors">
                      1. Managing a College Daily Allowance
                    </a>
                    <a href="#how-daily-limits-work" className="block py-1.5 text-apptext hover:text-primary transition-colors">
                      2. How Daily Spending Limits Work
                    </a>
                    <a href="#allowance-rollover" className="block py-1.5 text-apptext hover:text-primary transition-colors">
                      3. How Allowance Rollover Works
                    </a>
                    <a href="#tracking-upi-cash" className="block py-1.5 text-apptext hover:text-primary transition-colors">
                      4. Tracking UPI &amp; Cash Micro-Spends
                    </a>
                    <a href="#50-30-20-budget" className="block py-1.5 text-apptext hover:text-primary transition-colors">
                      5. The Student 50/30/20 Budgeting Rule
                    </a>
                    <a href="#recurring-bills" className="block py-1.5 text-apptext hover:text-primary transition-colors">
                      6. Fixed Commitments vs. Discretionary Cash
                    </a>
                    <a href="#faqs" className="block py-1.5 text-apptext hover:text-primary transition-colors">
                      7. Frequently Asked Questions
                    </a>
                  </nav>
                </Card>

                {/* Quick Calculator Card */}
                <div className="p-5 rounded-2xl bg-primary text-white shadow-card space-y-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-emerald-200" />
                  </div>
                  <h4 className="text-sm font-bold">Interactive Allowance Tool</h4>
                  <p className="text-xs text-white/80 leading-relaxed">
                    Test your monthly stipend in our free student calculator to see your exact daily limit and 50/30/20 breakdown in seconds.
                  </p>
                  <Link href="/calculator" className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-200 hover:text-white pt-1">
                    <span>Try Allowance Calculator</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </aside>

            {/* Main Guide Articles */}
            <article className="lg:col-span-8 space-y-12">
              {/* Chapter 1 */}
              <section id="managing-allowance" className="space-y-4 scroll-mt-28">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                  <span>Chapter 01</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-apptext">
                  Managing a College Daily Allowance
                </h2>
                <div className="prose text-sm sm:text-base text-apptext-muted leading-relaxed space-y-3">
                  <p>
                    College life is often the first time a young adult manages money independently. Whether receiving ₹6,000, ₹15,000, or ₹25,000 a month from parents, stipends, or part-time work, the traditional method of tracking money involves checking bank account balances periodically.
                  </p>
                  <p>
                    The psychological danger is that a ₹15,000 balance looks like plenty on day 3, leading to overspending on impulse canteen visits, online food orders, or social events. By day 20, funds are depleted, causing stress, skipped meals, or awkward requests for emergency allowances.
                  </p>
                  <p>
                    <strong>The Solution:</strong> Divide your available money by days remaining. When you view your money through the lens of <em className="text-apptext font-semibold">"I have ₹500 today"</em> instead of <em className="text-apptext font-semibold">"I have ₹15,000 in my account"</em>, decision-making becomes immediate, calm, and grounded.
                  </p>
                </div>
              </section>

              {/* Chapter 2 */}
              <section id="how-daily-limits-work" className="space-y-4 scroll-mt-28">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                  <span>Chapter 02</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-apptext">
                  How Daily Spending Limits Work
                </h2>
                <div className="prose text-sm sm:text-base text-apptext-muted leading-relaxed space-y-3">
                  <p>
                    MoneyControlr replaces static budgets with a dynamic algorithm:
                  </p>
                  <div className="p-4 rounded-xl bg-surface border border-border font-mono text-xs sm:text-sm text-apptext font-bold">
                    Safe-to-Spend Limit = (Remaining Discretionary Allowance) ÷ (Remaining Days in Month)
                  </div>
                  <p>
                    Unlike restrictive spreadsheets that penalize you when you spend, MoneyControlr simply answers one question whenever you open the app:
                    <strong className="text-apptext"> How much can I safely spend before midnight without shortening my future days?</strong>
                  </p>
                </div>
              </section>

              {/* Chapter 3 */}
              <section id="allowance-rollover" className="space-y-4 scroll-mt-28">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                  <span>Chapter 03</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-apptext">
                  How Allowance Rollover Works
                </h2>
                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                  <Card variant="flat" className="p-5 bg-surface border-border space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-status-successLight text-status-success flex items-center justify-center font-black">
                      +
                    </div>
                    <h3 className="text-base font-bold text-apptext">Under-Spending (Saving)</h3>
                    <p className="text-xs sm:text-sm text-apptext-muted leading-relaxed">
                      If your limit is ₹500 and you only spend ₹200 on a quiet day studying in the library, the unspent ₹300 isn't lost. It redistributes evenly across all remaining days, naturally elevating your daily allowance for the rest of the month.
                    </p>
                  </Card>

                  <Card variant="flat" className="p-5 bg-surface border-border space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-status-warningLight text-status-warning flex items-center justify-center font-black">
                      −
                    </div>
                    <h3 className="text-base font-bold text-apptext">Overspending (Surprise Costs)</h3>
                    <p className="text-xs sm:text-sm text-apptext-muted leading-relaxed">
                      If your limit is ₹500 but a friend's birthday dinner costs ₹900, you are not penalized or locked out. The ₹400 difference is absorbed smoothly across the remaining days, slightly adjusting future limits so your total budget remains 100% secure.
                    </p>
                  </Card>
                </div>
              </section>

              {/* Chapter 4 */}
              <section id="tracking-upi-cash" className="space-y-4 scroll-mt-28">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                  <span>Chapter 04</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-apptext">
                  Tracking UPI &amp; Cash Micro-Spends in College
                </h2>
                <div className="prose text-sm sm:text-base text-apptext-muted leading-relaxed space-y-3">
                  <p>
                    In modern college campuses, UPI payments happen 5 to 10 times a day:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-sm sm:text-base text-apptext-muted">
                    <li>₹15 for morning chai or coffee</li>
                    <li>₹40 for auto-rickshaw or bus commute</li>
                    <li>₹80 for cafeteria lunch</li>
                    <li>₹20 for printouts or photocopy assignments</li>
                    <li>₹120 for evening snacks with friends</li>
                  </ul>
                  <p>
                    Because each transaction feels small, students often fail to realize they spent ₹300 before evening. MoneyControlr allows you to log an expense in under 5 seconds with pre-built student icons and auto-categorization.
                  </p>
                </div>
              </section>

              {/* Chapter 5 */}
              <section id="50-30-20-budget" className="space-y-4 scroll-mt-28">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                  <span>Chapter 05</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-apptext">
                  The Student 50/30/20 Budgeting Rule
                </h2>
                <div className="grid sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
                    <div className="text-xs font-extrabold uppercase text-primary">50% Needs</div>
                    <p className="text-xs text-apptext-muted">
                      Hostel rent, mess fees, required textbooks, public transit, mobile network recharge, hygiene essentials.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
                    <div className="text-xs font-extrabold uppercase text-amber-500">30% Wants</div>
                    <p className="text-xs text-apptext-muted">
                      Weekend restaurant meals, movies, gaming, subscription streaming, coffee hangouts, fashion.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
                    <div className="text-xs font-extrabold uppercase text-emerald-600">20% Savings</div>
                    <p className="text-xs text-apptext-muted">
                      Emergency safety net, certification exam fees, upcoming travel tickets, or personal gadgets fund.
                    </p>
                  </div>
                </div>
              </section>

              {/* Chapter 6 */}
              <section id="recurring-bills" className="space-y-4 scroll-mt-28">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                  <span>Chapter 06</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-apptext">
                  Fixed Commitments vs. Discretionary Cash
                </h2>
                <div className="prose text-sm sm:text-base text-apptext-muted leading-relaxed space-y-3">
                  <p>
                    A critical budgeting mistake is treating your entire allowance as spendable money. If your total allowance is ₹12,000, but ₹4,000 must go toward hostel mess and ₹1,000 toward Wi-Fi and mobile bills, your true spendable allowance is ₹7,000.
                  </p>
                  <p>
                    Using MoneyControlr's <strong>Recurring Bills Manager</strong>, you register these monthly commitments once. The app automatically holds them in reserve, ensuring your daily limit only counts truly discretionary money.
                  </p>
                </div>
              </section>

              {/* Chapter 7: FAQ Accordion */}
              <section id="faqs" className="space-y-6 pt-4 scroll-mt-28">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                    <HelpCircle className="w-4 h-4" />
                    <span>Chapter 07</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-apptext">
                    Frequently Asked Student Questions
                  </h2>
                </div>

                <div className="space-y-3">
                  {GUIDE_FAQS.map((faq, idx) => (
                    <details
                      key={idx}
                      className="group rounded-card border border-border bg-surface p-5 open:bg-surface transition-all cursor-pointer"
                    >
                      <summary className="flex items-center justify-between font-bold text-sm sm:text-base text-apptext list-none select-none">
                        <span>{faq.question}</span>
                        <ChevronRight className="w-4 h-4 text-apptext-muted group-open:rotate-90 transition-transform shrink-0 ml-2" />
                      </summary>
                      <p className="mt-3 text-xs sm:text-sm text-apptext-muted leading-relaxed pt-2 border-t border-border/60">
                        {faq.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </section>

              {/* Bottom Conversion Card */}
              <div className="p-6 sm:p-8 rounded-card bg-surface border border-border shadow-card space-y-4">
                <h3 className="text-lg sm:text-xl font-bold text-apptext">
                  Ready to take control of your student budget?
                </h3>
                <p className="text-xs sm:text-sm text-apptext-muted">
                  Calculate your safe daily limit right now with our free tool, or create your account to begin logging daily expenses.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Link href="/calculator">
                    <Button size="md" className="font-bold">
                      Launch Daily Calculator
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button variant="outline" size="md" className="font-semibold">
                      Create Free Account
                    </Button>
                  </Link>
                </div>
              </div>
            </article>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
