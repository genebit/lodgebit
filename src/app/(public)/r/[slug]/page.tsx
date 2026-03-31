import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import AvailabilityCalendar from "@/components/public/AvailabilityCalendar";
import UnitGallery from "@/components/public/UnitGallery";
import { MapPin, Check, MessageCircle, Star, Package, LayoutGrid, CalendarDays, Navigation, Phone } from "lucide-react";

interface AmenityRow {
  id: string;
  name: string;
}
interface InclusionRow {
  id: string;
  description: string;
}
interface BookingWithUnit {
  check_in: string;
  check_out: string;
  unit_id: string;
  units: { name: string } | null;
}
interface ResidenceFull {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  address: string | null;
  facebook_page_id: string | null;
  latitude: number | null;
  longitude: number | null;
  cover_image_url: string | null;
  residence_amenities: AmenityRow[];
  residence_inclusions: InclusionRow[];
}
interface UnitImageRow {
  id: string;
  image_url: string;
  is_cover: boolean;
  sort_order: number | null;
  caption: string | null;
}
interface UnitWithImages {
  id: string;
  name: string;
  unit_images: UnitImageRow[];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("residences").select("name").eq("slug", slug).maybeSingle();
  return { title: (data as { name: string } | null)?.name ?? "Residence" };
}

const NAV_LINKS = [
  { label: "Amenities", href: "#amenities", Icon: Star },
  { label: "Inclusions", href: "#inclusions", Icon: Package },
  { label: "Gallery", href: "#gallery", Icon: LayoutGrid },
  { label: "Bookings", href: "#bookings", Icon: CalendarDays },
  { label: "Location", href: "#location", Icon: Navigation },
  { label: "Contact", href: "#contact", Icon: Phone },
];

