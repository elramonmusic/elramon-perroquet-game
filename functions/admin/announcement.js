/**
 * Cloudflare Pages Function — /functions/admin/announcement
 * Permet à un administrateur de modifier l'annonce globale (Mot du Jour).
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

const ADMIN_EMAILS = [
  'elramonmusic@gmail.com',
  'gard.eau.arbres@gmail.com',
  'ramon.mikmak13@gmail.com'
];

export async function onRequestPost(context) {
  const { request, env } = context;

  // 1. Check Authorization
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Non autorisé." }), { status: 401, headers: CORS_HEADERS });
  }

  // 2. Validate Admin Identity
  const userRes = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    method: 'GET',
    headers: {
      'Authorization': authHeader,
      'apikey': env.SUPABASE_ANON_KEY || env.SUPABASE_SERVICE_KEY
    }
  });

  if (!userRes.ok) return new Response(JSON.stringify({ error: "Session invalide." }), { status: 401, headers: CORS_HEADERS });
  
  const user = await userRes.json();
  const userEmail = user.email?.toLowerCase();

  if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
    return new Response(JSON.stringify({ error: "Accès refusé. Administrateur requis." }), { status: 403, headers: CORS_HEADERS });
  }

  try {
    const body = await request.json();
    const { message } = body;

    if (message === undefined) {
      throw new Error("Message manquant.");
    }

    // 3. Upsert du message
    const updateRes = await fetch(`${env.SUPABASE_URL}/rest/v1/global_settings?setting_key=eq.mot_du_jour`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`
      },
      body: JSON.stringify({ setting_value: message })
    });

    if (!updateRes.ok) {
      throw new Error(await updateRes.text());
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: CORS_HEADERS });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS });
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
