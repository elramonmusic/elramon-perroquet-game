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
      ? body.history.slice(-6).flatMap((entry: unknown) => {
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

    // 4. Récupérer tous les produits d'affiliation actifs pour l'IA
    const { data: products } = await supabaseServiceClient
      .from('affiliate_products')
      .select('id, name, category, keywords, description, is_premium, banana_cost, disclosure, image_url, url')
      .eq('is_active', true)
      .limit(10); // Limite au cas où il y a trop de produits pour le prompt

    const selectedProducts = products || [];

    // 5. Configurer le prompt système et appeler Groq
    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY non configurée');
    }

    let systemPrompt = `Tu es Ramonito, le perroquet mascotte officiel du El Ramon Music Club, l'empire tropical du créateur El Ramon Music. 
Tu adores la musique tropicale, la chaleur, et tu lâches souvent des expressions en espagnol ou relatives aux fruits (bananes, ananas, cocotiers).
Ton but est d'animer le club, de conseiller les membres, et de faire la promotion des musiques et créations de ton boss El Ramon Music.
Tu es fun, drôle, parfois un peu espiègle. Réponds de façon très concise et vivante (maximum 2 à 3 phrases courtes). 
Tu parles à l'utilisateur : ${userName}.`;

    if (selectedProducts.length > 0) {
      systemPrompt += `\n\nTu as accès au catalogue de recommandations du club. Si (et seulement si) la conversation s'y prête de façon extrêmement naturelle, recommande UN des produits ci-dessous pour aider l'utilisateur.
Consignes de recommandation :
- N'invente JAMAIS d'autres produits ou liens.
- Si le produit est premium (is_premium: true), tease-le (ex: "J'ai un secret tropical exclusif pour toi contre X bananes 🍌") et demande s'il veut le débloquer. Ne donne pas son lien.
- Tu DOIS obligatoirement ajouter la balise textuelle exacte [PRODUCT:id] à la toute fin de ta réponse pour déclencher l'affichage visuel du produit. (ex: [PRODUCT:1234-5678]).
Voici les produits disponibles :\n` + selectedProducts.map(p => `- ID: ${p.id} | Nom: ${p.name} | Coût: ${p.banana_cost} bananes | Description: ${p.description}`).join('\n');
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []).slice(-6), // Garde les 6 derniers messages de contexte
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
