import type { Budget, Transaction } from "@/types/database.types";
import { type FinancialSummary, sumAmountsInPaise, toPaise, toRupees } from "./finance.ts";
import { getTodayYMD, parseYMDToUTCDate } from "../date.ts";

export interface CategorySpend {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  type: "expense" | "income";
  classification: "needs" | "wants";
  totalSpent: number;
  percentageOfTotal: number;
  transactionCount: number;
  averageTransaction: number;
}

export interface SplitAnalysis {
  targetPercentage: number;
  targetAmount: number;
  actualAmount: number;
  actualPercentage: number;
  remainingAmount: number;
  isOverBudget: boolean;
  overAmount: number;
}

export interface BudgetSplits503020 {
  needs: SplitAnalysis;
  wants: SplitAnalysis;
  savings: {
    targetPercentage: number;
    targetAmount: number;
    currentSaved: number;
    projectedEndMonthSaved: number;
    savingsRatePercentage: number;
  };
}

export interface WeeklySpendItem {
  weekLabel: string;
  weekRange: string;
  totalSpent: number;
  dailyAverage: number;
  transactionCount: number;
  isCurrentWeek: boolean;
}

export interface FinancialHealth {
  score: number; // 0 to 100
  rating: "Excellent" | "Healthy" | "Moderate" | "Needs Attention";
  summaryText: string;
  projectedEndBalance: number;
  dailySpendingVelocity: number; // average rupees spent per day so far
  insights: {
    type: "positive" | "warning" | "neutral";
    title: string;
    description: string;
  }[];
}

/**
 * Classifies categories into Needs vs. Wants based on standard student expense baselines.
 */
export function classifyCategory(categoryName: string): "needs" | "wants" {
  const normalized = categoryName.toLowerCase().trim();
  const needsKeywords = [
    "food",
    "drink",
    "groceries",
    "mess",
    "tiffin",
    "travel",
    "bus",
    "metro",
    "fuel",
    "transport",
    "bill",
    "utilities",
    "recharge",
    "wifi",
    "electricity",
    "rent",
    "hostel",
    "education",
    "college",
    "tuition",
    "books",
    "exam",
    "health",
    "medicine",
    "doctor",
    "medical",
  ];

  const isNeed = needsKeywords.some((keyword) => normalized.includes(keyword));
  return isNeed ? "needs" : "wants";
}

/**
 * Aggregates all expense transactions into categorized ranks with percentages.
 */
export function calculateCategoryBreakdown(transactions: Transaction[]): CategorySpend[] {
  const expenseTransactions = transactions.filter((tx) => tx.type === "expense");
  const totalExpensePaise = expenseTransactions.reduce(
    (acc, tx) => acc + toPaise(Number(tx.amount)),
    0
  );

  const categoryMap = new Map<
    string,
    {
      name: string;
      icon: string;
      color: string;
      type: "expense" | "income";
      totalPaise: number;
      count: number;
    }
  >();

  expenseTransactions.forEach((tx) => {
    const catId = tx.category_id || "uncategorized";
    const catName = tx.category?.name || "Other Expense";
    const catIcon = tx.category?.icon || "MoreHorizontal";
    const catColor = tx.category?.color || "#475569";
    const amountPaise = toPaise(Number(tx.amount));

    if (!categoryMap.has(catId)) {
      categoryMap.set(catId, {
        name: catName,
        icon: catIcon,
        color: catColor,
        type: "expense",
        totalPaise: 0,
        count: 0,
      });
    }

    const current = categoryMap.get(catId)!;
    current.totalPaise += amountPaise;
    current.count += 1;
  });

  const result: CategorySpend[] = [];

  categoryMap.forEach((val, key) => {
    const totalSpent = toRupees(val.totalPaise);
    const percentageOfTotal =
      totalExpensePaise > 0 ? Math.round((val.totalPaise / totalExpensePaise) * 1000) / 10 : 0;
    const averageTransaction = val.count > 0 ? Math.round((totalSpent / val.count) * 100) / 100 : 0;

    result.push({
      categoryId: key,
      categoryName: val.name,
      categoryIcon: val.icon,
      categoryColor: val.color,
      type: "expense",
      classification: classifyCategory(val.name),
      totalSpent,
      percentageOfTotal,
      transactionCount: val.count,
      averageTransaction,
    });
  });

  // Sort descending by total spent
  return result.sort((a, b) => b.totalSpent - a.totalSpent);
}

/**
 * Computes deep 50/30/20 budget allocations versus real expenditure.
 */
