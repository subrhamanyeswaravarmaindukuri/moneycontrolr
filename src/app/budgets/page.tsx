import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { NOINDEX_ROBOTS } from "@/lib/seo/metadata";
import { requireVerifiedUser } from "@/lib/security/server-auth";
import { getBudgetAnalytics } from "./actions";
import { HealthMeterCard } from "@/components/budgets/health-meter-card";
import { InsightsBanner } from "@/components/budgets/insights-banner";
import { CategoryBreakdownCard } from "@/components/budgets/category-breakdown-card";
import { Rule503020Card } from "@/components/budgets/rule-503020-card";
import { WeeklyVelocityCard } from "@/components/budgets/weekly-velocity-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, ArrowRight, BarChart3, PlusCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Budgets & Analytics",
  robots: NOINDEX_ROBOTS,
};

export const dynamic = "force-dynamic";

export default async function BudgetsPage() {
  await requireVerifiedUser("/budgets");
  const data = await getBudgetAnalytics();

  if (!data) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 py-8 sm:py-10 px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="max-w-[1440px] mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-5">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-apptext tracking-tight">
                  Spending & Budgets Breakdown
                </h1>
                <span className="hidden sm:inline-block text-[11px] font-bold bg-primary-light text-primary px-2.5 py-0.5 rounded-full">
                  Screen 05
                </span>
              </div>
              <p className="text-xs sm:text-sm text-apptext-muted font-medium mt-1">
                Deep analytics on your category allocations, 50/30/20 balance, and weekly spending velocity.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/budgets/summary">
                <Button variant="outline" size="md" className="font-bold text-xs sm:text-sm">
                  <BarChart3 className="w-4 h-4 mr-1.5 text-primary" />
                  Budget Summary (Screen 06)
                </Button>
              </Link>
              <Link href="/transactions/new">
                <Button size="md" className="font-bold text-xs sm:text-sm shadow-sm">
                  <PlusCircle className="w-4 h-4 mr-1.5" />
                  Record Spend
                </Button>
              </Link>
            </div>
          </div>

          {!data.hasBudget || !data.summary || !data.health || !data.splits503020 ? (
            <Card variant="elevated" className="p-8 sm:p-12 text-center border-border space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center text-primary mx-auto shadow-sm">
                <Wallet className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-apptext">
                  Set Up Your Budget First
                </h2>
                <p className="text-sm text-apptext-muted leading-relaxed">
                  To view category breakdowns, 50/30/20 rule diagnostics, and spending velocity, configure your monthly baseline.
                </p>
              </div>
              <div className="pt-2">
                <Link href="/onboarding">
                  <Button size="lg" className="font-bold px-8 shadow-card">
                    Start Onboarding Setup
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <>
              {/* 1. Health Meter & Projections */}
              <HealthMeterCard health={data.health} summary={data.summary} />

              {/* 2. Actionable Insights */}
              <InsightsBanner insights={data.health.insights} />

              {/* 3. Main Analytics Grid: Category Ranks + 50/30/20 Rule */}
              <div className="grid lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7">
                  <CategoryBreakdownCard categories={data.categoryBreakdown} />
                </div>
                <div className="lg:col-span-5">
                  <Rule503020Card splits={data.splits503020} />
                </div>
              </div>

              {/* 4. Weekly Chronological Velocity */}
              <WeeklyVelocityCard weeks={data.weeklyBreakdown} />
            </>
          )}

        </div>
      </main>
    </div>
  );
}

