import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const allowedOrigin = Deno.env.get('SITE_URL') || 'https://elramon-music-club.pages.dev';

function corsHeaders(req: Request) {
  const origin = req.headers.get('Origin');
  return {
    ...(origin === allowedOrigin ? { 'Access-Control-Allow-Origin': origin } : {}),
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Vary': 'Origin'
  };
}

function normalizeText(value: unknown) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function queryTerms(question: string) {
  return normalizeText(question).split(' ').filter((term) => term.length > 1);
}

serve(async (req) => {
  const responseHeaders = corsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: responseHeaders });
  }

  try {
    // 1. Authentifier l'utilisateur
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Non autorisé: Jeton manquant');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const supabaseServiceClient = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) {
      throw new Error('Non autorisé: Jeton invalide');
    }

    const { data: rateAllowed, error: rateError } = await supabaseServiceClient
      .rpc('check_rate_limit', {
        p_key_hash: user.id,
        p_action: 'smart-task-user',
        p_limit: 30,
        p_window_seconds: 300
      });
    if (rateError || rateAllowed !== true) {
      return new Response(JSON.stringify({ error: 'Trop de questions. Réessaie dans quelques minutes.' }), {
        status: 429,
        headers: { ...responseHeaders, 'Content-Type': 'application/json', 'Retry-After': '300' }
      });
    }

    // 2. Récupérer la question et l'historique récent
    const body = await req.json();
    const question = typeof body.question === 'string' ? body.question.trim() : '';
    const history = Array.isArray(body.history)
      ? body.history.slice(-8).flatMap((entry: unknown) => {
          if (!entry || typeof entry !== 'object') return [];
          const item = entry as { role?: unknown; content?: unknown };
          if (!['user', 'assistant'].includes(String(item.role)) || typeof item.content !== 'string') return [];
          return [{ role: String(item.role), content: item.content.slice(0, 1000) }];
        })
      : [];
    if (!question || question.length > 1000) {
      throw new Error('Question invalide (1 à 1000 caractères)');
    }

    // 3. Récupérer le profil membre
    const { data: member, error: memberError } = await supabaseClient
      .from('members')
      .select('bananas_balance, free_questions_used, prenom, pseudo')
      .eq('id', user.id)
      .single();

    if (memberError || !member) {
      throw new Error('Membre introuvable');
    }

    let freeQuestionsUsed = member.free_questions_used || 0;
    let bananas = member.bananas_balance || 0;
    const userName = member.prenom || member.pseudo || 'Amigo';

    let isFree = freeQuestionsUsed < 3;
    if (!isFree && bananas < 1) {
      return new Response(JSON.stringify({ 
        error: 'solde_insuffisant', 
        message: 'Ton panier de bananes est vide 🍌 Va jouer au Perroquet Tropical pour en gagner, puis reviens me poser ta question 🦜☀️' 
      }), {
        status: 403,
        headers: { ...responseHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 4. Chercher uniquement la connaissance et les produits pertinents.
    const [{ data: knowledge }, { data: products }] = await Promise.all([
      supabaseServiceClient
        .from('agent_knowledge')
        .select('title, category, content, canonical_url, keywords, access_level, priority')
        .eq('is_active', true)
        .limit(100),
      supabaseServiceClient
        .from('affiliate_products')
        .select('id, name, category, keywords, description, is_premium, banana_cost, disclosure, image_url, url, priority, use_cases, audience, recommendation_notes, merchant, link_status')
        .eq('is_active', true)
        .eq('link_status', 'active')
        .limit(100)
    ]);

    const terms = queryTerms(question);
    const selectedKnowledge = (knowledge || []).map((entry: any) => {
      const title = normalizeText(entry.title);
      const category = normalizeText(entry.category);
      const keywords = normalizeText((entry.keywords || []).join(' '));
      const content = normalizeText(entry.content);
      let score = Number(entry.priority || 0) / 100;
      for (const term of terms) {
        if (title.includes(term)) score += 8;
        if (keywords.includes(term)) score += 6;
        if (category.includes(term)) score += 4;
        if (content.includes(term)) score += 2;
      }
      return { ...entry, score };
    }).filter((entry: any) => entry.score > 1)
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 5);

    const selectedProducts = (products || []).map((product: any) => {
      const name = normalizeText(product.name);
      const category = normalizeText(product.category);
      const keywords = normalizeText((product.keywords || []).join(' '));
      const uses = normalizeText((product.use_cases || []).join(' '));
      const audience = normalizeText((product.audience || []).join(' '));
      const description = normalizeText(product.description);
      let score = Number(product.priority || 0) / 10;
      for (const term of terms) {
        if (name.includes(term)) score += 8;
        if (keywords.includes(term)) score += 7;
        if (uses.includes(term)) score += 6;
        if (audience.includes(term)) score += 5;
        if (category.includes(term)) score += 4;
        if (description.includes(term)) score += 2;
      }
      return { ...product, score };
    }).filter((product: any) => product.score > 2)
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 3);

    // 5. Configurer le prompt système et appeler Groq
    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY non configurée');
    }

    let systemPrompt = `Tu es Ramonito, le perroquet mascotte officiel du El Ramon Music Club, l'empire tropical du créateur El Ramon Music. 
Tu adores la musique tropicale, la chaleur, et tu lâches souvent des expressions en espagnol ou relatives aux fruits (bananes, ananas, cocotiers).
Ton but est d'animer le club, de conseiller les membres, et de faire la promotion des musiques et créations de ton boss El Ramon Music.
Tu es fun, drôle, parfois un peu espiègle. Réponds de façon concise, claire et utile, généralement en 3 à 5 phrases courtes.
Tu parles à l'utilisateur : ${userName}.

Règles absolues :
- Utilise uniquement les informations et liens officiels fournis ci-dessous.
- N'invente jamais une page, un lien, un prix, une promotion, un stock, une garantie ou une fonctionnalité.
- Indique quand une page est réservée aux membres.
- Si l'information manque, dis-le simplement puis oriente vers la page Contact.
- Ne demande jamais de mot de passe, de code OTP, de clé API ni de donnée bancaire.`;

    if (selectedKnowledge.length > 0) {
      systemPrompt += `\n\nConnaissance officielle pertinente :\n` + selectedKnowledge.map((entry: any) =>
        `- ${entry.title} [${entry.access_level}] : ${entry.content}${entry.canonical_url ? ` | Lien officiel : ${entry.canonical_url}` : ''}`
      ).join('\n');
    }

    if (selectedProducts.length > 0) {
      systemPrompt += `\n\nTu as accès aux produits pertinents du catalogue du Club. Recommande au maximum DEUX produits, uniquement si l'utilisateur demande un conseil commercial ou si cela répond directement à son besoin.
Consignes de recommandation :
- N'invente JAMAIS d'autres produits ou liens.
- Explique brièvement pourquoi le produit correspond au besoin.
- Indique clairement qu'il s'agit d'un lien partenaire ou affilié qui peut soutenir le Club.
- Ne donne jamais de prix ni de disponibilité : invite à les vérifier chez le marchand.
- Si le produit est premium (is_premium: true), tease-le (ex: "J'ai un secret tropical exclusif pour toi contre X bananes 🍌") et demande s'il veut le débloquer. Ne donne pas son lien.
- Tu DOIS obligatoirement ajouter la balise textuelle exacte [PRODUCT:id] à la toute fin de ta réponse pour déclencher l'affichage visuel du produit. (ex: [PRODUCT:1234-5678]).
Produits disponibles :\n` + selectedProducts.map((p: any) => `- ID: ${p.id} | Nom: ${p.name} | Catégorie: ${p.category} | Marchand: ${p.merchant || 'partenaire'} | Coût premium: ${p.banana_cost} bananes | Description: ${p.description} | Mention: ${p.disclosure || 'Lien partenaire'}`).join('\n');
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []).slice(-8),
      { role: 'user', content: question }
    ];

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(15000),
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: messages,
        temperature: 0.7,
        max_tokens: 250
      })
    });

    if (!groqResponse.ok) {
      throw new Error('Erreur lors de la communication avec l\'IA (Groq)');
    }

    const groqData = await groqResponse.json();
    const answer = groqData.choices[0].message.content;

    // 6. Débiter atomiquement l'utilisateur après une réponse IA réussie.
    const { data: credit, error: creditError } = await supabaseServiceClient
      .rpc('consume_ramonito_credit', { p_user_id: user.id });
    if (creditError) {
      console.error('consume_ramonito_credit failed:', creditError.message);
      throw new Error('Impossible de mettre à jour ton solde');
    }
    if (!credit?.allowed) {
      return new Response(JSON.stringify({
        error: credit?.error || 'solde_insuffisant',
        message: 'Ton panier de bananes est vide 🍌 Va jouer pour en gagner.'
      }), {
        status: 403,
        headers: { ...responseHeaders, 'Content-Type': 'application/json' }
      });
    }
    isFree = credit.isFree === true;
    freeQuestionsUsed = Number(credit.freeQuestionsUsed || 0);
    bananas = Number(credit.bananasBalance || 0);

    // 7. Enregistrer le message
    const { error: messageError } = await supabaseServiceClient.from('ramonito_messages')
      .insert({
        user_id: user.id,
        question: question,
        answer: answer,
        cost_bananas: isFree ? 0 : 1,
        used_free_question: isFree,
        provider: 'Groq',
        model: 'llama-3.1-8b-instant'
      });
    if (messageError) console.error('Ramonito message log failed:', messageError.message);

    // 8. Retourner la réponse et la liste des produits pour le widget (en masquant l'URL des produits premium pour la sécurité)
    const sanitizedProducts = selectedProducts.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      description: p.description,
      is_premium: p.is_premium,
      banana_cost: p.banana_cost,
      disclosure: p.disclosure,
      image_url: p.image_url,
      url: p.is_premium ? null : p.url
    }));

    return new Response(JSON.stringify({
      answer: answer,
      remaining_bananas: bananas,
      free_questions_used: freeQuestionsUsed,
      matched_products: sanitizedProducts
    }), {
      status: 200,
      headers: { ...responseHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('smart-task error:', error?.message || 'unknown');
    const publicMessage = String(error?.message || '').startsWith('Non autorisé')
      ? 'Session invalide ou expirée'
      : 'Ramonito est momentanément indisponible';
    return new Response(JSON.stringify({ error: publicMessage }), {
      status: 400,
      headers: { ...responseHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Cache bust
