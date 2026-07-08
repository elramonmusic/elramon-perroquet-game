/**
 * Le Perroquet Tropical — Config du jeu
 * El Ramon Music Club
 *
 * Toutes les données de niveau, ennemis, plateformes et récompenses.
 * Structure prête pour V2 (niveaux 2, 3, etc.)
 */

const GAME_CONFIG = {

  // --- LIENS CENTRALISÉS ---
  bonusLinks: {
    suno: "https://suno.com/invite/@ia_records",
    kling: "https://kling.ai/app/invitation?code=7BMNVTGNJYR4",
    flow: "https://www.flowmusic.app/invite/VDMJX7",
    club: "../pages/inscription.html",
    selection: "../pages/selection-tropicale.html",
    youtube: "https://www.youtube.com/@El-Ramon-Music"
  },

  // --- PHYSIQUE ---
  physics: {
    gravity: 700,
    playerSpeed: 220,
    playerJump: -460,
    bulletSpeed: 400,
    bulletMaxDist: 350,
  },

  // --- JOUEUR ---
  player: {
    lives: 3,
    invincibleTime: 1000,    // ms d'invulnérabilité après un coup
    potionDuration: 15000,   // 15 secondes d'invincibilité potion
    size: { w: 32, h: 32 },
  },

  // --- NIVEAU 1 : La Plage du Soleil ---
  level1: {
    name: 'La Plage du Soleil',
    worldWidth: 4000,
    worldHeight: 450,

    // Plateformes : { x, y, w, h, type: 'ground'|'platform'|'boss' }
    platforms: [
      // Sol principal
      { x: 0, y: 400, w: 800, h: 50, type: 'ground' },
      { x: 900, y: 400, w: 600, h: 50, type: 'ground' },
      { x: 1600, y: 400, w: 500, h: 50, type: 'ground' },
      { x: 2200, y: 400, w: 400, h: 50, type: 'ground' },
      { x: 2700, y: 400, w: 1300, h: 50, type: 'ground' },

      // Plateformes en hauteur (accessibles avec saut -460)
      { x: 300, y: 240, w: 130, h: 16, type: 'platform' },
      { x: 550, y: 190, w: 110, h: 16, type: 'platform' },
      { x: 850, y: 220, w: 120, h: 16, type: 'platform' },
      { x: 1100, y: 190, w: 110, h: 16, type: 'platform' },
      { x: 1400, y: 220, w: 120, h: 16, type: 'platform' },
      { x: 1700, y: 190, w: 110, h: 16, type: 'platform' },
      { x: 2000, y: 230, w: 110, h: 16, type: 'platform' },
      { x: 2300, y: 200, w: 120, h: 16, type: 'platform' },

      // Zone boss
      { x: 3200, y: 400, w: 800, h: 50, type: 'boss' },
    ],

    // Fruits : { x, y, type: 'banana'|'orange'|'cherry' }
    fruits: [
      // Sol — faciles
      { x: 250, y: 370, type: 'banana' },
      { x: 950, y: 370, type: 'banana' },
      { x: 1250, y: 370, type: 'cherry' },
      { x: 1550, y: 370, type: 'orange' },
      { x: 2300, y: 370, type: 'orange' },
      { x: 2800, y: 370, type: 'banana' },
      { x: 2950, y: 370, type: 'orange' },
      { x: 3100, y: 370, type: 'cherry' },
      // Sur plateformes (20px au-dessus du haut)
      { x: 365, y: 220, type: 'orange' },
      { x: 605, y: 170, type: 'cherry' },
      { x: 910, y: 200, type: 'banana' },
      { x: 1155, y: 170, type: 'orange' },
      { x: 1460, y: 200, type: 'banana' },
      { x: 1755, y: 170, type: 'cherry' },
      { x: 2055, y: 210, type: 'banana' },
      { x: 2360, y: 180, type: 'cherry' },
    ],

    // Notes de musique (+25) et Soleils (+50)
    collectibles: [
      { x: 400, y: 350, type: 'note' },
      { x: 700, y: 250, type: 'note' },
      { x: 1000, y: 350, type: 'note' },
      { x: 1300, y: 250, type: 'sun' },
      { x: 1900, y: 250, type: 'note' },
      { x: 2500, y: 350, type: 'sun' },
      { x: 2750, y: 250, type: 'note' },
    ],

    // Potion invincibilité
    potion: { x: 2360, y: 268 },

    // Ennemis : { x, y, type, range, speed }
    enemies: [
      { x: 500, y: 372, type: 'crabe', range: 150, speed: 60 },
      { x: 1100, y: 372, type: 'crabe', range: 120, speed: 80 },
      { x: 1700, y: 372, type: 'serpent', range: 180, speed: 100 },
      { x: 2100, y: 372, type: 'crabe', range: 100, speed: 70 },
      { x: 2500, y: 372, type: 'serpent', range: 130, speed: 110 },
      { x: 2900, y: 372, type: 'crabe', range: 160, speed: 90 },
      // Singe lanceur (stationnaire, sur plateformes)
      { x: 1460, y: 294, type: 'singe', range: 0, speed: 0 },
      { x: 2055, y: 304, type: 'singe', range: 0, speed: 0 },
    ],

    // Boss
    boss: {
      name: 'Toucan Tambour',
      x: 3500,
      y: 376,
      hp: 3,
      speed: 80,
      jumpForce: -250,
      shootInterval: 2000,
      stunDuration: 1000,
    },

    // Perchoir final
    perch: { x: 3800, y: 320 },
  },

  // --- ENNEMIS : propriétés par type ---
  enemyTypes: {
    crabe: {
      color: 0xE53935,
      size: { w: 28, h: 20 },
      score: 25,
    },
    serpent: {
      color: 0x2ECC71,
      size: { w: 30, h: 16 },
      score: 25,
    },
    singe: {
      color: 0x8D6E63,
      size: { w: 28, h: 32 },
      score: 50,
      shoots: true,
      shootInterval: 3000,
      projectileSpeed: 200,
      projectileColor: 0x795548,
    },
  },

  // --- RÉCOMPENSES (extensible V2/V3) ---
  rewards: {
    level1: {
      title: 'Découvrir Suno',
      description: 'Crée tes propres chansons avec l\'IA et explore la musique tropicale autrement.',
      buttonText: '🎁 Découvrir Suno',
      url: 'https://suno.com/invite/@ia_records',
      type: 'partner',
    },
    level2: {
      title: 'Découvrir Flow Music',
      description: 'Un outil créatif pour explorer d\'autres idées musicales.',
      buttonText: '🎁 Découvrir Flow Music',
      url: 'https://www.flowmusic.app/invite/VDMJX7',
      type: 'partner',
    },
    level3: {
      title: 'Découvrir Kling',
      description: 'Un outil vidéo IA pour donner vie à tes idées visuelles.',
      buttonText: '🎁 Découvrir Kling',
      url: 'https://kling.ai/app/invitation?code=7BMNVTGNJYR4',
      type: 'partner',
    },
  },

  // --- RANGS TROPICAUX ---
  ranks: [
    { min: 0, name: 'Perroquet débutant' },
    { min: 200, name: 'Danseur de plage' },
    { min: 500, name: 'Ambianceur tropical' },
    { min: 1000, name: 'Légende du soleil' }
  ],

  // --- BADGES ---
  badges: {
    level1: 'Vainqueur du Toucan Tambour',
  },

  // --- STOCKAGE localStorage ---
  storageKeys: {
    completed: 'elramon_game_level1_completed',
    bossDefeated: 'elramon_game_boss1_defeated',
    badge: 'elramon_game_badge',
    reward: 'elramon_game_reward_level1',
    bestScore: 'elramon_game_best_score',
    fruitsCollected: 'elramon_game_fruits_collected',
    completedAt: 'elramon_game_completed_at',
  },
};
