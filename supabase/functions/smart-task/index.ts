import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
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

    // 2. Récupérer la question
    const body = await req.json();
    const { question } = body;
    if (!question) {
      throw new Error('Question manquante');
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 4. Recherche de produits d'affiliation actifs
    const { data: products } = await supabaseServiceClient
      .from('affiliate_products')
      .select('id, name, category, keywords, description, is_premium, banana_cost, disclosure, image_url')
      .eq('is_active', true);

    const questionLower = question.toLowerCase();
    const matchedProducts = [];
    if (products) {
      for (const p of products) {
        const keywords = p.keywords || [];
        const matchesKeyword = keywords.some((kw: string) => questionLower.includes(kw.toLowerCase()));
        const matchesCategory = questionLower.includes(p.category.toLowerCase());
        if (matchesKeyword || matchesCategory) {
          matchedProducts.push(p);
        }
      }
    }
    
    // Garder jusqu'à 3 produits pertinents
    const selectedProducts = matchedProducts.slice(0, 3);

    // 5. Configurer le prompt système et appeler Groq
    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY non configurée');
    }

    let systemPrompt = `Tu es Ramonito, le perroquet mascotte officiel du El Ramon Music Club. Tu parles avec un ton enjoué, parfois tu lâches des expressions en espagnol ou relatives aux fruits tropicaux. Réponds de façon concise et amusante (maximum 2-3 phrases) à l'utilisateur : ${userName}.`;
    
    if (selectedProducts.length > 0) {
      systemPrompt += `\n\nTu as accès aux produits d'affiliation suivants du club qui sont très pertinents pour la conversation en cours. Si (et seulement si) la conversation s'y prête de façon extrêmement naturelle et sans forcer, tu peux recommander l'un de ces produits de manière utile et transparente.
      Consignes de recommandation :
      - N'invente JAMAIS d'autres produits ou liens.
      - Si le produit est premium (is_premium: true), tu ne dois pas donner son lien direct dans ton texte. Tease-le en disant qu'il s'agit d'une recommandation premium secrète tropicale déblocable pour ${selectedProducts[0].banana_cost} bananes 🍌, et demande-lui s'il souhaite l'ouvrir.
      - Si le produit est gratuit, mentionne simplement que c'est une recommandation/sélection partenaire du club.
      - Pour chaque produit recommandé, tu DOIS obligatoirement accoler la balise textuelle exacte [PRODUCT:${selectedProducts[0].id}] à la fin de ta réponse (sans espaces additionnels).
      Voici les produits disponibles :\n` + selectedProducts.map(p => `- ID: ${p.id} | Nom: ${p.name} | Premium: ${p.is_premium} | Coût: ${p.banana_cost} bananes | Description: ${p.description} | Mention: ${p.disclosure}`).join('\n');
    }

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        temperature: 0.7,
        max_tokens: 250
      })
    });

    if (!groqResponse.ok) {
      throw new Error('Erreur lors de la communication avec l\'IA (Groq)');
    }

    const groqData = await groqResponse.json();
    const answer = groqData.choices[0].message.content;

    // 6. Débiter l'utilisateur
    if (isFree) {
      freeQuestionsUsed += 1;
      await supabaseServiceClient.from('members')
        .update({ free_questions_used: freeQuestionsUsed })
        .eq('id', user.id);
    } else {
      bananas -= 1;
      await supabaseServiceClient.from('members')
        .update({ bananas_balance: bananas })
        .eq('id', user.id);
        
      await supabaseServiceClient.from('banana_ledger')
        .insert({ 
          user_id: user.id, 
          amount: -1, 
          reason: 'Question à Ramonito', 
          type: 'spend' 
        });
    }

    // 7. Enregistrer le message
    await supabaseServiceClient.from('ramonito_messages')
      .insert({
        user_id: user.id,
        question: question,
        answer: answer,
        cost_bananas: isFree ? 0 : 1,
        used_free_question: isFree,
        provider: 'Groq',
        model: 'llama-3.1-8b-instant'
      });

    // 8. Retourner la réponse et la liste des produits pour le widget
    return new Response(JSON.stringify({
      answer: answer,
      remaining_bananas: bananas,
      free_questions_used: freeQuestionsUsed,
      matched_products: selectedProducts
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
