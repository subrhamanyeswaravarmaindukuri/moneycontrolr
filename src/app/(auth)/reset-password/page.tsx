import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { hasConfiguredSupabaseEnv } from "@/lib/security/supabase-config";
import { BrandEmblem } from "@/components/layout/brand-logo";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const hasErrorParam = Boolean(params?.error);

  let hasSession = false;
  if (hasConfiguredSupabaseEnv() && !hasErrorParam) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      hasSession = Boolean(user);
    } catch {
      hasSession = false;
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="mb-6 text-center">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <BrandEmblem size="md" />
          <span className="text-xl font-bold tracking-tight text-primary">MoneyControlr</span>
        </Link>
      </div>

      <ResetPasswordForm hasSession={hasSession} hasErrorParam={hasErrorParam} />
    </div>
  );
}

