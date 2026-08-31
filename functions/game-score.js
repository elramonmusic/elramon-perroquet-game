/**
 * Cloudflare Pages Function — classement et enregistrement atomique des scores.
 */

import {
  cleanString,
  enforceRateLimit,
  fetchWithTimeout,
  getAuthenticatedUser,
  isSameOriginRequest,
  jsonResponse,
  optionsResponse,
} from './utils/security.js';

const RUN_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ALLOWED_LEVELS = new Set(['Level1', 'Level2']);

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    return jsonResponse({ error: 'Configuration serveur manquante' }, 500);
  }
  const user = await getAuthenticatedUser(request, env);
  if (!user?.id) return jsonResponse({ error: 'Session invalide' }, 401);

  try {
    const response = await fetchWithTimeout(`${env.SUPABASE_URL}/rest/v1/game_scores?select=pseudo,score,badge,level,created_at&order=score.desc&limit=200`, {
      headers: {
        apikey: env.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      },
    });

    if (!response.ok) throw new Error('Lecture du classement impossible');
    const scores = await response.json();
    const seen = new Set();
    const uniqueScores = [];

    for (const score of scores) {
      const key = cleanString(score.pseudo, 40).toLocaleLowerCase('fr');
      if (!key || seen.has(key)) continue;
      seen.add(key);
      uniqueScores.push({
        pseudo: cleanString(score.pseudo, 40),
        score: Number.isInteger(score.score) ? score.score : 0,
        badge: cleanString(score.badge, 40) || '🦜 Explorateur',
        level: ALLOWED_LEVELS.has(score.level) ? score.level : 'Level1',
        created_at: score.created_at,
      });
      if (uniqueScores.length === 50) break;
    }

    return jsonResponse(uniqueScores);
  } catch (error) {
    console.error('Leaderboard error:', error.message);
    return jsonResponse({ error: 'Impossible de charger le classement' }, 500);
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!isSameOriginRequest(request)) return jsonResponse({ error: 'Origine non autorisée' }, 403);
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    return jsonResponse({ error: 'Configuration serveur manquante' }, 500);
  }

  if (!(await enforceRateLimit(context, 'game-score', 20, 300))) {
    return jsonResponse({ error: 'Trop de scores envoyés. Réessaie dans quelques minutes.' }, 429, { 'Retry-After': '300' });
  }

  const user = await getAuthenticatedUser(request, env);
  if (!user?.id) return jsonResponse({ error: 'Session invalide' }, 401);

  let data;
  try {
    data = await request.json();
  } catch {
    return jsonResponse({ error: 'JSON invalide' }, 400);
  }

  const score = Number(data.score);
  const fruits = Number(data.fruits_collected ?? 0);
  const lives = Number(data.lives_remaining ?? 0);
  const level = cleanString(data.level, 20);
  const runId = cleanString(data.run_id, 36);

  if (!Number.isInteger(score) || score < 0 || score > 20000
      || !Number.isInteger(fruits) || fruits < 0 || fruits > 500
      || !Number.isInteger(lives) || lives < 0 || lives > 10
      || !ALLOWED_LEVELS.has(level)
      || !RUN_ID_PATTERN.test(runId)) {
    return jsonResponse({ error: 'Données de partie invalides' }, 400);
  }

  try {
    const response = await fetchWithTimeout(`${env.SUPABASE_URL}/rest/v1/rpc/record_game_result`, {
      method: 'POST',
      headers: {
        apikey: env.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        p_user_id: user.id,
        p_run_id: runId,
        p_score: score,
        p_level: level,
        p_fruits_collected: fruits,
        p_boss_defeated: data.boss_defeated === true,
        p_lives_remaining: lives,
      }),
    });

    if (!response.ok) {
      console.error('record_game_result failed:', await response.text());
      return jsonResponse({ error: 'Impossible d’enregistrer ce score' }, 400);
    }

    return jsonResponse(await response.json());
  } catch (error) {
    console.error('Score API error:', error.message);
    return jsonResponse({ error: 'Erreur serveur' }, 500);
  }
}

export async function onRequestOptions() {
  return optionsResponse('GET, POST, OPTIONS');
}
