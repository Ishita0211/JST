-- ============================================================
-- JalSetu — Supabase SQL Setup
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Create the orders table
create table if not exists public.orders (
  id          bigint generated always as identity primary key,
  name        text        not null,
  phone       text        not null,
  address     text        not null,
  quantity    text        not null check (quantity in ('20L', '40L')),
  floor       text        not null,
  status      text        not null default 'pending'
                check (status in ('pending', 'accepted', 'delivered')),
  created_at  timestamptz not null default now()
);

-- 2. Enable Row Level Security (RLS)
alter table public.orders enable row level security;

-- 3. Allow anyone to INSERT (customers placing orders)
create policy "Anyone can place an order"
  on public.orders
  for insert
  to anon, authenticated
  with check (true);

-- 4. Allow anyone to SELECT (vendor viewing orders)
create policy "Anyone can view orders"
  on public.orders
  for select
  to anon, authenticated
  using (true);

-- 5. Allow anyone to UPDATE (vendor accepting / delivering)
create policy "Anyone can update orders"
  on public.orders
  for update
  to anon, authenticated
  using (true)
  with check (true);

-- 6. Enable Realtime on the orders table
-- (Do this in Supabase Dashboard → Database → Replication → Tables → toggle orders ON)
-- Or run:
alter publication supabase_realtime add table public.orders;
