"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { hasConfiguredSupabaseEnv } from "@/lib/security/supabase-config";
import { isValidUuid } from "@/lib/security/auth-validation";
import { createRateLimiter } from "@/lib/security/rate-limit";
import { getClientIpRateKey } from "@/lib/security/request-meta";
import { toPaise, toRupees } from "@/lib/calculations/finance";
import { validateTransactionDateYMD } from "@/lib/date";
import { PaymentSource, TransactionType, Category, Transaction } from "@/types/database.types";

export interface TransactionActionResult {
  error?: string;
  success?: boolean;
  transactionId?: string;
}

const VALID_TYPES = new Set<TransactionType>(["expense", "income"]);
const VALID_PAYMENT_SOURCES = new Set<PaymentSource>([
  "upi",
  "cash",
  "card",
  "bank_transfer",
  "other",
]);

const txMutationLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxAttempts: 30,
  maxEntries: 1000,
});

function validateAndSanitizeTransactionInput(formData: FormData):
  | {
      valid: true;
      data: {
        amount: number;
        type: TransactionType;
        categoryId: string;
        paymentSource: PaymentSource;
        transactionDate: string;
        note: string | null;
      };
    }
  | { valid: false; error: string } {
  const amountNum = Number(formData.get("amount"));
  if (!Number.isFinite(amountNum) || amountNum <= 0 || amountNum > 100_000_000) {
    return {
      valid: false,
      error: "Please enter a valid amount between ₹0.01 and ₹10,00,00,000.",
    };
  }
  const roundedAmount = toRupees(toPaise(amountNum));
  if (roundedAmount <= 0) {
    return { valid: false, error: "Please enter a valid amount greater than ₹0." };
  }

  const rawType = String(formData.get("type") ?? "expense");
  if (!VALID_TYPES.has(rawType as TransactionType)) {
    return { valid: false, error: "Invalid transaction type." };
  }
  const type = rawType as TransactionType;

  const categoryIdRaw = formData.get("categoryId");
  if (!isValidUuid(categoryIdRaw)) {
    return { valid: false, error: "Please select a valid category for this transaction." };
  }
  const categoryId = categoryIdRaw.trim();

  const rawSource = String(formData.get("paymentSource") ?? "upi");
  if (!VALID_PAYMENT_SOURCES.has(rawSource as PaymentSource)) {
    return { valid: false, error: "Please choose a valid payment method." };
  }
  const paymentSource = rawSource as PaymentSource;

  const dateCheck = validateTransactionDateYMD(formData.get("transactionDate"));
  if (!dateCheck.valid) {
    return { valid: false, error: dateCheck.error || "Invalid transaction date." };
  }

  const rawNote = String(formData.get("note") ?? "");
  const cleanNote = rawNote.replace(/[\u0000-\u001F\u007F]/g, " ").trim();
  if (cleanNote.length > 500) {
    return { valid: false, error: "Note cannot exceed 500 characters." };
  }

  return {
    valid: true,
    data: {
      amount: roundedAmount,
      type,
      categoryId,
      paymentSource,
      transactionDate: dateCheck.date,
      note: cleanNote.length > 0 ? cleanNote : null,
    },
  };
}

function revalidateFinancialViews() {
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  revalidatePath("/budgets");
  revalidatePath("/budgets/summary");
}

/**
 * Fetches available categories only for authenticated & email-verified users.
 */
export async function getCategories(): Promise<Category[]> {
  if (!hasConfiguredSupabaseEnv()) {
    return [];
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email_confirmed_at) {
      return [];
    }

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (error || !data) {
      return [];
    }

    return data as Category[];
  } catch {
    return [];
  }
}

/**
 * Creates a new transaction (Expense or Income) with strict ownership & category type checks.
 */
