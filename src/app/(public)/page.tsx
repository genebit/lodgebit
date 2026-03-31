import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { MapPin, Building2, ArrowRight } from "lucide-react";

export const metadata: Metadata = { title: "Lodgebit" };

interface ResidenceSummary {
  id: string;
  name: string;
  slug: string | null;
  address: string | null;
  description: string | null;
  cover_image_url: string | null;
}

export default async function LodgebitIndexPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("residences")
    .select("id, name, slug, address, description, cover_image_url")
    .order("name");

  const residences = (data ?? []) as ResidenceSummary[];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <header className="bg-[#1e3a5f] text-white py-16 px-6 text-center">
        <p className="text-white/50 text-xs uppercase tracking-[0.3em] font-semibold mb-3">Powered by</p>
        <h1 className="text-5xl sm:text-6xl font-black uppercase tracking-wider">Lodgebit</h1>
        <p className="text-white/60 text-sm mt-3 max-w-sm mx-auto">
          Find and book your perfect transient stay.
        </p>
      </header>

      {/* Residences */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-14">
        {residences.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 text-sm">No residences available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {residences.map((r) => (
              <Link
                key={r.id}
                href={r.slug ? `/r/${r.slug}` : "#"}
                className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100"
              >
                {/* Cover */}
                <div className="relative h-40 bg-[#1e3a5f]/10">
                  {r.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.cover_image_url}
                      alt={r.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="h-10 w-10 text-[#1e3a5f]/30" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-bold text-gray-900 text-lg leading-tight">{r.name}</h2>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#1e3a5f] transition-colors shrink-0 mt-1" />
                  </div>
                  {r.address && (
                    <p className="flex items-center gap-1.5 text-xs text-gray-400">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      {r.address}
                    </p>
                  )}
                  {r.description && (
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{r.description}</p>
                  )}
                  {!r.slug && (
                    <p className="text-xs text-amber-500 font-medium">Page not yet published</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-400 text-xs border-t">
        © {new Date().getFullYear()} Lodgebit. All rights reserved.
      </footer>
    </div>
  );
}
