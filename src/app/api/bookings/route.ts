import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { z } from "zod";

const bookingSchema = z.object({
  unit_id: z.string().uuid(),
  guest_name: z.string().min(2),
  guest_contact: z.string().optional().nullable(),
  pax: z.number().int().min(1).optional().nullable(),
  check_in: z.string().regex(/^\d{4}-\d{2}-\d{2}/),
  check_out: z.string().regex(/^\d{4}-\d{2}-\d{2}/),
  total_amount: z.number().min(0).optional().nullable(),
  amount_paid: z.number().min(0).optional().nullable(),
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]).default("pending"),
  source: z.enum(["manual", "ocr"]).default("manual"),
  notes: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const unitId = searchParams.get("unit_id");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  let query = supabaseAdmin
    .from("bookings")
    .select("*, units(id, name, residence_id)")
    .order("check_in", { ascending: false });

  if (status) query = query.eq("status", status);
  if (unitId) query = query.eq("unit_id", unitId);
  if (from) query = query.gte("check_in", from);
  if (to) query = query.lte("check_out", to);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = bookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .insert(parsed.data)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { error: logError } = await supabaseAdmin.from("booking_logs").insert({
      booking_id: booking.id,
      admin_id: session.user?.id ?? "",
      action: "created",
      changes: { after: booking },
    });
    if (logError) console.error("booking_logs insert failed:", logError.message);

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Create booking error:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
