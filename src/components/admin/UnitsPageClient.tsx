"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, CheckSquare } from "lucide-react";
import { toast } from "sonner";
import UnitTableRows from "@/components/admin/UnitTableRows";
import type { Unit } from "@/types";

interface UnitRow extends Unit {
  residences: { name: string } | null;
}

interface Props {
  units: UnitRow[];
}

export default function UnitsPageClient({ units }: Props) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const allIds = units.map((u) => u.id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds.has(id));

  const handleToggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleToggleAll = useCallback(() => {
    setSelectedIds(allSelected ? new Set() : new Set(allIds));
  }, [allSelected, allIds]);

  function handleBulkAvailability(is_available: boolean) {
    startTransition(async () => {
      const res = await fetch("/api/units/bulk-availability", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [...selectedIds], is_available }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Update failed");
        return;
      }

      toast.success(`${selectedIds.size} unit(s) marked as ${is_available ? "available" : "unavailable"}`);
      setSelectedIds(new Set());
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Units</h2>
        <Button asChild size="sm">
          <Link href="/admin/units/new">
            <Plus className="h-4 w-4 mr-1" /> New Unit
          </Link>
        </Button>
      </div>

      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 bg-muted rounded-lg px-4 py-2.5">
          <CheckSquare className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <div className="flex items-center gap-2 ml-auto">
            <Button size="sm" variant="outline" onClick={() => handleBulkAvailability(true)} disabled={isPending}>
              Mark Available
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkAvailability(false)} disabled={isPending}>
              Mark Unavailable
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
              Clear
            </Button>
          </div>
        </div>
      )}

      <div className="bg-card rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox checked={allSelected} onCheckedChange={handleToggleAll} aria-label="Select all" />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Residence</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Price/Night</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <UnitTableRows units={units} selectedIds={selectedIds} onToggle={handleToggle} />
        </Table>
      </div>
    </div>
  );
}
