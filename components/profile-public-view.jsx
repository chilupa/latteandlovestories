import Link from "next/link";
import { ProfileLinkButton } from "@/components/profile-link-button";
import { OptionalSocialRow } from "@/components/optional-social-row";
import { parseTheme, themeToStyleVars } from "@/lib/theme";

export function ProfilePublicView({ profile, links }) {
  const theme = parseTheme(profile.theme);
  const surfaceStyle = themeToStyleVars(theme);
  const accent = theme.accent;
  const activeLinks = (links ?? []).filter((l) => l.is_active);

  return (
    <div
      className="min-h-full w-full px-4 py-10 sm:px-6 sm:py-14"
      style={surfaceStyle}
    >
      <div className="mx-auto flex max-w-md flex-col items-center">
        <article
          className="w-full rounded-[1.75rem] border border-white/60 bg-white/75 p-8 shadow-[0_28px_80px_-32px_rgba(90,60,70,0.35)] backdrop-blur-md supports-[backdrop-filter]:bg-white/65"
          style={{ ["--profile-accent"]: accent }}
        >
          <header className="flex flex-col items-center text-center">
            <div className="relative mb-5 h-28 w-28 overflow-hidden rounded-full ring-4 ring-white shadow-lg shadow-rose-900/10">
              {profile.avatar_url ? (
                /* eslint-disable-next-line @next/next/no-img-element -- user Storage URLs; next/image SSR can throw if patterns/env mismatch */
                <img
                  src={profile.avatar_url}
                  alt={`${profile.display_name || profile.username} portrait`}
                  className="absolute inset-0 h-full w-full object-cover"
                  decoding="async"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-100 to-amber-50 font-display text-3xl font-semibold text-rose-900/50"
                  aria-hidden
                >
                  {(profile.display_name || profile.username || "?")
                    .slice(0, 1)
                    .toUpperCase()}
                </div>
              )}
            </div>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-[#2a1f20] sm:text-[2rem]">
              {profile.display_name || profile.username}
            </h1>
            {profile.bio ? (
              <p className="mt-3 max-w-sm text-base leading-relaxed text-[#5c4b4d]">
                {profile.bio}
              </p>
            ) : null}
          </header>

          <OptionalSocialRow profile={profile} accent={accent} />

          <nav
            className="mt-8 flex w-full flex-col gap-3"
            aria-label="Profile links"
          >
            {activeLinks.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">
                Links coming soon.
              </p>
            ) : (
              activeLinks.map((link) => (
                <ProfileLinkButton
                  key={link.id}
                  href={link.url}
                  title={link.title}
                  icon={link.icon}
                  buttonStyle={theme.buttonStyle}
                  highlighted={link.is_highlighted}
                  accent={accent}
                />
              ))
            )}
          </nav>
        </article>

        <footer className="mt-12 w-full text-center">
          <p className="text-xs leading-relaxed text-[#6b5a5a]/90">
            © {new Date().getFullYear()}{" "}
            <Link
              href="/"
              className="text-[#5c4b4d] underline decoration-rose-300/90 underline-offset-4 transition-colors hover:text-[#3f2d30]"
            >
              Latte & Love Stories
            </Link>
            {" · "}
            <span className="text-[#7a6568]">Made with love</span>
          </p>
        </footer>
      </div>
    </div>
  );
}
