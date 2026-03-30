import { createClient } from "@/lib/supabase/server";
import { Wifi } from "lucide-react";

interface AmenityRow {
  id: string;
  name: string;
  icon: string | null;
}

interface ResidenceWithAmenities {
  name: string;
  residence_amenities: AmenityRow[];
}

export default async function AmenitiesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("residences")
    .select("name, residence_amenities(id, name, icon)")
    .limit(1)
    .maybeSingle();

  const residence = data as ResidenceWithAmenities | null;
  const amenities = residence?.residence_amenities ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Amenities</h1>
      {amenities.length === 0 ? (
        <p className="text-muted-foreground">No amenities listed yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {amenities.map((amenity) => (
            <div
              key={amenity.id}
              className="flex flex-col items-center p-4 rounded-xl border bg-card text-center gap-2"
            >
              <Wifi className="h-8 w-8 text-primary" />
              <span className="text-sm font-medium">{amenity.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
