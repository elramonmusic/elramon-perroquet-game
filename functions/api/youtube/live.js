export async function onRequestGet(context) {
  try {
    const { env, request } = context;

    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Non autorisé.' }), { status: 401 });
    }

    const supabaseUrl = env.SUPABASE_URL;
    const supabaseKey = env.SUPABASE_ANON_KEY;
    const serviceKey = env.SUPABASE_SERVICE_KEY || supabaseKey;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase config is missing.');
    }

    // 1. Validate session
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': authHeader
      }
    });

    if (!userRes.ok) return new Response(JSON.stringify({ error: 'Session invalide.' }), { status: 401 });
    const userId = (await userRes.json()).id;

    // 2. Fetch refresh_token from DB
    const tokenRes = await fetch(`${supabaseUrl}/rest/v1/youtube_tokens?id=eq.${userId}&select=refresh_token`, {
      headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}` }
    });

    const tokenData = await tokenRes.json();
    if (!tokenData || tokenData.length === 0 || !tokenData[0].refresh_token) {
      return new Response(JSON.stringify({ error: 'YouTube non connecté.' }), { status: 403 });
    }

    // 3. Get Access Token
    const refreshReq = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        refresh_token: tokenData[0].refresh_token,
        grant_type: 'refresh_token'
      })
    });

    if (!refreshReq.ok) throw new Error('Failed to refresh YouTube token.');
    const accessToken = (await refreshReq.json()).access_token;

    // 4. Fetch YouTube Data (Only Subscriber Count)
    const channelRes = await fetch('https://www.googleapis.com/youtube/v3/channels?part=statistics&mine=true', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (!channelRes.ok) throw new Error('Failed to fetch channel stats');
    const channelData = await channelRes.json();
    if (!channelData.items || channelData.items.length === 0) throw new Error('No channel found.');

    return new Response(JSON.stringify({
      subscriberCount: parseInt(channelData.items[0].statistics.subscriberCount, 10)
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
