"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Upload, Trash2, Star, StarOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UnitImage } from "@/types";

interface UnitImageManagerProps {
  unitId: string;
  initialImages: UnitImage[];
}

export default function UnitImageManager({ unitId, initialImages }: UnitImageManagerProps) {
  const [images, setImages] = useState<UnitImage[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const allowed = ["image/png", "image/jpeg"];
    const invalid = files.filter((f) => !allowed.includes(f.type));
    if (invalid.length) {
      toast.error("Only PNG and JPG files are allowed.");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    setUploading(true);
    try {
      for (const file of files) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${unitId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        // 1. Get signed upload URL
        const signRes = await fetch("/api/upload/signed-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bucket: "unit-images", path }),
        });
        if (!signRes.ok) throw new Error("Failed to get upload URL");
        const { signedUrl } = await signRes.json();

        // 2. Upload directly to Supabase Storage
        const uploadRes = await fetch(signedUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });
        if (!uploadRes.ok) throw new Error("Upload failed");

        // 3. Save image record in DB
        const saveRes = await fetch("/api/unit-images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            unit_id: unitId,
            path,
            is_cover: images.length === 0, // first image is cover
          }),
        });
        if (!saveRes.ok) throw new Error("Failed to save image record");
        const saved: UnitImage = await saveRes.json();
        setImages((prev) => [...prev, saved]);
      }
      toast.success("Image(s) uploaded successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/unit-images/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete image");
      return;
    }
    setImages((prev) => prev.filter((img) => img.id !== id));
    toast.success("Image deleted");
  }

  async function handleSetCover(id: string) {
    const res = await fetch(`/api/unit-images/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_cover: true }),
    });
    if (!res.ok) {
      toast.error("Failed to set cover");
      return;
    }
    setImages((prev) => prev.map((img) => ({ ...img, is_cover: img.id === id })));
    toast.success("Cover image updated");
  }

  return (
    <div className="space-y-4">
      <div>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg"
          multiple
          className="hidden"
          onChange={handleUpload}
        />
        <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading…
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" /> Upload Images
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground mt-1">
          PNG and JPG only. You can select multiple images. The first image is set as cover automatically.
        </p>
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((img) => (
            <div
              key={img.id}
              className={`relative group rounded-lg overflow-hidden border-2 aspect-square ${
                img.is_cover ? "border-primary" : "border-transparent"
              }`}
            >
              <Image src={img.image_url} alt={img.caption ?? "Unit image"} fill className="object-cover" />
              {img.is_cover && (
                <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">
                  Cover
                </span>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!img.is_cover && (
                  <button
                    type="button"
                    onClick={() => handleSetCover(img.id)}
                    title="Set as cover"
                    className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                  >
                    <Star className="h-4 w-4" />
                  </button>
                )}
                {img.is_cover && (
                  <span className="p-1.5 rounded-full bg-white/20 text-white">
                    <StarOff className="h-4 w-4" />
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(img.id)}
                  title="Delete"
                  className="p-1.5 rounded-full bg-red-500/80 hover:bg-red-600 text-white transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground text-sm">
          No images yet. Upload some to display on the guest page.
        </div>
      )}
    </div>
  );
}
