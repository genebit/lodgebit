"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ResidenceAmenity } from "@/types";

interface AmenitiesManagerProps {
  residenceId: string;
  initialAmenities: ResidenceAmenity[];
}

export default function AmenitiesManager({ residenceId, initialAmenities }: AmenitiesManagerProps) {
  const [amenities, setAmenities] = useState<ResidenceAmenity[]>(initialAmenities);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleAdd() {
    const name = inputRef.current?.value.trim();
    if (!name) return;

    setLoading(true);
    const res = await fetch(`/api/residences/${residenceId}/amenities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setLoading(false);

    if (!res.ok) { toast.error("Failed to add amenity"); return; }
    const added: ResidenceAmenity = await res.json();
    setAmenities((prev) => [...prev, added]);
    if (inputRef.current) inputRef.current.value = "";
    toast.success("Amenity added");
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/residences/${residenceId}/amenities`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amenityId: id }),
    });
    if (!res.ok) { toast.error("Failed to delete amenity"); return; }
    setAmenities((prev) => prev.filter((a) => a.id !== id));
    toast.success("Amenity removed");
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          placeholder="e.g. WiFi, Air Conditioning, Pool…"
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
        />
        <Button type="button" onClick={handleAdd} disabled={loading}>
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>

      {amenities.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {amenities.map((a) => (
            <span
              key={a.id}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-sm font-medium"
            >
              {a.name}
              <button
                type="button"
                onClick={() => handleDelete(a.id)}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No amenities added yet.</p>
      )}
    </div>
  );
}
