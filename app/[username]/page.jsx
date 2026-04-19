import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfilePublicView } from "@/components/profile-public-view";
import { RESERVED_USERNAMES } from "@/lib/validators";

export async function generateMetadata({ params }) {
  const { username } = await params;
  const u = String(username).toLowerCase();

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, bio")
    .eq("username", u)
    .maybeSingle();

  if (!profile) {
    return { title: "Profile" };
  }

  const name = profile.display_name || profile.username;
  return {
    title: name,
    description: profile.bio || `${name}: links and contact.`,
  };
}

export default async function ProfilePage({ params }) {
  const { username } = await params;
  const u = String(username).toLowerCase();

  if (RESERVED_USERNAMES.has(u)) {
    notFound();
  }

  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", u)
    .maybeSingle();

  if (error || !profile) {
    notFound();
  }

  const { data: links } = await supabase
    .from("links")
    .select("*")
    .eq("profile_id", profile.id)
    .order("position", { ascending: true });

  return (
    <ProfilePublicView profile={profile} links={links ?? []} />
  );
}
