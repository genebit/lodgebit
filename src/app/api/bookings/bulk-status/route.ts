import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { z } from "zod";

const bulkSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]),
});

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = bulkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { ids, status } = parsed.data;

  const { data: before } = await supabaseAdmin
    .from("bookings")
    .select("id, status")
    .in("id", ids);

  const { error } = await supabaseAdmin
    .from("bookings")
    .update({ status })
    .in("id", ids);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Log each update
  const logs = (before ?? []).map((b) => ({
    booking_id: b.id,
    admin_id: session.user?.id ?? "",
    action: status === "cancelled" ? "cancelled" : status === "confirmed" ? "confirmed" : "updated",
    changes: { before: { status: b.status }, after: { status } },
  }));

  if (logs.length > 0) {
    await supabaseAdmin.from("booking_logs").insert(logs);
  }

  return NextResponse.json({ updated: ids.length });
}
