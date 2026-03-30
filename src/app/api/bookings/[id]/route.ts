import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { z } from "zod";

const updateSchema = z.object({
  unit_id: z.string().uuid().optional(),
  guest_name: z.string().min(2).optional(),
  guest_contact: z.string().optional().nullable(),
  pax: z.number().int().min(1).optional().nullable(),
  check_in: z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional(),
  check_out: z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional(),
  total_amount: z.number().min(0).optional().nullable(),
  amount_paid: z.number().min(0).optional().nullable(),
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]).optional(),
  notes: z.string().optional().nullable(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("*, units(id, name, residence_id, residences(name)), guest_ids(*), contract_scans(*), booking_logs(*), fb_posts(*)")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { data: before } = await supabaseAdmin
      .from("bookings")
      .select()
      .eq("id", id)
      .single();

    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .update(parsed.data)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const action = parsed.data.status === "cancelled" ? "cancelled" :
      parsed.data.status === "confirmed" ? "confirmed" : "updated";

    await supabaseAdmin.from("booking_logs").insert({
      booking_id: id,
      admin_id: session.user?.id ?? "",
      action,
      changes: { before, after: booking },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Update booking error:", error);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const { data: before } = await supabaseAdmin
    .from("bookings")
    .select()
    .eq("id", id)
    .single();

  const { error } = await supabaseAdmin.from("bookings").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (before) {
    await supabaseAdmin.from("booking_logs").insert({
      booking_id: id,
      admin_id: session.user?.id ?? "",
      action: "deleted",
      changes: { before },
    });
  }

  return new NextResponse(null, { status: 204 });
}
