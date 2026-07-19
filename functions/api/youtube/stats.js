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

    if (!userRes.ok) {
      return new Response(JSON.stringify({ error: 'Session invalide.' }), { status: 401 });
    }

    const userData = await userRes.json();
    const userId = userData.id;

    // 2. Fetch refresh_token from DB
    const tokenRes = await fetch(`${supabaseUrl}/rest/v1/youtube_tokens?id=eq.${userId}&select=refresh_token`, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    });

    const tokenData = await tokenRes.json();
    if (!tokenData || tokenData.length === 0 || !tokenData[0].refresh_token) {
      return new Response(JSON.stringify({ error: 'YouTube non connecté.', needsLogin: true }), { status: 403 });
    }

    const refreshToken = tokenData[0].refresh_token;

    // 3. Get Access Token
    const GOOGLE_CLIENT_ID = env.GOOGLE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET;

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      throw new Error('Google config is missing.');
    }

    const refreshReq = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      })
    });

    if (!refreshReq.ok) {
      const errText = await refreshReq.text();
      console.error('Failed to refresh token:', errText);
      return new Response(JSON.stringify({ error: 'Failed to refresh YouTube token.', needsLogin: true }), { status: 403 });
    }

    const refreshData = await refreshReq.json();
    const accessToken = refreshData.access_token;

    // 4. Fetch YouTube Data (Channel Stats)
    const channelRes = await fetch('https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&mine=true', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (!channelRes.ok) {
      throw new Error('Failed to fetch channel stats: ' + await channelRes.text());
    }

    const channelData = await channelRes.json();
    if (!channelData.items || channelData.items.length === 0) {
      throw new Error('No YouTube channel found for this account.');
    }

    const channel = channelData.items[0];
    const channelId = channel.id;
    const stats = channel.statistics;
    const snippet = channel.snippet;

    // 5. Fetch YouTube Analytics (Last 30 days views & estimated minutes watched)
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const analyticsRes = await fetch(`https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==MINE&startDate=${startDate}&endDate=${endDate}&metrics=views,estimatedMinutesWatched,averageViewDuration&dimensions=day&sort=day`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    let analyticsMetrics = { viewsLast30Days: 0, estimatedMinutesWatched: 0, chartData: [] };

    if (analyticsRes.ok) {
      const analyticsData = await analyticsRes.json();
      if (analyticsData.rows) {
        let totalViews = 0;
        let totalMinutes = 0;
        const chartData = analyticsData.rows.map(row => {
          totalViews += row[1];
          totalMinutes += row[2];
          return {
            date: row[0],
            views: row[1],
            minutesWatched: row[2]
          };
        });
        analyticsMetrics = {
          viewsLast30Days: totalViews,
          estimatedMinutesWatched: Math.round(totalMinutes),
          chartData
        };
      }
    } else {
      console.warn('Analytics API failed:', await analyticsRes.text());
      // Analytics API might not be fully enabled or needs channel connection time, we just continue.
    }

    // 6. Return combined data
    return new Response(JSON.stringify({
      channel: {
        title: snippet.title,
        thumbnail: snippet.thumbnails?.default?.url,
        subscriberCount: parseInt(stats.subscriberCount, 10),
        viewCount: parseInt(stats.viewCount, 10),
        videoCount: parseInt(stats.videoCount, 10)
      },
      analytics: analyticsMetrics
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Stats fetch error:', err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
