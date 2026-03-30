"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  async function onSubmit(data: FormData) {
    const url = isEditing ? `/api/bookings/${bookingId}` : "/api/bookings";
    const method = isEditing ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, source }),
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1 sm:col-span-2">
          <Label>Unit <Req /></Label>
          <Select
            defaultValue={defaultValues?.unit_id}
            onValueChange={(v) => setValue("unit_id", v)}
          >
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
          {errors.unit_id && (
            <p className="text-xs text-destructive">{errors.unit_id.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="guest_name">Guest Name <Req /></Label>
          <Input id="guest_name" {...register("guest_name")} />
          {errors.guest_name && (
            <p className="text-xs text-destructive">{errors.guest_name.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="guest_contact">Contact Number</Label>
          <Input id="guest_contact" {...register("guest_contact")} />
        </div>

        <div className="space-y-1">
          <Label>Check-in Date & Time <Req /></Label>
          <DateTimePicker
            value={checkIn}
            onChange={(v) => setValue("check_in", v, { shouldValidate: true })}
            placeholder="Pick check-in…"
          />
          {errors.check_in && (
            <p className="text-xs text-destructive">{errors.check_in.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label>Check-out Date & Time <Req /></Label>
          <DateTimePicker
            value={checkOut}
            onChange={(v) => setValue("check_out", v, { shouldValidate: true })}
            placeholder="Pick check-out…"
          />
          {errors.check_out && (
            <p className="text-xs text-destructive">{errors.check_out.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="pax">Number of Guests (Pax) <Req /></Label>
          <Input id="pax" type="number" min={1} {...register("pax")} />
          {errors.pax && (
            <p className="text-xs text-destructive">{errors.pax.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label>Status <Req /></Label>
          <Select
            defaultValue={defaultValues?.status ?? "pending"}
            onValueChange={(v) =>
              setValue("status", v as FormData["status"])
            }
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
