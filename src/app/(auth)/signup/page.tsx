"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { signup, AuthActionResult } from "../actions";
import { PasswordRequirements } from "@/components/auth/password-requirements";
import { BrandEmblem } from "@/components/layout/brand-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import {
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function SignupPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, formAction, isPending] = useActionState<AuthActionResult | null, FormData>(
    signup,
    null
  );

  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-background">
      {/* LEFT COLUMN: Premium Fintech Desktop Brand Showcase (Visible on lg screens) */}
      <div className="hidden lg:col-span-5 xl:col-span-6 bg-primary text-white p-12 xl:p-16 lg:flex flex-col justify-between relative overflow-hidden">
        {/* Subtle decorative background shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-black/10 blur-2xl pointer-events-none" />

        {/* Top: Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3">
            <BrandEmblem size="lg" className="border-white/25" />
            <div>
              <span className="text-xl font-bold tracking-tight text-white">MoneyControlr</span>
              <p className="text-xs text-white/70 font-medium">Student Expense Tracker &amp; Budget Planner</p>
            </div>
          </Link>
        </div>

        {/* Middle: Value Proposition & Live Financial Preview */}
        <div className="relative z-10 space-y-8 my-auto py-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary-light bg-white/10 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              Budgeting For Students
            </div>
            <h2 className="text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight text-white">
              Know your daily safe limit before you spend.
            </h2>
            <p className="text-sm xl:text-base text-white/80 leading-relaxed max-w-md">
              Most students run out of money before the month ends because they don't know their daily boundary. MoneyControlr calculates it for you every morning.
            </p>
          </div>

          {/* Interactive Calculation Card */}
          <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-4 max-w-md shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/70">
                Live Daily Calculation
              </span>
              <span className="text-xs font-bold text-white bg-white/20 px-2 py-0.5 rounded-full">
                30-Day Cycle
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-black/20 border border-white/10">
                <span className="text-[11px] text-white/70 block mb-0.5">Monthly Allowance</span>
                <span className="text-lg font-bold text-white">{formatCurrency(30000)}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/20 border border-white/20">
                <span className="text-[11px] text-white/90 block mb-0.5">Safe Daily Limit</span>
                <span className="text-lg font-bold text-white">{formatCurrency(1000)}/day</span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs text-white/85">
                <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>Unspent money automatically increases tomorrow's budget</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/85">
                <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>Zero floating-point calculation errors</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Footer info */}
        <div className="relative z-10 pt-4 border-t border-white/10">
          <p className="text-xs text-white/60">
            Designed for students receiving monthly allowances, scholarships, or part-time earnings.
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: The Signup Form (Centered and spacious for both Desktop & Mobile) */}
      <div className="lg:col-span-7 xl:col-span-6 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-14 xl:p-16">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Header (Only visible on small screens) */}
          <div className="lg:hidden flex flex-col items-center text-center space-y-2 mb-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <BrandEmblem size="md" />
              <span className="text-xl font-bold tracking-tight text-primary">MoneyControlr</span>
            </Link>
            <p className="text-xs text-apptext-muted font-medium">Student Expense Tracker &amp; Budget Planner</p>
          </div>

          {/* Form Card */}
          <Card variant="elevated" className="border-border">
            <CardHeader className="space-y-1.5 pb-4">
              <CardTitle className="text-2xl font-bold text-apptext">Create your account</CardTitle>
              <CardDescription className="text-sm text-apptext-muted">
                Start tracking your daily expenses in under 2 minutes.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form action={formAction} className="space-y-4">
                {state?.error && !state?.success && (
                  <div className="p-3.5 rounded-btn bg-status-dangerLight border border-status-danger/20 text-status-danger text-xs sm:text-sm flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{state.error}</span>
                  </div>
                )}

                {state?.success && (state?.message || state?.error) && (
                  <div className="p-3.5 rounded-btn bg-status-successLight border border-status-success/20 text-status-success text-xs sm:text-sm flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{state.message || state.error}</span>
                  </div>
                )}

                <Input
                  label="Full Name"
                  name="displayName"
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  autoComplete="name"
                  minLength={2}
                  maxLength={80}
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  prefixIcon={<User className="w-4 h-4" />}
                />

                <Input
                  label="College / Personal Email"
                  name="email"
                  type="email"
                  placeholder="alex@college.edu"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  prefixIcon={<Mail className="w-4 h-4" />}
                />

                <div className="space-y-2">
                  <Input
                    label="Password"
                    name="password"
                    type="password"
                    placeholder="Minimum 12 strong characters"
                    autoComplete="new-password"
                    minLength={12}
                    maxLength={128}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    prefixIcon={<Lock className="w-4 h-4" />}
                  />
                  <PasswordRequirements password={password} />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full font-semibold mt-2 shadow-sm"
                  isLoading={isPending}
                >
                  Create Account
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>

                <div className="text-center pt-3 border-t border-border-subtle mt-4">
                  <p className="text-xs text-apptext-muted">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="font-bold text-primary hover:underline ml-0.5"
                    >
                      Log in here
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-apptext-light">
            By creating an account, you agree to simple, private, and secure expense tracking.
          </p>
        </div>
      </div>
    </div>
  );
}
