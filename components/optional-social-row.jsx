import { Instagram, Mail, Music2, Youtube, Globe } from "lucide-react";

const items = [
  { key: "instagram_url", label: "Instagram", icon: Instagram },
  { key: "youtube_url", label: "YouTube", icon: Youtube },
  { key: "tiktok_url", label: "TikTok", icon: Music2 },
  { key: "website_url", label: "Website", icon: Globe },
  { key: "contact_email", label: "Email", icon: Mail, mailto: true },
];

export function OptionalSocialRow({ profile, accent }) {
  const chips = items
    .map(({ key, label, icon: Icon, mailto }) => {
      const raw = profile[key];
      if (!raw || String(raw).trim() === "") return null;
      const href = mailto ? `mailto:${String(raw).trim()}` : String(raw).trim();
      return (
        <a
          key={key}
          href={href}
          target={mailto ? undefined : "_blank"}
          rel={mailto ? undefined : "noopener noreferrer"}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-[var(--profile-accent)] shadow-md shadow-black/10 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{ ["--profile-accent"]: accent }}
          aria-label={label}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </a>
      );
    })
    .filter(Boolean);

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap justify-center gap-3 px-2 pt-1">{chips}</div>
  );
}
