-- ============================================================
-- Transient Residence Booking Management App
-- Supabase Migration Script
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";


-- ============================================================
-- ADMINS
-- ============================================================
create table admins (
  id uuid primary key default gen_random_uuid(),
  full_name varchar not null,
  email varchar unique not null,
  password_hash varchar not null,
  role varchar not null default 'admin' check (role in ('admin', 'super_admin')),
  created_at timestamp with time zone default now()
);

comment on table admins is 'Landlords and admin users of the system';
comment on column admins.role is 'admin | super_admin';


-- ============================================================
-- RESIDENCES
-- ============================================================
create table residences (
  id uuid primary key default gen_random_uuid(),
  name varchar not null,
  description text,
  address varchar,
  latitude decimal(9,6),
  longitude decimal(9,6),
  facebook_page_id varchar,
  created_at timestamp with time zone default now()
);

comment on table residences is 'Transient residence properties';
comment on column residences.latitude is 'GPS latitude for map pin';
comment on column residences.longitude is 'GPS longitude for map pin';
comment on column residences.facebook_page_id is 'Meta page ID for auto-posting';


-- ============================================================
-- ADMIN RESIDENCES (Junction Table)
-- ============================================================
create table admin_residences (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references admins(id) on delete cascade,
  residence_id uuid not null references residences(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(admin_id, residence_id)
);

comment on table admin_residences is 'Junction table — one admin can manage many residences';


-- ============================================================
-- RESIDENCE AMENITIES
-- ============================================================
create table residence_amenities (
  id uuid primary key default gen_random_uuid(),
  residence_id uuid not null references residences(id) on delete cascade,
  name varchar not null,
  icon varchar
);

comment on table residence_amenities is 'Amenities available at a residence';
comment on column residence_amenities.icon is 'Icon name or URL';


-- ============================================================
-- RESIDENCE INCLUSIONS
-- ============================================================
create table residence_inclusions (
  id uuid primary key default gen_random_uuid(),
  residence_id uuid not null references residences(id) on delete cascade,
  description text not null
);

comment on table residence_inclusions is 'What is included in a stay at the residence';


-- ============================================================
-- UNITS
-- ============================================================
create table units (
  id uuid primary key default gen_random_uuid(),
  residence_id uuid not null references residences(id) on delete cascade,
  name varchar not null,
  unit_type varchar not null check (unit_type in ('room', 'suite', 'cottage', 'villa', 'other')),
  floor_location varchar,
  capacity int not null default 1,
  price_per_night decimal(10,2) not null,
  description text,
  is_available boolean not null default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

comment on table units is 'Individual bookable units within a residence';
comment on column units.unit_type is 'room | suite | cottage | villa | other';
comment on column units.floor_location is 'e.g. Ground Floor, Building B, East Wing';
comment on column units.capacity is 'Maximum number of guests allowed';
comment on column units.is_available is 'Set to false to hide unit without deleting it';


-- ============================================================
-- UNIT IMAGES
-- ============================================================
create table unit_images (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references units(id) on delete cascade,
  image_url varchar not null,
  caption varchar,
  sort_order int not null default 0,
  is_cover boolean not null default false,
  uploaded_at timestamp with time zone default now()
);

comment on table unit_images is 'Gallery images for each unit';
comment on column unit_images.image_url is 'Supabase Storage URL';
comment on column unit_images.sort_order is 'Order of images in gallery, ascending';
comment on column unit_images.is_cover is 'True = main display image for the unit';


-- ============================================================
-- BOOKINGS
-- ============================================================
create table bookings (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references units(id) on delete restrict,
  guest_name varchar not null,
  guest_contact varchar,
  pax int not null default 1,
  check_in date not null,
  check_out date not null,
  total_amount decimal(10,2),
  amount_paid decimal(10,2) default 0,
  status varchar not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  source varchar not null default 'manual' check (source in ('manual', 'ocr')),
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint check_dates check (check_out > check_in),
  constraint check_pax check (pax > 0)
);

comment on table bookings is 'Guest bookings per unit';
comment on column bookings.status is 'pending | confirmed | completed | cancelled';
comment on column bookings.source is 'manual = encoded by admin | ocr = scanned from contract';


-- ============================================================
-- GUEST IDs
-- ============================================================
create table guest_ids (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  image_url varchar not null,
  id_type varchar check (id_type in ('passport', 'drivers_license', 'national_id', 'other')),
  guest_name varchar,
  uploaded_by uuid not null references admins(id) on delete restrict,
  uploaded_at timestamp with time zone default now()
);

comment on table guest_ids is 'Valid ID uploads per booking for guest verification';
comment on column guest_ids.image_url is 'Supabase Storage URL — restrict access via RLS';
comment on column guest_ids.id_type is 'passport | drivers_license | national_id | other';
comment on column guest_ids.guest_name is 'Name as it appears on the ID';
comment on column guest_ids.uploaded_by is 'Admin who uploaded the ID';


-- ============================================================
-- CONTRACT SCANS
-- ============================================================
create table contract_scans (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  image_url varchar not null,
  ocr_raw_text text,
  extracted_data jsonb,
  ocr_status varchar not null default 'pending' check (ocr_status in ('pending', 'success', 'failed')),
  scanned_at timestamp with time zone default now()
);

comment on table contract_scans is 'OCR scans of signed booking contracts';
comment on column contract_scans.image_url is 'Supabase Storage URL';
comment on column contract_scans.ocr_raw_text is 'Raw text output from Google Cloud Vision';
comment on column contract_scans.extracted_data is 'Parsed structured fields from OCR result';
comment on column contract_scans.ocr_status is 'pending | success | failed';


-- ============================================================
-- BOOKING LOGS
-- ============================================================
create table booking_logs (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  admin_id uuid not null references admins(id) on delete restrict,
  action varchar not null check (action in ('created', 'updated', 'confirmed', 'cancelled', 'deleted')),
  changes jsonb,
  logged_at timestamp with time zone default now()
);

comment on table booking_logs is 'Audit trail of all actions performed on bookings';
comment on column booking_logs.changes is 'JSON snapshot of before/after values on update';


-- ============================================================
-- FACEBOOK POSTS
-- ============================================================
create table fb_posts (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  admin_id uuid not null references admins(id) on delete restrict,
  post_type varchar not null check (post_type in ('new_booking', 'cancellation', 'update')),
  message text not null,
  fb_post_id varchar,
  status varchar not null default 'pending' check (status in ('pending', 'posted', 'failed')),
  posted_at timestamp with time zone
);

comment on table fb_posts is 'Facebook posts generated per booking event';
comment on column fb_posts.fb_post_id is 'Post ID returned from Meta Graph API';
comment on column fb_posts.status is 'pending | posted | failed';


-- ============================================================
-- INDEXES
-- ============================================================

-- Admins
create index idx_admin_residences_admin_id on admin_residences(admin_id);
create index idx_admin_residences_residence_id on admin_residences(residence_id);

-- Units
create index idx_units_residence_id on units(residence_id);
create index idx_units_is_available on units(is_available);
create index idx_unit_images_unit_id on unit_images(unit_id);

-- Bookings
create index idx_bookings_unit_id on bookings(unit_id);
create index idx_bookings_status on bookings(status);
create index idx_bookings_check_in on bookings(check_in);
create index idx_bookings_check_out on bookings(check_out);

-- Guest IDs & Scans
create index idx_guest_ids_booking_id on guest_ids(booking_id);
create index idx_contract_scans_booking_id on contract_scans(booking_id);
create index idx_contract_scans_ocr_status on contract_scans(ocr_status);

-- Logs & Posts
create index idx_booking_logs_booking_id on booking_logs(booking_id);
create index idx_booking_logs_admin_id on booking_logs(admin_id);
create index idx_fb_posts_booking_id on fb_posts(booking_id);
create index idx_fb_posts_status on fb_posts(status);


-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_units_updated_at
  before update on units
  for each row execute function update_updated_at();

create trigger trg_bookings_updated_at
  before update on bookings
  for each row execute function update_updated_at();


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on sensitive tables
alter table admins enable row level security;
alter table guest_ids enable row level security;
alter table contract_scans enable row level security;
alter table booking_logs enable row level security;

-- Admins can only see their own record
create policy "Admins can view own record"
  on admins for select
  using (auth.uid() = id);

-- Only admins of the residence can view guest IDs
create policy "Admins can view guest IDs of their residences"
  on guest_ids for select
  using (
    exists (
      select 1 from bookings b
      join units u on u.id = b.unit_id
      join admin_residences ar on ar.residence_id = u.residence_id
      where b.id = guest_ids.booking_id
        and ar.admin_id = auth.uid()
    )
  );

-- Only admins of the residence can view contract scans
create policy "Admins can view contract scans of their residences"
  on contract_scans for select
  using (
    exists (
      select 1 from bookings b
      join units u on u.id = b.unit_id
      join admin_residences ar on ar.residence_id = u.residence_id
      where b.id = contract_scans.booking_id
        and ar.admin_id = auth.uid()
    )
  );

-- Only admins of the residence can view booking logs
create policy "Admins can view booking logs of their residences"
  on booking_logs for select
  using (
    exists (
      select 1 from bookings b
      join units u on u.id = b.unit_id
      join admin_residences ar on ar.residence_id = u.residence_id
      where b.id = booking_logs.booking_id
        and ar.admin_id = auth.uid()
    )
  );
