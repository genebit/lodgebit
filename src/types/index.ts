export type { Database } from "./database";

import type { Database } from "./database";

export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type BookingInsert = Database["public"]["Tables"]["bookings"]["Insert"];
export type BookingUpdate = Database["public"]["Tables"]["bookings"]["Update"];
export type Unit = Database["public"]["Tables"]["units"]["Row"];
export type UnitInsert = Database["public"]["Tables"]["units"]["Insert"];
export type Residence = Database["public"]["Tables"]["residences"]["Row"];
export type ResidenceInsert = Database["public"]["Tables"]["residences"]["Insert"];
export type Admin = Database["public"]["Tables"]["admins"]["Row"];
export type GuestId = Database["public"]["Tables"]["guest_ids"]["Row"];
export type ContractScan = Database["public"]["Tables"]["contract_scans"]["Row"];
export type BookingLog = Database["public"]["Tables"]["booking_logs"]["Row"];
export type FbPost = Database["public"]["Tables"]["fb_posts"]["Row"];
export type UnitImage = Database["public"]["Tables"]["unit_images"]["Row"];
export type ResidenceAmenity = Database["public"]["Tables"]["residence_amenities"]["Row"];
export type ResidenceInclusion = Database["public"]["Tables"]["residence_inclusions"]["Row"];

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type BookingSource = "manual" | "ocr";
export type OcrStatus = "pending" | "success" | "failed";
export type FbPostStatus = "pending" | "posted" | "failed";
export type AdminRole = "admin" | "super_admin";
export type IdType = "passport" | "drivers_license" | "national_id" | "other";
export type UnitType = "room" | "suite" | "cottage" | "villa" | "other";
export type FbPostType = "new_booking" | "cancellation" | "update";

export interface OcrExtractedData {
  guest_name?: string;
  check_in?: string;
  check_out?: string;
  pax?: number;
  total_amount?: number;
  guest_contact?: string;
  notes?: string;
}

export type BookingWithUnit = Booking & {
  units: Pick<Unit, "id" | "name" | "residence_id"> | null;
};

export type ResidenceWithDetails = Residence & {
  residence_amenities: ResidenceAmenity[];
  residence_inclusions: ResidenceInclusion[];
};
