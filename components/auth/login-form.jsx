"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const REASON_MESSAGES = {
  forbidden:
    "Only the designated owner can open the editor. If you’re already logged in, use Sign out on the dashboard, then sign in with the owner account.",
  misconfigured:
    "This site isn’t configured yet: add ALLOWED_OWNER_EMAIL or ALLOWED_OWNER_ID on the server.",
};

/** Turn Supabase Auth errors into clearer next steps for small teams / solo editors. */
function describeAuthError(error) {
  const raw = error?.message ?? "";
  const lower = raw.toLowerCase();

  if (lower.includes("invalid login credentials")) {
    return "Wrong email or password, or this email exists but isn’t confirmed in Supabase yet. In the dashboard: Authentication → Users, check the user has a sign-in method and is allowed to sign in.";
  }
  if (lower.includes("email not confirmed")) {
    return "This account must confirm its email first (check the inbox), or in Supabase: Authentication → Users → open the user and mark as confirmed, or turn off “Confirm email” under Email provider for testing.";
  }
  if (lower.includes("user not found") || lower.includes("no user found")) {
    return "No user with that email. Add the user in Supabase: Authentication → Users → Add user, or disable “Sign up” and only use that one account.";
  }
  if (lower.includes("invalid api key") || lower.includes("api key")) {
    return "Invalid API key or project URL. Copy both again from Project Settings → API (same project) and restart the dev server after changing .env.local.";
  }
  if (raw) return raw;
  return "Sign-in failed. Check the browser network tab for the Supabase response, and that this project isn’t paused in Supabase.";
}

/** Avoid open redirects; only allow same-origin paths like /dashboard */
function safeInternalPath(next) {
  if (typeof next !== "string" || !next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }
  return next;
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const nextPath = useMemo(
    () => safeInternalPath(searchParams.get("next") || "/dashboard"),
    [searchParams],
  );

  const reasonBanner = useMemo(() => {
    const r = searchParams.get("reason");
    return r ? REASON_MESSAGES[r] ?? null : null;
  }, [searchParams]);

  const supabase = useMemo(() => createClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  async function handleSignIn(e) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      setLoading(false);
      setMessage(describeAuthError(error));
      return;
    }

    /* Ensure session is written to cookies before leaving the page. Client
     * router navigation can race middleware; a full load guarantees cookies. */
    await supabase.auth.getSession();
    setLoading(false);
    window.location.assign(nextPath);
  }

  return (
    <div className="space-y-6">
      {reasonBanner ? (
        <div
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
          role="alert"
        >
          {reasonBanner}
        </div>
      ) : null}

      <form onSubmit={handleSignIn} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email-in">Email</Label>
          <Input
            id="email-in"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password-in">Password</Label>
          <Input
            id="password-in"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {message ? (
          <p className="text-sm text-rose-700" role="status">
            {message}
          </p>
        ) : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

    </div>
  );
}
