import assert from "node:assert";
import {
  classifyCategory,
  calculateCategoryBreakdown,
  calculate503020Progress,
  calculateWeeklyBreakdown,
  calculateFinancialHealth,
} from "../src/lib/calculations/analytics.ts";
import { calculateBudgetPeriod, calculateFinancialSummary } from "../src/lib/calculations/finance.ts";
import type { Budget, Transaction } from "../src/types/database.types.ts";

console.log("==========================================");
console.log("RUNNING ANALYTICS ENGINE INTEGRITY TESTS");
console.log("==========================================");

// 1. Classification
assert.strictEqual(classifyCategory("Food & Drink"), "needs");
assert.strictEqual(classifyCategory("College Tuition Fee"), "needs");
assert.strictEqual(classifyCategory("Bus Pass"), "needs");
assert.strictEqual(classifyCategory("Shopping"), "wants");
assert.strictEqual(classifyCategory("Gaming / Entertainment"), "wants");
console.log("[PASS] Category classification accurately maps Needs vs. Wants");

// Sample mock transactions
const mockTransactions: Transaction[] = [
  {
    id: "tx-1",
    user_id: "u-1",
    category_id: "c-food",
    amount: 1000,
    type: "expense",
    payment_source: "upi",
    transaction_date: "2026-11-03",
    note: "Mess fees",
    created_at: "2026-11-03T10:00:00Z",
    updated_at: "2026-11-03T10:00:00Z",
    category: {
      id: "c-food",
      name: "Food & Drink",
      type: "expense",
      icon: "Utensils",
      color: "#145C43",
      created_at: "",
    },
  },
  {
    id: "tx-2",
    user_id: "u-1",
    category_id: "c-shop",
    amount: 500,
    type: "expense",
    payment_source: "card",
    transaction_date: "2026-11-10",
    note: "New headphones",
    created_at: "2026-11-10T14:00:00Z",
    updated_at: "2026-11-10T14:00:00Z",
    category: {
      id: "c-shop",
      name: "Shopping",
      type: "expense",
      icon: "ShoppingBag",
      color: "#0E7490",
      created_at: "",
    },
  },
  {
    id: "tx-3",
    user_id: "u-1",
    category_id: "c-travel",
    amount: 500,
    type: "expense",
    payment_source: "cash",
    transaction_date: "2026-11-18",
    note: "Metro recharge",
    created_at: "2026-11-18T09:00:00Z",
    updated_at: "2026-11-18T09:00:00Z",
    category: {
      id: "c-travel",
      name: "Travel",
      type: "expense",
      icon: "Bus",
      color: "#B45309",
      created_at: "",
    },
  },
];

const mockBudget: Budget = {
  id: "b-1",
  user_id: "u-1",
  monthly_allowance: 10000,
  budget_start_date: "2026-11-01",
  budget_end_date: "2026-11-30",
  needs_percentage: 50,
  wants_percentage: 30,
  savings_percentage: 20,
  money_source: "parental_allowance",
  created_at: "2026-11-01T00:00:00Z",
  updated_at: "2026-11-01T00:00:00Z",
};

// 2. Category Breakdown
const breakdown = calculateCategoryBreakdown(mockTransactions);
assert.strictEqual(breakdown.length, 3);
assert.strictEqual(breakdown[0].categoryName, "Food & Drink");
assert.strictEqual(breakdown[0].totalSpent, 1000);
assert.strictEqual(breakdown[0].percentageOfTotal, 50.0);
console.log("[PASS] Category breakdown ranks top spending and percentages accurately");

// 3. 50/30/20 Progress
const progress503020 = calculate503020Progress(mockBudget, mockTransactions);
assert.strictEqual(progress503020.needs.targetAmount, 5000); // 50% of 10000
assert.strictEqual(progress503020.needs.actualAmount, 1500); // 1000 (food) + 500 (travel)
assert.strictEqual(progress503020.needs.isOverBudget, false);
assert.strictEqual(progress503020.wants.targetAmount, 3000); // 30% of 10000
assert.strictEqual(progress503020.wants.actualAmount, 500); // 500 (shopping)
assert.strictEqual(progress503020.savings.targetAmount, 2000); // 20% of 10000
assert.strictEqual(progress503020.savings.currentSaved, 8000); // 10000 - 2000
console.log("[PASS] 50/30/20 progress accurately compares actual vs targets");

// 4. Weekly Breakdown
const weeks = calculateWeeklyBreakdown(mockTransactions, "2026-11-01", "2026-11-30");
assert.strictEqual(weeks.length, 4);
assert.strictEqual(weeks[0].totalSpent, 1000); // Nov 3 in Week 1
assert.strictEqual(weeks[1].totalSpent, 500);  // Nov 10 in Week 2
assert.strictEqual(weeks[2].totalSpent, 500);  // Nov 18 in Week 3
console.log("[PASS] Weekly breakdown groups transactions into 7-day windows");

// 5. Financial Health
const period = calculateBudgetPeriod(new Date("2026-11-10"), "2026-11-01", "2026-11-30");
const summary = calculateFinancialSummary({
  monthlyAllowance: 10000,
  totalExpensesThisMonth: 2000,
  totalIncomeThisMonth: 0,
  todaySpent: 0,
  budgetPeriod: period,
});

const health = calculateFinancialHealth(mockBudget, summary, mockTransactions);
assert(health.score >= 70, "Health score should be healthy for disciplined spending");
assert(health.insights.length >= 2, "Should produce at least 2 actionable insights");
console.log(`[PASS] Financial health engine computed score: ${health.score} (${health.rating})`);

console.log("==========================================");
console.log("ALL ANALYTICS TESTS PASSED (100%)");
console.log("==========================================");
