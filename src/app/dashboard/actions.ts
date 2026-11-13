"use server";

import { loadVerifiedBudgetContext } from "@/lib/budget-context";
import type { FinancialSummary } from "@/lib/calculations/finance";
import type { Budget, Transaction } from "@/types/database.types";

export interface DashboardData {
  user: {
    id: string;
    email: string;
    displayName: string;
  };
  hasBudget: boolean;
  budget?: Budget;
  summary?: FinancialSummary;
  recentTransactions: Transaction[];
  needsSpent: number;
  wantsSpent: number;
}

/**
 * Fetches and calculates all live financial metrics for Screen 02 (Dashboard).
 */
export async function getDashboardData(): Promise<DashboardData | null> {
  const ctx = await loadVerifiedBudgetContext();
  if (!ctx) return null;

  return {
    user: ctx.user,
    hasBudget: ctx.hasBudget,
    budget: ctx.budget,
    summary: ctx.summary,
    recentTransactions: ctx.transactions.slice(0, 5),
    needsSpent: ctx.needsSpent,
    wantsSpent: ctx.wantsSpent,
  };
}
