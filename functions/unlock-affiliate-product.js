import {
  cleanString,
  enforceRateLimit,
  fetchWithTimeout,
  getAuthenticatedUser,
  isSameOriginRequest,
  jsonResponse,
  optionsResponse,
} from './utils/security.js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!isSameOriginRequest(request)) return jsonResponse({ error: 'Origine non autorisée' }, 403);
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    return jsonResponse({ error: 'Configuration serveur manquante' }, 500);
  }

  if (!(await enforceRateLimit(context, 'affiliate-unlock', 20, 300))) {
    return jsonResponse({ error: 'Trop de tentatives. Réessaie dans quelques minutes.' }, 429, { 'Retry-After': '300' });
  }

  const user = await getAuthenticatedUser(request, env);
  if (!user?.id) return jsonResponse({ error: 'Session invalide ou expirée' }, 401);

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'JSON invalide' }, 400);
  }

  const productId = cleanString(body.productId, 36);
  if (!UUID_PATTERN.test(productId)) return jsonResponse({ error: 'ID de produit invalide' }, 400);

  try {
    const response = await fetchWithTimeout(`${env.SUPABASE_URL}/rest/v1/rpc/perform_affiliate_unlock`, {
      method: 'POST',
      headers: {
        apikey: env.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ p_user_id: user.id, p_product_id: productId }),
    });

    if (!response.ok) {
      console.error('perform_affiliate_unlock failed:', await response.text());
      return jsonResponse({ error: 'Déblocage momentanément indisponible' }, 500);
    }

    const result = await response.json();
    if (result.error === 'solde_insuffisant') return jsonResponse(result, 403);
    if (result.error) return jsonResponse(result, 404);
    return jsonResponse(result);
  } catch (error) {
    console.error('Affiliate unlock error:', error.message);
    return jsonResponse({ error: 'Erreur serveur' }, 500);
  }
}

export async function onRequestOptions() {
  return optionsResponse('POST, OPTIONS');
}
