import { createClient } from "@/lib/supabase/server";
import BookingCalendar from "@/components/admin/BookingCalendar";
import type { BookingWithUnit } from "@/types";
import type { Metadata } from "next";
import PageHero from "@/components/admin/PageHero";

export const metadata: Metadata = { title: "Calendar" };

export default async function CalendarPage() {
  const supabase = await createClient();
  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, guest_name, check_in, check_out, status, unit_id, units(id, name, residence_id)")
    .neq("status", "cancelled");

  return (
    <div className="flex flex-col gap-3">
      <PageHero
        heading="Booking Calendar"
        leadingText="A comprehensive view of all reservations across your residences."
      />
      <h2 className="text-xl font-semibold mb-4">Schedules</h2>
      <BookingCalendar bookings={(bookings ?? []) as BookingWithUnit[]} />
    </div>
  );
}
