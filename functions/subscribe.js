/**
 * Cloudflare Pages Function — /functions/subscribe
 * Gère les inscriptions au El Ramon Music Club
 *
 * POST /functions/subscribe
 * Body: { email, pseudo, prenom, newsletter, abonne, rgpd }
 *
 * V1 : stockage en variable d'environnement (KV ou D1 à venir)
 * V2 : intégration Supabase
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

  // V2 : Envoi vers Supabase (à configurer via variables d'environnement)
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
        // On continue même en cas d'erreur Supabase (fallback)
      }
    } catch (err) {
      console.error('Supabase fetch error:', err.message);
      // Fallback silencieux — le client gère déjà le localStorage
    }
  }

  // V2 : Envoi d'email de bienvenue (via Cloudflare Email Workers ou Resend)
  // À configurer quand le service email sera prêt

  // Log pour debug (désactivé en production via Cloudflare)
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
