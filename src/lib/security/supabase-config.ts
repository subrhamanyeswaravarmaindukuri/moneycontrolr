/**
 * Central check verifying that real Supabase URL & anon key credentials are configured.
 * Replaces scattered placeholder fallbacks so auth always fails closed when unconfigured.
 */
export function hasConfiguredSupabaseEnv(
  url: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
): boolean {
  const cleanUrl = url?.trim() ?? "";
  const cleanKey = anonKey?.trim() ?? "";

  if (!cleanUrl || !cleanKey) return false;
  if (cleanUrl.toLowerCase().includes("placeholder") || cleanKey.toLowerCase().includes("placeholder")) {
    return false;
  }
  if (cleanKey.length < 20) return false;

  try {
    const parsed = new URL(cleanUrl);
    return parsed.protocol === "https:" || parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

