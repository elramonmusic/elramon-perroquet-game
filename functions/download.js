import { verifySessionCookie } from './utils/session.js';

const FILES_WHITELIST = {
  "suno-starter": {
    path: "/protected-downloads/prompts/pack-suno-tropical-starter.pdf",
    filename: "pack-suno-tropical-starter.pdf"
  },
  "youtube-prompts": {
    path: "/protected-downloads/prompts/pack-el-ramon-youtube-prompts.pdf",
    filename: "pack-el-ramon-youtube-prompts.pdf"
  },
  "clips-shorts-ia": {
    path: "/protected-downloads/prompts/pack-clips-shorts-ia.pdf",
    filename: "pack-clips-shorts-ia.pdf"
  },
  "flow-music-tropical": {
    path: "/protected-downloads/prompts/pack-flow-music-tropical.pdf",
    filename: "pack-flow-music-tropical.pdf"
  }
};

const ALLOWED_ROLES = ['member', 'premium', 'partner', 'admin'];

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const fileKey = url.searchParams.get('file');

  // 1. Vérification de la whitelist
  if (!fileKey || !FILES_WHITELIST[fileKey]) {
    return new Response(JSON.stringify({ error: 'Fichier introuvable' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  }

  const fileInfo = FILES_WHITELIST[fileKey];

  // 2. Lecture du cookie de session
  const cookieHeader = request.headers.get('Cookie');
  
  if (!cookieHeader || !cookieHeader.includes('erm_session=')) {
    // Non connecté
    return Response.redirect(`${url.origin}/pages/login.html`, 302);
  }

  if (!env.SESSION_SECRET || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    return new Response(JSON.stringify({ error: 'Configuration serveur manquante' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  // 3. Vérification de la signature cryptographique
  const session = await verifySessionCookie(cookieHeader, env.SESSION_SECRET);
  if (!session) {
    // Token invalide ou expiré
    return Response.redirect(`${url.origin}/pages/login.html`, 302);
  }

  // 4. Vérification du membre dans Supabase
  try {
    const supabaseResp = await fetch(`${env.SUPABASE_URL}/rest/v1/members?email=eq.${encodeURIComponent(session.email)}&select=role`, {
      headers: {
        'apikey': env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`
      }
    });

    if (!supabaseResp.ok) {
      throw new Error('Supabase fetch failed');
    }

    const members = await supabaseResp.json();
    if (!members || members.length === 0) {
      // Membre n'existe plus
      return Response.redirect(`${url.origin}/pages/login.html`, 302);
    }

    const memberRole = members[0].role || 'member';

    // 5. Vérification du rôle
    if (!ALLOWED_ROLES.includes(memberRole)) {
      return new Response(JSON.stringify({ error: 'Accès réservé aux membres' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    // 6. Journalisation du téléchargement (optionnelle, fire and forget)
    const ip = request.headers.get('cf-connecting-ip') || '';
    const ua = request.headers.get('user-agent') || '';
    
    // Hash IP/UA pour anonymisation
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip + ua));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const logEntry = {
      member_email: session.email,
      file_key: fileKey,
      ip_hash: hashHex.substring(0, 16),
      user_agent_hash: hashHex.substring(16, 32)
    };

    // Fire and forget, pas de await bloquant
    context.waitUntil(
      fetch(`${env.SUPABASE_URL}/rest/v1/download_logs`, {
        method: 'POST',
        headers: {
          'apikey': env.SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(logEntry)
      }).catch(err => console.error('Erreur logging download:', err.message))
    );

    // 7. Servir le PDF
    // Utiliser env.ASSETS.fetch pour accéder aux fichiers internes statiques de Pages
    const assetUrl = new URL(fileInfo.path, request.url);
    const assetRequest = new Request(assetUrl);
    const assetResponse = await env.ASSETS.fetch(assetRequest);

    if (!assetResponse.ok) {
      return new Response(JSON.stringify({ error: 'Fichier interne introuvable' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    // Construire la réponse de téléchargement
    const headers = new Headers(assetResponse.headers);
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `attachment; filename="${fileInfo.filename}"`);
    // Retirer les headers de cache agressifs éventuels
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

    return new Response(assetResponse.body, {
      status: 200,
      headers: headers
    });

  } catch (err) {
    console.error('Download API error:', err.message);
    return new Response(JSON.stringify({ error: 'Erreur serveur' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
