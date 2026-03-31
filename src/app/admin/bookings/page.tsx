import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import type { Booking } from "@/types";
import BookingTableRows from "@/components/admin/BookingTableRows";

export const metadata: Metadata = { title: "Bookings" };

interface BookingRow extends Booking {
  units: { name: string } | null;
}

export default async function BookingsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select("*, units(name)")
    .order("check_in", { ascending: false })
    .limit(100);

  const bookings = (data ?? []) as BookingRow[];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Bookings</h2>
        <Button asChild size="sm">
          <Link href="/admin/bookings/new">
            <Plus className="h-4 w-4 mr-1" /> New Booking
          </Link>
        </Button>
      </div>

      <div className="bg-card rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Guest</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead>Check-out</TableHead>
              <TableHead>Pax</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Source</TableHead>
            </TableRow>
          </TableHeader>
          <BookingTableRows bookings={bookings} />
        </Table>
      </div>
    </div>
  );
}
