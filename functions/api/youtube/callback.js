export async function onRequestGet(context) {
  try {
    const { env, request } = context;
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state'); // Supabase access_token
    const errorParam = url.searchParams.get('error');

    if (errorParam) {
      return Response.redirect(`${url.origin}/pages/statistiques.html?error=google_auth_failed`, 302);
    }

    if (!code || !state) {
      return Response.redirect(`${url.origin}/pages/statistiques.html?error=missing_params`, 302);
    }

    const GOOGLE_CLIENT_ID = env.GOOGLE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET;
    const GOOGLE_REDIRECT_URI = env.GOOGLE_REDIRECT_URI || 'https://elramon-music-club.pages.dev/api/youtube/callback';

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      throw new Error('Google OAuth config is missing.');
    }

    // Verify Supabase Token to get User ID
    const supabaseUrl = env.SUPABASE_URL;
    const supabaseKey = env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase config is missing.');
    }

    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${state}`
      }
    });

    if (!userRes.ok) {
      return Response.redirect(`${url.origin}/pages/statistiques.html?error=invalid_session`, 302);
    }

    const userData = await userRes.json();
    const userId = userData.id;

    // Verify user role (only admin can connect YouTube)
    const profileRes = await fetch(`${supabaseUrl}/rest/v1/members?id=eq.${userId}&select=role`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${state}`
      }
    });
    const profileData = await profileRes.json();
    if (!profileData || profileData.length === 0 || profileData[0].role !== 'admin') {
      return Response.redirect(`${url.origin}/pages/statistiques.html?error=unauthorized_role`, 302);
    }

    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: GOOGLE_REDIRECT_URI
      })
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error('Google token exchange error:', err);
      return Response.redirect(`${url.origin}/pages/statistiques.html?error=token_exchange_failed`, 302);
    }

    const tokenData = await tokenRes.json();
    const refreshToken = tokenData.refresh_token;

    if (!refreshToken) {
      // If we didn't get a refresh token, the user might need to revoke access and try again.
      // Or we already have it. But we forced prompt=consent, so we should get it.
      console.warn('No refresh token returned by Google. User might have already authorized.');
      return Response.redirect(`${url.origin}/pages/statistiques.html?error=no_refresh_token`, 302);
    }

    // Save refresh_token to Supabase via Service Key (since RLS might block normal inserts if we set it so, or we can just use service key to be safe)
    const serviceKey = env.SUPABASE_SERVICE_KEY || supabaseKey; 

    const saveRes = await fetch(`${supabaseUrl}/rest/v1/youtube_tokens`, {
      method: 'POST',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        id: userId,
        refresh_token: refreshToken,
        updated_at: new Date().toISOString()
      })
    });

    if (!saveRes.ok) {
      const err = await saveRes.text();
      console.error('Supabase save error:', err);
      return Response.redirect(`${url.origin}/pages/statistiques.html?error=db_save_failed`, 302);
    }

    // Redirect to frontend with success
    return Response.redirect(`${url.origin}/pages/statistiques.html?success=youtube_connected`, 302);

  } catch (err) {
    console.error('Callback error:', err.message);
    const url = new URL(context.request.url);
    return Response.redirect(`${url.origin}/pages/statistiques.html?error=server_error`, 302);
  }
}
