import {
  enforceRateLimit,
  fetchWithTimeout,
  getAuthenticatedUser,
  isSameOriginRequest,
  jsonResponse,
  optionsResponse,
} from './utils/security.js';

export async function onRequestOptions() {
  return optionsResponse('POST, OPTIONS');
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!isSameOriginRequest(request)) return jsonResponse({ error: 'Origine non autorisée' }, 403);
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY || !env.SUPABASE_ANON_KEY) {
    return jsonResponse({ error: 'Service temporairement indisponible' }, 503);
  }
  if (!(await enforceRateLimit(context, 'smart-task', 30, 300))) {
    return jsonResponse({ error: 'Trop de questions. Réessaie dans quelques minutes.' }, 429, { 'Retry-After': '300' });
  }

  const user = await getAuthenticatedUser(request, env);
  if (!user?.id) return jsonResponse({ error: 'Session invalide ou expirée' }, 401);

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: 'JSON invalide' }, 400);
  }
  const question = typeof payload.question === 'string' ? payload.question.trim() : '';
  if (!question || question.length > 1000) {
    return jsonResponse({ error: 'Question invalide (1 à 1000 caractères)' }, 400);
  }

  const targetUrl = env.RAMONITO_FUNCTION_URL || `${env.SUPABASE_URL}/functions/v1/smart-task`;
  const history = Array.isArray(payload.history) ? payload.history.slice(-8) : [];
  try {
    const response = await fetchWithTimeout(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: request.headers.get('Authorization'),
        apikey: env.SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ question, history }),
    });
    const body = await response.text();
    return new Response(body, {
      status: response.status,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('Smart-task proxy error:', error.message);
    return jsonResponse({ error: 'Ramonito est momentanément indisponible' }, 502);
  }
}
