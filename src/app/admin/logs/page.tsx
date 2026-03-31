import type { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = { title: "Logs" };
import Link from "next/link";
import { format } from "date-fns";
import type { BookingLog } from "@/types";
import PageHero from "@/components/admin/PageHero";

interface BookingLogRow extends BookingLog {
  bookings: { guest_name: string } | null;
  admins: { full_name: string } | null;
}

const actionColors: Record<string, string> = {
  created: "bg-green-100 text-green-800",
  updated: "bg-blue-100 text-blue-800",
  confirmed: "bg-indigo-100 text-indigo-800",
  cancelled: "bg-red-100 text-red-800",
  deleted: "bg-gray-100 text-gray-800",
};

export default async function LogsPage() {
  const { data } = await supabaseAdmin
    .from("booking_logs")
    .select("*, bookings(guest_name), admins(full_name)")
    .order("logged_at", { ascending: false })
    .limit(200);

  const logs = (data ?? []) as BookingLogRow[];

  return (
    <div className="flex flex-col gap-3">
      <PageHero heading="Booking Logs" leadingText="Track and view all booking logs to this application." />
      <h2 className="text-xl font-semibold mb-6">Logs</h2>

      <div className="bg-card rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Booking</TableHead>
              <TableHead>Admin</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No logs yet.
                </TableCell>
              </TableRow>
            )}
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {format(new Date(log.logged_at), "MMM d, yyyy HH:mm")}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      actionColors[log.action] ?? "bg-muted text-muted-foreground"
                    }`}
                  >
                    {log.action}
                  </span>
                </TableCell>
                <TableCell>
                  <Link href={`/admin/bookings/${log.booking_id}`} className="hover:underline text-sm">
                    {log.bookings?.guest_name ?? log.booking_id.slice(0, 8)}
                  </Link>
                </TableCell>
                <TableCell className="text-sm">{log.admins?.full_name ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
