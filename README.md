# 🦜 El Ramon Music Club

> **Les chansons tropicales qui donnent le sourire.**

Site officiel d'El Ramon Music — vitrine publique + club privé réservé aux inscrits. Univers tropical, festif et solaire (Afrobeat, Tropical Soul, Zouk, Compas).

---

## 📋 Table des matières

- [Aperçu](#aperçu)
- [Structure du projet](#structure-du-projet)
- [Pages du site](#pages-du-site)
- [Stack technique](#stack-technique)
- [Installation locale](#installation-locale)
- [Déploiement sur Cloudflare Pages](#déploiement-sur-cloudflare-pages)
- [Configuration Cloudflare R2](#configuration-cloudflare-r2)
- [Connexion Supabase (V2)](#connexion-supabase-v2)
- [Variables d'environnement](#variables-denvironnement)
- [Sécurité & RGPD](#sécurité--rgpd)
- [Roadmap](#roadmap)

---

## Aperçu

Le site **El Ramon Music Club** est conçu comme un hub officiel autour de la chaîne YouTube El Ramon Music. Il transforme les visiteurs en :

1. Abonnés YouTube
2. Inscrits email
3. Membres du Club (contenus exclusifs)
4. Joueurs du mini-jeu tropical
5. Lecteurs de guides / prompts / tablatures
6. Futurs partenaires commerciaux

**Mascotte** : un perroquet tropical joyeux et coloré.

---

## Structure du projet

```
el_ramon_music_club/
│
├── index.html                  # Landing page principale
├── app.js                      # JS global (auth, nav, formulaires, animations)
├── styles.css                  # Design system tropical complet
├── README.md                   # Cette documentation
├── .gitignore
│
├── pages/                      # Toutes les pages du site
│   ├── club.html               # Présentation du Club
│   ├── inscription.html        # Formulaire d'inscription
│   ├── merci.html              # Confirmation après inscription
│   ├── login.html              # Connexion membre (V1 : email)
│   ├── espace-membre.html      # Dashboard privé (auth requis)
│   ├── dashboard.html          # Redirection → espace-membre
│   ├── jeu.html                # Mini-jeu tropical (auth requis)
│   ├── guides-suno.html        # Guides Suno IA (auth requis)
│   ├── prompts.html            # Bibliothèque prompts IA (auth requis)
│   ├── tablatures.html         # Tablatures guitare (auth requis)
│   ├── collaborations.html     # Collaborations commerciales + formulaire
│   ├── partenaires.html        # Partenaires & liens affiliés
│   ├── contact.html            # Formulaire de contact
│   ├── mentions-legales.html   # Mentions légales RGPD
│   └── confidentialite.html    # Politique de confidentialité RGPD
│
├── functions/                  # Cloudflare Pages Functions (backend)
│   ├── subscribe.js            # POST /functions/subscribe (inscription)
│   ├── contact.js              # POST /functions/contact (messages)
│   └── collaboration.js        # POST /functions/collaboration (partenariats)
│
└── assets/                     # Médias statiques
    ├── images/                 # hero-bg.png, logo.png, parrot-mascot.png
    └── icons/                  # (favicon, icônes)
```

---

## Pages du site

| Page | URL | Accès | Description |
|------|-----|-------|-------------|
| Accueil | `/` | Public | Landing page premium, conversion-ready |
| Le Club | `/pages/club.html` | Public | Présentation du Club et avantages |
| Inscription | `/pages/inscription.html` | Public | Formulaire email + pseudo |
| Merci | `/pages/merci.html` | Public | Confirmation post-inscription |
| Connexion | `/pages/login.html` | Public | Login membre (V1 : email) |
| Espace Membre | `/pages/espace-membre.html` | **Membre** | Dashboard privé |
| Mini-Jeu | `/pages/jeu.html` | **Membre** | Jeu du perroquet (placeholder V2) |
| Guides Suno | `/pages/guides-suno.html` | **Membre** | Tutoriels création IA |
| Prompts IA | `/pages/prompts.html` | **Membre** | Prompts prêts à copier-coller |
| Tablatures | `/pages/tablatures.html` | **Membre** | Ressources guitare |
| Collaborations | `/pages/collaborations.html` | Public | Page pro marques/entreprises |
| Partenaires | `/pages/partenaires.html` | Public | Liens partenaires & affiliés |
| Contact | `/pages/contact.html` | Public | Formulaire de contact |
| Mentions légales | `/pages/mentions-legales.html` | Public | RGPD |
| Confidentialité | `/pages/confidentialite.html` | Public | RGPD |

**Pages verrouillées** : l'accès nécessite une session membre (localStorage en V1). Si non connecté, redirection automatique vers `/pages/inscription.html`.

---

## Stack technique

- **Frontend** : HTML5 / CSS3 / JavaScript vanilla (pas de framework, pas de build)
- **Police** : Outfit + Pacifico (Google Fonts)
- **Backend** : Cloudflare Pages Functions (JavaScript, edge runtime)
- **Base de données** : Supabase (V2) — V1 utilise localStorage navigateur
- **Hébergement** : Cloudflare Pages (gratuit)
- **Stockage fichiers lourds** : Cloudflare R2 (V2)
- **Email transactionnel** : Resend (V2, optionnel)

**Pourquoi du vanilla JS ?** Performance maximale, zéro dépendance, déploiement instantané, maintenance simple. Aucun build step nécessaire.

---

## Installation locale

Le site est statique — aucun build requis. Tu peux l'ouvrir directement ou utiliser un serveur local.

### Option 1 : Ouvrir directement
Double-clique sur `index.html`.

### Option 2 : Serveur local (recommandé pour tester les formulaires)

```bash
# Avec Python
python -m http.server 8000

# Avec Node (npx)
npx serve .

# Avec PHP
php -S localhost:8000
```

Puis ouvre `http://localhost:8000`.

> ⚠️ Les Cloudflare Pages Functions (`/functions/`) ne fonctionnent qu'en production sur Cloudflare. En local, les formulaires basculent automatiquement en mode **fallback localStorage**.

---

## Déploiement sur Cloudflare Pages

### 1. Préparer le dépôt GitHub

```bash
git init
git add .
git commit -m "Initial commit — El Ramon Music Club V1"
git branch -M main
git remote add origin https://github.com/gardeauarbres/elramon-music-club.git
git push -u origin main
```

### 2. Connecter à Cloudflare Pages

1. Va sur [Cloudflare Dashboard → Pages](https://dash.cloudflare.com/?to=/:account/pages)
2. Clique **"Create a project"** → **"Connect to Git"**
3. Autorise Cloudflare à accéder à ton GitHub
4. Sélectionne le dépôt `elramon-music-club`
5. Configuration :
   - **Project name** : `elramon-music-club`
   - **Production branch** : `main`
   - **Build command** : *(laisser vide — pas de build)*
   - **Build output directory** : `/` (racine)
6. Clique **"Save and Deploy"**

### 3. Domaine personnalisé (optionnel)

1. Dans Cloudflare Pages → **Custom domains**
2. Ajoute `elramonmusicclub.fr` (ou ton domaine)
3. Configure les enregistrements DNS comme indiqué par Cloudflare

Le site est désormais en ligne avec HTTPS automatique ! 🎉

---

## Configuration Cloudflare R2

R2 sert à héberger les fichiers lourds (jeu, PDF, vidéos HD, tablatures).

### 1. Créer le bucket

1. Va sur [Cloudflare Dashboard → R2](https://dash.cloudflare.com/?to=/:account/r2)
2. **Create bucket** → nom : `elramon-music-club-assets`
3. Région : *Automatic* (ou la plus proche de ton audience)

### 2. Structure des dossiers

```
elramon-music-club-assets/
├── game/           # Fichiers du mini-jeu (JS, sprites, audio)
├── guides/         # PDF des guides Suno
├── prompts/        # Collections de prompts (PDF)
├── tablatures/     # Tablatures guitare (PDF, Guitar Pro)
├── music/          # Morceaux exclusifs (MP3)
├── videos/         # Clips HD, bonus
├── images/         # Images HD, thumbnails
├── bonus/          # Contenus exclusifs membres
└── partners/       # Logos partenaires
```

### 3. Accès public (V2)

Pour exposer les fichiers publiquement via un sous-domaine :

1. R2 → ton bucket → **Settings** → **Public access**
2. Active **R2.dev subdomain** ou connecte un **Custom domain** (ex : `assets.elramonmusicclub.fr`)
3. Utilise les URLs dans le code : `https://assets.elramonmusicclub.fr/guides/guide-suno.pdf`

### 4. Bucket de test

Crée aussi `elramon-music-club-assets-dev` pour tester les uploads avant production.

---

## Connexion Supabase (V2)

Supabase gère l'authentification complète, la base de données membres et le stockage structuré.

### 1. Créer le projet

1. Va sur [supabase.com](https://supabase.com) → **New project**
2. Nom : `elramon-music-club`
3. Génère un mot de passe DB fort
4. Région : *EU Central* (Frankfurt) ou la plus proche

### 2. Schéma de base de données

Exécute ce SQL dans le SQL Editor de Supabase :

```sql
-- Table des membres
CREATE TABLE members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  pseudo TEXT NOT NULL,
  prenom TEXT DEFAULT '',
  role TEXT DEFAULT 'member' CHECK (role IN ('visitor','member','premium','partner','admin')),
  newsletter BOOLEAN DEFAULT false,
  abonne BOOLEAN DEFAULT false,
  source TEXT DEFAULT 'elramon-music-club',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des messages de contact
CREATE TABLE contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  email TEXT NOT NULL,
  sujet TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'nouveau'
);

-- Table des collaborations
CREATE TABLE collaborations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company TEXT NOT NULL,
  contact_name TEXT,
  email TEXT NOT NULL,
  website TEXT,
  collab_type TEXT,
  product TEXT,
  budget TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'nouveau',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activer Row Level Security
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborations ENABLE ROW LEVEL SECURITY;

-- Policy : autoriser l'insertion publique (pour les inscriptions)
CREATE POLICY "Public can subscribe" ON members FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can contact" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can collaborate" ON collaborations FOR INSERT WITH CHECK (true);
```

### 3. Récupérer les clés

Dans Supabase → **Settings** → **API** :
- `Project URL` → `SUPABASE_URL`
- `anon public` → `SUPABASE_ANON_KEY`
- `service_role` → `SUPABASE_SERVICE_KEY` (⚠️ secret, à mettre dans Cloudflare)

### 4. Configurer dans Cloudflare

Cloudflare Pages → ton projet → **Settings** → **Environment variables** :

| Variable | Valeur |
|----------|--------|
| `SUPABASE_URL` | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_KEY` | `eyJhbGci...` (service_role) |

Puis mets à jour `app.js` (ligne `CONFIG`) avec `SUPABASE_URL` et `SUPABASE_ANON_KEY`.

---

## Variables d'environnement

À configurer dans **Cloudflare Pages → Settings → Environment variables** :

| Variable | Description | Requis |
|----------|-------------|--------|
| `SUPABASE_URL` | URL du projet Supabase | V2 |
| `SUPABASE_SERVICE_KEY` | Clé service_role Supabase (secrète) | V2 |
| `RESEND_API_KEY` | Clé API Resend pour les emails | V2 (optionnel) |

Crée un fichier `.dev.vars` à la racine pour le développement local avec Wrangler :

```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGci...
RESEND_API_KEY=re_xxx...
```

---

## Sécurité & RGPD

### Protection des formulaires
- ✅ Validation côté client (`app.js`) et côté serveur (`functions/`)
- ✅ Case RGPD obligatoire sur tous les formulaires
- ✅ Logs anti-spam via Cloudflare (IP tracking)
- 🔜 **Cloudflare Turnstile** (anti-bot) — à activer en production

### Protection des données
- ✅ HTTPS forcé via Cloudflare
- ✅ Aucune donnée sensible stockée en V1 (pas de mot de passe)
- ✅ Politique de confidentialité complète
- ✅ Droit à l'oubli (désinscription par email)
- ✅ Aucune revente de données

### Cloudflare Turnstile (V2)

1. [Cloudflare Dashboard → Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile)
2. **Add site** → ajoute ton domaine
3. Récupère `site key` et `secret key`
4. Ajoute le widget dans les formulaires :

```html
<div class="cf-turnstile" data-sitekey="TON_SITE_KEY"></div>
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
```

---

## Roadmap

### ✅ V1 — Actuelle
- [x] Site vitrine tropical premium
- [x] 14 pages complètes
- [x] Inscription email + pseudo (localStorage)
- [x] Espace membre simulé
- [x] Pages verrouillées (auth gate)
- [x] Formulaires (contact, collaboration)
- [x] Pages légales RGPD
- [x] Liens stratégiques (YouTube, Suno, partenaires)
- [x] Design responsive mobile-first
- [x] SEO (meta, Open Graph, Schema.org)

### 🔜 V2 — À venir
- [ ] Authentification Supabase complète (mot de passe)
- [ ] Cloudflare R2 connecté (fichiers lourds)
- [ ] Mini-jeu du perroquet jouable
- [ ] Guides PDF téléchargeables
- [ ] Tablatures guitare
- [ ] Cloudflare Turnstile anti-bot
- [ ] Emails transactionnels (Resend)
- [ ] Dashboard admin

### 🔮 V3 — Futur
- [x] Vérification avancée YouTube (API)
- [ ] Classement du mini-jeu
- [ ] Contenus premium payants
- [ ] Boutique / affiliation / sponsors
- [ ] Application mobile

---

## Liens utiles

| Lien | URL |
|------|-----|
| Chaîne YouTube | https://www.youtube.com/@El-Ramon-Music |
| Playlist stratégie | https://www.youtube.com/watch?v=rgA6sLPfglY&list=PL50zfi8zZ2CorecPWocK3z7DEvtQTIYMA |
| Suno (invitation) | https://suno.com/invite/@ia_records |
| Flow Music (invitation) | https://www.flowmusic.app/invite/VDMJX7 |
| Kling AI (parrainage) | https://kling.ai/app/invitation?code=7BMNVTGNJYR4 |
| Contact | elramonmusic@gmail.com |

---

## Licence

© 2026 El Ramon Music Club. Tous droits réservés.

Fait avec ☀️ soleil et passion. Les chansons tropicales qui donnent le sourire. 🌴🦜
