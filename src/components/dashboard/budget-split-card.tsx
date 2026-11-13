import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Budget } from "@/types/database.types";
import { PieChart, Sparkles } from "lucide-react";

interface BudgetSplitCardProps {
  budget: Budget;
  needsSpent: number;
  wantsSpent: number;
}

export function BudgetSplitCard({ budget, needsSpent, wantsSpent }: BudgetSplitCardProps) {
  const allowance = Number(budget.monthly_allowance);

  const needsTarget = Math.round((allowance * Number(budget.needs_percentage)) / 100);
  const wantsTarget = Math.round((allowance * Number(budget.wants_percentage)) / 100);
  const savingsTarget = Math.round((allowance * Number(budget.savings_percentage)) / 100);

  const needsPctUsed = needsTarget > 0 ? Math.min(100, Math.round((needsSpent / needsTarget) * 100)) : 0;
  const wantsPctUsed = wantsTarget > 0 ? Math.min(100, Math.round((wantsSpent / wantsTarget) * 100)) : 0;

  return (
    <Card variant="flat" className="p-5 sm:p-6 border-border bg-surface space-y-4">
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <PieChart className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-apptext uppercase tracking-wider">
            Budget Allocation (50/30/20)
          </h3>
        </div>
        <span className="text-xs text-apptext-muted font-semibold">
          Monthly Targets
        </span>
      </div>

      <div className="space-y-4 pt-1">
        {/* 1. Needs */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-apptext">
            <span>Needs ({budget.needs_percentage}%)</span>
            <span>
              {formatCurrency(needsSpent)} / {formatCurrency(needsTarget)}
            </span>
          </div>
          <div className="w-full h-2.5 bg-background rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                needsPctUsed > 90 ? "bg-status-danger" : "bg-primary"
              }`}
              style={{ width: `${needsPctUsed}%` }}
            />
          </div>
          <p className="text-[10px] text-apptext-muted">Food, rent, travel, electricity</p>
        </div>

        {/* 2. Wants */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-apptext">
            <span>Wants ({budget.wants_percentage}%)</span>
            <span>
              {formatCurrency(wantsSpent)} / {formatCurrency(wantsTarget)}
            </span>
          </div>
          <div className="w-full h-2.5 bg-background rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                wantsPctUsed > 90 ? "bg-status-danger" : "bg-amber-500"
              }`}
              style={{ width: `${wantsPctUsed}%` }}
            />
          </div>
          <p className="text-[10px] text-apptext-muted">Movies, outings, shopping</p>
        </div>

        {/* 3. Savings */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-apptext">
            <span>Savings ({budget.savings_percentage}%)</span>
            <span className="text-status-success font-extrabold">
              Target: {formatCurrency(savingsTarget)}
            </span>
          </div>
          <div className="w-full h-2.5 bg-background rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: "100%" }} />
          </div>
          <p className="text-[10px] text-apptext-muted">Emergency cushion & future goals</p>
        </div>
      </div>
    </Card>
  );
}

