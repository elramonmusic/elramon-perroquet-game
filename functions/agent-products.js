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
    return jsonResponse({ error: 'Catalogue indisponible' }, 503);
  }
  if (!(await enforceRateLimit(context, 'agent-products', 120, 300))) {
    return jsonResponse({ error: 'Trop de recherches' }, 429);
  }

  const params = new URL(request.url).searchParams;
  const query = params.get('q')?.trim().slice(0, 200) || '';
  const requestedCategory = normalize(params.get('category')?.slice(0, 80) || '');
  if (!query && !requestedCategory) {
    return jsonResponse({ error: 'Le paramètre q ou category est requis' }, 400);
  }

  try {
    const fields = 'id,name,category,keywords,description,is_premium,banana_cost,disclosure,image_url,url,priority,use_cases,audience,recommendation_notes,merchant,link_status,last_verified_at';
    const endpoint = `${env.SUPABASE_URL}/rest/v1/affiliate_products?select=${fields}&is_active=eq.true&link_status=eq.active&limit=100`;
    const response = await fetchWithTimeout(endpoint, {
      headers: {
        apikey: env.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      },
    });
    if (!response.ok) throw new Error(`Supabase ${response.status}`);

    const terms = normalize(query).split(' ').filter((term) => term.length > 1);
    const ranked = (await response.json()).map((product) => {
      const name = normalize(product.name);
      const category = normalize(product.category);
      const keywords = normalize((product.keywords || []).join(' '));
      const uses = normalize((product.use_cases || []).join(' '));
      const audience = normalize((product.audience || []).join(' '));
      const description = normalize(product.description);
      let score = Number(product.priority || 0) / 10;
      if (requestedCategory && category.includes(requestedCategory)) score += 12;
      for (const term of terms) {
        if (name.includes(term)) score += 8;
        if (keywords.includes(term)) score += 7;
        if (uses.includes(term)) score += 6;
        if (audience.includes(term)) score += 5;
        if (category.includes(term)) score += 4;
        if (description.includes(term)) score += 2;
      }
      return { ...product, score };
    }).filter((product) => product.score > 1)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ score, url, ...product }) => ({
        ...product,
        url: product.is_premium ? null : url,
        landing_page: 'https://elramon-music-club.pages.dev/pages/selection-tropicale',
        price_policy: 'Vérifier le prix et la disponibilité chez le marchand. Ne jamais les inventer.',
      }));

    return jsonResponse({
      query,
      category: requestedCategory || null,
      affiliate_notice: 'Les liens proposés peuvent être affiliés et aider à soutenir El Ramon Music Club.',
      products: ranked,
    });
  } catch (error) {
    console.error('Agent product search error:', error.message);
    return jsonResponse({ error: 'Catalogue indisponible' }, 502);
  }
}

