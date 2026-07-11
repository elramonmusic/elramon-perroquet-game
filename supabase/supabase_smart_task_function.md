# Ramonito Edge Function (smart-task)

Voici le code TypeScript complet pour la **Supabase Edge Function** `smart-task` mis à jour pour utiliser la table unique de vérité `members`, la règle des questions gratuites utilisées et un client privilégié (`SUPABASE_SERVICE_ROLE_KEY`) pour l'écriture sécurisée en base de données.

Cette fonction s'exécute côté serveur sur l'infrastructure de Supabase, appelle l'API de Groq et gère le solde de bananes et de questions gratuites directement en base de données.

## 1. Créer la fonction localement

Si tu as installé la CLI Supabase, exécute cette commande à la racine de ton projet :
```bash
supabase functions new smart-task
```

## 2. Remplacer le code (index.ts)

Remplace le contenu du fichier généré (`supabase/functions/smart-task/index.ts`) par le code ci-dessous :

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Permet les requêtes depuis n'importe quelle origine (y compris en local pour les tests)
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Gestion du preflight CORS (important pour que le frontend accepte la requête)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Authentifier l'utilisateur via le JWT envoyé dans les headers
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Non autorisé: Jeton manquant');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    // Client utilisateur (Règles RLS standards)
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Client service-role (Bypass RLS pour mise à jour sécurisée des bananes)
    const supabaseServiceClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Non autorisé: Jeton invalide');
    }

    // 2. Récupérer la question
    const body = await req.json();
    const { question } = body;
    if (!question) {
      throw new Error('Question manquante');
    }

    // 3. Vérifier le solde de bananes et les questions gratuites de l'utilisateur sur la table members
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
      // Plus de bananes et plus de questions gratuites !
      return new Response(JSON.stringify({ 
        error: 'solde_insuffisant', 
        message: 'Ton panier de bananes est vide 🍌 Va jouer au Perroquet Tropical pour en gagner, puis reviens me poser ta question 🦜☀️' 
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 4. Appeler Groq (Llama-3.1-8b-instant)
    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY non configurée dans Supabase Secrets');
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
          {
            role: 'system',
            content: `Tu es Ramonito, le perroquet mascotte officiel du El Ramon Music Club. Tu parles avec un ton enjoué, parfois tu lâches des expressions en espagnol ou relatives aux fruits tropicaux. Tu aides les membres à naviguer dans le club et tu adores la musique ensoleillée. Réponds de façon concise et amusante (maximum 2-3 phrases) à l'utilisateur : ${userName}.`
          },
          {
            role: 'user',
            content: question
          }
        ],
        temperature: 0.7,
        max_tokens: 250
      })
    });

    if (!groqResponse.ok) {
      const err = await groqResponse.text();
      console.error('Erreur Groq:', err);
      throw new Error('Erreur lors de la communication avec l\'IA (Groq)');
    }

    const groqData = await groqResponse.json();
    const answer = groqData.choices[0].message.content;

    // 5. Débiter l'utilisateur et enregistrer la transaction via le client service privilégé (sécurisé)
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

    // 6. Sauvegarder la question et la réponse pour l'historique
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

    // 7. Retourner la réponse au frontend
    return new Response(JSON.stringify({
      answer: answer,
      remaining_bananas: bananas,
      free_questions_used: freeQuestionsUsed
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
```

## 3. Déployer la fonction

Exécute la commande suivante pour déployer ton code sur Supabase (assure-toi d'être connecté via `supabase login` et que ton projet est lié avec `supabase link --project-ref ton-projet-id`) :

```bash
supabase functions deploy smart-task --no-verify-jwt
```
*(L'option `--no-verify-jwt` permet de désactiver la vérification "legacy" puisque nous gérons nous-mêmes le JWT directement dans le code via le client Supabase).*
