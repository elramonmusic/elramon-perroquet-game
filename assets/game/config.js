/**
 * Le Perroquet Tropical — Config du jeu
 * El Ramon Music Club
 *
 * Toutes les données de niveau, ennemis, plateformes et récompenses.
 * Structure prête pour V2 (niveaux 2, 3, etc.)
 */

const GAME_CONFIG = {

  // --- PHYSIQUE ---
  physics: {
    gravity: 800,
    playerSpeed: 200,
    playerJump: -380,
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

      // Plateformes en hauteur
      { x: 350, y: 310, w: 120, h: 16, type: 'platform' },
      { x: 600, y: 260, w: 100, h: 16, type: 'platform' },
      { x: 1000, y: 300, w: 130, h: 16, type: 'platform' },
      { x: 1300, y: 250, w: 100, h: 16, type: 'platform' },
      { x: 1700, y: 320, w: 110, h: 16, type: 'platform' },
      { x: 2000, y: 270, w: 120, h: 16, type: 'platform' },
      { x: 2400, y: 300, w: 100, h: 16, type: 'platform' },

      // Zone boss
      { x: 3200, y: 400, w: 800, h: 50, type: 'boss' },
    ],

    // Fruits : { x, y, type: 'banana'|'orange'|'cherry' }
    fruits: [
      { x: 250, y: 370, type: 'banana' },
      { x: 400, y: 280, type: 'orange' },
      { x: 650, y: 230, type: 'cherry' },
      { x: 950, y: 370, type: 'banana' },
      { x: 1050, y: 270, type: 'orange' },
      { x: 1250, y: 370, type: 'cherry' },
      { x: 1350, y: 220, type: 'banana' },
      { x: 1550, y: 370, type: 'orange' },
      { x: 1750, y: 290, type: 'cherry' },
      { x: 2050, y: 240, type: 'banana' },
      { x: 2300, y: 370, type: 'orange' },
      { x: 2450, y: 270, type: 'cherry' },
      { x: 2800, y: 370, type: 'banana' },
      { x: 2950, y: 370, type: 'orange' },
      { x: 3100, y: 370, type: 'cherry' },
    ],

    // Potion invincibilité
    potion: { x: 1350, y: 190 },

    // Ennemis : { x, y, type, range, speed }
    enemies: [
      { x: 500, y: 372, type: 'crabe', range: 150, speed: 60 },
      { x: 1100, y: 372, type: 'crabe', range: 120, speed: 80 },
      { x: 1700, y: 372, type: 'serpent', range: 180, speed: 100 },
      { x: 2100, y: 372, type: 'crabe', range: 100, speed: 70 },
      { x: 2500, y: 372, type: 'serpent', range: 130, speed: 110 },
      { x: 2900, y: 372, type: 'crabe', range: 160, speed: 90 },
      // Singe lanceur (stationnaire, lance des noix de coco)
      { x: 1400, y: 218, type: 'singe', range: 0, speed: 0 },
      { x: 2050, y: 238, type: 'singe', range: 0, speed: 0 },
    ],

    // Boss
    boss: {
      name: 'Toucan Tambour',
      x: 3500,
      y: 340,
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
