-- Jade lead capture — leads table
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query).
-- Safe to re-run: uses IF NOT EXISTS / idempotent policy creation.

create table if not exists public.leads (
  id bigint generated always as identity primary key,
  name text not null,
  phone text,
  email text,
  service_interest text not null default 'General inquiry',
  conversation_text text,
  source text not null default 'jade_chat',
  created_at timestamptz not null default now()
);

-- Indexes for the admin/Worker reads
create index if not exists idx_leads_created_at on public.leads (created_at desc);
create index if not exists idx_leads_source on public.leads (source);

-- Row Level Security: locked down by default
alter table public.leads enable row level security;

-- Public (anon key) may INSERT leads from the website chat — nothing else.
drop policy if exists "anon_insert_leads" on public.leads;
create policy "anon_insert_leads"
  on public.leads
  for insert
  to anon
  with check (true);

-- Reads/writes for the service_role key (Worker, admin tooling).
-- service_role bypasses RLS by default, so no policy is strictly required,
-- but this documents the intent for authenticated dashboard users.
drop policy if exists "authenticated_read_leads" on public.leads;
create policy "authenticated_read_leads"
  on public.leads
  for select
  to authenticated
  using (true);

-- ------------------------------------------------------------------
-- Cleanup: delete the setup verification row after final QA
-- (inserted by the setup check with source = 'setup_test')
-- ------------------------------------------------------------------
-- delete from public.leads where source = 'setup_test';