export function calculate503020Progress(
  budget: Budget,
  transactions: Transaction[]
): BudgetSplits503020 {
  const allowance = Number(budget.monthly_allowance);
  const allowancePaise = toPaise(allowance);
  const needsPct = Number(budget.needs_percentage) || 50;
  const wantsPct = Number(budget.wants_percentage) || 30;
  const savingsPct = Number(budget.savings_percentage) || 20;

  const targetNeedsPaise = Math.round((allowancePaise * needsPct) / 100);
  const targetWantsPaise = Math.round((allowancePaise * wantsPct) / 100);
  const targetSavingsPaise = Math.round((allowancePaise * savingsPct) / 100);

  let actualNeedsPaise = 0;
  let actualWantsPaise = 0;
  let totalExpensesPaise = 0;
  let totalIncomePaise = 0;

  transactions.forEach((tx) => {
    const amtPaise = toPaise(Number(tx.amount));
    if (tx.type === "expense") {
      totalExpensesPaise += amtPaise;
      const categoryName = tx.category?.name || "Other Expense";
      if (classifyCategory(categoryName) === "needs") {
        actualNeedsPaise += amtPaise;
      } else {
        actualWantsPaise += amtPaise;
      }
    } else if (tx.type === "income") {
      totalIncomePaise += amtPaise;
    }
  });

  const targetNeeds = toRupees(targetNeedsPaise);
  const targetWants = toRupees(targetWantsPaise);
  const targetSavings = toRupees(targetSavingsPaise);
  const actualNeeds = toRupees(actualNeedsPaise);
  const actualWants = toRupees(actualWantsPaise);

  const needsSplit: SplitAnalysis = {
    targetPercentage: needsPct,
    targetAmount: targetNeeds,
    actualAmount: actualNeeds,
    actualPercentage:
      allowancePaise > 0 ? Math.round((actualNeedsPaise / allowancePaise) * 1000) / 10 : 0,
    remainingAmount: toRupees(Math.max(0, targetNeedsPaise - actualNeedsPaise)),
    isOverBudget: actualNeedsPaise > targetNeedsPaise,
    overAmount: toRupees(Math.max(0, actualNeedsPaise - targetNeedsPaise)),
  };

  const wantsSplit: SplitAnalysis = {
    targetPercentage: wantsPct,
    targetAmount: targetWants,
    actualAmount: actualWants,
    actualPercentage:
      allowancePaise > 0 ? Math.round((actualWantsPaise / allowancePaise) * 1000) / 10 : 0,
    remainingAmount: toRupees(Math.max(0, targetWantsPaise - actualWantsPaise)),
    isOverBudget: actualWantsPaise > targetWantsPaise,
    overAmount: toRupees(Math.max(0, actualWantsPaise - targetWantsPaise)),
  };

  // Savings is unspent allowance + income
  const currentSavedPaise = allowancePaise + totalIncomePaise - totalExpensesPaise;
  const clampedSavedPaise = Math.max(0, currentSavedPaise);
  const currentSaved = toRupees(clampedSavedPaise);

  return {
    needs: needsSplit,
    wants: wantsSplit,
    savings: {
      targetPercentage: savingsPct,
      targetAmount: targetSavings,
      currentSaved,
      projectedEndMonthSaved: currentSaved,
      savingsRatePercentage:
        allowancePaise > 0 ? Math.round((clampedSavedPaise / allowancePaise) * 100) : 0,
    },
  };
}

/**
 * Segregates transactions into 4 weekly brackets for chronological velocity tracking.
 */
export function calculateWeeklyBreakdown(
  transactions: Transaction[],
  _budgetStartDate: string,
  budgetEndDate: string
): WeeklySpendItem[] {
  const weeks: WeeklySpendItem[] = [
    { weekLabel: "Week 1", weekRange: "Days 1 – 7", totalSpent: 0, dailyAverage: 0, transactionCount: 0, isCurrentWeek: false },
    { weekLabel: "Week 2", weekRange: "Days 8 – 14", totalSpent: 0, dailyAverage: 0, transactionCount: 0, isCurrentWeek: false },
    { weekLabel: "Week 3", weekRange: "Days 15 – 21", totalSpent: 0, dailyAverage: 0, transactionCount: 0, isCurrentWeek: false },
    { weekLabel: "Week 4+", weekRange: "Days 22 – End", totalSpent: 0, dailyAverage: 0, transactionCount: 0, isCurrentWeek: false },
  ];

  const todayYMD = getTodayYMD();
  const currentDay = Number(todayYMD.split("-")[2]) || 1;

  if (currentDay <= 7) weeks[0].isCurrentWeek = true;
  else if (currentDay <= 14) weeks[1].isCurrentWeek = true;
  else if (currentDay <= 21) weeks[2].isCurrentWeek = true;
  else weeks[3].isCurrentWeek = true;

  const weekPaise = [0, 0, 0, 0];

  transactions
    .filter((tx) => tx.type === "expense")
    .forEach((tx) => {
      if (!parseYMDToUTCDate(tx.transaction_date)) return;
      const txDay = Number(tx.transaction_date.split("-")[2]);
      const amtPaise = toPaise(Number(tx.amount));

      let targetWeekIdx = 3;
      if (txDay <= 7) targetWeekIdx = 0;
      else if (txDay <= 14) targetWeekIdx = 1;
      else if (txDay <= 21) targetWeekIdx = 2;

      weekPaise[targetWeekIdx] += amtPaise;
      weeks[targetWeekIdx].transactionCount += 1;
    });

  const endDateParsed = parseYMDToUTCDate(budgetEndDate);
  const week4Days = endDateParsed ? Math.max(1, endDateParsed.getUTCDate() - 21) : 9;
  const daysInWeeks = [7, 7, 7, week4Days];

  weeks.forEach((w, idx) => {
    w.totalSpent = toRupees(weekPaise[idx]);
    w.dailyAverage = toRupees(Math.round(weekPaise[idx] / daysInWeeks[idx]));
  });

  return weeks;
}

