import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { hasConfiguredSupabaseEnv } from "@/lib/security/supabase-config";
import {
  resolveTrustedOrigin,
  sanitizeRedirectPath,
} from "@/lib/security/auth-validation";
import type { Database } from "@/types/database.types";
import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

type PendingCookie = {
  name: string;
  value: string;
  options?: CookieOptions;
};

const ALLOWED_OTP_TYPES = new Set<EmailOtpType>([
  "signup",
  "recovery",
  "email_change",
  "email",
  "magiclink",
]);

function isEmailOtpType(value: string | null): value is EmailOtpType {
  return value !== null && ALLOWED_OTP_TYPES.has(value as EmailOtpType);
}

/**
 * Route handler for Supabase authentication callbacks.
 * Strictly sanitizes redirect targets and origin to prevent Open Redirects
 * and Host-header poisoning, and forwards auth cookies directly on redirect responses.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const rawType = requestUrl.searchParams.get("type");
  const errorParam = requestUrl.searchParams.get("error");
  const errorCode = requestUrl.searchParams.get("error_code");
  const infoMessage = requestUrl.searchParams.get("message");
  const safeNext = sanitizeRedirectPath(
    requestUrl.searchParams.get("next"),
    "/onboarding"
  );
  const isEmailChange =
    safeNext === "/settings" ||
    safeNext.startsWith("/settings?") ||
    rawType === "email_change";

  const origin = resolveTrustedOrigin({
    hostHeader: request.headers.get("host"),
  });

  if (!hasConfiguredSupabaseEnv()) {
    return NextResponse.redirect(`${origin}/login?error=auth_unavailable`);
  }

  const pendingCookies = new Map<string, PendingCookie>();
  const redirectWithCookies = (targetUrl: string) => {
    const response = NextResponse.redirect(targetUrl);
    pendingCookies.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options);
    });
    return response;
  };

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: PendingCookie[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            pendingCookies.set(name, { name, value, options });
          });
        },
      },
    });

    let verified = false;
    let verifiedUser: { new_email?: string | null } | null = null;
    let hasActiveUser = false;

    // 1. PKCE authorization code exchange
    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        verified = true;
        verifiedUser = data.user;
      } else {
        console.error("Auth callback PKCE exchange failed:", {
          code: error.code ?? null,
          status: error.status ?? null,
          message: error.message,
        });
      }
    }

    // 2. Token-hash verification (works across browsers/devices without PKCE cookies)
    if (!verified && tokenHash && isEmailOtpType(rawType)) {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: rawType,
      });
      if (!error) {
        verified = true;
        verifiedUser = data.user;
      } else {
        console.error("Auth callback token verification failed:", {
          code: error.code ?? null,
          status: error.status ?? null,
          message: error.message,
          type: rawType,
        });
      }
    }

    // 3. Double-confirmation email change (Step 1 via ConfirmationURL returns ?message=Confirmation link accepted...)
    if (
      !verified &&
      isEmailChange &&
      !errorParam &&
      !errorCode &&
      infoMessage?.toLowerCase().includes("confirmation link accepted")
    ) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        return redirectWithCookies(`${origin}/settings?notice=email_change_step1`);
      }
      return redirectWithCookies(
        `${origin}/login?notice=email_change_step1&redirectTo=${encodeURIComponent("/settings")}`
      );
    }

    if (verified) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      hasActiveUser = Boolean(user);

      if (safeNext === "/reset-password" || rawType === "recovery") {
        return redirectWithCookies(`${origin}/reset-password`);
      }

      if (isEmailChange) {
        const stillPendingOtherEmail = Boolean(
          user?.new_email ?? verifiedUser?.new_email
        );
        const notice = stillPendingOtherEmail
          ? "email_change_step1"
          : "email_change_complete";

        if (!user) {
          return redirectWithCookies(
            `${origin}/login?notice=${notice}&redirectTo=${encodeURIComponent("/settings")}`
          );
        }
        return redirectWithCookies(`${origin}/settings?notice=${notice}`);
      }

      if (user && !user.email_confirmed_at) {
        return redirectWithCookies(`${origin}/verify-email`);
      }

      return redirectWithCookies(`${origin}${safeNext}`);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    hasActiveUser = Boolean(user);

    // When ConfirmationURL returns status/message in the URL #hash fragment, forward cleanly so client UI inspects window.location.hash
    if (isEmailChange && !code && !tokenHash && !errorParam && !errorCode && !infoMessage) {
      if (hasActiveUser) {
        return redirectWithCookies(`${origin}/settings?notice=email_change_check_hash`);
      }
      return redirectWithCookies(
        `${origin}/login?notice=email_change_step1&redirectTo=${encodeURIComponent("/settings")}`
      );
    }

    console.error("Auth callback did not verify session:", {
      errorParam,
      errorCode,
      hasCode: Boolean(code),
      hasTokenHash: Boolean(tokenHash),
      rawType,
      safeNext,
      hasActiveUser,
    });

    if (isEmailChange && !hasActiveUser) {
      return redirectWithCookies(
        `${origin}/login?error=email_change_failed&redirectTo=${encodeURIComponent("/settings")}`
      );
    }
  } catch (err) {
    console.error("Unexpected error in auth callback route:", err);
  }

  if (safeNext === "/reset-password" || rawType === "recovery") {
    return redirectWithCookies(`${origin}/reset-password?error=link_expired`);
  }

  if (isEmailChange) {
    return redirectWithCookies(`${origin}/settings?error=email_change_failed`);
  }

  return redirectWithCookies(
    `${origin}/verify-email?error=expired_or_invalid_link`
  );
}
