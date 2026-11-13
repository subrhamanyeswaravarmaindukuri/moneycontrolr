"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MoneySource } from "@/types/database.types";
import { createRateLimiter } from "@/lib/security/rate-limit";
import { getClientIpRateKey, getRequestHostHeaders } from "@/lib/security/request-meta";
import { hasConfiguredSupabaseEnv } from "@/lib/security/supabase-config";
import {
  classifyLoginFailure,
  resolveTrustedOrigin,
  sanitizeRedirectPath,
  validateDisplayName,
  validateEmail,
  validateOtpCode,
  validatePassword,
} from "@/lib/security/auth-validation";
import { getCurrentMonthBoundsYMD } from "@/lib/date";

export interface AuthActionResult {
  error?: string;
  success?: boolean;
  message?: string;
  emailNotVerified?: boolean;
  email?: string;
}

const VALID_MONEY_SOURCES = new Set<MoneySource>([
  "parental_allowance",
  "salary",
  "scholarship",
  "part_time",
  "freelance",
  "other",
]);

const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxAttempts: 8,
  maxEntries: 1000,
});

const signupRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxAttempts: 5,
  maxEntries: 1000,
});

const otpVerifyRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  maxAttempts: 6,
  maxEntries: 1000,
});

const emailDispatchRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxAttempts: 5,
  minIntervalMs: 60 * 1000,
  maxEntries: 1000,
});

const accountUpdateRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxAttempts: 6,
  maxEntries: 1000,
});

async function getTrustedAppOrigin(): Promise<string> {
  const { hostHeader } = await getRequestHostHeaders();
  return resolveTrustedOrigin({ hostHeader });
}

function logAndClassifyDispatchError(
  scope: "signup" | "resend" | "reset",
  error: { code?: string | null; status?: number; message?: string | null }
): string | null {
  const msg = error.message ?? "";
  const msgLower = msg.toLowerCase();
  console.error(`[auth/${scope}] Supabase error:`, {
    code: error.code ?? null,
    status: error.status ?? null,
    message: msg,
  });

  if (error.status === 429 || msgLower.includes("rate limit") || error.code === "over_email_send_rate_limit") {
    return "Too many email requests. Please wait a minute and try again.";
  }

  if (
    msgLower.includes("database error") ||
    msgLower.includes("saving new user")
  ) {
    if (process.env.NODE_ENV !== "production") {
      return `Database error during signup (${msg}). Check your [auth/${scope}] terminal log and Supabase Auth Logs.`;
    }
    return "Could not complete registration right now. Please try again shortly.";
  }

  if (
    msgLower.includes("confirmation email") ||
    msgLower.includes("recovery email") ||
    msgLower.includes("sending") ||
    msgLower.includes("smtp") ||
    msgLower.includes("mail")
  ) {
    if (process.env.NODE_ENV !== "production") {
      return `Email delivery error (${msg}). Check Supabase Custom SMTP settings (Sender: no-reply@moneycontrolr.site, Host: smtp.resend.com, Port: 465/587, Username: resend, API key with Sending access).`;
    }
    return "Could not send email right now. Please try again in a minute.";
  }

  if (error.code === "unexpected_failure" || (error.status ?? 0) >= 500) {
    if (process.env.NODE_ENV !== "production") {
      return `Authentication server error (${error.code ?? error.status ?? "500"}: ${msg}). Check your terminal logs.`;
    }
    return "Could not complete request right now. Please try again shortly.";
  }

  return null;
}