/**
 * Calculates student Financial Health Score (0-100), projected month-end balance, and smart insights.
 */
export function calculateFinancialHealth(
  budget: Budget,
  summary: FinancialSummary,
  transactions: Transaction[]
): FinancialHealth {
  const allowance = Number(budget.monthly_allowance);
  const allowancePaise = toPaise(allowance);
  const daysElapsed = Math.max(1, summary.budgetPeriod.currentDayIndex);
  const remainingDays = Math.max(1, summary.budgetPeriod.remainingDays);
  const totalDays = Math.max(1, summary.budgetPeriod.totalDays);

  const totalSpent = summary.totalExpensesThisMonth;
  const totalSpentPaise = toPaise(totalSpent);
  const dailyVelocityPaise = Math.round(totalSpentPaise / daysElapsed);
  const dailyVelocity = toRupees(dailyVelocityPaise);
  const projectedTotalSpendPaise = totalSpentPaise + dailyVelocityPaise * remainingDays;
  const projectedEndBalance = toRupees(allowancePaise - projectedTotalSpendPaise);

  // Scoring engine (Base 100)
  let score = 100;

  // 1. Pacing penalty: If elapsed % of month < spent % of budget
  const timeProgressPct = (daysElapsed / totalDays) * 100;
  const spendProgressPct = allowancePaise > 0 ? (totalSpentPaise / allowancePaise) * 100 : 0;
  if (spendProgressPct > timeProgressPct + 5) {
    const diff = spendProgressPct - timeProgressPct;
    score -= Math.min(35, Math.round(diff * 1.2));
  }

  // 2. Wants ratio penalty: Wants should not exceed 35% of total spend
  const wantsTransactions = transactions.filter(
    (tx) => tx.type === "expense" && classifyCategory(tx.category?.name || "") === "wants"
  );
  const totalWantsPaise = sumAmountsInPaise(wantsTransactions.map((tx) => tx.amount));
  const wantsRatio = totalSpentPaise > 0 ? (totalWantsPaise / totalSpentPaise) * 100 : 0;
  if (wantsRatio > 35) {
    score -= Math.min(25, Math.round((wantsRatio - 35) * 1.5));
  }

  // 3. Today overspending penalty
  if (summary.isOverspentToday) {
    score -= 10;
  }

  // Clamp score between 10 and 100
  score = Math.max(10, Math.min(100, Math.round(score)));

  let rating: FinancialHealth["rating"] = "Excellent";
  let summaryText = "You are managing your daily allowance with great discipline!";

  if (score < 50) {
    rating = "Needs Attention";
    summaryText = "Your daily spending is outpacing your allowance. Implement a cool-down.";
  } else if (score < 70) {
    rating = "Moderate";
    summaryText = "You are close to your target pace, but discretionary expenses need watching.";
  } else if (score < 85) {
    rating = "Healthy";
    summaryText = "Good pacing! Keep monitoring your daily safe-to-spend limit.";
  }

  // Smart Insights Generation
  const insights: FinancialHealth["insights"] = [];

  if (projectedEndBalance >= Number(budget.monthly_allowance) * 0.2) {
    insights.push({
      type: "positive",
      title: "Target Savings on Track",
      description: `At your current velocity of ₹${dailyVelocity}/day, you are projected to save ₹${projectedEndBalance} by month-end.`,
    });
  } else if (projectedEndBalance < 0) {
    insights.push({
      type: "warning",
      title: "Potential Month-End Deficit",
      description: `If your current spending pace of ₹${dailyVelocity}/day continues, your allowance may exhaust ~${Math.round(summary.remainingMonthlyBudget / Math.max(1, dailyVelocity))} days early.`,
    });
  }

  if (wantsRatio > 35) {
    insights.push({
      type: "warning",
      title: "High Discretionary Spending",
      description: `Wants currently represent ${Math.round(wantsRatio)}% of your expenses. Aim to pause non-essential purchases for 3 days.`,
    });
  } else {
    insights.push({
      type: "positive",
      title: "Disciplined Wants Ratio",
      description: `Discretionary wants are nicely controlled at ${Math.round(wantsRatio)}% of total spending.`,
    });
  }

  insights.push({
    type: "neutral",
    title: "Daily Self-Balancing Active",
    description: `Your dynamic daily limit is currently ₹${summary.todaySpendingLimit}. Underspending today increases tomorrow's limit automatically.`,
  });

  return {
    score,
    rating,
    summaryText,
    projectedEndBalance,
    dailySpendingVelocity: dailyVelocity,
    insights,
  };
}
