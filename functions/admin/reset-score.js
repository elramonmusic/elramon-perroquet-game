/**
 * Cloudflare Pages Function — /functions/admin/reset-score
 * Permet à un administrateur de remettre à 0 le score d'un joueur (anti-triche).
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

  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return new Response(JSON.stringify({ error: "Non autorisé." }), { status: 401, headers: CORS_HEADERS });

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
    return new Response(JSON.stringify({ error: "Accès refusé." }), { status: 403, headers: CORS_HEADERS });
  }

  try {
    const { member_id } = await request.json();
    if (!member_id) throw new Error("member_id requis.");

    // 1. Reset best_score in members table
    const updateMembers = fetch(`${env.SUPABASE_URL}/rest/v1/members?id=eq.${member_id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`
      },
      body: JSON.stringify({ best_score: 0 })
    });

    // 2. Delete entries in scores table for this member (to clear the leaderboard)
    const updateScores = fetch(`${env.SUPABASE_URL}/rest/v1/scores?member_id=eq.${member_id}`, {
      method: 'DELETE',
      headers: {
        'apikey': env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`
      }
    });

    const [resM, resS] = await Promise.all([updateMembers, updateScores]);
    if (!resM.ok) throw new Error(await resM.text());
    if (!resS.ok) throw new Error(await resS.text());

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: CORS_HEADERS });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS });
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
