const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const targetUrl = env.RAMONITO_FUNCTION_URL || `${env.SUPABASE_URL}/functions/v1/smart-task`;

  try {
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers.set('Authorization', authHeader);
    }
    
    // Si la clé anon est dispo, on la passe aussi
    if (env.SUPABASE_ANON_KEY) {
      headers.set('apikey', env.SUPABASE_ANON_KEY);
    }

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: headers,
      body: request.body
    });

    const body = await response.text();
    return new Response(body, {
      status: response.status,
      headers: CORS_HEADERS
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Erreur de communication avec le cerveau de Ramonito." }), {
      status: 500,
      headers: CORS_HEADERS
    });
  }
}
