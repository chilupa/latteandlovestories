import { cn } from "@/lib/utils";
import { LinkIcon } from "@/components/link-icon";
import { ExternalLink } from "lucide-react";

export function ProfileLinkButton({
  href,
  title,
  icon,
  buttonStyle,
  highlighted,
  accent,
}) {
  const rounded =
    buttonStyle === "pill"
      ? "rounded-full"
      : buttonStyle === "outline"
        ? "rounded-full border-2 bg-white/70"
        : "rounded-2xl";

  const highlightRing = highlighted
    ? "ring-2 ring-offset-2 ring-[var(--profile-accent)] shadow-lg"
    : "shadow-md shadow-black/10";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group relative flex w-full items-center justify-center gap-3 px-5 py-3.5 text-center text-base font-medium text-[#2d2424] transition-[transform,box-shadow,background-color] duration-200 ease-out",
        "hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        rounded,
        highlightRing,
      )}
      style={{
        ["--profile-accent"]: accent,
        background:
          buttonStyle === "outline"
            ? "rgba(255,255,255,0.75)"
            : `color-mix(in srgb, ${accent} 12%, white)`,
      }}
    >
      {icon ? (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/70 text-[var(--profile-accent)] shadow-inner shadow-black/5">
          <LinkIcon name={icon} className="h-4 w-4" />
        </span>
      ) : null}
      <span className="min-w-0 flex-1 truncate font-medium tracking-tight">
        {title}
      </span>
      <ExternalLink
        className="h-4 w-4 shrink-0 opacity-40 transition-opacity group-hover:opacity-70"
        aria-hidden
      />
      <span className="sr-only">(opens in new tab)</span>
    </a>
  );
}
