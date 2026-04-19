import { NextResponse } from "next/server";
import { getPublicSupabaseEnv } from "@/lib/supabase/env";

/**
 * Development-only: verifies env shape and whether the anon key is accepted by this project.
 * Open GET /api/dev/supabase-check while running `npm run dev`.
 */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { url: rawUrl, anonKey } = getPublicSupabaseEnv();
  const url = rawUrl?.replace(/\/$/, "") ?? "";

  let urlHost = null;
  try {
    urlHost = url ? new URL(url).hostname : null;
  } catch {
    urlHost = "invalid-url";
  }

  const diagnosis = [];
  if (!url)
    diagnosis.push(
      "NEXT_PUBLIC_SUPABASE_URL is empty. Add it to .env.local and restart `npm run dev`.",
    );
  if (!anonKey)
    diagnosis.push(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY is empty. Add it to .env.local and restart.",
    );
  if (anonKey && !anonKey.startsWith("eyJ")) {
    diagnosis.push(
      "Anon key should look like a JWT starting with eyJ…. You may have pasted the service_role key, JWT secret, or only part of the key.",
    );
  }
  if (anonKey && anonKey.length < 120) {
    diagnosis.push(
      "Anon key looks too short. Copy the full anon public key from Project Settings → API.",
    );
  }

  /** PostgREST returns 401 when apikey does not match this project */
  let restStatus = null;
  let restHint = null;
  if (url && anonKey) {
    try {
      const res = await fetch(`${url}/rest/v1/`, {
        method: "GET",
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });
      restStatus = res.status;
      if (res.status === 401 || res.status === 403) {
        diagnosis.push(
          "REST API rejected your anon key (401/403). Copy Project URL + anon public key from the SAME Supabase project; restart dev server.",
        );
        restHint = "anon key rejected";
      } else if (res.ok || res.status === 404 || res.status === 406) {
        restHint = "anon key accepted by PostgREST";
      } else {
        restHint = `unexpected status ${res.status}`;
      }
    } catch (e) {
      restStatus = "fetch-error";
      diagnosis.push(`Could not reach Supabase URL: ${e?.message ?? e}`);
    }
  }

  const ok =
    diagnosis.length === 0 &&
    (restStatus === 200 ||
      restStatus === 404 ||
      restStatus === 406 ||
      restStatus === 204);

  return NextResponse.json({
    ok,
    urlHost,
    urlConfigured: Boolean(url),
    keyConfigured: Boolean(anonKey),
    keyLength: anonKey?.length ?? 0,
    keyStartsWithEyJ: anonKey?.startsWith("eyJ") ?? false,
    restApiStatus: restStatus,
    restHint,
    diagnosis,
    nextSteps: [
      "Use only .env.local (or .env) in the project root (same folder as package.json).",
      "After any change to NEXT_PUBLIC_* vars, stop and restart `npm run dev` (env is baked into the client bundle).",
      "Project Settings → API: URL must match your project ref (e.g. qrfojjwuxjasfjlsseci.supabase.co).",
    ],
  });
}
