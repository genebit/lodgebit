import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { z } from "zod";

const schema = z.object({
  ids: z.array(z.string().uuid()).min(1),
});

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { ids } = parsed.data;
  const now = new Date().toISOString();

  const { error } = await supabaseAdmin
    .from("bookings")
    .update({ deleted_at: now })
    .in("id", ids);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const logs = ids.map((id) => ({
    booking_id: id,
    admin_id: session.user?.id ?? "",
    action: "deleted",
    changes: { deleted_at: now },
  }));

  await supabaseAdmin.from("booking_logs").insert(logs);

  return NextResponse.json({ deleted: ids.length });
}
