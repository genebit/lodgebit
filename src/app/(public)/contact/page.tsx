import { createClient } from "@/lib/supabase/server";
import { MapPin, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ResidenceContact {
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  facebook_page_id: string | null;
}

export default async function ContactPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("residences")
    .select("name, address, latitude, longitude, facebook_page_id")
    .limit(1)
    .maybeSingle();

  const residence = data as ResidenceContact | null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Contact Us</h1>

      <div className="space-y-6">
        <div className="p-6 rounded-xl border bg-card space-y-4">
          <h2 className="font-semibold text-lg">{residence?.name ?? "Bitara Residence"}</h2>

          {residence?.address && (
            <div className="flex items-start gap-3 text-muted-foreground">
              <MapPin className="h-5 w-5 mt-0.5 shrink-0" />
              <span>{residence.address}</span>
            </div>
          )}

          {residence?.facebook_page_id && (
            <div className="flex items-center gap-3">
              <Share2 className="h-5 w-5 text-muted-foreground" />
              <span className="text-muted-foreground">Follow us on Facebook</span>
            </div>
          )}
        </div>

        <div className="p-6 rounded-xl border bg-card">
          <h2 className="font-semibold mb-3">Book a Stay</h2>
          <p className="text-muted-foreground text-sm mb-4">
            Check availability and contact us directly to reserve your unit.
          </p>
          <Button asChild>
            <Link href="/availability">Check Availability</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
