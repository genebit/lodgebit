import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { callVisionAPI } from "@/lib/ocr";
import { parseContractText } from "@/lib/booking-parser";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    const bookingId = formData.get("booking_id") as string | null;

    if (!file) return NextResponse.json({ error: "No image provided" }, { status: 400 });
    if (!bookingId) return NextResponse.json({ error: "booking_id required" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const storagePath = `contract-scans/${bookingId}/${Date.now()}.jpg`;

    const { data: upload, error: uploadError } = await supabaseAdmin.storage
      .from("contracts")
      .upload(storagePath, buffer, { contentType: file.type || "image/jpeg" });

    if (uploadError) throw uploadError;

    const { data: scanRecord, error: scanError } = await supabaseAdmin
      .from("contract_scans")
      .insert({
        booking_id: bookingId,
        image_url: upload.path,
        ocr_status: "pending",
      })
      .select()
      .single();

    if (scanError) throw scanError;

    const rawText = await callVisionAPI(buffer);
    const extractedData = parseContractText(rawText);

    await supabaseAdmin
      .from("contract_scans")
      .update({
        ocr_raw_text: rawText,
        extracted_data: extractedData,
        ocr_status: "success",
      })
      .eq("id", scanRecord.id);

    return NextResponse.json({ scanId: scanRecord.id, extractedData });
  } catch (error) {
    console.error("OCR error:", error);
    return NextResponse.json({ error: "OCR processing failed" }, { status: 500 });
  }
}