async function dispatchSignupResend(
  supabase: Awaited<ReturnType<typeof createClient>>,
  email: string,
  origin: string
): Promise<string | null> {
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/onboarding`,
    },
  });
  return error ? logAndClassifyDispatchError("resend", error) : null;
}

/**
 * Logs in an existing user using email and password.
 * Fails closed when auth is unavailable and blocks unverified accounts.
 */
export async function login(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const emailRaw = formData.get("email");
  const passwordRaw = formData.get("password");
  const nextRaw = formData.get("redirectTo");

  if (typeof emailRaw !== "string" || typeof passwordRaw !== "string" || !emailRaw || !passwordRaw) {
    return { error: "Please enter both email and password." };
  }

  const emailCheck = validateEmail(emailRaw);
  if (!emailCheck.valid) {
    return { error: "Please enter a valid email address." };
  }

  if (passwordRaw.length > 128) {
    return { error: "Invalid email or password." };
  }

  const rateKey = await getClientIpRateKey("login", emailCheck.email);
  const limit = loginRateLimiter.check(rateKey);
  if (!limit.allowed) {
    return {
      error: `Too many login attempts. Please wait ${limit.retryAfterSeconds} seconds and try again.`,
    };
  }

  if (!hasConfiguredSupabaseEnv()) {
    return { error: "Authentication service is temporarily unavailable." };
  }

  const safeRedirectTo = sanitizeRedirectPath(nextRaw, "/dashboard");

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailCheck.email,
      password: passwordRaw,
    });

    if (error) {
      const failureKind = classifyLoginFailure(error.code, error.message);
      if (failureKind === "EMAIL_NOT_CONFIRMED") {
        return {
          error:
            "Your email address is not verified yet. Enter your verification code or request a new email.",
          emailNotVerified: true,
          email: emailCheck.email,
        };
      }
      return { error: "Invalid email or password." };
    }

    if (!data.user || !data.user.email_confirmed_at) {
      await supabase.auth.signOut();
      return {
        error:
          "Your email address is not verified yet. Enter your verification code or request a new email.",
        emailNotVerified: true,
        email: emailCheck.email,
      };
    }
  } catch {
    return { error: "Unable to reach authentication service. Please try again." };
  }

  revalidatePath("/", "layout");
  redirect(safeRedirectTo);
}

/**
 * Registers a new user account, validates strong password rules, and enforces email OTP verification.
 * Uses anti-enumeration responses so existing accounts cannot be probed.
 */
export async function signup(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const emailCheck = validateEmail(formData.get("email"));
  if (!emailCheck.valid) {
    return { error: emailCheck.error || "Please provide a valid email address." };
  }

  const nameCheck = validateDisplayName(formData.get("displayName"));
  if (!nameCheck.valid) {
    return { error: nameCheck.error || "Please enter your name." };
  }

  const passwordRaw = formData.get("password");
  const passwordCheck = validatePassword(passwordRaw, {
    email: emailCheck.email,
    displayName: nameCheck.name,
  });
  if (!passwordCheck.valid) {
    return { error: passwordCheck.message };
  }

  const rateKey = await getClientIpRateKey("signup");
  const limit = signupRateLimiter.check(rateKey);
  if (!limit.allowed) {
    return {
      error: `Too many signup attempts. Please wait ${limit.retryAfterSeconds} seconds and try again.`,
    };
  }

  if (!hasConfiguredSupabaseEnv()) {
    return { error: "Registration service is temporarily unavailable." };
  }

  try {
    const origin = await getTrustedAppOrigin();
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email: emailCheck.email,
      password: passwordRaw as string,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=/onboarding`,
        data: {
          display_name: nameCheck.name,
        },
      },
    });

    if (error) {
      const msgLower = error.message.toLowerCase();
      // Do not reveal if an email address is already registered
      if (
        error.code === "user_already_exists" ||
        msgLower.includes("already registered") ||
        msgLower.includes("already exists")
      ) {
        const dispatchMessage = await dispatchSignupResend(supabase, emailCheck.email, origin);
        if (dispatchMessage) {
          return { error: dispatchMessage };
        }
        redirect(`/verify-email?email=${encodeURIComponent(emailCheck.email)}`);
      }
      if (error.code === "weak_password" || msgLower.includes("weak password")) {
        return { error: "Password is too weak or commonly used. Please choose a stronger 12+ character password." };
      }
      const dispatchMessage = logAndClassifyDispatchError("signup", error);
      if (dispatchMessage) {
        return { error: dispatchMessage };
      }
      return { error: "Could not complete registration. Please check your details and try again." };
    }

    // Supabase returns identities: [] without sending a signup OTP when the email already exists
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      console.info(
        "[auth/signup] Existing account detected (empty identities). Triggering resend fallback in case account is still unconfirmed."
      );
      const dispatchMessage = await dispatchSignupResend(supabase, emailCheck.email, origin);
      if (dispatchMessage) {
        return { error: dispatchMessage };
      }
    }

    // Even if email is unconfirmed and Supabase created a session, do not grant app access before OTP/link verify
    if (data.session && (!data.user || !data.user.email_confirmed_at)) {
      await supabase.auth.signOut();
    }
  } catch (err) {
    // Allow Next.js redirect errors to propagate
    if (err && typeof err === "object" && "digest" in err) {
      throw err;
    }
    console.error("[auth/signup] Unexpected signup exception:", err instanceof Error ? err.message : "unknown_error");
    return { error: "Unable to complete signup right now. Please try again." };
  }

  redirect(`/verify-email?email=${encodeURIComponent(emailCheck.email)}`);
}

