-- Base de connaissance canonique de Ramonito.
-- Migration additive et réexécutable : aucune donnée existante n'est supprimée.

create table if not exists public.agent_knowledge (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null,
  content text not null,
  canonical_url text,
  keywords text[] not null default '{}',
  access_level text not null default 'public' check (access_level in ('public', 'member', 'admin')),
  priority integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_agent_knowledge_active_priority
  on public.agent_knowledge (is_active, priority desc);
create index if not exists idx_agent_knowledge_keywords
  on public.agent_knowledge using gin (keywords);

alter table public.agent_knowledge enable row level security;
revoke all on public.agent_knowledge from anon, authenticated;

alter table public.affiliate_products add column if not exists use_cases text[] not null default '{}';
alter table public.affiliate_products add column if not exists audience text[] not null default '{}';
alter table public.affiliate_products add column if not exists recommendation_notes text;
alter table public.affiliate_products add column if not exists merchant text not null default 'Amazon';
alter table public.affiliate_products add column if not exists link_status text not null default 'active'
  check (link_status in ('active', 'unavailable', 'review'));
alter table public.affiliate_products add column if not exists last_verified_at timestamptz;

insert into public.agent_knowledge
  (slug, title, category, content, canonical_url, keywords, access_level, priority)
values
  ('identity', 'Identité de Ramonito', 'identity',
   'Ramonito est le perroquet mascotte officiel d’El Ramon Music Club. Il répond en français, avec un ton tropical, chaleureux, vivant et concis. Il peut employer quelques expressions espagnoles simples. Il doit rester exact, reconnaître lorsqu’une information manque et ne jamais inventer un lien, un prix, une disponibilité, une promotion ou une fonctionnalité.',
   null, array['ramonito','mascotte','el ramon','aide'], 'public', 100),
  ('home', 'Accueil du site', 'navigation',
   'La page d’accueil présente El Ramon Music Club, l’univers musical tropical et les principaux accès au Club. Utiliser cette page pour une présentation générale ou pour revenir au début du site.',
   'https://elramon-music-club.pages.dev/', array['accueil','site','présentation','el ramon'], 'public', 90),
  ('club', 'Présentation du Club', 'navigation',
   'La page Le Club explique l’esprit du Club, ses avantages et les contenus proposés aux membres. Elle convient aux visiteurs qui veulent comprendre le fonctionnement avant de s’inscrire.',
   'https://elramon-music-club.pages.dev/pages/club', array['club','avantages','présentation','membre'], 'public', 88),
  ('signup', 'Rejoindre le Club', 'membership',
   'L’inscription au Club est gratuite. Le visiteur remplit le formulaire, valide les informations demandées puis reçoit un courriel Supabase. Il doit ouvrir le lien reçu pour confirmer son adresse et accéder à son espace membre.',
   'https://elramon-music-club.pages.dev/pages/inscription', array['inscription','rejoindre','compte','gratuit','email'], 'public', 98),
  ('login', 'Connexion membre', 'membership',
   'La connexion se fait sans mot de passe avec un lien magique envoyé par courriel. Le compte doit exister dans Supabase Authentication, pas uniquement dans la table members. Vérifier les spams et attendre au moins 60 secondes avant de demander un nouveau lien.',
   'https://elramon-music-club.pages.dev/pages/login', array['connexion','login','lien magique','otp','email','supabase'], 'public', 99),
  ('member-space', 'Espace membre', 'membership',
   'L’espace membre affiche le prénom ou pseudo, le rang, les points, les boss vaincus, le solde de bananes et les accès aux contenus premium. Cette page nécessite une session membre active.',
   'https://elramon-music-club.pages.dev/pages/espace-membre', array['dashboard','espace membre','profil','rang','points','bananes'], 'member', 92),
  ('game', 'Jeu tropical', 'game',
   'Le jeu tropical permet aux membres de gagner des points et des bananes, de progresser dans les niveaux et d’affronter des boss. Les bananes servent notamment à poursuivre les conversations texte avec Ramonito et à débloquer certaines recommandations premium.',
   'https://elramon-music-club.pages.dev/pages/jeu', array['jeu','jouer','bananes','boss','score','niveau'], 'member', 94),
  ('leaderboard', 'Classement', 'game',
   'Le classement permet de comparer les meilleurs scores des membres et de viser le top du Club.',
   'https://elramon-music-club.pages.dev/pages/leaderboard', array['classement','score','top','leaderboard'], 'member', 75),
  ('bonus', 'Playlists et bonus', 'content',
   'La page Playlists et bonus rassemble des sélections musicales et des contenus réservés aux membres. Certains bonus peuvent nécessiter un déblocage.',
   'https://elramon-music-club.pages.dev/pages/bonus', array['bonus','playlist','musique','contenu premium'], 'member', 86),
  ('prompts', 'Prompts IA', 'content',
   'La page Prompts IA propose des ressources pour créer de la musique et des contenus visuels avec des outils comme Suno et Kling. Les téléchargements protégés nécessitent une session membre.',
   'https://elramon-music-club.pages.dev/pages/prompts', array['prompt','ia','suno','kling','création'], 'member', 85),
  ('suno-guides', 'Guides Suno', 'content',
   'Les guides Suno accompagnent les membres dans la création de chansons et d’ambiances musicales avec l’intelligence artificielle.',
   'https://elramon-music-club.pages.dev/pages/guides-suno', array['suno','guide','tutoriel','musique ia'], 'member', 82),
  ('tablatures', 'Tablatures', 'content',
   'La page Tablatures propose des ressources de guitare liées aux chansons El Ramon, notamment des versions faciles à télécharger pour les membres.',
   'https://elramon-music-club.pages.dev/pages/tablatures', array['tablature','guitare','accords','jouer'], 'member', 82),
  ('discography', 'Discographie', 'music',
   'La discographie présente les albums et créations musicales d’El Ramon Music.',
   'https://elramon-music-club.pages.dev/pages/discographie', array['discographie','album','musique','chanson'], 'public', 78),
  ('youtube', 'Chaîne YouTube officielle', 'music',
   'La chaîne officielle publie les clips, chansons et contenus vidéo d’El Ramon Music.',
   'https://www.youtube.com/@El-Ramon-Music', array['youtube','chaîne','clip','vidéo','abonnement'], 'public', 95),
  ('youtube-playlist', 'Playlist stratégique', 'music',
   'La playlist stratégique officielle permet d’écouter une sélection de morceaux El Ramon Music sur YouTube.',
   'https://www.youtube.com/watch?v=rgA6sLPfglY&list=PL50zfi8zZ2CorecPWocK3z7DEvtQTIYMA', array['playlist','youtube','écouter','musique'], 'public', 80),
  ('suno-link', 'Lien Suno', 'partner',
   'Le lien Suno du Club est un lien d’invitation partenaire. Ramonito doit le présenter comme tel et ne jamais promettre une remise ou un avantage non confirmé.',
   'https://suno.com/invite/@ia_records', array['suno','invitation','partenaire','création musicale'], 'public', 76),
  ('kling-link', 'Lien Kling AI', 'partner',
   'Le lien Kling AI du Club est un lien de parrainage. Ramonito doit le présenter comme tel et ne jamais inventer de bonus.',
   'https://kling.ai/app/invitation?code=7BMNVTGNJYR4', array['kling','parrainage','vidéo ia','partenaire'], 'public', 76),
  ('selection', 'Sélection Tropicale', 'commerce',
   'La Sélection Tropicale regroupe des produits recommandés autour du look tropical, des instruments, de la décoration et des fêtes. Les liens peuvent être affiliés. Le prix et la disponibilité doivent toujours être vérifiés chez le marchand.',
   'https://elramon-music-club.pages.dev/pages/selection-tropicale', array['sélection','produit','boutique','amazon','affiliation'], 'public', 96),
  ('affiliate-policy', 'Règles d’affiliation', 'commerce',
   'Pour toute recommandation commerciale, Ramonito précise clairement qu’il s’agit d’un lien partenaire ou affilié. Il explique que le lien peut soutenir le Club. Il ne doit jamais inventer un prix, une réduction, un stock, une garantie ou une caractéristique. Il recommande au maximum trois produits réellement retournés par l’outil catalogue et explique brièvement pourquoi ils correspondent au besoin.',
   'https://elramon-music-club.pages.dev/pages/selection-tropicale', array['affiliation','lien partenaire','produit','règles commerciales'], 'public', 100),
  ('premium-products', 'Produits premium', 'commerce',
   'Un produit premium peut demander des bananes. Ramonito peut présenter le produit et son coût, mais il ne révèle jamais directement le lien protégé. Le déblocage doit passer par le mécanisme sécurisé du site et par un membre authentifié.',
   'https://elramon-music-club.pages.dev/pages/espace-membre', array['premium','débloquer','bananes','produit'], 'member', 97),
  ('collaborations', 'Collaborations professionnelles', 'support',
   'Les marques, artistes et partenaires peuvent proposer une collaboration depuis la page dédiée. Ramonito ne promet jamais l’acceptation d’une proposition et oriente vers le formulaire officiel.',
   'https://elramon-music-club.pages.dev/pages/collaborations', array['collaboration','partenariat','marque','artiste','sponsor'], 'public', 72),
  ('contact', 'Contacter El Ramon Music Club', 'support',
   'Pour une demande qui nécessite une intervention humaine, Ramonito dirige vers la page Contact. Il ne doit pas demander de mot de passe, de code OTP, de clé API ni de donnée bancaire.',
   'https://elramon-music-club.pages.dev/pages/contact', array['contact','aide','support','humain','email'], 'public', 90),
  ('privacy', 'Confidentialité et mentions légales', 'policy',
   'Les informations de confidentialité et les mentions légales sont disponibles sur les pages officielles. Ramonito résume seulement les informations présentes et renvoie vers ces pages pour le texte complet.',
   'https://elramon-music-club.pages.dev/pages/confidentialite', array['confidentialité','données','rgpd','mentions légales'], 'public', 70),
  ('voice-agent', 'Ramonito vocal', 'support',
   'Ramonito vocal est réservé aux membres connectés. Une conversation dure au maximum cinq minutes et le nombre de sessions quotidiennes est limité. Le microphone est utilisé uniquement pendant la conversation vocale après autorisation du navigateur.',
   'https://elramon-music-club.pages.dev/pages/espace-membre', array['voix','vocal','microphone','elevenlabs','session'], 'member', 89)
on conflict (slug) do update set
  title = excluded.title,
  category = excluded.category,
  content = excluded.content,
  canonical_url = excluded.canonical_url,
  keywords = excluded.keywords,
  access_level = excluded.access_level,
  priority = excluded.priority,
  is_active = true,
  updated_at = now();

