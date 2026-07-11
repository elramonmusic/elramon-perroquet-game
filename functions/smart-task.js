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
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: request.headers,
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
