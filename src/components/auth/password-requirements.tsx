"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { PASSWORD_MIN_LENGTH } from "@/lib/security/auth-validation";

export function PasswordRequirements({ password }: { password: string }) {
  const rules = [
    {
      label: `At least ${PASSWORD_MIN_LENGTH} characters`,
      met: password.length >= PASSWORD_MIN_LENGTH,
    },
    { label: "Uppercase & lowercase letters (A-Z, a-z)", met: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: "At least one number (0-9)", met: /\d/.test(password) },
    { label: "At least one special character (!@#$...)", met: /[^A-Za-z0-9\s]/.test(password) },
  ];

  return (
    <ul className="space-y-1.5 pt-1" aria-label="Password strength requirements">
      {rules.map((rule) => (
        <li
          key={rule.label}
          className={`flex items-center gap-2 text-xs ${
            rule.met ? "text-primary font-medium" : "text-apptext-muted"
          }`}
        >
          {rule.met ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
          ) : (
            <Circle className="w-3.5 h-3.5 text-apptext-light shrink-0" />
          )}
          <span>{rule.label}</span>
        </li>
      ))}
    </ul>
  );
}

