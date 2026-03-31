import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Unit } from "@/types";
import UnitsPageClient from "@/components/admin/UnitsPageClient";
import PageHero from "@/components/admin/PageHero";

export const metadata: Metadata = { title: "Units" };

interface UnitRow extends Unit {
  residences: { name: string } | null;
}

export default async function UnitsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("units").select("*, residences(name)").order("name");

  const units = (data ?? []) as UnitRow[];

  return (
    <div className="flex flex-col gap-3">
      <PageHero heading="Residential Units" leadingText="Track, manage, and update all owned units and room details." />
      <UnitsPageClient units={units} />
    </div>
  );
}
