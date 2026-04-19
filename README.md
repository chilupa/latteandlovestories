# Latte & Love Stories — Link-in-bio

A mobile-first **link-in-bio** site (Linktree-style): a **cozy public landing** (`/`), a **public profile** at `/[username]`, and a **single owner** who edits everything from `/dashboard` after signing in at `/login`.

**Stack:** Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · Radix + CVA (“shadcn-style” UI) · Supabase (Auth, Postgres, Storage) · JavaScript only

---

## Routes

| Path | Who | Purpose |
|------|-----|---------|
| `/` | Everyone | Visitor landing — **Open my links** when `SITE_USERNAME` is set; **no editor/login links** on this page |
| `/[username]` | Everyone | Public profile (avatar, bio, themed links, optional social row, footer) |
| `/login` | Owner | Email + password sign-in (no public sign-up UI) |
| `/dashboard` | Owner only | Edit profile (including **username** / URL slug), theme, links (drag-and-drop), avatar upload |
| `/auth/callback` | — | Supabase session exchange (email confirmation / OAuth if you enable it) |
| `/api/dev/supabase-check` | Dev only | JSON check that Supabase URL + client key work (404 in production) |

Owners should **bookmark `/login`** — the home page is intentionally visitor-only.

---

## Who can edit vs. view

| | |
|--|--|
| **Visitors** | Open `/` and `/[username]` — no account. |
| **Editor** | Only if Supabase Auth matches **`ALLOWED_OWNER_EMAIL`** or **`ALLOWED_OWNER_ID`** in env (see below). |

Disable public sign-ups in Supabase (**Authentication → Providers → Email**) and create **one** user under **Authentication → Users** for the owner.

---

## Features

- **Landing** — Warm copy, primary CTA to `/{SITE_USERNAME}`; placeholder card if slug env is unset (dev hint for missing env)
- **Profile** — Avatar (Storage), display name, **editable username** (public URL), bio, optional Instagram / YouTube / TikTok / website / contact email
- **Links** — Title, validated URL, optional icon keys (Lucide), visibility, highlight style, **drag-and-drop order**
- **Theme** — Solid or gradient/CSS background, accent, button shape (pill / soft / outline); live preview on desktop
- **Auth** — Middleware + server actions enforce owner; Supabase **RLS** on tables
- **Footer** — “Made with love” / © on landing and public profile

---

## Folder structure

```
app/
  layout.jsx
  globals.css
  page.jsx                 # Visitor landing
  login/page.jsx
  dashboard/page.jsx
  dashboard/actions.js       # Server Actions (profile, links, theme, avatar URL)
  [username]/page.jsx
  auth/callback/route.js
  api/dev/supabase-check/route.js   # Dev-only env diagnostic
components/
  ui/                        # Button, Card, Input, Label, Textarea, Tabs
  dashboard/                 # dashboard-client, avatar-upload, links-editor (DnD)
  auth/login-form.jsx
  profile-public-view.jsx
lib/
  supabase/client.js | server.js | env.js
  owner.js theme.js validators.js utils.js
middleware.js
supabase/
  schema.sql
  storage-policies.sql
  seed.sql
.env.example
next.config.mjs
```

---

## Prerequisites

