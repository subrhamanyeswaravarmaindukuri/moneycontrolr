"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { hasConfiguredSupabaseEnv } from "@/lib/security/supabase-config";
import { isValidUuid } from "@/lib/security/auth-validation";
import { createRateLimiter } from "@/lib/security/rate-limit";
import { getClientIpRateKey } from "@/lib/security/request-meta";
import { toPaise, toRupees } from "@/lib/calculations/finance";
import { validateTransactionDateYMD, getTodayYMD } from "@/lib/date";
import { PaymentSource, TransactionType, Category, Transaction, RecurringExpense } from "@/types/database.types";

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

export interface CategoryMutationResult {
  success?: boolean;
  category?: Category;
  error?: string;
}

/**
 * Creates a new custom category for the verified user.
 */
export async function createCustomCategory(
  formData: FormData
): Promise<CategoryMutationResult> {
  if (!hasConfiguredSupabaseEnv()) {
    return { error: "Service unavailable." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email_confirmed_at) {
      return { error: "You must be logged in with a verified email to create categories." };
    }

    const nameRaw = formData.get("name") as string | null;
    const typeRaw = formData.get("type") as string | null;
    const iconRaw = formData.get("icon") as string | null;
    const colorRaw = formData.get("color") as string | null;

    if (!nameRaw || typeof nameRaw !== "string") {
      return { error: "Category name is required." };
    }

    const name = nameRaw.trim();
    if (name.length < 1 || name.length > 60) {
      return { error: "Category name must be between 1 and 60 characters." };
    }

    if (typeRaw !== "expense" && typeRaw !== "income") {
      return { error: "Category type must be either expense or income." };
    }
    const type = typeRaw as TransactionType;

    const icon = iconRaw && typeof iconRaw === "string" ? iconRaw.trim() : "MoreHorizontal";
    const color = colorRaw && typeof colorRaw === "string" ? colorRaw.trim() : "#145C43";

    // Check for duplicate category name (case-insensitive) for this user or system
    const { data: existing } = await supabase
      .from("categories")
      .select("id, name")
      .eq("type", type)
      .ilike("name", name)
      .limit(1);

    if (existing && existing.length > 0) {
      return { error: `A category named "${name}" already exists for ${type}s.` };
    }

    const { data: newCat, error: insertError } = await (supabase.from("categories") as any)
      .insert({
        user_id: user.id,
        name,
        type,
        icon,
        color,
      })
      .select()
      .single();

    if (insertError || !newCat) {
      return { error: insertError?.message || "Failed to create category." };
    }

    revalidateFinancialViews();
    revalidatePath("/settings");

    return { success: true, category: newCat as Category };
  } catch {
    return { error: "An unexpected error occurred while creating the category." };
  }
}

/**
 * Deletes a custom user category. System default categories (user_id IS NULL) are protected.
 */
export async function deleteCustomCategory(
  categoryId: string
): Promise<CategoryMutationResult> {
  if (!hasConfiguredSupabaseEnv()) {
    return { error: "Service unavailable." };
  }

  if (!isValidUuid(categoryId)) {
    return { error: "Invalid category ID." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email_confirmed_at) {
      return { error: "You must be logged in with a verified email." };
    }

    // Verify category exists and belongs to the user
    const { data: categoryData } = await (supabase.from("categories") as any)
      .select("id, user_id, name")
      .eq("id", categoryId)
      .single();

    const category = categoryData as { id: string; user_id: string | null; name: string } | null;

    if (!category) {
      return { error: "Category not found." };
    }

    if (category.user_id === null) {
      return { error: "System default categories cannot be deleted." };
    }

    if (category.user_id !== user.id) {
      return { error: "You do not have permission to delete this category." };
    }

    // Check if category is currently used in transactions
    const { count } = await (supabase.from("transactions") as any)
      .select("id", { count: "exact", head: true })
      .eq("category_id", categoryId);

    if (count && count > 0) {
      return {
        error: `Cannot delete "${category.name}" because it is used by ${count} transaction(s). Please edit or delete those transactions first.`,
      };
    }

    const { error: deleteError } = await supabase
      .from("categories")
      .delete()
      .eq("id", categoryId)
      .eq("user_id", user.id);

    if (deleteError) {
      return { error: deleteError.message || "Failed to delete category." };
    }

    revalidateFinancialViews();
    revalidatePath("/settings");

    return { success: true };
  } catch {
    return { error: "Failed to delete category." };
  }
}

export interface RecurringMutationResult {
  success?: boolean;
  recurringExpense?: RecurringExpense;
  error?: string;
}

/**
 * Fetches all recurring expenses for the verified user.
 * Gracefully returns an empty list if the table is not yet provisioned.
 */
export async function getRecurringExpenses(): Promise<RecurringExpense[]> {
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
      .from("recurring_expenses")
      .select("*, category:categories(*)")
      .eq("user_id", user.id)
      .order("due_day", { ascending: true })
      .order("created_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    return data as unknown as RecurringExpense[];
  } catch {
    return [];
  }
}

/**
 * Creates a new recurring expense / fixed monthly commitment.
 */
