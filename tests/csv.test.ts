import assert from "node:assert";
import { escapeCSVCell, generateTransactionsCSV } from "../src/lib/export/csv.ts";
import type { Transaction } from "../src/types/database.types.ts";

console.log("==========================================");
console.log("RUNNING CSV EXPORT ENGINE INTEGRITY TESTS");
console.log("==========================================");

// 1. Escaping tests
assert.strictEqual(escapeCSVCell("Normal"), '"Normal"');
assert.strictEqual(escapeCSVCell("Food, Snacks & Tea"), '"Food, Snacks & Tea"');
assert.strictEqual(escapeCSVCell('T-Shirt "Large"'), '"T-Shirt ""Large"""');
assert.strictEqual(escapeCSVCell("Line 1\nLine 2"), '"Line 1\nLine 2"');
assert.strictEqual(escapeCSVCell(null), '""');
assert.strictEqual(escapeCSVCell(250.5), '"250.5"');
assert.strictEqual(escapeCSVCell("=CMD|'/C calc'!A0"), '"\'=CMD|\'/C calc\'!A0"');
assert.strictEqual(escapeCSVCell("+SUM(A1:A2)"), '"\'+SUM(A1:A2)"');
assert.strictEqual(escapeCSVCell("-2+3"), '"\'-2+3"');
assert.strictEqual(escapeCSVCell("@SUM(1,1)"), '"\'@SUM(1,1)"');
assert.strictEqual(escapeCSVCell("\t=1"), '"\'\t=1"');
console.log("[PASS] CSV cell escaping conforms to RFC 4180 and blocks formula injection");

// 2. Transaction formatting tests
const mockTransactions: Transaction[] = [
  {
    id: "tx-abc-123",
    user_id: "user-1",
    category_id: "cat-1",
    amount: 150.0,
    type: "expense",
    payment_source: "upi",
    transaction_date: "2026-11-10",
    note: "Lunch, Canteen",
    created_at: "",
    updated_at: "",
    category: {
      id: "cat-1",
      name: "Food & Drink",
      type: "expense",
      icon: "Utensils",
      color: "#145C43",
      created_at: "",
    },
  },
  {
    id: "tx-def-456",
    user_id: "user-1",
    category_id: "cat-2",
    amount: 5000.0,
    type: "income",
    payment_source: "netbanking",
    transaction_date: "2026-11-01",
    note: "Parental Allowance",
    created_at: "",
    updated_at: "",
    category: {
      id: "cat-2",
      name: "Parental Allowance",
      type: "income",
      icon: "HeartHandshake",
      color: "#145C43",
      created_at: "",
    },
  },
];

const csvOutput = generateTransactionsCSV(mockTransactions);
const lines = csvOutput.split("\r\n");

// Assert header
assert.strictEqual(
  lines[0],
  '"Date","Type","Category","Amount (INR)","Payment Method","Notes","Transaction ID"'
);
assert.strictEqual(lines.length, 3); // 1 header + 2 data rows

// Assert row 1 contents
assert.ok(lines[1].includes('"2026-11-10"'));
assert.ok(lines[1].includes('"expense"'));
assert.ok(lines[1].includes('"Food & Drink"'));
assert.ok(lines[1].includes('"150.00"'));
assert.ok(lines[1].includes('"UPI"'));
assert.ok(lines[1].includes('"Lunch, Canteen"')); // escaped comma
assert.ok(lines[1].includes('"tx-abc-123"'));

// Assert row 2 contents
assert.ok(lines[2].includes('"income"'));
assert.ok(lines[2].includes('"5000.00"'));
assert.ok(lines[2].includes('"NETBANKING"'));

console.log("[PASS] CSV generator accurately serializes transactions with headers and decimal formatting");

console.log("==========================================");
console.log("ALL CSV EXPORT TESTS PASSED (100%)");
console.log("==========================================");

