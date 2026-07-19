export async function onRequestGet(context) {
  try {
    const { env } = context;

    const GOOGLE_CLIENT_ID = env.GOOGLE_CLIENT_ID;
    const GOOGLE_REDIRECT_URI = env.GOOGLE_REDIRECT_URI || 'https://elramon-music-club.pages.dev/api/youtube/callback';

    if (!GOOGLE_CLIENT_ID) {
      return new Response(JSON.stringify({ error: 'Configuration Google OAuth manquante (GOOGLE_CLIENT_ID).' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const scopes = [
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/yt-analytics.readonly'
    ].join(' ');

    const urlObj = new URL(context.request.url);
    const token = urlObj.searchParams.get('token');

    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: GOOGLE_REDIRECT_URI,
      response_type: 'code',
      scope: scopes,
      access_type: 'offline',
      prompt: 'consent' // Forces consent screen to always get a refresh token
    });

    if (token) {
      params.append('state', token);
    }

    const loginUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    return new Response(JSON.stringify({ url: loginUrl }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
