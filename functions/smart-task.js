const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // Gestion de la typo GROQ_APT_KEY vue sur la capture d'écran de l'utilisateur
  const groqApiKey = env.GROQ_API_KEY || env.GROQ_APT_KEY;
  const supabaseServiceKey = env.SUPABASE_SERVICE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = env.SUPABASE_URL;

  if (!groqApiKey || !supabaseServiceKey || !supabaseUrl) {
    return new Response(JSON.stringify({ error: "Configuration API manquante sur le serveur." }), {
      status: 500, headers: CORS_HEADERS
    });
  }

  try {
    // 1. Authentification de l'utilisateur (Vérification du JWT)
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non autorisé." }), { status: 401, headers: CORS_HEADERS });
    }

    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'apikey': supabaseServiceKey
      }
    });

    if (!userRes.ok) {
      return new Response(JSON.stringify({ error: "Session invalide. Essaie de te reconnecter." }), { status: 401, headers: CORS_HEADERS });
    }
    const user = await userRes.json();
    const userId = user.id;

    // 2. Vérification du solde (Bananes / Questions gratuites)
    const profileRes = await fetch(`${supabaseUrl}/rest/v1/members?id=eq.${userId}&select=free_questions_used,bananas_balance,prenom,pseudo`, {
      method: 'GET',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      }
    });

    if (!profileRes.ok) {
      const errText = await profileRes.text();
      console.error("Profile fetch error:", errText);
      return new Response(JSON.stringify({ error: "Erreur lors de la lecture de ton profil Supabase." }), { status: 500, headers: CORS_HEADERS });
    }
    
    const profiles = await profileRes.json();
    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ error: "Profil introuvable dans la base de données." }), { status: 404, headers: CORS_HEADERS });
    }
    
    const profile = profiles[0];
    let freeQuestionsUsed = profile.free_questions_used || 0;
    let bananas = profile.bananas_balance || 0;
    const userName = profile.prenom || profile.pseudo || 'Amigo';

    const isFree = freeQuestionsUsed < 3;
    if (!isFree && bananas < 1) {
      return new Response(JSON.stringify({ 
        error: 'solde_insuffisant',
        message: "Ton panier de bananes est vide 🍌 Va jouer au Perroquet Tropical pour en gagner, puis reviens me poser ta question 🦜☀️",
        free_questions_used: freeQuestionsUsed,
        remaining_bananas: bananas
      }), { status: 403, headers: CORS_HEADERS });
    }

    // 3. Lire la question de l'utilisateur
    const body = await request.json();
    const question = body.question;
    
    if (!question || typeof question !== 'string') {
      return new Response(JSON.stringify({ error: "Question invalide." }), { status: 400, headers: CORS_HEADERS });
    }

    // 4. Appel à l'API Groq (Llama 3)
    const systemPrompt = `Tu es Ramonito, le perroquet mascotte officiel du 'El Ramon Music Club'. 
    Ton ton est très fun, chaleureux, tropical, et légèrement décalé. Tu utilises souvent des émojis tropicaux (🦜, 🌴, 🍍, 🍌, 🎶).
    Tu devez répondre de manière très concise (2 ou 3 phrases maximum) pour garder l'interface du chat lisible.
    Tu t'adresses à l'utilisateur en l'appelant par son prénom ou pseudo : ${userName}.
    L'utilisateur te pose une question musicale ou sur le club, réponds-lui avec panache !`;

    const groqPayload = {
      model: "llama3-8b-8192", // Modèle ultra-rapide de Groq
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question }
      ],
      temperature: 0.7,
      max_tokens: 300
    };

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(groqPayload)
    });

    if (!groqRes.ok) {
      console.error("Groq API error", await groqRes.text());
      return new Response(JSON.stringify({ error: "Erreur du cerveau de Ramonito." }), { status: 500, headers: CORS_HEADERS });
    }

    const groqData = await groqRes.json();
    const answer = groqData.choices[0].message.content;

    // 5. Déduction du paiement
    if (isFree) {
      freeQuestionsUsed += 1;
    } else {
      bananas -= 1;
    }

    const updateRes = await fetch(`${supabaseUrl}/rest/v1/members?id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        free_questions_used: freeQuestionsUsed,
        bananas_balance: bananas
      })
    });

    if (!updateRes.ok) {
      console.error("Update profile error", await updateRes.text());
    }

    // 6. Retourner la réponse et les nouveaux soldes
    return new Response(JSON.stringify({
      answer: answer,
      free_questions_used: freeQuestionsUsed,
      remaining_bananas: bananas
    }), { status: 200, headers: CORS_HEADERS });

  } catch (error) {
    console.error("Unexpected error in smart-task", error);
    return new Response(JSON.stringify({ error: "Erreur interne serveur." }), { status: 500, headers: CORS_HEADERS });
  }
}
