-- ============================================================
-- FIX: Création automatique du profil Supabase
-- À exécuter dans Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- 1. On s'assure que la table profiles est bien structurée au cas où
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  pseudo text,
  prenom text,
  bananas_balance integer default 0,
  best_score integer default 0,
  best_level text default 'Level1',
  free_questions_remaining integer default 5,
  created_at timestamptz default now()
);

-- 2. Fonction qui sera appelée à chaque inscription
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, pseudo, prenom, bananas_balance, free_questions_remaining)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'pseudo', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'prenom', ''),
    0,
    5
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 3. Attacher la fonction à la table système auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Rattrapage (Backfill) pour les membres déjà inscrits sans profil !
insert into public.profiles (id, email, pseudo, bananas_balance, free_questions_remaining)
select id, email, coalesce(raw_user_meta_data->>'pseudo', split_part(email, '@', 1)), 0, 5
from auth.users
where id not in (select id from public.profiles);

-- ============================================================
-- FIN — Clique sur "Run" en bas à droite !
-- ============================================================
