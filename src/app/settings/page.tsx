import { Navbar } from "@/components/layout/navbar";
import { requireVerifiedUser } from "@/lib/security/server-auth";
import { AccountSecurityForms } from "@/components/settings/account-security-forms";
import { CategoryManager } from "@/components/settings/category-manager";
import { RecurringManager } from "@/components/settings/recurring-manager";
import { getCategories, getRecurringExpenses } from "@/app/transactions/actions";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ShieldCheck, Palette } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const { user } = await requireVerifiedUser("/settings");
  const params = await searchParams;

  const [categories, recurring] = await Promise.all([
    getCategories(),
    getRecurringExpenses(),
  ]);

  const displayName =
    (user.user_metadata?.display_name as string | undefined) ||
    user.email?.split("@")[0] ||
    "Student";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12 px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface border border-border rounded-card p-6 shadow-card">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-apptext">
                  Settings &amp; Preferences
                </h1>
                <Badge variant="success" className="text-[11px] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  Email Verified
                </Badge>
              </div>
              <p className="text-sm text-apptext-muted">
                Signed in as <span className="font-semibold text-apptext">{displayName}</span> ({user.email})
              </p>
            </div>
          </div>

          {/* 1. Custom Spending & Income Categories */}
          <CategoryManager initialCategories={categories} />

          {/* 2. Recurring Monthly Bills & Fixed Commitments */}
          <RecurringManager initialRecurring={recurring} categories={categories} />

          {/* 3. Appearance & Theme Preferences */}
          <Card variant="flat" className="p-6 bg-surface border-border shadow-card space-y-5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold text-apptext">Appearance &amp; Theme</h2>
                </div>
                <p className="text-xs sm:text-sm text-apptext-muted">
                  Choose between crisp light mode, obsidian forest dark mode, or auto-sync with your system settings.
                </p>
              </div>
            </div>
            <ThemeToggle variant="cards" />
          </Card>

          {/* 4. Account Security (Password, Email Confirmation) */}
          <AccountSecurityForms
            currentEmail={user.email ?? ""}
            pendingNewEmail={user.new_email ?? null}
            callbackError={params?.error === "email_change_failed"}
            callbackNotice={params?.notice ?? null}
          />
        </div>
      </main>
    </div>
  );
}

