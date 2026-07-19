/**
 * Cloudflare Pages Function — /functions/admin/members
 * API sécurisée pour le Dashboard Administrateur.
 * Retourne la liste de tous les membres (uniquement si l'utilisateur est admin).
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

const ADMIN_EMAILS = [
  'elramonmusic@gmail.com',
  'gard.eau.arbres@gmail.com',
  'ramon.mikmak13@gmail.com'
];

export async function onRequestGet(context) {
  const { request, env } = context;

  // 1. Check Authorization header
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Non autorisé. Token manquant." }), { status: 401, headers: CORS_HEADERS });
  }

  // 2. Validate user identity via Supabase Auth
  const userRes = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    method: 'GET',
    headers: {
      'Authorization': authHeader,
      'apikey': env.SUPABASE_ANON_KEY || env.SUPABASE_SERVICE_KEY
    }
  });

  if (!userRes.ok) {
    return new Response(JSON.stringify({ error: "Session invalide ou expirée." }), { status: 401, headers: CORS_HEADERS });
  }

  const user = await userRes.json();
  const userEmail = user.email?.toLowerCase();

  // 3. Verify Admin rights
  if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
    return new Response(JSON.stringify({ error: "Accès refusé. Droits d'administrateur requis." }), { status: 403, headers: CORS_HEADERS });
  }

  try {
    // 4. Fetch all members using SERVICE KEY (bypasses RLS)
    const membersRes = await fetch(`${env.SUPABASE_URL}/rest/v1/members?select=*&order=created_at.desc`, {
      method: 'GET',
      headers: {
        'apikey': env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`
      }
    });

    if (!membersRes.ok) {
      const errText = await membersRes.text();
      throw new Error(`Erreur récupération membres: ${errText}`);
    }

    const membersList = await membersRes.json();

    // Calculate some KPIs
    const totalMembers = membersList.length;
    const totalBananas = membersList.reduce((acc, m) => acc + (m.bananas_balance || 0), 0);
    const totalBossDefeated = membersList.filter(m => m.toucan_defeated).length;

    const responsePayload = {
      kpis: {
        totalMembers,
        totalBananas,
        totalBossDefeated
      },
      members: membersList
    };

    return new Response(JSON.stringify(responsePayload), { status: 200, headers: CORS_HEADERS });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS
  });
}
