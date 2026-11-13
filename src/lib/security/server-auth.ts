import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasConfiguredSupabaseEnv } from "./supabase-config";

/**
 * Enforces authentication and verified email status inside Server Components and layouts
 * as defense-in-depth behind middleware and PostgreSQL RLS.
 */
export async function requireVerifiedUser(loginRedirectTo?: string) {
  if (!hasConfiguredSupabaseEnv()) {
    redirect("/login?error=auth_unavailable");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const query = loginRedirectTo
      ? `?redirectTo=${encodeURIComponent(loginRedirectTo)}`
      : "";
    redirect(`/login${query}`);
  }

  if (!user.email_confirmed_at) {
    const query = user.email ? `?email=${encodeURIComponent(user.email)}` : "";
    redirect(`/verify-email${query}`);
  }

  return { supabase, user };
}

