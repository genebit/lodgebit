"use client";

import { useForm } from "react-hook-form";
import { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScanText, Upload, AlertTriangle } from "lucide-react";
import type { OcrExtractedData, Unit } from "@/types";

/* Small red required indicator */
function Req() {
  return <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 mb-0.5 ml-1 align-middle" />;
}

const bookingSchema = z.object({
  unit_id: z.string().uuid("Select a unit"),
  guest_name: z.string().min(2, "Name must be at least 2 characters"),
  guest_contact: z.string().optional(),
  pax: z.coerce.number().int().min(1, "At least 1 person"),
  check_in: z.string().min(1, "Check-in date required"),
  check_out: z.string().min(1, "Check-out date required"),
  total_amount: z.coerce.number().min(0),
  amount_paid: z.coerce.number().min(0),
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  units: Unit[];
  bookingId?: string;
  defaultValues?: Partial<FormData>;
  prefillFromOcr?: OcrExtractedData;
  source?: "manual" | "ocr";
}

export default function BookingForm({
  units,
  bookingId,
  defaultValues,
  prefillFromOcr,
  source = "manual",
}: BookingFormProps) {
  const router = useRouter();
  const isEditing = !!bookingId;

  const [ocrSource, setOcrSource] = useState<"manual" | "ocr">(source);
  const [scanning, setScanning] = useState(false);
  const [scanPreview, setScanPreview] = useState<string | null>(null);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      status: "pending",
      pax: 1,
      total_amount: 0,
      amount_paid: 0,
      ...defaultValues,
      ...(prefillFromOcr && {
        guest_name: prefillFromOcr.guest_name ?? "",
        guest_contact: prefillFromOcr.guest_contact ?? "",
        check_in: prefillFromOcr.check_in ?? "",
        check_out: prefillFromOcr.check_out ?? "",
        pax: prefillFromOcr.pax ?? 1,
        total_amount: prefillFromOcr.total_amount ?? 0,
        notes: prefillFromOcr.notes ?? "",
      }),
    },
  });

  const checkIn = watch("check_in") ?? "";
  const checkOut = watch("check_out") ?? "";

  function handleContractFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanPreview(URL.createObjectURL(file));
  }

  async function handleScanContract() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      toast.error("Please select a contract image first");
      return;
    }

    setScanning(true);
    setMissingFields([]);
    try {
      const formData = new FormData();
      formData.append("image", file);
      if (bookingId) formData.append("booking_id", bookingId);

      const res = await fetch("/api/ocr", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "OCR failed");
        return;
      }

      const { extractedData } = (await res.json()) as { extractedData: OcrExtractedData };

      const missing: string[] = [];
      if (extractedData.guest_name) setValue("guest_name", extractedData.guest_name);
      else missing.push("Guest Name");

      if (extractedData.guest_contact) setValue("guest_contact", extractedData.guest_contact);
      else missing.push("Contact Number");

      if (extractedData.check_in)
        setValue(
          "check_in",
          extractedData.check_in.includes("T") ? extractedData.check_in : `${extractedData.check_in}T14:00`,
        );
      else missing.push("Check-in Date");

      if (extractedData.check_out)
        setValue(
          "check_out",
          extractedData.check_out.includes("T") ? extractedData.check_out : `${extractedData.check_out}T12:00`,
        );
      else missing.push("Check-out Date");

      if (extractedData.pax) setValue("pax", extractedData.pax);
      if (extractedData.total_amount) setValue("total_amount", extractedData.total_amount);
      if (extractedData.notes) setValue("notes", extractedData.notes);

      setOcrSource("ocr");
      setMissingFields(missing);
      toast.success(
        missing.length > 0 ? "Contract scanned — some fields need manual entry" : "Contract scanned successfully",
      );
    } catch {
      toast.error("OCR processing failed");
    } finally {
      setScanning(false);
    }
  }

  async function onSubmit(data: FormData) {
    const url = isEditing ? `/api/bookings/${bookingId}` : "/api/bookings";
    const method = isEditing ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, source: ocrSource }),
    });

    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error ?? "Failed to save booking");
      return;
    }

    const saved = await res.json();
    toast.success(isEditing ? "Booking updated" : "Booking created");
    router.push(`/admin/bookings/${saved.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-2xl">
      <div className="rounded-lg border-2 border-dashed border-border p-4 space-y-3">
        <div className="flex items-center gap-2">
          <ScanText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Scan from Contract</span>
          <span className="text-xs text-muted-foreground">(optional — auto-fills fields below)</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-start">
          <label
            htmlFor="contract_file"
            className="flex items-center gap-2 cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-muted transition-colors"
          >
            <Upload className="h-4 w-4" />
            {scanPreview ? "Change file" : "Upload contract photo"}
            <input
              id="contract_file"
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleContractFileChange}
              className="sr-only"
            />
          </label>

          {scanPreview && (
            <Button type="button" size="sm" variant="secondary" onClick={handleScanContract} disabled={scanning}>
              <ScanText className="h-4 w-4 mr-1" />
              {scanning ? "Scanning…" : "Extract Data"}
            </Button>
          )}
        </div>

        {scanPreview && (
          <div className="rounded-md overflow-hidden border max-w-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={scanPreview} alt="Contract preview" className="w-full max-h-40 object-contain" />
          </div>
        )}

        {scanning && (
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        )}

        {missingFields.length > 0 && (
          <div className="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              Could not extract: <strong>{missingFields.join(", ")}</strong>. Please fill in manually.
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1 sm:col-span-2">
          <Label>
            Unit <Req />
          </Label>
          <Select defaultValue={defaultValues?.unit_id} onValueChange={(v) => setValue("unit_id", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select unit…" />
            </SelectTrigger>
            <SelectContent>
              {units.map((unit) => (
                <SelectItem key={unit.id} value={unit.id}>
                  {unit.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.unit_id && <p className="text-xs text-destructive">{errors.unit_id.message}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="guest_name">
            Guest Name <Req />
          </Label>
          <Input id="guest_name" {...register("guest_name")} />
          {errors.guest_name && <p className="text-xs text-destructive">{errors.guest_name.message}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="guest_contact">Contact Number</Label>
          <Input id="guest_contact" {...register("guest_contact")} />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <Label>
            Check-in & Check-out <Req />
          </Label>
          <DateRangePicker
            checkIn={checkIn}
            checkOut={checkOut}
            onChangeCheckIn={(v) => setValue("check_in", v, { shouldValidate: true })}
            onChangeCheckOut={(v) => setValue("check_out", v, { shouldValidate: true })}
          />
          {(errors.check_in || errors.check_out) && (
            <p className="text-xs text-destructive">{errors.check_in?.message ?? errors.check_out?.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="pax">
            Number of Guests (Pax) <Req />
          </Label>
          <Input id="pax" type="number" min={1} {...register("pax")} />
          {errors.pax && <p className="text-xs text-destructive">{errors.pax.message}</p>}
        </div>

        <div className="space-y-1">
          <Label>
            Status <Req />
          </Label>
          <Select
            defaultValue={defaultValues?.status ?? "pending"}
            onValueChange={(v) => setValue("status", v as FormData["status"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="total_amount">Total Amount (PHP)</Label>
          <Input id="total_amount" type="number" step="0.01" min={0} {...register("total_amount")} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="amount_paid">Amount Paid (PHP)</Label>
          <Input id="amount_paid" type="number" step="0.01" min={0} {...register("amount_paid")} />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" rows={3} {...register("notes")} />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : isEditing ? "Update Booking" : "Create Booking"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
