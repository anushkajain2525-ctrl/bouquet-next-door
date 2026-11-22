-- Bouquet Next Door schema. Run once in Supabase Dashboard -> SQL Editor.
create extension if not exists pgcrypto;

create table if not exists bnd_profiles (
  phone text primary key,
  partner_name text not null default 'her',
  colors text[] not null default '{}',
  favorite_flowers text[] not null default '{}',
  avoid_flowers text[] not null default '{}',
  vibe text not null default 'romantic',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists bnd_bouquets (
  id uuid primary key default gen_random_uuid(),
  phone text not null references bnd_profiles(phone) on delete cascade,
  occasion text not null default 'just because',
  stems jsonb not null,            -- [{id, qty}]
  wrap text not null,
  card_message text not null default '',
  total_inr integer not null,
  season text not null,
  status text not null default 'saved',   -- saved | ordered
  liked boolean,                           -- null = not answered yet
  feedback_note text,
  feedback_asked_at timestamptz,
  feedback_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists bnd_bouquets_phone_idx on bnd_bouquets(phone, created_at desc);

create table if not exists bnd_orders (
  id uuid primary key default gen_random_uuid(),
  bouquet_id uuid not null references bnd_bouquets(id) on delete cascade,
  phone text not null,
  address text not null,
  pincode text not null,
  delivery_date date not null,
  slot text not null,
  total_inr integer not null,
  status text not null default 'requested',
  created_at timestamptz not null default now()
);

-- Only the server (service role) touches these tables.
alter table bnd_profiles enable row level security;
alter table bnd_bouquets enable row level security;
alter table bnd_orders enable row level security;

-- v2: vases
alter table bnd_bouquets add column if not exists vase text not null default 'none';
