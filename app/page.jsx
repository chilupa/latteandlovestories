import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Coffee,
  Heart,
  Instagram,
  Sparkles,
  Bookmark,
} from "lucide-react";

/** Default profile; optional override via NEXT_PUBLIC_INSTAGRAM_URL in .env.local */
const DEFAULT_INSTAGRAM =
  process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() ||
  "https://www.instagram.com/latteandlovestories/";

/** Landing “Visit my link page” slug — server-only `SITE_USERNAME` preferred; legacy `NEXT_PUBLIC_SITE_USERNAME` still supported. */
function getLandingUsername() {
  return (
    process.env.SITE_USERNAME?.trim() ||
    process.env.NEXT_PUBLIC_SITE_USERNAME?.trim() ||
    ""
  );
}

export default function HomePage() {
  const publicSlug = getLandingUsername();
  const year = new Date().getFullYear();
  const instagramUrl = DEFAULT_INSTAGRAM;

  return (
    <div className="relative flex min-h-full flex-col overflow-hidden bg-gradient-to-b from-rose-50 via-amber-50/75 to-[#f5f0ff]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.38]"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at 18% 18%, rgba(244, 114, 182, 0.32), transparent 42%), radial-gradient(circle at 82% 12%, rgba(251, 191, 36, 0.22), transparent 38%), radial-gradient(circle at 50% 88%, rgba(167, 139, 250, 0.18), transparent 48%)",
        }}
      />

      <header className="relative z-10 mx-auto w-full max-w-3xl px-6 pb-6 pt-10 text-center sm:pt-14">
        <p className="font-display text-3xl font-semibold tracking-tight text-[#3f2d30] sm:text-4xl">
          Latte & Love Stories
        </p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#7a6568]">
          Books, gentle reviews, and the cozy side of romance, poured with a
          little caffeine and a lot of heart.
        </p>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-3xl flex-1 px-6 pb-16">
        <section
          className="text-center"
          aria-labelledby="landing-hero-heading"
        >
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/75 bg-white/80 px-4 py-2 text-xs font-medium uppercase tracking-[0.15em] text-[#8b7879] shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4 text-rose-400" aria-hidden />
            Bookstagram &amp; beyond
          </p>

          <h1
            id="landing-hero-heading"
            className="font-display text-[2rem] font-semibold leading-[1.12] tracking-tight text-[#2d2424] sm:text-[2.75rem] sm:leading-tight"
          >
            For anyone who falls in love with stories: one chapter, one latte
            at a time.
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-pretty text-base leading-relaxed text-[#5c4b4d] sm:text-lg">
            I share what I&apos;m reading, what makes me swoon, and the quiet
            <br />
            moments between the pages. Grab your drink of choice and stay awhile.
          </p>
        </section>

        <section
          className="mt-14 grid gap-4 sm:grid-cols-3"
          aria-label="What you’ll find here"
        >
          <div className="rounded-2xl border border-white/80 bg-white/70 p-6 text-left shadow-md shadow-rose-900/5 backdrop-blur">
            <BookOpen
              className="mb-3 h-8 w-8 text-rose-400/95"
              aria-hidden
            />
            <h2 className="font-display text-lg font-semibold text-[#3f2d30]">
              Books I love
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#6b5a5a]">
              Romance, comfort reads, and the titles that stick with you after
              the last page.
            </p>
          </div>
          <div className="rounded-2xl border border-white/80 bg-white/70 p-6 text-left shadow-md shadow-rose-900/5 backdrop-blur">
            <Coffee
              className="mb-3 h-8 w-8 text-amber-600/85"
              aria-hidden
            />
            <h2 className="font-display text-lg font-semibold text-[#3f2d30]">
              Cozy vibes
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#6b5a5a]">
              The latte to your TBR: soft light, honest thoughts, no rush.
            </p>
          </div>
          <div className="rounded-2xl border border-white/80 bg-white/70 p-6 text-left shadow-md shadow-rose-900/5 backdrop-blur sm:col-span-1">
            <Bookmark
              className="mb-3 h-8 w-8 text-violet-400/95"
              aria-hidden
            />
            <h2 className="font-display text-lg font-semibold text-[#3f2d30]">
              All my links
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#6b5a5a]">
              One pretty page with everything: shops, posts, and ways to say hi.
            </p>
          </div>
        </section>

        <section
          className="mt-14"
          aria-labelledby="links-card-heading"
        >
          {publicSlug ? (
            <div className="rounded-[1.75rem] border border-violet-200/50 bg-gradient-to-br from-white/95 via-rose-50/40 to-white/90 px-8 py-11 text-center shadow-xl shadow-rose-900/[0.07] backdrop-blur">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-100 to-violet-100 shadow-inner shadow-white/80">
                <Heart
                  className="h-7 w-7 text-rose-500/95"
                  aria-hidden
                />
              </div>
              <h2
                id="links-card-heading"
                className="font-display text-2xl font-semibold tracking-tight text-[#3f2d30] sm:text-[1.65rem]"
              >
                One link for the rest
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[#6b5a5a]">
                Same cozy vibe as here: profile, saves, shops, and anything else
                I&apos;m loving lately, lined up so you don&apos;t have to hunt
                through highlights.
              </p>
              <Button
                size="lg"
                className="mt-9 min-h-[3.25rem] min-w-[240px] rounded-full px-12 text-base shadow-lg shadow-rose-900/18"
                asChild
              >
                <Link href={`/${publicSlug}`}>
                  Visit my link page
                </Link>
              </Button>
            </div>
          ) : (
              <div className="w-full rounded-3xl border border-white/80 bg-white/70 px-8 py-10 text-center shadow-lg shadow-rose-900/10 backdrop-blur">
                <Coffee
                  className="mx-auto mb-4 h-10 w-10 text-rose-400/90"
                  aria-hidden
                />
                <p className="font-display text-xl text-[#3f2d30]">
                  Links page coming soon
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[#6b5a5a]">
                  Add{" "}
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                    SITE_USERNAME
                  </code>{" "}
                  to your env to unlock the primary button on this page (same as
                  your profile username in the editor).
                </p>
                {process.env.NODE_ENV === "development" ? (
                  <p className="mt-4 font-mono text-[0.65rem] text-muted-foreground">
                    Dev: set in .env.local and restart `npm run dev`.
                  </p>
                ) : null}
              </div>
            )}
        </section>

        <section
          className="mt-14 rounded-[1.75rem] border border-rose-200/60 bg-gradient-to-br from-white/90 to-rose-50/80 px-8 py-10 text-center shadow-lg shadow-rose-900/10 backdrop-blur"
          aria-labelledby="connect-heading"
        >
          <h2
            id="connect-heading"
            className="font-display text-2xl font-semibold text-[#3f2d30]"
          >
            Come say hi on Instagram
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[#6b5a5a]">
            Daily reels, aesthetics, and book chat at{" "}
            <span className="font-medium text-[#5c4b4d]">
              @latteandlovestories
            </span>
            , my Bookstagram account.
          </p>
          <Button
            size="lg"
            variant="outline"
            className="mt-8 min-h-[3rem] rounded-full border-rose-300/80 bg-white/90 px-8 shadow-sm hover:bg-rose-50/90"
            asChild
          >
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram className="mr-2 h-5 w-5" aria-hidden />
              Follow on Instagram
            </a>
          </Button>
        </section>

        <div className="mt-16 flex items-center justify-center gap-2 text-sm text-[#a89899]">
          <Heart
            className="h-4 w-4 fill-rose-200/80 text-rose-300/90"
            aria-hidden
          />
          <span>Thanks for stopping by</span>
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/60 bg-white/40 px-6 py-8 text-center text-xs text-[#7a6568] backdrop-blur">
        <p className="font-medium text-[#5c4b4d]">
          © {year} Latte & Love Stories · Made with love
        </p>
      </footer>
    </div>
  );
}
