"use client";

import { useActionState, useEffect, useState } from "react";
import { verifyRecoveryOtp, type AuthActionResult } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, ArrowRight, Mail, ShieldCheck } from "lucide-react";

interface RecoveryOtpFormProps {
  defaultEmail?: string;
  submitLabel?: string;
}

export function RecoveryOtpForm({
  defaultEmail = "",
  submitLabel = "Verify Code & Continue",
}: RecoveryOtpFormProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [token, setToken] = useState("");
  const [state, formAction, isPending] = useActionState<AuthActionResult | null, FormData>(
    verifyRecoveryOtp,
    null
  );

  useEffect(() => {
    if (defaultEmail) {
      setEmail(defaultEmail);
    }
  }, [defaultEmail]);

  return (
    <form action={formAction} className="space-y-3.5">
      {state?.error && (
        <div className="p-3 rounded-btn bg-status-dangerLight border border-status-danger/20 text-status-danger text-xs sm:text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{state.error}</span>
        </div>
      )}

      <Input
        label="Account Email"
        name="email"
        type="email"
        placeholder="alex@college.edu"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        prefixIcon={<Mail className="w-4 h-4" />}
      />

      <Input
        label="Recovery Code"
        name="token"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        placeholder="6- to 8-digit code from your email"
        maxLength={10}
        required
        value={token}
        onChange={(e) => setToken(e.target.value)}
        prefixIcon={<ShieldCheck className="w-4 h-4" />}
      />

      <Button
        type="submit"
        size="lg"
        className="w-full font-semibold"
        isLoading={isPending}
      >
        {submitLabel}
        <ArrowRight className="w-4 h-4 ml-1.5" />
      </Button>
    </form>
  );
}

