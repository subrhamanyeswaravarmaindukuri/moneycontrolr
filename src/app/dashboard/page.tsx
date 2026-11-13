import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { NOINDEX_ROBOTS } from "@/lib/seo/metadata";
import { requireVerifiedUser } from "@/lib/security/server-auth";
import { getDashboardData } from "./actions";
import { SpendingHero } from "@/components/dashboard/spending-hero";
import { MetricCards } from "@/components/dashboard/metric-cards";
import { BudgetSplitCard } from "@/components/dashboard/budget-split-card";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Wallet } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: NOINDEX_ROBOTS,
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await requireVerifiedUser("/dashboard");
  const data = await getDashboardData();

  if (!data) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 py-8 sm:py-10 px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="max-w-[1440px] mx-auto space-y-6 sm:space-y-8">
          
          {/* Welcome Greeting Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-apptext tracking-tight">
                Welcome back, {data.user.displayName} 👋
              </h1>
              <p className="text-xs sm:text-sm text-apptext-muted font-medium">
                Here is your live daily spending breakdown and allowance status.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/transactions/new">
                <Button size="md" className="font-bold shadow-sm">
                  + Record Transaction
                </Button>
              </Link>
            </div>
          </div>

          {/* If the user has not completed onboarding yet */}
          {!data.hasBudget || !data.summary || !data.budget ? (
            <Card variant="elevated" className="p-8 sm:p-12 text-center border-border space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center text-primary mx-auto shadow-sm">
                <Wallet className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-apptext">
                  Let's configure your monthly allowance
                </h2>
                <p className="text-sm text-apptext-muted leading-relaxed">
                  To calculate your safe daily spending limit and track your rollover, set up your monthly money baseline.
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
            /* Main Live Dashboard */
            <>
              {/* 1. Flagship Spending Hero */}
              <SpendingHero summary={data.summary} />

              {/* 2. Key Monthly Metrics */}
              <MetricCards summary={data.summary} />

              {/* 3. Bottom Grid: Recent Transactions + Budget Allocation Split */}
              <div className="grid lg:grid-cols-12 gap-6 sm:gap-8 items-start">
                <div className="lg:col-span-7">
                  <RecentActivity transactions={data.recentTransactions} />
                </div>

                <div className="lg:col-span-5">
                  <BudgetSplitCard
                    budget={data.budget}
                    needsSpent={data.needsSpent}
                    wantsSpent={data.wantsSpent}
                  />
                </div>
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
}

