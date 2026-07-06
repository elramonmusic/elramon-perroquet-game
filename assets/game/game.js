/**
 * Le Perroquet Tropical — Game Engine
 * El Ramon Music Club
 *
 * Phaser 3 — Mini-jeu plateforme 2D rétro
 * V1 : Niveau 1 "La Plage du Soleil"
 */

// ============================================================
// AUDIO (Synthétiseur rétro 8-bit)
// ============================================================
const SFX = {
  ctx: null,
  init() { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); },
  play(freq, type = 'square', duration = 0.1, vol = 0.1, slideFreq = null) {
    if (!this.ctx) this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    if (slideFreq) osc.frequency.exponentialRampToValueAtTime(slideFreq, this.ctx.currentTime + duration);
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  },
  jump() { this.play(150, 'square', 0.2, 0.05, 300); },
  coin() { this.play(880, 'sine', 0.1, 0.05, 1200); },
  shoot() { this.play(400, 'square', 0.1, 0.05, 200); },
  hit() { this.play(100, 'sawtooth', 0.3, 0.1, 50); },
  bossHit() { this.play(80, 'sawtooth', 0.4, 0.2, 30); },
  powerup() { this.play(400, 'sine', 0.5, 0.1, 800); }
};

function playSound(scene, key, fallbackSfx) {
  if (scene.cache.audio.exists(key)) {
    scene.sound.play(key);
  } else if (fallbackSfx) {
    fallbackSfx();
  }
}

// ============================================================
// PRELOAD SCENE — Chargement des assets réels (images et audio)
// ============================================================
class PreloadScene extends Phaser.Scene {
  constructor() { super({ key: 'Preload' }); }
  preload() {
    this.load.image('real_parrot', '../assets/images/game/parrot.png?v=4');
    
    // Nouveaux assets HD
    this.load.image('bg_tropical', '../assets/images/game/bg_tropical.jpg?v=1');
    this.load.image('fruit_banana', '../assets/images/game/banana.png?v=1');
    this.load.image('fruit_orange', '../assets/images/game/orange.png?v=1');
    this.load.image('fruit_cherry', '../assets/images/game/cherry.png?v=1');
    this.load.image('enemy_crab', '../assets/images/game/crab.png?v=1');
    this.load.image('enemy_snake', '../assets/images/game/snake.png?v=1');
    this.load.image('enemy_monkey', '../assets/images/game/monkey.png?v=1');

    this.load.audio('voice_eat', '../assets/audio/game/voice_eat.mp3?v=4');
    this.load.audio('voice_hit', '../assets/audio/game/voice_hit.mp3?v=4');
    this.load.audio('voice_fall', '../assets/audio/game/voice_fall.mp3?v=4');
  }
  create() {
    this.scene.start('Boot');
  }
}

