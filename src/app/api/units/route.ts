import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { z } from "zod";

const unitSchema = z.object({
  residence_id: z.string().uuid(),
  name: z.string().min(1),
  unit_type: z.enum(["room", "suite", "cottage", "villa", "other"]).default("room"),
  floor_location: z.string().optional().nullable(),
  capacity: z.number().int().min(1).optional().nullable(),
  price_per_night: z.number().min(0).optional().nullable(),
  description: z.string().optional().nullable(),
  is_available: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const residenceId = searchParams.get("residence_id");

  let query = supabaseAdmin
    .from("units")
    .select("*, unit_images(*)")
    .order("name");

  if (residenceId) query = query.eq("residence_id", residenceId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = unitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("units")
      .insert(parsed.data)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Create unit error:", error);
    return NextResponse.json({ error: "Failed to create unit" }, { status: 500 });
  }
}
