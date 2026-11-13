import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple Tailwind CSS classes cleanly and resolves conflicts.
 * Example: cn("px-4 py-2", isPrimary && "bg-primary text-white")
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a numeric currency amount into INR (₹) or given currency code.
 * Uses Indian number formatting (e.g., ₹1,00,000.00).
 */
export function formatCurrency(
  amount: number,
  currency: string = "INR",
  options?: { minimumFractionDigits?: number; maximumFractionDigits?: number }
): string {
  const minDigits = options?.minimumFractionDigits ?? 0;
  const maxDigits = options?.maximumFractionDigits ?? 2;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: minDigits,
    maximumFractionDigits: maxDigits,
  }).format(amount);
}

