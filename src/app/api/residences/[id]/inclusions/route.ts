import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from("residence_inclusions")
    .select("*")
    .eq("residence_id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { description } = await req.json();
  if (!description?.trim()) return NextResponse.json({ error: "description is required" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("residence_inclusions")
    .insert({ residence_id: id, description: description.trim() })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { inclusionId } = await req.json();
  if (!inclusionId) return NextResponse.json({ error: "inclusionId required" }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("residence_inclusions")
    .delete()
    .eq("id", inclusionId)
    .eq("residence_id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
