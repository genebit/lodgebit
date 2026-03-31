"use client";

import { useRouter } from "next/navigation";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Unit } from "@/types";

interface UnitRow extends Unit {
  residences: { name: string } | null;
}

export default function UnitTableRows({ units }: { units: UnitRow[] }) {
  const router = useRouter();

  if (units.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
            No units yet.
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {units.map((unit) => (
        <TableRow
          key={unit.id}
          className="cursor-pointer hover:bg-muted/50"
          onClick={() => router.push(`/admin/units/${unit.id}/edit`)}
        >
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
          <TableCell />
        </TableRow>
      ))}
    </TableBody>
  );
}