/**
 * Verifies a signup Email OTP code entered by the user on /verify-email.
 */
export async function verifySignupOtp(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const emailCheck = validateEmail(formData.get("email"));
  if (!emailCheck.valid) {
    return { error: "Please enter the email address you signed up with." };
  }

  const otpCheck = validateOtpCode(formData.get("token"));
  if (!otpCheck.valid) {
    return { error: otpCheck.error || "Please enter a valid verification code." };
  }

  const rateKey = await getClientIpRateKey("verify-otp", emailCheck.email);
  const limit = otpVerifyRateLimiter.check(rateKey);
  if (!limit.allowed) {
    return {
      error: `Too many verification attempts. Please wait ${limit.retryAfterSeconds} seconds and try again.`,
    };
  }

  if (!hasConfiguredSupabaseEnv()) {
    return { error: "Verification service is temporarily unavailable." };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({
      email: emailCheck.email,
      token: otpCheck.token,
      type: "signup",
    });

    if (error || !data.user || !data.user.email_confirmed_at) {
      return {
        error: "Invalid or expired verification code. Please double-check the code or request a new one.",
      };
    }
  } catch {
    return { error: "Verification failed due to a network error. Please try again." };
  }

  revalidatePath("/", "layout");
  redirect("/onboarding");
}

/**
 * Resends the signup verification email/OTP with server-side rate limiting and anti-enumeration.
 */
export async function resendVerificationEmail(
  email: string
): Promise<{ success?: boolean; error?: string; message?: string }> {
  const emailCheck = validateEmail(email);
  if (!emailCheck.valid) {
    return { error: "Please provide a valid email address." };
  }

  const rateKey = await getClientIpRateKey("resend-verify", emailCheck.email);
  const limit = emailDispatchRateLimiter.check(rateKey);
  if (!limit.allowed) {
    return {
      error: `Please wait ${limit.retryAfterSeconds} seconds before requesting another code.`,
    };
  }

  if (!hasConfiguredSupabaseEnv()) {
    return { error: "Email verification service is temporarily unavailable." };
  }

  try {
    const supabase = await createClient();
    const origin = await getTrustedAppOrigin();
    const dispatchMessage = await dispatchSignupResend(supabase, emailCheck.email, origin);
    if (dispatchMessage) {
      return { error: dispatchMessage };
    }
  } catch (err) {
    console.error("[auth/resend] Unexpected exception:", err instanceof Error ? err.message : "unknown_error");
    return { error: "Failed to send verification email. Please try again." };
  }

  return {
    success: true,
    message: "If this account is awaiting verification, a new verification code has been sent.",
  };
}

/**
 * Initiates a password reset email without revealing whether an account exists.
 */
