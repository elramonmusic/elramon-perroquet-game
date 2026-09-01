import { enforceRateLimit, fetchWithTimeout, jsonResponse } from './utils/security.js';

const normalize = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    return jsonResponse({ error: 'Service indisponible' }, 503);
  }
  if (!(await enforceRateLimit(context, 'agent-site-search', 120, 300))) {
    return jsonResponse({ error: 'Trop de recherches' }, 429);
  }

  const query = new URL(request.url).searchParams.get('q')?.trim().slice(0, 200) || '';
  if (!query) return jsonResponse({ error: 'Le paramètre q est requis' }, 400);

  try {
    const endpoint = `${env.SUPABASE_URL}/rest/v1/agent_knowledge?select=slug,title,category,content,canonical_url,keywords,access_level,priority&is_active=eq.true&limit=100`;
    const response = await fetchWithTimeout(endpoint, {
      headers: {
        apikey: env.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      },
    });
    if (!response.ok) throw new Error(`Supabase ${response.status}`);

    const terms = normalize(query).split(' ').filter((term) => term.length > 1);
    const entries = (await response.json()).map((entry) => {
      const title = normalize(entry.title);
      const category = normalize(entry.category);
      const keywords = normalize((entry.keywords || []).join(' '));
      const content = normalize(entry.content);
      let score = Number(entry.priority || 0) / 100;
      for (const term of terms) {
        if (title.includes(term)) score += 8;
        if (keywords.includes(term)) score += 6;
        if (category.includes(term)) score += 4;
        if (content.includes(term)) score += 2;
      }
      return { ...entry, score };
    }).filter((entry) => entry.score > 1)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(({ score, keywords, priority, ...entry }) => entry);

    return jsonResponse({ query, results: entries });
  } catch (error) {
    console.error('Agent site search error:', error.message);
    return jsonResponse({ error: 'Recherche indisponible' }, 502);
  }
}

