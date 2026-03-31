"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "@/lib/theme";
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  ScanText,
  DoorOpen,
  Building2,
  Share2,
  Activity,
  Moon,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

const mainNav = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Calendar", href: "/admin/calendar", icon: Calendar },
  { label: "Bookings", href: "/admin/bookings", icon: ClipboardList },
  { label: "OCR Scan", href: "/admin/ocr", icon: ScanText },
];

const manageNav = [
  { label: "Units", href: "/admin/units", icon: DoorOpen },
  { label: "Residences", href: "/admin/residences", icon: Building2 },
  { label: "Facebook", href: "/admin/facebook", icon: Share2 },
  { label: "Logs", href: "/admin/logs", icon: Activity },
];

const allNavItems = [...mainNav, ...manageNav];

function NavLink({
  href,
  icon: Icon,
  label,
  pathname,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  pathname: string;
}) {
  return (
    <Link
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
  );
}

function getInitials(name: string | null | undefined, email: string | null | undefined): string {
  if (name) {
    return name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }
  return (email?.[0] ?? "A").toUpperCase();
}

interface AdminSidebarProps {
  user: { name?: string | null; email?: string | null };
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  function toggleDark() {
    setTheme(dark ? "light" : "dark");
  }

  const initials = getInitials(user.name, user.email);
  const displayName = user.name ?? user.email ?? "Admin";

  return (
    <>
      <aside className="hidden md:flex w-56 flex-col bg-card border-r h-screen sticky top-0">
        <div className="p-3.5 border-b flex items-center gap-3">
          <Image src="/images/logo/logo.svg" alt="Lodgebit" width={110} height={32} className="h-8 w-auto" />
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Lodgebit Admin</p>
        </div>

        <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1">
              Main
            </p>
            {mainNav.map(({ label, href, icon }) => (
              <NavLink key={href} href={href} icon={icon} label={label} pathname={pathname} />
            ))}
          </div>

          <Separator />

          <div className="space-y-1">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1">
              Manage
            </p>
            {manageNav.map(({ label, href, icon }) => (
              <NavLink key={href} href={href} icon={icon} label={label} pathname={pathname} />
            ))}
          </div>
        </nav>

        <div className="p-3 border-t space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              {dark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
              <span className="text-xs">Dark mode</span>
            </div>
            <Switch checked={dark} onCheckedChange={toggleDark} aria-label="Toggle dark mode" />
          </div>

          <Separator />

          <div className="flex items-center gap-2.5 px-1">
            <div className="h-7 w-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium truncate leading-tight">{displayName}</p>
              {user.email && user.name && <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>}
            </div>
          </div>
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t flex items-center justify-around py-2">
        {allNavItems.map(({ label, href, icon: Icon }) => (
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
