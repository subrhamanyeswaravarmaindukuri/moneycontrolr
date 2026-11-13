"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FinancialHealth } from "@/lib/calculations/analytics";
import { FinancialSummary } from "@/lib/calculations/finance";
import { Activity, ShieldAlert, Sparkles, TrendingUp, AlertCircle } from "lucide-react";

interface HealthMeterCardProps {
  health: FinancialHealth;
  summary: FinancialSummary;
}

export function HealthMeterCard({ health, summary }: HealthMeterCardProps) {
  const getRatingBadge = () => {
    switch (health.rating) {
      case "Excellent":
        return <Badge className="bg-emerald-600 text-white font-bold text-xs">Excellent Health</Badge>;
      case "Healthy":
        return <Badge className="bg-primary text-white font-bold text-xs">Healthy</Badge>;
      case "Moderate":
        return <Badge className="bg-amber-600 text-white font-bold text-xs">Moderate Caution</Badge>;
      default:
        return <Badge className="bg-red-600 text-white font-bold text-xs">Needs Attention</Badge>;
    }
  };

  const getMeterColor = () => {
    if (health.score >= 80) return "text-emerald-600 stroke-emerald-600";
    if (health.score >= 65) return "text-primary stroke-primary";
    if (health.score >= 50) return "text-amber-500 stroke-amber-500";
    return "text-red-500 stroke-red-500";
  };

  return (
    <Card variant="default" className="shadow-card border-border overflow-hidden">
      <div className="p-6 sm:p-8 bg-surface">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          
          {/* Left: Score Gauge & Status */}
          <div className="lg:col-span-5 flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background track circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-border-subtle"
                  strokeWidth="10"
                  fill="transparent"
                />
                {/* Value Arc */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className={`transition-all duration-1000 ${getMeterColor()}`}
                  strokeWidth="10"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 - (251.2 * health.score) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black text-apptext tracking-tight">{health.score}</span>
                <span className="text-[10px] font-bold text-apptext-muted uppercase tracking-wider">Score</span>
              </div>
            </div>

            <div className="space-y-1.5 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-lg font-black text-apptext">Financial Health</span>
                {getRatingBadge()}
              </div>
              <p className="text-xs text-apptext-muted leading-relaxed font-medium">
                {health.summaryText}
              </p>
            </div>
          </div>

          {/* Right: Key Projections & Run Rate */}
          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4 border-t lg:border-t-0 lg:border-l border-border-subtle pt-6 lg:pt-0 lg:pl-8">
            <div className="p-4 rounded-2xl bg-background border border-border-subtle space-y-1">
              <span className="text-[11px] font-bold text-apptext-muted uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
                Spending Velocity
              </span>
              <p className="text-xl font-black text-apptext">
                ₹{health.dailySpendingVelocity.toLocaleString("en-IN")}
                <span className="text-xs text-apptext-muted font-normal ml-1">/ day</span>
              </p>
              <p className="text-[11px] text-apptext-muted">
                Based on {summary.budgetPeriod.currentDayIndex} days elapsed in billing cycle.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-background border border-border-subtle space-y-1">
              <span className="text-[11px] font-bold text-apptext-muted uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Projected Month-End Savings
              </span>
              <p
                className={`text-xl font-black ${
                  health.projectedEndBalance >= 0 ? "text-primary" : "text-red-600"
                }`}
              >
                ₹{health.projectedEndBalance.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-apptext-muted">
                {health.projectedEndBalance >= 0
                  ? "Estimated surplus remaining at end of month."
                  : "Deficit projected if daily velocity is not lowered."}
              </p>
            </div>
          </div>

        </div>
      </div>
    </Card>
  );
}

