-- Insertion du Bonus Top Secret VIP (Déblocable avec 50 Bananes)
INSERT INTO public.bonus_content (title, description, url, image_url, category, is_premium, banana_cost, is_active)
VALUES (
  'Bonus Top Secret Ramonito 🌴',
  'Le coffre-fort d''El Ramon ! Titres inédits en avant-première, maquettes brutes, essais acoustiques et coulisses de création en studio.',
  'https://youtube.com/playlist?list=PLH-i20NHe-mo&si=jw5hMRII0uAWEgjN',
  'https://images.unsplash.com/photo-1506514300305-bce1129b0f42?w=800&q=80',
  'Vidéo VIP',
  TRUE,
  50,
  TRUE
);
