"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BudgetSplits503020 } from "@/lib/calculations/analytics";
import { CheckCircle2, AlertTriangle, ShieldCheck, Heart, Sparkles, PiggyBank } from "lucide-react";

interface Rule503020CardProps {
  splits: BudgetSplits503020;
}

export function Rule503020Card({ splits }: Rule503020CardProps) {
  const { needs, wants, savings } = splits;

  return (
    <Card variant="default" className="shadow-card">
      <CardHeader className="border-b border-border-subtle pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-lg font-black text-apptext flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              50 / 30 / 20 Budget Rule Analysis
            </CardTitle>
            <p className="text-xs text-apptext-muted font-medium mt-0.5">
              Balanced student allocation: 50% Needs, 30% Wants, 20% Savings
            </p>
          </div>
          <Badge variant="neutral" className="self-start sm:self-auto text-xs font-bold">
            Target Active
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* 1. Needs Card (50%) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary-light text-primary flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-extrabold text-apptext">Needs</span>
                <span className="text-xs text-apptext-muted ml-2">(Target: {needs.targetPercentage}%)</span>
              </div>
            </div>
            {needs.isOverBudget ? (
              <Badge variant="danger" className="text-[11px] font-bold">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Over Target
              </Badge>
            ) : (
              <Badge variant="success" className="text-[11px] font-bold">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Within Limit
              </Badge>
            )}
          </div>

          <div className="flex items-baseline justify-between text-xs sm:text-sm">
            <span className="text-apptext-muted font-medium">
              Spent: <strong className="text-apptext">₹{needs.actualAmount.toLocaleString("en-IN")}</strong> of ₹{needs.targetAmount.toLocaleString("en-IN")}
            </span>
            <span className="font-bold text-apptext">
              {needs.actualPercentage}% of allowance
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-border-subtle overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                needs.isOverBudget ? "bg-red-500" : "bg-primary"
              }`}
              style={{
                width: `${Math.min(100, needs.targetAmount > 0 ? (needs.actualAmount / needs.targetAmount) * 100 : 0)}%`,
              }}
            />
          </div>

          <p className="text-[11px] text-apptext-muted">
            {needs.isOverBudget
              ? `You have exceeded your essentials target by ₹${needs.overAmount.toLocaleString("en-IN")}.`
              : `₹${needs.remainingAmount.toLocaleString("en-IN")} remaining for essentials (Food, Mess, Books, Bus).`}
          </p>
        </div>

        {/* 2. Wants Card (30%) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-extrabold text-apptext">Wants (Discretionary)</span>
                <span className="text-xs text-apptext-muted ml-2">(Target: {wants.targetPercentage}%)</span>
              </div>
            </div>
            {wants.isOverBudget ? (
              <Badge variant="danger" className="text-[11px] font-bold">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Over Target
              </Badge>
            ) : (
              <Badge variant="warning" className="text-[11px] font-bold">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Under Control
              </Badge>
            )}
          </div>

          <div className="flex items-baseline justify-between text-xs sm:text-sm">
            <span className="text-apptext-muted font-medium">
              Spent: <strong className="text-apptext">₹{wants.actualAmount.toLocaleString("en-IN")}</strong> of ₹{wants.targetAmount.toLocaleString("en-IN")}
            </span>
            <span className="font-bold text-apptext">
              {wants.actualPercentage}% of allowance
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-border-subtle overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                wants.isOverBudget ? "bg-red-500" : "bg-amber-500"
              }`}
              style={{
                width: `${Math.min(100, wants.targetAmount > 0 ? (wants.actualAmount / wants.targetAmount) * 100 : 0)}%`,
              }}
            />
          </div>

          <p className="text-[11px] text-apptext-muted">
            {wants.isOverBudget
              ? `Leisure spending is ₹${wants.overAmount.toLocaleString("en-IN")} over target. Consider pausing shopping or entertainment.`
              : `₹${wants.remainingAmount.toLocaleString("en-IN")} safe cushion remaining for outings and discretionary treats.`}
          </p>
        </div>

        {/* 3. Savings Card (20%) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <PiggyBank className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-extrabold text-apptext">Savings Reserve</span>
                <span className="text-xs text-apptext-muted ml-2">(Target: {savings.targetPercentage}%)</span>
              </div>
            </div>
            <Badge variant="success" className="text-[11px] font-bold">
              ₹{savings.currentSaved.toLocaleString("en-IN")} Preserved
            </Badge>
          </div>

          <div className="flex items-baseline justify-between text-xs sm:text-sm">
            <span className="text-apptext-muted font-medium">
              Target: <strong className="text-apptext">₹{savings.targetAmount.toLocaleString("en-IN")}</strong>
            </span>
            <span className="font-bold text-emerald-700">
              {savings.savingsRatePercentage}% preserved so far
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-border-subtle overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all duration-500"
              style={{
                width: `${Math.min(100, savings.savingsRatePercentage)}%`,
              }}
            />
          </div>

          <p className="text-[11px] text-apptext-muted">
            Preserving this capital provides an emergency fund and allows you to build healthy student financial habits.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
