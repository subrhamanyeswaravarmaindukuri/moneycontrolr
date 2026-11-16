"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  DollarSign,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";

const PRESET_ALLOWANCES = [
  { label: "₹6,000", value: 6000, desc: "Hostel Essentials" },
  { label: "₹12,000", value: 12000, desc: "College Average" },
  { label: "₹18,000", value: 18000, desc: "Metro Campus" },
  { label: "₹25,000", value: 25000, desc: "Shared Flat" },
];

export function AllowanceCalculator() {
  const [allowance, setAllowance] = useState<number>(15000);
  const [daysInCycle, setDaysInCycle] = useState<number>(30);

  const safeAllowance = Math.max(1000, Math.min(200000, isNaN(allowance) ? 0 : allowance));
  const dailySafeSpend = Math.floor(safeAllowance / daysInCycle);
  const weeklyBudget = Math.floor(dailySafeSpend * 7);

  // 50/30/20 breakdown
  const needsAmount = Math.floor(safeAllowance * 0.5);
  const wantsAmount = Math.floor(safeAllowance * 0.3);
  const savingsAmount = Math.floor(safeAllowance * 0.2);

  // Weekend vs Weekday pacing guide
  const weekdaySpend = Math.floor(dailySafeSpend * 0.85);
  const weekendSpend = Math.floor(dailySafeSpend * 1.35);

  const formatINR = (amt: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amt);
  };

  return (
    <div className="space-y-8">
      {/* Top Input & Primary Output Card */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Controls */}
        <Card variant="flat" className="lg:col-span-7 p-6 sm:p-8 bg-surface border-border shadow-card space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="allowance-input" className="text-sm font-bold text-apptext uppercase tracking-wider">
                Monthly Allowance / Pocket Money
              </label>
              <span className="text-xl sm:text-2xl font-black text-primary">
                {formatINR(safeAllowance)}
              </span>
            </div>
            <p className="text-xs text-apptext-muted">
              Enter your total monthly pocket money, stipend, or student budget.
            </p>
          </div>

          {/* Slider */}
          <div className="space-y-3">
            <input
              id="allowance-slider"
              type="range"
              min="2000"
              max="60000"
              step="500"
              value={safeAllowance}
              onChange={(e) => setAllowance(Number(e.target.value))}
              className="w-full h-2.5 bg-primary-light rounded-lg appearance-none cursor-pointer accent-primary"
              aria-label="Monthly allowance slider"
            />
            <div className="flex justify-between text-[11px] font-semibold text-apptext-light">
              <span>₹2,000</span>
              <span>₹15,000</span>
              <span>₹30,000</span>
              <span>₹60,000+</span>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-apptext-muted">Common Student Presets:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESET_ALLOWANCES.map((p) => {
                const isSelected = safeAllowance === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setAllowance(p.value)}
                    className={`p-2.5 rounded-card border text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary-light text-primary font-bold shadow-sm"
                        : "border-border hover:border-primary/50 text-apptext bg-background"
                    }`}
                  >
                    <div className="text-xs font-bold">{p.label}</div>
                    <div className="text-[10px] text-apptext-muted">{p.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Days in Cycle Selector */}
          <div className="pt-2 border-t border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-apptext uppercase tracking-wider">
                Cycle Duration
              </span>
              <span className="text-xs font-bold text-primary">{daysInCycle} Days</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Full Month (30 d)", val: 30 },
                { label: "Long Month (31 d)", val: 31 },
                { label: "Half Month (15 d)", val: 15 },
              ].map((cycle) => (
                <button
                  key={cycle.val}
                  type="button"
                  onClick={() => setDaysInCycle(cycle.val)}
                  className={`py-2 px-3 rounded-card text-xs font-semibold border transition-all text-center ${
                    daysInCycle === cycle.val
                      ? "border-primary bg-primary-light text-primary font-bold"
                      : "border-border text-apptext-muted hover:text-apptext bg-background"
                  }`}
                >
                  {cycle.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Right Column: Hero Result Card */}
        <Card
          variant="flat"
          className="lg:col-span-5 p-6 sm:p-8 bg-primary text-white border-0 shadow-card space-y-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-1 relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200 flex items-center gap-1.5">
              <Zap className="w-4 h-4" />
              Calculated Daily Spending Limit
            </span>
            <div className="text-4xl sm:text-5xl font-black tracking-tight text-white pt-2">
              {formatINR(dailySafeSpend)}
              <span className="text-sm sm:text-base font-normal text-emerald-100 ml-1">/ day</span>
            </div>
            <p className="text-xs text-emerald-100 pt-1 leading-relaxed">
              Spend up to this amount every day and your money will last the full {daysInCycle} days without running short.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/20 relative z-10">
            <div className="bg-white/10 rounded-card p-3">
              <div className="text-[11px] font-semibold text-emerald-200">Weekly Target</div>
              <div className="text-lg font-bold text-white">{formatINR(weeklyBudget)}</div>
              <div className="text-[10px] text-emerald-200/80">Every 7 days</div>
            </div>
            <div className="bg-white/10 rounded-card p-3">
              <div className="text-[11px] font-semibold text-emerald-200">Savings Buffer</div>
              <div className="text-lg font-bold text-white">{formatINR(savingsAmount)}</div>
              <div className="text-[10px] text-emerald-200/80">20% safe reserve</div>
            </div>
          </div>

          <div className="pt-2 relative z-10">
            <Link
              href="/signup"
              className="w-full inline-flex items-center justify-center h-12 px-6 rounded-btn bg-white text-primary hover:bg-emerald-50 font-black text-sm shadow-md transition-all group"
            >
              Track This Budget in MoneyControlr
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-[11px] text-center text-emerald-100 mt-2">
              Free forever for students. Real-time rollover on every UPI spend.
            </p>
          </div>
        </Card>
      </div>

      {/* Section 2: Detailed 50/30/20 Allocation & Weekend Pacing */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* 50/30/20 College Split */}
        <Card variant="flat" className="p-6 bg-surface border-border shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-apptext">50/30/20 Student Allocation</h3>
              </div>
              <p className="text-xs text-apptext-muted">
                How healthy student budgets divide monthly cash.
              </p>
            </div>
            <Badge variant="success">Recommended</Badge>
          </div>

          <div className="space-y-3 pt-2">
            {/* Needs */}
            <div className="p-3 rounded-card bg-background border border-border space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-apptext">Needs (50%): Essentials</span>
                <span className="font-black text-primary">{formatINR(needsAmount)}</span>
              </div>
              <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                <div className="bg-primary h-2 rounded-full" style={{ width: "50%" }} />
              </div>
              <p className="text-[11px] text-apptext-light">
                Hostel mess, groceries, transit, books, mobile recharge, medicines.
              </p>
            </div>

            {/* Wants */}
            <div className="p-3 rounded-card bg-background border border-border space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-apptext">Wants (30%): Lifestyle & Fun</span>
                <span className="font-black text-amber-600">{formatINR(wantsAmount)}</span>
              </div>
              <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: "30%" }} />
              </div>
              <p className="text-[11px] text-apptext-light">
                Weekend café outings, food delivery, movies, game passes, shopping.
              </p>
            </div>

            {/* Savings */}
            <div className="p-3 rounded-card bg-background border border-border space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-apptext">Savings & Buffer (20%): Future</span>
                <span className="font-black text-emerald-600">{formatINR(savingsAmount)}</span>
              </div>
              <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "20%" }} />
              </div>
              <p className="text-[11px] text-apptext-light">
                Emergency funds, certifications, campus trip savings, laptop repair buffer.
              </p>
            </div>
          </div>
        </Card>

        {/* Smart Weekend vs Weekday Pacing */}
        <Card variant="flat" className="p-6 bg-surface border-border shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-apptext">Weekday vs. Weekend Strategy</h3>
              </div>
              <p className="text-xs text-apptext-muted">
                Save slightly on weekdays so you have more to spend on Saturday and Sunday.
              </p>
            </div>
            <Badge variant="neutral">Smart Pacing</Badge>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-card bg-primary-light/40 border border-primary/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-apptext">Weekday Target (Mon–Fri)</span>
                <span className="text-base font-black text-primary">{formatINR(weekdaySpend)} / day</span>
              </div>
              <p className="text-xs text-apptext-muted leading-relaxed">
                Keep campus lunch, tea, and everyday snacks inside {formatINR(weekdaySpend)} to unlock higher weekend freedom.
              </p>
            </div>

            <div className="p-4 rounded-card bg-emerald-500/10 border border-emerald-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900">Weekend Treat Fund (Sat–Sun)</span>
                <span className="text-base font-black text-emerald-700">{formatINR(weekendSpend)} / day</span>
              </div>
              <p className="text-xs text-apptext-muted leading-relaxed">
                Enjoy {formatINR(weekendSpend)} per weekend day guilt-free because your weekday discipline already paid for it!
              </p>
            </div>

            <div className="p-3 rounded-card bg-background border border-border flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-apptext-muted leading-relaxed">
                <strong>How MoneyControlr automates this:</strong> When you log a transaction in the app, it dynamically recalculates tomorrow&apos;s daily limit. If you save today, tomorrow&apos;s allowance automatically grows!
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
