-- Suppression des produits de test temporaires pour éviter les doublons
DELETE FROM public.affiliate_products;

-- Insertion des 9 produits réels d'affiliation Amazon
INSERT INTO public.affiliate_products (
  id,
  name,
  category,
  keywords,
  url,
  image_url,
  description,
  is_premium,
  banana_cost,
  disclosure
) VALUES
(
  '90209df9-34b8-4eb8-b0d6-11f87968532a',
  'Chemise Hawaïenne Homme Funky HISDERN',
  'look-tropical',
  ARRAY['hisdern', 'chemise', 'hawaienne', 'hawaii', 'look', 'style', 'funky', 'aloha', 'vetement', 'vêtement'],
  'https://amzn.to/4f489io',
  'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop&q=80',
  'HISDERN Hommes Funky Hawaïenne Chemises A Manches Courtes Poche Avant Vacances Ete Aloha Imprimé Plage Casual Hawaii Chemise S-2XL — Sélection El Ramon Music Club.',
  false,
  0,
  'Lien partenaire Amazon : le prix reste le même pour toi, et ce lien aide à soutenir le club.'
),
(
  'fa82f4dc-7d04-4c8d-8a5e-bb12e752945d',
  'Chemise Coton Hawaïenne Fleurs Enlision',
  'look-tropical',
  ARRAY['enlision', 'chemise', 'hawaienne', 'hawaii', 'look', 'fleurs', 'aloha', 'vetement', 'vêtement', 'coton'],
  'https://amzn.to/4gpWmNY',
  'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=500&auto=format&fit=crop&q=80',
  'Enlision Chemise cotton Hawaïenne Homme Manches Courtes Chemises à Fleurs Casual Été Imprimé Hawaii de Plage Vacances avec Poche S-4XL — Sélection El Ramon Music Club.',
  false,
  0,
  'Lien partenaire Amazon : le prix reste le même pour toi, et ce lien aide à soutenir le club.'
),
(
  '7b9cde56-6a7f-4b0d-b8d9-2c7891e4ab6d',
  'Chemise Hawaïenne Homme 100% Coton',
  'look-tropical',
  ARRAY['chemise', 'hawaienne', 'hawaii', 'look', 'style', 'coton', 'aloha', 'vetement', 'vêtement'],
  'https://amzn.to/4aFfDHq',
  'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=500&auto=format&fit=crop&q=80',
  'Chemise Hawaïenne Homme 100% Coton — Sélection El Ramon Music Club.',
  false,
  0,
  'Lien partenaire Amazon : le prix reste le même pour toi, et ce lien aide à soutenir le club.'
),
(
  '3a987efc-c820-410a-9d22-124b89e3fca1',
  'Tambour Djembé / Bongo Équitable 30cm',
  'instruments',
  ARRAY['djembe', 'djembé', 'bongo', 'tambour', 'percussion', 'instrument', 'rythme', 'afrique', 'musique', 'music'],
  'https://amzn.to/4vR6Z16',
  'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=500&auto=format&fit=crop&q=80',
  'Djembe drum Bongo drum Hand drum Bush drum Percussion Kinder Fair Trade 30cm — Sélection El Ramon Music Club.',
  false,
  0,
  'Lien partenaire Amazon : le prix reste le même pour toi, et ce lien aide à soutenir le club.'
),
(
  '13c6732b-9769-4957-8546-b9c4b4ecfddd',
  'Sélection Secrète : Shaker Coco & Maracas 🥥',
  'instruments',
  ARRAY['percussion', 'maracas', 'rythme', 'shaker', 'coco', 'instrument', 'secoueur'],
  'https://amzn.to/3z5M94p',
  'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&auto=format&fit=crop&q=80',
  'Débloque la recommandation premium de Ramonito pour rythmer tes morceaux comme dans le jeu !',
  true,
  2,
  'Lien partenaire : le prix reste le même pour toi, et ce lien peut aider à soutenir El Ramon Music Club.'
),
(
  'bd0034a7-8f7d-4c3d-b94f-56ae32ba4cf7',
  'Trompette d’Étudiant Eastar ETR-380 Bb',
  'instruments',
  ARRAY['trompette', 'trumpet', 'eastar', 'cuivre', 'vent', 'instrument', 'musique', 'gold'],
  'https://amzn.to/4wuBdH5',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
  'Eastar ETR-380 Standard Student Trumpet, Gold, Bb — Sélection El Ramon Music Club.',
  true,
  3,
  'Lien partenaire : le prix reste le même pour toi, et ce lien peut aider à soutenir El Ramon Music Club.'
),
(
  'cf87293a-8b9a-4fd6-9c48-2b87e2ba1b9d',
  'Set Ukulélé Soprano Martin Smith 21"',
  'instruments',
  ARRAY['ukulele', 'ukulélé', 'martin smith', 'guitare', 'cordes', 'instrument', 'musique', 'debutant', 'débutant'],
  'https://amzn.to/4wrFAT7',
  'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=500&auto=format&fit=crop&q=80',
  'Martin Smith Ukulélé Soprano 21 Pouces, Set Débutant Acoustique 4 Cordes pour Enfants et Adultes avec Housse et Livre d’Accords, Naturel — Sélection El Ramon Music Club.',
  false,
  0,
  'Lien partenaire Amazon : le prix reste le même pour toi, et ce lien aide à soutenir le club.'
),
(
  'e2ba4fd6-fa7b-489e-bca1-92b874ea3d5f',
  '9 Décorations Oiseaux Tropicaux en Nid d’Abeille',
  'decorations',
  ARRAY['deco', 'déco', 'decoration', 'décoration', 'oiseaux', 'nid', 'fete', 'fête', 'tropicaux', 'nid d’abeille'],
  'https://amzn.to/4pdlpWU',
  'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=500&auto=format&fit=crop&q=80',
  '9 pièces Oiseaux tropicaux Découpages en nid d''abeille — Sélection El Ramon Music Club.',
  false,
  0,
  'Lien partenaire Amazon : le prix reste le même pour toi, et ce lien aide à soutenir le club.'
),
(
  '7ab89cd6-e82a-4bc9-bd24-118ba9ef3dca',
  '32 Colliers Leis Hawaïens de Fête',
  'decorations',
  ARRAY['deco', 'déco', 'decoration', 'décoration', 'colliers', 'fleurs', 'leis', 'hawaïen', 'hawaïens', 'fete', 'fête'],
  'https://amzn.to/4wyrcJ2',
  'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=500&auto=format&fit=crop&q=80',
  '32 Pièces Leis Hawaïens Décorations de Fête — Sélection El Ramon Music Club.',
  false,
  0,
  'Lien partenaire Amazon : le prix reste le même pour toi, et ce lien aide à soutenir le club.'
),
(
  '2bca489e-fa3b-4cd8-bca7-bb32ea7bd45c',
  'Peluche Perroquet Ara Réaliste 25cm',
  'goodies',
  ARRAY['peluche', 'perroquet', 'ara', 'oiseau', 'doudou', 'jouet', 'goodies', 'cadeau'],
  'https://amzn.to/3TlYPPG',
  'https://images.unsplash.com/photo-1522858547137-f1dcec554f55?w=500&auto=format&fit=crop&q=80',
  'Peluche perroquet ara 25 cm — Sélection El Ramon Music Club.',
  true,
  2,
  'Lien partenaire : le prix reste le même pour toi, et ce lien peut aider à soutenir El Ramon Music Club.'
);