export async function createRecurringExpense(
  formData: FormData
): Promise<RecurringMutationResult> {
  if (!hasConfiguredSupabaseEnv()) {
    return { error: "Service unavailable." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email_confirmed_at) {
      return { error: "You must be logged in with a verified email." };
    }

    const nameRaw = formData.get("name") as string | null;
    const amountRaw = formData.get("amount") as string | null;
    const categoryIdRaw = formData.get("categoryId") as string | null;
    const dueDayRaw = formData.get("dueDay") as string | null;
    const paymentSourceRaw = formData.get("paymentSource") as string | null;
    const noteRaw = formData.get("note") as string | null;

    if (!nameRaw || nameRaw.trim().length < 1 || nameRaw.trim().length > 80) {
      return { error: "Bill / Commitment name must be between 1 and 80 characters." };
    }
    const name = nameRaw.trim();

    const amountNum = Number(amountRaw);
    if (isNaN(amountNum) || amountNum <= 0 || amountNum > 100000000) {
      return { error: "Please enter a valid amount greater than ₹0." };
    }

    if (!categoryIdRaw || !isValidUuid(categoryIdRaw)) {
      return { error: "Please select a valid category." };
    }
    const categoryId = categoryIdRaw.trim();

    const dueDayNum = Number(dueDayRaw || "1");
    if (isNaN(dueDayNum) || dueDayNum < 1 || dueDayNum > 31) {
      return { error: "Due day must be between 1 and 31." };
    }

    const paymentSource: PaymentSource =
      paymentSourceRaw && ["upi", "cash", "card", "bank_transfer", "other"].includes(paymentSourceRaw)
        ? (paymentSourceRaw as PaymentSource)
        : "upi";

    const note = noteRaw && typeof noteRaw === "string" ? noteRaw.trim().slice(0, 300) : null;

    const { data: newRec, error: insertError } = await (supabase.from("recurring_expenses") as any)
      .insert({
        user_id: user.id,
        category_id: categoryId,
        name,
        amount: amountNum,
        payment_source: paymentSource,
        due_day: dueDayNum,
        note,
      })
      .select("*, category:categories(*)")
      .single();

    if (insertError || !newRec) {
      return {
        error:
          insertError?.code === "42P01"
            ? "The recurring expenses table is not yet created in the database. Please run the SQL migration."
            : insertError?.message || "Failed to create recurring commitment.",
      };
    }

    revalidateFinancialViews();
    revalidatePath("/settings");

    return { success: true, recurringExpense: newRec as unknown as RecurringExpense };
  } catch {
    return { error: "An unexpected error occurred." };
  }
}

/**
 * Deletes a recurring expense commitment.
 */
export async function deleteRecurringExpense(
  recurringId: string
): Promise<RecurringMutationResult> {
  if (!hasConfiguredSupabaseEnv()) {
    return { error: "Service unavailable." };
  }

  if (!isValidUuid(recurringId)) {
    return { error: "Invalid recurring expense ID." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email_confirmed_at) {
      return { error: "You must be logged in with a verified email." };
    }

    const { error: deleteError } = await (supabase.from("recurring_expenses") as any)
      .delete()
      .eq("id", recurringId)
      .eq("user_id", user.id);

    if (deleteError) {
      return { error: deleteError.message || "Failed to delete recurring expense." };
    }

    revalidateFinancialViews();
    revalidatePath("/settings");

    return { success: true };
  } catch {
    return { error: "Failed to delete recurring expense." };
  }
}

/**
 * Logs a recurring expense commitment as an actual transaction with today's date in 1 click.
 */
export async function logRecurringExpenseAsTransaction(
  recurringId: string
): Promise<TransactionActionResult> {
  if (!hasConfiguredSupabaseEnv()) {
    return { error: "Service unavailable." };
  }

  if (!isValidUuid(recurringId)) {
    return { error: "Invalid recurring expense ID." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email_confirmed_at) {
      return { error: "You must be logged in with a verified email." };
    }

    const { data: recData, error: fetchError } = await (supabase.from("recurring_expenses") as any)
      .select("*")
      .eq("id", recurringId)
      .eq("user_id", user.id)
      .single();

    const rec = recData as {
      id: string;
      user_id: string;
      category_id: string;
      amount: number;
      payment_source: PaymentSource;
      name: string;
    } | null;

    if (fetchError || !rec) {
      return { error: "Recurring expense not found." };
    }

    const todayYMD = getTodayYMD();

    const { data: newTx, error: txError } = await (supabase.from("transactions") as any)
      .insert({
        user_id: user.id,
        category_id: rec.category_id,
        amount: rec.amount,
        type: "expense",
        payment_source: rec.payment_source,
        transaction_date: todayYMD,
        note: `[Recurring Bill] ${rec.name}`,
      })
      .select()
      .single();

    if (txError || !newTx) {
      return { error: txError?.message || "Failed to log transaction." };
    }

    revalidateFinancialViews();
    return { success: true };
  } catch {
    return { error: "Failed to log recurring transaction." };
  }
}
