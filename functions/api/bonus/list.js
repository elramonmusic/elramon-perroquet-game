export async function onRequestGet(context) {
  const { request, env } = context;

  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = env.SUPABASE_URL;
    const supabaseKey = env.SUPABASE_ANON_KEY;
    const supabaseServiceKey = env.SUPABASE_SERVICE_KEY;

    // Vérifier l'utilisateur
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { 'Authorization': `Bearer ${token}`, 'apikey': supabaseKey }
    });
    
    if (!userRes.ok) {
      return new Response(JSON.stringify({ error: "Token invalide" }), { status: 401 });
    }
    const userData = await userRes.json();
    const userId = userData.id;

    // Récupérer tous les bonus actifs
    const bonusRes = await fetch(`${supabaseUrl}/rest/v1/bonus_content?is_active=eq.true&order=created_at.asc`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!bonusRes.ok) {
      throw new Error("Erreur de lecture des bonus");
    }
    let allBonuses = await bonusRes.json();

    // Récupérer les déblocages de l'utilisateur
    const unlocksRes = await fetch(`${supabaseUrl}/rest/v1/bonus_unlocks?user_id=eq.${userId}&select=bonus_id`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    });

    let unlockedBonusIds = [];
    if (unlocksRes.ok) {
      const unlocks = await unlocksRes.json();
      unlockedBonusIds = unlocks.map(u => u.bonus_id);
    }

    // Sécuriser les URLs pour les contenus premium non débloqués
    const sanitizedBonuses = allBonuses.map(b => {
      const isUnlocked = unlockedBonusIds.includes(b.id);
      return {
        id: b.id,
        title: b.title,
        description: b.description,
        category: b.category,
        image_url: b.image_url,
        is_premium: b.is_premium,
        banana_cost: b.banana_cost,
        is_unlocked: isUnlocked,
        // Si premium et pas débloqué, on cache l'URL
        url: (b.is_premium && !isUnlocked) ? null : b.url
      };
    });

    return new Response(JSON.stringify(sanitizedBonuses), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
