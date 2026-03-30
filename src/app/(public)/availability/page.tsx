import { createClient } from "@/lib/supabase/server";
import AvailabilityCalendar from "@/components/public/AvailabilityCalendar";

interface BookingWithUnit {
  check_in: string;
  check_out: string;
  unit_id: string;
  units: { name: string } | null;
}

interface UnitRow {
  id: string;
  name: string;
  unit_type: string;
  capacity: number | null;
  price_per_night: number | null;
  is_available: boolean;
}

export default async function AvailabilityPage() {
  const supabase = await createClient();

  const today = new Date().toISOString().split("T")[0];

  const [bookingsRes, unitsRes] = await Promise.all([
    supabase
      .from("bookings")
      .select("check_in, check_out, unit_id, units(name)")
      .in("status", ["confirmed", "pending"])
      .gte("check_out", today),
    supabase
      .from("units")
      .select("id, name, unit_type, capacity, price_per_night, is_available")
      .order("name"),
  ]);

  const bookings = (bookingsRes.data ?? []) as BookingWithUnit[];
  const units = (unitsRes.data ?? []) as UnitRow[];

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-4">Availability</h1>
      <p className="text-muted-foreground mb-8">
        Check when units are available. Dark = booked period.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-12">
        {units.map((unit) => (
          <div key={unit.id} className="p-4 rounded-xl border bg-card space-y-1">
            <h3 className="font-medium">{unit.name}</h3>
            <p className="text-sm text-muted-foreground capitalize">{unit.unit_type}</p>
            {unit.capacity && (
              <p className="text-sm text-muted-foreground">Up to {unit.capacity} guests</p>
            )}
            {unit.price_per_night && (
              <p className="text-sm font-medium">
                ₱{Number(unit.price_per_night).toLocaleString()} / night
              </p>
            )}
            <span
              className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${
                unit.is_available
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {unit.is_available ? "Available" : "Not Available"}
            </span>
          </div>
        ))}
      </div>

      <AvailabilityCalendar
        bookings={bookings.map((b) => ({
          check_in: b.check_in,
          check_out: b.check_out,
          unit_name: b.units?.name ?? "Unit",
        }))}
      />
    </div>
  );
}
