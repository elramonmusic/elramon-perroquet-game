-- Mise à jour des images de pochettes d'albums/EP
UPDATE public.bonus_content
SET image_url = 'https://s3.amazonaws.com/gather.fandalism.com/800x800%2D12408765%2D%2D8A19FDCC%2D075E%2D48AB%2D945DCC0183928784%2D%2D0%2D%2D4035790%2D%2DRythmesdelaplageensoleille%2Ejpg'
WHERE title = 'Fiesta a la playa (EP)';

UPDATE public.bonus_content
SET image_url = 'https://s3.amazonaws.com/gather.fandalism.com/800x800%2D12408765%2D%2DD3F6423E%2DB4BD%2D4BBE%2D8552F6654E58B56E%2D%2D0%2D%2D6665992%2D%2DReimaginesVol1pochettealbum%2Ejpg'
WHERE title = 'Réimagines (Covers)';

UPDATE public.bonus_content
SET image_url = 'https://s3.amazonaws.com/pub.tunecore.com/artwork/medium/12/33/77/68/47/1233776847.jpg?1778701682'
WHERE title = 'Harmony of hearts (Album)';

UPDATE public.bonus_content
SET image_url = 'https://s3.amazonaws.com/gather.fandalism.com/800x800%2D12408765%2D%2D656D1F19%2DE527%2D47D2%2D99037A901F11130E%2D%2D0%2D%2D1915562%2D%2DFtetropicaleaucoucherdusoleil%2Ejpg'
WHERE title = 'Let It Me (Single)';
