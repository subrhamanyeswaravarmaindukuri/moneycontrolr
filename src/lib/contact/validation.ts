export interface ContactFormInput {
  name: string;
  email: string;
  subject: string;
  message: string;
  website?: string;
  formRenderedAt?: number | null;
}

export interface ContactValidationResult {
  valid: boolean;
  error?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "subject" | "message", string>>;
  sanitized?: {
    name: string;
    email: string;
    subject: string;
    message: string;
  };
  isSpamSignal?: boolean;
}

export const CONTACT_LIMITS = {
  NAME_MIN: 2,
  NAME_MAX: 80,
  EMAIL_MIN: 5,
  EMAIL_MAX: 120,
  SUBJECT_MIN: 3,
  SUBJECT_MAX: 120,
  MESSAGE_MIN: 10,
  MESSAGE_MAX: 2000,
  MIN_FILL_DURATION_MS: 2000,
  MAX_FORM_AGE_MS: 24 * 60 * 60 * 1000,
} as const;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Strips non-printable ASCII control characters (preserving tabs/newlines where requested)
 * and trims outer whitespace.
 */
export function normalizeContactText(raw: string, allowNewlines = false): string {
  const withoutControls = allowNewlines
    ? raw.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    : raw.replace(/[\u0000-\u001F\u007F]/g, " ");

  return withoutControls.replace(/\r\n?/g, "\n").trim();
}

/**
 * Escapes HTML special characters for safe HTML email rendering.
 */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Validates and sanitizes contact form input on the server before any email dispatch.
 */
export function validateContactSubmission(
  input: ContactFormInput,
  nowMs: number = Date.now()
): ContactValidationResult {
  // 1. Honeypot check: bots often auto-fill hidden fields
  if (input.website && input.website.trim().length > 0) {
    return {
      valid: false,
      isSpamSignal: true,
      error: "Submission could not be verified. Please refresh the page and try again.",
    };
  }

  // 2. Minimum form fill duration check to mitigate instant automated POSTs
  if (typeof input.formRenderedAt === "number" && Number.isFinite(input.formRenderedAt)) {
    const elapsed = nowMs - input.formRenderedAt;
    if (elapsed < CONTACT_LIMITS.MIN_FILL_DURATION_MS || elapsed > CONTACT_LIMITS.MAX_FORM_AGE_MS) {
      return {
        valid: false,
        isSpamSignal: true,
        error: "Please take a moment to review your message or refresh the page before submitting.",
      };
    }
  }

  const name = normalizeContactText(input.name || "");
  const email = normalizeContactText(input.email || "").toLowerCase();
  const subject = normalizeContactText(input.subject || "");
  const message = normalizeContactText(input.message || "", true);

  const fieldErrors: Partial<Record<"name" | "email" | "subject" | "message", string>> = {};

  if (name.length < CONTACT_LIMITS.NAME_MIN || name.length > CONTACT_LIMITS.NAME_MAX) {
    fieldErrors.name = `Please enter your name (${CONTACT_LIMITS.NAME_MIN}–${CONTACT_LIMITS.NAME_MAX} characters).`;
  }

  if (
    email.length < CONTACT_LIMITS.EMAIL_MIN ||
    email.length > CONTACT_LIMITS.EMAIL_MAX ||
    /[\r\n]/.test(email) ||
    !EMAIL_REGEX.test(email)
  ) {
    fieldErrors.email = "Please enter a valid email address.";
  }

  if (
    subject.length < CONTACT_LIMITS.SUBJECT_MIN ||
    subject.length > CONTACT_LIMITS.SUBJECT_MAX
  ) {
    fieldErrors.subject = `Subject must be between ${CONTACT_LIMITS.SUBJECT_MIN} and ${CONTACT_LIMITS.SUBJECT_MAX} characters.`;
  }

  if (
    message.length < CONTACT_LIMITS.MESSAGE_MIN ||
    message.length > CONTACT_LIMITS.MESSAGE_MAX
  ) {
    fieldErrors.message = `Message must be between ${CONTACT_LIMITS.MESSAGE_MIN} and ${CONTACT_LIMITS.MESSAGE_MAX} characters.`;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      valid: false,
      error: "Please check the highlighted fields and try again.",
      fieldErrors,
    };
  }

  return {
    valid: true,
    sanitized: {
      name,
      email,
      subject,
      message,
    },
  };
}

