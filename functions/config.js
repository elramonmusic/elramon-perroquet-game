/**
 * Cloudflare Pages Function -> /config
 * Retourne la clé publique Supabase (Anon Key) et l'URL au frontend.
 * Ces données sont publiques et nécessaires pour initialiser le client Supabase JS.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

export async function onRequestGet(context) {
  const { env } = context;

  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return new Response(JSON.stringify({ error: 'Configuration manquante' }), { status: 500, headers: CORS_HEADERS });
  }

  return new Response(JSON.stringify({
    SUPABASE_URL: env.SUPABASE_URL,
    SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY,
    RAMONITO_FUNCTION_URL: env.RAMONITO_FUNCTION_URL || `${env.SUPABASE_URL}/functions/v1/smart-task`
  }), { status: 200, headers: CORS_HEADERS });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
