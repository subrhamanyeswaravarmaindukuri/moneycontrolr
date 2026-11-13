"use client";

import { useActionState, useState, useEffect, useTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { resendVerificationEmail, verifySignupOtp, logout, AuthActionResult } from "../actions";
import { BrandEmblem } from "@/components/layout/brand-logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Mail,
  KeyRound,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  LogOut,
  Sparkles,
  ArrowRight,
} from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState(emailParam);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [isResending, startResendTransition] = useTransition();

  const [otpState, otpAction, isVerifyingOtp] = useActionState<AuthActionResult | null, FormData>(
    verifySignupOtp,
    null
  );

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleResend = () => {
    if (!email || countdown > 0) return;

    setResendStatus(null);
    setResendError(null);

    startResendTransition(async () => {
      const result = await resendVerificationEmail(email);
      if (result.error) {
        setResendError(result.error);
      } else {
        setResendStatus(
          result.message || "If this account is awaiting verification, a new verification code has been sent."
        );
        setCountdown(60);
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="mb-6 text-center">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <BrandEmblem size="md" />
          <span className="text-xl font-bold tracking-tight text-primary">MoneyControlr</span>
        </Link>
      </div>

      <Card variant="flat" className="max-w-md w-full p-6 sm:p-8 bg-surface border-border shadow-card space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-primary-light text-primary flex items-center justify-center mx-auto shadow-sm">
            <Mail className="w-7 h-7" />
          </div>

          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary bg-primary-light px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            Email Verification Required
          </div>
          <h1 className="text-2xl font-black text-apptext tracking-tight">
            Verify Your Email
          </h1>
          <p className="text-xs sm:text-sm text-apptext-muted leading-relaxed">
            If this email is awaiting verification, enter the numeric code from your inbox (or click the link in that email). Codes expire in 10 minutes. Already verified? Try logging in instead.
          </p>
        </div>

        {errorParam && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Verification link or code expired</p>
              <p className="text-[11px] text-red-600/90 mt-0.5">
                Request a fresh verification email below to continue.
              </p>
            </div>
          </div>
        )}

        {otpState?.error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <p className="font-medium">{otpState.error}</p>
          </div>
        )}

        {resendStatus && (
          <div className="p-3.5 rounded-xl bg-primary-light border border-primary/30 text-xs text-primary flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="font-medium">{resendStatus}</p>
          </div>
        )}

        {resendError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <p className="font-medium">{resendError}</p>
          </div>
        )}

        {/* Primary Email OTP Form */}
        <form action={otpAction} className="space-y-4">
          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="alex@college.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            prefixIcon={<Mail className="w-4 h-4" />}
          />

          <Input
            label="Verification Code (OTP)"
            name="token"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="Enter 6- or 8-digit code"
            required
            prefixIcon={<KeyRound className="w-4 h-4" />}
            helperText="Check your Spam or Promotions folder if you don't see it within a minute."
          />

          <Button
            type="submit"
            size="lg"
            className="w-full font-bold shadow-sm"
            isLoading={isVerifyingOtp}
          >
            Verify Code & Continue
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        {/* Secondary Actions */}
        <div className="space-y-3 pt-2 border-t border-border-subtle">
          <Button
            onClick={handleResend}
            disabled={isResending || countdown > 0 || !email}
            variant="outline"
            size="md"
            type="button"
            className="w-full font-semibold"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isResending ? "animate-spin" : ""}`} />
            {countdown > 0 ? `Resend Code in ${countdown}s` : "Resend Verification Email"}
          </Button>

          <div className="flex gap-2">
            <Link href="/login" className="flex-1">
              <Button variant="ghost" size="md" className="w-full font-semibold text-xs">
                Back to Login
              </Button>
            </Link>

            <form action={logout} className="flex-1">
              <Button
                variant="ghost"
                size="md"
                type="submit"
                className="w-full font-semibold text-xs text-apptext-muted hover:text-red-600"
              >
                <LogOut className="w-3.5 h-3.5 mr-1" />
                Log Out
              </Button>
            </form>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
