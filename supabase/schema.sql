-- Latte & Love Stories — Link-in-bio schema for Supabase (Postgres + Auth + Storage)
-- Run in Supabase SQL Editor after creating a project.

-- -----------------------------------------------------------------------------
-- Extensions
-- -----------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Users mirror (extends auth.users)
-- -----------------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Profiles
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade unique,
  username text not null unique,
  display_name text,
  bio text,
  avatar_url text,
  theme jsonb not null default '{}'::jsonb,
  instagram_url text,
  youtube_url text,
  tiktok_url text,
  website_url text,
  contact_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint username_lowercase check (username = lower(username))
);

create index if not exists profiles_username_idx on public.profiles (username);

-- -----------------------------------------------------------------------------
-- Links
-- -----------------------------------------------------------------------------
create table if not exists public.links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  url text not null,
  icon text,
  position integer not null default 0,
  is_active boolean not null default true,
  is_highlighted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists links_profile_position_idx on public.links (profile_id, position);

-- -----------------------------------------------------------------------------
-- updated_at helpers
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_public_users_updated_at on public.users;
create trigger set_public_users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_links_updated_at on public.links;
create trigger set_links_updated_at
  before update on public.links
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.links enable row level security;

drop policy if exists "Users read own row" on public.users;
create policy "Users read own row"
  on public.users for select
  using (auth.uid() = id);

drop policy if exists "Profiles are public read" on public.profiles;
create policy "Profiles are public read"
  on public.profiles for select
  using (true);

drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

drop policy if exists "Links are public read" on public.links;
create policy "Links are public read"
  on public.links for select
  using (true);

drop policy if exists "Owners insert links" on public.links;
create policy "Owners insert links"
  on public.links for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = profile_id and p.user_id = auth.uid()
    )
  );

drop policy if exists "Owners update links" on public.links;
create policy "Owners update links"
  on public.links for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = profile_id and p.user_id = auth.uid()
    )
  );

drop policy if exists "Owners delete links" on public.links;
create policy "Owners delete links"
  on public.links for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = profile_id and p.user_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- Storage: avatars bucket (create bucket in Dashboard → Storage, name: avatars, public)
-- After creating the bucket, run the policies below.
-- -----------------------------------------------------------------------------

-- Policy notes (run after bucket exists):
-- See supabase/storage-policies.sql or README for Storage SQL.