export async function requestPasswordReset(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const emailCheck = validateEmail(formData.get("email"));
  if (!emailCheck.valid) {
    return { error: "Please enter a valid email address." };
  }

  const rateKey = await getClientIpRateKey("forgot-pw", emailCheck.email);
  const limit = emailDispatchRateLimiter.check(rateKey);
  if (!limit.allowed) {
    return {
      error: `Too many requests. Please wait ${limit.retryAfterSeconds} seconds before trying again.`,
    };
  }

  if (!hasConfiguredSupabaseEnv()) {
    return { error: "Password recovery service is temporarily unavailable." };
  }

  try {
    const supabase = await createClient();
    const origin = await getTrustedAppOrigin();
    const { error } = await supabase.auth.resetPasswordForEmail(emailCheck.email, {
      redirectTo: `${origin}/auth/callback?next=/reset-password`,
    });
    if (error) {
      const dispatchMessage = logAndClassifyDispatchError("reset", error);
      if (dispatchMessage) {
        return { error: dispatchMessage };
      }
    }
  } catch (err) {
    console.error("[auth/reset] Unexpected exception:", err instanceof Error ? err.message : "unknown_error");
    return { error: "Unable to process password reset right now. Please try again shortly." };
  }

  return {
    success: true,
    email: emailCheck.email,
    message:
      "If an account with that email exists, we sent a password reset link and recovery code. Please check your inbox and spam folder.",
  };
}

/**
 * Verifies a password recovery OTP code entered by the user and opens the reset-password session.
 */
export async function verifyRecoveryOtp(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const emailCheck = validateEmail(formData.get("email"));
  if (!emailCheck.valid) {
    return { error: "Please enter the email address associated with your account." };
  }

  const otpCheck = validateOtpCode(formData.get("token"));
  if (!otpCheck.valid) {
    return { error: otpCheck.error || "Please enter the recovery code from your email." };
  }

  const rateKey = await getClientIpRateKey("verify-recovery-otp", emailCheck.email);
  const limit = otpVerifyRateLimiter.check(rateKey);
  if (!limit.allowed) {
    return {
      error: `Too many recovery attempts. Please wait ${limit.retryAfterSeconds} seconds and try again.`,
    };
  }

  if (!hasConfiguredSupabaseEnv()) {
    return { error: "Password recovery service is temporarily unavailable." };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({
      email: emailCheck.email,
      token: otpCheck.token,
      type: "recovery",
    });

    if (error || !data.user) {
      if (error) {
        console.error("[auth/recovery-otp] verifyOtp failed:", {
          code: error.code ?? null,
          status: error.status ?? null,
          message: error.message,
        });
      }
      return {
        error: "Invalid or expired recovery code. Please double-check the code or request a new reset email.",
      };
    }
  } catch {
    return { error: "Verification failed due to a network error. Please try again." };
  }

  revalidatePath("/", "layout");
  redirect("/reset-password");
}

/**
 * Completes a password reset after the user opens their verified recovery link.
 * Revokes existing sessions globally so stolen tokens cannot remain active.
 */
export async function resetPassword(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  if (!hasConfiguredSupabaseEnv()) {
    return { error: "Password reset service is temporarily unavailable." };
  }

  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  if (typeof password !== "string" || typeof confirmPassword !== "string") {
    return { error: "Please enter and confirm your new password." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Your password reset session has expired. Please request a new reset link." };
  }

  const rateKey = await getClientIpRateKey("reset-pw", user.id);
  const limit = accountUpdateRateLimiter.check(rateKey);
  if (!limit.allowed) {
    return {
      error: `Too many attempts. Please wait ${limit.retryAfterSeconds} seconds and try again.`,
    };
  }

  const passwordCheck = validatePassword(password, { email: user.email });
  if (!passwordCheck.valid) {
    return { error: passwordCheck.message };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: "Could not update password. Please choose a different strong password or request a new link." };
  }

  try {
    await supabase.auth.signOut({ scope: "global" });
  } catch {
    await supabase.auth.signOut();
  }

  revalidatePath("/", "layout");
  redirect("/login?notice=password_reset");
}

/**
 * Allows an authenticated, verified user to change their password after verifying their current password.
 */
