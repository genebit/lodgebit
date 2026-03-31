import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="flex flex-1 items-center justify-center h-full min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-xs text-muted-foreground tracking-wide">Loading…</p>
      </div>
    </div>
  );
}
