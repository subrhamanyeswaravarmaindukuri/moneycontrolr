import { getProductionSiteUrl } from "../seo/metadata.ts";

export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 128;

const ALLOWED_REDIRECT_PREFIXES = [
  "/dashboard",
  "/transactions",
  "/budgets",
  "/onboarding",
  "/settings",
  "/verify-email",
  "/reset-password",
  "/features",
  "/about",
  "/contact",
] as const;

const COMMON_WEAK_PASSWORDS = new Set([
  "password1234",
  "password1234!",
  "123456789012",
  "qwertyuiop12",
  "admin1234567",
  "welcome12345",
  "letmein12345",
  "changeme1234",
  "student12345",
  "moneycontrolr",
  "moneycontrolr1",
  "moneycontrolr123",
  "iloveyou1234",
  "abcdef123456",
]);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const OTP_REGEX = /^\d{6,10}$/;

/**
 * Validates and sanitizes an internal post-auth redirect target to prevent Open Redirect attacks.
 * Strictly allows only same-origin allowlisted application paths.
 */
export function sanitizeRedirectPath(
  rawNext: unknown,
  fallback: string = "/dashboard"
): string {
  if (typeof rawNext !== "string") return fallback;

  const trimmed = rawNext.trim();
  if (
    !trimmed ||
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.startsWith("/\\") ||
    trimmed.includes("\\") ||
    /[\u0000-\u001F\u007F]/.test(trimmed)
  ) {
    return fallback;
  }

  // Reject encoded slashes before parsing
  if (/^\/%(2f|5c)/i.test(trimmed)) {
    return fallback;
  }

  try {
    const parsed = new URL(trimmed, "https://moneycontrolr.local");
    if (parsed.origin !== "https://moneycontrolr.local") {
      return fallback;
    }

    const pathname = parsed.pathname;
    const isAllowed =
      pathname === "/" ||
      ALLOWED_REDIRECT_PREFIXES.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
      );

    if (!isAllowed) {
      return fallback;
    }

    return `${pathname}${parsed.search}`;
  } catch {
    return fallback;
  }
}

/**
 * Validates and normalizes an email address.
 */
export function validateEmail(raw: unknown): {
  valid: boolean;
  email: string;
  error?: string;
} {
  if (typeof raw !== "string") {
    return { valid: false, email: "", error: "Please enter a valid email address." };
  }
  if (/[\r\n\u0000-\u001F\u007F]/.test(raw)) {
    return { valid: false, email: "", error: "Email address contains invalid characters." };
  }

  const normalized = raw.trim().toLowerCase();
  if (!normalized || normalized.length > 254 || !EMAIL_REGEX.test(normalized)) {
    return { valid: false, email: normalized, error: "Please enter a valid email address." };
  }

  return { valid: true, email: normalized };
}

/**
 * Validates and normalizes a user display name.
 */
export function validateDisplayName(raw: unknown): {
  valid: boolean;
  name: string;
  error?: string;
} {
  if (typeof raw !== "string") {
    return { valid: false, name: "", error: "Please enter your name (at least 2 characters)." };
  }
  const cleaned = raw.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim();
  if (cleaned.length < 2) {
    return { valid: false, name: cleaned, error: "Please enter your name (at least 2 characters)." };
  }
  if (cleaned.length > 80) {
    return { valid: false, name: cleaned, error: "Name cannot exceed 80 characters." };
  }
  return { valid: true, name: cleaned };
}

/**
 * Enforces strong password complexity rules (12+ chars, upper, lower, digit, symbol, weak-password blocklist).
 */
