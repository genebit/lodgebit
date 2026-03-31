import type { Metadata } from "next";
import type { Residence, ResidenceAmenity, ResidenceInclusion } from "@/types";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import ResidenceForm from "@/components/admin/ResidenceForm";
import ResidenceCoverUpload from "@/components/admin/ResidenceCoverUpload";
import AmenitiesManager from "@/components/admin/AmenitiesManager";
import InclusionsManager from "@/components/admin/InclusionsManager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit Residence" };

export default async function EditResidencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [residenceRes, amenitiesRes, inclusionsRes] = await Promise.all([
    supabase.from("residences").select("*").eq("id", id).single(),
    supabase.from("residence_amenities").select("*").eq("residence_id", id).order("name"),
    supabase.from("residence_inclusions").select("*").eq("residence_id", id),
  ]);

  const residence = residenceRes.data as Residence | null;
  const amenities = (amenitiesRes.data ?? []) as ResidenceAmenity[];
  const inclusions = (inclusionsRes.data ?? []) as ResidenceInclusion[];

  if (!residence) notFound();

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/residences">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Link>
        </Button>
        <h2 className="text-xl font-semibold">Edit Residence — {residence.name}</h2>
      </div>

      <ResidenceForm
        residenceId={id}
        defaultValues={{
          name: residence.name,
          slug: residence.slug ?? "",
          description: residence.description ?? undefined,
          address: residence.address ?? undefined,
          latitude: residence.latitude ?? undefined,
          longitude: residence.longitude ?? undefined,
          facebook_page_id: residence.facebook_page_id ?? undefined,
          meta_page_access_token: residence.meta_page_access_token ?? undefined,
        }}
      />

      <Separator />

      <div className="space-y-3">
        <div>
          <h3 className="font-semibold">Cover Image</h3>
          <p className="text-sm text-muted-foreground">
            This photo is shown as the hero background on the public page.
          </p>
        </div>
        <ResidenceCoverUpload
          residenceId={id}
          currentCoverUrl={residence.cover_image_url ?? null}
        />
      </div>

      <Separator />

      <div className="space-y-3">
        <div>
          <h3 className="font-semibold">Amenities</h3>
          <p className="text-sm text-muted-foreground">
            Facilities and features available at this residence.
          </p>
        </div>
        <AmenitiesManager residenceId={id} initialAmenities={amenities} />
      </div>

      <Separator />

      <div className="space-y-3">
        <div>
          <h3 className="font-semibold">Inclusions</h3>
          <p className="text-sm text-muted-foreground">
            What&apos;s included with every stay (e.g. free parking, bedsheets).
          </p>
        </div>
        <InclusionsManager residenceId={id} initialInclusions={inclusions} />
      </div>
    </div>
  );
}
