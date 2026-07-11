-- ============================================================
-- MIGRATION : Architecture de Gamification et Chatbot Unifiée
-- Table principale : public.members
-- À exécuter dans Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- 1. S'assurer que la contrainte UNIQUE sur l'email est présente
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_type = 'UNIQUE' 
      AND table_name = 'members' 
      AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.members ADD CONSTRAINT members_email_key UNIQUE (email);
  END IF;
END $$;

-- 2. Ajouter les colonnes de gamification et de chatbot à la table public.members
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS bananas_balance integer DEFAULT 0;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS best_score integer DEFAULT 0;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS best_level text DEFAULT 'level1';
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS free_questions_used integer DEFAULT 0;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS level1_completed boolean DEFAULT false;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS level2_unlocked boolean DEFAULT false;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS level2_completed boolean DEFAULT false;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS toucan_defeated boolean DEFAULT false;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS singe_maracasse_defeated boolean DEFAULT false;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS tropical_rank text DEFAULT '🌴 Explorateur';

-- 3. Migration des anciennes questions gratuites (si existantes)
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

-- 4. Mettre à jour la fonction du trigger de création de compte
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

-- 5. Re-lier/Créer proprement le trigger sur auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