export async function changePassword(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  if (!hasConfiguredSupabaseEnv()) {
    return { error: "Account service is temporarily unavailable." };
  }

  const currentPassword = formData.get("currentPassword");
  const newPassword = formData.get("newPassword");
  const confirmPassword = formData.get("confirmPassword");

  if (
    typeof currentPassword !== "string" ||
    typeof newPassword !== "string" ||
    typeof confirmPassword !== "string" ||
    !currentPassword ||
    !newPassword
  ) {
    return { error: "Please fill in your current password and confirm your new password." };
  }

  if (newPassword !== confirmPassword) {
    return { error: "New passwords do not match." };
  }

  if (currentPassword === newPassword) {
    return { error: "Your new password must be different from your current password." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email || !user.email_confirmed_at) {
    return { error: "You must be signed in with a verified email to change your password." };
  }

  const rateKey = await getClientIpRateKey("change-pw", user.id);
  const limit = accountUpdateRateLimiter.check(rateKey);
  if (!limit.allowed) {
    return {
      error: `Too many attempts. Please wait ${limit.retryAfterSeconds} seconds and try again.`,
    };
  }

  const passwordCheck = validatePassword(newPassword, { email: user.email });
  if (!passwordCheck.valid) {
    return { error: passwordCheck.message };
  }

  // Re-authenticate with current password first so credential checks work regardless of GoTrue toggle
  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (reauthError) {
    return { error: "Current password is incorrect." };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
    current_password: currentPassword,
  });

  if (updateError) {
    return { error: "Unable to update password right now. Please try again." };
  }

  try {
    await supabase.auth.signOut({ scope: "others" });
  } catch {
    // Non-fatal if revoking other sessions fails
  }

  revalidatePath("/settings");
  return {
    success: true,
    message: "Your password has been updated and other active sessions were signed out.",
  };
}

/**
 * Initiates a secure email change requiring current password confirmation + Supabase email confirmation.
 */
