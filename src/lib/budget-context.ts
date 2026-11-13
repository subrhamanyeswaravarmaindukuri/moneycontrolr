import { createClient } from "@/lib/supabase/server";
import { hasConfiguredSupabaseEnv } from "@/lib/security/supabase-config";
import {
  calculateBudgetPeriod,
  calculateFinancialSummary,
  toPaise,
  toRupees,
  type BudgetPeriod,
  type FinancialSummary,
} from "@/lib/calculations/finance";
import { classifyCategory } from "@/lib/calculations/analytics";
import { getTodayYMD } from "@/lib/date";
import type { Budget, Profile, Transaction } from "@/types/database.types";

export interface VerifiedBudgetContext {
  user: {
    id: string;
    email: string;
    displayName: string;
  };
  hasBudget: boolean;
  budget?: Budget;
  budgetPeriod?: BudgetPeriod;
  transactions: Transaction[];
  summary?: FinancialSummary;
  needsSpent: number;
  wantsSpent: number;
}

/**
 * Shared server-side loader for Dashboard and Budgets pages.
 * Verifies confirmed email status, queries the active billing cycle, and runs integer-paise aggregation.
 */
export async function loadVerifiedBudgetContext(): Promise<VerifiedBudgetContext | null> {
  if (!hasConfiguredSupabaseEnv()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email_confirmed_at) {
    return null;
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const profile = profileData as unknown as Profile | null;
  const displayName =
    profile?.display_name ||
    (user.user_metadata?.display_name as string | undefined) ||
    user.email?.split("@")[0] ||
    "Student";

  const todayStr = getTodayYMD();

  // Prefer a budget covering today's IST date; fall back to the most recently created budget
  const { data: currentCycleBudget } = await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", user.id)
    .lte("budget_start_date", todayStr)
    .gte("budget_end_date", todayStr)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let budgetData = currentCycleBudget;
  if (!budgetData) {
    const { data: latestBudget } = await supabase
      .from("budgets")
      .select("*")
      .eq("user_id", user.id)
      .order("budget_start_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    budgetData = latestBudget;
  }

  const budget = budgetData as unknown as Budget | null;

  if (!budget) {
    return {
      user: {
        id: user.id,
        email: user.email || "",
        displayName,
      },
      hasBudget: false,
      transactions: [],
      needsSpent: 0,
      wantsSpent: 0,
    };
  }

  const budgetPeriod = calculateBudgetPeriod(
    new Date(),
    budget.budget_start_date,
    budget.budget_end_date,
    todayStr
  );

  const { data: transactionsData } = await supabase
    .from("transactions")
    .select("*, category:categories(*)")
    .eq("user_id", user.id)
    .gte("transaction_date", budgetPeriod.startDate)
    .lte("transaction_date", budgetPeriod.endDate)
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false });

  const transactions = (transactionsData || []) as unknown as Transaction[];

  let totalExpensesPaise = 0;
  let totalIncomePaise = 0;
  let todaySpentPaise = 0;
  let needsSpentPaise = 0;
  let wantsSpentPaise = 0;

  for (const tx of transactions) {
    const amtPaise = toPaise(Number(tx.amount));
    if (tx.type === "expense") {
      totalExpensesPaise += amtPaise;
      if (tx.transaction_date === todayStr) {
        todaySpentPaise += amtPaise;
      }

      if (classifyCategory(tx.category?.name || "") === "needs") {
        needsSpentPaise += amtPaise;
      } else {
        wantsSpentPaise += amtPaise;
      }
    } else if (tx.type === "income") {
      totalIncomePaise += amtPaise;
    }
  }

  const summary = calculateFinancialSummary({
    monthlyAllowance: Number(budget.monthly_allowance),
    totalExpensesThisMonth: toRupees(totalExpensesPaise),
    totalIncomeThisMonth: toRupees(totalIncomePaise),
    todaySpent: toRupees(todaySpentPaise),
    budgetPeriod,
  });

  return {
    user: {
      id: user.id,
      email: user.email || "",
      displayName,
    },
    hasBudget: true,
    budget,
    budgetPeriod,
    transactions,
    summary,
    needsSpent: toRupees(needsSpentPaise),
    wantsSpent: toRupees(wantsSpentPaise),
  };
}

