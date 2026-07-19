-- Mise à jour des Playlists par défaut avec les vraies Playlists YouTube

-- Playlist 1
UPDATE public.bonus_content
SET 
  title = 'Instrumentales officielles d’El Ramon',
  description = 'Découvrez les versions instrumentales officielles.',
  url = 'https://www.youtube.com/playlist?list=PL50zfi8zZ2CoLp-rFMYoSnBVCzH8dZxTc',
  image_url = 'https://i.ytimg.com/pl_c/PL50zfi8zZ2CoLp-rFMYoSnBVCzH8dZxTc/studio_square_thumbnail.jpg?sqp=CMKf9NIG-oaymwEICKoDEPABSFqi85f_AwYI9oqzzwY=&rs=AOn4CLD4N7u_AN_9Yof-lPJwL96mHSrFcw'
WHERE title = 'Best of Afrobeat 2026';

-- Playlist 2
UPDATE public.bonus_content
SET 
  title = 'El Ramon — Free Vibes 🎶',
  description = 'La playlist officielle de toutes les vibrations tropicales.',
  url = 'https://www.youtube.com/playlist?list=PL50zfi8zZ2CorecPWocK3z7DEvtQTIYMA',
  image_url = 'https://i.ytimg.com/pl_c/PL50zfi8zZ2CorecPWocK3z7DEvtQTIYMA/studio_square_thumbnail.jpg?sqp=COTs89IG-oaymwEICIAKENAFSFqi85f_AwYItY2zzwY=&rs=AOn4CLDU0JLkXKELJwfYG8A-ZKxQctqjiQ'
WHERE title = 'Tropical Soul Essentials';

-- Playlist 3
UPDATE public.bonus_content
SET 
  title = 'El Ramon — Shorts officiels | Afrobeat, Tropical Soul & Extraits',
  description = 'Tous les courts-métrages officiels et extraits musicaux à ne pas manquer.',
  url = 'https://www.youtube.com/playlist?list=PL50zfi8zZ2CpMrqZF40o-AsTokp6lMhPa',
  image_url = 'https://i.ytimg.com/pl_c/PL50zfi8zZ2CpMrqZF40o-AsTokp6lMhPa/studio_square_thumbnail.jpg?sqp=CMqn9NIG-oaymwEICIAKENAFSFqi85f_AwYI8oizzwY=&rs=AOn4CLD04QvniXaKGh2wLjUjpkWNl9zqlg'
WHERE title = 'Zouk & Compas à danser';
