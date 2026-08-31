-- ============================================================
-- Correctifs de securite et transactions metier
-- A executer apres les migrations existantes.
-- ============================================================

-- Colonnes de gamification attendues par les fonctions atomiques.
alter table public.members add column if not exists bananas_balance integer not null default 0;
alter table public.members add column if not exists best_score integer not null default 0;
alter table public.members add column if not exists best_level text not null default 'level1';
alter table public.members add column if not exists free_questions_used integer not null default 0;
alter table public.members add column if not exists toucan_defeated boolean not null default false;
alter table public.members add column if not exists singe_maracasse_defeated boolean not null default false;

-- Journal des mouvements de bananes.
create table if not exists public.banana_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null,
  reason text not null,
  type text not null check (type in ('earn', 'spend', 'adjustment')),
  created_at timestamptz not null default now()
);

alter table public.banana_ledger enable row level security;
revoke all on public.banana_ledger from anon, authenticated;

-- Les membres peuvent lire leur profil, mais ne peuvent plus modifier
-- directement les colonnes sensibles (role, solde, scores, etc.).
drop policy if exists "public_insert_members" on public.members;
revoke insert, update, delete on public.members from anon, authenticated;

-- Les formulaires passent exclusivement par les fonctions Cloudflare afin que
-- Turnstile et la limitation de frequence ne puissent pas etre contournes.
drop policy if exists "public_insert_contact" on public.contact_messages;
drop policy if exists "public_insert_collaboration" on public.collaborations;
drop policy if exists "public_insert_collab" on public.collaborations;
revoke insert, update, delete on public.contact_messages from anon, authenticated;
revoke insert, update, delete on public.collaborations from anon, authenticated;

-- La vue contient des e-mails : elle n'est accessible que par le backend.
revoke all on public.member_game_stats from anon, authenticated;

drop policy if exists "self_update_members" on public.members;

create or replace function public.update_own_profile(p_prenom text)
returns public.members
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member public.members;
begin
  if auth.uid() is null then
    raise exception 'Authentification requise';
  end if;

  p_prenom := btrim(coalesce(p_prenom, ''));
  if char_length(p_prenom) < 1 or char_length(p_prenom) > 20 then
    raise exception 'Le prenom doit contenir entre 1 et 20 caracteres';
  end if;

  update public.members
  set prenom = p_prenom
  where id = auth.uid()
  returning * into v_member;

  if not found then
    raise exception 'Profil membre introuvable';
  end if;

  return v_member;
end;
$$;

revoke all on function public.update_own_profile(text) from public, anon;
grant execute on function public.update_own_profile(text) to authenticated;

-- Les deblocages ne peuvent etre crees que par la transaction serveur.
drop policy if exists "Permettre la lecture des produits actifs" on public.affiliate_products;
revoke select on public.affiliate_products from anon, authenticated;
drop policy if exists "Permettre l'insertion par le service-role" on public.affiliate_unlocks;
revoke insert, update, delete on public.affiliate_unlocks from anon, authenticated;
drop policy if exists "Permettre l'insertion des clics" on public.affiliate_clicks;
revoke insert, update, delete on public.affiliate_clicks from anon, authenticated;

-- Identifiants serveur pour l'idempotence des parties.
alter table public.game_scores add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.game_scores add column if not exists run_id uuid;
create unique index if not exists game_scores_user_run_unique
  on public.game_scores(user_id, run_id)
  where user_id is not null and run_id is not null;
create index if not exists game_scores_user_level_idx
  on public.game_scores(user_id, level, score desc);

alter table public.game_scores enable row level security;
revoke insert, update, delete on public.game_scores from anon, authenticated;