export async function changeEmail(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  if (!hasConfiguredSupabaseEnv()) {
    return { error: "Account service is temporarily unavailable." };
  }

  const emailCheck = validateEmail(formData.get("newEmail"));
  if (!emailCheck.valid) {
    return { error: emailCheck.error || "Please enter a valid new email address." };
  }

  const currentPassword = formData.get("currentPassword");
  if (typeof currentPassword !== "string" || !currentPassword) {
    return { error: "Please enter your current password to confirm an email change." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email || !user.email_confirmed_at) {
    return { error: "You must be signed in with a verified email to change your email address." };
  }

  if (user.email.toLowerCase() === emailCheck.email) {
    return { error: "Your new email address must be different from your current email." };
  }

  const rateKey = await getClientIpRateKey("change-email", user.id);
  const limit = accountUpdateRateLimiter.check(rateKey);
  if (!limit.allowed) {
    return {
      error: `Too many requests. Please wait ${limit.retryAfterSeconds} seconds before trying again.`,
    };
  }

  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (reauthError) {
    return { error: "Current password is incorrect." };
  }

  const origin = await getTrustedAppOrigin();
  const { error: updateError } = await supabase.auth.updateUser(
    { email: emailCheck.email },
    { emailRedirectTo: `${origin}/auth/callback?next=/settings` }
  );

  if (updateError) {
    return {
      error: "Could not start the email change process. Ensure the address is valid and not already in use.",
    };
  }

  revalidatePath("/settings");
  return {
    success: true,
    message:
      "Confirmation links or codes have been sent. Confirm in both your current email and your new email inbox to complete the change.",
  };
}

/**
 * Verifies an Email Change OTP code (`{{ .Token }}`) from either the current or new email inbox.
 */
export async function verifyEmailChangeOtp(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  if (!hasConfiguredSupabaseEnv()) {
    return { error: "Account service is temporarily unavailable." };
  }

  const otpCheck = validateOtpCode(formData.get("token"));
  if (!otpCheck.valid) {
    return { error: otpCheck.error || "Please enter the numeric confirmation code from your email." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email || !user.new_email) {
    return { error: "No pending email change found. Please submit an email change request first." };
  }

  const rateKey = await getClientIpRateKey("verify-email-change-otp", user.id);
  const limit = otpVerifyRateLimiter.check(rateKey);
  if (!limit.allowed) {
    return {
      error: `Too many attempts. Please wait ${limit.retryAfterSeconds} seconds and try again.`,
    };
  }

  const inboxTarget = formData.get("inbox") === "current" ? "current" : "new";
  const emailToVerify = inboxTarget === "current" ? user.email : user.new_email;

  const { error } = await supabase.auth.verifyOtp({
    email: emailToVerify,
    token: otpCheck.token,
    type: "email_change",
  });

  if (error) {
    console.error("[auth/email-change-otp] verifyOtp failed:", {
      code: error.code ?? null,
      status: error.status ?? null,
      message: error.message,
      inboxTarget,
    });
    return {
      error: "Invalid or expired confirmation code for that inbox. Make sure you selected the inbox that received this code.",
    };
  }

  const {
    data: { user: refreshedUser },
  } = await supabase.auth.getUser();

  revalidatePath("/", "layout");
  revalidatePath("/settings");

  if (refreshedUser && !refreshedUser.new_email) {
    return {
      success: true,
      message: "Your email address has been updated successfully!",
    };
  }

  return {
    success: true,
    message:
      "Confirmation code accepted! Now enter the code or click the link from your other email inbox to complete the switch.",
  };
}

/**
 * Logs out the current user session and clears authentication cookies.
 */
export async function logout(): Promise<void> {
  if (hasConfiguredSupabaseEnv()) {
    try {
      const supabase = await createClient();
      await supabase.auth.signOut();
    } catch {
      // Redirect to login cleanly even if signOut request fails
    }
  }
  revalidatePath("/", "layout");
  redirect("/login");
}

/**
 * Saves or updates the verified user's current month budget preferences (IST cycle).
 */
export async function saveOnboardingBudget(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  if (!hasConfiguredSupabaseEnv()) {
    return { error: "Budget service is temporarily unavailable." };
  }

  const monthlyAllowanceRaw = Number(formData.get("monthlyAllowance"));
  const moneySourceRaw = String(formData.get("moneySource") || "parental_allowance") as MoneySource;
  const needsPercentage = Number(formData.get("needsPercentage") ?? 50);
  const wantsPercentage = Number(formData.get("wantsPercentage") ?? 30);
  const savingsPercentage = Number(formData.get("savingsPercentage") ?? 20);

  if (
    !Number.isFinite(monthlyAllowanceRaw) ||
    monthlyAllowanceRaw <= 0 ||
    monthlyAllowanceRaw > 100_000_000
  ) {
    return { error: "Please enter a valid monthly allowance between ₹1 and ₹10,00,00,000." };
  }

  if (!VALID_MONEY_SOURCES.has(moneySourceRaw)) {
    return { error: "Please choose a valid money source." };
  }

  const pctValid = [needsPercentage, wantsPercentage, savingsPercentage].every(
    (pct) => Number.isFinite(pct) && pct >= 0 && pct <= 100
  );
  if (
    !pctValid ||
    Math.round((needsPercentage + wantsPercentage + savingsPercentage) * 100) !== 10000
  ) {
    return { error: "Budget percentages (Needs + Wants + Savings) must add up to exactly 100%." };
  }

  const roundedAllowance = Math.round(monthlyAllowanceRaw * 100) / 100;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email_confirmed_at) {
      return { error: "Please verify your email address before setting up your budget." };
    }

    const { startDate, endDate } = getCurrentMonthBoundsYMD();

    const budgetPayload = {
      user_id: user.id,
      monthly_allowance: roundedAllowance,
      budget_start_date: startDate,
      budget_end_date: endDate,
      needs_percentage: Math.round(needsPercentage * 100) / 100,
      wants_percentage: Math.round(wantsPercentage * 100) / 100,
      savings_percentage: Math.round(savingsPercentage * 100) / 100,
      money_source: moneySourceRaw,
    };

    const { error } = await (supabase.from("budgets") as any).upsert(budgetPayload, {
      onConflict: "user_id,budget_start_date,budget_end_date",
    });

    if (error) {
      return { error: "Could not save your budget settings. Please try again." };
    }
  } catch {
    return { error: "Database connection failed while saving your budget. Please try again." };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
