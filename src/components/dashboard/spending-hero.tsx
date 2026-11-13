"use client";

import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FinancialSummary } from "@/lib/calculations/finance";
import {
  Plus,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

interface SpendingHeroProps {
  summary: FinancialSummary;
}

export function SpendingHero({ summary }: SpendingHeroProps) {
  const percentSpentToday = summary.todaySpendingLimit > 0
    ? Math.min(100, Math.round((summary.todaySpent / summary.todaySpendingLimit) * 100))
    : 0;

  const isOverspent = summary.isOverspentToday;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-primary text-white p-6 sm:p-8 lg:p-10 shadow-cardHover">
      {/* Decorative ambient background accents */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white/5 blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-black/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center">
        {/* Left: Main Safe-to-Spend Metric */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200 bg-white/10 px-3 py-1 rounded-full">
              Safe-to-Spend Today
            </span>
            <span className="text-xs font-semibold text-white/80 flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-full">
              <Calendar className="w-3.5 h-3.5" />
              Day {summary.budgetPeriod.currentDayIndex} of {summary.budgetPeriod.totalDays} ({summary.budgetPeriod.remainingDays} days left)
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-6xl font-black tracking-tight text-white">
                {formatCurrency(summary.todayRemainingSafeToSpend)}
              </span>
              <span className="text-sm sm:text-base font-normal text-white/80">
                safe today
              </span>
            </div>

            {isOverspent ? (
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-amber-200 mt-2 bg-amber-500/20 p-2.5 rounded-xl border border-amber-400/30">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  Overspent by {formatCurrency(summary.overspentAmountToday)} today. Tomorrow's limit will adapt automatically so you stay safe!
                </span>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-white/85 mt-1 font-medium">
                Spend up to this amount today without hurting your end-of-month budget.
              </p>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 pt-2 max-w-lg">
            <div className="flex justify-between text-xs font-semibold text-white/95">
              <span>Today's Limit: {formatCurrency(summary.todaySpendingLimit)}</span>
              <span>Spent Today: {formatCurrency(summary.todaySpent)} ({percentSpentToday}%)</span>
            </div>
            <div className="w-full h-3 bg-black/25 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 shadow-sm ${
                  isOverspent
                    ? "bg-amber-400"
                    : percentSpentToday > 75
                    ? "bg-amber-300"
                    : "bg-white"
                }`}
                style={{ width: `${percentSpentToday}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Quick Action Buttons & Rollover Status */}
        <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col justify-end gap-3.5 pt-2 lg:pt-0">
          <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 space-y-1.5 text-xs text-white/90">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <Sparkles className="w-4 h-4 text-emerald-200" />
              Dynamic Daily Rollover Active
            </div>
            <p className="text-[11px] text-white/80 leading-relaxed">
              If you don't spend your remaining {formatCurrency(summary.todayRemainingSafeToSpend)} today, it rolls over across your remaining {summary.budgetPeriod.remainingDays} days!
            </p>
          </div>

          <div className="flex gap-2.5">
            <Link href="/transactions/new" className="flex-1">
              <Button
                size="lg"
                className="w-full font-bold bg-white text-primary hover:bg-emerald-50 shadow-md text-sm sm:text-base h-12"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add Expense
              </Button>
            </Link>

            <Link href="/transactions" className="flex-1">
              <Button
                variant="outline"
                size="lg"
                className="w-full font-semibold border-white/30 text-white hover:bg-white/10 text-sm sm:text-base h-12 bg-transparent"
              >
                View History
                <ArrowUpRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

