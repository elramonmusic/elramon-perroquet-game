-- ============================================================
-- El Ramon Music Club — Schéma Supabase
-- À exécuter dans Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
create extension if not exists "pgcrypto";

-- ============================================================
-- TABLE : members (inscriptions au Club)
-- ============================================================
create table if not exists public.members (
  id           uuid primary key default gen_random_uuid(),
  email        text not null unique,
  pseudo       text not null,
  prenom       text default '',
  role         text not null default 'member' check (role in ('visitor','member','premium','partner','admin')),
  newsletter   boolean default false,
  abonne       boolean default false,
  source       text default 'elramon-music-club',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.members is 'Membres inscrits au El Ramon Music Club';

-- ============================================================
-- TABLE : contact_messages (formulaire de contact)
-- ============================================================
create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  nom         text not null,
  email       text not null,
  sujet       text,
  message     text not null,
  status      text not null default 'nouveau' check (status in ('nouveau','lu','traite','archive')),
  ip          text,
  created_at  timestamptz not null default now()
);

comment on table public.contact_messages is 'Messages reçus via le formulaire de contact';

-- ============================================================
-- TABLE : collaborations (demandes pro)
-- ============================================================
create table if not exists public.collaborations (
  id           uuid primary key default gen_random_uuid(),
  company      text not null,
  contact_name text,
  email        text not null,
  website      text,
  collab_type  text,
  product      text,
  budget       text,
  message      text not null,
  status       text not null default 'nouveau' check (status in ('nouveau','en_cours','accepte','refuse','archive')),
  ip           text,
  created_at   timestamptz not null default now()
);

comment on table public.collaborations is 'Demandes de collaboration commerciale';

-- ============================================================
-- INDEX (performance)
-- ============================================================
create index if not exists idx_members_email     on public.members (lower(email));
create index if not exists idx_members_role      on public.members (role);
create index if not exists idx_members_created   on public.members (created_at desc);

create index if not exists idx_contact_status    on public.contact_messages (status);
create index if not exists idx_contact_created   on public.contact_messages (created_at desc);

create index if not exists idx_collab_status     on public.collaborations (status);
create index if not exists idx_collab_created    on public.collaborations (created_at desc);

-- ============================================================
-- UPDATED_AT (rafraîchit automatiquement members.updated_at)
-- ============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_members_updated on public.members;
create trigger trg_members_updated
  before update on public.members
  for each row execute function public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
alter table public.members           enable row level security;
alter table public.contact_messages  enable row level security;
alter table public.collaborations    enable row level security;

-- ---- members ----
-- Le public (anonyme) peut S'INSCRIRE (insert) mais ne rien lire ni modifier.
drop policy if exists "public_insert_members" on public.members;
create policy "public_insert_members"
  on public.members for insert
  to anon, authenticated
  with check (true);

-- Un membre authentifié peut lire SA propre ligne (par email).
drop policy if exists "self_select_members" on public.members;
create policy "self_select_members"
  on public.members for select
  to authenticated
  using (auth.email() = email);

-- ---- contact_messages ----
-- Le public peut déposer un message, mais ne rien lire.
drop policy if exists "public_insert_contact" on public.contact_messages;
create policy "public_insert_contact"
  on public.contact_messages for insert
  to anon, authenticated
  with check (true);

-- ---- collaborations ----
-- Le public peut déposer une demande, mais ne rien lire.
drop policy if exists "public_insert_collab" on public.collaborations;
create policy "public_insert_collab"
  on public.collaborations for insert
  to anon, authenticated
  with check (true);

-- ============================================================
-- FIN — Schéma prêt.
-- Les clés (SUPABASE_URL, ANON_KEY côté front / SERVICE_KEY
-- côté serveur) se configurent séparément.
-- ============================================================
