"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  ScanText,
  DoorOpen,
  Building2,
  Share2,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Calendar", href: "/admin/calendar", icon: Calendar },
  { label: "Bookings", href: "/admin/bookings", icon: ClipboardList },
  { label: "OCR Scan", href: "/admin/ocr", icon: ScanText },
  { label: "Units", href: "/admin/units", icon: DoorOpen },
  { label: "Residences", href: "/admin/residences", icon: Building2 },
  { label: "Facebook", href: "/admin/facebook", icon: Share2 },
  { label: "Logs", href: "/admin/logs", icon: Activity },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden md:flex w-56 flex-col bg-card border-r h-screen sticky top-0">
        <div className="p-3.5 border-b flex items-center gap-3">
          <Image src="/images/logo/logo.svg" alt="Lodgebit" width={110} height={32} className="h-8 w-auto" />
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Lodgebit Admin</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname.startsWith(href)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t flex items-center justify-around py-2">
        {navItems.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-0.5 px-2 py-1 text-xs rounded-md transition-colors",
              pathname.startsWith(href) ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="hidden sm:block">{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
