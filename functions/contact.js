/**
 * Cloudflare Pages Function — /functions/contact
 * Gère les messages de contact du formulaire de la page /contact
 *
 * POST /functions/contact
 * Body: { nom, email, sujet, message }
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let data;
  try {
    data = await request.json();
  } catch (err) {
    return new Response(JSON.stringify({ error: 'JSON invalide' }), {
      status: 400,
      headers: CORS_HEADERS,
    });
  }

  const { nom, email, sujet, message } = data;

  // Validation
  if (!nom || nom.length < 2) {
    return new Response(JSON.stringify({ error: 'Nom requis' }), {
      status: 400,
      headers: CORS_HEADERS,
    });
  }

  if (!email || !isValidEmail(email)) {
    return new Response(JSON.stringify({ error: 'Adresse email invalide' }), {
      status: 400,
      headers: CORS_HEADERS,
    });
  }

  if (!message || message.length < 20) {
    return new Response(JSON.stringify({ error: 'Message trop court (min. 20 caractères)' }), {
      status: 400,
      headers: CORS_HEADERS,
    });
  }

  // Construction du message
  const contactMessage = {
    nom: nom.trim(),
    email: email.toLowerCase().trim(),
    sujet: sujet || 'Non spécifié',
    message: message.trim(),
    created_at: new Date().toISOString(),
    ip: request.headers.get('cf-connecting-ip') || 'unknown',
  };

  // Stockage Supabase (via variables d'environnement Cloudflare)
  if (env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY) {
    try {
      await fetch(`${env.SUPABASE_URL}/rest/v1/contact_messages`, {
        method: 'POST',
        headers: {
          'apikey': env.SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactMessage),
      });
    } catch (err) {
      console.error('Supabase error:', err.message);
    }
  }

  // V2 : Envoi email via Resend ou Cloudflare Email
  if (env.RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'El Ramon Music <noreply@elramonmusicclub.fr>',
          to: ['elramonmusic@gmail.com'],
          reply_to: contactMessage.email,
          subject: `[Contact] ${contactMessage.sujet} — ${contactMessage.nom}`,
          text: `Nouveau message de contact\n\nDe: ${contactMessage.nom} <${contactMessage.email}>\nSujet: ${contactMessage.sujet}\n\n${contactMessage.message}`,
        }),
      });
    } catch (err) {
      console.error('Email error:', err.message);
    }
  }

  console.log(`Message de contact: ${contactMessage.email} - ${contactMessage.sujet}`);

  return new Response(JSON.stringify({
    success: true,
    message: 'Message envoyé avec succès',
  }), {
    status: 200,
    headers: CORS_HEADERS,
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}
