import { createClient } from "@/lib/supabase/server";
import { MapPin } from "lucide-react";

interface ResidenceLocation {
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
}

export default async function LocationPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("residences")
    .select("name, address, latitude, longitude")
    .limit(1)
    .maybeSingle();

  const residence = data as ResidenceLocation | null;
  const hasCoords = residence?.latitude != null && residence?.longitude != null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-4">Location</h1>

      {residence?.address && (
        <p className="flex items-center gap-2 text-muted-foreground mb-8">
          <MapPin className="h-4 w-4" />
          {residence.address}
        </p>
      )}

      {hasCoords ? (
        <div className="rounded-xl overflow-hidden border aspect-video">
          <iframe
            title="Map"
            width="100%"
            height="100%"
            loading="lazy"
            src={`https://www.google.com/maps?q=${residence!.latitude},${residence!.longitude}&output=embed`}
            className="border-0"
          />
        </div>
      ) : (
        <div className="rounded-xl border bg-muted/40 aspect-video flex items-center justify-center">
          <p className="text-muted-foreground">Map location not set yet.</p>
        </div>
      )}
    </div>
  );
}
