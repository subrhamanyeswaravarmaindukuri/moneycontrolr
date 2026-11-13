import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { FinancialSummary } from "@/lib/calculations/finance";
import { Wallet, TrendingDown, PiggyBank, Calendar, DollarSign } from "lucide-react";

interface MetricCardsProps {
  summary: FinancialSummary;
}

export function MetricCards({ summary }: MetricCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
      {/* 1. Monthly Allowance */}
      <Card variant="flat" className="p-4 sm:p-5 border-border bg-surface hover:border-primary/40 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-apptext-muted">
            Monthly Budget
          </span>
          <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-primary">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="text-lg sm:text-2xl font-black text-apptext">
          {formatCurrency(summary.monthlyAllowance)}
        </div>
        <p className="text-[11px] text-apptext-muted mt-1 font-medium">
          Initial monthly baseline
        </p>
      </Card>

      {/* 2. Remaining Monthly Budget */}
      <Card variant="flat" className="p-4 sm:p-5 border-border bg-surface hover:border-primary/40 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-apptext-muted">
            Month Remaining
          </span>
          <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-primary">
            <PiggyBank className="w-4 h-4" />
          </div>
        </div>
        <div className="text-lg sm:text-2xl font-black text-primary">
          {formatCurrency(summary.remainingMonthlyBudget)}
        </div>
        <p className="text-[11px] text-apptext-muted mt-1 font-medium">
          Safe to spend over next {summary.budgetPeriod.remainingDays} days
        </p>
      </Card>

      {/* 3. Total Spent This Month */}
      <Card variant="flat" className="p-4 sm:p-5 border-border bg-surface hover:border-primary/40 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-apptext-muted">
            Total Spent
          </span>
          <div className="w-8 h-8 rounded-lg bg-status-dangerLight flex items-center justify-center text-status-danger">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <div className="text-lg sm:text-2xl font-black text-status-danger">
          -{formatCurrency(summary.totalExpensesThisMonth)}
        </div>
        <p className="text-[11px] text-apptext-muted mt-1 font-medium">
          Logged expenses this cycle
        </p>
      </Card>

      {/* 4. Extra Income */}
      <Card variant="flat" className="p-4 sm:p-5 border-border bg-surface hover:border-primary/40 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-apptext-muted">
            Extra Income
          </span>
          <div className="w-8 h-8 rounded-lg bg-status-successLight flex items-center justify-center text-status-success">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="text-lg sm:text-2xl font-black text-status-success">
          +{formatCurrency(summary.totalIncomeThisMonth)}
        </div>
        <p className="text-[11px] text-apptext-muted mt-1 font-medium">
          Scholarships / part-time money
        </p>
      </Card>
    </div>
  );
}

