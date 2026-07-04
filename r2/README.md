# Cloudflare R2 — Structure El Ramon Music Club

Bucket : `elramon-music-club-assets`

## Arborescence prévue

```
elramon-music-club-assets/
│
├── guides/                    # PDFs du guide Suno
│   ├── guide-suno-debutant.pdf
│   ├── 50-prompts-tropicaux.pdf
│   ├── workflow-suno-youtube.pdf
│   └── glossaire-musique-ia.pdf
│
├── tablatures/                # Tablatures guitare
│   ├── ca-fait-chanter-le-soleil/
│   │   ├── debutant.pdf
│   │   ├── intermediaire.pdf
│   │   └── tab.txt
│   └── ...
│
├── jeu/                       # Assets du mini-jeu
│   ├── sprites/
│   ├── sounds/
│   └── levels/
│
├── images/                    # Images optimisées
│   ├── clips/                 # Thumbnails de clips
│   ├── wallpapers/           # Fonds d'écran Club
│   └── backgrounds/          # Backgrounds pour le site
│
├── music/                     # Musiques et bonus audio
│   ├── demos/                # Démos et extraits
│   ├── packs-bonus/          # Packs exclusifs membres
│   └── ringtones/             # Sonneries
│
├── bonus/                     # Contenus bonus divers
│   └── ...
│
└── _temp/                     # Upload temporaire (à nettoyer)
```

## Configuration Cloudflare R2

### Variables d'environnement (Cloudflare Pages)
| Variable | Exemple | Description |
|---|---|---|
| `R2_BUCKET` | `elramon-music-club-assets` | Nom du bucket R2 |
| `R2_PUBLIC_URL` | `https://r2.elramon-music-club.pages.dev` | URL publique (si configurée) |

### CORS (à configurer dans Cloudflare R2)
```json
{
  "allowedOrigins": ["https://elramon-music-club.pages.dev"],
  "allowedMethods": ["GET", "HEAD"],
  "allowedHeaders": ["*"],
  "maxAgeSeconds": 86400
}
```

## Intégration future

- Les fichiers seront servis via un binding R2 dans les Cloudflare Pages Functions
- Exemple d'accès : `env.R2_BUCKET.get('guides/guide-suno-debutant.pdf')`
- Aucune clé secrète nécessaire côté client — tout passe par les Functions
