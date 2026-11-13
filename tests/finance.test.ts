import {
  toPaise,
  toRupees,
  sumRupees,
  calculateBudgetPeriod,
  calculateFinancialSummary,
} from "../src/lib/calculations/finance.ts";
import {
  addDaysYMD,
  getTodayYMD,
  parseYMDToUTCDate,
  validateTransactionDateYMD,
} from "../src/lib/date.ts";

function runTests() {
  console.log("==========================================");
  console.log("RUNNING FINANCIAL ENGINE INTEGRITY TESTS");
  console.log("==========================================");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      process.exitCode = 1;
    }
  }

  // TEST 1: Currency subunit conversion (precision test)
  const paiseVal = toPaise(100.55);
  assert(paiseVal === 10055, "toPaise(100.55) converts accurately to 10055 integer paise");
  assert(toRupees(10055) === 100.55, "toRupees(10055) converts back to 100.55");

  // Floating point precision test (0.1 + 0.2)
  const precisionA = toPaise(0.1);
  const precisionB = toPaise(0.2);
  const precisionSum = toRupees(precisionA + precisionB);
  assert(precisionSum === 0.3, "0.1 + 0.2 in integer paise strictly equals 0.3 (no IEEE-754 drift)");

  // TEST 2: Daily Allowance Base Case (Specification Example)
  // Student receives ₹30,000 for a 30-day month.
  // Day 1: Daily limit = ₹1,000. Spends: Breakfast ₹100, Lunch ₹150, Travel ₹100 = ₹350.
  // Remaining safe-to-spend = ₹650.
  const mockPeriod30Days = {
    startDate: "2026-11-01",
    endDate: "2026-11-30",
    totalDays: 30,
    remainingDays: 30,
    currentDayIndex: 1,
  };

  const summaryDay1 = calculateFinancialSummary({
    monthlyAllowance: 30000,
    totalExpensesThisMonth: 350,
    totalIncomeThisMonth: 0,
    todaySpent: 350,
    budgetPeriod: mockPeriod30Days,
  });

  assert(summaryDay1.monthlyAllowance === 30000, "Monthly allowance is ₹30,000");
  assert(summaryDay1.todaySpendingLimit === 1000, "Initial daily limit is ₹1,000");
  assert(summaryDay1.todaySpent === 350, "Today's spent is ₹350");
  assert(summaryDay1.todayRemainingSafeToSpend === 650, "Remaining safe-to-spend is ₹650");
  assert(!summaryDay1.isOverspentToday, "User is not overspent today");

  // If user spends another ₹100 today:
  const summaryDay1Extra = calculateFinancialSummary({
    monthlyAllowance: 30000,
    totalExpensesThisMonth: 450,
    totalIncomeThisMonth: 0,
    todaySpent: 450,
    budgetPeriod: mockPeriod30Days,
  });
  assert(summaryDay1Extra.todayRemainingSafeToSpend === 550, "After spending extra ₹100, safe-to-spend is ₹550");

  // TEST 3: Dynamic Rollover to Day 2
  // After Day 1, total spent = ₹350. Remaining budget = ₹29,650.
  // Days remaining = 29.
  // Day 2 Limit = ₹29,650 / 29 = ₹1,022.41!
  const mockPeriodDay2 = {
    startDate: "2026-11-01",
    endDate: "2026-11-30",
    totalDays: 30,
    remainingDays: 29,
    currentDayIndex: 2,
  };

  const summaryDay2 = calculateFinancialSummary({
    monthlyAllowance: 30000,
    totalExpensesThisMonth: 350, // No spending yet on Day 2
    totalIncomeThisMonth: 0,
    todaySpent: 0,
    budgetPeriod: mockPeriodDay2,
  });

  assert(
    summaryDay2.todaySpendingLimit === 1022.41,
    `Day 2 dynamic daily limit rolls over saved money: ₹${summaryDay2.todaySpendingLimit} (expected 1022.41)`
  );
  assert(summaryDay2.todayRemainingSafeToSpend === 1022.41, "Day 2 safe-to-spend starts at ₹1022.41");

  // TEST 4: Overspending Safety Guard
  // Suppose user spent ₹2,000 on Day 1 (exceeded ₹1,000 daily limit by ₹1,000).
  const summaryOverspent = calculateFinancialSummary({
    monthlyAllowance: 30000,
    totalExpensesThisMonth: 2000,
    totalIncomeThisMonth: 0,
    todaySpent: 2000,
    budgetPeriod: mockPeriod30Days,
  });

  assert(summaryOverspent.isOverspentToday, "Detects overspending when user exceeds today's limit");
  assert(summaryOverspent.overspentAmountToday === 1000, "Identifies exact overspent amount: ₹1,000");
  assert(summaryOverspent.todayRemainingSafeToSpend === 0, "Safe-to-spend clamps cleanly to ₹0 when overspent");

  // TEST 5: Multi-term paise summation & IST timezone consistency
  const exactAggregate = sumRupees([0.1, 0.2, 19.99, 0.01, 100.5]);
  assert(exactAggregate === 120.8, `sumRupees avoids float drift cleanly (got ${exactAggregate})`);

  // 18:45 UTC = 00:15 IST next day (Asia/Kolkata is UTC+5:30)
  const utcEvening = new Date("2026-11-11T18:45:00.000Z");
  assert(
    getTodayYMD(utcEvening) === "2026-11-12",
    `getTodayYMD resolves Asia/Kolkata midnight boundary accurately (got ${getTodayYMD(utcEvening)})`
  );
  assert(addDaysYMD("2026-11-12", -1) === "2026-11-11", "addDaysYMD shifts dates cleanly");
  assert(parseYMDToUTCDate("2026-02-31") === null, "Rejects nonexistent calendar date 2026-02-31");
  assert(
    validateTransactionDateYMD("2019-12-31", utcEvening).valid === false,
    "Rejects out-of-bounds historical date"
  );

  // Reversed custom dates fall back safely instead of producing negative days
  const fallbackPeriod = calculateBudgetPeriod(utcEvening, "2026-11-30", "2026-11-01");
  assert(fallbackPeriod.totalDays === 30 && fallbackPeriod.remainingDays >= 1, "Malformed/reversed budget period falls back safely");

  console.log("==========================================");
  console.log(`TEST RESULTS: ${passed}/${total} passed (${((passed / total) * 100).toFixed(0)}%)`);
  console.log("==========================================");
}

runTests();
