import Link from "next/link";
import { Building2 } from "lucide-react";

const navLinks = [
  { label: "Amenities", href: "/amenities" },
  { label: "Inclusions", href: "/inclusions" },
  { label: "Location", href: "/location" },
  { label: "Contact", href: "/contact" },
  { label: "Availability", href: "/availability" },
];

export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 bg-stone-950/80 backdrop-blur border-b border-stone-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-white">
          <Building2 className="h-5 w-5 text-amber-400" />
          Bitara Residence
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {navLinks.map(({ label, href }) => (
            <Link key={href} href={href} className="text-stone-400 hover:text-white transition-colors">
              {label}
            </Link>
          ))}
        </nav>
        <nav className="md:hidden flex items-center gap-4 overflow-x-auto text-sm">
          {navLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-stone-400 whitespace-nowrap hover:text-white transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
