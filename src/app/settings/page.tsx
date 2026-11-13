import { Navbar } from "@/components/layout/navbar";
import { requireVerifiedUser } from "@/lib/security/server-auth";
import { AccountSecurityForms } from "@/components/settings/account-security-forms";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const { user } = await requireVerifiedUser("/settings");
  const params = await searchParams;
  const displayName =
    (user.user_metadata?.display_name as string | undefined) ||
    user.email?.split("@")[0] ||
    "Student";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12 px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface border border-border rounded-card p-6 shadow-card">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-apptext">
                  Account & Security
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

