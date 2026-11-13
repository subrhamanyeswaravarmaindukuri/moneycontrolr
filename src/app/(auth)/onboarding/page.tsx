"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import { saveOnboardingBudget, AuthActionResult } from "../actions";
import { BrandEmblem } from "@/components/layout/brand-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { getCurrentMonthBoundsYMD } from "@/lib/date";
import {
  Calendar,
  Sparkles,
  HeartHandshake,
  Briefcase,
  Award,
  Clock,
  Laptop,
  HelpCircle,
  ArrowRight,
  AlertCircle,
  TrendingUp,
  PieChart,
  ShieldCheck,
} from "lucide-react";
import { MoneySource } from "@/types/database.types";

const MONEY_SOURCES: { id: MoneySource; label: string; icon: React.ElementType }[] = [
  { id: "parental_allowance", label: "Parental Allowance", icon: HeartHandshake },
  { id: "salary", label: "Salary / Stipend", icon: Briefcase },
  { id: "scholarship", label: "Scholarship", icon: Award },
  { id: "part_time", label: "Part-Time Job", icon: Clock },
  { id: "freelance", label: "Freelance", icon: Laptop },
  { id: "other", label: "Other Source", icon: HelpCircle },
];

export default function OnboardingPage() {
  const [state, formAction, isPending] = useActionState<AuthActionResult | null, FormData>(
    saveOnboardingBudget,
    null
  );

  const [monthlyAllowance, setMonthlyAllowance] = useState<number>(30000);
  const [selectedSource, setSelectedSource] = useState<MoneySource>("parental_allowance");
  const [needsPct, setNeedsPct] = useState<number>(50);
  const [wantsPct, setWantsPct] = useState<number>(30);
  const [savingsPct, setSavingsPct] = useState<number>(20);

  // Dynamic live calculation (Asia/Kolkata cycle bounds)
  const totalDaysInCurrentMonth = getCurrentMonthBoundsYMD().daysInMonth;

  const dailyEstimate = monthlyAllowance > 0 ? Math.floor(monthlyAllowance / totalDaysInCurrentMonth) : 0;
  const needsAmount = Math.round((monthlyAllowance * needsPct) / 100);
  const wantsAmount = Math.round((monthlyAllowance * wantsPct) / 100);
  const savingsAmount = Math.round((monthlyAllowance * savingsPct) / 100);

  const totalPct = needsPct + wantsPct + savingsPct;
  const isBudgetValid = totalPct === 100 && monthlyAllowance > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <BrandEmblem size="sm" />
            <span className="text-lg font-bold tracking-tight text-primary">MoneyControlr</span>
          </Link>
          <Badge variant="primary" size="md">
            Step 1 of 1: Financial Baseline
          </Badge>
        </div>
      </header>

      {/* Main Content Area (Wide 2-Column Desktop Grid) */}
      <main className="flex-1 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 space-y-1 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-apptext tracking-tight">
              Let's set up your monthly money baseline.
            </h1>
            <p className="text-sm text-apptext-muted max-w-2xl">
              We need to know your monthly intake so we can accurately compute your safe daily spending limit. You can update this anytime.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: Input Configuration Form */}
            <div className="lg:col-span-7">
              <Card variant="elevated" className="border-border">
                <CardContent className="p-6 sm:p-8">
                  <form action={formAction} className="space-y-7">
                    {state?.error && (
                      <div className="p-3.5 rounded-btn bg-status-dangerLight border border-status-danger/20 text-status-danger text-xs sm:text-sm flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{state.error}</span>
                      </div>
                    )}

                    {/* Question 1: Allowance */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-apptext">
                        1. What is your total monthly money?
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-3 text-apptext-muted font-bold text-base">
                          ₹
                        </span>
                        <input
                          type="number"
                          name="monthlyAllowance"
                          value={monthlyAllowance || ""}
                          onChange={(e) => setMonthlyAllowance(Number(e.target.value))}
                          min="1"
                          placeholder="30000"
                          required
                          className="w-full h-12 rounded-btn border border-border bg-surface pl-8 pr-4 text-base font-bold text-apptext placeholder:text-apptext-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        />
                      </div>
                      <p className="text-xs text-apptext-muted">
                        Include parental transfers, part-time jobs, scholarships, or freelance income.
                      </p>
                    </div>

                    {/* Question 2: Money Source */}
                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-apptext">
                        2. Where does this money primarily come from?
                      </label>
                      <input type="hidden" name="moneySource" value={selectedSource} />
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {MONEY_SOURCES.map((source) => {
                          const IconComponent = source.icon;
                          const isSelected = selectedSource === source.id;
                          return (
                            <button
                              key={source.id}
                              type="button"
                              onClick={() => setSelectedSource(source.id)}
                              className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all text-xs ${isSelected
                                  ? "bg-primary-light/60 border-primary text-primary font-bold shadow-sm"
                                  : "bg-surface border-border text-apptext hover:bg-background"
                                }`}
                            >
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? "bg-primary text-white" : "bg-background text-apptext-muted"
                                  }`}
                              >
                                <IconComponent className="w-3.5 h-3.5" />
                              </div>
                              <span className="truncate font-medium">{source.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Question 3: Budget Preferences */}
                    <div className="space-y-3.5 pt-2 border-t border-border-subtle">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-bold text-apptext">
                          3. Budget Allocation Preferences
                        </label>
                        <span
                          className={`text-xs font-bold ${totalPct === 100 ? "text-status-success" : "text-status-danger"
                            }`}
                        >
                          Total: {totalPct}% {totalPct === 100 ? "✓ Ready" : "(Must equal 100%)"}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1">
                          <div className="flex items-center justify-between text-xs text-apptext-muted font-medium">
                            <span>Needs</span>
                            <span className="font-bold text-primary">{needsPct}%</span>
                          </div>
                          <div className="text-sm sm:text-base font-extrabold text-apptext">
                            {formatCurrency(needsAmount)}
                          </div>
                          <p className="text-[10px] text-apptext-light">Food, rent, travel</p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1">
                          <div className="flex items-center justify-between text-xs text-apptext-muted font-medium">
                            <span>Wants</span>
                            <span className="font-bold text-primary">{wantsPct}%</span>
                          </div>
                          <div className="text-sm sm:text-base font-extrabold text-apptext">
                            {formatCurrency(wantsAmount)}
                          </div>
                          <p className="text-[10px] text-apptext-light">Shopping, movies</p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1">
                          <div className="flex items-center justify-between text-xs text-apptext-muted font-medium">
                            <span>Savings</span>
                            <span className="font-bold text-primary">{savingsPct}%</span>
                          </div>
                          <div className="text-sm sm:text-base font-extrabold text-apptext">
                            {formatCurrency(savingsAmount)}
                          </div>
                          <p className="text-[10px] text-apptext-light">Emergency, future</p>
                        </div>
                      </div>

                      <input type="hidden" name="needsPercentage" value={needsPct} />
                      <input type="hidden" name="wantsPercentage" value={wantsPct} />
                      <input type="hidden" name="savingsPercentage" value={savingsPct} />
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full sm:flex-1 font-bold shadow-sm text-base"
                        disabled={!isBudgetValid}
                        isLoading={isPending}
                      >
                        Save Baseline & Continue
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      <Link
                        href="/dashboard"
                        className="text-xs font-semibold text-apptext-muted hover:text-primary py-2 px-3"
                      >
                        Skip for now
                      </Link>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* RIGHT COLUMN: Live Interactive Projection Card (Desktop Sticky) */}
            <div className="lg:col-span-5 sticky top-24 space-y-4">
              <Card variant="elevated" className="border-border overflow-hidden">
                <div className="bg-primary text-white p-6 -m-5 sm:-m-6 mb-5">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-200 mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Calculated Safe Limit
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                    {formatCurrency(dailyEstimate)}
                    <span className="text-sm font-normal text-white/80 ml-1">/ day</span>
                  </div>
                  <p className="text-xs text-white/80 mt-1">
                    Based on {totalDaysInCurrentMonth} days in this month's billing cycle.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-bold text-apptext uppercase tracking-wider">
                    How your money gets split
                  </h4>

                  <div className="space-y-2.5">
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-apptext mb-1">
                        <span>Needs (Food, Transport, Bills)</span>
                        <span>{formatCurrency(needsAmount)}</span>
                      </div>
                      <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${needsPct}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold text-apptext mb-1">
                        <span>Wants (Outings, Shopping)</span>
                        <span>{formatCurrency(wantsAmount)}</span>
                      </div>
                      <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${wantsPct}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold text-apptext mb-1">
                        <span>Savings (Safety Cushion)</span>
                        <span>{formatCurrency(savingsAmount)}</span>
                      </div>
                      <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${savingsPct}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-background border border-border text-xs text-apptext-muted space-y-1.5 mt-4">
                    <div className="flex items-center gap-2 font-semibold text-apptext">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      Dynamic Rollover Guarantee
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      If you spend only ₹500 tomorrow out of your ₹{dailyEstimate} limit, the leftover ₹{Math.max(0, dailyEstimate - 500)} is automatically added to future days!
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
