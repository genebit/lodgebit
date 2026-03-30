import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { z } from "zod";

const schema = z.object({
  image_url: z.string().min(1),
  id_type: z.enum(["passport", "drivers_license", "national_id", "other"]).optional(),
  guest_name: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id: booking_id } = await params;
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("guest_ids")
      .insert({
        booking_id,
        image_url: parsed.data.image_url,
        id_type: parsed.data.id_type ?? null,
        guest_name: parsed.data.guest_name ?? null,
        uploaded_by: session.user?.id ?? null,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Guest ID upload error:", error);
    return NextResponse.json({ error: "Failed to save guest ID" }, { status: 500 });
  }
}
