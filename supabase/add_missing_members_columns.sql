-- ============================================================
-- MIGRATION : Ajout des colonnes de gamification manquantes
-- Table principale : public.members
-- À exécuter dans Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- 1. Ajouter les colonnes de gamification et de chatbot à la table public.members
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS free_questions_used integer DEFAULT 0;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS level1_completed boolean DEFAULT false;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS level2_unlocked boolean DEFAULT false;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS level2_completed boolean DEFAULT false;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS toucan_defeated boolean DEFAULT false;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS singe_maracasse_defeated boolean DEFAULT false;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS tropical_rank text DEFAULT '🌴 Explorateur';

-- 2. Migration des anciennes questions gratuites (si existantes)
-- On convertit free_questions_remaining (de 5 à 0) en free_questions_used (de 0 à 3)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'members' 
      AND column_name = 'free_questions_remaining'
  ) THEN
    UPDATE public.members 
    SET free_questions_used = GREATEST(0, LEAST(3, 3 - free_questions_remaining))
    WHERE free_questions_used = 0;
  END IF;
END $$;

-- 3. Mettre à jour la fonction du trigger de création de compte
-- Elle doit insérer par défaut free_questions_used à 0
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.members (id, email, pseudo, prenom, bananas_balance, free_questions_used, tropical_rank)
  VALUES (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'pseudo', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'prenom', ''),
    0,
    0,
    '🌴 Explorateur'
  )
  ON CONFLICT (email) DO UPDATE
  SET 
    id = excluded.id,
    pseudo = coalesce(excluded.pseudo, public.members.pseudo),
    prenom = coalesce(excluded.prenom, public.members.prenom);
    
  RETURN new;
END;
$$;
