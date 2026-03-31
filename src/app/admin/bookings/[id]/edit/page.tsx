import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import BookingForm from "@/components/admin/BookingForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Edit Booking" };
import { ArrowLeft } from "lucide-react";
import type { Booking, Unit } from "@/types";

export default async function EditBookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [bookingRes, unitsRes] = await Promise.all([
    supabase.from("bookings").select("*").eq("id", id).single(),
    supabase.from("units").select("id, name, residence_id").order("name"),
  ]);

  const booking = bookingRes.data as Booking | null;
  const units = (unitsRes.data ?? []) as Pick<Unit, "id" | "name" | "residence_id">[];

  if (!booking) notFound();

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/admin/bookings/${id}`}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Link>
        </Button>
        <h2 className="text-xl font-semibold">Edit Booking</h2>
      </div>
      <BookingForm
        units={units as Unit[]}
        bookingId={id}
        defaultValues={{
          unit_id: booking.unit_id,
          guest_name: booking.guest_name,
          guest_contact: booking.guest_contact ?? undefined,
          pax: booking.pax ?? 1,
          check_in: booking.check_in,
          check_out: booking.check_out,
          total_amount: booking.total_amount ?? 0,
          amount_paid: booking.amount_paid ?? 0,
          status: booking.status as "pending" | "confirmed" | "completed" | "cancelled",
          notes: booking.notes ?? undefined,
        }}
      />
    </div>
  );
}
