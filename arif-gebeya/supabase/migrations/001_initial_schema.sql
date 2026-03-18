-- ─── Extensions ───────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Profiles ──────────────────────────────────────────────────────────────────
create table public.profiles (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  full_name    text not null default '',
  phone        text,
  phone_verified boolean not null default false,
  city         text,
  avatar_url   text,
  bio          text,
  is_verified  boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique(user_id)
);

-- ─── Categories ────────────────────────────────────────────────────────────────
create table public.categories (
  id    serial primary key,
  slug  text not null unique,
  label text not null,
  emoji text not null,
  sort_order int not null default 0
);

insert into public.categories (slug, label, emoji, sort_order) values
  ('phones',      'Phones & Tablets',  '📱', 1),
  ('electronics', 'Electronics',       '💻', 2),
  ('cars',        'Cars & Vehicles',   '🚗', 3),
  ('fashion',     'Fashion',           '👗', 4),
  ('property',    'Property & Rentals','🏠', 5),
  ('furniture',   'Furniture & Home',  '🛋️', 6),
  ('jobs',        'Jobs',              '💼', 7),
  ('other',       'Other',             '📦', 8);

-- ─── Ethiopian cities ───────────────────────────────────────────────────────────
create table public.cities (
  id    serial primary key,
  name  text not null unique,
  country text not null default 'Ethiopia'
);

insert into public.cities (name, country) values
  ('Addis Ababa',  'Ethiopia'),
  ('Dire Dawa',    'Ethiopia'),
  ('Mekelle',      'Ethiopia'),
  ('Gondar',       'Ethiopia'),
  ('Adama',        'Ethiopia'),
  ('Hawassa',      'Ethiopia'),
  ('Bahir Dar',    'Ethiopia'),
  ('Jimma',        'Ethiopia'),
  ('Dessie',       'Ethiopia'),
  ('Jijiga',       'Ethiopia'),
  -- Diaspora US cities
  ('Washington DC','USA'),
  ('Minneapolis',  'USA'),
  ('Atlanta',      'USA'),
  ('Seattle',      'USA'),
  ('Dallas',       'USA'),
  ('Los Angeles',  'USA'),
  ('New York',     'USA'),
  ('Columbus',     'USA'),
  ('Houston',      'USA'),
  ('Denver',       'USA');

-- ─── Listings ──────────────────────────────────────────────────────────────────
create table public.listings (
  id           uuid primary key default uuid_generate_v4(),
  seller_id    uuid not null references auth.users(id) on delete cascade,
  title        text not null,
  description  text not null,
  price        numeric(12,2),
  price_type   text not null default 'fixed' check (price_type in ('fixed','negotiable','free')),
  currency     text not null default 'ETB' check (currency in ('ETB','USD')),
  category_slug text not null references public.categories(slug),
  city         text not null,
  condition    text not null default 'used' check (condition in ('new','used','refurbished')),
  images       text[] not null default '{}',
  contact_phone text,
  contact_whatsapp text,
  is_active    boolean not null default true,
  is_featured  boolean not null default false,
  is_reported  boolean not null default false,
  view_count   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ─── Reports ───────────────────────────────────────────────────────────────────
create table public.reports (
  id         uuid primary key default uuid_generate_v4(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  reporter_id uuid references auth.users(id) on delete set null,
  reason     text not null,
  created_at timestamptz not null default now()
);

-- ─── Saved / Wishlist ──────────────────────────────────────────────────────────
create table public.saved_listings (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, listing_id)
);

-- ─── Updated-at trigger ────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger trg_listings_updated  before update on public.listings  for each row execute function public.set_updated_at();
create trigger trg_profiles_updated  before update on public.profiles  for each row execute function public.set_updated_at();

-- ─── Auto-create profile ───────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (user_id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Increment view count ──────────────────────────────────────────────────────
create or replace function public.increment_view_count(listing_id uuid)
returns void language sql security definer as $$
  update public.listings set view_count = view_count + 1 where id = listing_id;
$$;

-- ─── RLS ───────────────────────────────────────────────────────────────────────
alter table public.profiles       enable row level security;
alter table public.listings       enable row level security;
alter table public.reports        enable row level security;
alter table public.saved_listings enable row level security;
alter table public.categories     enable row level security;
alter table public.cities         enable row level security;

-- profiles
create policy "public read profiles"    on public.profiles for select using (true);
create policy "owner update profile"    on public.profiles for update using (auth.uid() = user_id);
create policy "owner insert profile"    on public.profiles for insert with check (auth.uid() = user_id);

-- listings
create policy "public read active listings"  on public.listings for select using (is_active = true or seller_id = auth.uid());
create policy "auth insert listing"          on public.listings for insert with check (auth.uid() = seller_id);
create policy "owner update listing"         on public.listings for update using (auth.uid() = seller_id);
create policy "owner delete listing"         on public.listings for delete using (auth.uid() = seller_id);

-- saved
create policy "owner read saved"   on public.saved_listings for select using (auth.uid() = user_id);
create policy "owner insert saved" on public.saved_listings for insert with check (auth.uid() = user_id);
create policy "owner delete saved" on public.saved_listings for delete using (auth.uid() = user_id);

-- reports
create policy "auth insert report" on public.reports for insert with check (auth.uid() = reporter_id);

-- public read cats/cities
create policy "public read categories" on public.categories for select using (true);
create policy "public read cities"     on public.cities     for select using (true);

-- ─── Storage bucket ────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public) values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

create policy "public read listing images"
  on storage.objects for select using (bucket_id = 'listing-images');

create policy "auth upload listing images"
  on storage.objects for insert
  with check (bucket_id = 'listing-images' and auth.role() = 'authenticated');

create policy "owner delete listing images"
  on storage.objects for delete
  using (bucket_id = 'listing-images' and auth.uid()::text = (storage.foldername(name))[1]);
