export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  "public": {
    PostgrestVersion: "12";
    Tables: {
      admins: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          password_hash: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          email: string;
          password_hash: string;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          password_hash?: string;
          role?: string;
          created_at?: string;
        };
      };
      residences: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          address: string | null;
          latitude: number | null;
          longitude: number | null;
          facebook_page_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          facebook_page_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          facebook_page_id?: string | null;
          created_at?: string;
        };
      };
      admin_residences: {
        Row: {
          id: string;
          admin_id: string;
          residence_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_id: string;
          residence_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_id?: string;
          residence_id?: string;
          created_at?: string;
        };
      };
      residence_amenities: {
        Row: {
          id: string;
          residence_id: string;
          name: string;
          icon: string | null;
        };
        Insert: {
          id?: string;
          residence_id: string;
          name: string;
          icon?: string | null;
        };
        Update: {
          id?: string;
          residence_id?: string;
          name?: string;
          icon?: string | null;
        };
      };
      residence_inclusions: {
        Row: {
          id: string;
          residence_id: string;
          description: string;
        };
        Insert: {
          id?: string;
          residence_id: string;
          description: string;
        };
        Update: {
          id?: string;
          residence_id?: string;
          description?: string;
        };
      };
      units: {
        Row: {
          id: string;
          residence_id: string;
          name: string;
          unit_type: string;
          floor_location: string | null;
          capacity: number | null;
          price_per_night: number | null;
          description: string | null;
          is_available: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          residence_id: string;
          name: string;
          unit_type?: string;
          floor_location?: string | null;
          capacity?: number | null;
          price_per_night?: number | null;
          description?: string | null;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          residence_id?: string;
          name?: string;
          unit_type?: string;
          floor_location?: string | null;
          capacity?: number | null;
          price_per_night?: number | null;
          description?: string | null;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      unit_images: {
        Row: {
          id: string;
          unit_id: string;
          image_url: string;
          caption: string | null;
          sort_order: number | null;
          is_cover: boolean;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          unit_id: string;
          image_url: string;
          caption?: string | null;
          sort_order?: number | null;
          is_cover?: boolean;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          unit_id?: string;
          image_url?: string;
          caption?: string | null;
          sort_order?: number | null;
          is_cover?: boolean;
          uploaded_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          unit_id: string;
          guest_name: string;
          guest_contact: string | null;
          pax: number | null;
          check_in: string;
          check_out: string;
          total_amount: number | null;
          amount_paid: number | null;
          status: string;
          source: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          unit_id: string;
          guest_name: string;
          guest_contact?: string | null;
          pax?: number | null;
          check_in: string;
          check_out: string;
          total_amount?: number | null;
          amount_paid?: number | null;
          status?: string;
          source?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          unit_id?: string;
          guest_name?: string;
          guest_contact?: string | null;
          pax?: number | null;
          check_in?: string;
          check_out?: string;
          total_amount?: number | null;
          amount_paid?: number | null;
          status?: string;
          source?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      guest_ids: {
        Row: {
          id: string;
          booking_id: string;
          image_url: string;
          id_type: string | null;
          guest_name: string | null;
          uploaded_by: string | null;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          image_url: string;
          id_type?: string | null;
          guest_name?: string | null;
          uploaded_by?: string | null;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          image_url?: string;
          id_type?: string | null;
          guest_name?: string | null;
          uploaded_by?: string | null;
          uploaded_at?: string;
        };
      };
      contract_scans: {
        Row: {
          id: string;
          booking_id: string;
          image_url: string;
          ocr_raw_text: string | null;
          extracted_data: Json | null;
          ocr_status: string;
          scanned_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          image_url: string;
          ocr_raw_text?: string | null;
          extracted_data?: Json | null;
          ocr_status?: string;
          scanned_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          image_url?: string;
          ocr_raw_text?: string | null;
          extracted_data?: Json | null;
          ocr_status?: string;
          scanned_at?: string;
        };
      };
      booking_logs: {
        Row: {
          id: string;
          booking_id: string;
          admin_id: string;
          action: string;
          changes: Json | null;
          logged_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          admin_id: string;
          action: string;
          changes?: Json | null;
          logged_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          admin_id?: string;
          action?: string;
          changes?: Json | null;
          logged_at?: string;
        };
      };
      fb_posts: {
        Row: {
          id: string;
          booking_id: string;
          admin_id: string;
          post_type: string;
          message: string;
          fb_post_id: string | null;
          status: string;
          posted_at: string | null;
        };
        Insert: {
          id?: string;
          booking_id: string;
          admin_id: string;
          post_type: string;
          message: string;
          fb_post_id?: string | null;
          status?: string;
          posted_at?: string | null;
        };
        Update: {
          id?: string;
          booking_id?: string;
          admin_id?: string;
          post_type?: string;
          message?: string;
          fb_post_id?: string | null;
          status?: string;
          posted_at?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
