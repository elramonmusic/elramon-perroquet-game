/**
 * Cloudflare Pages Function — /functions/collaboration
 * Gère les demandes de collaboration commerciale
 *
 * POST /functions/collaboration
 * Body: { company, contact, email, website, type, product, budget, message }
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

  const { company, contact, email, website, type, product, budget, message } = data;

  // Validation
  if (!company || company.length < 2) {
    return new Response(JSON.stringify({ error: "Nom d'entreprise requis" }), {
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

  // Construction de la demande
  const collaboration = {
    company: company.trim(),
    contact_name: contact ? contact.trim() : '',
    email: email.toLowerCase().trim(),
    website: website ? website.trim() : '',
    collab_type: type || 'non_specifie',
    product: product ? product.trim() : '',
    budget: budget || 'non_specifie',
    message: message.trim(),
    status: 'nouveau',
    created_at: new Date().toISOString(),
    ip: request.headers.get('cf-connecting-ip') || 'unknown',
  };

  // Stockage Supabase (via variables d'environnement Cloudflare)
  if (env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY) {
    try {
      await fetch(`${env.SUPABASE_URL}/rest/v1/collaborations`, {
        method: 'POST',
        headers: {
          'apikey': env.SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(collaboration),
      });
    } catch (err) {
      console.error('Supabase error:', err.message);
    }
  }

  // Notification email via Resend
  if (env.RESEND_API_KEY) {
    const resendFrom = 'El Ramon Music <onboarding@elramon-music-club.onresend.com>';

    // Email 1 — Notification admin
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: resendFrom,
          to: ['elramonmusic@gmail.com'],
          reply_to: collaboration.email,
          subject: `[Collaboration] ${collaboration.company} — ${collaboration.collab_type}`,
          text: `Nouvelle demande de collaboration\n\nEntreprise: ${collaboration.company}\nContact: ${collaboration.contact_name}\nEmail: ${collaboration.email}\nSite: ${collaboration.website}\nType: ${collaboration.collab_type}\nProduit: ${collaboration.product}\nBudget: ${collaboration.budget}\n\nMessage:\n${collaboration.message}`,
        }),
      });
    } catch (err) {
      console.error('Resend admin email error:', err.message);
    }

    // Email 2 — Accusé de réception au collaborateur
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: resendFrom,
          to: [collaboration.email],
          subject: `Ta demande de collaboration est bien reçue ! — El Ramon Music Club`,
          text: `Salut ${collaboration.contact_name || collaboration.company} !

Merci pour ta proposition de collaboration (${collaboration.collab_type}).

Nous avons bien reçu ta demande et nous reviendrons vers toi rapidement pour en discuter.

En attendant, découvre le projet :
📺 Chaîne YouTube : https://www.youtube.com/@El-Ramon-Music
🌐 Site : https://9ba25447.elramon-music-club.pages.dev/

À très vite !
— El Ramon 🦜`,
        }),
      });
    } catch (err) {
      console.error('Resend auto-reply error:', err.message);
    }
  }

  console.log(`Demande collaboration: ${collaboration.company} (${collaboration.email})`);

  return new Response(JSON.stringify({
    success: true,
    message: 'Demande de collaboration envoyée',
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
