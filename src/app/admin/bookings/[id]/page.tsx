import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import GuestIDUploader from "@/components/admin/GuestIDUploader";
import FacebookPostButton from "@/components/admin/FacebookPostButton";
import type { Booking } from "@/types";

interface BookingDetail extends Booking {
  units: {
    id: string;
    name: string;
    residence_id: string;
    residences: { name: string; facebook_page_id: string | null };
  } | null;
  guest_ids: {
    id: string;
    image_url: string;
    id_type: string | null;
    guest_name: string | null;
  }[];
  booking_logs: unknown[];
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  completed: "bg-indigo-100 text-indigo-800",
  cancelled: "bg-red-100 text-red-800",
};

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("bookings")
    .select("*, units(id, name, residence_id, residences(name, facebook_page_id)), guest_ids(*), booking_logs(*)")
    .eq("id", id)
    .single();

  const booking = data as BookingDetail | null;
  if (!booking) notFound();

  const unit = booking.units;
  const hasFacebook = !!(unit?.residences?.facebook_page_id);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/bookings">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Link>
        </Button>
        <h2 className="text-xl font-semibold flex-1">Booking Details</h2>
        <Button asChild size="sm">
          <Link href={`/admin/bookings/${id}/edit`}>
            <Pencil className="h-4 w-4 mr-1" /> Edit
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle>{booking.guest_name}</CardTitle>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                statusColors[booking.status] ?? "bg-muted text-muted-foreground"
              }`}
            >
              {booking.status}
            </span>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Unit</p>
            <p className="font-medium">{unit?.name ?? "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Residence</p>
            <p className="font-medium">{unit?.residences?.name ?? "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Check-in</p>
            <p className="font-medium">{format(new Date(booking.check_in), "MMM d, yyyy")}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Check-out</p>
            <p className="font-medium">{format(new Date(booking.check_out), "MMM d, yyyy")}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Pax</p>
            <p className="font-medium">{booking.pax ?? "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Contact</p>
            <p className="font-medium">{booking.guest_contact ?? "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Total Amount</p>
            <p className="font-medium">
              {booking.total_amount != null
                ? `₱${Number(booking.total_amount).toLocaleString()}`
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Amount Paid</p>
            <p className="font-medium">
              {booking.amount_paid != null
                ? `₱${Number(booking.amount_paid).toLocaleString()}`
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Source</p>
            <Badge variant={booking.source === "ocr" ? "secondary" : "outline"}>
              {booking.source}
            </Badge>
          </div>
          {booking.notes && (
            <div className="col-span-2">
              <p className="text-muted-foreground">Notes</p>
              <p className="font-medium">{booking.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <GuestIDUploader bookingId={id} existingIds={booking.guest_ids} />

      {hasFacebook && (
        <FacebookPostButton
          bookingId={id}
          guestName={booking.guest_name}
          checkIn={booking.check_in}
          checkOut={booking.check_out}
          unitName={unit?.name ?? ""}
        />
      )}
    </div>
  );
}
