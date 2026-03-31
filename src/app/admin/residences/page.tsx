import type { Metadata } from "next";
import type { Residence } from "@/types";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, MapPin, Share2, ExternalLink } from "lucide-react";

export const metadata: Metadata = { title: "Residences" };

interface ResidenceRow extends Residence {
  units: { id: string; is_available: boolean }[];
}

export default async function ResidencesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("residences")
    .select("*, units(id, is_available)")
    .order("name");

  const residences = (data ?? []) as ResidenceRow[];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Residences</h2>
        <Button asChild size="sm">
          <Link href="/admin/residences/new">
            <Plus className="h-4 w-4 mr-1" /> New Residence
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {residences.length === 0 && (
          <p className="text-muted-foreground col-span-full">No residences yet.</p>
        )}
        {residences.map((residence) => {
          const available = residence.units.filter((u) => u.is_available).length;

          return (
            <Card key={residence.id} className="relative">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{residence.name}</CardTitle>
                  <Button asChild size="icon" variant="ghost" className="-mt-1 -mr-1">
                    <Link href={`/admin/residences/${residence.id}/edit`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {residence.address && (
                  <div className="flex items-start gap-1.5 text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{residence.address}</span>
                  </div>
                )}
                {residence.facebook_page_id && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Share2 className="h-4 w-4" />
                    <span>Facebook connected</span>
                  </div>
                )}
                <p className="text-muted-foreground">
                  {available} / {residence.units.length} units available
                </p>
                {residence.slug ? (
                  <Link
                    href={`/r/${residence.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View public page
                  </Link>
                ) : (
                  <p className="text-xs text-amber-500">No slug — public page not active</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
