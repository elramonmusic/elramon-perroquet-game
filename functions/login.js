/**
 * Cloudflare Pages Function -> /login
 * Vérifie si un email existe dans la table members de Supabase.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

import { createSessionCookie } from './utils/session.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  let data;
  try {
    data = await request.json();
  } catch (err) {
    return new Response(JSON.stringify({ error: 'JSON invalide' }), { status: 400, headers: CORS_HEADERS });
  }

  const { email } = data;

  if (!email) {
    return new Response(JSON.stringify({ error: 'Email manquant' }), { status: 400, headers: CORS_HEADERS });
  }

  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    return new Response(JSON.stringify({ error: 'Configuration serveur manquante' }), { status: 500, headers: CORS_HEADERS });
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    // Interroger Supabase pour vérifier si le membre existe
    const response = await fetch(`${env.SUPABASE_URL}/rest/v1/members?email=eq.${encodeURIComponent(cleanEmail)}&select=email,pseudo,prenom,role`, {
      method: 'GET',
      headers: {
        'apikey': env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`
      }
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Erreur base de données' }), { status: 500, headers: CORS_HEADERS });
    }

    const members = await response.json();

    if (members && members.length > 0) {
      // Membre trouvé
      const member = members[0];
      
      // Générer le cookie de session sécurisé
      let headers = new Headers(CORS_HEADERS);
      if (env.SESSION_SECRET) {
        const cookieHeader = await createSessionCookie(
          { email: member.email, pseudo: member.pseudo, role: member.role || 'member' },
          env.SESSION_SECRET
        );
        headers.append('Set-Cookie', cookieHeader);
      } else {
        console.error('SESSION_SECRET manquant. Le cookie ne sera pas généré.');
      }

      return new Response(JSON.stringify(member), { status: 200, headers });
    } else {
      // Aucun membre avec cet email
      return new Response(JSON.stringify({ error: 'Aucun compte trouvé avec cet email.' }), { status: 404, headers: CORS_HEADERS });
    }

  } catch (err) {
    console.error('Login error:', err.message);
    return new Response(JSON.stringify({ error: 'Erreur serveur' }), { status: 500, headers: CORS_HEADERS });
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
