"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getTodayYMD } from "@/lib/date";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
  Category,
  PaymentSource,
  Transaction,
  TransactionType,
} from "@/types/database.types";
import {
  Utensils,
  ShoppingBag,
  Bus,
  Receipt,
  GraduationCap,
  Film,
  HeartPulse,
  MoreHorizontal,
  Briefcase,
  Award,
  Clock,
  Laptop,
  PlusCircle,
  HeartHandshake,
  CreditCard,
  Banknote,
  Smartphone,
  Landmark,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Plus,
  Coffee,
  Pizza,
  Shirt,
  Home,
  Wifi,
  Car,
  Fuel,
  Dumbbell,
  Book,
  Gamepad,
  Gift,
  Sparkles,
} from "lucide-react";
import { createTransaction, updateTransaction } from "@/app/transactions/actions";
import { CreateCategoryDialog } from "./create-category-dialog";

const ICON_MAP: Record<string, React.ElementType> = {
  Utensils,
  ShoppingBag,
  Bus,
  Receipt,
  GraduationCap,
  Film,
  HeartPulse,
  MoreHorizontal,
  Briefcase,
  Award,
  Clock,
  Laptop,
  PlusCircle,
  HeartHandshake,
  Coffee,
  Pizza,
  Shirt,
  Home,
  Wifi,
  Car,
  Fuel,
  Dumbbell,
  Book,
  Gamepad,
  Gift,
  Sparkles,
};

const PAYMENT_SOURCES: { id: PaymentSource; label: string; icon: React.ElementType }[] = [
  { id: "upi", label: "UPI (GPay / PhonePe)", icon: Smartphone },
  { id: "cash", label: "Cash", icon: Banknote },
  { id: "card", label: "Debit / Credit Card", icon: CreditCard },
  { id: "bank_transfer", label: "NetBanking", icon: Landmark },
  { id: "other", label: "Other", icon: MoreHorizontal },
];

interface TransactionFormProps {
  categories: Category[];
  initialData?: Transaction;
  onSuccess?: () => void;
}

