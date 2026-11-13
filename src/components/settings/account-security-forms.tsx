"use client";

import { useActionState, useEffect, useState } from "react";
import {
  changeEmail,
  changePassword,
  verifyEmailChangeOtp,
  AuthActionResult,
} from "@/app/(auth)/actions";
import { PasswordRequirements } from "@/components/auth/password-requirements";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle2, Lock, Mail, ShieldCheck } from "lucide-react";

export function AccountSecurityForms({
  currentEmail,
  pendingNewEmail,
  callbackError,
  callbackNotice,
}: {
  currentEmail: string;
  pendingNewEmail?: string | null;
  callbackError?: boolean;
  callbackNotice?: string | null;
}) {
  const [newPassword, setNewPassword] = useState("");
  const [hashOutcome, setHashOutcome] = useState<"step1" | "error" | null>(null);
  const [otpInbox, setOtpInbox] = useState<"new" | "current">("new");
  const [otpCode, setOtpCode] = useState("");
  const [pwState, pwAction, isPwPending] = useActionState<AuthActionResult | null, FormData>(
    changePassword,
    null
  );
  const [emailState, emailAction, isEmailPending] = useActionState<AuthActionResult | null, FormData>(
    changeEmail,
    null
  );
  const [otpState, otpAction, isOtpPending] = useActionState<AuthActionResult | null, FormData>(
    verifyEmailChangeOtp,
    null
  );

  useEffect(() => {
    const rawHash = window.location.hash;
    if (!rawHash && callbackNotice !== "email_change_check_hash") {
      return;
    }

    const hashParams = new URLSearchParams(rawHash.replace(/^#/, ""));
    const hashError = hashParams.get("error") || hashParams.get("error_code");
    const hashMessage = hashParams.get("message") || "";

    if (hashError) {
      setHashOutcome("error");
    } else if (
      hashMessage.toLowerCase().includes("confirmation link accepted") ||
      hashMessage.toLowerCase().includes("other email")
    ) {
      setHashOutcome("step1");
    } else if (callbackNotice === "email_change_check_hash") {
      setHashOutcome(pendingNewEmail ? "step1" : "error");
    }

    if (rawHash) {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
    }
  }, [callbackNotice, pendingNewEmail]);

  const showCallbackError = Boolean(callbackError || hashOutcome === "error");
  const showStep1Banner =
    !showCallbackError &&
    (callbackNotice === "email_change_step1" || hashOutcome === "step1");

  return (
    <div className="grid md:grid-cols-2 gap-6 items-start">
      {/* 1. Change Password Card */}
      <Card variant="flat" className="border-border bg-surface">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <Lock className="w-3.5 h-3.5" />
            Password Security
          </div>
          <CardTitle className="text-xl font-bold text-apptext">Change Password</CardTitle>
          <CardDescription className="text-xs sm:text-sm text-apptext-muted">
            Verify your current password before setting a new one. Updating your password signs out other active devices.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form action={pwAction} className="space-y-4">
            {pwState?.error && (
              <div className="p-3 rounded-btn bg-status-dangerLight border border-status-danger/20 text-status-danger text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{pwState.error}</span>
              </div>
            )}

            {pwState?.success && pwState.message && (
              <div className="p-3 rounded-btn bg-status-successLight border border-status-success/20 text-status-success text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{pwState.message}</span>
              </div>
            )}

            <Input
              label="Current Password"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              placeholder="Enter current password"
              required
              prefixIcon={<Lock className="w-4 h-4" />}
            />

            <div className="space-y-2">
              <Input
                label="New Password"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Minimum 12 strong characters"
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
              autoComplete="new-password"
              placeholder="Re-enter new password"
              minLength={12}
              required
              prefixIcon={<Lock className="w-4 h-4" />}
            />

            <Button type="submit" size="md" className="w-full font-semibold" isLoading={isPwPending}>
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 2. Change Email Card */}
      <Card variant="flat" className="border-border bg-surface">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <Mail className="w-3.5 h-3.5" />
            Email Address
          </div>
          <CardTitle className="text-xl font-bold text-apptext">Update Email Address</CardTitle>
          <CardDescription className="text-xs sm:text-sm text-apptext-muted">
            Changing your email requires confirming via both your current and new email addresses.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form action={emailAction} className="space-y-4">
            {showCallbackError && (
              <div className="p-3 rounded-btn bg-status-dangerLight border border-status-danger/20 text-status-danger text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  The email confirmation link expired or could not be verified. Please submit the request again.
                </span>
              </div>
            )}

            {showStep1Banner && (
              <div className="p-3 rounded-btn bg-primary-light border border-primary/20 text-primary text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  First confirmation accepted! Now open the confirmation link (or enter the code) sent to your other email address to finish changing your email.
                </span>
              </div>
            )}

            {callbackNotice === "email_change_complete" && !showCallbackError && (
              <div className="p-3 rounded-btn bg-status-successLight border border-status-success/20 text-status-success text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Your email address has been updated successfully.</span>
              </div>
            )}

            {emailState?.error && (
              <div className="p-3 rounded-btn bg-status-dangerLight border border-status-danger/20 text-status-danger text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{emailState.error}</span>
              </div>
            )}

            {emailState?.success && emailState.message && (
              <div className="p-3 rounded-btn bg-status-successLight border border-status-success/20 text-status-success text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{emailState.message}</span>
              </div>
            )}

            <div className="p-3 rounded-xl bg-background border border-border-subtle text-xs space-y-1.5">
              <div>
                <span className="text-apptext-muted block">Current Verified Email</span>
                <span className="font-semibold text-apptext break-all">{currentEmail}</span>
              </div>
              {pendingNewEmail && (
                <div className="pt-1.5 border-t border-border-subtle">
                  <span className="text-primary font-medium block">
                    Pending Change → {pendingNewEmail}
                  </span>
                  <span className="text-apptext-muted">
                    Confirm the link (or enter the code below) from both your current email inbox and {pendingNewEmail} to complete the switch.
                  </span>
                </div>
              )}
            </div>

            <Input
              label="New Email Address"
              name="newEmail"
              type="email"
              placeholder="newname@college.edu"
              required
              prefixIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Current Password (Confirmation)"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              placeholder="Confirm with your password"
              required
              prefixIcon={<ShieldCheck className="w-4 h-4" />}
            />

            <Button type="submit" variant="outline" size="md" className="w-full font-semibold" isLoading={isEmailPending}>
              Send Email Change Confirmation
            </Button>
          </form>

          {pendingNewEmail && (
            <form action={otpAction} className="pt-4 border-t border-border-subtle space-y-3">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-apptext">
                  Verify using numeric email code
                </p>
                <p className="text-[11px] text-apptext-muted">
                  If your confirmation email includes a 6- to 8-digit code, select which inbox received it and verify here.
                </p>
              </div>

              {otpState?.error && (
                <div className="p-3 rounded-btn bg-status-dangerLight border border-status-danger/20 text-status-danger text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{otpState.error}</span>
                </div>
              )}

              {otpState?.success && otpState.message && (
                <div className="p-3 rounded-btn bg-status-successLight border border-status-success/20 text-status-success text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{otpState.message}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 p-2 rounded-btn border border-border bg-background cursor-pointer">
                  <input
                    type="radio"
                    name="inbox"
                    value="new"
                    checked={otpInbox === "new"}
                    onChange={() => setOtpInbox("new")}
                    className="accent-primary"
                  />
                  <span className="truncate font-medium text-apptext">New email</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-btn border border-border bg-background cursor-pointer">
                  <input
                    type="radio"
                    name="inbox"
                    value="current"
                    checked={otpInbox === "current"}
                    onChange={() => setOtpInbox("current")}
                    className="accent-primary"
                  />
                  <span className="truncate font-medium text-apptext">Current email</span>
                </label>
              </div>

              <Input
                label="Email Change Code"
                name="token"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="6- to 8-digit code"
                maxLength={10}
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                prefixIcon={<ShieldCheck className="w-4 h-4" />}
              />

              <Button type="submit" size="md" className="w-full font-semibold" isLoading={isOtpPending}>
                Verify Code
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

