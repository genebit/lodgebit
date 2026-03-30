import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { postToFacebook } from "@/lib/facebook";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { bookingId, message, postType } = await req.json();

    if (!bookingId || !message || !postType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: booking } = await supabaseAdmin
      .from("bookings")
      .select("id, units(residence_id, residences(facebook_page_id))")
      .eq("id", bookingId)
      .single();

    const pageId = (booking?.units as { residences?: { facebook_page_id?: string } } | null)
      ?.residences?.facebook_page_id;

    if (!pageId) {
      return NextResponse.json({ error: "No Facebook page linked to this residence" }, { status: 400 });
    }

    const { data: fbPost, error: insertError } = await supabaseAdmin
      .from("fb_posts")
      .insert({
        booking_id: bookingId,
        admin_id: session.user?.id ?? "",
        post_type: postType,
        message,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) throw insertError;

    const result = await postToFacebook(pageId, message);

    await supabaseAdmin
      .from("fb_posts")
      .update({
        fb_post_id: result.id,
        status: result.success ? "posted" : "failed",
        posted_at: new Date().toISOString(),
      })
      .eq("id", fbPost.id);

    return NextResponse.json({ success: result.success, error: result.error });
  } catch (error) {
    console.error("Facebook post error:", error);
    return NextResponse.json({ error: "Failed to post to Facebook" }, { status: 500 });
  }
}
