import { fetchWithTimeout } from './utils/security.js';

const markdownEscape = (value) => String(value || '').replace(/[<>]/g, '');

export async function onRequestGet({ env }) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    return new Response('Base de connaissance indisponible', { status: 503 });
  }

  try {
    const endpoint = `${env.SUPABASE_URL}/rest/v1/agent_knowledge?select=slug,title,category,content,canonical_url,keywords,access_level,priority,updated_at&is_active=eq.true&order=priority.desc,title.asc`;
    const response = await fetchWithTimeout(endpoint, {
      headers: {
        apikey: env.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      },
    });
    if (!response.ok) throw new Error(`Supabase ${response.status}`);

    const entries = await response.json();
    const sections = entries.map((entry) => {
      const keywords = Array.isArray(entry.keywords) ? entry.keywords.join(', ') : '';
      return [
        `## ${markdownEscape(entry.title)}`,
        `Catégorie : ${markdownEscape(entry.category)}`,
        `Accès : ${markdownEscape(entry.access_level)}`,
        keywords ? `Mots-clés : ${markdownEscape(keywords)}` : '',
        markdownEscape(entry.content),
        entry.canonical_url ? `Lien officiel : ${markdownEscape(entry.canonical_url)}` : '',
        `Dernière mise à jour : ${markdownEscape(entry.updated_at)}`,
      ].filter(Boolean).join('\n\n');
    });

    return new Response(`# Base de connaissance officielle de Ramonito\n\n${sections.join('\n\n---\n\n')}`, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Agent knowledge feed error:', error.message);
    return new Response('Base de connaissance indisponible', { status: 502 });
  }
}

