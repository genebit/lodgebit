import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import type { Booking } from "@/types";

interface BookingRow extends Booking {
  units: { name: string } | null;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  completed: "bg-indigo-100 text-indigo-800",
  cancelled: "bg-red-100 text-red-800",
};

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
          <TableBody>
            {bookings.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No bookings yet.
                </TableCell>
              </TableRow>
            )}
            {bookings.map((booking) => (
              <TableRow key={booking.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell>
                  <Link href={`/admin/bookings/${booking.id}`} className="hover:underline font-medium">
                    {booking.guest_name}
                  </Link>
                  {booking.guest_contact && (
                    <p className="text-xs text-muted-foreground">{booking.guest_contact}</p>
                  )}
                </TableCell>
                <TableCell>{booking.units?.name ?? "—"}</TableCell>
                <TableCell>{format(new Date(booking.check_in), "MMM d, yyyy")}</TableCell>
                <TableCell>{format(new Date(booking.check_out), "MMM d, yyyy")}</TableCell>
                <TableCell>{booking.pax ?? "—"}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      statusColors[booking.status] ?? "bg-muted text-muted-foreground"
                    }`}
                  >
                    {booking.status}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={booking.source === "ocr" ? "secondary" : "outline"}>
                    {booking.source}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
