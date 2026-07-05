/**
 * Cloudflare Pages Function — /functions/subscribe
 * Gère les inscriptions au El Ramon Music Club
 * Clés Supabase : env.SUPABASE_URL + env.SUPABASE_SERVICE_KEY (via Cloudflare env vars)
 *
 * POST /subscribe
 * Body: { email, pseudo, prenom, newsletter, abonne, rgpd }
 *
 * V2 : stockage en variable d'environnement (KV ou D1 à venir)
 *      → intégration Supabase (via env.SUPABASE_URL + env.SUPABASE_SERVICE_KEY)
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

// Simple validation d'email
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // Validation du content-type
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return new Response(JSON.stringify({ error: 'Content-Type doit être application/json' }), {
      status: 415,
      headers: CORS_HEADERS,
    });
  }

  let data;
  try {
    data = await request.json();
  } catch (err) {
    return new Response(JSON.stringify({ error: 'JSON invalide' }), {
      status: 400,
      headers: CORS_HEADERS,
    });
  }

  const { email, pseudo, prenom, newsletter, abonne, rgpd } = data;

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

  // Validation des champs obligatoires
  if (!email || !isValidEmail(email)) {
    return new Response(JSON.stringify({ error: 'Adresse email invalide ou manquante' }), {
      status: 400,
      headers: CORS_HEADERS,
    });
  }

  if (!pseudo || pseudo.length < 2) {
    return new Response(JSON.stringify({ error: 'Pseudo requis (min. 2 caractères)' }), {
      status: 400,
      headers: CORS_HEADERS,
    });
  }

  if (!rgpd) {
    return new Response(JSON.stringify({ error: 'Consentement RGPD obligatoire' }), {
      status: 400,
      headers: CORS_HEADERS,
    });
  }

  // Construction de l'enregistrement membre
  const member = {
    email: email.toLowerCase().trim(),
    pseudo: pseudo.trim(),
    prenom: prenom ? prenom.trim() : '',
    newsletter: !!newsletter,
    abonne: !!abonne,
    role: 'member',
    created_at: new Date().toISOString(),
    source: 'elramon-music-club',
  };

  // Stockage Supabase (via variables d'environnement Cloudflare)
  if (env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY) {
    try {
      const supabaseResponse = await fetch(`${env.SUPABASE_URL}/rest/v1/members`, {
        method: 'POST',
        headers: {
          'apikey': env.SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify(member),
      });

      if (!supabaseResponse.ok) {
        console.error('Supabase error:', await supabaseResponse.text());
      }
    } catch (err) {
      console.error('Supabase fetch error:', err.message);
    }
  }

  // Notification email via Resend
  // ⚠️ Domaine non vérifié : on utilise le sandbox onboarding@resend.dev
  //     Le from temporaire ne peut envoyer QUE vers elramonmusic@gmail.com
  //     TODO V2 : vérifier un vrai domaine (notifications.elramonmusicclub.fr)
  if (env.RESEND_API_KEY) {
    const resendFrom = 'El Ramon Music Club <onboarding@resend.dev>';
    const adminEmail = 'elramonmusic@gmail.com';

    // Email 1 — Notification admin (nouveau membre)
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
          subject: `[Nouveau membre] ${member.pseudo} (${member.email})`,
          text: `Nouveau membre inscrit

Pseudo : ${member.pseudo}
Email : ${member.email}
Prénom : ${member.prenom || 'Non renseigné'}
Newsletter : ${member.newsletter ? 'Oui' : 'Non'}
Abonné YouTube : ${member.abonne ? 'Oui' : 'Non'}
Date : ${member.created_at}

ℹ️ L'email de bienvenue au membre sera activé quand le domaine sera vérifié dans Resend.`,
        }),
      });
    } catch (err) {
      console.error('Resend admin notification error:', err.message);
    }

    // TODO V2 : Email de bienvenue au membre (désactivé tant que le domaine n'est pas vérifié)
    // Pour l'instant, onboarding@resend.dev ne peut envoyer qu'à elramonmusic@gmail.com
  }

  console.log(`Nouvelle inscription: ${member.email} (${member.pseudo})`);

  return new Response(JSON.stringify({
    success: true,
    message: 'Bienvenue dans le El Ramon Music Club !',
    member: { email: member.email, pseudo: member.pseudo, role: member.role },
  }), {
    status: 200,
    headers: CORS_HEADERS,
  });
}

// Gestion des requêtes OPTIONS (CORS preflight)
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}
