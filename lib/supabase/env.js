/**
 * Normalize Supabase URL and client API key from env.
 * Prefer NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (sb_publishable_…); fall back to legacy JWT anon / ANON_KEY.
 * Never use sb_secret_… in the browser. Supabase returns 401 for secret keys from browsers.
 */
export function getPublicSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim?.() ?? "";
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim?.() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim?.() ||
    "";
  return { url, anonKey };
}
