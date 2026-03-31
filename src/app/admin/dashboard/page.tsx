import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "@/components/admin/DashboardClient";
import PageHero from "@/components/admin/PageHero";
import { auth } from "@/lib/auth";

export const metadata: Metadata = { title: "Dashboard" };

export interface DashboardBooking {
  id: string;
  guest_name: string;
  guest_contact: string | null;
  check_in: string;
  check_out: string;
  status: string;
  total_amount: number | null;
  pax: number | null;
  source: string;
  unit_name: string | null;
  residence_name: string | null;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const session = await auth();

  const user = {
    name: session.user?.name ?? null,
    email: session.user?.email ?? null,
  };

  const [bookingsRes, residencesRes, unitsRes] = await Promise.all([
    supabase
      .from("bookings")
      .select(
        "id, guest_name, guest_contact, check_in, check_out, status, total_amount, pax, source, units(name, residences(name))",
      )
      .order("check_in", { ascending: false }),
    supabase.from("residences").select("id", { count: "exact", head: true }),
    supabase.from("units").select("id", { count: "exact", head: true }),
  ]);

  const rawBookings = bookingsRes.data ?? [];
  const bookings: DashboardBooking[] = rawBookings.map((b: any) => ({
    id: b.id,
    guest_name: b.guest_name,
    guest_contact: b.guest_contact,
    check_in: b.check_in,
    check_out: b.check_out,
    status: b.status,
    total_amount: b.total_amount,
    pax: b.pax,
    source: b.source,
    unit_name: b.units?.name ?? null,
    residence_name: b.units?.residences?.name ?? null,
  }));

  return (
    <>
      <div className="flex flex-col gap-3">
        <PageHero
          heading={`Welcome back, ${session?.user?.name}!`}
          leadingText="Here’s how your properties are performing so far this month."
        />
        <DashboardClient
          bookings={bookings}
          residenceCount={residencesRes.count ?? 0}
          unitCount={unitsRes.count ?? 0}
        />
      </div>
    </>
  );
}
