import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { unit_id, path, caption, is_cover } = await req.json();
  if (!unit_id || !path) {
    return NextResponse.json({ error: "unit_id and path are required" }, { status: 400 });
  }

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from("unit-images")
    .getPublicUrl(path);

  // If setting as cover, unset existing cover first
  if (is_cover) {
    await supabaseAdmin
      .from("unit_images")
      .update({ is_cover: false })
      .eq("unit_id", unit_id);
  }

  const { data, error } = await supabaseAdmin
    .from("unit_images")
    .insert({ unit_id, image_url: publicUrl, caption: caption ?? null, is_cover: is_cover ?? false })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