export function TransactionForm({
  categories,
  initialData,
  onSuccess,
}: TransactionFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData);

  const [categoryList, setCategoryList] = useState<Category[]>(categories);
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);

  const [type, setType] = useState<TransactionType>(initialData?.type || "expense");
  const [amount, setAmount] = useState<string>(initialData ? String(initialData.amount) : "");
  const [categoryId, setCategoryId] = useState<string>(initialData?.category_id || "");
  const [paymentSource, setPaymentSource] = useState<PaymentSource>(initialData?.payment_source || "upi");
  const [transactionDate, setTransactionDate] = useState<string>(
    initialData?.transaction_date || getTodayYMD()
  );
  const [note, setNote] = useState<string>(initialData?.note || "");
  const [isPending, setIsPending] = useState(false);
  const submittingRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  // Sync categoryList with incoming prop updates if any
  useEffect(() => {
    setCategoryList(categories);
  }, [categories]);

  // Filter categories by active transaction type
  const filteredCategories = categoryList.filter((c) => c.type === type);

  // Keep categoryId synchronized cleanly inside effect instead of during render
  useEffect(() => {
    const activeCategory = filteredCategories.find((c) => c.id === categoryId);
    if (!activeCategory && filteredCategories.length > 0) {
      setCategoryId(filteredCategories[0].id);
    }
  }, [filteredCategories, categoryId]);

  const handleCategoryCreated = (newCat: Category) => {
    setCategoryList((prev) => [...prev, newCat]);
    setType(newCat.type);
    setCategoryId(newCat.id);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submittingRef.current || isPending) return;
    submittingRef.current = true;
    setIsPending(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("amount", amount);
      formData.append("type", type);
      formData.append("categoryId", categoryId);
      formData.append("paymentSource", paymentSource);
      formData.append("transactionDate", transactionDate);
      formData.append("note", note);

      const res =
        isEditing && initialData
          ? await updateTransaction(initialData.id, null, formData)
          : await createTransaction(null, formData);

      if (res.error) {
        setError(res.error);
      } else {
        router.refresh();
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/transactions");
        }
      }
    } finally {
      submittingRef.current = false;
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3.5 rounded-btn bg-status-dangerLight border border-status-danger/20 text-status-danger text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Transaction Type Toggle (Expense vs Income) */}
      <div className="grid grid-cols-2 p-1.5 rounded-btn bg-background border border-border">
        <button
          type="button"
          onClick={() => {
            setType("expense");
            const firstExp = categories.find((c) => c.type === "expense");
            if (firstExp) setCategoryId(firstExp.id);
          }}
          className={`py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${
            type === "expense"
              ? "bg-surface text-apptext shadow-sm border border-border"
              : "text-apptext-muted hover:text-apptext"
          }`}
        >
          Expense (Spending)
        </button>
        <button
          type="button"
          onClick={() => {
            setType("income");
            const firstInc = categories.find((c) => c.type === "income");
            if (firstInc) setCategoryId(firstInc.id);
          }}
          className={`py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${
            type === "income"
              ? "bg-primary text-white shadow-sm"
              : "text-apptext-muted hover:text-apptext"
          }`}
        >
          Income (Money In)
        </button>
      </div>

      {/* 2. Amount Input (Large, Prominent) */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-apptext-muted">
          Amount
        </label>
        <div className="relative">
          <span className="absolute left-4 top-3 text-apptext-muted font-black text-xl">
            ₹
          </span>
          <input
            type="number"
            step="0.01"
            min="0.01"
            max="100000000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
            className="w-full h-14 rounded-btn border border-border bg-surface pl-10 pr-4 text-2xl font-black text-apptext placeholder:text-apptext-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm"
          />
        </div>
      </div>

      {/* 3. Category Selector Grid */}
      <div className="space-y-2.5">
        <label className="block text-xs font-bold uppercase tracking-wider text-apptext-muted">
          Category
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {filteredCategories.map((cat) => {
            const IconComponent = cat.icon ? ICON_MAP[cat.icon] || MoreHorizontal : MoreHorizontal;
            const isSelected = categoryId === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryId(cat.id)}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all text-xs ${
                  isSelected
                    ? "bg-primary-light border-primary text-primary font-bold shadow-sm"
                    : "bg-surface border-border text-apptext hover:bg-background"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? "bg-primary text-white" : "bg-background text-apptext-muted"
                  }`}
                >
                  <IconComponent className="w-3.5 h-3.5" />
                </div>
                <span className="truncate">{cat.name}</span>
              </button>
            );
          })}

          {/* Quick Add Custom Category Button */}
          <button
            type="button"
            onClick={() => setIsCreateCategoryOpen(true)}
            className="p-3 rounded-xl border border-dashed border-primary/40 text-left flex items-center gap-2.5 transition-all text-xs bg-primary-light/30 hover:bg-primary-light/60 text-primary font-bold group"
            title="Create a new custom category"
          >
            <div className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Plus className="w-4 h-4" />
            </div>
            <span className="truncate">+ Custom</span>
          </button>
        </div>

        {/* Modal for creating custom category */}
        <CreateCategoryDialog
          isOpen={isCreateCategoryOpen}
          onClose={() => setIsCreateCategoryOpen(false)}
          defaultType={type}
          onCategoryCreated={handleCategoryCreated}
        />
      </div>

      {/* 4. Payment Source Pills */}
      <div className="space-y-2.5">
        <label className="block text-xs font-bold uppercase tracking-wider text-apptext-muted">
          Payment Source
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PAYMENT_SOURCES.map((source) => {
            const IconComp = source.icon;
            const isSelected = paymentSource === source.id;

            return (
              <button
                key={source.id}
                type="button"
                onClick={() => setPaymentSource(source.id)}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all text-xs ${
                  isSelected
                    ? "bg-primary-light border-primary text-primary font-bold shadow-sm"
                    : "bg-surface border-border text-apptext hover:bg-background"
                }`}
              >
                <IconComp className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{source.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Date & Optional Note */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-apptext-muted">
            Transaction Date
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 absolute left-3.5 top-3.5 text-apptext-light pointer-events-none" />
            <input
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              required
              className="w-full h-11 rounded-btn border border-border bg-surface pl-10 pr-3.5 text-sm font-semibold text-apptext focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-apptext-muted">
            Note (Optional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            placeholder="e.g. Lunch with hostel friends"
            className="w-full h-11 rounded-btn border border-border bg-surface px-3.5 text-sm text-apptext placeholder:text-apptext-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
      </div>

      {/* Submit Action */}
      <div className="pt-2">
        <Button
          type="submit"
          size="lg"
          className="w-full font-bold shadow-sm text-base h-13"
          isLoading={isPending}
        >
          {isEditing ? "Update Transaction" : "Save Transaction"}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </form>
  );
}

