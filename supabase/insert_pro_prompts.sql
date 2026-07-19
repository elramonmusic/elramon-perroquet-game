-- Insertion du Pass Pro et de 10 Prompts complexes dans la base de données

-- 1. Le "Pass Pro" pour débloquer l'onglet entier (100 Bananes)
INSERT INTO public.bonus_content (title, description, url, category, is_premium, banana_cost, is_active)
VALUES (
  'Accès Niveau Pro (Prompts)',
  'Débloque l''accès complet à l''onglet Pro avec tous les prompts avancés et fusions de genres.',
  '#',
  'Pass',
  TRUE,
  100,
  TRUE
);

-- 2. Les 5 Prompts INCLUS dans le Pass Pro (Graticiels une fois le pass acheté)
INSERT INTO public.bonus_content (title, description, url, category, is_premium, banana_cost, is_active)
VALUES 
(
  '🏆 Mastering Afrobeat Orchestral',
  'Arrangement orchestral complet avec mastering professionnel. Idéal pour une intro d''album. #Orchestral #Cinématique',
  'Full orchestral afrobeat arrangement, 30-piece string section, 5-piece horn section, 3 percussionists, mixed at Abbey Road quality, LUFs -14, dynamic mastering, cinematic swell, 115 BPM, instrumental.',
  'Prompt IA',
  FALSE,
  0,
  TRUE
),
(
  '🏆 Fusion Tropicale Multi-Genre',
  'Mélange complexe de 4 genres avec modulation de tempo. #Zouk #Afrobeat #Reggaeton',
  'Genre fusion experiment: zouk verse, compas pre-chorus, afrobeat chorus, reggaeton bridge. Tempo morphing 90 to 110 BPM. Polyphonic vocal arrangement. Advanced harmonic structure, francophone lyrics, summer party energy.',
  'Prompt IA',
  FALSE,
  0,
  TRUE
),
(
  '🏆 Zouk Love - Album Cohérent',
  'Génération d''une structure cohérente pour de multiples morceaux. #Album #ZoukLove',
  'Concept album track, cohesive sonic identity, recurring melodic motifs, key relationships with previous track, narrative arc, interludes, unified production aesthetic, romantic zouk love, 90 BPM, lush synths.',
  'Prompt IA',
  FALSE,
  0,
  TRUE
),
(
  '🏆 Reggaeton Sombre & Drill',
  'Un mélange très moderne de drill uk et reggaeton. #Drill #Reggaeton',
  'Dark reggaeton meets UK drill, sliding 808s, rapid hi-hats, minor scale piano melody, aggressive francophone rap flow, tropical percussion accents, club banger, 140 BPM.',
  'Prompt IA',
  FALSE,
  0,
  TRUE
),
(
  '🏆 Compas Traditionnel Rétro',
  'Un son vintage authentique des années 70, comme enregistré sur cassette. #Vintage #LoFi',
  'Vintage 1970s traditional haitian compas, analog tape saturation, hiss, wow and flutter, live band recording in small room, cowbell, electric guitar with chorus pedal, 105 BPM, authentic retro vibe.',
  'Prompt IA',
  FALSE,
  0,
  TRUE
);

-- 3. Les 5 "Super Prompts" PREMIUM (Déblocables individuellement pour 5 bananes)
INSERT INTO public.bonus_content (title, description, url, category, is_premium, banana_cost, is_active)
VALUES 
(
  '💎 Hit Radio de l''Été (Algorithme Viral)',
  'Structure optimisée pour TikTok et les radios. #HitRadio #Viral #120BPM',
  'Radio-ready tropical pop hit, viral TikTok hook in the first 5 seconds, extremely catchy vocal melody, upbeat 120 BPM, afro-pop drum groove, bright synth plucks, francophone lyrics about partying on the beach, punchy mix, high energy.',
  'Prompt IA',
  TRUE,
  5,
  TRUE
),
(
  '💎 Bande Originale de Film Tropical',
  'Score cinématique épique en 5 actes pour bande-annonce. #HansZimmer #Cinématique',
  'Epic cinematic tropical film score, 5-act trailer structure, full orchestra meets electronic percussion, 120 BPM building to 140. Hans Zimmer-style brass braams, Dolby Atmos spatial mixing, massive impacts, dramatic tension.',
  'Prompt IA',
  TRUE,
  5,
  TRUE
),
(
  '💎 Tropical House Ibiza Club',
  'Pour les DJ sets d''été. #TropicalHouse #EDM',
  'Tropical house EDM, Ibiza club anthem, 122 BPM, deep sidechained bass, pan flute synth lead, four on the floor beat, emotional male vocal chop drops, festival mainstage energy.',
  'Prompt IA',
  TRUE,
  5,
  TRUE
),
(
  '💎 Afro-Jazz Sophistiqué',
  'Pour les ambiances élégantes et les musiciens exigeants. #Jazz #Afrobeat',
  'Sophisticated Afro-jazz fusion, complex 7/8 time signature, live upright bass, rhodes piano solo, polyrhythmic percussion, smooth saxophone melody, 108 BPM, elegant evening lounge atmosphere.',
  'Prompt IA',
  TRUE,
  5,
  TRUE
),
(
  '💎 Acapella Tropical Chorale',
  'Une chorale de 20 personnes sans aucun instrument. #Acapella #Gospel',
  'Massive tropical gospel choir, 20-person vocal arrangement, pure acapella, no instruments. Human beatbox percussion, 4-part harmonies, uplifting francophone spiritual lyrics, hand claps, emotional climax.',
  'Prompt IA',
  TRUE,
  5,
  TRUE
);
