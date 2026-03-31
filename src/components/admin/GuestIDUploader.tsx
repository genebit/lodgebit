"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, IdCard } from "lucide-react";

interface GuestIDUploaderProps {
  bookingId: string;
  existingIds: {
    id: string;
    image_url: string;
    id_type: string | null;
    guest_name: string | null;
    publicUrl?: string;
  }[];
}

const idTypes = [
  { value: "passport", label: "Passport" },
  { value: "drivers_license", label: "Driver's License" },
  { value: "national_id", label: "National ID" },
  { value: "other", label: "Other" },
];

export default function GuestIDUploader({ bookingId, existingIds }: GuestIDUploaderProps) {
  const [idType, setIdType] = useState("national_id");
  const [guestName, setGuestName] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${bookingId}/${Date.now()}.${ext}`;

      // Get signed upload URL
      const signRes = await fetch("/api/upload/signed-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bucket: "guest-ids", path }),
      });

      if (!signRes.ok) throw new Error("Failed to get upload URL");
      const { signedUrl } = await signRes.json();

      // Upload to Supabase Storage
      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadRes.ok) throw new Error("Upload failed");

      // Save guest_id record
      const saveRes = await fetch(`/api/bookings/${bookingId}/guest-ids`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: path, id_type: idType, guest_name: guestName }),
      });

      if (!saveRes.ok) throw new Error("Failed to save ID record");

      toast.success("ID uploaded successfully");
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <IdCard className="h-4 w-4" /> Guest IDs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {existingIds.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {existingIds.map((gid) => (
              <div key={gid.id} className="space-y-1">
                {gid.publicUrl ? (
                  <a href={gid.publicUrl} target="_blank" rel="noreferrer" className="block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={gid.publicUrl}
                      alt={gid.id_type ?? "ID"}
                      className="w-full h-24 object-cover rounded-md border"
                    />
                  </a>
                ) : (
                  <div className="w-full h-24 rounded-md border flex items-center justify-center bg-muted">
                    <IdCard className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <p className="text-xs text-muted-foreground truncate">
                  {gid.id_type ?? "ID"}
                  {gid.guest_name ? ` — ${gid.guest_name}` : ""}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label>ID Type</Label>
            <Select value={idType} onValueChange={setIdType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {idTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="guest_name_id">Name on ID</Label>
            <input
              id="guest_name_id"
              type="text"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="As it appears on ID"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="id_file">ID Image</Label>
            <input
              id="id_file"
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm file:border-0 file:bg-transparent file:text-sm"
            />
          </div>
        </div>

        <Button onClick={handleUpload} disabled={uploading} size="sm">
          <Upload className="h-4 w-4 mr-1" />
          {uploading ? "Uploading…" : "Upload ID"}
        </Button>
      </CardContent>
    </Card>
  );
}
