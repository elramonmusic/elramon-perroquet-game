import {
  anonymizedClientHash,
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
    return jsonResponse({ error: 'Service de contact temporairement indisponible' }, 503);
  }
  if (!(await enforceRateLimit(context, 'contact', 5, 3600))) {
    return jsonResponse({ error: 'Trop de messages envoyés. Réessaie plus tard.' }, 429, { 'Retry-After': '3600' });
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

  const nom = cleanString(data.nom, 80);
  const email = cleanString(data.email, 254).toLowerCase();
  const sujet = cleanString(data.sujet, 120) || 'Non spécifié';
  const message = cleanString(data.message, 5000);
  if (nom.length < 2) return jsonResponse({ error: 'Nom requis (2 à 80 caractères)' }, 400);
  if (!isValidEmail(email)) return jsonResponse({ error: 'Adresse email invalide' }, 400);
  if (message.length < 20) return jsonResponse({ error: 'Message trop court (minimum 20 caractères)' }, 400);

  const contactMessage = {
    nom,
    email,
    sujet,
    message,
    ip: await anonymizedClientHash(request),
  };

  try {
    const response = await fetchWithTimeout(`${env.SUPABASE_URL}/rest/v1/contact_messages`, {
      method: 'POST',
      headers: {
        apikey: env.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(contactMessage),
    });
    if (!response.ok) throw new Error(`Supabase ${response.status}`);
  } catch (error) {
    console.error('Contact database error:', error.message);
    return jsonResponse({ error: 'Impossible d’enregistrer le message' }, 500);
  }

  if (env.RESEND_API_KEY) {
    try {
      const response = await fetchWithTimeout('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'El Ramon Music Club <onboarding@resend.dev>',
          to: ['elramonmusic@gmail.com'],
          reply_to: email,
          subject: `[Contact] ${sujet} — ${nom}`,
          text: `Nouveau message de contact\n\nDe : ${nom} <${email}>\nSujet : ${sujet}\n\n${message}`,
        }),
      });
      if (!response.ok) console.error('Resend contact notification failed:', response.status);
    } catch (error) {
      console.error('Resend contact notification error:', error.message);
    }
  }

  return jsonResponse({ success: true, message: 'Message envoyé avec succès' });
}

export async function onRequestOptions() {
  return optionsResponse('POST, OPTIONS');
}
