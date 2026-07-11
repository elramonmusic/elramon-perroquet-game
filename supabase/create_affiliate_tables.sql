-- Table des produits d'affiliation
CREATE TABLE IF NOT EXISTS public.affiliate_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  keywords text[] NOT NULL DEFAULT '{}',
  url text NOT NULL,
  image_url text,
  description text,
  is_premium boolean NOT NULL DEFAULT false,
  banana_cost integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  priority integer NOT NULL DEFAULT 0,
  disclosure text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index sur les mots-clés et l'état actif pour des recherches ultra-rapides
CREATE INDEX IF NOT EXISTS idx_affiliate_products_keywords ON public.affiliate_products USING gin(keywords);
CREATE INDEX IF NOT EXISTS idx_affiliate_products_active ON public.affiliate_products(is_active);

-- Table des déblocages de produits premium
CREATE TABLE IF NOT EXISTS public.affiliate_unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.affiliate_products(id) ON DELETE CASCADE,
  banana_cost integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT affiliate_unlocks_user_product_unique UNIQUE(user_id, product_id)
);

-- Table des clics d'affiliation pour les statistiques
CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  product_id uuid NOT NULL REFERENCES public.affiliate_products(id) ON DELETE CASCADE,
  source text,
  created_at timestamptz DEFAULT now()
);

-- Activer la RLS sur toutes ces nouvelles tables
ALTER TABLE public.affiliate_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité (RLS) pour public.affiliate_products
CREATE POLICY "Permettre la lecture des produits actifs" ON public.affiliate_products
  FOR SELECT TO authenticated USING (is_active = true);

-- Politiques pour public.affiliate_unlocks : l'utilisateur ne peut lire que ses propres déblocages
CREATE POLICY "Permettre la lecture de ses propres déblocages" ON public.affiliate_unlocks
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Permettre l'insertion par le service-role" ON public.affiliate_unlocks
  FOR INSERT WITH CHECK (true);

-- Politiques pour public.affiliate_clicks : insertion autorisée pour tous
CREATE POLICY "Permettre l'insertion des clics" ON public.affiliate_clicks
  FOR INSERT WITH CHECK (true);

-- Insertion de quelques produits de départ pour animer le club
INSERT INTO public.affiliate_products (name, category, keywords, url, image_url, description, is_premium, banana_cost, priority, disclosure) VALUES
('Ukulélé Concert Tropical 🌺', 'instruments', ARRAY['ukulélé', 'ukulele', 'guitare', 'instrument', 'jouer', 'débuter'], 'https://amzn.to/3y4K8hJ', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=300&q=80', 'Un ukulélé parfait pour accompagner tes chansons ensoleillées ! Son de qualité et look exotique.', false, 0, 10, 'Lien partenaire : le prix reste le même pour toi, et ce lien peut aider à soutenir El Ramon Music Club et les projets Gard Eau Arbres.'),
('Guitare Classique de Voyage ✈️', 'instruments', ARRAY['guitare', 'guitar', 'instrument', 'jouer', 'accords', 'tablature'], 'https://amzn.to/3x2L8hK', 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=300&q=80', 'Une superbe guitare compacte idéale pour les feux de camp et les plages tropicales.', false, 0, 5, 'Lien partenaire : le prix reste le même pour toi, et ce lien peut aider à soutenir El Ramon Music Club et les projets Gard Eau Arbres.'),
('Sélection Secrète : Shaker Coco & Maracas 🥥', 'instruments', ARRAY['percussion', 'maracas', 'rythme', 'shaker', 'tambour', 'toucan', 'singe'], 'https://amzn.to/3z5M9hL', 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=300&q=80', 'Débloque la recommandation premium de Ramonito pour rythmer tes morceaux comme dans le jeu !', true, 2, 20, 'Lien partenaire : le prix reste le même pour toi, et ce lien peut aider à soutenir El Ramon Music Club et les projets Gard Eau Arbres.'),
('Look Tropical : Chemise Hawaïenne Perroquet 🦜', 'look-tropical', ARRAY['look', 'style', 'chemise', 'vêtement', 'habiller', 'décoration', 'fête'], 'https://amzn.to/3w3N0hM', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=300&q=80', 'Adopte le style officiel du club avec cette chemise hawaïenne aux motifs de perroquet ensoleillés.', false, 0, 8, 'Lien partenaire : le prix reste le même pour toi, et ce lien peut aider à soutenir El Ramon Music Club et les projets Gard Eau Arbres.');
