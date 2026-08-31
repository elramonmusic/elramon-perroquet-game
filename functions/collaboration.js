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
    return jsonResponse({ error: 'Service de collaboration temporairement indisponible' }, 503);
  }
  if (!(await enforceRateLimit(context, 'collaboration', 3, 3600))) {
    return jsonResponse({ error: 'Trop de demandes envoyées. Réessaie plus tard.' }, 429, { 'Retry-After': '3600' });
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

  const company = cleanString(data.company, 120);
  const contactName = cleanString(data.contact, 100);
  const email = cleanString(data.email, 254).toLowerCase();
  const website = cleanString(data.website, 500);
  const collabType = cleanString(data.type, 80) || 'non_specifie';
  const product = cleanString(data.product, 200);
  const budget = cleanString(data.budget, 80) || 'non_specifie';
  const message = cleanString(data.message, 8000);

  if (company.length < 2) return jsonResponse({ error: 'Nom d’entreprise requis' }, 400);
  if (!isValidEmail(email)) return jsonResponse({ error: 'Adresse email invalide' }, 400);
  if (message.length < 20) return jsonResponse({ error: 'Message trop court (minimum 20 caractères)' }, 400);
  if (website) {
    try {
      const parsed = new URL(website);
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('protocol');
    } catch {
      return jsonResponse({ error: 'Adresse du site web invalide' }, 400);
    }
  }

  const collaboration = {
    company,
    contact_name: contactName,
    email,
    website,
    collab_type: collabType,
    product,
    budget,
    message,
    status: 'nouveau',
    ip: await anonymizedClientHash(request),
  };

  try {
    const response = await fetchWithTimeout(`${env.SUPABASE_URL}/rest/v1/collaborations`, {
      method: 'POST',
      headers: {
        apikey: env.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(collaboration),
    });
    if (!response.ok) throw new Error(`Supabase ${response.status}`);
  } catch (error) {
    console.error('Collaboration database error:', error.message);
    return jsonResponse({ error: 'Impossible d’enregistrer la demande' }, 500);
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
          subject: `[Collaboration] ${company} — ${collabType}`,
          text: `Nouvelle demande de collaboration\n\nEntreprise : ${company}\nContact : ${contactName}\nEmail : ${email}\nSite : ${website}\nType : ${collabType}\nProduit : ${product}\nBudget : ${budget}\n\n${message}`,
        }),
      });
      if (!response.ok) console.error('Resend collaboration notification failed:', response.status);
    } catch (error) {
      console.error('Resend collaboration notification error:', error.message);
    }
  }

  return jsonResponse({ success: true, message: 'Demande de collaboration envoyée' });
}

export async function onRequestOptions() {
  return optionsResponse('POST, OPTIONS');
}
