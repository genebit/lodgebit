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
      .select("id, units(residence_id, residences(facebook_page_id, meta_page_access_token))")
      .eq("id", bookingId)
      .single();

    const residence = (booking?.units as { residences?: { facebook_page_id?: string; meta_page_access_token?: string } } | null)
      ?.residences;

    if (!residence?.facebook_page_id) {
      return NextResponse.json({ error: "No Facebook page linked to this residence" }, { status: 400 });
    }

    const accessToken = residence.meta_page_access_token ?? process.env.META_PAGE_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json({ error: "No Meta Page Access Token configured for this residence" }, { status: 400 });
    }

    const pageId = residence.facebook_page_id;

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

    const result = await postToFacebook(pageId, message, accessToken);

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
