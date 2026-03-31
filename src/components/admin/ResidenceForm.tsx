"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const MapPicker = dynamic(() => import("@/components/admin/MapPicker"), { ssr: false });

function Req() {
  return <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 mb-0.5 ml-1 align-middle" />;
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const residenceSchema = z.object({
  name: z.string().min(1, "Name required"),
  slug: z
    .string()
    .regex(/^[a-z0-9-]*$/, "Slug must be lowercase letters, numbers and hyphens")
    .optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  facebook_page_id: z.string().optional(),
  meta_page_access_token: z.string().optional(),
});

type FormData = z.infer<typeof residenceSchema>;

interface ResidenceFormProps {
  residenceId?: string;
  defaultValues?: Partial<FormData & { slug?: string | null }>;
}

export default function ResidenceForm({ residenceId, defaultValues }: ResidenceFormProps) {
  const router = useRouter();
  const isEditing = !!residenceId;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(residenceSchema),
    defaultValues: {
      ...defaultValues,
      slug: defaultValues?.slug ?? "",
    },
  });

  function handleNameBlur(e: React.FocusEvent<HTMLInputElement>) {
    const currentSlug = watch("slug");
    if (!currentSlug) {
      setValue("slug", slugify(e.target.value), { shouldValidate: true });
    }
  }

  async function onSubmit(data: FormData) {
    const url = isEditing ? `/api/residences/${residenceId}` : "/api/residences";
    const method = isEditing ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, slug: data.slug || null }),
    });

    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error ?? "Failed to save residence");
      return;
    }

    toast.success(isEditing ? "Residence updated" : "Residence created");
    if (isEditing) {
      router.refresh();
    } else {
      router.push("/admin/residences");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="name">
            Residence Name <Req />
          </Label>
          <Input id="name" {...register("name")} onBlur={handleNameBlur} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="slug">Public URL Slug</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground shrink-0">/r/</span>
            <Input
              id="slug"
              placeholder="my-residence"
              {...register("slug")}
              onChange={(e) => setValue("slug", slugify(e.target.value), { shouldValidate: true })}
            />
          </div>
          {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
          <p className="text-xs text-muted-foreground">Auto-generated from name. This becomes the public page URL.</p>
        </div>

        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" rows={3} {...register("description")} />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" {...register("address")} />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <Label>Location</Label>
          <MapPicker
            lat={watch("latitude")}
            lng={watch("longitude")}
            onChange={({ lat, lng }) => {
              setValue("latitude", lat, { shouldValidate: true });
              setValue("longitude", lng, { shouldValidate: true });
            }}
          />
          {(watch("latitude") || watch("longitude")) && (
            <p className="text-xs text-muted-foreground">
              {watch("latitude")?.toFixed(6)}, {watch("longitude")?.toFixed(6)}
            </p>
          )}
        </div>

        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="facebook_page_id">Facebook Page ID</Label>
          <Input id="facebook_page_id" placeholder="Meta Page ID for auto-posting" {...register("facebook_page_id")} />
          <p className="text-xs text-muted-foreground">
            Found in your Facebook Page settings. Required for auto-posting.
          </p>
        </div>

        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="meta_page_access_token">Meta Page Access Token</Label>
          <Input
            id="meta_page_access_token"
            type="password"
            placeholder="Long-lived Page Access Token"
            {...register("meta_page_access_token")}
          />
          <p className="text-xs text-muted-foreground">
            Long-lived token from Meta for Developers → Tools → Access Token Debugger. Required for Facebook
            auto-posting.
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
