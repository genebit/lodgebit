import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { z } from "zod";

const residenceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  facebook_page_id: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("residences")
    .select("*, residence_amenities(*), residence_inclusions(*), units(id, name, is_available)")
    .order("name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = residenceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { data: residence, error } = await supabaseAdmin
      .from("residences")
      .insert(parsed.data)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Link admin to residence
    await supabaseAdmin.from("admin_residences").insert({
      admin_id: session.user?.id ?? "",
      residence_id: residence.id,
    });

    return NextResponse.json(residence, { status: 201 });
  } catch (error) {
    console.error("Create residence error:", error);
    return NextResponse.json({ error: "Failed to create residence" }, { status: 500 });
  }
}
