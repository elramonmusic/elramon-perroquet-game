import {
  enforceRateLimit,
  fetchWithTimeout,
  getAuthenticatedUser,
  isSameOriginRequest,
  jsonResponse,
  optionsResponse,
} from './utils/security.js';

const DEFAULT_AGENT_ID = 'agent_7801m1bkqeqyftgr9sxbhzbkshgn';

export async function onRequestOptions() {
  return optionsResponse('POST, OPTIONS');
}

async function enforceMemberSessionLimit(env, userId) {
  const response = await fetchWithTimeout(`${env.SUPABASE_URL}/rest/v1/rpc/check_rate_limit`, {
    method: 'POST',
    headers: {
      apikey: env.SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      p_key_hash: userId,
      p_action: 'elevenlabs-voice-session',
      p_limit: 2,
      p_window_seconds: 86400,
    }),
  });

  return response.ok && (await response.json()) === true;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!isSameOriginRequest(request)) {
    return jsonResponse({ error: 'Origine non autorisée' }, 403);
  }
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    return jsonResponse({ error: 'Service membre momentanément indisponible' }, 503);
  }
  if (!(await enforceRateLimit(context, 'elevenlabs-session-ip', 10, 86400))) {
    return jsonResponse({ error: 'Limite vocale atteinte pour aujourd’hui' }, 429, { 'Retry-After': '86400' });
  }

  const user = await getAuthenticatedUser(request, env);
  if (!user?.id) {
    return jsonResponse({ error: 'Session membre invalide ou expirée' }, 401);
  }
  if (!env.ELEVENLABS_API_KEY) {
    return jsonResponse({ error: 'La voix de Ramonito n’est pas encore configurée' }, 503);
  }

  try {
    if (!(await enforceMemberSessionLimit(env, user.id))) {
      return jsonResponse({ error: 'Tu as utilisé tes sessions vocales du jour. Le chat texte reste disponible.' }, 429, {
        'Retry-After': '86400',
      });
    }

    const query = new URLSearchParams({
      agent_id: env.ELEVENLABS_AGENT_ID || DEFAULT_AGENT_ID,
      environment: 'production',
    });
    if (env.ELEVENLABS_BRANCH_ID) query.set('branch_id', env.ELEVENLABS_BRANCH_ID);

    const response = await fetchWithTimeout(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?${query}`,
      { headers: { 'xi-api-key': env.ELEVENLABS_API_KEY } },
      10000,
    );

    const result = await response.json().catch(() => ({}));
    if (!response.ok || typeof result.signed_url !== 'string') {
      console.error('ElevenLabs signed URL error:', response.status, result?.detail || 'invalid response');
      return jsonResponse({ error: 'Ramonito vocal est momentanément indisponible' }, 502);
    }

    return jsonResponse({ signedUrl: result.signed_url });
  } catch (error) {
    console.error('ElevenLabs session error:', error?.message || 'unknown');
    return jsonResponse({ error: 'Ramonito vocal est momentanément indisponible' }, 502);
  }
}