-- Enregistrement atomique d'une partie. Les bananes correspondent uniquement
-- a l'amelioration du meilleur score du niveau, ce qui empeche le rejeu lucratif.
create or replace function public.record_game_result(
  p_user_id uuid,
  p_run_id uuid,
  p_score integer,
  p_level text,
  p_fruits_collected integer,
  p_boss_defeated boolean,
  p_lives_remaining integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member public.members%rowtype;
  v_previous_best integer := 0;
  v_earned integer := 0;
  v_badge text := '🦜 Explorateur';
  v_inserted integer := 0;
begin
  if p_user_id is null or p_run_id is null then
    raise exception 'Identifiants de partie manquants';
  end if;
  if p_score < 0 or p_score > 20000 then
    raise exception 'Score invalide';
  end if;
  if p_level not in ('Level1', 'Level2') then
    raise exception 'Niveau invalide';
  end if;
  if p_fruits_collected < 0 or p_fruits_collected > 500
     or p_lives_remaining < 0 or p_lives_remaining > 10 then
    raise exception 'Statistiques de partie invalides';
  end if;

  select * into v_member
  from public.members
  where id = p_user_id
  for update;

  if not found then
    raise exception 'Profil membre introuvable';
  end if;

  if exists (
    select 1 from public.game_scores
    where user_id = p_user_id and run_id = p_run_id
  ) then
    return jsonb_build_object('success', true, 'duplicate', true, 'earnedBananas', 0);
  end if;

  -- Une partie terminee en moins de dix secondes apres la precedente est refusee.
  if exists (
    select 1 from public.game_scores
    where user_id = p_user_id and created_at > now() - interval '10 seconds'
  ) then
    raise exception 'Parties envoyees trop rapidement';
  end if;

  select coalesce(max(score), 0) into v_previous_best
  from public.game_scores
  where user_id = p_user_id and level = p_level;

  v_earned := greatest(0, floor((p_score - v_previous_best) / 100.0)::integer);

  if p_boss_defeated and p_lives_remaining >= 3 then
    v_badge := '🪶 Plume Sauvee';
  elsif p_boss_defeated then
    v_badge := '🌴 Roi de la Jungle';
  elsif p_fruits_collected >= 10 then
    v_badge := '🥭 Bec Fruite';
  end if;

  insert into public.game_scores (
    user_id, run_id, member_email, pseudo, score, level,
    fruits_collected, boss_defeated, lives_remaining, badge
  ) values (
    p_user_id, p_run_id, v_member.email, v_member.pseudo, p_score, p_level,
    p_fruits_collected, p_boss_defeated, p_lives_remaining, v_badge
  )
  on conflict (user_id, run_id) where user_id is not null and run_id is not null do nothing;

  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then
    return jsonb_build_object('success', true, 'duplicate', true, 'earnedBananas', 0);
  end if;

  update public.members
  set bananas_balance = bananas_balance + v_earned,
      best_score = greatest(best_score, p_score),
      best_level = case when lower(best_level) = 'level2' or lower(p_level) = 'level2' then 'level2' else 'level1' end,
      toucan_defeated = toucan_defeated or (p_boss_defeated and p_level = 'Level1'),
      singe_maracasse_defeated = singe_maracasse_defeated or (p_boss_defeated and p_level = 'Level2')
  where id = p_user_id;

  if v_earned > 0 then
    insert into public.banana_ledger(user_id, amount, reason, type)
    values (p_user_id, v_earned, 'Amelioration du meilleur score ' || p_level, 'earn');
  end if;

  return jsonb_build_object(
    'success', true,
    'duplicate', false,
    'badge', v_badge,
    'score', p_score,
    'earnedBananas', v_earned
  );
end;
$$;

revoke all on function public.record_game_result(uuid, uuid, integer, text, integer, boolean, integer)
  from public, anon, authenticated;
grant execute on function public.record_game_result(uuid, uuid, integer, text, integer, boolean, integer)
  to service_role;

-- Debit et deblocage dans une unique transaction avec verrouillage du solde.
create or replace function public.perform_affiliate_unlock(p_user_id uuid, p_product_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member public.members%rowtype;
  v_product public.affiliate_products%rowtype;
  v_new_balance integer;
begin
  select * into v_product
  from public.affiliate_products
  where id = p_product_id and is_active = true;

  if not found then
    return jsonb_build_object('error', 'produit_introuvable', 'message', 'Produit introuvable ou inactif.');
  end if;

  select * into v_member
  from public.members
  where id = p_user_id
  for update;

  if not found then
    return jsonb_build_object('error', 'membre_introuvable', 'message', 'Membre introuvable.');
  end if;

  if not v_product.is_premium or v_product.banana_cost <= 0 then
    return jsonb_build_object(
      'success', true, 'unlocked', true, 'alreadyUnlocked', true,
      'bananasBalance', v_member.bananas_balance, 'url', v_product.url
    );
  end if;

  if exists (
    select 1 from public.affiliate_unlocks
    where user_id = p_user_id and product_id = p_product_id
  ) then
    return jsonb_build_object(
      'success', true, 'unlocked', true, 'alreadyUnlocked', true,
      'bananasBalance', v_member.bananas_balance, 'url', v_product.url
    );
  end if;

  if v_member.bananas_balance < v_product.banana_cost then
    return jsonb_build_object(
      'error', 'solde_insuffisant',
      'message', 'Il te manque quelques bananes. Va jouer pour en gagner.'
    );
  end if;

  v_new_balance := v_member.bananas_balance - v_product.banana_cost;

  update public.members
  set bananas_balance = v_new_balance
  where id = p_user_id;

  insert into public.banana_ledger(user_id, amount, reason, type)
  values (p_user_id, -v_product.banana_cost, 'Recommandation: ' || v_product.name, 'spend');

  insert into public.affiliate_unlocks(user_id, product_id, banana_cost)
  values (p_user_id, p_product_id, v_product.banana_cost);

  return jsonb_build_object(
    'success', true, 'unlocked', true, 'alreadyUnlocked', false,
    'bananasBalance', v_new_balance, 'url', v_product.url
  );
end;
$$;

revoke all on function public.perform_affiliate_unlock(uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.perform_affiliate_unlock(uuid, uuid) to service_role;

-- Consommation atomique d'une question Ramonito.
create or replace function public.consume_ramonito_credit(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member public.members%rowtype;
  v_is_free boolean;
begin
  select * into v_member
  from public.members
  where id = p_user_id
  for update;

  if not found then
    return jsonb_build_object('allowed', false, 'error', 'membre_introuvable');
  end if;

  v_is_free := coalesce(v_member.free_questions_used, 0) < 3;
  if not v_is_free and coalesce(v_member.bananas_balance, 0) < 1 then
    return jsonb_build_object('allowed', false, 'error', 'solde_insuffisant');
  end if;

  if v_is_free then
    update public.members
    set free_questions_used = coalesce(free_questions_used, 0) + 1
    where id = p_user_id
    returning * into v_member;
  else
    update public.members
    set bananas_balance = bananas_balance - 1
    where id = p_user_id
    returning * into v_member;

    insert into public.banana_ledger(user_id, amount, reason, type)
    values (p_user_id, -1, 'Question a Ramonito', 'spend');
  end if;

  return jsonb_build_object(
    'allowed', true,
    'isFree', v_is_free,
    'freeQuestionsUsed', coalesce(v_member.free_questions_used, 0),
    'bananasBalance', coalesce(v_member.bananas_balance, 0)
  );
end;
$$;

revoke all on function public.consume_ramonito_credit(uuid)
  from public, anon, authenticated;
grant execute on function public.consume_ramonito_credit(uuid) to service_role;

-- Limitation de frequence partagee entre toutes les instances Cloudflare.
create table if not exists public.api_rate_limits (
  key_hash text not null,
  action text not null,
  window_started timestamptz not null default now(),
  request_count integer not null default 1,
  primary key (key_hash, action)
);

alter table public.api_rate_limits enable row level security;
revoke all on public.api_rate_limits from anon, authenticated;

create or replace function public.check_rate_limit(
  p_key_hash text,
  p_action text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  if p_limit < 1 or p_window_seconds < 1 then
    return false;
  end if;

  insert into public.api_rate_limits(key_hash, action, window_started, request_count)
  values (p_key_hash, p_action, now(), 1)
  on conflict (key_hash, action) do update
  set window_started = case
        when public.api_rate_limits.window_started <= now() - make_interval(secs => p_window_seconds)
          then now()
        else public.api_rate_limits.window_started
      end,
      request_count = case
        when public.api_rate_limits.window_started <= now() - make_interval(secs => p_window_seconds)
          then 1
        else public.api_rate_limits.request_count + 1
      end
  returning request_count into v_count;

  return v_count <= p_limit;
end;
$$;

revoke all on function public.check_rate_limit(text, text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, text, integer, integer)
  to service_role;
