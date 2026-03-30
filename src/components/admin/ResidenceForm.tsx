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

function Req() {
  return <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 mb-0.5 ml-1 align-middle" />;
}

const residenceSchema = z.object({
  name: z.string().min(1, "Name required"),
  description: z.string().optional(),
  address: z.string().optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  facebook_page_id: z.string().optional(),
});

type FormData = z.infer<typeof residenceSchema>;

interface ResidenceFormProps {
  residenceId?: string;
  defaultValues?: Partial<FormData>;
}

export default function ResidenceForm({ residenceId, defaultValues }: ResidenceFormProps) {
  const router = useRouter();
  const isEditing = !!residenceId;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(residenceSchema),
    defaultValues,
  });

  async function onSubmit(data: FormData) {
    const url = isEditing ? `/api/residences/${residenceId}` : "/api/residences";
    const method = isEditing ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error ?? "Failed to save residence");
      return;
    }

    toast.success(isEditing ? "Residence updated" : "Residence created");
    router.push("/admin/residences");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="name">Residence Name <Req /></Label>
          <Input id="name" {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" rows={3} {...register("description")} />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" {...register("address")} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="latitude">Latitude (GPS)</Label>
          <Input id="latitude" type="number" step="any" placeholder="e.g. 14.5995" {...register("latitude")} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="longitude">Longitude (GPS)</Label>
          <Input id="longitude" type="number" step="any" placeholder="e.g. 120.9842" {...register("longitude")} />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="facebook_page_id">Facebook Page ID</Label>
          <Input id="facebook_page_id" placeholder="Meta Page ID for auto-posting" {...register("facebook_page_id")} />
          <p className="text-xs text-muted-foreground">
            Found in your Facebook Page settings. Required for auto-posting.
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : isEditing ? "Update Residence" : "Create Residence"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
