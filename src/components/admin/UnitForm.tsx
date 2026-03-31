"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function Req() {
  return <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 mb-0.5 ml-1 align-middle" />;
}
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Residence } from "@/types";

const unitSchema = z.object({
  residence_id: z.string().uuid("Select a residence"),
  name: z.string().min(1, "Name required"),
  unit_type: z.enum(["room", "suite", "cottage", "villa", "other"]),
  floor_location: z.string().optional(),
  capacity: z.coerce.number().int().min(1).optional(),
  price_per_night: z.coerce.number().min(0).optional(),
  description: z.string().optional(),
  is_available: z.boolean(),
});

type FormData = z.infer<typeof unitSchema>;

interface UnitFormProps {
  residences: Residence[];
  unitId?: string;
  defaultValues?: Partial<FormData>;
}

export default function UnitForm({ residences, unitId, defaultValues }: UnitFormProps) {
  const router = useRouter();
  const isEditing = !!unitId;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(unitSchema),
    defaultValues: { unit_type: "room", is_available: true, ...defaultValues },
  });

  async function onSubmit(data: FormData) {
    const url = isEditing ? `/api/units/${unitId}` : "/api/units";
    const method = isEditing ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error ?? "Failed to save unit");
      return;
    }

    toast.success(isEditing ? "Unit updated" : "Unit created");
    router.push("/admin/units");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1 sm:col-span-2">
          <Label>Residence <Req /></Label>
          <Select
            defaultValue={defaultValues?.residence_id}
            onValueChange={(v) => setValue("residence_id", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select residence…" />
            </SelectTrigger>
            <SelectContent>
              {residences.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.residence_id && (
            <p className="text-xs text-destructive">{errors.residence_id.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="name">Unit Name <Req /></Label>
          <Input id="name" placeholder="e.g. Room 1, Garden Suite" {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-1">
          <Label>Unit Type <Req /></Label>
          <Select
            defaultValue={defaultValues?.unit_type ?? "room"}
            onValueChange={(v) => setValue("unit_type", v as FormData["unit_type"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["room", "suite", "cottage", "villa", "other"].map((t) => (
                <SelectItem key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="floor_location">Floor / Location</Label>
          <Input id="floor_location" placeholder="e.g. Ground Floor, Building B" {...register("floor_location")} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="capacity">Max Capacity (guests)</Label>
          <Input id="capacity" type="number" min={1} {...register("capacity")} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="price_per_night">Price per Night (PHP)</Label>
          <Input id="price_per_night" type="number" step="0.01" min={0} {...register("price_per_night")} />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" rows={3} {...register("description")} />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="is_available"
            defaultChecked={defaultValues?.is_available ?? true}
            onCheckedChange={(checked) => setValue("is_available", checked === true)}
          />
          <Label htmlFor="is_available">Available for booking</Label>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : isEditing ? "Update Unit" : "Create Unit"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
