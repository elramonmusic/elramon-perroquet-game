const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    return new Response(JSON.stringify({ error: 'Configuration serveur manquante' }), { status: 500, headers: CORS_HEADERS });
  }

  try {
    // 1. Valider l'authentification (JWT)
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Non autorisé : Jeton manquant' }), { status: 401, headers: CORS_HEADERS });
    }

    const userRes = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'apikey': env.SUPABASE_SERVICE_KEY
      }
    });

    if (!userRes.ok) {
      return new Response(JSON.stringify({ error: 'Session invalide ou expirée.' }), { status: 401, headers: CORS_HEADERS });
    }

    const user = await userRes.json();
    const userId = user.id;

    // 2. Lire les données reçues
    const body = await request.json();
    const { productId } = body;
    if (!productId) {
      return new Response(JSON.stringify({ error: 'ID de produit manquant.' }), { status: 400, headers: CORS_HEADERS });
    }

    // 3. Récupérer le produit d'affiliation
    const productRes = await fetch(`${env.SUPABASE_URL}/rest/v1/affiliate_products?id=eq.${productId}&is_active=eq.true`, {
      method: 'GET',
      headers: {
        'apikey': env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`
      }
    });

    if (!productRes.ok) {
      return new Response(JSON.stringify({ error: 'Erreur lors de la récupération du produit.' }), { status: 500, headers: CORS_HEADERS });
    }

    const products = await productRes.json();
    if (products.length === 0) {
      return new Response(JSON.stringify({ error: 'Produit introuvable ou inactif.' }), { status: 404, headers: CORS_HEADERS });
    }

    const product = products[0];

    // Si le produit est gratuit, on peut renvoyer directement le lien
    if (!product.is_premium || product.banana_cost <= 0) {
      return new Response(JSON.stringify({ success: true, url: product.url }), { status: 200, headers: CORS_HEADERS });
    }

    // 4. Vérifier si l'utilisateur a déjà débloqué ce produit
    const unlockRes = await fetch(`${env.SUPABASE_URL}/rest/v1/affiliate_unlocks?user_id=eq.${userId}&product_id=eq.${productId}`, {
      method: 'GET',
      headers: {
        'apikey': env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`
      }
    });

    if (unlockRes.ok) {
      const unlocks = await unlockRes.json();
      if (unlocks.length > 0) {
        // Déjà débloqué par le passé ! Retourner l'URL directement.
        return new Response(JSON.stringify({ success: true, url: product.url, alreadyUnlocked: true }), { status: 200, headers: CORS_HEADERS });
      }
    }

    // 5. Récupérer la balance de bananes du membre
    const memberRes = await fetch(`${env.SUPABASE_URL}/rest/v1/members?id=eq.${userId}&select=id,bananas_balance`, {
      method: 'GET',
      headers: {
        'apikey': env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`
      }
    });

    if (!memberRes.ok) {
      return new Response(JSON.stringify({ error: 'Erreur lors de la récupération du profil.' }), { status: 500, headers: CORS_HEADERS });
    }

    const members = await memberRes.json();
    if (members.length === 0) {
      return new Response(JSON.stringify({ error: 'Membre introuvable.' }), { status: 404, headers: CORS_HEADERS });
    }

    const member = members[0];
    const balance = member.bananas_balance || 0;
    const cost = product.banana_cost;

    if (balance < cost) {
      return new Response(JSON.stringify({
        error: 'solde_insuffisant',
        message: `Il te manque quelques bananes 🍌 Va jouer au Perroquet Tropical pour en gagner, puis reviens débloquer ce produit !`
      }), { status: 403, headers: CORS_HEADERS });
    }

    // 6. Effectuer le débit et le déblocage
    const newBalance = balance - cost;
    
    // Débiter les bananes
    const debitRes = await fetch(`${env.SUPABASE_URL}/rest/v1/members?id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'apikey': env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        bananas_balance: newBalance
      })
    });

    if (!debitRes.ok) {
      throw new Error('Erreur de débit des bananes.');
    }

    // Ajouter la ligne dans banana_ledger
    await fetch(`${env.SUPABASE_URL}/rest/v1/banana_ledger`, {
      method: 'POST',
      headers: {
        'apikey': env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        user_id: userId,
        amount: -cost,
        reason: `Recommandation: ${product.name}`,
        type: 'spend'
      })
    });

    // Insérer dans affiliate_unlocks
    const insertUnlockRes = await fetch(`${env.SUPABASE_URL}/rest/v1/affiliate_unlocks`, {
      method: 'POST',
      headers: {
        'apikey': env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        user_id: userId,
        product_id: productId,
        banana_cost: cost
      })
    });

    if (!insertUnlockRes.ok) {
      throw new Error('Erreur d\'enregistrement du déblocage.');
    }

    // Retourner le lien et succès
    return new Response(JSON.stringify({
      success: true,
      url: product.url,
      message: `Produit "${product.name}" débloqué avec succès ! 🍌`
    }), { status: 200, headers: CORS_HEADERS });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Erreur interne de serveur.' }), { status: 500, headers: CORS_HEADERS });
  }
}
