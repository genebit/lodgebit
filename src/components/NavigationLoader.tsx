"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function NavigationLoaderInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navDoneRef = useRef(true);

  // Navigation complete — hide overlay
  useEffect(() => {
    navDoneRef.current = true;
    setLoading(false);
  }, [pathname, searchParams]);

  // Patch history.pushState to detect navigation start
  useEffect(() => {
    const original = window.history.pushState.bind(window.history);

    window.history.pushState = (...args) => {
      original(...args);
      navDoneRef.current = false;
      // Cancel any previous pending timer (rapid clicks)
      if (timerRef.current) clearTimeout(timerRef.current);
      // setTimeout(0) defers outside React's sync cycle.
      // navDoneRef prevents showing the loader if the pathname
      // already changed before this fires (instant/prefetched routes).
      timerRef.current = setTimeout(() => {
        if (!navDoneRef.current) setLoading(true);
      }, 0);
    };

    return () => {
      window.history.pushState = original;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-background/70 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 bg-card border border-border rounded-2xl px-8 py-6 shadow-2xl">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <p className="text-xs font-medium text-muted-foreground tracking-wide">Loading…</p>
      </div>
    </div>
  );
}

export default function NavigationLoader() {
  return (
    <Suspense>
      <NavigationLoaderInner />
    </Suspense>
  );
}
