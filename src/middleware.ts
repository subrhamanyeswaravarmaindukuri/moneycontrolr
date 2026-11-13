import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { hasConfiguredSupabaseEnv } from "@/lib/security/supabase-config";

const PROTECTED_PATHS = ["/dashboard", "/transactions", "/budgets", "/onboarding", "/settings"];
const AUTH_PATHS = ["/login", "/signup", "/forgot-password"];

function matchesRoutePrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedPath = matchesRoutePrefix(pathname, PROTECTED_PATHS);

  try {
    const isSupabaseConfigured = hasConfiguredSupabaseEnv();

    if (!isSupabaseConfigured) {
      // Fail closed: never allow access to protected routes when auth backend env is unconfigured
      if (isProtectedPath) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("error", "auth_unavailable");
        return NextResponse.redirect(loginUrl);
      }
      return NextResponse.next();
    }

    const { supabaseResponse, user } = await updateSession(request);
    const isEmailVerified = Boolean(user && user.email_confirmed_at);

    const isVerifyEmailPath = matchesRoutePrefix(pathname, ["/verify-email"]);
    const isCallbackPath = matchesRoutePrefix(pathname, ["/auth/callback"]);
    const isAuthPath = matchesRoutePrefix(pathname, AUTH_PATHS);

    // Always allow auth callbacks
    if (isCallbackPath) {
      return supabaseResponse;
    }

    // 1. Unauthenticated user trying to access protected page -> Login
    if (!user && isProtectedPath) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 2. Unverified user trying to access protected page -> Verification Pending screen
    if (user && !isEmailVerified && isProtectedPath) {
      const verifyUrl = new URL("/verify-email", request.url);
      if (user.email) {
        verifyUrl.searchParams.set("email", user.email);
      }
      return NextResponse.redirect(verifyUrl);
    }

    // 3. Fully verified user trying to access login, signup, forgot-password, or verify-email -> Dashboard
    if (user && isEmailVerified && (isAuthPath || isVerifyEmailPath)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return supabaseResponse;
  } catch (error) {
    console.error("Middleware caught exception:", error);
    // Fail closed on protected routes rather than admitting unauthenticated requests
    if (isProtectedPath) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "session_error");
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