export async function createTransaction(
  _prevState: TransactionActionResult | null,
  formData: FormData
): Promise<TransactionActionResult> {
  if (!hasConfiguredSupabaseEnv()) {
    return { error: "Service unavailable." };
  }

  const parsed = validateAndSanitizeTransactionInput(formData);
  if (!parsed.valid) {
    return { error: parsed.error };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email_confirmed_at) {
      return { error: "Please verify your email before recording transactions." };
    }

    const rateKey = await getClientIpRateKey("tx-write", user.id);
    const limit = txMutationLimiter.check(rateKey);
    if (!limit.allowed) {
      return { error: "Too many transaction requests. Please wait a moment and try again." };
    }

    // Verify category exists, belongs to system or user, and matches transaction type
    const { data: catData } = await supabase
      .from("categories")
      .select("id, user_id, type")
      .eq("id", parsed.data.categoryId)
      .maybeSingle();

    const category = catData as { id: string; user_id: string | null; type: string } | null;
    if (
      !category ||
      (category.user_id !== null && category.user_id !== user.id) ||
      category.type !== parsed.data.type
    ) {
      return { error: "Selected category is invalid or does not match transaction type." };
    }

    const payload = {
      user_id: user.id,
      category_id: parsed.data.categoryId,
      amount: parsed.data.amount,
      type: parsed.data.type,
      payment_source: parsed.data.paymentSource,
      transaction_date: parsed.data.transactionDate,
      note: parsed.data.note,
    };

    const { data, error } = await (supabase.from("transactions") as any)
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      return { error: "Could not save transaction. Please check your entries and try again." };
    }

    revalidateFinancialViews();
    return { success: true, transactionId: data?.id };
  } catch {
    return { error: "Failed to record transaction. Please try again." };
  }
}

/**
 * Updates an existing transaction owned by the verified user.
 */
export async function updateTransaction(
  transactionId: string,
  _prevState: TransactionActionResult | null,
  formData: FormData
): Promise<TransactionActionResult> {
  if (!hasConfiguredSupabaseEnv()) {
    return { error: "Service unavailable." };
  }

  if (!isValidUuid(transactionId)) {
    return { error: "Invalid transaction reference." };
  }

  const parsed = validateAndSanitizeTransactionInput(formData);
  if (!parsed.valid) {
    return { error: parsed.error };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email_confirmed_at) {
      return { error: "Unauthorized." };
    }

    const rateKey = await getClientIpRateKey("tx-write", user.id);
    if (!txMutationLimiter.check(rateKey).allowed) {
      return { error: "Too many requests. Please wait a moment and try again." };
    }

    const { data: catData } = await supabase
      .from("categories")
      .select("id, user_id, type")
      .eq("id", parsed.data.categoryId)
      .maybeSingle();

    const category = catData as { id: string; user_id: string | null; type: string } | null;
    if (
      !category ||
      (category.user_id !== null && category.user_id !== user.id) ||
      category.type !== parsed.data.type
    ) {
      return { error: "Selected category is invalid or does not match transaction type." };
    }

    const updatePayload = {
      category_id: parsed.data.categoryId,
      amount: parsed.data.amount,
      type: parsed.data.type,
      payment_source: parsed.data.paymentSource,
      transaction_date: parsed.data.transactionDate,
      note: parsed.data.note,
    };

    const { data, error } = await (supabase.from("transactions") as any)
      .update(updatePayload)
      .eq("id", transactionId.trim())
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();

    if (error || !data) {
      return { error: "Could not update transaction. Verify it exists and try again." };
    }

    revalidateFinancialViews();
    return { success: true, transactionId: data.id };
  } catch {
    return { error: "Failed to update transaction." };
  }
}

/**
 * Deletes a transaction owned by the verified user.
 */
export async function deleteTransaction(transactionId: string): Promise<TransactionActionResult> {
  if (!hasConfiguredSupabaseEnv()) {
    return { error: "Service unavailable." };
  }

  if (!isValidUuid(transactionId)) {
    return { error: "Invalid transaction reference." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email_confirmed_at) {
      return { error: "Unauthorized." };
    }

    const rateKey = await getClientIpRateKey("tx-write", user.id);
    if (!txMutationLimiter.check(rateKey).allowed) {
      return { error: "Too many requests. Please wait a moment and try again." };
    }

    const { data, error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", transactionId.trim())
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();

    if (error || !data) {
      return { error: "Could not delete transaction." };
    }

    revalidateFinancialViews();
    return { success: true };
  } catch {
    return { error: "Failed to delete transaction." };
  }
}

/**
 * Fetches all transactions for the verified user with joined category data.
 */
export async function getTransactions(): Promise<Transaction[]> {
  if (!hasConfiguredSupabaseEnv()) {
    return [];
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email_confirmed_at) {
      return [];
    }

    const { data, error } = await supabase
      .from("transactions")
      .select("*, category:categories(*)")
      .eq("user_id", user.id)
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    return data as unknown as Transaction[];
  } catch {
    return [];
  }
}