export default async function ResidencePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: residenceData } = await supabase
    .from("residences")
    .select(
      "id, name, slug, description, address, facebook_page_id, latitude, longitude, cover_image_url, residence_amenities(id, name), residence_inclusions(id, description)",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!residenceData) notFound();
  const residence = residenceData as ResidenceFull;

  const { data: bookingsData } = await supabase
    .from("bookings")
    .select("check_in, check_out, unit_id, units(name)")
    .in("status", ["confirmed", "pending"])
    .gte("check_out", today);

  const bookings = (bookingsData ?? []) as BookingWithUnit[];

  let unitsWithImages: UnitWithImages[] = [];
  const { data: unitsData } = await supabase
    .from("units")
    .select("id, name, unit_images(id, image_url, is_cover, sort_order, caption)")
    .eq("residence_id", residence.id)
    .eq("is_available", true)
    .order("name");

  if (unitsData) {
    unitsWithImages = (unitsData as UnitWithImages[]).map((u) => ({
      ...u,
      unit_images: [...u.unit_images].sort(
        (a, b) => (b.is_cover ? 1 : 0) - (a.is_cover ? 1 : 0) || (a.sort_order ?? 999) - (b.sort_order ?? 999),
      ),
    }));
  }

  const amenities = residence.residence_amenities;
  const inclusions = residence.residence_inclusions;
  const messengerLink = residence.facebook_page_id
    ? `https://m.me/${residence.facebook_page_id}`
    : "https://facebook.com";
  const hasCoords = residence.latitude != null && residence.longitude != null;
  const coverImage = residence.cover_image_url ?? "/images/Cover.png";

  return (
    <div className="bg-white min-h-screen text-slate-900">
      {/* Floating nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4 pointer-events-none">
        <div className="flex items-center bg-black/30 backdrop-blur-xl border border-white/15 rounded-full px-2 py-1.5 pointer-events-auto shadow-2xl shadow-black/30">
          {NAV_LINKS.map(({ label, href, Icon }) => (
            <a
              key={href}
              href={href}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white/75 hover:bg-white/15 hover:text-white transition-all"
            >
              {/* Mobile: icon only */}
              <Icon className="h-3.5 w-3.5 sm:hidden shrink-0" />
              {/* Desktop: label only */}
              <span className="hidden sm:inline">{label}</span>
            </a>
          ))}
        </div>
      </nav>

      {/* Hero */}
      <section id="hero" className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image src={coverImage} alt={residence.name} fill className="object-cover" priority />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/75" />

        <div className="relative z-10 px-6 max-w-3xl mx-auto text-center space-y-4">
          <p className="text-white/70 text-xs uppercase tracking-[0.3em] font-semibold">Transient Accommodation</p>
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-white uppercase tracking-tight leading-[0.9] drop-shadow-2xl">
            {residence.name}
          </h1>
          {residence.address && (
            <p className="flex items-center justify-center gap-1.5 text-white/70 text-xs sm:text-sm font-medium">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {residence.address}
            </p>
          )}
          <div className="flex flex-wrap gap-3 justify-center pt-2">
            <a
              href="#bookings"
              className="px-7 py-3 rounded-full bg-blue-700 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-xl shadow-black/30 hover:-translate-y-0.5"
            >
              Check Availability
            </a>
            <a
              href="#contact"
              className="px-7 py-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 text-white text-sm font-bold hover:bg-white/30 transition-all"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* Description strip */}
      {residence.description && (
        <section className="py-16 px-6 bg-white">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-slate-500 text-base sm:text-lg leading-relaxed">{residence.description}</p>
          </div>
        </section>
      )}

      {/* Amenities */}
      <section id="amenities" className="py-20 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <SectionLabel>Features</SectionLabel>
          <SectionTitle>Amenities</SectionTitle>
          <div className="mt-10">
            {amenities.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {amenities.map((a) => (
                  <div
                    key={a.id}
                    className="group flex items-center gap-3 bg-white border border-slate-100 hover:border-indigo-200 hover:shadow-md rounded-2xl p-4 transition-all"
                  >
                    <span className="w-7 h-7 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition-colors">
                      <Check className="h-3.5 w-3.5 text-indigo-600" strokeWidth={2.5} />
                    </span>
                    <span className="text-sm font-medium text-slate-700">{a.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm text-center py-8">No amenities listed yet.</p>
            )}
          </div>
        </div>
      </section>

      {/* Inclusions */}
      <section id="inclusions" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <SectionLabel>Package</SectionLabel>
          <SectionTitle>What&apos;s Included</SectionTitle>
          <div className="mt-10">
            {inclusions.length > 0 ? (
              <ul className="grid sm:grid-cols-2 gap-3">
                {inclusions.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-4"
                  >
                    <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-indigo-600" strokeWidth={3} />
                    </span>
                    <span className="text-sm text-slate-600 leading-relaxed">{item.description}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-400 text-sm text-center py-8">No inclusions listed yet.</p>
            )}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="py-20 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <SectionLabel>Spaces</SectionLabel>
          <SectionTitle>Unit Gallery</SectionTitle>
          <div className="mt-10">
            <UnitGallery units={unitsWithImages} />
          </div>
        </div>
      </section>

      {/* Bookings */}
      <section id="bookings" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <SectionLabel>Availability</SectionLabel>
          <SectionTitle>Booking Calendar</SectionTitle>
          <p className="text-slate-400 text-sm mt-3 mb-10 text-center">
            Highlighted dates are already reserved. Contact us to confirm your preferred dates.
          </p>
          <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm">
            <AvailabilityCalendar
              bookings={bookings.map((b) => ({
                check_in: b.check_in,
                check_out: b.check_out,
                unit_name: b.units?.name ?? "Unit",
              }))}
            />
          </div>
        </div>
      </section>

      {/* Location */}
      <section id="location" className="py-20 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <SectionLabel>Find Us</SectionLabel>
          <SectionTitle>Location</SectionTitle>
          {residence.address && (
            <p className="flex items-center justify-center gap-2 text-slate-400 text-sm mt-3 mb-10">
              <MapPin className="h-4 w-4 text-indigo-500 shrink-0" />
              {residence.address}
            </p>
          )}
          {hasCoords ? (
            <div className="rounded-3xl overflow-hidden border border-slate-200 aspect-video shadow-sm">
              <iframe
                title="Map"
                width="100%"
                height="100%"
                loading="lazy"
                src={`https://www.google.com/maps?q=${residence.latitude},${residence.longitude}&output=embed`}
                className="border-0"
              />
            </div>
          ) : (
            <div className="rounded-3xl bg-white border border-slate-100 aspect-video flex items-center justify-center">
              <p className="text-slate-300 text-sm">Map location not configured yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer / Contact */}
      <footer id="contact" className="bg-slate-900 text-white py-24 px-6">
        <div className="max-w-2xl mx-auto text-center space-y-10">
          <div className="space-y-4">
            <p className="text-indigo-400 text-xs uppercase tracking-[0.3em] font-semibold">Get in Touch</p>
            <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight leading-tight">{residence.name}</h2>
            {residence.address && (
              <p className="flex items-center justify-center gap-2 text-white/40 text-sm">
                <MapPin className="h-4 w-4 text-indigo-400 shrink-0" />
                {residence.address}
              </p>
            )}
          </div>
          <div className="space-y-5">
            <p className="text-white/50 text-sm max-w-sm mx-auto leading-relaxed">
              Have questions or want to book a stay? Message us directly on Facebook Messenger.
            </p>
            <a
              href={messengerLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-[#0084FF] hover:bg-[#0095ff] text-white font-bold rounded-full transition-all shadow-xl shadow-blue-900/40 hover:-translate-y-0.5 text-sm"
            >
              <MessageCircle className="h-4 w-4" />
              Message Us on Messenger
            </a>
          </div>
          <div className="pt-8 border-t border-white/[0.08] text-white/20 text-xs">
            © {new Date().getFullYear()} {residence.name}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-indigo-600 text-xs font-semibold uppercase tracking-[0.3em] text-center mb-2">{children}</p>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-3xl sm:text-4xl font-black text-slate-900 text-center tracking-tight">{children}</h2>;
}
