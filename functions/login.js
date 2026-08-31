import { jsonResponse, optionsResponse } from './utils/security.js';

// Ancienne route conservée uniquement pour éviter qu'un ancien client ne
// bénéficie d'une connexion par simple connaissance de l'adresse e-mail.
export async function onRequestPost() {
  return jsonResponse({
    error: 'Cette méthode de connexion a été désactivée. Utilise le lien magique Supabase.',
  }, 410);
}

export async function onRequestOptions() {
  return optionsResponse('POST, OPTIONS');
}
