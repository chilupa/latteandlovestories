import {
  Heart,
  Instagram,
  Link2,
  Mail,
  Music2,
  PenLine,
  Sparkles,
  Youtube,
  Globe,
} from "lucide-react";

const ICON_MAP = {
  link: Link2,
  heart: Heart,
  instagram: Instagram,
  youtube: Youtube,
  tiktok: Music2,
  mail: Mail,
  globe: Globe,
  sparkles: Sparkles,
  "pen-line": PenLine,
};

export const LINK_ICON_OPTIONS = Object.keys(ICON_MAP);

export function LinkIcon({ name, className }) {
  const Cmp = ICON_MAP[name] ?? Link2;
  return <Cmp className={className} aria-hidden />;
}
