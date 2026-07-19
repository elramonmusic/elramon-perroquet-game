/**
 * Cloudflare Pages Function — /functions/admin/update-bananas
 * Permet à un administrateur d'ajouter ou retirer des bananes à un membre.
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
    const { member_id, amount } = body;

    if (!member_id || amount === undefined) {
      throw new Error("member_id et amount sont requis.");
    }

    // 3. Récupérer le solde actuel
    const getRes = await fetch(`${env.SUPABASE_URL}/rest/v1/members?id=eq.${member_id}&select=bananas_balance`, {
      method: 'GET',
      headers: {
        'apikey': env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`
      }
    });

    if (!getRes.ok) throw new Error("Erreur lecture membre");
    const data = await getRes.json();
    if (!data.length) throw new Error("Membre introuvable");

    const currentBalance = data[0].bananas_balance || 0;
    const newBalance = Math.max(0, currentBalance + parseInt(amount));

    // 4. Mettre à jour
    const updateRes = await fetch(`${env.SUPABASE_URL}/rest/v1/members?id=eq.${member_id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ bananas_balance: newBalance })
    });

    if (!updateRes.ok) {
      throw new Error(await updateRes.text());
    }

    const updatedData = await updateRes.json();

    return new Response(JSON.stringify({ success: true, new_balance: updatedData[0].bananas_balance }), { status: 200, headers: CORS_HEADERS });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS });
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
