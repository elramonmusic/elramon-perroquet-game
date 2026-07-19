-- 1. Table principale des Bonus (Playlists, Vidéos, Prompts, etc.)
CREATE TABLE IF NOT EXISTS public.bonus_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL, -- Ex: 'Playlist', 'Tutoriel', 'Video'
  url text NOT NULL,
  image_url text,
  is_premium boolean NOT NULL DEFAULT false,
  banana_cost integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Table pour mémoriser quels membres ont débloqué quels bonus
CREATE TABLE IF NOT EXISTS public.bonus_unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bonus_id uuid NOT NULL REFERENCES public.bonus_content(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, bonus_id)
);

-- Indexes pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_bonus_content_active ON public.bonus_content(is_active);
CREATE INDEX IF NOT EXISTS idx_bonus_unlocks_user ON public.bonus_unlocks(user_id);

-- Activer Row Level Security (RLS)
ALTER TABLE public.bonus_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_unlocks ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité (RLS)
-- Tout le monde peut voir les bonus (pour afficher le catalogue)
CREATE POLICY "Les bonus sont visibles par tous les membres" 
ON public.bonus_content FOR SELECT 
TO authenticated 
USING (true);

-- Les membres ne peuvent voir que leurs propres déblocages
CREATE POLICY "Les membres voient leurs propres déblocages" 
ON public.bonus_unlocks FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- L'insertion de déblocages est réservée au Service Role (notre backend Cloudflare API sécurisé)
-- L'admin est géré via le Service Role également, donc pas besoin de politique INSERT/UPDATE publique.

-- Insérer quelques données de démonstration (les Playlists actuelles)
INSERT INTO public.bonus_content (title, description, category, url, image_url, is_premium, banana_cost, is_active)
VALUES 
('Best of Afrobeat 2026', 'Le meilleur de l''Afrobeat : rythmes entraînants et vibes qui bougent.', 'Afrobeat', 'https://www.youtube.com/@El-Ramon-Music', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80', false, 0, true),
('Tropical Soul Essentials', 'Des voix envoûtantes pour les moments de détente sous le soleil.', 'Tropical Soul', 'https://www.youtube.com/@El-Ramon-Music', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80', false, 0, true),
('Zouk & Compas à danser', 'Impossible de rester immobile sur ces rythmes des Caraïbes.', 'Zouk & Compas', 'https://www.youtube.com/@El-Ramon-Music', 'https://images.unsplash.com/photo-1520110120835-c96534a4c984?w=400&q=80', false, 0, true),
('Making-of Secret (Exclusif)', 'Découvre comment je compose mes musiques tropicales dans le studio. Vidéo non-répertoriée !', 'Vidéo VIP', 'https://www.youtube.com/watch?v=rgA6sLPfglY', 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&q=80', true, 50, true);
