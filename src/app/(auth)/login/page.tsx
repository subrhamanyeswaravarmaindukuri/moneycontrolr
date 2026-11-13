"use client";

import { Suspense, useActionState, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { login, AuthActionResult } from "../actions";
import { BrandEmblem } from "@/components/layout/brand-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { sanitizeRedirectPath } from "@/lib/security/auth-validation";
import {
  Mail,
  Lock,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";

function LoginFormContent() {
  const searchParams = useSearchParams();
  const safeRedirectTo = sanitizeRedirectPath(
    searchParams.get("redirectTo"),
    "/dashboard"
  );
  const noticeParam = searchParams.get("notice");
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [state, formAction, isPending] = useActionState<AuthActionResult | null, FormData>(
    login,
    null
  );

  const systemBannerError =
    errorParam === "auth_unavailable"
      ? "Authentication service is temporarily unavailable. Please try again shortly."
      : errorParam === "session_error"
        ? "Your session could not be verified. Please log in again."
        : errorParam === "email_change_failed"
          ? "The email confirmation link expired or was already used. Sign in and request the email change again in Settings."
          : null;

  const systemBannerNotice =
    noticeParam === "password_reset"
      ? "Your password has been updated. Log in with your new password."
      : noticeParam === "email_change_step1"
        ? "Email confirmation link accepted! Remember to also click the link sent to your other email address before signing in with the new email."
        : noticeParam === "email_change_complete"
          ? "Your email address has been updated. Log in with your new email address."
          : null;

  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-background">
      {/* LEFT COLUMN: Premium Fintech Desktop Brand Showcase */}
      <div className="hidden lg:col-span-5 xl:col-span-6 bg-primary text-white p-12 xl:p-16 lg:flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-black/10 blur-2xl pointer-events-none" />

        {/* Top: Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3">
            <BrandEmblem size="lg" className="border-white/25" />
            <div>
              <span className="text-xl font-bold tracking-tight text-white">MoneyControlr</span>
              <p className="text-xs text-white/70 font-medium">Know your money. Control your day.</p>
            </div>
          </Link>
        </div>

        {/* Middle: Value Proposition */}
        <div className="relative z-10 space-y-8 my-auto py-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary-light bg-white/10 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              Welcome Back
            </div>
            <h2 className="text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight text-white">
              Control your day before spending begins.
            </h2>
            <p className="text-sm xl:text-base text-white/80 leading-relaxed max-w-md">
              Check your safe daily spending limit and log today's transactions in seconds.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-4 max-w-md shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/70">
                Today's Spending Snapshot
              </span>
              <span className="text-xs font-bold text-white bg-white/20 px-2 py-0.5 rounded-full">
                Active Cycle
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-black/20 border border-white/10">
                <span className="text-[11px] text-white/70 block mb-0.5">Today's Safe Limit</span>
                <span className="text-lg font-bold text-white">{formatCurrency(1000)}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/20 border border-white/20">
                <span className="text-[11px] text-white/90 block mb-0.5">Remaining Today</span>
                <span className="text-lg font-bold text-white">{formatCurrency(650)}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/10 text-xs text-white/85">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>100% private: Only you can view your transactions</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 pt-4 border-t border-white/10">
          <p className="text-xs text-white/60">
            Never run out of money before the end of the month.
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: The Login Form */}
      <div className="lg:col-span-7 xl:col-span-6 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-14 xl:p-16">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Header */}
          <div className="lg:hidden flex flex-col items-center text-center space-y-2 mb-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <BrandEmblem size="md" />
              <span className="text-xl font-bold tracking-tight text-primary">MoneyControlr</span>
            </Link>
            <p className="text-xs text-apptext-muted font-medium">Know your money. Control your day.</p>
          </div>

          {/* Form Card */}
          <Card variant="elevated" className="border-border">
            <CardHeader className="space-y-1.5 pb-4">
              <CardTitle className="text-2xl font-bold text-apptext">Welcome back</CardTitle>
              <CardDescription className="text-sm text-apptext-muted">
                Enter your credentials to access your daily allowance and transactions.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form action={formAction} className="space-y-4">
                <input type="hidden" name="redirectTo" value={safeRedirectTo} />

                {systemBannerNotice && !state?.error && (
                  <div className="p-3.5 rounded-btn bg-status-successLight border border-status-success/20 text-status-success text-xs sm:text-sm flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{systemBannerNotice}</span>
                  </div>
                )}

                {systemBannerError && !state?.error && (
                  <div className="p-3.5 rounded-btn bg-status-dangerLight border border-status-danger/20 text-status-danger text-xs sm:text-sm flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{systemBannerError}</span>
                  </div>
                )}

                {state?.error && (
                  <div className="p-3.5 rounded-btn bg-status-dangerLight border border-status-danger/20 text-status-danger text-xs sm:text-sm space-y-2">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{state.error}</span>
                    </div>
                    {state.emailNotVerified && state.email && (
                      <div className="pt-1">
                        <Link href={`/verify-email?email=${encodeURIComponent(state.email)}`}>
                          <Button variant="outline" size="sm" type="button" className="w-full text-xs font-bold border-red-300 text-red-700 bg-white">
                            Verify Email with Code
                            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="alex@college.edu"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  prefixIcon={<Mail className="w-4 h-4" />}
                />

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="login-password"
                      className="block text-sm font-medium text-apptext"
                    >
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="login-password"
                    name="password"
                    type="password"
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    required
                    prefixIcon={<Lock className="w-4 h-4" />}
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full font-semibold mt-2 shadow-sm"
                  isLoading={isPending}
                >
                  Log In
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>

                <div className="text-center pt-3 border-t border-border-subtle mt-4">
                  <p className="text-xs text-apptext-muted">
                    Don&apos;t have an account?{" "}
                    <Link
                      href="/signup"
                      className="font-bold text-primary hover:underline ml-0.5"
                    >
                      Create account
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
