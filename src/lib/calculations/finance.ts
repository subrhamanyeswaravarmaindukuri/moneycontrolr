/**
 * MoneyControlr Financial Calculation Engine
 *
 * DESIGN PRINCIPLES:
 * 1. Financial Precision: Internal calculations are performed in integer subunits (Paise: 1 INR = 100 Paise)
 *    to eliminate floating-point precision drifts.
 * 2. Dynamic Self-Balancing Allowance:
 *    Daily Allowance = Remaining Monthly Budget / Remaining Days in Billing Period.
 * 3. Timezone Consistency: Date periods resolve consistently in Asia/Kolkata (IST) using pure UTC day math.
 */

import { getCurrentMonthBoundsYMD, getTodayYMD, parseYMDToUTCDate } from "../date.ts";

export interface BudgetPeriod {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalDays: number;
  remainingDays: number;
  currentDayIndex: number; // 1-indexed (e.g. Day 5 of 30)
}

export interface FinancialSummary {
  monthlyAllowance: number;
  totalExpensesThisMonth: number;
  totalIncomeThisMonth: number;
  remainingMonthlyBudget: number;
  todaySpendingLimit: number;
  todaySpent: number;
  todayRemainingSafeToSpend: number;
  isOverspentToday: boolean;
  overspentAmountToday: number;
  budgetPeriod: BudgetPeriod;
}

/**
 * Converts rupees to integer paise (1 Rupee = 100 Paise).
 */
export function toPaise(rupees: number): number {
  if (!Number.isFinite(rupees)) return 0;
  return Math.round((rupees + Number.EPSILON) * 100);
}

/**
 * Converts integer paise back to rupees.
 */
export function toRupees(paise: number): number {
  return Math.round(paise) / 100;
}

/**
 * Sums an array/iterable of rupee values safely in integer paise.
 */
export function sumAmountsInPaise(amounts: Iterable<number | string>): number {
  let totalPaise = 0;
  for (const val of amounts) {
    totalPaise += toPaise(Number(val) || 0);
  }
  return totalPaise;
}

/**
 * Sums an array/iterable of rupee values and returns exact rupees (no IEEE-754 float drift).
 */
export function sumRupees(amounts: Iterable<number | string>): number {
  return toRupees(sumAmountsInPaise(amounts));
}

/**
 * Calculates the budget period dates and remaining days cleanly without DST/UTC drift.
 * Falls back safely to the current IST calendar month if custom dates are missing, malformed, or reversed.
 */
export function calculateBudgetPeriod(
  referenceDate: Date = new Date(),
  customStartDate?: string,
  customEndDate?: string,
  referenceYMD?: string
): BudgetPeriod {
  const todayYMD =
    referenceYMD && parseYMDToUTCDate(referenceYMD)
      ? referenceYMD
      : getTodayYMD(referenceDate);

  const todayUtc = parseYMDToUTCDate(todayYMD)!;
  const fallbackBounds = getCurrentMonthBoundsYMD(referenceDate);

  let startYMD = fallbackBounds.startDate;
  let endYMD = fallbackBounds.endDate;

  if (customStartDate && customEndDate) {
    const parsedStart = parseYMDToUTCDate(customStartDate);
    const parsedEnd = parseYMDToUTCDate(customEndDate);
    if (parsedStart && parsedEnd && parsedEnd.getTime() >= parsedStart.getTime()) {
      startYMD = customStartDate.trim();
      endYMD = customEndDate.trim();
    }
  }

  const startUtc = parseYMDToUTCDate(startYMD)!;
  const endUtc = parseYMDToUTCDate(endYMD)!;
  const msPerDay = 86_400_000;

  const totalDays = Math.max(
    1,
    Math.round((endUtc.getTime() - startUtc.getTime()) / msPerDay) + 1
  );

  const diffDaysFromToday =
    Math.round((endUtc.getTime() - todayUtc.getTime()) / msPerDay) + 1;
  const remainingDays = Math.max(1, Math.min(totalDays, diffDaysFromToday));
  const currentDayIndex = Math.max(1, Math.min(totalDays, totalDays - remainingDays + 1));

  return {
    startDate: startYMD,
    endDate: endYMD,
    totalDays,
    remainingDays,
    currentDayIndex,
  };
}

/**
 * Computes all key financial figures accurately in integer paise.
 */
export function calculateFinancialSummary({
  monthlyAllowance,
  totalExpensesThisMonth,
  totalIncomeThisMonth,
  todaySpent,
  budgetPeriod,
}: {
  monthlyAllowance: number;
  totalExpensesThisMonth: number;
  totalIncomeThisMonth: number;
  todaySpent: number;
  budgetPeriod: BudgetPeriod;
}): FinancialSummary {
  const allowancePaise = toPaise(monthlyAllowance);
  const expensesPaise = toPaise(totalExpensesThisMonth);
  const incomePaise = toPaise(totalIncomeThisMonth);
  const todaySpentPaise = toPaise(todaySpent);

  const remainingBudgetPaise = Math.max(0, allowancePaise + incomePaise - expensesPaise);

  const budgetAtStartOfTodayPaise = remainingBudgetPaise + todaySpentPaise;
  const safeRemainingDays = Math.max(1, budgetPeriod.remainingDays);
  const rawDailyLimitPaise = Math.floor(budgetAtStartOfTodayPaise / safeRemainingDays);

  const remainingSafeToSpendPaise = rawDailyLimitPaise - todaySpentPaise;
  const isOverspentToday = remainingSafeToSpendPaise < 0;
  const overspentAmountPaise = isOverspentToday ? Math.abs(remainingSafeToSpendPaise) : 0;

  return {
    monthlyAllowance: toRupees(allowancePaise),
    totalExpensesThisMonth: toRupees(expensesPaise),
    totalIncomeThisMonth: toRupees(incomePaise),
    remainingMonthlyBudget: toRupees(remainingBudgetPaise),
    todaySpendingLimit: toRupees(rawDailyLimitPaise),
    todaySpent: toRupees(todaySpentPaise),
    todayRemainingSafeToSpend: toRupees(Math.max(0, remainingSafeToSpendPaise)),
    isOverspentToday,
    overspentAmountToday: toRupees(overspentAmountPaise),
    budgetPeriod,
  };
}
