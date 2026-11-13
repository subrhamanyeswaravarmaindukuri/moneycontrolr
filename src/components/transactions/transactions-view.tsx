"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { toPaise, toRupees } from "@/lib/calculations/finance";
import { addDaysYMD, getTodayYMD } from "@/lib/date";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Transaction, Category, PaymentSource, TransactionType } from "@/types/database.types";
import { TransactionCard } from "./transaction-card";
import { DeleteDialog } from "./delete-dialog";
import { TransactionForm } from "./transaction-form";
import { downloadTransactionsCSV } from "@/lib/export/csv";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  TrendingDown,
  TrendingUp,
  Receipt,
  ArrowUpDown,
  X,
  CreditCard,
  Edit2,
  Download,
} from "lucide-react";

interface TransactionsViewProps {
  initialTransactions: Transaction[];
  categories: Category[];
}

export function TransactionsView({
  initialTransactions,
  categories,
}: TransactionsViewProps) {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | TransactionType>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");

  useEffect(() => {
    setTransactions(initialTransactions);
  }, [initialTransactions]);

  // Edit & Delete Dialog States
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const noteMatch = tx.note?.toLowerCase().includes(query);
        const categoryMatch = tx.category?.name?.toLowerCase().includes(query);
        if (!noteMatch && !categoryMatch) return false;
      }

      // 2. Type Filter
      if (typeFilter !== "all" && tx.type !== typeFilter) {
        return false;
      }

      // 3. Category Filter
      if (categoryFilter !== "all" && tx.category_id !== categoryFilter) {
        return false;
      }

      // 4. Payment Source Filter
      if (paymentFilter !== "all" && tx.payment_source !== paymentFilter) {
        return false;
      }

      return true;
    });
  }, [transactions, searchQuery, typeFilter, categoryFilter, paymentFilter]);

  // Group transactions by date (integer paise accumulation)
  const groupedByDate = useMemo(() => {
    const rawGroups: Record<
      string,
      { transactions: Transaction[]; expensePaise: number; incomePaise: number }
    > = {};

    filteredTransactions.forEach((tx) => {
      const date = tx.transaction_date;
      if (!rawGroups[date]) {
        rawGroups[date] = { transactions: [], expensePaise: 0, incomePaise: 0 };
      }
      rawGroups[date].transactions.push(tx);
      const amtPaise = toPaise(Number(tx.amount));
      if (tx.type === "expense") {
        rawGroups[date].expensePaise += amtPaise;
      } else {
        rawGroups[date].incomePaise += amtPaise;
      }
    });

    const groups: Record<
      string,
      { transactions: Transaction[]; totalExpense: number; totalIncome: number }
    > = {};
    for (const [date, entry] of Object.entries(rawGroups)) {
      groups[date] = {
        transactions: entry.transactions,
        totalExpense: toRupees(entry.expensePaise),
        totalIncome: toRupees(entry.incomePaise),
      };
    }

    return groups;
  }, [filteredTransactions]);

  // Calculate totals for active filter in integer paise
  const { totalExpense, totalIncome } = useMemo(() => {
    let expPaise = 0;
    let incPaise = 0;
    filteredTransactions.forEach((tx) => {
      const amtPaise = toPaise(Number(tx.amount));
      if (tx.type === "expense") expPaise += amtPaise;
      else incPaise += amtPaise;
    });
    return {
      totalExpense: toRupees(expPaise),
      totalIncome: toRupees(incPaise),
    };
  }, [filteredTransactions]);

  // Helper to format date header consistently in Asia/Kolkata
  function formatDateHeader(dateStr: string): string {
    const today = getTodayYMD();
    const yesterday = addDaysYMD(today, -1);

    if (dateStr === today) return "Today";
    if (dateStr === yesterday) return "Yesterday";

    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-apptext tracking-tight">
            Transactions History
          </h1>
          <p className="text-xs sm:text-sm text-apptext-muted font-medium">
            Review, filter, and export your complete spending history.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button
            variant="outline"
            size="md"
            onClick={() => downloadTransactionsCSV(filteredTransactions)}
            disabled={filteredTransactions.length === 0}
            className="font-bold text-xs sm:text-sm flex-1 sm:flex-initial"
            title="Download CSV report of your transactions"
          >
            <Download className="w-4 h-4 mr-1.5 text-primary" />
            Export CSV ({filteredTransactions.length})
          </Button>

          <Link href="/transactions/new" className="flex-1 sm:flex-initial">
            <Button size="md" className="font-bold shadow-sm w-full">
              <Plus className="w-4 h-4 mr-1.5" />
              Add Transaction
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Top Metric Cards (Desktop 3-Column Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card variant="flat" className="p-4 sm:p-5 border-border bg-surface">
          <span className="text-xs text-apptext-muted font-medium block mb-1">
            Total Spent
          </span>
          <span className="text-lg sm:text-2xl font-black text-status-danger">
            -{formatCurrency(totalExpense)}
          </span>
        </Card>

        <Card variant="flat" className="p-4 sm:p-5 border-border bg-surface">
          <span className="text-xs text-apptext-muted font-medium block mb-1">
            Total Income
          </span>
          <span className="text-lg sm:text-2xl font-black text-status-success">
            +{formatCurrency(totalIncome)}
          </span>
        </Card>

        <Card variant="flat" className="col-span-2 sm:col-span-1 p-4 sm:p-5 border-border bg-surface">
          <span className="text-xs text-apptext-muted font-medium block mb-1">
            Net Cashflow
          </span>
          <span
            className={`text-lg sm:text-2xl font-black ${
              totalIncome - totalExpense >= 0 ? "text-primary" : "text-status-danger"
            }`}
          >
            {formatCurrency(totalIncome - totalExpense)}
          </span>
        </Card>
      </div>

      {/* 3. Search and Multi-Filter Bar */}
      <Card variant="flat" className="p-4 sm:p-5 border-border bg-surface space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-apptext-light" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by note, item or category..."
              className="w-full h-11 rounded-btn border border-border bg-background/50 pl-10 pr-3.5 text-sm text-apptext placeholder:text-apptext-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-3.5 text-apptext-light hover:text-apptext"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Type Toggle (All, Expense, Income) */}
          <div className="inline-flex p-1 rounded-btn bg-background border border-border shrink-0">
            <button
              onClick={() => setTypeFilter("all")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                typeFilter === "all" ? "bg-surface text-apptext shadow-sm" : "text-apptext-muted hover:text-apptext"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter("expense")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                typeFilter === "expense" ? "bg-surface text-apptext shadow-sm" : "text-apptext-muted hover:text-apptext"
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => setTypeFilter("income")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                typeFilter === "income" ? "bg-primary text-white shadow-sm" : "text-apptext-muted hover:text-apptext"
              }`}
            >
              Income
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-11 rounded-btn border border-border bg-background/50 px-3 text-xs sm:text-sm font-semibold text-apptext focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.type})
              </option>
            ))}
          </select>

          {/* Payment Method Dropdown */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="h-11 rounded-btn border border-border bg-background/50 px-3 text-xs sm:text-sm font-semibold text-apptext focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <option value="all">All Payment Sources</option>
            <option value="upi">UPI</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="bank_transfer">NetBanking</option>
            <option value="other">Other</option>
          </select>
        </div>
      </Card>

      {/* 4. Grouped Transactions List */}
      <div className="space-y-6">
        {Object.keys(groupedByDate).length === 0 ? (
          /* Empty State */
          <Card variant="flat" className="p-10 text-center border-dashed border-border bg-surface/60 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center text-primary mx-auto">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-apptext">No transactions found</h3>
            <p className="text-xs sm:text-sm text-apptext-muted max-w-sm mx-auto">
              {searchQuery || typeFilter !== "all" || categoryFilter !== "all"
                ? "No transactions match your current filters. Try resetting your search."
                : "You haven't logged any expenses or income yet. Start by adding your first transaction!"}
            </p>
            <div className="pt-2">
              <Link href="/transactions/new">
                <Button size="md" className="font-bold">
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Your First Transaction
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          /* Date Groups */
          Object.entries(groupedByDate).map(([date, data]) => (
            <div key={date} className="space-y-2.5">
              {/* Date Group Header with Daily Total */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-xs sm:text-sm font-extrabold text-apptext">
                    {formatDateHeader(date)}
                  </span>
                  <span className="text-xs text-apptext-light font-medium">({date})</span>
                </div>

                <div className="text-xs font-bold text-apptext-muted">
                  {data.totalExpense > 0 && (
                    <span className="text-apptext">
                      Spent: <span className="text-status-danger font-extrabold">-{formatCurrency(data.totalExpense)}</span>
                    </span>
                  )}
                  {data.totalExpense > 0 && data.totalIncome > 0 && <span> • </span>}
                  {data.totalIncome > 0 && (
                    <span className="text-status-success font-extrabold">
                      +{formatCurrency(data.totalIncome)}
                    </span>
                  )}
                </div>
              </div>

              {/* Transactions in this Date Group */}
              <div className="space-y-2">
                {data.transactions.map((tx) => (
                  <TransactionCard
                    key={tx.id}
                    transaction={tx}
                    onEdit={(t) => setTransactionToEdit(t)}
                    onDelete={(t) => setTransactionToDelete(t)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 5. Safe Delete Dialog Confirmation */}
      <DeleteDialog
        transaction={transactionToDelete}
        isOpen={Boolean(transactionToDelete)}
        onClose={() => setTransactionToDelete(null)}
        onDeleted={() => {
          if (transactionToDelete) {
            setTransactions((prev) => prev.filter((t) => t.id !== transactionToDelete.id));
          }
        }}
      />

      {/* 6. Edit Transaction Modal */}
      {transactionToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <Card variant="elevated" className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-surface border-border shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-primary" />
                <h3 className="text-lg font-bold text-apptext">Edit Transaction</h3>
              </div>
              <button
                onClick={() => setTransactionToEdit(null)}
                className="p-1 rounded-lg text-apptext-muted hover:bg-background"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <CardContent className="p-6">
              <TransactionForm
                categories={categories}
                initialData={transactionToEdit}
                onSuccess={() => {
                  setTransactionToEdit(null);
                  router.refresh();
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

