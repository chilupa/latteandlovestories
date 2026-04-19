"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { updateAvatarUrl } from "@/app/dashboard/actions";
import { Loader2, Upload } from "lucide-react";

const BUCKET = process.env.NEXT_PUBLIC_AVATAR_BUCKET || "avatars";

export function AvatarUpload({ userId, onUploaded }) {
  const inputRef = useRef(null);
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  async function onFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext)
        ? ext
        : "jpg";
      const path = `${userId}/avatar-${Date.now()}.${safeExt}`;

      const { error: upError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
          upsert: true,
          contentType: file.type || "image/jpeg",
        });

      if (upError) {
        setError(upError.message);
        return;
      }

      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const res = await updateAvatarUrl(pub.publicUrl);
      if (res?.error) {
        setError(res.error);
        return;
      }
      onUploaded?.(pub.publicUrl);
    } catch (err) {
      setError(err?.message || "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={onFileChange}
      />
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Upload className="h-4 w-4" aria-hidden />
        )}
        {uploading ? "Uploading…" : "Upload photo"}
      </Button>
      {error ? (
        <p className="text-xs text-rose-700" role="alert">
          {error}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          JPEG, PNG, WebP, or GIF · stored in Supabase Storage
        </p>
      )}
    </div>
  );
}
