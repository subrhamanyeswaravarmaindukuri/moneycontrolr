import type { Transaction } from "@/types/database.types";
import { getTodayYMD } from "../date.ts";

/**
 * Escapes CSV cell contents according to RFC 4180 and neutralizes CSV/spreadsheet
 * formula injection (leading =, +, -, @, tab, CR) on text fields.
 */
export function escapeCSVCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return '""';
  }

  let str = String(value);

  // Neutralize formula injection on string cells before quoting
  if (typeof value === "string" && /^(\s*[=+\-@\t\r])/.test(str)) {
    str = `'${str}`;
  }

  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Converts an array of Transactions to an RFC 4180 compliant CSV string.
 */
export function generateTransactionsCSV(transactions: Transaction[]): string {
  const headers = [
    "Date",
    "Type",
    "Category",
    "Amount (INR)",
    "Payment Method",
    "Notes",
    "Transaction ID",
  ];

  const headerRow = headers.map(escapeCSVCell).join(",");

  const rows = transactions.map((tx) => {
    const categoryName = tx.category?.name || "Uncategorized";
    const payment = tx.payment_source.toUpperCase();
    const amountStr = Number(tx.amount).toFixed(2);
    const notes = tx.note || "";

    return [
      escapeCSVCell(tx.transaction_date),
      escapeCSVCell(tx.type),
      escapeCSVCell(categoryName),
      escapeCSVCell(amountStr),
      escapeCSVCell(payment),
      escapeCSVCell(notes),
      escapeCSVCell(tx.id),
    ].join(",");
  });

  return [headerRow, ...rows].join("\r\n");
}

/**
 * Triggers a browser download of the transactions as a CSV file.
 */
export function downloadTransactionsCSV(
  transactions: Transaction[],
  customFilename?: string
): void {
  if (typeof window === "undefined") return;

  const csvContent = generateTransactionsCSV(transactions);
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });

  const today = getTodayYMD();
  const filename = customFilename || `moneycontrolr_transactions_${today}.csv`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
