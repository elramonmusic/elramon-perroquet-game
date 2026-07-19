// Backend pour la gestion Admin des Bonus
export async function onRequest(context) {
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

    // 1. Vérifier que c'est un Admin
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { 'Authorization': `Bearer ${token}`, 'apikey': supabaseKey }
    });
    
    if (!userRes.ok) {
      return new Response(JSON.stringify({ error: "Token invalide" }), { status: 401 });
    }
    const userData = await userRes.json();
    const userId = userData.id;

    const roleRes = await fetch(`${supabaseUrl}/rest/v1/members?id=eq.${userId}&select=role`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      }
    });
    const roles = await roleRes.json();
    if (!roles || roles.length === 0 || roles[0].role !== 'admin') {
      return new Response(JSON.stringify({ error: "Accès réservé aux administrateurs" }), { status: 403 });
    }

    // --- GET : Lister tous les bonus pour l'admin (avec URLs complètes) ---
    if (request.method === 'GET') {
      const res = await fetch(`${supabaseUrl}/rest/v1/bonus_content?order=created_at.desc`, {
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      return new Response(JSON.stringify(data), { status: 200 });
    }

    // --- POST : Ajouter ou modifier un bonus ---
    if (request.method === 'POST') {
      const body = await request.json();
      
      const payload = {
        title: body.title,
        description: body.description,
        category: body.category,
        url: body.url,
        image_url: body.image_url,
        is_premium: body.is_premium,
        banana_cost: body.banana_cost,
        is_active: body.is_active !== undefined ? body.is_active : true
      };

      let fetchUrl = `${supabaseUrl}/rest/v1/bonus_content`;
      let method = 'POST';

      if (body.id) {
        fetchUrl += `?id=eq.${body.id}`;
        method = 'PATCH';
      }

      const res = await fetch(fetchUrl, {
        method: method,
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error("Erreur base de données : " + err);
      }

      const data = await res.json();
      return new Response(JSON.stringify({ success: true, data }), { status: 200 });
    }

    // --- DELETE : Supprimer un bonus ---
    if (request.method === 'DELETE') {
      const url = new URL(request.url);
      const id = url.searchParams.get('id');
      if (!id) {
        return new Response(JSON.stringify({ error: "ID manquant" }), { status: 400 });
      }

      const res = await fetch(`${supabaseUrl}/rest/v1/bonus_content?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        throw new Error("Erreur suppression");
      }

      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: "Méthode non supportée" }), { status: 405 });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
