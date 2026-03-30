import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  // If setting as cover, unset others for this unit first
  if (body.is_cover) {
    const { data: img } = await supabaseAdmin
      .from("unit_images").select("unit_id").eq("id", id).single();
    if (img) {
      await supabaseAdmin
        .from("unit_images").update({ is_cover: false }).eq("unit_id", img.unit_id);
    }
  }

  const { data, error } = await supabaseAdmin
    .from("unit_images")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const { data: img } = await supabaseAdmin
    .from("unit_images").select("image_url").eq("id", id).single();

  const { error } = await supabaseAdmin.from("unit_images").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Best-effort delete from storage
  if (img?.image_url) {
    const url = new URL(img.image_url);
    const path = url.pathname.split("/unit-images/")[1];
    if (path) await supabaseAdmin.storage.from("unit-images").remove([path]);
  }

  return NextResponse.json({ ok: true });
}
