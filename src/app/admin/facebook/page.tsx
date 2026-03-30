import { createClient } from "@/lib/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { format } from "date-fns";
import type { FbPost } from "@/types";

interface FbPostRow extends FbPost {
  bookings: { guest_name: string } | null;
  admins: { full_name: string } | null;
}

const statusColors: Record<string, string> = {
  posted: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-800",
};

export default async function FacebookPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("fb_posts")
    .select("*, bookings(guest_name), admins(full_name)")
    .order("posted_at", { ascending: false })
    .limit(100);

  const posts = (data ?? []) as FbPostRow[];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Facebook Posts</h2>

      <div className="bg-card rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Posted At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Booking</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No Facebook posts yet.
                </TableCell>
              </TableRow>
            )}
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {post.posted_at
                    ? format(new Date(post.posted_at), "MMM d, yyyy HH:mm")
                    : "—"}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      statusColors[post.status] ?? "bg-muted text-muted-foreground"
                    }`}
                  >
                    {post.status}
                  </span>
                </TableCell>
                <TableCell className="text-sm capitalize">
                  {post.post_type.replace("_", " ")}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/admin/bookings/${post.booking_id}`}
                    className="hover:underline text-sm"
                  >
                    {post.bookings?.guest_name ?? "—"}
                  </Link>
                </TableCell>
                <TableCell className="text-sm">{post.admins?.full_name ?? "—"}</TableCell>
                <TableCell className="text-sm max-w-xs truncate">{post.message}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
