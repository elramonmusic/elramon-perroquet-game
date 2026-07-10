/**
 * Cloudflare Pages Function — /functions/game-score
 * Gère le leaderboard et l'enregistrement des scores du jeu "Le Perroquet Tropical"
 *
 * GET /functions/game-score -> Retourne le Top 50
 * POST /functions/game-score -> Enregistre un nouveau score et retourne le rang
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

export async function onRequestGet(context) {
  const { env } = context;

  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    return new Response(JSON.stringify({ error: 'Configuration serveur manquante' }), { status: 500, headers: CORS_HEADERS });
  }

  try {
    // Récupérer le TOP 50
    const response = await fetch(`${env.SUPABASE_URL}/rest/v1/game_scores?select=pseudo,score,badge,level,created_at&order=score.desc&limit=50`, {
      method: 'GET',
      headers: {
        'apikey': env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error('Supabase GET failed: ' + errText);
    }
    let scores = await response.json();

    // Dédoublonner par pseudo en gardant le meilleur score (déjà trié par score desc)
    const uniqueScores = [];
    const seenPseudos = new Set();
    for (const s of scores) {
      if (!seenPseudos.has(s.pseudo)) {
        uniqueScores.push(s);
        seenPseudos.add(s.pseudo);
      }
    }

    // On garde le badge original obtenu par le joueur en jeu.
    // (Ancien code de forçage 'Champion Tropical' supprimé pour afficher le vrai badge)

    return new Response(JSON.stringify(uniqueScores), { status: 200, headers: CORS_HEADERS });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let data;
  try {
    data = await request.json();
  } catch (err) {
    return new Response(JSON.stringify({ error: 'JSON invalide' }), { status: 400, headers: CORS_HEADERS });
  }

  const { member_email, pseudo, score, level, fruits_collected, boss_defeated, lives_remaining, time_seconds } = data;

  if (!member_email || !pseudo || score === undefined) {
    return new Response(JSON.stringify({ error: 'Données manquantes' }), { status: 400, headers: CORS_HEADERS });
  }

  // Anti-triche ultra basique : limiter le score max théorique (ex: 20000)
  if (score < 0 || score > 20000) {
    return new Response(JSON.stringify({ error: 'Score invalide' }), { status: 400, headers: CORS_HEADERS });
  }

  // Détermination du badge serveur (les plus durs d'abord)
  let badge = '🦜 Explorateur';
  if (boss_defeated && lives_remaining >= 3) {
    badge = '🪶 Plume Sauvée';
  } else if (boss_defeated) {
    badge = '🌴 Roi de la Jungle';
  } else if (level === 'Level1_Finished') {
    badge = '☀️ Perroquet Solaire';
  } else if (fruits_collected >= 10) {
    badge = '🥭 Bec Fruité';
  }

  const scoreData = {
    member_email,
    pseudo,
    score: parseInt(score, 10),
    level: level || 'Level1',
    fruits_collected: parseInt(fruits_collected || 0, 10),
    boss_defeated: !!boss_defeated,
    lives_remaining: parseInt(lives_remaining || 0, 10),
    badge
  };

  if (env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY) {
    try {
      // 1. Insérer le score
      const insertResp = await fetch(`${env.SUPABASE_URL}/rest/v1/game_scores`, {
        method: 'POST',
        headers: {
          'apikey': env.SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scoreData),
      });

      if (!insertResp.ok) {
        const errText = await insertResp.text();
        throw new Error('Supabase POST failed: ' + errText);
      }

      // 2. Mettre à jour le profil (bananes et meilleur score)
      const earnedBananas = Math.floor(scoreData.score / 100);
      
      const profileRes = await fetch(`${env.SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(member_email)}&select=id,bananas_balance,best_score`, {
        method: 'GET',
        headers: {
          'apikey': env.SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`
        }
      });

      if (profileRes.ok) {
        const profiles = await profileRes.json();
        if (profiles.length > 0) {
          const profile = profiles[0];
          const newBananas = (profile.bananas_balance || 0) + earnedBananas;
          const newBestScore = Math.max(profile.best_score || 0, scoreData.score);
          
          await fetch(`${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${profile.id}`, {
            method: 'PATCH',
            headers: {
              'apikey': env.SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              bananas_balance: newBananas,
              best_score: newBestScore,
              best_level: scoreData.level
            })
          });
        }
      }

      return new Response(JSON.stringify({ success: true, badge, score: scoreData.score, earnedBananas }), { status: 200, headers: CORS_HEADERS });
    } catch (err) {
      console.error('Supabase error:', err.message);
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS });
    }
  }

  return new Response(JSON.stringify({ error: 'Configuration serveur manquante (pas de SUPABASE_SERVICE_KEY)' }), { status: 500, headers: CORS_HEADERS });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
