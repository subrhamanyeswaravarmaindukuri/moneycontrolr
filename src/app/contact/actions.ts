"use server";

import {
  escapeHtml,
  validateContactSubmission,
} from "@/lib/contact/validation";
import { createRateLimiter } from "@/lib/security/rate-limit";
import { getClientIpRateKey } from "@/lib/security/request-meta";

export interface ContactActionState {
  status: "idle" | "sent" | "error" | "unconfigured";
  message?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "subject" | "message", string>>;
}

const contactRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxAttempts: 5,
  maxEntries: 500,
});

function isPlaceholderValue(value: string | undefined): boolean {
  if (!value) return true;
  const trimmed = value.trim().toLowerCase();
  return (
    trimmed.length === 0 ||
    trimmed.includes("placeholder") ||
    trimmed.includes("your_") ||
    trimmed.includes("example.com")
  );
}

export async function submitContactForm(
  _prevState: ContactActionState,
  formData: FormData
): Promise<ContactActionState> {
  const nowMs = Date.now();
  const rateKey = await getClientIpRateKey("contact");

  if (!contactRateLimiter.check(rateKey, nowMs).allowed) {
    return {
      status: "error",
      message: "Too many submissions in a short period. Please wait a few minutes and try again.",
    };
  }

  const rawRenderedAt = formData.get("formRenderedAt");
  let formRenderedAt: number | null = null;
  if (typeof rawRenderedAt === "string" && rawRenderedAt.trim().length > 0) {
    const parsed = Number(rawRenderedAt);
    if (!Number.isFinite(parsed)) {
      return {
        status: "error",
        message: "Submission timestamp was invalid. Please refresh the page and try again.",
      };
    }
    formRenderedAt = parsed;
  }

  const validation = validateContactSubmission(
    {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      subject: String(formData.get("subject") ?? ""),
      message: String(formData.get("message") ?? ""),
      website: String(formData.get("website") ?? ""),
      formRenderedAt,
    },
    nowMs
  );

  if (!validation.valid || !validation.sanitized) {
    return {
      status: "error",
      message: validation.error || "Please check your inputs and try again.",
      fieldErrors: validation.fieldErrors,
    };
  }

  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const contactToEmail = process.env.CONTACT_TO_EMAIL?.trim();
  const contactFromEmail =
    process.env.CONTACT_FROM_EMAIL?.trim() || "MoneyControlr Contact <onboarding@resend.dev>";

  // Never claim an email was sent unless server credentials exist and dispatch succeeds
  if (isPlaceholderValue(resendApiKey) || isPlaceholderValue(contactToEmail)) {
    return {
      status: "unconfigured",
      message:
        "Your message passed validation, but automated email delivery is not configured yet on this server. To enable inbox delivery, configure server-only RESEND_API_KEY and CONTACT_TO_EMAIL environment variables (never NEXT_PUBLIC_).",
    };
  }

  const { name, email, subject, message } = validation.sanitized;

  const safeHtmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #252D29; line-height: 1.6;">
      <h2 style="color: #145C43; margin-bottom: 12px;">New MoneyControlr Contact Message</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Reply Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
      <hr style="border: 0; border-top: 1px solid #d5e5dc; margin: 16px 0;" />
      <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
    </div>
  `.trim();

  const plainTextBody = [
    "New MoneyControlr Contact Message",
    `Name: ${name}`,
    `Reply Email: ${email}`,
    `Subject: ${subject}`,
    "",
    message,
  ].join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: contactFromEmail,
        to: [contactToEmail],
        reply_to: email,
        subject: `[MoneyControlr Contact] ${subject}`,
        html: safeHtmlBody,
        text: plainTextBody,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        status: "error",
        message:
          "The email provider rejected the delivery request. Please verify server email settings or try again later.",
      };
    }

    return {
      status: "sent",
      message: "Thank you for contacting MoneyControlr. Your message has been sent successfully.",
    };
  } catch {
    return {
      status: "error",
      message: "A network error prevented sending your message. Please try again shortly.",
    };
  }
}

