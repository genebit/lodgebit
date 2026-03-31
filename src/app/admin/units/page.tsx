import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Units" };
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil } from "lucide-react";
import type { Unit } from "@/types";

interface UnitRow extends Unit {
  residences: { name: string } | null;
}

export default async function UnitsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("units")
    .select("*, residences(name)")
    .order("name");

  const units = (data ?? []) as UnitRow[];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Units</h2>
        <Button asChild size="sm">
          <Link href="/admin/units/new">
            <Plus className="h-4 w-4 mr-1" /> New Unit
          </Link>
        </Button>
      </div>

      <div className="bg-card rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Residence</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Price/Night</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {units.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No units yet.
                </TableCell>
              </TableRow>
            )}
            {units.map((unit) => (
              <TableRow key={unit.id}>
                <TableCell className="font-medium">{unit.name}</TableCell>
                <TableCell>{unit.residences?.name ?? "—"}</TableCell>
                <TableCell className="capitalize">{unit.unit_type}</TableCell>
                <TableCell>{unit.capacity ?? "—"}</TableCell>
                <TableCell>
                  {unit.price_per_night != null
                    ? `₱${Number(unit.price_per_night).toLocaleString()}`
                    : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={unit.is_available ? "default" : "secondary"}>
                    {unit.is_available ? "Available" : "Unavailable"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button asChild size="icon" variant="ghost">
                    <Link href={`/admin/units/${unit.id}/edit`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