// ============================================================
// BOOT SCENE — Création des assets temporaires (formes)
// ============================================================
class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' });
  }

  create() {
    this.createTextures();
    this.scene.start('Start');
  }

  createTextures() {
    const g = this.make.graphics({ add: false });

    // Texture invisible pour plateformes (1x1 pixel)
    g.fillStyle(0x000000, 0);
    g.fillRect(0, 0, 1, 1);
    g.generateTexture('platform_hitbox', 1, 1);

    // --- Perroquet (32x32) ---
    g.clear();
    g.fillStyle(0x2ECC71, 1);
    g.fillRoundedRect(4, 8, 24, 22, 6);
    g.fillStyle(0x27AE60, 1);
    g.fillRoundedRect(6, 12, 8, 14, 4);
    g.fillStyle(0xFF8C00, 1);
    g.fillTriangle(28, 16, 32, 20, 28, 22);
    g.fillStyle(0xFFFFFF, 1);
    g.fillCircle(22, 14, 4);
    g.fillStyle(0x1A1A2E, 1);
    g.fillCircle(23, 14, 2);
    g.fillStyle(0xFF6B6B, 1);
    g.fillRect(14, 6, 6, 4);
    g.generateTexture('parrot', 36, 34);

    // --- Perroquet invincible (aura dorée) ---
    g.clear();
    g.fillStyle(0xFFD700, 0.3);
    g.fillRoundedRect(0, 2, 40, 32, 10);
    g.fillStyle(0xFFD700, 1);
    g.fillRoundedRect(4, 8, 24, 22, 6);
    g.fillStyle(0xFFA500, 1);
    g.fillRoundedRect(6, 12, 8, 14, 4);
    g.fillStyle(0xFFD700, 1);
    g.fillTriangle(28, 16, 32, 20, 28, 22);
    g.fillStyle(0xFFFFFF, 1);
    g.fillCircle(22, 14, 4);
    g.fillStyle(0x1A1A2E, 1);
    g.fillCircle(23, 14, 2);
    g.fillStyle(0xFF6B6B, 1);
    g.fillRect(14, 6, 6, 4);
    g.generateTexture('parrot_invincible', 40, 36);

    // --- Crabe (28x20) ---
    g.clear();
    g.fillStyle(0xE53935, 1);
    g.fillEllipse(14, 12, 24, 16);
    g.fillStyle(0xC62828, 1);
    g.fillCircle(2, 8, 5);
    g.fillCircle(26, 8, 5);
    g.fillStyle(0xFFFFFF, 1);
    g.fillCircle(8, 8, 2);
    g.fillCircle(20, 8, 2);
    g.generateTexture('crabe', 28, 20);

    // --- Serpent (30x16) ---
    g.clear();
    g.fillStyle(0x2ECC71, 1);
    g.fillRoundedRect(2, 4, 26, 10, 5);
    g.fillStyle(0xF44336, 1);
    g.fillTriangle(30, 8, 34, 6, 34, 10);
    g.fillStyle(0xFFFFFF, 1);
    g.fillCircle(24, 6, 2);
    g.generateTexture('serpent', 34, 16);

    // --- Singe (28x32) ---
    g.clear();
    g.fillStyle(0x8D6E63, 1);
    g.fillRoundedRect(4, 10, 20, 20, 6);
    g.fillStyle(0x795548, 1);
    g.fillCircle(14, 8, 10);
    g.fillStyle(0xFFFFFF, 1);
    g.fillCircle(10, 6, 3);
    g.fillCircle(18, 6, 3);
    g.fillStyle(0x1A1A2E, 1);
    g.fillCircle(11, 6, 1.5);
    g.fillCircle(19, 6, 1.5);
    g.fillStyle(0xFFCC80, 1);
    g.fillCircle(14, 11, 4);
    g.generateTexture('singe', 28, 32);

    // --- Noix de coco (projectile singe) ---
    g.clear();
    g.fillStyle(0x795548, 1);
    g.fillCircle(6, 6, 6);
    g.generateTexture('coconut', 12, 12);

    // --- Fruits (16x16) ---
    g.clear();
    g.fillStyle(0xFFD700, 1);
    g.fillRoundedRect(2, 4, 12, 10, 4);
    g.fillStyle(0xFFC107, 1);
    g.fillRect(2, 8, 12, 4);
    g.generateTexture('banana', 16, 16);

    g.clear();
    g.fillStyle(0xFF8C00, 1);
    g.fillCircle(8, 8, 7);
    g.fillStyle(0x4CAF50, 1);
    g.fillCircle(8, 3, 2);
    g.generateTexture('orange_fruit', 16, 16);

    g.clear();
    g.fillStyle(0xE53935, 1);
    g.fillCircle(8, 10, 6);
    g.fillStyle(0x4CAF50, 1);
    g.fillRect(7, 2, 2, 6);
    g.generateTexture('cherry', 16, 16);

    // Fruit projectile
    g.clear();
    g.fillStyle(0xFFD700, 1);
    g.fillCircle(6, 6, 6);
    g.generateTexture('fruit_bullet', 12, 12);

    // --- Potion invincibilité (16x20) ---
    g.clear();
    g.fillStyle(0x00BCD4, 0.6);
    g.fillRoundedRect(3, 6, 10, 12, 3);
    g.fillStyle(0x00BCD4, 1);
    g.fillRoundedRect(5, 2, 6, 6, 2);
    g.fillStyle(0xFFFFFF, 0.5);
    g.fillCircle(8, 12, 3);
    g.generateTexture('potion', 16, 20);

    // --- Toucan Boss (52x48) ---
    g.clear();
    g.fillStyle(0xFFFFFF, 1);
    g.fillRoundedRect(8, 14, 32, 28, 8);
    g.fillStyle(0x1A1A2E, 1);
    g.fillRoundedRect(10, 4, 28, 20, 6);
    g.fillStyle(0xFF8C00, 1);
    g.fillTriangle(38, 12, 52, 18, 38, 24);
    g.fillStyle(0xFFFFFF, 1);
    g.fillCircle(18, 12, 4);
    g.fillStyle(0x1A1A2E, 1);
    g.fillCircle(19, 12, 2);
    g.fillStyle(0xE53935, 1);
    g.fillTriangle(8, 20, 2, 16, 4, 28);
    g.generateTexture('toucan', 52, 48);

    // --- Graine (projectile boss) ---
    g.clear();
    g.fillStyle(0x795548, 1);
    g.fillCircle(5, 5, 5);
    g.generateTexture('seed', 10, 10);

    // --- Perchoir final (20x44) ---
    g.clear();
    g.fillStyle(0x8D6E63, 1);
    g.fillRect(8, 0, 4, 40);
    g.fillStyle(0xFFD700, 1);
    g.fillRoundedRect(0, 0, 20, 8, 4);
    g.generateTexture('perch', 20, 44);

    // --- Coeur boss ---
    g.clear();
    g.fillStyle(0xE53935, 1);
    g.fillCircle(5, 5, 4);
    g.fillCircle(11, 5, 4);
    g.fillTriangle(1, 7, 15, 7, 8, 16);
    g.generateTexture('heart', 16, 16);

    // --- Coeur vide ---
    g.clear();
    g.fillStyle(0x333333, 0.4);
    g.fillCircle(5, 5, 4);
    g.fillCircle(11, 5, 4);
    g.fillTriangle(1, 7, 15, 7, 8, 16);
    g.generateTexture('heart_empty', 16, 16);

    // --- Particule d'étoile ---
    g.clear();
    g.fillStyle(0xFFFFFF, 1);
    g.fillCircle(4, 4, 4);
    g.generateTexture('particle_star', 8, 8);

    g.destroy();
  }
}

// ============================================================
// START SCENE — Écran titre
// ============================================================
class StartScene extends Phaser.Scene {
  constructor() { super({ key: 'Start' }); }

