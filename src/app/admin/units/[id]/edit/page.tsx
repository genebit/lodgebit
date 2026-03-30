import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import UnitForm from "@/components/admin/UnitForm";
import UnitImageManager from "@/components/admin/UnitImageManager";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import type { Unit, Residence, UnitImage } from "@/types";

export default async function EditUnitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [unitRes, residencesRes, imagesRes] = await Promise.all([
    supabase.from("units").select("*").eq("id", id).single(),
    supabase.from("residences").select("id, name").order("name"),
    supabase.from("unit_images").select("*").eq("unit_id", id)
      .order("sort_order", { ascending: true })
      .order("uploaded_at", { ascending: true }),
  ]);

  const unit = unitRes.data as Unit | null;
  const residences = (residencesRes.data ?? []) as Pick<Residence, "id" | "name">[];
  const images = (imagesRes.data ?? []) as UnitImage[];

  if (!unit) notFound();

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/units">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Link>
        </Button>
        <h2 className="text-xl font-semibold">Edit Unit — {unit.name}</h2>
      </div>

      <UnitForm
        residences={residences as Residence[]}
        unitId={id}
        defaultValues={{
          residence_id: unit.residence_id,
          name: unit.name,
          unit_type: unit.unit_type as "room" | "suite" | "cottage" | "villa" | "other",
          floor_location: unit.floor_location ?? undefined,
          capacity: unit.capacity ?? undefined,
          price_per_night: unit.price_per_night ?? undefined,
          description: unit.description ?? undefined,
          is_available: unit.is_available,
        }}
      />

      <Separator />

      <div className="space-y-3">
        <div>
          <h3 className="font-semibold">Unit Photos</h3>
          <p className="text-sm text-muted-foreground">
            Upload photos of this unit. These appear on the guest-facing page.
            Hover an image to set it as cover or delete it.
          </p>
        </div>
        <UnitImageManager unitId={id} initialImages={images} />
      </div>
    </div>
  );
}
