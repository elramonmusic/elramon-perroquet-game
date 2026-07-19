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

    // 5. Fetch YouTube Analytics (Last 30 days & Previous 30 days)
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(now - 30 * dayMs).toISOString().split('T')[0];
    const prevEndDate = new Date(now - 31 * dayMs).toISOString().split('T')[0];
    const prevStartDate = new Date(now - 60 * dayMs).toISOString().split('T')[0];

    const metrics = 'views,estimatedMinutesWatched,averageViewDuration,likes,comments,shares';
    const baseUrl = 'https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==MINE';
    
    const currentStatsUrl = `${baseUrl}&startDate=${startDate}&endDate=${endDate}&metrics=${metrics}&dimensions=day&sort=day`;
    const prevStatsUrl = `${baseUrl}&startDate=${prevStartDate}&endDate=${prevEndDate}&metrics=views`;
    const topVideosUrl = `${baseUrl}&startDate=${startDate}&endDate=${endDate}&metrics=views,estimatedMinutesWatched,likes&dimensions=video&sort=-views&maxResults=5`;
    const demographicsUrl = `${baseUrl}&startDate=${startDate}&endDate=${endDate}&metrics=viewerPercentage&dimensions=ageGroup,gender&sort=ageGroup`;
    const trafficUrl = `${baseUrl}&startDate=${startDate}&endDate=${endDate}&metrics=views&dimensions=insightTrafficSourceType&sort=-views&maxResults=5`;

    const fetchConfig = { headers: { 'Authorization': `Bearer ${accessToken}` } };

    const [currentRes, prevRes, topVidRes, demogRes, trafficRes] = await Promise.all([
      fetch(currentStatsUrl, fetchConfig),
      fetch(prevStatsUrl, fetchConfig),
      fetch(topVideosUrl, fetchConfig),
      fetch(demographicsUrl, fetchConfig),
      fetch(trafficUrl, fetchConfig)
    ]);

    let analyticsMetrics = { 
      viewsLast30Days: 0, 
      estimatedMinutesWatched: 0, 
      likes: 0,
      comments: 0,
      shares: 0,
      averageViewDuration: 0,
      chartData: [],
      prevViews: 0,
      topVideos: [],
      demographics: [],
      trafficSources: []
    };

    if (currentRes.ok) {
      const data = await currentRes.json();
      if (data.rows) {
        let sumViews = 0, sumMins = 0, sumLikes = 0, sumComments = 0, sumShares = 0;
        const chartData = data.rows.map(row => {
          sumViews += row[1] || 0;
          sumMins += row[2] || 0;
          sumLikes += row[4] || 0;
          sumComments += row[5] || 0;
          sumShares += row[6] || 0;
          return { date: row[0], views: row[1], minutesWatched: row[2] };
        });
        analyticsMetrics.viewsLast30Days = sumViews;
        analyticsMetrics.estimatedMinutesWatched = Math.round(sumMins);
        analyticsMetrics.likes = sumLikes;
        analyticsMetrics.comments = sumComments;
        analyticsMetrics.shares = sumShares;
        analyticsMetrics.averageViewDuration = sumViews > 0 ? Math.round((sumMins * 60) / sumViews) : 0;
        analyticsMetrics.chartData = chartData;
      }
    } else {
      console.warn('Current Stats API failed:', await currentRes.text());
    }

    if (prevRes.ok) {
      const data = await prevRes.json();
      if (data.rows) {
        // If not dimensioned, it might be a single row or empty
        analyticsMetrics.prevViews = data.rows.reduce((sum, row) => sum + (row[0]||0), 0);
      }
    }

    if (topVidRes.ok) {
      const data = await topVidRes.json();
      if (data.rows && data.rows.length > 0) {
        const videoIds = data.rows.map(r => r[0]).join(',');
        const vidReq = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoIds}`, fetchConfig);
        if (vidReq.ok) {
          const vidData = await vidReq.json();
          const snippets = {};
          vidData.items.forEach(item => { snippets[item.id] = item.snippet; });
          
          analyticsMetrics.topVideos = data.rows.map(row => ({
            id: row[0],
            views: row[1],
            minutesWatched: Math.round(row[2]),
            likes: row[3],
            title: snippets[row[0]]?.title || 'Vidéo inconnue',
            thumbnail: snippets[row[0]]?.thumbnails?.medium?.url || snippets[row[0]]?.thumbnails?.default?.url || ''
          }));
        }
      }
    }

    if (demogRes.ok) {
      const data = await demogRes.json();
      if (data.rows) {
        analyticsMetrics.demographics = data.rows.map(row => ({
          ageGroup: row[0].replace('age', ''),
          gender: row[1],
          percentage: row[2]
        }));
      }
    }

    if (trafficRes.ok) {
      const data = await trafficRes.json();
      if (data.rows) {
        analyticsMetrics.trafficSources = data.rows.map(row => ({
          source: row[0],
          views: row[1]
        }));
      }
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