  create() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1A1A2E, 0x1A1A2E, 0x0F3460, 0x0F3460, 1);
    bg.fillRect(0, 0, w, h);

    const sun = this.add.circle(w * 0.8, h * 0.2, 40, 0xFFD700, 0.3);
    this.tweens.add({ targets: sun, scale: 1.1, alpha: 0.5, yoyo: true, repeat: -1, duration: 2000 });

    this.add.text(w / 2, h * 0.2, '🦜 Le Perroquet Tropical', {
      fontSize: '32px', fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#FFD700', stroke: '#1A1A2E', strokeThickness: 4, align: 'center',
    }).setOrigin(0.5);

    this.add.text(w / 2, h * 0.32, 'El Ramon Music Club', {
      fontSize: '16px', fontFamily: 'Arial, sans-serif', color: '#FAFAFA', align: 'center',
    }).setOrigin(0.5);

    this.add.text(w / 2, h * 0.44, 'Ramasse les fruits, évite les ennemis\net bats le Toucan Tambour !', {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#BBBBBB',
      align: 'center', lineSpacing: 4,
    }).setOrigin(0.5);

    const parrot = this.add.image(w / 2, h * 0.6, 'real_parrot').setDisplaySize(60, 60);
    this.tweens.add({ targets: parrot, y: h * 0.6 - 15, yoyo: true, repeat: -1, duration: 1200, ease: 'Sine.easeInOut' });

    const btnPlay = this.add.text(w / 2, h * 0.78, '🎮  Jouer', {
      fontSize: '22px', fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#FFFFFF', backgroundColor: '#FF8C00', padding: { x: 24, y: 12 }, align: 'center',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btnPlay.on('pointerover', () => btnPlay.setStyle({ backgroundColor: '#FFA726' }));
    btnPlay.on('pointerout', () => btnPlay.setStyle({ backgroundColor: '#FF8C00' }));
    btnPlay.on('pointerdown', () => {
      SFX.init(); // Init audio context on user gesture
      SFX.coin();
      this.scene.start('Level1');
    });

    const btnBack = this.add.text(w / 2, h * 0.9, '🏠  Retour espace membre', {
      fontSize: '13px', fontFamily: 'Arial, sans-serif', color: '#888888',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btnBack.on('pointerover', () => btnBack.setStyle({ color: '#FFD700' }));
    btnBack.on('pointerout', () => btnBack.setStyle({ color: '#888888' }));
    btnBack.on('pointerdown', () => window.location.href = './espace-membre.html');

    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('Level1'));
  }
}

// ============================================================
// LEVEL 1 SCENE — La Plage du Soleil
// ============================================================
class Level1Scene extends Phaser.Scene {
  constructor() { super({ key: 'Level1' }); }

  create() {
    const cfg = GAME_CONFIG;
    const level = cfg.level1;

    this.score = 0;
    this.fruits = 0;
    this.lives = cfg.player.lives;
    this.invincibleUntil = 0;
    this.potionActiveUntil = 0;
    this.bossActive = false;
    this.bossDefeated = false;
    this.gameOver = false;
    this._paused = false;
    this.bossHP = level.boss.hp;
    this.bossStunUntil = 0;
    this.lastBossShot = 0;
    this.bossSpeed = level.boss.speed;

    // --- Variables Game Feel ---
    this.lastOnGround = 0;
    this.lastJumpPressed = 0;
    this.prevMobileJump = false;

    // --- Monde ---
    this.physics.world.setBounds(0, 0, level.worldWidth, level.worldHeight);
    this.cameras.main.setBounds(0, 0, level.worldWidth, level.worldHeight);
    this.cameras.main.setDeadzone(50, 30);

    // --- Background ---
    this.createBackground();

    // --- Plateformes ---
    this.platforms = this.physics.add.staticGroup();
    level.platforms.forEach(p => {
      const color = p.type === 'ground' ? 0x8B6914 : p.type === 'boss' ? 0x5D4037 : 0x2E7D32;
      const gfx = this.add.graphics();
      gfx.fillStyle(color, 1);
      gfx.fillRoundedRect(p.x, p.y, p.w, p.h, 4);
      if (p.type === 'ground') {
        gfx.fillStyle(0x4CAF50, 1);
        gfx.fillRect(p.x, p.y, p.w, 6);
      }
      this.platforms.create(p.x + p.w / 2, p.y + p.h / 2, 'platform_hitbox')
        .setDisplaySize(p.w, p.h)
        .setAlpha(0)
        .refreshBody();
    });

    // --- Joueur ---
    this.player = this.physics.add.sprite(100, 350, 'real_parrot');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.05);
    this.player.setDepth(10);
    this.player.setDisplaySize(40, 40);
    this.player.body.setSize(30, 30);
    this.player.body.setOffset(17, 17);
    this.physics.add.collider(this.player, this.platforms);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // --- Fruits (sprites réels) ---
    const fruitTextures = { banana: 'fruit_banana', orange: 'fruit_orange', cherry: 'fruit_cherry' };
    this.fruitSprites = [];
    level.fruits.forEach(f => {
      const sprite = this.physics.add.staticImage(f.x, f.y, fruitTextures[f.type]);
      sprite.fruitType = f.type;
      sprite.fruitBaseY = f.y;
      this.fruitSprites.push(sprite);
      this.physics.add.overlap(this.player, sprite, this.collectFruit, null, this);
    });

    // --- Potion ---
    this.potion = this.physics.add.staticImage(level.potion.x, level.potion.y, 'potion');
    this.physics.add.overlap(this.player, this.potion, this.collectPotion, null, this);

    // --- Ennemis ---
    this.enemies = [];
    level.enemies.forEach(e => {
      const cfgE = GAME_CONFIG.enemyTypes[e.type];
      const texMap = { crabe: 'enemy_crab', serpent: 'enemy_snake', singe: 'enemy_monkey' };
      const enemy = this.physics.add.sprite(e.x, e.y, texMap[e.type]);
      enemy.enemyType = e.type;
      enemy.scoreValue = cfgE.score;
      enemy.alive = true;
      enemy.patrolOrigin = e.x;
      enemy.patrolRange = e.range;
      enemy.patrolSpeed = e.speed;
      enemy.facingRight = true;
      enemy.body.setSize(cfgE.size.w, cfgE.size.h);
      enemy.body.setOffset(2, 2);
      if (e.type !== 'singe') {
        enemy.setImmovable(true);
      }
      this.physics.add.collider(enemy, this.platforms);
      this.physics.add.overlap(this.player, enemy, this.hitEnemy, null, this);

      if (e.type === 'singe') {
        enemy.body.allowGravity = false;
        enemy.lastShot = 0;
      }
      this.enemies.push(enemy);
    });

    // --- Projectiles joueur ---
    this.bullets = this.physics.add.group({ maxSize: 10 });
    this.physics.add.overlap(this.bullets, this.enemies, this.bulletHitEnemy, null, this);

    // --- Projectiles ennemis (singe) ---
    this.enemyBullets = this.physics.add.group();
    this.physics.add.overlap(this.player, this.enemyBullets, this.hitByProjectile, null, this);

    // --- Boss zone (invisible trigger) ---
    this.bossTrigger = this.physics.add.staticImage(level.boss.x, level.worldHeight / 2, 'platform_hitbox');
    this.bossTrigger.setDisplaySize(60, level.worldHeight).setAlpha(0).refreshBody();
    this.physics.add.overlap(this.player, this.bossTrigger, this.activateBoss, null, this);

    // --- Boss (caché) ---
    this.boss = null;
    this.bossProjectiles = this.physics.add.group();
    this.physics.add.overlap(this.player, this.bossProjectiles, this.hitByProjectile, null, this);

    // --- Perchoir final (caché) ---
    this.perch = null;

    // --- HUD ---
    this.createHUD();

    // --- Contrôles ---
    this.setupControls();

    // --- Pause ---
    this.input.keyboard.on('keydown-ESC', () => this.togglePause());

    // --- Fruit floating animation (update loop) ---
    this.time.addEvent({ delay: 50, callback: () => this.animateFruits(), loop: true });
  }

  // --- Background ---
  createBackground() {
    const ww = GAME_CONFIG.level1.worldWidth;
    const wh = GAME_CONFIG.level1.worldHeight;

    // Fond HD
    this.add.tileSprite(0, 0, ww, wh, 'bg_tropical')
      .setOrigin(0, 0)
      .setScrollFactor(0.2)
      .setAlpha(0.9); // Léger alpha pour l'ambiance tropicale

    // Particules environnementales (Lucioles)
    this.add.particles(0, 0, 'particle_star', {
      x: { min: 0, max: ww },
      y: { min: 200, max: wh },
      lifespan: 4000,
      speedY: { min: -10, max: -30 },
      speedX: { min: -20, max: 20 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.8, end: 0 },
      tint: 0x99FF99,
      blendMode: 'ADD',
      frequency: 200
    }).setScrollFactor(0.8);

    // Sable de base
    const sand = this.add.graphics();
    sand.fillStyle(0xF4D03F, 0.5);
    sand.fillRect(0, wh - 60, ww, 60);

    // Océan animé (vagues)
    this.waterY = wh - 30;
    this.waterGraphics = this.add.graphics();
    this.waterTime = 0;
  }

  // --- Fruit floating (sans tween pour garder le body sync) ---
  animateFruits() {
    if (this._paused || this.gameOver) return;
    const t = this.time.now;
    this.fruitSprites.forEach((sprite, i) => {
      if (!sprite.active) return;
      sprite.y = sprite.fruitBaseY + Math.sin(t / 1200 + i) * 5;
    });
  }

  // --- HUD ---
  createHUD() {
    const w = this.cameras.main.width;
    this.hudContainer = this.add.container(0, 0).setScrollFactor(0).setDepth(100);

    const hudBg = this.add.graphics();
    hudBg.fillStyle(0x1A1A2E, 0.7);
    hudBg.fillRoundedRect(10, 8, 320, 36, 12);
    this.hudContainer.add(hudBg);

    this.hudLivesValue = this.add.text(50, 26, String(this.lives), {
      fontSize: '16px', fontFamily: 'Arial Black, Arial', color: '#FFD700',
    });
    this.hudContainer.add([
      this.add.text(24, 26, '🪶', { fontSize: '16px' }),
      this.hudLivesValue,
      this.add.text(90, 26, '🍌', { fontSize: '16px' }),
      this.add.text(116, 26, '0', { fontSize: '16px', fontFamily: 'Arial Black, Arial', color: '#FFA726' }),
      this.add.text(156, 26, '⭐', { fontSize: '16px' }),
      this.add.text(182, 26, '0', { fontSize: '16px', fontFamily: 'Arial Black, Arial', color: '#FFFFFF' }),
    ]);

    // HUD fruits + score refs
    this.hudFruitsText = this.hudContainer.list[3];
    this.hudScoreText = this.hudContainer.list[5];

    // Boss HP (caché)
    this.hudBossContainer = this.add.container(0, 0).setScrollFactor(0).setDepth(100).setVisible(false);
    const bossBg = this.add.graphics();
    bossBg.fillStyle(0x1A1A2E, 0.7);
    bossBg.fillRoundedRect(w / 2 - 80, 50, 160, 30, 10);
    this.hudBossContainer.add(bossBg);
    this.hudBossLabel = this.add.text(w / 2, 57, 'Toucan Tambour', {
      fontSize: '11px', fontFamily: 'Arial', color: '#FFFFFF', align: 'center',
    }).setOrigin(0.5);
    this.hudBossContainer.add(this.hudBossLabel);

    this.hudBossHearts = [];
    for (let i = 0; i < 3; i++) {
      const heart = this.add.image(w / 2 - 24 + i * 24, 74, 'heart').setScale(0.8);
      this.hudBossHearts.push(heart);
      this.hudBossContainer.add(heart);
    }

    // Potion indicator
    this.hudPotionIndicator = this.add.text(250, 26, '', {
      fontSize: '14px', fontFamily: 'Arial', color: '#00BCD4',
    }).setVisible(false).setScrollFactor(0).setDepth(100);
  }

  updateHUD() {
    this.hudLivesValue.setText(String(this.lives));
    this.hudFruitsText.setText(String(this.fruits));
    this.hudScoreText.setText(String(this.score));

    if (this.boss && this.bossActive) {
      this.hudBossHearts.forEach((heart, i) => {
        heart.setTexture(i < this.bossHP ? 'heart' : 'heart_empty');
      });
    }
  }

  // --- Contrôles ---
  setupControls() {
    if (!window._gameControls) {
      window._gameControls = { left: false, right: false, up: false, fire: false };
    }
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({ up: 'W', left: 'A', right: 'D' });
    this.keyFire = this.input.keyboard.addKey('F');
    this.keyCtrl = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL);
  }

  // --- UPDATE ---
  update() {
    if (this.gameOver || this._paused) return;

    const physCfg = GAME_CONFIG.physics;
    const onGround = this.player.body.touching.down || this.player.body.blocked.down;

    // Mouvement
    const left = this.cursors.left.isDown || this.wasd.left.isDown || window._gameControls.left;
    const right = this.cursors.right.isDown || this.wasd.right.isDown || window._gameControls.right;

    if (left) {
      this.player.setVelocityX(-physCfg.playerSpeed);
      this.player.setFlipX(true);
      this.player.facingRight = false;
    } else if (right) {
      this.player.setVelocityX(physCfg.playerSpeed);
      this.player.setFlipX(false);
      this.player.facingRight = true;
    } else {
      this.player.setVelocityX(0);
    }

    // --- Game Feel : Coyote Time & Jump Buffer ---
    if (onGround) {
      this.lastOnGround = this.time.now;
    }
    
    const jumpDown = Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.wasd.up);
    const mobileJumpDown = window._gameControls.up && !this.prevMobileJump;
    this.prevMobileJump = window._gameControls.up;

    if (jumpDown || mobileJumpDown) {
      this.lastJumpPressed = this.time.now;
    }

    if (this.time.now - this.lastJumpPressed < 150 && this.time.now - this.lastOnGround < 150) {
      this.player.setVelocityY(physCfg.playerJump);
      this.lastJumpPressed = 0;
      this.lastOnGround = 0;
      SFX.jump();
    }

    // Tir
    const fire = Phaser.Input.Keyboard.JustDown(this.keyFire) || Phaser.Input.Keyboard.JustDown(this.keyCtrl) || window._gameControls.fire;
    if (fire && this.fruits > 0) {
      this.fireBullet();
      window._gameControls.fire = false;
      SFX.shoot();
    }

    // IA ennemis
    this.updateEnemies();

    // IA boss
    if (this.boss && this.bossActive && !this.bossDefeated) {
      this.updateBoss();
    }

    // Chute dans un trou
    if (this.player.y > 425 && !this.gameOver) {
      this.playerFall();
    }

    // Animation de l'océan
    this.waterTime += 0.05;
    this.waterGraphics.clear();
    this.waterGraphics.fillStyle(0x00BCD4, 0.6);
    this.waterGraphics.beginPath();
    this.waterGraphics.moveTo(0, this.waterY);
    for (let i = 0; i <= GAME_CONFIG.level1.worldWidth; i += 50) {
      this.waterGraphics.lineTo(i, this.waterY + Math.sin(this.waterTime + i * 0.01) * 5);
    }
    this.waterGraphics.lineTo(GAME_CONFIG.level1.worldWidth, GAME_CONFIG.level1.worldHeight);
    this.waterGraphics.lineTo(0, GAME_CONFIG.level1.worldHeight);
    this.waterGraphics.closePath();
    this.waterGraphics.fillPath();

    // Visuel joueur
    this.updatePlayerVisual();

    // HUD
    this.updateHUD();
  }

  // --- Tir ---
  fireBullet() {
    this.fruits--;
    const dir = this.player.facingRight !== false ? 1 : -1;
    const bullet = this.bullets.create(this.player.x + dir * 20, this.player.y - 5, 'fruit_bullet');
    bullet.body.setAllowGravity(false);
    bullet.setVelocityX(GAME_CONFIG.physics.bulletSpeed * dir);
    this.time.delayedCall(800, () => { if (bullet.active) bullet.destroy(); });
  }

  // --- Collecter fruit ---
  collectFruit(player, fruit) {
    if (!fruit.active) return;
    
    // Particules
    const emitter = this.add.particles(fruit.x, fruit.y, 'particle_star', {
      speed: { min: 50, max: 150 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      tint: 0xFFD700,
      lifespan: 600,
      quantity: 10,
      gravityY: 200,
      emitting: false
    }).setDepth(60);
    emitter.explode();
    this.time.delayedCall(1000, () => emitter.destroy());
    
    playSound(this, 'voice_eat', () => SFX.coin());

    fruit.destroy();
    this.score += 10;
    this.fruits++;
    const txt = this.add.text(fruit.x, fruit.y - 10, '+10', {
      fontSize: '16px', fontFamily: 'Arial Black', color: '#FFD700',
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(50);
    this.tweens.add({ targets: txt, y: txt.y - 40, scale: 1.5, alpha: 0, duration: 600, ease: 'Cubic.easeOut', onComplete: () => txt.destroy() });
  }

  // --- Collecter potion ---
  collectPotion(player, potion) {
    potion.destroy();
    SFX.powerup();
    this.potionActiveUntil = this.time.now + GAME_CONFIG.player.potionDuration;
    this.hudPotionIndicator.setVisible(true);
  }

  // --- Collision ennemi ---
  hitEnemy(player, enemy) {
    if (!enemy.alive) return;
    const now = this.time.now;

    if (this.potionActiveUntil > now) {
      this.defeatEnemy(enemy);
      return;
    }
    if (this.invincibleUntil > now) return;

    if (player.body.velocity.y > 0 && player.y < enemy.y - 10) {
      this.defeatEnemy(enemy);
      player.setVelocityY(-250);
      return;
    }

    this.playerHit();
  }

  // --- Bullet hit enemy ---
  bulletHitEnemy(bullet, enemy) {
    bullet.destroy();
    if (!enemy.alive) return;
    this.defeatEnemy(enemy);
  }

  // --- Défaire ennemi ---
  defeatEnemy(enemy) {
    enemy.alive = false;
    this.score += enemy.scoreValue;
    
    // Particules
    const emitter = this.add.particles(enemy.x, enemy.y, 'particle_star', {
      speed: { min: 80, max: 200 },
      scale: { start: 1.5, end: 0 },
      alpha: { start: 1, end: 0 },
      tint: 0x2ECC71,
      lifespan: 800,
      quantity: 15,
      gravityY: 300,
      emitting: false
    }).setDepth(60);
    emitter.explode();
    this.time.delayedCall(1000, () => emitter.destroy());
    
    SFX.hit();

    const txt = this.add.text(enemy.x, enemy.y - 15, '+' + enemy.scoreValue, {
      fontSize: '16px', fontFamily: 'Arial Black', color: '#2ECC71',
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(50);
    this.tweens.add({ targets: enemy, alpha: 0, scaleX: 0, scaleY: 0, duration: 200, ease: 'Back.easeIn', onComplete: () => { if (enemy.active) enemy.destroy(); } });
    this.tweens.add({ targets: txt, y: txt.y - 40, scale: 1.5, alpha: 0, duration: 600, ease: 'Cubic.easeOut', onComplete: () => txt.destroy() });
  }

  // --- Joueur touché ---
  playerHit() {
    this.lives--;
    this.invincibleUntil = this.time.now + GAME_CONFIG.player.invincibleTime;
    
    playSound(this, 'voice_hit', () => SFX.hit());

    // Camera shake
    this.cameras.main.shake(200, 0.015);
    
    // Hit-Stop (Freeze 100ms)
    this.physics.world.isPaused = true;
    this.time.delayedCall(100, () => { this.physics.world.isPaused = false; });

    if (this.lives <= 0) {
      this.gameOver = true;
      this.time.delayedCall(500, () => this.scene.start('GameOver', { score: this.score, fruitsCollected: this.fruits, lives: this.lives }));
    }
  }

  // --- Chute dans le vide ---
  playerFall() {
    this.lives--;
    this.invincibleUntil = this.time.now + GAME_CONFIG.player.invincibleTime;
    
    playSound(this, 'voice_fall', () => SFX.hit());
    
    this.cameras.main.shake(300, 0.02);
    this.physics.world.isPaused = true;
    this.time.delayedCall(200, () => { this.physics.world.isPaused = false; });
    
    if (this.lives <= 0) {
      this.gameOver = true;
      this.time.delayedCall(500, () => this.scene.start('GameOver', { score: this.score, fruitsCollected: this.fruits, lives: this.lives }));
    } else {
      // Respawn
      this.player.setPosition(100, 300);
      this.player.setVelocity(0, 0);
    }
  }

  // --- Hit by any projectile ---
  hitByProjectile(player, proj) {
    proj.destroy();
    const now = this.time.now;
    if (this.potionActiveUntil > now || this.invincibleUntil > now) return;
    this.playerHit();
  }

  // --- IA ennemis ---
  updateEnemies() {
    const now = this.time.now;
    this.enemies.forEach(enemy => {
      if (!enemy.alive) return;

      if (enemy.enemyType === 'singe') {
        if (now - enemy.lastShot > GAME_CONFIG.enemyTypes.singe.shootInterval) {
          enemy.lastShot = now;
          const dir = this.player.x < enemy.x ? -1 : 1;
          const proj = this.enemyBullets.create(enemy.x, enemy.y + 10, 'coconut');
          proj.setVelocityX(GAME_CONFIG.enemyTypes.singe.projectileSpeed * dir);
          proj.setVelocityY(-100);
          this.time.delayedCall(3000, () => { if (proj.active) proj.destroy(); });
        }
      } else if (enemy.patrolRange > 0) {
        if (enemy.x > enemy.patrolOrigin + enemy.patrolRange) enemy.facingRight = false;
        else if (enemy.x < enemy.patrolOrigin - enemy.patrolRange) enemy.facingRight = true;
        enemy.setVelocityX(enemy.patrolSpeed * (enemy.facingRight ? 1 : -1));
        enemy.setFlipX(!enemy.facingRight);
      }
    });
  }

  // --- Activer le boss ---
  activateBoss(player, zone) {
    if (this.bossActive) return;
    this.bossActive = true;
    zone.destroy();

    const bossCfg = GAME_CONFIG.level1.boss;

    this.cameras.main.setBounds(bossCfg.x - 300, 0, 900, GAME_CONFIG.level1.worldHeight);

    this.boss = this.physics.add.sprite(bossCfg.x, bossCfg.y, 'enemy_monkey');
    this.boss.setDisplaySize(60, 60);
    this.boss.setImmovable(true).setBounce(0).setCollideWorldBounds(true);
    this.boss.body.allowGravity = false;
    this.boss.body.setSize(48, 44).setOffset(2, 4);
    this.boss.facingRight = false;
    this.physics.add.collider(this.boss, this.platforms);
    this.physics.add.overlap(this.player, this.boss, this.hitBoss, null, this);
    this.physics.add.overlap(this.bullets, this.boss, this.bulletHitBoss, null, this);

    this.hudBossContainer.setVisible(true);

    this.lastBossShot = 0;
    this.bossAITimer = this.time.addEvent({ delay: 200, callback: () => this.updateBoss(), loop: true });

    const msg = this.add.text(this.cameras.main.midX, 100, '⚠️ Toucan Tambour !', {
      fontSize: '20px', fontFamily: 'Arial Black', color: '#E53935',
      stroke: '#1A1A2E', strokeThickness: 3,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
    this.tweens.add({ targets: msg, alpha: 0, y: 80, delay: 2000, duration: 800, onComplete: () => msg.destroy() });
  }

  // --- Boss AI ---
  updateBoss() {
    if (!this.boss || !this.bossActive || this.bossDefeated) return;
    const now = this.time.now;

    if (this.bossStunUntil > now) {
      this.boss.setTint(0xFFFF00);
      return;
    }
    this.boss.clearTint();

    const dir = this.player.x < this.boss.x ? -1 : 1;
    this.boss.setVelocityX(this.bossSpeed * dir);
    this.boss.setFlipX(dir < 0);

    if (now - this.lastBossShot > GAME_CONFIG.level1.boss.shootInterval) {
      this.lastBossShot = now;
      const proj = this.bossProjectiles.create(this.boss.x, this.boss.y + 20, 'seed');
      proj.body.setAllowGravity(false);
      proj.setVelocityX(250 * dir);
      this.time.delayedCall(2000, () => { if (proj.active) proj.destroy(); });
    }
  }

  // --- Joueur vs boss ---
  hitBoss(player, boss) {
    const now = this.time.now;
    const bossCfg = GAME_CONFIG.level1.boss;

    if (player.body.velocity.y > 0 && player.y < boss.y - 15) {
      if (this.bossStunUntil < now) {
        this.bossHP--;
        this.bossStunUntil = now + bossCfg.stunDuration;
        player.setVelocityY(-300);
        this.bossSpeed += 20;
        
        SFX.bossHit();

        // Camera Shake & Hit-Stop
        this.cameras.main.shake(150, 0.01);
        this.physics.world.isPaused = true;
        this.time.delayedCall(80, () => { this.physics.world.isPaused = false; });

        const txt = this.add.text(boss.x, boss.y - 30, '💥', { fontSize: '28px' }).setOrigin(0.5).setDepth(50);
        this.tweens.add({ targets: txt, y: txt.y - 50, scale: 1.5, alpha: 0, duration: 600, onComplete: () => txt.destroy() });

        if (this.bossHP <= 0) this.defeatBoss();
      }
      return;
    }

    if (this.potionActiveUntil > now || this.invincibleUntil > now) return;
    this.playerHit();
  }

  // --- Bullet hit boss ---
  bulletHitBoss(bullet, boss) {
    bullet.destroy();
    this.bossStunUntil = this.time.now + GAME_CONFIG.level1.boss.stunDuration;
  }

  // --- Défaite du boss ---
  defeatBoss() {
    this.bossDefeated = true;
    this.bossActive = false;
    if (this.bossAITimer) this.bossAITimer.destroy();

    this.score += 100;
    
    // Grosse secousse pour la mort du boss
    this.cameras.main.shake(500, 0.02);

    // Explosion de particules continue pendant l'animation
    const emitter = this.add.particles(this.boss.x, this.boss.y, 'particle_star', {
      speed: { min: 100, max: 400 },
      scale: { start: 3, end: 0 },
      tint: [0xFFD700, 0xFF8C00, 0xE53935],
      lifespan: 1000,
      gravityY: 400,
      frequency: 50,
      blendMode: 'ADD'
    }).setDepth(60);
    emitter.startFollow(this.boss);
    this.time.delayedCall(1500, () => emitter.destroy());

    this.tweens.add({
      targets: this.boss, y: -100, alpha: 0, scale: 1.5, angle: 360, duration: 1500, ease: 'Cubic.easeIn',
      onComplete: () => { this.boss.destroy(); this.showPerch(); },
    });

    const msg = this.add.text(this.cameras.main.midX, 120, "🐦 Le Toucan Tambour s'envole !", {
      fontSize: '18px', fontFamily: 'Arial Black', color: '#FFD700',
      stroke: '#1A1A2E', strokeThickness: 3,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
    this.tweens.add({ targets: msg, alpha: 0, delay: 2500, duration: 800, onComplete: () => msg.destroy() });
  }

  // --- Perchoir ---
  showPerch() {
    const pc = GAME_CONFIG.level1.perch;
    this.perch = this.physics.add.staticImage(pc.x, pc.y, 'perch');
    this.physics.add.overlap(this.player, this.perch, this.reachPerch, null, this);
  }

  reachPerch(player, perch) {
    perch.destroy();
    this.saveProgress();
    this.scene.start('Victory', { score: this.score, fruitsCollected: this.fruits, lives: this.lives });
  }

  // --- Visuel invincibilité ---
  updatePlayerVisual() {
    const now = this.time.now;
    if (this.potionActiveUntil > now) {
      this.player.setTexture('parrot_invincible');
      const remaining = Math.ceil((this.potionActiveUntil - now) / 1000);
      this.hudPotionIndicator.setText('✨ ' + remaining + 's');
      return;
    }
    this.hudPotionIndicator.setVisible(false);

    if (this.invincibleUntil > now) {
      this.player.setTexture('parrot');
      this.player.setAlpha(this.time.now % 200 < 100 ? 0.3 : 1);
    } else {
      this.player.setTexture('parrot');
      this.player.setAlpha(1);
    }
  }

  // --- Pause ---
  togglePause() {
    if (this.gameOver) return;
    this._paused = !this._paused;
    this.physics.world.pause();

    if (this._paused) {
      const w = this.cameras.main.width;
      const h = this.cameras.main.height;
      const overlay = this.add.graphics().setScrollFactor(0).setDepth(200);
      overlay.fillStyle(0x1A1A2E, 0.85);
      overlay.fillRect(0, 0, w, h);

      this.add.text(w / 2, h / 2 - 40, '⏸️ Pause', {
        fontSize: '28px', fontFamily: 'Arial Black', color: '#FFD700',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

      const btnResume = this.add.text(w / 2, h / 2 + 10, '▶ Reprendre', {
        fontSize: '16px', fontFamily: 'Arial Black', color: '#FFFFFF',
        backgroundColor: '#2ECC71', padding: { x: 16, y: 8 },
      }).setOrigin(0.5).setScrollFactor(0).setDepth(201).setInteractive({ useHandCursor: true });

      const btnQuit = this.add.text(w / 2, h / 2 + 50, '🏠 Quitter', {
        fontSize: '14px', fontFamily: 'Arial', color: '#888888',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(201).setInteractive({ useHandCursor: true });

      const scene = this;
      const pauseEls = [overlay, btnResume, btnQuit];
      btnResume.on('pointerdown', () => {
        scene.physics.world.resume();
        scene._paused = false;
        pauseEls.forEach(el => { if (el.active) el.destroy(); });
      });
      btnQuit.on('pointerdown', () => window.location.href = './espace-membre.html');
    }
  }

  // --- Sauvegarde localStorage ---
  saveProgress() {
    const keys = GAME_CONFIG.storageKeys;
    try {
      localStorage.setItem(keys.completed, 'true');
      localStorage.setItem(keys.bossDefeated, 'true');
      localStorage.setItem(keys.badge, GAME_CONFIG.badges.level1);
      localStorage.setItem(keys.reward, 'suno');
      const prev = parseInt(localStorage.getItem(keys.bestScore) || '0');
      if (this.score > prev) localStorage.setItem(keys.bestScore, String(this.score));
      localStorage.setItem(keys.fruitsCollected, String(this.fruits));
      localStorage.setItem(keys.completedAt, new Date().toISOString());
    } catch (e) { console.warn('Game save error:', e); }
  }
}

// ============================================================
// GAME OVER SCENE
// ============================================================
class GameOverScene extends Phaser.Scene {
  constructor() { super({ key: 'GameOver' }); }

  create(data) {
    const score = data?.score || 0;
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1A1A2E, 0x1A1A2E, 0x4A0000, 0x4A0000, 1);
    bg.fillRect(0, 0, w, h);

    this.add.text(w / 2, h * 0.20, '☠️ Oh non !', {
      fontSize: '36px', fontFamily: 'Arial Black', color: '#E53935', align: 'center',
    }).setOrigin(0.5);

    this.add.text(w / 2, h * 0.35, 'Le perroquet a perdu toutes ses plumes !', {
      fontSize: '15px', fontFamily: 'Arial', color: '#CCCCCC', align: 'center',
    }).setOrigin(0.5);

    this.add.text(w / 2, h * 0.45, 'Score : ' + score, {
      fontSize: '22px', fontFamily: 'Arial Black', color: '#FFD700',
    }).setOrigin(0.5);

    const badgeText = this.add.text(w / 2, h * 0.55, 'Sauvegarde du score...', {
      fontSize: '14px', fontFamily: 'Arial', color: '#AAAAAA'
    }).setOrigin(0.5);

    this.events.once('score_saved', (badge) => {
      badgeText.setText('Badge débloqué : ' + badge).setColor('#2ECC71').setFontFamily('Arial Black');
    });
    saveGameScore(this, false, data);

    const btnReplay = this.add.text(w / 2, h * 0.70, '🔄  Rejouer', {
      fontSize: '18px', fontFamily: 'Arial Black', color: '#FFFFFF',
      backgroundColor: '#FF8C00', padding: { x: 20, y: 10 }, align: 'center',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btnReplay.on('pointerdown', () => this.scene.start('Level1'));

    const btnLeaderboard = this.add.text(w / 2, h * 0.82, '🏆 Voir le classement', {
      fontSize: '15px', fontFamily: 'Arial Black', color: '#FFFFFF',
      backgroundColor: '#0F3460', padding: { x: 20, y: 10 }, align: 'center',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btnLeaderboard.on('pointerdown', () => window.location.href = './leaderboard.html');

    const btnBack = this.add.text(w / 2, h * 0.92, '🔙  Retour espace membre', {
      fontSize: '13px', fontFamily: 'Arial', color: '#888888',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btnBack.on('pointerdown', () => window.location.href = './espace-membre.html');
  }
}

// ============================================================
// VICTORY SCENE
// ============================================================
class VictoryScene extends Phaser.Scene {
  constructor() { super({ key: 'Victory' }); }

  create(data) {
    const score = data?.score || 0;
    const fruits = data?.fruitsCollected || 0;
    const reward = GAME_CONFIG.rewards.level1;
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1A1A2E, 0x1A1A2E, 0x0F3460, 0x0F3460, 1);
    bg.fillRect(0, 0, w, h);

    // Confettis
    const colors = [0xFFD700, 0x2ECC71, 0xFF8C00, 0xE53935, 0x00CED1];
    for (let i = 0; i < 20; i++) {
      const p = this.add.circle(Math.random() * w, Math.random() * h,
        Phaser.Math.Between(2, 5), Phaser.Utils.Array.GetRandom(colors), 0.6);
      this.tweens.add({
        targets: p, y: p.y - 200 - Math.random() * 100, alpha: 0,
        duration: 2000 + Math.random() * 2000, repeat: -1, delay: Math.random() * 2000,
        onRepeat: () => { p.y = h + 20; p.alpha = 0.6; },
      });
    }

    this.add.text(w / 2, h * 0.12, '🎉 Bravo !', {
      fontSize: '38px', fontFamily: 'Arial Black', color: '#FFD700', align: 'center',
    }).setOrigin(0.5);

    this.add.text(w / 2, h * 0.23, 'Tu as battu le Toucan Tambour ! 🦜', {
      fontSize: '16px', fontFamily: 'Arial', color: '#FAFAFA', align: 'center',
    }).setOrigin(0.5);

    // Badge dynamique
    const badgeBg = this.add.graphics();
    badgeBg.fillStyle(0xFFD700, 0.15).fillRoundedRect(w / 2 - 140, h * 0.31, 280, 50, 12);
    badgeBg.lineStyle(2, 0xFFD700, 0.5).strokeRoundedRect(w / 2 - 140, h * 0.31, 280, 50, 12);

    const badgeText = this.add.text(w / 2, h * 0.365, '🏆 Sauvegarde du score...', {
      fontSize: '13px', fontFamily: 'Arial Black', color: '#FFD700', align: 'center',
    }).setOrigin(0.5);

    this.events.once('score_saved', (badge) => {
      badgeText.setText('Badge obtenu : ' + badge);
    });
    saveGameScore(this, true, data);

    this.add.text(w / 2, h * 0.47, '⭐ ' + score + ' points  |  🥭 ' + fruits + ' fruits', {
      fontSize: '16px', fontFamily: 'Arial Black', color: '#AAAAAA',
    }).setOrigin(0.5);

    // Boutons
    const btnReward = this.add.text(w / 2, h * 0.74, reward.buttonText, {
      fontSize: '15px', fontFamily: 'Arial Black', color: '#1A1A2E',
      backgroundColor: '#FFD700', padding: { x: 20, y: 10 }, align: 'center',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btnReward.on('pointerover', () => btnReward.setStyle({ backgroundColor: '#FFF59D' }));
    btnReward.on('pointerout', () => btnReward.setStyle({ backgroundColor: '#FFD700' }));
    btnReward.on('pointerdown', () => window.open(reward.link, '_blank'));

    const btnReplay = this.add.text(w / 4, h * 0.88, '🔄 Rejouer', {
      fontSize: '13px', fontFamily: 'Arial Black', color: '#FFFFFF',
      backgroundColor: '#FF8C00', padding: { x: 15, y: 10 }, align: 'center',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btnReplay.on('pointerdown', () => this.scene.start('Level1'));

    const btnLeaderboard = this.add.text((w / 4) * 3, h * 0.88, '🏆 Classement', {
      fontSize: '13px', fontFamily: 'Arial Black', color: '#FFFFFF',
      backgroundColor: '#E53935', padding: { x: 15, y: 10 }, align: 'center',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btnLeaderboard.on('pointerdown', () => window.location.href = './leaderboard.html');

    const btnBack = this.add.text(w / 2, h * 0.96, '🔙 Retour espace membre', {
      fontSize: '13px', fontFamily: 'Arial', color: '#888888',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btnBack.on('pointerdown', () => window.location.href = './espace-membre.html');
  }
}

// ============================================================
// INITIALISATION PHASER
// ============================================================

// ============================================================
// SAUVEGARDE SCORE API
// ============================================================
async function saveGameScore(scene, bossDefeated, data) {
  if (!window.ElRamon || !window.ElRamon.Auth) return;
  const member = window.ElRamon.Auth.getMember();
  if (!member) return;

  const scoreData = {
    member_email: member.email,
    pseudo: member.pseudo || member.email.split('@')[0],
    score: data.score || 0,
    level: bossDefeated ? 'Level1_Finished' : 'Level1',
    fruits_collected: data.fruitsCollected || 0,
    boss_defeated: bossDefeated,
    lives_remaining: data.lives || 0,
    time_seconds: 0
  };

  try {
    const res = await fetch('/functions/game-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scoreData)
    });
    if (res.ok) {
      const result = await res.json();
      scene.events.emit('score_saved', result.badge);
    }
  } catch (err) {
    console.error('Score API error:', err);
  }
}

const gameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 800,
  height: 450,
  backgroundColor: '#87CEEB',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: GAME_CONFIG.physics.gravity },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [PreloadScene, BootScene, StartScene, Level1Scene, GameOverScene, VictoryScene],
  pixelArt: false,
  roundPixels: true,
};

const game = new Phaser.Game(gameConfig);
