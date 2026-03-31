"use client";

import { useState, useEffect } from "react";
import OCRScanner from "@/components/admin/OCRScanner";
import BookingForm from "@/components/admin/BookingForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { OcrExtractedData, Unit } from "@/types";
import PageHero from "@/components/admin/PageHero";

// Placeholder booking ID for the scan session — real booking created after review
const TEMP_BOOKING_ID = "00000000-0000-0000-0000-000000000000";

export default function OCRPage() {
  const [extractedData, setExtractedData] = useState<OcrExtractedData | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);

  useEffect(() => {
    fetch("/api/units")
      .then((r) => r.json())
      .then((data) => setUnits(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <PageHero heading="Scan Contracts" leadingText="Scan contracts to auto encode booking details" />
      <div className="max-w-2xl space-y-6">
        <h2 className="text-xl font-semibold">OCR — Scan Contract</h2>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Step 1: Capture Contract</CardTitle>
          </CardHeader>
          <CardContent>
            <OCRScanner bookingId={TEMP_BOOKING_ID} onExtracted={(data) => setExtractedData(data)} />
          </CardContent>
        </Card>

        {extractedData && (
          <>
            <Separator />
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Step 2: Review & Confirm</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Review the extracted data below, make any corrections, then save the booking.
                </p>
                <BookingForm units={units} prefillFromOcr={extractedData} source="ocr" />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
