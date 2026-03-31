import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Booking } from "@/types";
import BookingsPageClient from "@/components/admin/BookingsPageClient";
import PageHero from "@/components/admin/PageHero";

export const metadata: Metadata = { title: "Bookings" };

interface BookingRow extends Booking {
  units: { name: string } | null;
}

export default async function BookingsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select("*, units(name)")
    .is("deleted_at", null)
    .order("check_in", { ascending: false })
    .limit(100);

  const bookings = (data ?? []) as BookingRow[];

  return (
    <div className="flex flex-col gap-3">
      <PageHero heading="Bookings" leadingText="Track, manage, and update all guest reservations and stay details." />
      <BookingsPageClient bookings={bookings} />
    </div>
  );
}
