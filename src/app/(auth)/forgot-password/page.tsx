"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { requestPasswordReset, AuthActionResult } from "../actions";
import { RecoveryOtpForm } from "@/components/auth/recovery-otp-form";
import { BrandEmblem } from "@/components/layout/brand-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mail, AlertCircle, CheckCircle2, ArrowLeft, ArrowRight, KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [showOtpEntry, setShowOtpEntry] = useState(false);
  const [state, formAction, isPending] = useActionState<AuthActionResult | null, FormData>(
    requestPasswordReset,
    null
  );

  const shouldShowOtp = Boolean(state?.success || showOtpEntry);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="mb-6 text-center">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <BrandEmblem size="md" />
          <span className="text-xl font-bold tracking-tight text-primary">MoneyControlr</span>
        </Link>
      </div>

      <Card variant="elevated" className="max-w-md w-full border-border">
        <CardHeader className="space-y-2 pb-4">
          <div className="w-11 h-11 rounded-xl bg-primary-light text-primary flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
          <CardTitle className="text-2xl font-bold text-apptext">Reset your password</CardTitle>
          <CardDescription className="text-sm text-apptext-muted">
            Enter your account email and we will send a password reset link and recovery code.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <form action={formAction} className="space-y-4">
            {state?.error && (
              <div className="p-3.5 rounded-btn bg-status-dangerLight border border-status-danger/20 text-status-danger text-xs sm:text-sm flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{state.error}</span>
              </div>
            )}

            {state?.success && state?.message && (
              <div className="p-3.5 rounded-btn bg-status-successLight border border-status-success/20 text-status-success text-xs sm:text-sm flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{state.message}</span>
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

            <Button
              type="submit"
              size="lg"
              variant={state?.success ? "outline" : "primary"}
              className="w-full font-semibold"
              isLoading={isPending}
            >
              {state?.success ? "Send Reset Email Again" : "Send Reset Link"}
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          {shouldShowOtp ? (
            <div className="pt-4 border-t border-border-subtle space-y-3">
              <div className="space-y-1">
                <h2 className="text-sm font-semibold text-apptext">
                  Verify with recovery code
                </h2>
                <p className="text-xs text-apptext-muted">
                  If you prefer, enter the numeric recovery code from your email instead of clicking the link.
                </p>
              </div>
              <RecoveryOtpForm defaultEmail={state?.email || email} />
            </div>
          ) : (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowOtpEntry(true)}
                className="text-xs font-medium text-primary hover:underline"
              >
                Already have a recovery code from your email?
              </button>
            </div>
          )}

          <div className="text-center pt-3 border-t border-border-subtle">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Log In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

