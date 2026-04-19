"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ProfilePublicView } from "@/components/profile-public-view";
import { AvatarUpload } from "@/components/dashboard/avatar-upload";
import { LinksEditor } from "@/components/dashboard/links-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { parseTheme } from "@/lib/theme";
import {
  createProfile,
  updateProfileFields,
  updateThemeFields,
  signOutAction,
} from "@/app/dashboard/actions";
import { Loader2 } from "lucide-react";

export default function DashboardClient({
  userId,
  initialProfile,
  initialLinks,
}) {
  const router = useRouter();
  const hasProfile = Boolean(initialProfile);

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [creating, setCreating] = useState(false);

  const [draftUsername, setDraftUsername] = useState(
    initialProfile?.username ?? "",
  );
  const [draftName, setDraftName] = useState(initialProfile?.display_name ?? "");
  const [draftBio, setDraftBio] = useState(initialProfile?.bio ?? "");
  const [insta, setInsta] = useState(initialProfile?.instagram_url ?? "");
  const [yt, setYt] = useState(initialProfile?.youtube_url ?? "");
  const [tiktok, setTiktok] = useState(initialProfile?.tiktok_url ?? "");
  const [site, setSite] = useState(initialProfile?.website_url ?? "");
  const [email, setEmail] = useState(initialProfile?.contact_email ?? "");

  const themeStart = parseTheme(initialProfile?.theme);
  const [bgType, setBgType] = useState(themeStart.backgroundType);
  const [bgValue, setBgValue] = useState(themeStart.background);
  const [accent, setAccent] = useState(themeStart.accent);
  const [btnStyle, setBtnStyle] = useState(themeStart.buttonStyle);

  const [profileSaving, setProfileSaving] = useState(false);
  const [themeSaving, setThemeSaving] = useState(false);

  /* Sync local editor state when server props refresh (e.g. after save or avatar upload). */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!initialProfile) return;
    setDraftUsername(initialProfile.username ?? "");
    setDraftName(initialProfile.display_name ?? "");
    setDraftBio(initialProfile.bio ?? "");
    setInsta(initialProfile.instagram_url ?? "");
    setYt(initialProfile.youtube_url ?? "");
    setTiktok(initialProfile.tiktok_url ?? "");
    setSite(initialProfile.website_url ?? "");
    setEmail(initialProfile.contact_email ?? "");
    const t = parseTheme(initialProfile.theme);
    setBgType(t.backgroundType);
    setBgValue(t.background);
    setAccent(t.accent);
    setBtnStyle(t.buttonStyle);
  }, [initialProfile]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const previewProfile = useMemo(() => {
    if (!initialProfile) return null;
    return {
      ...initialProfile,
      username: draftUsername || initialProfile.username,
      display_name: draftName,
      bio: draftBio,
      instagram_url: insta,
      youtube_url: yt,
      tiktok_url: tiktok,
      website_url: site,
      contact_email: email,
      theme: {
        ...parseTheme(initialProfile.theme),
        backgroundType: bgType,
        background: bgValue,
        accent,
        buttonStyle: btnStyle,
      },
    };
  }, [
    initialProfile,
    draftUsername,
    draftName,
    draftBio,
    insta,
    yt,
    tiktok,
    site,
    email,
    bgType,
    bgValue,
    accent,
    btnStyle,
  ]);

  async function handleCreateProfile(e) {
    e.preventDefault();
    setCreating(true);
    const res = await createProfile({
      username,
      displayName,
    });
    setCreating(false);
    if (res?.error) {
      alert(res.error);
      return;
    }
    router.refresh();
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    setProfileSaving(true);
    const res = await updateProfileFields({
      username: draftUsername,
      displayName: draftName,
      bio: draftBio,
      instagramUrl: insta,
      youtubeUrl: yt,
      tiktokUrl: tiktok,
      websiteUrl: site,
      contactEmail: email,
    });
    setProfileSaving(false);
    if (res?.error) {
      alert(res.error);
      return;
    }
    router.refresh();
  }

  async function handleSaveTheme(e) {
    e.preventDefault();
    setThemeSaving(true);
    const res = await updateThemeFields({
      backgroundType: bgType,
      background: bgValue,
      accent,
      buttonStyle: btnStyle,
    });
    setThemeSaving(false);
    if (res?.error) {
      alert(res.error);
      return;
    }
    router.refresh();
  }

  if (!hasProfile) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-2xl">
              Let’s set up your page
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Choose a unique username (this becomes your public URL).
            </p>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleCreateProfile}>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  placeholder="your_name"
                  autoComplete="off"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Lowercase letters, numbers, underscores · 3–30 characters
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="display">Display name</Label>
                <Input
                  id="display"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How your name appears"
                />
              </div>
              <Button type="submit" disabled={creating}>
                {creating ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : null}
                Create profile
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const publicUrl = `/${initialProfile.username}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-10 flex flex-col gap-4 border-b border-border pb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Dashboard
          </p>
          <h1 className="font-display text-3xl font-semibold text-[#2d2424]">
            Edit your page
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Changes save to Supabase. Only you can edit this page.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" asChild>
            <Link href={publicUrl} target="_blank" rel="noopener noreferrer">
              View live page
            </Link>
          </Button>
          <form action={signOutAction}>
            <Button type="submit" variant="outline">
              Sign out
            </Button>
          </form>
        </div>
      </header>

      <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
        <div className="space-y-10">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-xl">Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="space-y-2">
                  <Label>Avatar</Label>
                  <AvatarUpload
                    userId={userId}
                    onUploaded={() => router.refresh()}
                  />
                </div>
              </div>
              <form className="space-y-4" onSubmit={handleSaveProfile}>
                <div className="space-y-2">
                  <Label htmlFor="draft-username">Public URL username</Label>
                  <Input
                    id="draft-username"
                    className="max-w-md font-mono text-sm"
                    value={draftUsername}
                    onChange={(e) =>
                      setDraftUsername(e.target.value.toLowerCase())
                    }
                    placeholder="your_username"
                    autoComplete="off"
                    spellCheck={false}
                    aria-describedby="username-help"
                  />
                  
                </div>
                <div className="space-y-2">
                  <Label htmlFor="draft-name">Display name</Label>
                  <Input
                    id="draft-name"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="draft-bio">Bio</Label>
                  <Textarea
                    id="draft-bio"
                    value={draftBio}
                    onChange={(e) => setDraftBio(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="insta">Instagram URL</Label>
                    <Input
                      id="insta"
                      type="url"
                      placeholder="https://instagram.com/..."
                      value={insta}
                      onChange={(e) => setInsta(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yt">YouTube URL</Label>
                    <Input
                      id="yt"
                      type="url"
                      placeholder="https://youtube.com/..."
                      value={yt}
                      onChange={(e) => setYt(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tiktok">TikTok URL</Label>
                    <Input
                      id="tiktok"
                      type="url"
                      placeholder="https://tiktok.com/..."
                      value={tiktok}
                      onChange={(e) => setTiktok(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="site">Website URL</Label>
                    <Input
                      id="site"
                      type="url"
                      placeholder="https://"
                      value={site}
                      onChange={(e) => setSite(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="contact">Contact email</Label>
                    <Input
                      id="contact"
                      type="email"
                      placeholder="hello@you.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <Button type="submit" disabled={profileSaving}>
                  {profileSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : null}
                  Save profile
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display text-xl">Theme</CardTitle>
              <p className="text-sm text-muted-foreground">
                Background can be a CSS gradient string or a solid color (
                <code className="rounded bg-muted px-1 py-0.5 text-xs">#fef3c7</code>
                ).
              </p>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSaveTheme}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="bg-type">Background type</Label>
                    <select
                      id="bg-type"
                      className="flex h-11 w-full rounded-xl border border-border bg-white px-3 text-sm shadow-inner shadow-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--profile-accent,#be185d)]"
                      value={bgType}
                      onChange={(e) => setBgType(e.target.value)}
                    >
                      <option value="gradient">Gradient / custom CSS</option>
                      <option value="solid">Solid color</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accent">Accent color</Label>
                    <Input
                      id="accent"
                      type="text"
                      value={accent}
                      onChange={(e) => setAccent(e.target.value)}
                      placeholder="#be185d"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bg-val">
                    {bgType === "solid" ? "Background color" : "Background CSS"}
                  </Label>
                  <Textarea
                    id="bg-val"
                    value={bgValue}
                    onChange={(e) => setBgValue(e.target.value)}
                    rows={bgType === "solid" ? 2 : 4}
                    placeholder={
                      bgType === "solid"
                        ? "#fdf2f8"
                        : "linear-gradient(165deg, #fdf2f8, #fff7ed)"
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="btn-style">Button style</Label>
                  <select
                    id="btn-style"
                    className="flex h-11 w-full rounded-xl border border-border bg-white px-3 text-sm shadow-inner shadow-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--profile-accent,#be185d)]"
                    value={btnStyle}
                    onChange={(e) => setBtnStyle(e.target.value)}
                  >
                    <option value="pill">Rounded pill</option>
                    <option value="soft">Soft card</option>
                    <option value="outline">Outline</option>
                  </select>
                </div>
                <Button type="submit" disabled={themeSaving}>
                  {themeSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : null}
                  Save theme
                </Button>
              </form>
            </CardContent>
          </Card>

          <section>
            <h2 className="mb-4 font-display text-xl font-semibold">Links</h2>
            <LinksEditor
              key={initialLinks.map((l) => l.id).join("|")}
              initialLinks={initialLinks}
            />
          </section>
        </div>

        <aside className="lg:sticky lg:top-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Live preview
          </p>
          <div className="max-h-[min(90vh,860px)] overflow-y-auto rounded-[1.25rem] border border-border bg-muted/30 shadow-inner shadow-black/5">
            {previewProfile ? (
              <ProfilePublicView
                profile={previewProfile}
                links={initialLinks.filter((l) => l.is_active)}
              />
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
