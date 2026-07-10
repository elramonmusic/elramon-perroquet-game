-- ============================================================
-- SQL: Création de la table download_logs
-- À exécuter dans Supabase Dashboard → SQL Editor → New query
-- ============================================================

create table if not exists public.download_logs (
  id uuid primary key default gen_random_uuid(),
  member_email text not null,
  file_key text not null,
  ip_hash text,
  user_agent_hash text,
  created_at timestamptz not null default now()
);

-- RLS (Row Level Security)
alter table public.download_logs enable row level security;

-- Seule la clé de service (service_role) peut lire/écrire dans cette table
create policy "Service Role can do everything on download_logs"
  on public.download_logs
  for all
  using (true)
  with check (true);
