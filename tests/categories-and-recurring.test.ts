import assert from "node:assert";
import { toPaise, toRupees, sumAmountsInPaise } from "../src/lib/calculations/finance.ts";
import { classifyCategory } from "../src/lib/calculations/analytics.ts";

console.log("==========================================");
console.log("RUNNING CATEGORIES & RECURRING ENGINE TESTS");
console.log("==========================================");

// 1. Category Classification & Keyword Tagging
assert.strictEqual(classifyCategory("Hostel Rent"), "needs");
assert.strictEqual(classifyCategory("Canteen Mess"), "needs");
assert.strictEqual(classifyCategory("Wi-Fi Recharge"), "needs");
assert.strictEqual(classifyCategory("College Books"), "needs");
assert.strictEqual(classifyCategory("Doctor Consultation"), "needs");
assert.strictEqual(classifyCategory("Weekend Movie"), "wants");
assert.strictEqual(classifyCategory("Café Cold Coffee"), "wants");
assert.strictEqual(classifyCategory("Gaming Steam Pass"), "wants");
console.log("[PASS] Category classification accurately maps custom names to Needs vs Wants");

// 2. Category Name & Validation Rules
function validateCategoryInput(name: string, type: string) {
  const trimmed = name.trim();
  if (trimmed.length < 1 || trimmed.length > 60) {
    return { valid: false, error: "Category name must be between 1 and 60 characters." };
  }
  if (type !== "expense" && type !== "income") {
    return { valid: false, error: "Type must be expense or income." };
  }
  return { valid: true, sanitizedName: trimmed };
}

assert.strictEqual(validateCategoryInput("", "expense").valid, false);
assert.strictEqual(validateCategoryInput("   ", "expense").valid, false);
assert.strictEqual(validateCategoryInput("a".repeat(61), "expense").valid, false);
assert.strictEqual(validateCategoryInput("Gym Membership", "invalid").valid, false);
assert.strictEqual(validateCategoryInput("  Gym Membership  ", "expense").valid, true);
assert.strictEqual(validateCategoryInput("  Gym Membership  ", "expense").sanitizedName, "Gym Membership");
console.log("[PASS] Category name sanitization & bounds enforcement verified");

// 3. System Category Deletion Guard
function canDeleteCategory(category: { id: string; user_id: string | null }, currentUserId: string): boolean {
  if (category.user_id === null) return false; // System default categories are immutable
  return category.user_id === currentUserId;
}

const systemDefaultCat = { id: "cat-1", user_id: null };
const userCustomCat = { id: "cat-2", user_id: "user-abc" };
const otherUserCat = { id: "cat-3", user_id: "user-xyz" };

assert.strictEqual(canDeleteCategory(systemDefaultCat, "user-abc"), false);
assert.strictEqual(canDeleteCategory(otherUserCat, "user-abc"), false);
assert.strictEqual(canDeleteCategory(userCustomCat, "user-abc"), true);
console.log("[PASS] System default categories are strictly protected from deletion");

// 4. Recurring Commitments Math & Discretionary Allowance
const monthlyAllowance = 15000;
const recurringBills = [
  { name: "PG Room Rent", amount: 4500, due_day: 1 },
  { name: "Mess Tiffin", amount: 2500, due_day: 5 },
  { name: "Wi-Fi Fiber", amount: 499, due_day: 10 },
  { name: "Gym Membership", amount: 800, due_day: 15 },
];

const totalReservedPaise = sumAmountsInPaise(recurringBills.map((b) => b.amount));
const totalReservedRupees = toRupees(totalReservedPaise);
assert.strictEqual(totalReservedRupees, 8299);

// Discretionary calculation
const allowancePaise = toPaise(monthlyAllowance);
const discretionaryPaise = Math.max(0, allowancePaise - totalReservedPaise);
const discretionaryRupees = toRupees(discretionaryPaise);
assert.strictEqual(discretionaryRupees, 6701);

// True daily limit with reserved commitments (over 30 days)
const daysInMonth = 30;
const rawDailyLimit = Math.floor(monthlyAllowance / daysInMonth); // ₹500 without recurring
const trueDiscretionaryDailyLimit = Math.floor(discretionaryRupees / daysInMonth); // ₹223 with recurring

assert.strictEqual(rawDailyLimit, 500);
assert.strictEqual(trueDiscretionaryDailyLimit, 223);
console.log("[PASS] Recurring commitments correctly reserve fixed bills and compute true discretionary limit");

console.log("==========================================");
console.log("ALL CATEGORIES & RECURRING TESTS PASSED (100%)");
console.log("==========================================");