- Node.js 18+ (20+ recommended)
- A [Supabase](https://supabase.com) project

---

## Supabase setup

### 1. Project API keys

In **Project Settings → API** (or **API Keys**):

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **Client key** → use the **publishable** key (`sb_publishable_…`) or legacy **anon** JWT (`eyJ…`) → `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
  **Never** put **`sb_secret_…`** or **`service_role`** in `NEXT_PUBLIC_*` — browsers get **401** by design.

See [Understanding API keys](https://supabase.com/docs/guides/api/api-keys).

### 2. Database

Run **`supabase/schema.sql`** in the SQL Editor. It adds `public.users` (mirror + trigger), **`profiles`**, **`links`**, RLS, and `updated_at` triggers.

### 3. Storage (avatars)

1. Create a **public** bucket named **`avatars`** (or set `NEXT_PUBLIC_AVATAR_BUCKET`).
2. Run **`supabase/storage-policies.sql`** after the bucket exists.

### 4. Auth

- Enable **Email** provider; turn **off** public sign-ups if you only want the owner account.
- Add **Redirect URLs**: `http://localhost:3000/auth/callback` and your production URL + `/auth/callback`.

### 5. Seed (optional)

Uncomment **`supabase/seed.sql`** only if you insert demo rows manually (usually you create the owner in the dashboard after first login).

---

## Environment variables

Copy **`.env.example`** → **`.env.local`** in the repo root.

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (`https://….supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable (`sb_publishable_…`) **or** legacy anon JWT (`eyJ…`) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Optional alias; if set, **`lib/supabase/env.js`** prefers this over `ANON_KEY` |
| `NEXT_PUBLIC_AVATAR_BUCKET` | Optional; default `avatars` |
| **`ALLOWED_OWNER_EMAIL`** | **Required for `/dashboard`:** owner’s Supabase Auth email |
| `ALLOWED_OWNER_ID` | Optional: owner’s `auth.users` UUID |
| **`SITE_USERNAME`** | **Recommended:** profile slug for landing **Open my links** → `/{slug}` (same as dashboard username). Server-only — not bundled to the browser. Legacy: `NEXT_PUBLIC_SITE_USERNAME` still works if unset. |

After changing any **`NEXT_PUBLIC_*`** variable, **restart** `npm run dev` or rebuild — values are baked into the client bundle.

**Production:** Set the same variables on your host (e.g. Vercel project settings). `next.config.mjs` reads `NEXT_PUBLIC_SUPABASE_URL` at **build time** for `next/image` remote patterns.

---

## Troubleshooting

### Invalid API key / 401 on `/auth/v1/token`

- URL + client key must be from the **same** project.
- Use **publishable** or **anon JWT**, not **secret** / **service_role**, in public env vars.
- Trim pasted keys (no quotes, one line). Restart dev server.
- **Development:** open **`/api/dev/supabase-check`** — `restApiStatus` **401** means the key is rejected for that URL.

### Login works but `/dashboard` redirects to `/login?reason=forbidden`

- Signed-in email must match **`ALLOWED_OWNER_EMAIL`** (case-insensitive).

### `/dashboard` redirects to `/login?reason=misconfigured`

- Set **`ALLOWED_OWNER_EMAIL`** or **`ALLOWED_OWNER_ID`**.

### Email sign-in other issues

| Symptom | Check |
|--------|--------|
| Wrong password / invalid credentials | User exists under **Authentication → Users**; password matches or reset in dashboard |
| Email confirmation | Turn off **Confirm email** for testing, or confirm via inbox / user row |
| Email provider off | **Authentication → Providers** → Email enabled |

---

## Run locally

```bash
npm install
npm run dev
```

1. Create the **owner** user in Supabase and set **`ALLOWED_OWNER_EMAIL`** (and Supabase URL + client key).
2. Set **`SITE_USERNAME`** to the same slug you will use on the profile (optional until you pick a username).
3. Sign in at **`/login`**, open **`/dashboard`**, choose **username** once, then edit links, theme, avatar.
4. Share **`http://localhost:3000/<username>`** with visitors; landing **`/`** reads **`SITE_USERNAME`** for the main button.

---

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint |

---

## Deploy

- Configure **all env vars** on the host (including `NEXT_PUBLIC_*` and `ALLOWED_OWNER_EMAIL`).
- Supabase **Site URL** and **Redirect URLs** for production.
- Optional: Next.js 16 may warn that **`middleware`** is deprecated in favor of **`proxy`** — behavior still works; migrate when you upgrade toolchains.

---

## Security (short)

- **`NEXT_PUBLIC_*`** is visible in the browser — only **publishable/anon** keys belong there; **RLS** protects data.
- Keep **`sb_secret_`** / **service_role** on the server only (this app does not require them in the repo for normal operation).
- Rotate any key that was ever pasted into a public env var by mistake.

---

## License

Private project — adjust as needed.
