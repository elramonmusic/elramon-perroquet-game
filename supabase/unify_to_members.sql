-- ============================================================
-- MIGRATION : Unification vers une seule table public.members
-- À exécuter dans Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- 1. Ajouter les colonnes de gamification et de chatbot à la table public.members
alter table public.members add column if not exists bananas_balance integer default 0;
alter table public.members add column if not exists best_score integer default 0;
alter table public.members add column if not exists best_level text default 'level1';
alter table public.members add column if not exists free_questions_remaining integer default 5;

-- 2. Copier les données existantes de profiles vers members (s'il y en a)
update public.members m
set 
  bananas_balance = coalesce(p.bananas_balance, m.bananas_balance),
  best_score = coalesce(p.best_score, m.best_score),
  best_level = coalesce(p.best_level, m.best_level),
  free_questions_remaining = coalesce(p.free_questions_remaining, m.free_questions_remaining)
from public.profiles p
where m.email = p.email or m.id = p.id;

-- 3. Mettre à jour la fonction du trigger de création de compte
-- Elle doit insérer/mettre à jour directement dans public.members
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Upsert dans public.members pour gérer les pré-inscriptions (via le formulaire d'inscription)
  insert into public.members (id, email, pseudo, prenom, bananas_balance, free_questions_remaining)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'pseudo', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'prenom', ''),
    0,
    5
  )
  on conflict (email) do update
  set 
    id = excluded.id,
    pseudo = coalesce(excluded.pseudo, public.members.pseudo),
    prenom = coalesce(excluded.prenom, public.members.prenom);
    
  return new;
end;
$$;

-- 4. Re-lier le trigger sur auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Rattraper les ID des membres existants dans auth.users
update public.members m
set id = u.id
from auth.users u
where lower(m.email) = lower(u.email);

-- 6. Configurer la sécurité RLS sur la table members
-- Rendre la table lissable et modifiable par le membre authentifié
drop policy if exists "self_select_members" on public.members;
create policy "self_select_members"
  on public.members for select
  to authenticated
  using (auth.uid() = id or lower(auth.email()) = lower(email));

drop policy if exists "self_update_members" on public.members;
create policy "self_update_members"
  on public.members for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 7. Nettoyage final : Supprimer la table profiles obsolète
drop table if exists public.profiles cascade;
