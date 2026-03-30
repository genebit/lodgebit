"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ResidenceInclusion } from "@/types";

interface InclusionsManagerProps {
  residenceId: string;
  initialInclusions: ResidenceInclusion[];
}

export default function InclusionsManager({ residenceId, initialInclusions }: InclusionsManagerProps) {
  const [inclusions, setInclusions] = useState<ResidenceInclusion[]>(initialInclusions);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleAdd() {
    const description = inputRef.current?.value.trim();
    if (!description) return;

    setLoading(true);
    const res = await fetch(`/api/residences/${residenceId}/inclusions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    });
    setLoading(false);

    if (!res.ok) { toast.error("Failed to add inclusion"); return; }
    const added: ResidenceInclusion = await res.json();
    setInclusions((prev) => [...prev, added]);
    if (inputRef.current) inputRef.current.value = "";
    toast.success("Inclusion added");
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/residences/${residenceId}/inclusions`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inclusionId: id }),
    });
    if (!res.ok) { toast.error("Failed to delete inclusion"); return; }
    setInclusions((prev) => prev.filter((i) => i.id !== id));
    toast.success("Inclusion removed");
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          placeholder="e.g. Free parking, Bedsheets provided…"
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
        />
        <Button type="button" onClick={handleAdd} disabled={loading}>
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>

      {inclusions.length > 0 ? (
        <ul className="space-y-2">
          {inclusions.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-2 p-3 rounded-lg border bg-muted/30 text-sm"
            >
              <span>{item.description}</span>
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0 mt-0.5"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No inclusions added yet.</p>
      )}
    </div>
  );
}
