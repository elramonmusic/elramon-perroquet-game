-- ==========================================
-- 1. Ajout dans la table BONUS_CONTENT (Page Playlists)
-- ==========================================
INSERT INTO public.bonus_content (title, description, category, url, image_url, is_premium, banana_cost, is_active)
VALUES 
('Fiesta a la playa (EP)', 'Plonge dans l''ambiance ensoleillée avec cet EP 100% Tropical (Mary Luz, Sol I Brisa, Vacaciones...).', 'EP Tropical', 'https://www.youtube.com/watch?v=4n60dOKShiw&list=OLAK5uy_lQMSxdSEJsXpSRXMRPaibVZ9FCXu2kOw0', 'https://images.unsplash.com/photo-1520110120835-c96534a4c984?w=400&q=80', false, 0, true),
('Réimagines (Covers)', 'Des classiques revisités à la sauce El Ramon : Nothing else matters, Gangsta''s Paradise, Careless Whisper...', 'Reprises', 'https://www.youtube.com/watch?v=MGf2ZIUPYDQ&list=OLAK5uy_nFemqPKAgm06ft6eSnpjFBc0aPf0WwZiA', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80', false, 0, true),
('Harmony of hearts (Album)', 'Retrouve l''album complet sur Apple Music pour une écoute en haute qualité.', 'Album', 'https://itunes.apple.com/us/artist/el-ramon/1884453868', 'https://images.unsplash.com/photo-1619983081563-430f63602796?w=400&q=80', false, 0, true),
('Let It Me (Single)', 'Le single parfait pour une pause détente sur la plage.', 'Single', 'https://www.youtube.com/watch?v=HftdumtmLvQ&list=OLAK5uy_n3xyZWMRzY5lwtk4-3jC6e_hb8hSTmMAg', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80', false, 0, true)
ON CONFLICT DO NOTHING;

-- ==========================================
-- 2. Ajout dans la table AFFILIATE_PRODUCTS (Cerveau Ramonito IA)
-- ==========================================
INSERT INTO public.affiliate_products (name, category, keywords, description, url, image_url, is_premium, banana_cost, is_active)
VALUES 
('Spotify El Ramon Music', 'Streaming', ARRAY['spotify', 'musique', 'ecouter', 'streaming', 'plateforme'], 'La page officielle artiste sur Spotify pour écouter tous les morceaux en boucle.', 'https://open.spotify.com/artist/5kjkwjZVoKNqhh3jdFQfA9', 'https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg', false, 0, true),
('Apple Music El Ramon', 'Streaming', ARRAY['apple', 'music', 'itunes', 'ecouter'], 'La page artiste sur Apple Music et iTunes.', 'https://itunes.apple.com/us/artist/el-ramon/1884453868', 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg', false, 0, true),
('Gangsta''s Paradise (Reprise Tropicale)', 'Musique', ARRAY['gangsta', 'paradise', 'reprise', 'cover', 'coolio'], 'Une version inédite et tropicale du classique Gangsta''s Paradise par El Ramon.', 'https://www.youtube.com/watch?v=Hinz9l6-vv0', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80', false, 0, true)
ON CONFLICT DO NOTHING;
