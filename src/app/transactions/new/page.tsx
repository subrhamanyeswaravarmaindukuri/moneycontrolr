import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { NOINDEX_ROBOTS } from "@/lib/seo/metadata";
import { requireVerifiedUser } from "@/lib/security/server-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { getCategories } from "@/app/transactions/actions";
import { ArrowLeft, Sparkles, TrendingUp, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "New Transaction",
  robots: NOINDEX_ROBOTS,
};

export const dynamic = "force-dynamic";

export default async function AddTransactionPage() {
  await requireVerifiedUser("/transactions/new");
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12 px-4 sm:px-8 lg:px-12">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Back Navigation */}
          <Link
            href="/transactions"
            className="inline-flex items-center gap-2 text-xs font-bold text-apptext-muted hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Transactions History
          </Link>

          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Form Column */}
            <div className="lg:col-span-8">
              <Card variant="elevated" className="border-border">
                <CardHeader className="space-y-1.5 pb-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                    <Sparkles className="w-3.5 h-3.5" />
                    Screen 03: Fast Entry
                  </div>
                  <CardTitle className="text-2xl font-bold text-apptext">
                    Record Transaction
                  </CardTitle>
                  <CardDescription className="text-sm text-apptext-muted">
                    Quickly add an expense or new income. Your safe daily limit will recalculate automatically.
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-2">
                  <TransactionForm categories={categories} />
                </CardContent>
              </Card>
            </div>

            {/* Right Helper Column (Desktop Guidance) */}
            <div className="lg:col-span-4 space-y-4">
              <Card variant="flat" className="p-5 border-border bg-surface space-y-3">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-primary">
                  <TrendingUp className="w-4 h-4" />
                  Daily Limit Impact
                </div>
                <p className="text-xs text-apptext-muted leading-relaxed">
                  Every expense logged today directly reduces today's remaining safe-to-spend amount.
                </p>
                <div className="p-3 rounded-xl bg-background border border-border text-xs space-y-1.5">
                  <span className="font-bold text-apptext block">Smart Rollover:</span>
                  <p className="text-[11px] text-apptext-muted">
                    If you don't use all of today's limit, the unspent portion is distributed across all remaining days of the month!
                  </p>
                </div>
              </Card>

              <Card variant="flat" className="p-5 border-border bg-surface space-y-2.5">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-apptext">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  Student Best Practices
                </div>
                <ul className="text-xs text-apptext-muted space-y-2 list-disc list-inside">
                  <li>Log chai & canteen expenses right after paying.</li>
                  <li>Use the optional memo to remember group bills.</li>
                  <li>Incomes (allowance, scholarships) increase your total balance.</li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
