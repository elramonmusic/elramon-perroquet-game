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

  // Vérification Turnstile anti-bot
  if (env.TURNSTILE_SECRET_KEY) {
    const turnstileToken = data.turnstile;
    if (!turnstileToken) {
      return new Response(JSON.stringify({ error: 'Vérification anti-bot requise' }), {
        status: 400,
        headers: CORS_HEADERS,
      });
    }
    try {
      const cfResp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: env.TURNSTILE_SECRET_KEY,
          response: turnstileToken,
        }),
      });
      const cfResult = await cfResp.json();
      if (!cfResult.success) {
        return new Response(JSON.stringify({ error: 'Vérification anti-bot échouée' }), {
          status: 400,
          headers: CORS_HEADERS,
        });
      }
    } catch (err) {
      console.error('Turnstile verification error:', err.message);
    }
  }

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

  // Notification email via Resend
  // ⚠️ Domaine non vérifié : on utilise le sandbox onboarding@resend.dev
  //     Le from temporaire ne peut envoyer QUE vers elramonmusic@gmail.com
  //     TODO V2 : vérifier un vrai domaine (notifications.elramonmusicclub.fr)
  if (env.RESEND_API_KEY) {
    const resendFrom = 'El Ramon Music Club <onboarding@resend.dev>';
    const adminEmail = 'elramonmusic@gmail.com';

    // Email admin — notification du message de contact
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: resendFrom,
          to: [adminEmail],
          reply_to: contactMessage.email,
          subject: `[Contact] ${contactMessage.sujet} — ${contactMessage.nom}`,
          text: `Nouveau message de contact\n\nDe: ${contactMessage.nom} <${contactMessage.email}>\nSujet: ${contactMessage.sujet}\n\n${contactMessage.message}\n\nℹ️ L'auto-réponse au contacteur sera activée quand le domaine sera vérifié dans Resend.`,
        }),
      });
    } catch (err) {
      console.error('Resend admin email error:', err.message);
    }

    // TODO V2 : Auto-réponse au contacteur (désactivée tant que le domaine n'est pas vérifié)
    // Pour l'instant, onboarding@resend.dev ne peut envoyer qu'à elramonmusic@gmail.com
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
