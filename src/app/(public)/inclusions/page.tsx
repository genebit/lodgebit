import { createClient } from "@/lib/supabase/server";
import { Check } from "lucide-react";

interface InclusionRow {
  id: string;
  description: string;
}

interface ResidenceWithInclusions {
  name: string;
  residence_inclusions: InclusionRow[];
}

export default async function InclusionsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("residences")
    .select("name, residence_inclusions(id, description)")
    .limit(1)
    .maybeSingle();

  const residence = data as ResidenceWithInclusions | null;
  const inclusions = residence?.residence_inclusions ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">What&apos;s Included</h1>
      {inclusions.length === 0 ? (
        <p className="text-muted-foreground">No inclusions listed yet.</p>
      ) : (
        <ul className="space-y-3">
          {inclusions.map((item) => (
            <li key={item.id} className="flex items-start gap-3">
              <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
              <span>{item.description}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
