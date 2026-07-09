const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const email = url.searchParams.get('email');
  const pseudo = url.searchParams.get('pseudo'); // Fallback by pseudo if needed

  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    return new Response(JSON.stringify({ error: 'Configuration serveur manquante' }), { status: 500, headers: CORS_HEADERS });
  }

  if (!email && !pseudo) {
    return new Response(JSON.stringify({ error: 'Email ou pseudo manquant' }), { status: 400, headers: CORS_HEADERS });
  }

  try {
    let queryUrl = `${env.SUPABASE_URL}/rest/v1/member_game_stats?select=total_score,total_bananas,bosses_defeated,joined_at&limit=1`;
    if (email) {
      queryUrl += `&member_email=eq.${encodeURIComponent(email)}`;
    } else if (pseudo) {
      queryUrl += `&pseudo=eq.${encodeURIComponent(pseudo)}`;
    }

    const response = await fetch(queryUrl, {
      method: 'GET',
      headers: {
        'apikey': env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error('Supabase GET failed: ' + errText);
    }
    
    const stats = await response.json();
    
    if (stats.length === 0) {
      return new Response(JSON.stringify({ total_score: 0, total_bananas: 0, bosses_defeated: 0, joined_at: null }), { status: 200, headers: CORS_HEADERS });
    }

    return new Response(JSON.stringify(stats[0]), { status: 200, headers: CORS_HEADERS });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS });
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
