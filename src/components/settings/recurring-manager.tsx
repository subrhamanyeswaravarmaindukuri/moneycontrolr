"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Category, PaymentSource, RecurringExpense } from "@/types/database.types";
import {
  createRecurringExpense,
  deleteRecurringExpense,
  logRecurringExpenseAsTransaction,
} from "@/app/transactions/actions";
import {
  CalendarClock,
  Plus,
  Trash2,
  CheckCircle2,
  X,
  CreditCard,
  Banknote,
  Smartphone,
  Landmark,
  MoreHorizontal,
  Zap,
} from "lucide-react";

const PAYMENT_SOURCES: { id: PaymentSource; label: string; icon: React.ElementType }[] = [
  { id: "upi", label: "UPI", icon: Smartphone },
  { id: "cash", label: "Cash", icon: Banknote },
  { id: "card", label: "Card", icon: CreditCard },
  { id: "bank_transfer", label: "Bank Transfer", icon: Landmark },
  { id: "other", label: "Other", icon: MoreHorizontal },
];

interface RecurringManagerProps {
  initialRecurring: RecurringExpense[];
  categories: Category[];
}

export function RecurringManager({ initialRecurring, categories }: RecurringManagerProps) {
  const router = useRouter();
  const [recurringList, setRecurringList] = useState<RecurringExpense[]>(initialRecurring);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState(
    categories.find((c) => c.type === "expense")?.id || ""
  );
  const [dueDay, setDueDay] = useState("1");
  const [paymentSource, setPaymentSource] = useState<PaymentSource>("upi");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const expenseCategories = categories.filter((c) => c.type === "expense");

  const totalMonthlyReserved = recurringList
    .filter((r) => r.is_active)
    .reduce((sum, r) => sum + Number(r.amount), 0);

  const formatINR = (amt: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amt);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessNotice(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("name", name.trim());
      formData.set("amount", amount);
      formData.set("categoryId", categoryId);
      formData.set("dueDay", dueDay);
      formData.set("paymentSource", paymentSource);
      formData.set("note", note);

      const result = await createRecurringExpense(formData);

      if (result.error) {
        setError(result.error);
      } else if (result.success && result.recurringExpense) {
        setRecurringList((prev) => [...prev, result.recurringExpense!]);
        setName("");
        setAmount("");
        setNote("");
        setIsDialogOpen(false);
        setSuccessNotice("Recurring commitment added successfully!");
        router.refresh();
      }
    });
  };

  const handleDelete = (id: string, billName: string) => {
    if (!confirm(`Are you sure you want to remove "${billName}" from recurring bills?`)) return;

    setError(null);
    setSuccessNotice(null);

    startTransition(async () => {
      const result = await deleteRecurringExpense(id);
      if (result.error) {
        setError(result.error);
      } else {
        setRecurringList((prev) => prev.filter((r) => r.id !== id));
        router.refresh();
      }
    });
  };

  const handleLogPaid = (rec: RecurringExpense) => {
    setError(null);
    setSuccessNotice(null);

    startTransition(async () => {
      const result = await logRecurringExpenseAsTransaction(rec.id);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccessNotice(`Successfully logged "${rec.name}" (${formatINR(rec.amount)}) as today's expense!`);
        router.refresh();
      }
    });
  };

  return (
    <Card variant="flat" className="p-6 bg-surface border-border shadow-card space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-apptext">Recurring Monthly Bills</h3>
          </div>
          <p className="text-xs text-apptext-muted">
            Track fixed commitments (Rent, Wi-Fi, Mess, Gym) so they are planned ahead of time.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {totalMonthlyReserved > 0 && (
            <div className="text-right hidden sm:block">
              <span className="text-[10px] uppercase font-bold text-apptext-muted">Total Fixed</span>
              <div className="text-sm font-black text-primary">{formatINR(totalMonthlyReserved)}/mo</div>
            </div>
          )}
          <Button
            size="sm"
            onClick={() => setIsDialogOpen(true)}
            className="font-bold text-xs shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Recurring Bill
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-status-dangerLight border border-status-danger/20 text-xs font-semibold text-status-danger">
          {error}
        </div>
      )}

      {successNotice && (
        <div className="p-3 rounded-lg bg-status-successLight border border-status-success/20 text-xs font-semibold text-status-success flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Recurring Bills List */}
      {recurringList.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-border rounded-xl bg-background/50 space-y-2">
          <CalendarClock className="w-8 h-8 text-apptext-muted mx-auto" />
          <h4 className="text-sm font-bold text-apptext">No recurring bills added yet</h4>
          <p className="text-xs text-apptext-muted max-w-sm mx-auto">
            Add fixed monthly commitments like Hostel Rent, Wi-Fi, or Mess fees to keep your daily allowance accurate.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {recurringList.map((rec) => (
            <div
              key={rec.id}
              className="p-4 rounded-xl border border-border bg-background/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary/30 transition-all"
            >
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary-light text-primary flex items-center justify-center font-bold text-xs shrink-0">
                  {rec.due_day}th
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-apptext">{rec.name}</span>
                    <Badge variant="neutral" size="sm">
                      Due Day {rec.due_day}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-apptext-muted flex items-center gap-2 mt-0.5">
                    <span>{rec.category?.name || "Expense"}</span>
                    <span>•</span>
                    <span className="uppercase">{rec.payment_source}</span>
                    {rec.note && (
                      <>
                        <span>•</span>
                        <span className="italic truncate max-w-[200px]">{rec.note}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-border">
                <div className="text-right">
                  <div className="text-base font-black text-apptext">{formatINR(rec.amount)}</div>
                  <div className="text-[10px] text-apptext-muted">Every month</div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleLogPaid(rec)}
                    disabled={isPending}
                    className="text-xs font-bold h-8 px-2.5 hover:bg-primary-light hover:text-primary hover:border-primary/40"
                    title="Log this bill as an expense today"
                  >
                    <Zap className="w-3.5 h-3.5 mr-1 text-primary" />
                    Log as Paid
                  </Button>

                  <button
                    type="button"
                    onClick={() => handleDelete(rec.id, rec.name)}
                    disabled={isPending}
                    className="p-1.5 rounded-lg text-apptext-muted hover:text-status-danger hover:bg-status-dangerLight transition-colors"
                    title={`Delete ${rec.name}`}
                    aria-label={`Delete ${rec.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Recurring Modal */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <Card variant="flat" className="max-w-md w-full bg-surface border-border shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border bg-background/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-primary">
                  <CalendarClock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-apptext">Add Recurring Bill</h2>
                  <p className="text-[11px] text-apptext-muted">Automate fixed student monthly commitments</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDialogOpen(false)}
                className="p-1 rounded-lg text-apptext-muted hover:text-apptext hover:bg-border/50"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="rec-name" className="text-xs font-bold text-apptext uppercase tracking-wider">
                  Bill / Commitment Name
                </label>
                <Input
                  id="rec-name"
                  placeholder="e.g. PG Room Rent, Mess Fee, Wi-Fi, Gym..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={80}
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="rec-amount" className="text-xs font-bold text-apptext uppercase tracking-wider">
                    Amount (₹)
                  </label>
                  <Input
                    id="rec-amount"
                    type="number"
                    step="1"
                    min="1"
                    max="100000000"
                    placeholder="e.g. 4000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="rec-due" className="text-xs font-bold text-apptext uppercase tracking-wider">
                    Due Day of Month
                  </label>
                  <select
                    id="rec-due"
                    value={dueDay}
                    onChange={(e) => setDueDay(e.target.value)}
                    className="w-full h-10 px-3 rounded-btn border border-border bg-surface text-sm font-semibold text-apptext focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-xs"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>
                        {d}
                        {d === 1 ? "st" : d === 2 ? "nd" : d === 3 ? "rd" : "th"} of month
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="rec-cat" className="text-xs font-bold text-apptext uppercase tracking-wider">
                  Category
                </label>
                <select
                  id="rec-cat"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full h-10 px-3 rounded-btn border border-border bg-surface text-sm font-semibold text-apptext focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-xs"
                >
                  {expenseCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-apptext uppercase tracking-wider">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_SOURCES.slice(0, 3).map((ps) => {
                    const isSelected = paymentSource === ps.id;
                    return (
                      <button
                        key={ps.id}
                        type="button"
                        onClick={() => setPaymentSource(ps.id)}
                        className={`p-2 rounded-lg text-xs font-bold border transition-all text-center ${
                          isSelected
                            ? "bg-primary-light border-primary text-primary"
                            : "bg-surface border-border text-apptext-muted hover:text-apptext"
                        }`}
                      >
                        {ps.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="rec-note" className="text-xs font-bold text-apptext uppercase tracking-wider">
                  Notes (Optional)
                </label>
                <Input
                  id="rec-note"
                  placeholder="e.g. Google Pay to Landlord"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={300}
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isPending}
                  className="flex-1 font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="md"
                  disabled={isPending || !name.trim() || !amount}
                  className="flex-1 font-bold shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  {isPending ? "Saving..." : "Save Bill"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </Card>
  );
}
