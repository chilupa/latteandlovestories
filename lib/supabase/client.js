import { createBrowserClient } from "@supabase/ssr";
import { getPublicSupabaseEnv } from "@/lib/supabase/env";

export function createClient() {
  const { url, anonKey } = getPublicSupabaseEnv();
  /* Disable singleton so a stale client isn’t reused after changing .env / restarting dev */
  return createBrowserClient(url, anonKey, { isSingleton: false });
}
