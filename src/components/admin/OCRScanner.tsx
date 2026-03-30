"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ScanText, Camera } from "lucide-react";
import type { OcrExtractedData } from "@/types";

interface OCRScannerProps {
  bookingId: string;
  onExtracted: (data: OcrExtractedData) => void;
}

export default function OCRScanner({ bookingId, onExtracted }: OCRScannerProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
  }

  async function handleScan() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      toast.error("Please capture or select an image first");
      return;
    }

    setScanning(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("booking_id", bookingId);

      const res = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "OCR failed");
        return;
      }

      const { extractedData } = await res.json();
      toast.success("Contract scanned successfully");
      onExtracted(extractedData);
    } catch {
      toast.error("OCR processing failed");
    } finally {
      setScanning(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="contract_image">
          <Camera className="inline h-4 w-4 mr-1" />
          Capture Contract
        </Label>
        <input
          id="contract_image"
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm file:border-0 file:bg-transparent file:text-sm"
        />
      </div>

      {preview && (
        <div className="rounded-lg overflow-hidden border max-w-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Contract preview" className="w-full object-contain" />
        </div>
      )}

      {scanning && (
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
          <p className="text-sm text-muted-foreground">Scanning contract…</p>
        </div>
      )}

      <Button onClick={handleScan} disabled={scanning || !preview} size="sm">
        <ScanText className="h-4 w-4 mr-1" />
        {scanning ? "Scanning…" : "Scan Contract"}
      </Button>
    </div>
  );
}
