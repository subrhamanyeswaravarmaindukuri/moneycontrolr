import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { NOINDEX_ROBOTS } from "@/lib/seo/metadata";
import { requireVerifiedUser } from "@/lib/security/server-auth";
import { getBudgetAnalytics } from "../actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  Calendar,
  Settings,
  Sparkles,
  PieChart,
  CheckCircle2,
  Clock,
  ArrowLeft,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Budget Summary",
  robots: NOINDEX_ROBOTS,
};

export const dynamic = "force-dynamic";

export default async function BudgetSummaryPage() {
  await requireVerifiedUser("/budgets/summary");
  const data = await getBudgetAnalytics();

  if (!data) {
    redirect("/login");
  }

  if (!data.hasBudget || !data.budget || !data.summary || !data.health || !data.splits503020) {
    redirect("/onboarding");
  }

  const { budget, summary, health, splits503020 } = data;
  const timeProgressPct = Math.round(
    (summary.budgetPeriod.currentDayIndex / summary.budgetPeriod.totalDays) * 100
  );
  const budgetSpentPct = Math.round(
    (summary.totalExpensesThisMonth / Math.max(1, summary.monthlyAllowance)) * 100
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 py-8 sm:py-10 px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="max-w-[1440px] mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-5">
            <div>
              <div className="flex items-center gap-2">
                <Link href="/budgets" className="text-primary hover:underline text-xs flex items-center font-bold">
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  Back to Breakdown
                </Link>
                <span className="text-border">/</span>
                <span className="text-[11px] font-bold bg-primary-light text-primary px-2.5 py-0.5 rounded-full">
                  Screen 06
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-apptext tracking-tight mt-1">
                Monthly Budget Summary & Financial Status
              </h1>
              <p className="text-xs sm:text-sm text-apptext-muted font-medium mt-0.5">
                Comprehensive overview of your monthly cash flow, savings rate, and financial health score.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/onboarding">
                <Button variant="outline" size="md" className="font-bold text-xs sm:text-sm">
                  <Settings className="w-4 h-4 mr-1.5" />
                  Adjust Budget
                </Button>
              </Link>
              <Link href="/transactions/new">
                <Button size="md" className="font-bold text-xs sm:text-sm shadow-sm">
                  + Record Spend
                </Button>
              </Link>
            </div>
          </div>

          {/* Master 4-Card Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card variant="default" className="p-6 shadow-card border-border space-y-2">
              <span className="text-xs font-bold text-apptext-muted uppercase tracking-wider flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-primary" />
                Monthly Allowance
              </span>
              <p className="text-2xl sm:text-3xl font-black text-apptext">
                ₹{Number(budget.monthly_allowance).toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-apptext-muted font-medium capitalize">
                Source: {budget.money_source.replace("_", " ")}
              </p>
            </Card>

            <Card variant="default" className="p-6 shadow-card border-border space-y-2">
              <span className="text-xs font-bold text-apptext-muted uppercase tracking-wider flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-red-500" />
                Total Spent This Cycle
              </span>
              <p className="text-2xl sm:text-3xl font-black text-red-600">
                ₹{summary.totalExpensesThisMonth.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-apptext-muted font-medium">
                {budgetSpentPct}% of allowance consumed
              </p>
            </Card>

            <Card variant="default" className="p-6 shadow-card border-border space-y-2">
              <span className="text-xs font-bold text-apptext-muted uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Remaining Allowance
              </span>
              <p className="text-2xl sm:text-3xl font-black text-primary">
                ₹{summary.remainingMonthlyBudget.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-apptext-muted font-medium">
                Safe to spend across next {summary.budgetPeriod.remainingDays} days
              </p>
            </Card>

            <Card variant="default" className="p-6 shadow-card border-border space-y-2">
              <span className="text-xs font-bold text-apptext-muted uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Projected Savings
              </span>
              <p
                className={`text-2xl sm:text-3xl font-black ${
                  health.projectedEndBalance >= 0 ? "text-emerald-700" : "text-red-600"
                }`}
              >
                ₹{health.projectedEndBalance.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-apptext-muted font-medium">
                Target: ₹{splits503020.savings.targetAmount.toLocaleString("en-IN")} (20%)
              </p>
            </Card>
          </div>

          {/* Middle Grid: Financial Health Scorecard + Cycle Pacing Progress */}
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Financial Health Scorecard */}
            <div className="lg:col-span-6 space-y-6">
              <Card variant="default" className="shadow-card">
                <CardHeader className="border-b border-border-subtle pb-4 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-black text-apptext flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      Financial Health Scorecard
                    </CardTitle>
                    <p className="text-xs text-apptext-muted font-medium mt-0.5">
                      Evaluated against pacing, overspending frequency, and savings preservation
                    </p>
                  </div>
                  <Badge className="bg-primary text-white font-bold text-xs">
                    {health.rating}
                  </Badge>
                </CardHeader>

                <CardContent className="pt-6 space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-2xl bg-primary-light flex flex-col items-center justify-center text-center shrink-0">
                      <span className="text-3xl font-black text-primary">{health.score}</span>
                      <span className="text-[10px] font-bold text-apptext-muted uppercase">/ 100</span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-base font-extrabold text-apptext">{health.rating} Financial Discipline</h4>
                      <p className="text-xs text-apptext-muted leading-relaxed">
                        {health.summaryText}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-border-subtle">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-apptext-muted">Daily Spending Run-Rate:</span>
                      <strong className="text-apptext font-bold">₹{health.dailySpendingVelocity} / day</strong>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-apptext-muted">Safe Limit Per Remaining Day:</span>
                      <strong className="text-primary font-bold">₹{summary.todaySpendingLimit} / day</strong>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-apptext-muted">Needs Protection:</span>
                      <strong className="text-apptext font-bold">
                        ₹{splits503020.needs.actualAmount} / ₹{splits503020.needs.targetAmount} ({splits503020.needs.actualPercentage}%)
                      </strong>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-apptext-muted">Wants Restraint:</span>
                      <strong className="text-apptext font-bold">
                        ₹{splits503020.wants.actualAmount} / ₹{splits503020.wants.targetAmount} ({splits503020.wants.actualPercentage}%)
                      </strong>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Billing Cycle & Pacing Analysis */}
            <div className="lg:col-span-6 space-y-6">
              <Card variant="default" className="shadow-card">
                <CardHeader className="border-b border-border-subtle pb-4">
                  <CardTitle className="text-lg font-black text-apptext flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Billing Cycle & Burn Pacing
                  </CardTitle>
                  <p className="text-xs text-apptext-muted font-medium mt-0.5">
                    {summary.budgetPeriod.startDate} to {summary.budgetPeriod.endDate}
                  </p>
                </CardHeader>

                <CardContent className="pt-6 space-y-6">
                  {/* Pacing vs Time comparison */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
                      <span className="text-apptext flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-primary" />
                        Time Elapsed in Cycle:
                      </span>
                      <span className="text-apptext-muted">
                        Day {summary.budgetPeriod.currentDayIndex} of {summary.budgetPeriod.totalDays} ({timeProgressPct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-border-subtle overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.min(100, timeProgressPct)}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
                      <span className="text-apptext flex items-center gap-1.5">
                        <TrendingDown className="w-4 h-4 text-red-500" />
                        Budget Consumed:
                      </span>
                      <span className="text-apptext-muted">
                        ₹{summary.totalExpensesThisMonth.toLocaleString("en-IN")} of ₹{summary.monthlyAllowance.toLocaleString("en-IN")} ({budgetSpentPct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-border-subtle overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          budgetSpentPct > timeProgressPct ? "bg-amber-500" : "bg-emerald-600"
                        }`}
                        style={{ width: `${Math.min(100, budgetSpentPct)}%` }}
                      />
                    </div>
                  </div>

                  {/* Verdict banner */}
                  <div
                    className={`p-4 rounded-xl border text-xs leading-relaxed font-medium ${
                      budgetSpentPct <= timeProgressPct
                        ? "bg-primary-light/50 border-primary/30 text-primary"
                        : "bg-amber-50 border-amber-300 text-amber-900"
                    }`}
                  >
                    {budgetSpentPct <= timeProgressPct ? (
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                        <span>
                          <strong>Ahead of pace:</strong> You have consumed only {budgetSpentPct}% of your money while {timeProgressPct}% of the month has passed. You are on track to save extra cash!
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                        <span>
                          <strong>Running hot:</strong> You have consumed {budgetSpentPct}% of your allowance, which is slightly ahead of the {timeProgressPct}% calendar mark. Follow your daily limit of ₹{summary.todaySpendingLimit} to balance out.
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>

          {/* Active Budget Configuration Details Card */}
          <Card variant="flat" className="p-6 sm:p-8 bg-surface shadow-card border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary">
                  <PieChart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-apptext">Active Allocation Parameters</h3>
                  <p className="text-xs text-apptext-muted">
                    Your baseline settings from onboarding. Can be adjusted anytime.
                  </p>
                </div>
              </div>

              <Link href="/onboarding">
                <Button size="sm" variant="outline" className="font-bold text-xs">
                  Reconfigure Budget
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6">
              <div>
                <span className="text-[11px] font-bold text-apptext-muted uppercase tracking-wider block">
                  Monthly Baseline
                </span>
                <span className="text-lg font-black text-apptext">
                  ₹{Number(budget.monthly_allowance).toLocaleString("en-IN")}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-apptext-muted uppercase tracking-wider block">
                  Needs Target
                </span>
                <span className="text-lg font-black text-primary">
                  {budget.needs_percentage}% (₹{splits503020.needs.targetAmount.toLocaleString("en-IN")})
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-apptext-muted uppercase tracking-wider block">
                  Wants Target
                </span>
                <span className="text-lg font-black text-amber-700">
                  {budget.wants_percentage}% (₹{splits503020.wants.targetAmount.toLocaleString("en-IN")})
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-apptext-muted uppercase tracking-wider block">
                  Savings Target
                </span>
                <span className="text-lg font-black text-emerald-700">
                  {budget.savings_percentage}% (₹{splits503020.savings.targetAmount.toLocaleString("en-IN")})
                </span>
              </div>
            </div>
          </Card>

        </div>
      </main>
    </div>
  );
}
