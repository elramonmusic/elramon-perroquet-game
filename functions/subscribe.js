import {
  cleanString,
  enforceRateLimit,
  fetchWithTimeout,
  isSameOriginRequest,
  isValidEmail,
  jsonResponse,
  optionsResponse,
  verifyTurnstile,
} from './utils/security.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!isSameOriginRequest(request)) return jsonResponse({ error: 'Origine non autorisée' }, 403);
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY || !env.TURNSTILE_SECRET_KEY) {
    return jsonResponse({ error: 'Service d’inscription temporairement indisponible' }, 503);
  }
  if (!(request.headers.get('content-type') || '').includes('application/json')) {
    return jsonResponse({ error: 'Content-Type doit être application/json' }, 415);
  }
  if (!(await enforceRateLimit(context, 'subscribe', 5, 600))) {
    return jsonResponse({ error: 'Trop de tentatives. Réessaie dans quelques minutes.' }, 429, { 'Retry-After': '600' });
  }

  let data;
  try {
    data = await request.json();
  } catch {
    return jsonResponse({ error: 'JSON invalide' }, 400);
  }

  if (!(await verifyTurnstile(request, env, cleanString(data.turnstile, 2048)))) {
    return jsonResponse({ error: 'Vérification anti-bot échouée' }, 400);
  }

  const email = cleanString(data.email, 254).toLowerCase();
  const pseudo = cleanString(data.pseudo, 40);
  const prenom = cleanString(data.prenom, 60);
  if (!isValidEmail(email)) return jsonResponse({ error: 'Adresse email invalide' }, 400);
  if (pseudo.length < 2) return jsonResponse({ error: 'Pseudo requis (2 à 40 caractères)' }, 400);
  if (data.rgpd !== true) return jsonResponse({ error: 'Consentement RGPD obligatoire' }, 400);

  const member = {
    email,
    pseudo,
    prenom,
    newsletter: data.newsletter === true,
    abonne: data.abonne === true,
    source: 'elramon-music-club',
  };

  try {
    const response = await fetchWithTimeout(`${env.SUPABASE_URL}/rest/v1/members?on_conflict=email`, {
      method: 'POST',
      headers: {
        apikey: env.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=ignore-duplicates,return=minimal',
      },
      body: JSON.stringify(member),
    });
    if (!response.ok) throw new Error(`Supabase ${response.status}`);
  } catch (error) {
    console.error('Subscribe database error:', error.message);
    return jsonResponse({ error: 'Impossible de finaliser l’inscription' }, 500);
  }

  if (env.RESEND_API_KEY) {
    try {
      const response = await fetchWithTimeout('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'El Ramon Music Club <onboarding@resend.dev>',
          to: ['elramonmusic@gmail.com'],
          subject: '[Nouveau membre] Inscription au Club',
          text: `Nouvelle inscription\n\nPseudo : ${pseudo}\nEmail : ${email}\nPrénom : ${prenom || 'Non renseigné'}\nNewsletter : ${member.newsletter ? 'Oui' : 'Non'}\nAbonné YouTube : ${member.abonne ? 'Oui' : 'Non'}`,
        }),
      });
      if (!response.ok) console.error('Resend subscribe notification failed:', response.status);
    } catch (error) {
      console.error('Resend subscribe notification error:', error.message);
    }
  }

  return jsonResponse({ success: true, message: 'Inscription enregistrée' });
}

export async function onRequestOptions() {
  return optionsResponse('POST, OPTIONS');
}
