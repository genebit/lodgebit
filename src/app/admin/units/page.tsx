import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Units" };
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import type { Unit } from "@/types";
import UnitTableRows from "@/components/admin/UnitTableRows";

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
          <UnitTableRows units={units} />
        </Table>
      </div>
    </div>
  );
}
