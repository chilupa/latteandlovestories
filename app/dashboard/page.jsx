import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "@/components/dashboard/dashboard-client";
import {
  isAllowedOwner,
  isConfiguredOwnerAccess,
} from "@/lib/owner";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  if (!isConfiguredOwnerAccess()) {
    redirect("/login?reason=misconfigured");
  }
  if (!isAllowedOwner(user)) {
    redirect("/login?reason=forbidden");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  let links = [];
  if (profile) {
    const { data: linkRows } = await supabase
      .from("links")
      .select("*")
      .eq("profile_id", profile.id)
      .order("position", { ascending: true });
    links = linkRows ?? [];
  }

  return (
    <DashboardClient
      userId={user.id}
      initialProfile={profile}
      initialLinks={links}
    />
  );
}
