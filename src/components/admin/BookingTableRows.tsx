"use client";

import { useRouter } from "next/navigation";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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

export default function BookingTableRows({ bookings }: { bookings: BookingRow[] }) {
  const router = useRouter();

  if (bookings.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
            No bookings yet.
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {bookings.map((booking) => (
        <TableRow
          key={booking.id}
          className="cursor-pointer hover:bg-muted/50"
          onClick={() => router.push(`/admin/bookings/${booking.id}`)}
        >
          <TableCell>
            <p className="font-medium">{booking.guest_name}</p>
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
  );
}
