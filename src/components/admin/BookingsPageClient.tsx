"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, CheckSquare, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import BookingTableRows from "@/components/admin/BookingTableRows";
import type { Booking } from "@/types";

interface BookingRow extends Booking {
  units: { name: string } | null;
}

interface Props {
  bookings: BookingRow[];
}

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function BookingsPageClient({ bookings }: Props) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<string>("confirmed");
  const [isPending, startTransition] = useTransition();

  const allIds = bookings.map((b) => b.id);
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
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allIds));
    }
  }, [allSelected, allIds]);

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return;
    startTransition(async () => {
      const res = await fetch("/api/bookings/bulk-delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [...selectedIds] }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Delete failed");
        return;
      }

      toast.success(`${selectedIds.size} booking(s) deleted`);
      setSelectedIds(new Set());
      router.refresh();
    });
  }

  async function handleBulkUpdate() {
    if (selectedIds.size === 0) return;
    startTransition(async () => {
      const res = await fetch("/api/bookings/bulk-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [...selectedIds], status: bulkStatus }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Bulk update failed");
        return;
      }

      toast.success(`${selectedIds.size} booking(s) updated to "${bulkStatus}"`);
      setSelectedIds(new Set());
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Bookings</h2>
        <Button asChild size="sm">
          <Link href="/admin/bookings/new">
            <Plus className="h-4 w-4 mr-1" /> New Booking
          </Link>
        </Button>
      </div>

      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 bg-muted rounded-lg px-4 py-2.5">
          <CheckSquare className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <div className="flex items-center gap-2 ml-auto">
            <Select value={bulkStatus} onValueChange={setBulkStatus}>
              <SelectTrigger className="w-36 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={handleBulkUpdate} disabled={isPending}>
              {isPending ? "Updating…" : "Apply"}
            </Button>
            <Button size="sm" variant="destructive" onClick={handleBulkDelete} disabled={isPending}>
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
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
              <TableHead>Guest</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead>Check-out</TableHead>
              <TableHead>Pax</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Source</TableHead>
            </TableRow>
          </TableHeader>
          <BookingTableRows bookings={bookings} selectedIds={selectedIds} onToggle={handleToggle} />
        </Table>
      </div>
    </div>
  );
}
