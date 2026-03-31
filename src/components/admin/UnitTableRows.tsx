"use client";

import { useRouter } from "next/navigation";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { Unit } from "@/types";

interface UnitRow extends Unit {
  residences: { name: string } | null;
}

interface Props {
  units: UnitRow[];
  selectedIds?: Set<string>;
  onToggle?: (id: string) => void;
}

export default function UnitTableRows({ units, selectedIds, onToggle }: Props) {
  const router = useRouter();
  const selectable = !!onToggle;

  if (units.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={selectable ? 8 : 7} className="text-center text-muted-foreground py-8">
            No units yet.
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {units.map((unit) => {
        const isSelected = selectedIds?.has(unit.id) ?? false;
        return (
          <TableRow
            key={unit.id}
            className={`cursor-pointer hover:bg-muted/50 ${isSelected ? "bg-muted/30" : ""}`}
            onClick={() => router.push(`/admin/units/${unit.id}/edit`)}
          >
            {selectable && (
              <TableCell className="w-10" onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onToggle?.(unit.id)}
                  aria-label={`Select ${unit.name}`}
                />
              </TableCell>
            )}
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
        );
      })}
    </TableBody>
  );
}
