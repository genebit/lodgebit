"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Upload, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResidenceCoverUploadProps {
  residenceId: string;
  currentCoverUrl: string | null;
}

export default function ResidenceCoverUpload({
  residenceId,
  currentCoverUrl,
}: ResidenceCoverUploadProps) {
  const [coverUrl, setCoverUrl] = useState<string | null>(currentCoverUrl);
  const [imgError, setImgError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/png", "image/jpeg"];
    if (!allowed.includes(file.type)) {
      toast.error("Only PNG and JPG files are allowed.");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${residenceId}/cover-${Date.now()}.${ext}`;

      // 1. Get signed upload URL
      const signRes = await fetch("/api/upload/signed-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bucket: "residence-covers", path }),
      });
      if (!signRes.ok) throw new Error("Failed to get upload URL");
      const { signedUrl, publicUrl } = await signRes.json();

      // 2. Upload to Supabase Storage
      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!uploadRes.ok) throw new Error("Upload failed");

      // 3. Save URL to residence record
      const saveRes = await fetch(`/api/residences/${residenceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cover_image_url: publicUrl }),
      });
      if (!saveRes.ok) throw new Error("Failed to save cover image");

      setCoverUrl(publicUrl);
      setImgError(false);
      toast.success("Cover image updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-4">
      {/* Preview */}
      <div className="relative w-full aspect-video max-w-sm rounded-2xl overflow-hidden bg-muted border">
        {coverUrl && !imgError ? (
          <Image
            src={coverUrl}
            alt="Cover"
            fill
            className="object-cover"
            onError={() => setImgError(true)}
            unoptimized
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
            <ImageIcon className="h-8 w-8" />
            <p className="text-xs">{imgError ? "Failed to load image" : "No cover image yet"}</p>
          </div>
        )}
      </div>

      {/* Upload */}
      <div>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg"
          className="hidden"
          onChange={handleUpload}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading…</>
          ) : (
            <><Upload className="h-4 w-4 mr-2" /> {coverUrl ? "Replace Cover" : "Upload Cover"}</>
          )}
        </Button>
        <p className="text-xs text-muted-foreground mt-1">
          PNG and JPG only. This image appears as the hero background on the public page.
        </p>
      </div>
    </div>
  );
}
