"use server";

import { createClient } from "@/lib/supabase/server";
import { defaultTheme, parseTheme } from "@/lib/theme";
import { redirect } from "next/navigation";
import {
  isValidHttpUrl,
  isValidOptionalEmail,
  isValidOptionalUrl,
  isValidUsername,
} from "@/lib/validators";
import { revalidatePath } from "next/cache";
import { isAllowedOwner, isConfiguredOwnerAccess } from "@/lib/owner";

async function requireUser(supabase) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return { user: null, error: "You must be signed in." };
  }
  return { user, error: null };
}

async function requireOwner(supabase) {
  const { user, error } = await requireUser(supabase);
  if (!user) return { user: null, error };
  if (!isConfiguredOwnerAccess()) {
    return {
      user: null,
      error:
        "Server is not configured for owner access (set ALLOWED_OWNER_EMAIL or ALLOWED_OWNER_ID).",
    };
  }
  if (!isAllowedOwner(user)) {
    return { user: null, error: "Only the site owner can change this page." };
  }
  return { user, error: null };
}

export async function createProfile({ username, displayName }) {
  const supabase = await createClient();
  const { user, error: authError } = await requireOwner(supabase);
  if (!user) return { error: authError };

  const u = String(username ?? "").trim().toLowerCase();
  const name = String(displayName ?? "").trim();

  if (!isValidUsername(u)) {
    return {
      error:
        "Username must be 3–30 characters: lowercase letters, numbers, or underscores.",
    };
  }

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    return { error: "You already have a profile." };
  }

  const { error } = await supabase.from("profiles").insert({
    user_id: user.id,
    username: u,
    display_name: name || null,
    bio: null,
    avatar_url: null,
    theme: defaultTheme,
    instagram_url: null,
    youtube_url: null,
    tiktok_url: null,
    website_url: null,
    contact_email: null,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "That username is already taken." };
    }
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/${u}`);
  return { success: true };
}

export async function updateProfileFields({
  username,
  displayName,
  bio,
  instagramUrl,
  youtubeUrl,
  tiktokUrl,
  websiteUrl,
  contactEmail,
}) {
  const supabase = await createClient();
  const { user, error: authError } = await requireOwner(supabase);
  if (!user) return { error: authError };

  const newUsername = String(username ?? "").trim().toLowerCase();
  if (!isValidUsername(newUsername)) {
    return {
      error:
        "Username must be 3–30 characters: lowercase letters, numbers, or underscores (not reserved).",
    };
  }

  if (!isValidOptionalUrl(instagramUrl))
    return { error: "Instagram URL must be a valid http(s) link." };
  if (!isValidOptionalUrl(youtubeUrl))
    return { error: "YouTube URL must be a valid http(s) link." };
  if (!isValidOptionalUrl(tiktokUrl))
    return { error: "TikTok URL must be a valid http(s) link." };
  if (!isValidOptionalUrl(websiteUrl))
    return { error: "Website URL must be a valid http(s) link." };
  if (!isValidOptionalEmail(contactEmail))
    return { error: "Contact email looks invalid." };

  const { data: profile, error: loadError } = await supabase
    .from("profiles")
    .select("username")
    .eq("user_id", user.id)
    .maybeSingle();

  if (loadError || !profile) return { error: "Profile not found." };

  const previousUsername = profile.username;

  const { error } = await supabase
    .from("profiles")
    .update({
      username: newUsername,
      display_name: displayName?.trim() || null,
      bio: bio?.trim() || null,
      instagram_url: instagramUrl?.trim() || null,
      youtube_url: youtubeUrl?.trim() || null,
      tiktok_url: tiktokUrl?.trim() || null,
      website_url: websiteUrl?.trim() || null,
      contact_email: contactEmail?.trim() || null,
    })
    .eq("user_id", user.id);

  if (error) {
    if (error.code === "23505") {
      return { error: "That username is already taken." };
    }
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  if (previousUsername !== newUsername) {
    revalidatePath(`/${previousUsername}`);
  }
  revalidatePath(`/${newUsername}`);
  return { success: true };
}

export async function updateThemeFields({
  backgroundType,
  background,
  accent,
  buttonStyle,
}) {
  const supabase = await createClient();
  const { user, error: authError } = await requireOwner(supabase);
  if (!user) return { error: authError };

  const { data: profile, error: loadError } = await supabase
    .from("profiles")
    .select("id, username, theme")
    .eq("user_id", user.id)
    .maybeSingle();

  if (loadError || !profile) return { error: "Profile not found." };

  const next = {
    ...parseTheme(profile.theme),
    backgroundType: backgroundType ?? "gradient",
    background: background ?? parseTheme(profile.theme).background,
    accent: accent ?? parseTheme(profile.theme).accent,
    buttonStyle: buttonStyle ?? "pill",
  };

  const { error } = await supabase
    .from("profiles")
    .update({ theme: next })
    .eq("id", profile.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath(`/${profile.username}`);
  return { success: true };
}

export async function updateAvatarUrl(avatarUrl) {
  const supabase = await createClient();
  const { user, error: authError } = await requireOwner(supabase);
  if (!user) return { error: authError };

  if (avatarUrl && typeof avatarUrl === "string" && !isValidHttpUrl(avatarUrl)) {
    return { error: "Avatar URL must be a valid https link." };
  }

  const { data: profile, error: loadError } = await supabase
    .from("profiles")
    .select("username")
    .eq("user_id", user.id)
    .maybeSingle();

  if (loadError || !profile) return { error: "Profile not found." };

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl?.trim() || null })
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath(`/${profile.username}`);
  return { success: true };
}

export async function createLink({ title, url, icon, isHighlighted }) {
  const supabase = await createClient();
  const { user, error: authError } = await requireOwner(supabase);
  if (!user) return { error: authError };

  const t = String(title ?? "").trim();
  const u = String(url ?? "").trim();

  if (!t) return { error: "Title is required." };
  if (!isValidHttpUrl(u)) return { error: "Enter a valid http(s) URL." };

  const { data: profile, error: loadError } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("user_id", user.id)
    .maybeSingle();

  if (loadError || !profile) return { error: "Profile not found." };

  const { count, error: countError } = await supabase
    .from("links")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", profile.id);

  if (countError) return { error: countError.message };

  const position = typeof count === "number" ? count : 0;

  const { error } = await supabase.from("links").insert({
    profile_id: profile.id,
    title: t,
    url: u,
    icon: icon?.trim() || null,
    position,
    is_active: true,
    is_highlighted: Boolean(isHighlighted),
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath(`/${profile.username}`);
  return { success: true };
}

export async function updateLink({ id, title, url, icon, isHighlighted, isActive }) {
  const supabase = await createClient();
  const { user, error: authError } = await requireOwner(supabase);
  if (!user) return { error: authError };

  const t = String(title ?? "").trim();
  const u = String(url ?? "").trim();

  if (!t) return { error: "Title is required." };
  if (!isValidHttpUrl(u)) return { error: "Enter a valid http(s) URL." };

  const { data: profile, error: loadError } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("user_id", user.id)
    .maybeSingle();

  if (loadError || !profile) return { error: "Profile not found." };

  const { data: linkRow, error: linkErr } = await supabase
    .from("links")
    .select("id")
    .eq("id", id)
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (linkErr || !linkRow) return { error: "Link not found." };

  const { error } = await supabase
    .from("links")
    .update({
      title: t,
      url: u,
      icon: icon?.trim() || null,
      is_highlighted: Boolean(isHighlighted),
      is_active: Boolean(isActive),
    })
    .eq("id", id)
    .eq("profile_id", profile.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath(`/${profile.username}`);
  return { success: true };
}

export async function deleteLink(linkId) {
  const supabase = await createClient();
  const { user, error: authError } = await requireOwner(supabase);
  if (!user) return { error: authError };

  const { data: profile, error: loadError } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("user_id", user.id)
    .maybeSingle();

  if (loadError || !profile) return { error: "Profile not found." };

  const { error } = await supabase
    .from("links")
    .delete()
    .eq("id", linkId)
    .eq("profile_id", profile.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath(`/${profile.username}`);
  return { success: true };
}

export async function reorderLinks(orderedIds) {
  const supabase = await createClient();
  const { user, error: authError } = await requireOwner(supabase);
  if (!user) return { error: authError };

  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return { error: "Nothing to reorder." };
  }

  const { data: profile, error: loadError } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("user_id", user.id)
    .maybeSingle();

  if (loadError || !profile) return { error: "Profile not found." };

  const { data: existing, error: linksError } = await supabase
    .from("links")
    .select("id")
    .eq("profile_id", profile.id);

  if (linksError) return { error: linksError.message };

  const allowed = new Set((existing ?? []).map((r) => r.id));
  if (orderedIds.length !== allowed.size) {
    return { error: "Invalid reorder payload." };
  }
  if (new Set(orderedIds).size !== orderedIds.length) {
    return { error: "Duplicate ids in reorder payload." };
  }
  for (const id of orderedIds) {
    if (!allowed.has(id)) return { error: "Invalid link order payload." };
  }

  const updates = orderedIds.map((id, position) =>
    supabase
      .from("links")
      .update({ position })
      .eq("id", id)
      .eq("profile_id", profile.id),
  );

  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed?.error) return { error: failed.error.message };

  revalidatePath("/dashboard");
  revalidatePath(`/${profile.username}`);
  return { success: true };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}