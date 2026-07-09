-- ============================================================
-- Mise à jour V2 : Gamification & Monnaie Bananes
-- À exécuter dans Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- 1. Sécurité : s'assurer que la table existe avec la bonne structure
create table if not exists public.game_scores (
  id uuid primary key default gen_random_uuid(),
  member_email text not null,
  pseudo text not null,
  score integer not null default 0,
  level text not null default 'Level1',
  boss_defeated boolean not null default false,
  fruits_collected integer not null default 0,
  lives_remaining integer not null default 0,
  badge text,
  created_at timestamptz not null default now()
);

-- 2. Création de la Vue SQL : member_game_stats
-- Cette vue va analyser toutes les lignes de game_scores pour un joueur.
-- Elle va :
--  - Garder le score maximum pour CHAQUE niveau (Level1, Level2, etc.)
--  - Additionner ces scores (total_score)
--  - Convertir ce total en Bananes (total_score / 100)
--  - Compter combien de boss DIFFÉRENTS ont été vaincus
create or replace view public.member_game_stats as
with max_scores_per_level as (
  select
    member_email,
    pseudo,
    level,
    max(score) as best_score,
    bool_or(boss_defeated) as boss_defeated,
    min(created_at) as first_played
  from public.game_scores
  group by member_email, pseudo, level
)
select 
  member_email,
  pseudo,
  sum(best_score) as total_score,
  floor(sum(best_score) / 100) as total_bananas,
  sum(case when boss_defeated then 1 else 0 end) as bosses_defeated,
  min(first_played) as joined_at
from max_scores_per_level
group by member_email, pseudo;

-- 3. Autoriser l'API REST de Supabase à lire cette vue (anonyme ou non)
grant select on public.member_game_stats to anon, authenticated;

-- ============================================================
-- C'est tout ! Copie tout ce code et exécute-le (bouton "Run").
-- ============================================================