export function validatePassword(
  password: unknown,
  context?: { email?: string; displayName?: string }
): {
  valid: boolean;
  errors: string[];
  message: string;
} {
  const errors: string[] = [];

  if (typeof password !== "string" || password.length === 0) {
    return {
      valid: false,
      errors: ["Password is required."],
      message: "Password is required.",
    };
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`at least ${PASSWORD_MIN_LENGTH} characters`);
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    errors.push(`no more than ${PASSWORD_MAX_LENGTH} characters`);
  }
  if (!/[a-z]/.test(password)) {
    errors.push("one lowercase letter");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("one uppercase letter");
  }
  if (!/\d/.test(password)) {
    errors.push("one number");
  }
  if (!/[^A-Za-z0-9\s]/.test(password)) {
    errors.push("one special character (e.g. ! @ # $ %)");
  }

  const lower = password.toLowerCase();
  const compact = lower.replace(/[^a-z0-9]/g, "");
  if (COMMON_WEAK_PASSWORDS.has(lower) || COMMON_WEAK_PASSWORDS.has(compact)) {
    errors.push("a stronger, less predictable password");
  }

  const emailLocal = context?.email?.split("@")[0]?.trim().toLowerCase();
  if (emailLocal && emailLocal.length >= 4 && lower.includes(emailLocal)) {
    errors.push("no match with your email address");
  }

  if (errors.length === 0) {
    return { valid: true, errors: [], message: "" };
  }

  return {
    valid: false,
    errors,
    message: `Password must include ${errors.join(", ")}.`,
  };
}

/**
 * Validates numeric Email OTP verification codes (supports 6- to 10-digit Supabase OTP tokens).
 */
export function validateOtpCode(raw: unknown): {
  valid: boolean;
  token: string;
  error?: string;
} {
  if (typeof raw !== "string") {
    return { valid: false, token: "", error: "Please enter the numeric verification code from your email." };
  }
  const normalized = raw.replace(/[\s-]+/g, "").trim();
  if (!OTP_REGEX.test(normalized)) {
    return {
      valid: false,
      token: normalized,
      error: "Verification code must be 6 to 8 digits.",
    };
  }
  return { valid: true, token: normalized };
}

/**
 * Checks whether a value is a canonical UUID.
 */
export function isValidUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_REGEX.test(value.trim());
}

function parseLocalOrigin(rawUrl?: string | null): string | null {
  const trimmed = rawUrl?.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    const hostname = parsed.hostname.toLowerCase();
    if (
      (parsed.protocol === "http:" || parsed.protocol === "https:") &&
      (hostname === "localhost" || hostname === "127.0.0.1")
    ) {
      return parsed.origin;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Resolves the trusted site origin for Supabase auth callback / password reset links.
 * Never trusts unvalidated Host headers in production to prevent host-header poisoning.
 */
export function resolveTrustedOrigin(options?: {
  nodeEnv?: string;
  siteUrl?: string | null;
  vercelUrl?: string | null;
  vercelEnv?: string | null;
  hostHeader?: string | null;
}): string {
  const nodeEnv = options?.nodeEnv ?? process.env.NODE_ENV;
  const rawSiteUrl =
    options && "siteUrl" in options
      ? options.siteUrl
      : process.env.NEXT_PUBLIC_SITE_URL;
  const prodUrl = getProductionSiteUrl(rawSiteUrl);

  if (prodUrl) {
    return prodUrl;
  }

  const rawVercel = (options?.vercelUrl ?? process.env.VERCEL_URL ?? "").trim();
  const isVercel = Boolean(options?.vercelEnv ?? process.env.VERCEL);
  const localSiteOrigin = parseLocalOrigin(rawSiteUrl);

  if (nodeEnv === "production") {
    if (rawVercel && /^[a-z0-9.-]+$/i.test(rawVercel) && rawVercel.includes(".")) {
      return `https://${rawVercel}`;
    }
    if (!isVercel && localSiteOrigin) {
      return localSiteOrigin;
    }
    return "https://moneycontrolr.site";
  }

  if (localSiteOrigin) {
    return localSiteOrigin;
  }

  const host = options?.hostHeader?.trim().toLowerCase() ?? "";
  if (/^(localhost|127\.0\.0\.1)(:\d{2,5})?$/.test(host)) {
    return `http://${host}`;
  }

  return "http://localhost:5000";
}

/**
 * Classifies login failures without leaking user existence to attackers.
 */
export function classifyLoginFailure(
  errorCode?: string | null,
  errorMessage?: string | null
): "EMAIL_NOT_CONFIRMED" | "INVALID_CREDENTIALS" {
  const code = (errorCode ?? "").toLowerCase();
  const msg = (errorMessage ?? "").toLowerCase();

  if (code === "email_not_confirmed" || msg.includes("email not confirmed")) {
    return "EMAIL_NOT_CONFIRMED";
  }
  return "INVALID_CREDENTIALS";
}

