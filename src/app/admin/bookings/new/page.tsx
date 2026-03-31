import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import BookingForm from "@/components/admin/BookingForm";

export const metadata: Metadata = { title: "New Booking" };

export default async function NewBookingPage() {
  const supabase = await createClient();
  const { data: units } = await supabase
    .from("units")
    .select("id, name, residence_id")
    .eq("is_available", true)
    .order("name");

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">New Booking</h2>
      <BookingForm units={units ?? []} />
    </div>
  );
}
