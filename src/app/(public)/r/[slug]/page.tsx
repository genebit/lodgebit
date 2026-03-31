import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import AvailabilityCalendar from "@/components/public/AvailabilityCalendar";
import UnitGallery from "@/components/public/UnitGallery";
import { MapPin, Check, MessageCircle } from "lucide-react";

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
  { label: "Amenities", href: "#amenities" },
  { label: "Inclusions", href: "#inclusions" },
  { label: "Gallery", href: "#gallery" },
  { label: "Bookings", href: "#bookings" },
  { label: "Location", href: "#location" },
  { label: "Contact", href: "#contact" },
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
    <div className="bg-white min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-5 px-4 pointer-events-none">
        <div className="flex items-center gap-1 bg-black/30 backdrop-blur-md border border-white/20 rounded-full px-2 py-1.5 pointer-events-auto shadow-xl">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="px-4 py-1.5 rounded-full text-sm font-medium text-white/90 hover:bg-white/20 hover:text-white transition-all"
            >
              {label}
            </a>
          ))}
        </div>
      </nav>
      <section
        id="hero"
        className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden"
      >
        <div className="absolute inset-0">
          <Image src={coverImage} alt={residence.name} fill className="object-cover" priority />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#1e3a5f]/60 via-[#1e3a5f]/70 to-[#1e3a5f]/85" />
        <div className="relative z-10 px-6 max-w-2xl mx-auto space-y-5">
          <h1
            className="text-5xl sm:text-6xl md:text-7xl font-black text-white uppercase tracking-wider leading-[0.95]"
            style={{ textShadow: "0 4px 32px rgba(0,0,0,0.4)" }}
          >
            {residence.name}
          </h1>
          {residence.address && (
            <p className="text-white/75 text-xs sm:text-sm uppercase tracking-[0.2em] font-medium">
              {residence.address}
            </p>
          )}
          <div className="flex flex-wrap gap-3 justify-center pt-3">
            <a
              href="#bookings"
              className="px-6 py-2.5 rounded-full bg-white text-[#1e3a5f] text-sm font-bold hover:bg-gray-100 transition-colors shadow-lg"
            >
              Check Availability
            </a>
            <a
              href="#contact"
              className="px-6 py-2.5 rounded-full border-2 border-white/60 text-white text-sm font-bold hover:bg-white/15 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
      <section id="amenities" className="py-10 px-6 bg-gray-100">
        <div className="max-w-3xl mx-auto">
          <SectionHeader>Amenities</SectionHeader>
          <div className="mt-8 bg-gray-50 rounded-3xl p-7">
            {amenities.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {amenities.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <span className="w-7 h-7 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                      <Check className="h-3.5 w-3.5 text-emerald-500" strokeWidth={2.5} />
                    </span>
                    <span className="text-sm font-medium text-gray-800">{a.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm text-center py-4">No amenities listed yet.</p>
            )}
          </div>
        </div>
      </section>
      <section id="inclusions" className="py-10 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <SectionHeader>What&apos;s Included</SectionHeader>
          <div className="mt-8 bg-gray-50 rounded-3xl p-7">
            {inclusions.length > 0 ? (
              <ul className="space-y-3">
                {inclusions.map((item) => (
                  <li key={item.id} className="flex items-start gap-3 bg-white rounded-2xl p-4 shadow-sm">
                    <span className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3.5 w-3.5 text-emerald-500" strokeWidth={2.5} />
                    </span>
                    <span className="text-sm text-gray-700 leading-relaxed">{item.description}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-sm text-center py-4">No inclusions listed yet.</p>
            )}
          </div>
        </div>
      </section>
      <section id="gallery" className="py-10 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <SectionHeader>Unit Gallery</SectionHeader>
          <div className="mt-8">
            <UnitGallery units={unitsWithImages} />
          </div>
        </div>
      </section>
      <section id="bookings" className="py-10 px-6 bg-gray-100">
        <div className="max-w-3xl mx-auto">
          <SectionHeader light>Booking Calendar</SectionHeader>
          <p className="text-gray-500 text-sm mt-2 mb-8">
            Highlighted dates are already reserved. Contact us to check specific availability.
          </p>
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm p-6">
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
      <section id="location" className="py-10 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <SectionHeader>Location</SectionHeader>
          {residence.address && (
            <p className="flex items-center gap-2 text-gray-500 text-sm mt-2 mb-8">
              <MapPin className="h-4 w-4 text-[#1e3a5f] flex-shrink-0" />
              {residence.address}
            </p>
          )}
          {hasCoords ? (
            <div className="rounded-3xl overflow-hidden shadow-sm aspect-video">
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
            <div className="rounded-3xl bg-gray-50 aspect-video flex items-center justify-center">
              <p className="text-gray-400 text-sm">Map location not configured yet.</p>
            </div>
          )}
        </div>
      </section>
      <footer id="contact" className="bg-[#1e3a5f] text-white py-10 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-10">
          <div className="space-y-3">
            <p className="text-white/50 text-xs uppercase tracking-widest font-semibold">Get in Touch</p>
            <h2
              className="text-4xl sm:text-5xl font-black uppercase tracking-wider"
              style={{ textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}
            >
              {residence.name}
            </h2>
            {residence.address && (
              <p className="flex items-center justify-center gap-2 text-white/60 text-sm">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                {residence.address}
              </p>
            )}
          </div>
          <div className="space-y-4">
            <p className="text-white/70 text-sm max-w-sm mx-auto leading-relaxed">
              Have questions or want to book a stay? Message us directly on Facebook Messenger.
            </p>
            <a
              href={messengerLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-[#0084FF] hover:bg-[#0073e6] text-white font-bold rounded-full transition-colors shadow-xl shadow-black/20 text-sm"
            >
              <MessageCircle className="h-5 w-5" />
              Message Us on Messenger
            </a>
          </div>
          <div className="border-t border-white/10 pt-8 text-white/30 text-xs">
            © {new Date().getFullYear()} {residence.name}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function SectionHeader({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <div className="text-center mb-2">
      <h2 className="text-2xl font-black uppercase tracking-wider text-gray-900">{children}</h2>
      <div className={`mt-2 h-0.5 w-12 mx-auto rounded-full ${light ? "bg-white/40" : "bg-[#1e3a5f]/30"}`} />
    </div>
  );
}
