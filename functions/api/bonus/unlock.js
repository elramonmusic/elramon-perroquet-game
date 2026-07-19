export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
    }

    const { bonusId } = await request.json();
    if (!bonusId) {
      return new Response(JSON.stringify({ error: "ID du bonus manquant" }), { status: 400 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = env.SUPABASE_URL;
    const supabaseKey = env.SUPABASE_ANON_KEY;
    const supabaseServiceKey = env.SUPABASE_SERVICE_KEY;

    // 1. Authentifier l'utilisateur
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { 'Authorization': `Bearer ${token}`, 'apikey': supabaseKey }
    });
    
    if (!userRes.ok) {
      return new Response(JSON.stringify({ error: "Token invalide" }), { status: 401 });
    }
    const userData = await userRes.json();
    const userId = userData.id;

    // 2. Récupérer le bonus
    const bonusRes = await fetch(`${supabaseUrl}/rest/v1/bonus_content?id=eq.${bonusId}&select=*`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      }
    });

    const bonuses = await bonusRes.json();
    if (!bonuses || bonuses.length === 0) {
      return new Response(JSON.stringify({ error: "Bonus introuvable" }), { status: 404 });
    }
    const bonus = bonuses[0];

    // Vérifier s'il est déjà débloqué
    const checkRes = await fetch(`${supabaseUrl}/rest/v1/bonus_unlocks?user_id=eq.${userId}&bonus_id=eq.${bonusId}`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      }
    });
    const checkData = await checkRes.json();
    if (checkData && checkData.length > 0) {
      return new Response(JSON.stringify({ success: true, url: bonus.url }), { status: 200 });
    }

    if (!bonus.is_premium || bonus.banana_cost <= 0) {
      return new Response(JSON.stringify({ success: true, url: bonus.url }), { status: 200 });
    }

    // 3. Récupérer le solde du membre
    const memberRes = await fetch(`${supabaseUrl}/rest/v1/members?id=eq.${userId}&select=bananas_balance`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      }
    });
    const members = await memberRes.json();
    if (!members || members.length === 0) {
      return new Response(JSON.stringify({ error: "Membre introuvable" }), { status: 404 });
    }
    
    let currentBananas = members[0].bananas_balance || 0;
    
    if (currentBananas < bonus.banana_cost) {
      return new Response(JSON.stringify({ error: "Fonds insuffisants" }), { status: 403 });
    }

    const newBalance = currentBananas - bonus.banana_cost;

    // 4. Mettre à jour le solde
    const updateRes = await fetch(`${supabaseUrl}/rest/v1/members?id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ bananas_balance: newBalance })
    });

    if (!updateRes.ok) {
      throw new Error("Erreur lors de la mise à jour du solde");
    }

    // 5. Enregistrer le déblocage
    await fetch(`${supabaseUrl}/rest/v1/bonus_unlocks`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ user_id: userId, bonus_id: bonusId })
    });

    // 6. Historique transaction
    await fetch(`${supabaseUrl}/rest/v1/banana_ledger`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ 
        user_id: userId, 
        amount: -bonus.banana_cost, 
        reason: `Déblocage bonus : ${bonus.title}`, 
        type: 'spend' 
      })
    });

    return new Response(JSON.stringify({ 
      success: true, 
      url: bonus.url, 
      bananasBalance: newBalance 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
