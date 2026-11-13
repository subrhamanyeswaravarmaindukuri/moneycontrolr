"use server";

import { loadVerifiedBudgetContext } from "@/lib/budget-context";
import type { FinancialSummary } from "@/lib/calculations/finance";
import {
  calculateCategoryBreakdown,
  calculate503020Progress,
  calculateWeeklyBreakdown,
  calculateFinancialHealth,
  CategorySpend,
  BudgetSplits503020,
  WeeklySpendItem,
  FinancialHealth,
} from "@/lib/calculations/analytics";
import type { Budget } from "@/types/database.types";

export interface BudgetAnalyticsData {
  user: {
    id: string;
    email: string;
    displayName: string;
  };
  hasBudget: boolean;
  budget?: Budget;
  summary?: FinancialSummary;
  categoryBreakdown: CategorySpend[];
  splits503020?: BudgetSplits503020;
  weeklyBreakdown: WeeklySpendItem[];
  health?: FinancialHealth;
}

/**
 * Fetches all data and calculates deep spending and budget analytics for Screen 05 and Screen 06.
 */
export async function getBudgetAnalytics(): Promise<BudgetAnalyticsData | null> {
  const ctx = await loadVerifiedBudgetContext();
  if (!ctx) return null;

  if (!ctx.hasBudget || !ctx.budget || !ctx.summary || !ctx.budgetPeriod) {
    return {
      user: ctx.user,
      hasBudget: false,
      categoryBreakdown: [],
      weeklyBreakdown: [],
    };
  }

  const categoryBreakdown = calculateCategoryBreakdown(ctx.transactions);
  const splits503020 = calculate503020Progress(ctx.budget, ctx.transactions);
  const weeklyBreakdown = calculateWeeklyBreakdown(
    ctx.transactions,
    ctx.budgetPeriod.startDate,
    ctx.budgetPeriod.endDate
  );
  const health = calculateFinancialHealth(ctx.budget, ctx.summary, ctx.transactions);

  return {
    user: ctx.user,
    hasBudget: true,
    budget: ctx.budget,
    summary: ctx.summary,
    categoryBreakdown,
    splits503020,
    weeklyBreakdown,
    health,
  };
}
