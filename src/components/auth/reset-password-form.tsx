"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { resetPassword, AuthActionResult } from "@/app/(auth)/actions";
import { PasswordRequirements } from "@/components/auth/password-requirements";
import { RecoveryOtpForm } from "@/components/auth/recovery-otp-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Lock, AlertCircle, ArrowRight, ShieldAlert } from "lucide-react";

export function ResetPasswordForm({
  hasSession,
  hasErrorParam,
}: {
  hasSession: boolean;
  hasErrorParam: boolean;
}) {
  const [newPassword, setNewPassword] = useState("");
  const [state, formAction, isPending] = useActionState<AuthActionResult | null, FormData>(
    resetPassword,
    null
  );

  if (!hasSession || hasErrorParam) {
    return (
      <Card variant="elevated" className="max-w-md w-full border-border">
        <CardHeader className="space-y-2 pb-4">
          <div className="w-11 h-11 rounded-xl bg-red-50 text-status-danger flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <CardTitle className="text-2xl font-bold text-apptext">
            Reset link expired or invalid
          </CardTitle>
          <CardDescription className="text-sm text-apptext-muted">
            Password reset links expire for security reasons or can only be used once. Request a fresh link to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2.5">
            <p className="text-xs font-semibold text-apptext">
              Have a recovery code from your email?
            </p>
            <RecoveryOtpForm submitLabel="Verify Code & Set Password" />
          </div>

          <div className="pt-3 border-t border-border-subtle space-y-2.5">
            <Link href="/forgot-password" className="block">
              <Button variant="outline" size="lg" className="w-full font-semibold">
                Request New Reset Link
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Link href="/login" className="block">
              <Button variant="ghost" size="md" className="w-full font-semibold text-xs">
                Back to Log In
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className="max-w-md w-full border-border">
      <CardHeader className="space-y-1.5 pb-4">
        <CardTitle className="text-2xl font-bold text-apptext">Set a new password</CardTitle>
        <CardDescription className="text-sm text-apptext-muted">
          Choose a strong new password for your MoneyControlr account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="p-3.5 rounded-btn bg-status-dangerLight border border-status-danger/20 text-status-danger text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{state.error}</span>
            </div>
          )}

          <div className="space-y-2">
            <Input
              label="New Password"
              name="password"
              type="password"
              placeholder="Minimum 12 strong characters"
              autoComplete="new-password"
              minLength={12}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              prefixIcon={<Lock className="w-4 h-4" />}
            />
            <PasswordRequirements password={newPassword} />
          </div>

          <Input
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            placeholder="Re-enter your new password"
            autoComplete="new-password"
            minLength={12}
            required
            prefixIcon={<Lock className="w-4 h-4" />}
          />

          <Button
            type="submit"
            size="lg"
            className="w-full font-semibold"
            isLoading={isPending}
          >
            Update Password
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
