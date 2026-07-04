/**
 * Le Perroquet Tropical — Game Engine
 * El Ramon Music Club
 *
 * Phaser 3 — Mini-jeu plateforme 2D rétro
 * V1 : Niveau 1 "La Plage du Soleil"
 */

// ============================================================
// BOOT SCENE — Création des assets temporaires (formes)
// ============================================================
class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' });
  }

  create() {
    // Générer les textures dynamiques (V1 : formes géométriques)
    this.createTextures();
    this.scene.start('Start');
  }

  createTextures() {
    const g = this.make.graphics({ add: false });

    // --- Perroquet (32x32) ---
    g.clear();
    g.fillStyle(0x2ECC71, 1);   // Corps vert
    g.fillRoundedRect(4, 8, 24, 22, 6);
    g.fillStyle(0x27AE60, 1);   // Aile plus foncée
    g.fillRoundedRect(6, 12, 8, 14, 4);
    g.fillStyle(0xFF8C00, 1);   // Bec orange
    g.fillTriangle(28, 16, 32, 20, 28, 22);
    g.fillStyle(0xFFFFFF, 1);   // Oeil blanc
    g.fillCircle(22, 14, 4);
    g.fillStyle(0x1A1A2E, 1);   // Pupille
    g.fillCircle(23, 14, 2);
    g.fillStyle(0xFF6B6B, 1);   // Langue/créte
    g.fillRect(14, 6, 6, 4);
    g.generateTexture('parrot', 36, 34);

    // --- Perroquet invincible (même forme + aura dorée) ---
    g.clear();
    g.fillStyle(0xFFD700, 0.3); // Aura dorée
    g.fillRoundedRect(0, 2, 40, 32, 10);
    g.fillStyle(0xFFD700, 1);   // Corps doré
    g.fillRoundedRect(4, 8, 24, 22, 6);
    g.fillStyle(0xFFA500, 1);
    g.fillRoundedRect(6, 12, 8, 14, 4);
    g.fillStyle(0xFFD700, 1);   // Bec doré
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
    g.fillStyle(0xC62828, 1); // Pinces
    g.fillCircle(2, 8, 5);
    g.fillCircle(26, 8, 5);
    g.fillStyle(0xFFFFFF, 1); // Yeux
    g.fillCircle(8, 8, 2);
    g.fillCircle(20, 8, 2);
    g.generateTexture('crabe', 28, 20);

    // --- Serpent (30x16) ---
    g.clear();
    g.fillStyle(0x2ECC71, 1);
    g.fillRoundedRect(2, 4, 26, 10, 5);
    g.fillStyle(0xF44336, 1); // Langue
    g.fillTriangle(30, 8, 34, 6, 34, 10);
    g.fillStyle(0xFFFFFF, 1); // Yeux
    g.fillCircle(24, 6, 2);
    g.generateTexture('serpent', 34, 16);

    // --- Singe (28x32) ---
    g.clear();
    g.fillStyle(0x8D6E63, 1); // Corps
    g.fillRoundedRect(4, 10, 20, 20, 6);
    g.fillStyle(0x795548, 1); // Tête
    g.fillCircle(14, 8, 10);
    g.fillStyle(0xFFFFFF, 1); // Yeux
    g.fillCircle(10, 6, 3);
    g.fillCircle(18, 6, 3);
    g.fillStyle(0x1A1A2E, 1);
    g.fillCircle(11, 6, 1.5);
    g.fillCircle(19, 6, 1.5);
    g.fillStyle(0xFFCC80, 1); // Museau
    g.fillCircle(14, 11, 4);
    g.generateTexture('singe', 28, 32);

    // --- Noix de coco (projectile singe, 12x12) ---
    g.clear();
    g.fillStyle(0x795548, 1);
    g.fillCircle(6, 6, 6);
    g.generateTexture('coconut', 12, 12);

    // --- Fruits (16x16) ---
    // Banane
    g.clear();
    g.fillStyle(0xFFD700, 1);
    g.fillRoundedRect(2, 4, 12, 10, 4);
    g.fillStyle(0xFFC107, 1);
    g.fillRect(2, 8, 12, 4);
    g.generateTexture('banana', 16, 16);

    // Orange
    g.clear();
    g.fillStyle(0xFF8C00, 1);
    g.fillCircle(8, 8, 7);
    g.fillStyle(0x4CAF50, 1);
    g.fillCircle(8, 3, 2);
    g.generateTexture('orange', 16, 16);

    // Cherry
    g.clear();
    g.fillStyle(0xE53935, 1);
    g.fillCircle(8, 10, 6);
    g.fillStyle(0x4CAF50, 1);
    g.fillRect(7, 2, 2, 6);
    g.generateTexture('cherry', 16, 16);

    // Fruit projectile (tir)
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

    // --- Toucan Boss (48x48) ---
    g.clear();
    g.fillStyle(0xFFFFFF, 1);   // Corps blanc
    g.fillRoundedRect(8, 14, 32, 28, 8);
    g.fillStyle(0x1A1A2E, 1);   // Tête noire
    g.fillRoundedRect(10, 4, 28, 20, 6);
    g.fillStyle(0xFF8C00, 1);   // Grand bec
    g.fillTriangle(38, 12, 52, 18, 38, 24);
    g.fillStyle(0xFFFFFF, 1);   // Yeux
    g.fillCircle(18, 12, 4);
    g.fillStyle(0x1A1A2E, 1);
    g.fillCircle(19, 12, 2);
    g.fillStyle(0xE53935, 1);   // Queue
    g.fillTriangle(8, 20, 2, 16, 4, 28);
    g.generateTexture('toucan', 52, 48);

    // --- Graine (projectile boss, 10x10) ---
    g.clear();
    g.fillStyle(0x795548, 1);
    g.fillCircle(5, 5, 5);
    g.generateTexture('seed', 10, 10);

    // --- Perchoir final (20x40) ---
    g.clear();
    g.fillStyle(0x8D6E63, 1);
    g.fillRect(8, 0, 4, 40);
    g.fillStyle(0xFFD700, 1);
    g.fillRoundedRect(0, 0, 20, 8, 4);
    g.generateTexture('perch', 20, 44);

    // --- Plume (HUD, 20x20) ---
    g.clear();
    g.fillStyle(0xFFD700, 1);
    g.fillRoundedRect(6, 2, 6, 16, 3);
    g.fillStyle(0xFFC107, 1);
    g.fillRoundedRect(4, 4, 10, 8, 2);
    g.generateTexture('feather_hud', 18, 20);

    // --- Coeur boss (16x16) ---
    g.clear();
    g.fillStyle(0xE53935, 1);
    g.fillCircle(5, 5, 4);
    g.fillCircle(11, 5, 4);
    g.fillTriangle(1, 7, 15, 7, 8, 16);
    g.generateTexture('heart', 16, 16);

    // --- Coeur vide (16x16) ---
    g.clear();
    g.lineStyle(2, 0x555555, 1);
    g.strokeCircle(5, 5, 4);
    g.strokeCircle(11, 5, 4);
    g.strokeTriangle(1, 7, 15, 7, 8, 16);
    g.fillStyle(0x333333, 0.3);
    g.fillCircle(5, 5, 4);
    g.fillCircle(11, 5, 4);
    g.fillTriangle(1, 7, 15, 7, 8, 16);
    g.generateTexture('heart_empty', 16, 16);

    // --- Texture invisible pour plateformes (1x1 pixel) ---
    g.clear();
    g.fillStyle(0xFFFFFF, 0);
    g.fillRect(0, 0, 1, 1);
    g.generateTexture('platform_hitbox', 1, 1);

    g.destroy();
  }
}

// ============================================================
// START SCENE — Écran titre
// ============================================================
class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Start' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1A1A2E, 0x1A1A2E, 0x0F3460, 0x0F3460, 1);
    bg.fillRect(0, 0, width, height);

    // Soleil décoratif
    const sun = this.add.circle(width * 0.8, height * 0.2, 40, 0xFFD700, 0.3);
    this.tweens.add({ targets: sun, scale: 1.1, alpha: 0.5, yoyo: true, repeat: -1, duration: 2000 });

    // Titre
    this.add.text(width / 2, height * 0.2, '🦜 Le Perroquet Tropical', {
      fontSize: 'clamp(20px, 5vw, 36px)',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#FFD700',
      stroke: '#1A1A2E',
      strokeThickness: 4,
      align: 'center',
    }).setOrigin(0.5);

    // Sous-titre
    this.add.text(width / 2, height * 0.32, 'El Ramon Music Club', {
      fontSize: 'clamp(12px, 3vw, 18px)',
      fontFamily: 'Arial, sans-serif',
      color: '#FAFAFA',
      align: 'center',
    }).setOrigin(0.5);

    // Description
    this.add.text(width / 2, height * 0.44, 'Ramasse les fruits, évite les ennemis\net bats le Toucan Tambour !', {
      fontSize: 'clamp(11px, 2.5vw, 15px)',
      fontFamily: 'Arial, sans-serif',
      color: 'rgba(255,255,255,0.7)',
      align: 'center',
      lineSpacing: 4,
    }).setOrigin(0.5);

    // Perroquet animé
    const parrot = this.add.image(width / 2, height * 0.6, 'parrot').setScale(2);
    this.tweens.add({ targets: parrot, y: height * 0.6 - 15, yoyo: true, repeat: -1, duration: 1200, ease: 'Sine.easeInOut' });

    // Bouton Jouer
    const btnPlay = this.add.text(width / 2, height * 0.78, '🎮  Jouer', {
      fontSize: 'clamp(16px, 4vw, 24px)',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#FFFFFF',
      backgroundColor: '#FF8C00',
      padding: { x: 24, y: 12 },
      align: 'center',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btnPlay.on('pointerover', () => btnPlay.setStyle({ backgroundColor: '#FFA726', scale: 1.05 }));
    btnPlay.on('pointerout', () => btnPlay.setStyle({ backgroundColor: '#FF8C00', scale: 1 }));
    btnPlay.on('pointerdown', () => this.scene.start('Level1'));

    // Bouton Retour
    const btnBack = this.add.text(width / 2, height * 0.9, '🏠  Retour espace membre', {
      fontSize: 'clamp(11px, 2.5vw, 14px)',
      fontFamily: 'Arial, sans-serif',
      color: 'rgba(255,255,255,0.5)',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btnBack.on('pointerover', () => btnBack.setStyle({ color: '#FFD700' }));
    btnBack.on('pointerout', () => btnBack.setStyle({ color: 'rgba(255,255,255,0.5)' }));
    btnBack.on('pointerdown', () => window.location.href = './espace-membre.html');

    // Clavier : Enter pour jouer
    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('Level1'));
  }
}

// ============================================================
// LEVEL 1 SCENE — La Plage du Soleil
// ============================================================
class Level1Scene extends Phaser.Scene {
  constructor() {
    super({ key: 'Level1' });
  }

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
    this.bossHP = level.boss.hp;
    this.bossStunUntil = 0;
    this.lastBossShot = 0;

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
      const body = this.physics.add.staticSprite(p.x + p.w / 2, p.y + p.h / 2, 'platform_hitbox');
      body.setDisplaySize(p.w, p.h);
      body.setAlpha(0);
      body.refreshBody();
    });

    // --- Joueur ---
    this.player = this.physics.add.sprite(100, 350, 'parrot');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.05);
    this.player.setDepth(10);
    this.player.body.setSize(28, 28);
    this.player.body.setOffset(4, 6);

    this.physics.add.collider(this.player, this.platforms);

    // --- Fruits ---
    this.fruitGroup = this.physics.add.staticGroup();
    const fruitTextures = { banana: 'banana', orange: 'orange', cherry: 'cherry' };
    level.fruits.forEach(f => {
      const sprite = this.fruitGroup.create(f.x, f.y, fruitTextures[f.type]);
      sprite.fruitType = f.type;
      this.tweens.add({ targets: sprite, y: f.y - 6, yoyo: true, repeat: -1, duration: 1200 + Math.random() * 400, ease: 'Sine.easeInOut' });
    });

    this.physics.add.overlap(this.player, this.fruitGroup, this.collectFruit, null, this);

    // --- Potion ---
    this.potion = this.physics.add.staticSprite(level.potion.x, level.potion.y, 'potion');
    this.tweens.add({ targets: this.potion, y: level.potion.y - 8, yoyo: true, repeat: -1, duration: 1500, ease: 'Sine.easeInOut' });
    this.physics.add.overlap(this.player, this.potion, this.collectPotion, null, this);

    // --- Ennemis ---
    this.enemies = [];
    level.enemies.forEach(e => {
      const cfgE = cfg.enemyTypes[e.type];
      const enemy = this.physics.add.sprite(e.x, e.y, e.type);
      enemy.enemyType = e.type;
      enemy.scoreValue = cfgE.score;
      enemy.alive = true;
      enemy.patrolOrigin = e.x;
      enemy.patrolRange = e.range;
      enemy.patrolSpeed = e.speed;
      enemy.facingRight = true;
      enemy.body.setSize(cfgE.size.w, cfgE.size.h);
      enemy.body.setOffset((32 - cfgE.size.w) / 2, (32 - cfgE.size.h) / 2);
      if (e.type !== 'singe') {
        enemy.body.setImmovable(true);
      }
      this.physics.add.collider(enemy, this.platforms);

      if (e.type === 'singe') {
        enemy.lastShot = 0;
      }

      this.enemies.push(enemy);
    });

    // Collisions ennemis
    this.enemies.forEach(enemy => {
      this.physics.add.overlap(this.player, enemy, this.hitEnemy, null, this);
    });

    // --- Boss (caché pour l'instant) ---
    this.boss = null;
    this.bossProjectiles = this.physics.add.group();
    this.physics.add.overlap(this.player, this.bossProjectiles, this.hitByBossProjectile, null, this);

    // --- Zone boss ---
    this.bossZone = this.physics.add.staticSprite(level.boss.x, level.worldHeight / 2, 'platform_hitbox');
    this.bossZone.setDisplaySize(60, level.worldHeight);
    this.bossZone.setAlpha(0);
    this.bossZone.refreshBody();
    this.bossZone.body.setSize(60, level.worldHeight);
    this.bossZone.body.setImmovable(true);
    this.bossZone.setVisible(false);
    this.physics.add.overlap(this.player, this.bossZone, this.activateBoss, null, this);

    // --- Perchoir final (caché) ---
    this.perch = null;

    // --- Projectiles joueur (fruits tirés) ---
    this.bullets = this.physics.add.group({ maxSize: 10 });

    // --- Projectiles singes ---
    this.enemyBullets = this.physics.add.group();
    this.physics.add.overlap(this.player, this.enemyBullets, this.hitByEnemyProjectile, null, this);

    // --- HUD ---
    this.createHUD();

    // --- Contrôles ---
    this.setupControls();

    // --- Pause ---
    this.input.keyboard.on('keydown-ESC', () => this.togglePause());

    // --- Timer potion ---
    this.time.addEvent({
      delay: 100,
      callback: () => this.updateTimers(),
      loop: true,
    });

    // --- Boss AI timer ---
    this.bossAITimer = null;
  }

  // --- Background ---
  createBackground() {
    const { width, worldWidth, worldHeight } = this.cameras.main;

    // Ciel gradient
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xFFD700, 0xFF8C00, 1);
    sky.fillRect(0, 0, worldWidth, worldHeight);
    sky.setScrollFactor(0.2);

    // Soleil
    const sun = this.add.circle(worldWidth * 0.15, 60, 50, 0xFFD700, 0.4);
    sun.setScrollFactor(0.2);

    // Nuages
    for (let i = 0; i < 8; i++) {
      const cx = 200 + i * 550 + Math.random() * 200;
      const cloud = this.add.graphics();
      cloud.fillStyle(0xFFFFFF, 0.3);
      cloud.fillCircle(cx, 40 + Math.random() * 30, 30);
      cloud.fillCircle(cx + 25, 35 + Math.random() * 20, 22);
      cloud.fillCircle(cx - 20, 38 + Math.random() * 20, 18);
      cloud.setScrollFactor(0.3);
    }

    // Palmiers (parallax)
    for (let i = 0; i < 12; i++) {
      const px = 300 + i * 350 + Math.random() * 100;
      const palm = this.add.graphics();
      palm.fillStyle(0x5D4037, 1);
      palm.fillRect(px, 280, 8, 120);
      palm.fillStyle(0x2E7D32, 1);
      palm.fillCircle(px + 4, 275, 25);
      palm.fillCircle(px - 15, 265, 18);
      palm.fillCircle(px + 22, 268, 16);
      palm.setScrollFactor(0.4);
      palm.setAlpha(0.5);
    }

    // Sable (décor bas)
    const sand = this.add.graphics();
    sand.fillStyle(0xF4D03F, 0.3);
    sand.fillRect(0, worldHeight - 60, worldWidth, 60);
    sand.setScrollFactor(0.9);
  }

  // --- HUD ---
  createHUD() {
    const { width } = this.cameras.main;
    this.hudContainer = this.add.container(0, 0).setScrollFactor(0).setDepth(100);

    // Fond HUD
    const hudBg = this.add.graphics();
    hudBg.fillStyle(0x1A1A2E, 0.7);
    hudBg.fillRoundedRect(10, 8, 320, 36, 12);
    this.hudContainer.add(hudBg);

    // Plumes
    this.hudLives = this.add.text(24, 26, '🪶', { fontSize: '16px' });
    this.hudLivesValue = this.add.text(50, 26, String(this.lives), {
      fontSize: '16px', fontFamily: 'Arial Black, Arial', color: '#FFD700',
    });
    this.hudContainer.add([this.hudLives, this.hudLivesValue]);

    // Fruits
    this.hudFruits = this.add.text(90, 26, '🍌', { fontSize: '16px' });
    this.hudFruitsValue = this.add.text(116, 26, String(this.fruits), {
      fontSize: '16px', fontFamily: 'Arial Black, Arial', color: '#FFA726',
    });
    this.hudContainer.add([this.hudFruits, this.hudFruitsValue]);

    // Score
    this.hudScore = this.add.text(156, 26, '⭐', { fontSize: '16px' });
    this.hudScoreValue = this.add.text(182, 26, String(this.score), {
      fontSize: '16px', fontFamily: 'Arial Black, Arial', color: '#FFFFFF',
    });
    this.hudContainer.add([this.hudScore, this.hudScoreValue]);

    // Boss HP (caché par défaut)
    this.hudBossContainer = this.add.container(0, 0).setScrollFactor(0).setDepth(100).setVisible(false);

    const bossBg = this.add.graphics();
    bossBg.fillStyle(0x1A1A2E, 0.7);
    bossBg.fillRoundedRect(width / 2 - 80, 50, 160, 30, 10);
    this.hudBossContainer.add(bossBg);

    this.hudBossLabel = this.add.text(width / 2, 57, 'Toucan Tambour', {
      fontSize: '11px', fontFamily: 'Arial', color: '#FFFFFF', align: 'center',
    }).setOrigin(0.5);
    this.hudBossContainer.add(this.hudBossLabel);

    this.hudBossHearts = [];
    for (let i = 0; i < 3; i++) {
      const heart = this.add.image(width / 2 - 24 + i * 24, 74, 'heart').setScale(0.8);
      this.hudBossHearts.push(heart);
      this.hudBossContainer.add(heart);
    }

    // Indicateur potion
    this.hudPotionIndicator = this.add.text(250, 26, '', {
      fontSize: '14px', fontFamily: 'Arial', color: '#00BCD4',
    }).setVisible(false);
    this.hudContainer.add(this.hudPotionIndicator);
  }

  updateHUD() {
    this.hudLivesValue.setText(String(this.lives));
    this.hudFruitsValue.setText(String(this.fruits));
    this.hudScoreValue.setText(String(this.score));

    // Boss HP
    if (this.boss && this.bossActive) {
      this.hudBossHearts.forEach((heart, i) => {
        heart.setTexture(i < this.bossHP ? 'heart' : 'heart_empty');
      });
    }
  }

  // --- Contrôles ---
  setupControls() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
    this.keyFire = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    this.keyCtrl = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL);
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Contrôles mobile via window (définis par le HTML)
    window._gameControls = { left: false, right: false, up: false, fire: false };
  }

  // --- Update principal ---
  update() {
    if (this.gameOver) return;

    // Pause overlay check
    if (this._paused) return;

    const { physics: physCfg } = GAME_CONFIG;
    const onGround = this.player.body.touching.down || this.player.body.blocked.down;

    // --- Mouvement horizontal ---
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

    // --- Saut ---
    const jumpKey = this.cursors.up.isDown || this.wasd.up.isDown || window._gameControls.up;
    if (jumpKey && onGround) {
      this.player.setVelocityY(physCfg.playerJump);
    }

    // --- Tir ---
    const fireKey = Phaser.Input.Keyboard.JustDown(this.keyFire) || Phaser.Input.Keyboard.JustDown(this.keyCtrl) || window._gameControls.fire;
    if (fireKey && this.fruits > 0) {
      this.fireBullet();
      window._gameControls.fire = false; // Reset mobile fire
    }

    // --- IA ennemis ---
    this.updateEnemies();

    // --- IA boss ---
    if (this.boss && this.bossActive && !this.bossDefeated) {
      this.updateBoss();
    }

    // --- Invincibilité visuelle ---
    this.updatePlayerVisual();

    // --- Update HUD ---
    this.updateHUD();
  }

  // --- Tir de fruit ---
  fireBullet() {
    this.fruits--;
    const bullet = this.bullets.create(this.player.x, this.player.y - 5, 'fruit_bullet');
    bullet.body.setAllowGravity(false);
    const dir = this.player.facingRight !== false ? 1 : -1;
    bullet.setVelocityX(GAME_CONFIG.physics.bulletSpeed * dir);
    bullet.body.checkWorldBounds = true;
    bullet.body.worldBounds.on('worldbounds', () => bullet.destroy());

    // Auto-destruction après distance max
    this.time.delayedCall(800, () => {
      if (bullet && bullet.active) bullet.destroy();
    });
  }

  // --- Collecter un fruit ---
  collectFruit(player, fruit) {
    if (!fruit.visible) return;
    fruit.setVisible(false);
    fruit.body.checkCollision.none = true;
    this.score += 10;
    this.fruits++;

    // Petit tween feedback
    const txt = this.add.text(fruit.x, fruit.y - 10, '+10', {
      fontSize: '14px', fontFamily: 'Arial Black', color: '#FFD700',
    }).setOrigin(0.5).setDepth(50);
    this.tweens.add({ targets: txt, y: txt.y - 30, alpha: 0, duration: 600, onComplete: () => txt.destroy() });
  }

  // --- Collecter potion ---
  collectPotion(player, potion) {
    potion.setVisible(false);
    potion.body.checkCollision.none = true;
    this.potionActiveUntil = this.time.now + GAME_CONFIG.player.potionDuration;
    this.hudPotionIndicator.setVisible(true);
  }

  // --- Collision avec ennemi ---
  hitEnemy(player, enemy) {
    if (!enemy.alive) return;
    const now = this.time.now;

    // Invincibilité joueur active ?
    if (this.potionActiveUntil > now) {
      this.defeatEnemy(enemy);
      return;
    }

    // Invulnérabilité récente ?
    if (this.invincibleUntil > now) return;

    // Saut sur la tête ?
    if (player.body.velocity.y > 0 && player.y < enemy.y - 10) {
      this.defeatEnemy(enemy);
      player.setVelocityY(-250); // Rebond
      return;
    }

    // Collision côté → dommage
    this.playerHit();
  }

  // --- Défaire un ennemi ---
  defeatEnemy(enemy) {
    enemy.alive = false;
    this.score += enemy.scoreValue;

    // Feedback visuel
    const txt = this.add.text(enemy.x, enemy.y - 15, '+' + enemy.scoreValue, {
      fontSize: '14px', fontFamily: 'Arial Black', color: '#2ECC71',
    }).setOrigin(0.5).setDepth(50);
    this.tweens.add({
      targets: enemy, alpha: 0, scaleX: 0, scaleY: 0, duration: 300, onComplete: () => enemy.destroy(),
    });
    this.tweens.add({ targets: txt, y: txt.y - 30, alpha: 0, duration: 600, onComplete: () => txt.destroy() });
  }

  // --- Joueur touché ---
  playerHit() {
    this.lives--;
    this.invincibleUntil = this.time.now + GAME_CONFIG.player.invincibleTime;

    if (this.lives <= 0) {
      this.gameOver = true;
      this.time.delayedCall(500, () => this.scene.start('GameOver'));
    }
  }

  // --- IA ennemis ---
  updateEnemies() {
    this.enemies.forEach(enemy => {
      if (!enemy.alive) return;

      if (enemy.enemyType === 'singe') {
        // Singe : tire des noix de coco
        const now = this.time.now;
        const interval = GAME_CONFIG.enemyTypes.singe.shootInterval;
        const dir = this.player.x < enemy.x ? -1 : 1;

        if (now - enemy.lastShot > interval) {
          enemy.lastShot = now;
          const proj = this.enemyBullets.create(enemy.x, enemy.y + 10, 'coconut');
          proj.body.setAllowGravity(true);
          proj.setVelocityX(GAME_CONFIG.enemyTypes.singe.projectileSpeed * dir);
          proj.setVelocityY(-100);
          this.time.delayedCall(3000, () => { if (proj.active) proj.destroy(); });
        }
      } else {
        // Patrouille gauche/droite
        if (enemy.patrolRange > 0) {
          if (enemy.x > enemy.patrolOrigin + enemy.patrolRange) {
            enemy.facingRight = false;
          } else if (enemy.x < enemy.patrolOrigin - enemy.patrolRange) {
            enemy.facingRight = true;
          }
          const dir = enemy.facingRight ? 1 : -1;
          enemy.setVelocityX(enemy.patrolSpeed * dir);
          enemy.setFlipX(!enemy.facingRight);
        }
      }
    });
  }

  // --- Hit by enemy projectile ---
  hitByEnemyProjectile(player, proj) {
    proj.destroy();
    const now = this.time.now;
    if (this.potionActiveUntil > now) return;
    if (this.invincibleUntil > now) return;
    this.playerHit();
  }

  // --- Hit by boss projectile ---
  hitByBossProjectile(player, proj) {
    proj.destroy();
    const now = this.time.now;
    if (this.potionActiveUntil > now) return;
    if (this.invincibleUntil > now) return;
    this.playerHit();
  }

  // --- Activer le boss ---
  activateBoss(player, zone) {
    if (this.bossActive) return;
    this.bossActive = true;
    zone.destroy();

    const bossCfg = GAME_CONFIG.level1.boss;

    // Figer la caméra sur la zone boss
    this.cameras.main.setBounds(bossCfg.x - 300, 0, 900, GAME_CONFIG.level1.worldHeight);

    // Créer le boss
    this.boss = this.physics.add.sprite(bossCfg.x, bossCfg.y, 'toucan');
    this.boss.setImmovable(true);
    this.boss.setBounce(0);
    this.boss.setCollideWorldBounds(true);
    this.boss.body.setSize(48, 44);
    this.boss.body.setOffset(2, 4);
    this.boss.facingRight = false;
    this.physics.add.collider(this.boss, this.platforms);
    this.physics.add.overlap(this.player, this.boss, this.hitBoss, null, this);
    this.physics.add.overlap(this.bullets, this.boss, this.bulletHitBoss, null, this);

    // Afficher HUD boss
    this.hudBossContainer.setVisible(true);

    // Boss AI
    this.startBossAI();

    // Message
    const msg = this.add.text(this.cameras.main.midX, 100, '⚠️ Toucan Tambour !', {
      fontSize: '20px', fontFamily: 'Arial Black', color: '#E53935',
      stroke: '#1A1A2E', strokeThickness: 3,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
    this.tweens.add({ targets: msg, alpha: 0, y: 80, delay: 2000, duration: 800, onComplete: () => msg.destroy() });
  }

  // --- Boss AI ---
  startBossAI() {
    if (this.bossAITimer) this.bossAITimer.destroy();
    this.bossAITimer = this.time.addEvent({
      delay: 200,
      callback: () => this.updateBoss(),
      loop: true,
    });
  }

  updateBoss() {
    if (!this.boss || !this.bossActive || this.bossDefeated) return;

    const now = this.time.now;
    const bossCfg = GAME_CONFIG.level1.boss;

    // Stun check
    if (this.bossStunUntil > now) {
      this.boss.setTint(0xFFFF00);
      return;
    } else {
      this.boss.clearTint();
    }

    // Déplacement vers le joueur
    const dir = this.player.x < this.boss.x ? -1 : 1;
    this.boss.setVelocityX(bossCfg.speed * dir);
    this.boss.setFlipX(dir < 0);

    // Tir de graine
    if (now - this.lastBossShot > bossCfg.shootInterval) {
      this.lastBossShot = now;
      const proj = this.bossProjectiles.create(this.boss.x, this.boss.y + 20, 'seed');
      proj.body.setAllowGravity(false);
      proj.setVelocityX(250 * dir);
      this.time.delayedCall(2000, () => { if (proj.active) proj.destroy(); });
    }
  }

  // --- Collision joueur vs boss ---
  hitBoss(player, boss) {
    const now = this.time.now;

    // Saut sur la tête ?
    if (player.body.velocity.y > 0 && player.y < boss.y - 15) {
      if (this.bossStunUntil < now) {
        this.bossHP--;
        this.bossStunUntil = now + bossCfg.stunDuration;
        player.setVelocityY(-300); // Rebond

        // Boss accélère
        bossCfg.speed += 20;

        // Feedback
        const txt = this.add.text(boss.x, boss.y - 30, '💥', {
          fontSize: '24px',
        }).setOrigin(0.5).setDepth(50);
        this.tweens.add({ targets: txt, y: txt.y - 40, alpha: 0, duration: 600, onComplete: () => txt.destroy() });

        if (this.bossHP <= 0) {
          this.defeatBoss();
        }
      }
      return;
    }

    // Collision côté
    if (this.potionActiveUntil > now) return;
    if (this.invincibleUntil > now) return;
    this.playerHit();
  }

  // --- Bullet hit boss ---
  bulletHitBoss(bullet, boss) {
    bullet.destroy();
    const now = this.time.now;
    // Les fruits étourdissent le boss sans retirer de vie
    this.bossStunUntil = now + GAME_CONFIG.level1.boss.stunDuration;
  }

  // --- Défaite du boss ---
  defeatBoss() {
    this.bossDefeated = true;
    this.bossActive = false;
    if (this.bossAITimer) this.bossAITimer.destroy();

    // Animation boss qui s'envole
    this.tweens.add({
      targets: this.boss,
      y: -100, alpha: 0, duration: 1500, ease: 'Cubic.easeIn',
      onComplete: () => {
        this.boss.destroy();
        this.showPerch();
      },
    });

    this.score += 100;

    // Message
    const msg = this.add.text(this.cameras.main.midX, 120, '🐦 Le Toucan Tambour s\'envole !', {
      fontSize: '18px', fontFamily: 'Arial Black', color: '#FFD700',
      stroke: '#1A1A2E', strokeThickness: 3,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
    this.tweens.add({ targets: msg, alpha: 0, delay: 2500, duration: 800, onComplete: () => msg.destroy() });
  }

  // --- Afficher le perchoir ---
  showPerch() {
    const perchCfg = GAME_CONFIG.level1.perch;
    this.perch = this.physics.add.staticSprite(perchCfg.x, perchCfg.y, 'perch');
    this.tweens.add({ targets: this.perch, alpha: 1, duration: 500 });
    this.physics.add.overlap(this.player, this.perch, this.reachPerch, null, this);

    // Libérer la caméra
    this.cameras.main.setBounds(GAME_CONFIG.level1.boss.x - 300, 0, 900, GAME_CONFIG.level1.worldHeight);
  }

  // --- Atteindre le perchoir ---
  reachPerch(player, perch) {
    perch.destroy();
    this.saveProgress();
    this.scene.start('Victory', {
      score: this.score,
      fruitsCollected: this.fruits,
    });
  }

  // --- Mise à jour visuelle invincibilité ---
  updatePlayerVisual() {
    const now = this.time.now;

    // Potion active
    if (this.potionActiveUntil > now) {
      this.player.setTexture('parrot_invincible');
      const remaining = Math.ceil((this.potionActiveUntil - now) / 1000);
      this.hudPotionIndicator.setText('✨ ' + remaining + 's');
      return;
    } else {
      this.hudPotionIndicator.setVisible(false);
    }

    // Invulnérabilité (clignotement)
    if (this.invincibleUntil > now) {
      this.player.setTexture('parrot');
      this.player.setAlpha(this.time.now % 200 < 100 ? 0.3 : 1);
    } else {
      this.player.setTexture('parrot');
      this.player.setAlpha(1);
    }
  }

  // --- Timers ---
  updateTimers() {
    // Rien d'urgent, géré dans update()
  }

  // --- Pause ---
  togglePause() {
    if (this.gameOver) return;
    this._paused = !this._paused;
    this.physics.world.pause();

    if (this._paused) {
      const { width, height } = this.cameras.main;
      const overlay = this.add.graphics().setScrollFactor(0).setDepth(200);
      overlay.fillStyle(0x1A1A2E, 0.85);
      overlay.fillRect(0, 0, width, height);
      overlay.fillRoundedRect(width / 2 - 120, height / 2 - 80, 240, 160, 16);

      this.add.text(width / 2, height / 2 - 40, '⏸️ Pause', {
        fontSize: '28px', fontFamily: 'Arial Black', color: '#FFD700',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

      const btnResume = this.add.text(width / 2, height / 2 + 10, '▶ Reprendre', {
        fontSize: '16px', fontFamily: 'Arial Black', color: '#FFFFFF', backgroundColor: '#2ECC71',
        padding: { x: 16, y: 8 },
      }).setOrigin(0.5).setScrollFactor(0).setDepth(201).setInteractive({ useHandCursor: true });

      const btnQuit = this.add.text(width / 2, height / 2 + 50, '🏠 Quitter', {
        fontSize: '14px', fontFamily: 'Arial', color: 'rgba(255,255,255,0.6)',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(201).setInteractive({ useHandCursor: true });

      const scene = this;
      btnResume.on('pointerdown', () => {
        scene.physics.world.resume();
        scene._paused = false;
        overlay.destroy();
        scene.children.each(c => { if (c.depth === 200 || c.depth === 201) c.destroy(); });
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

      // Meilleur score
      const prev = parseInt(localStorage.getItem(keys.bestScore) || '0');
      if (this.score > prev) localStorage.setItem(keys.bestScore, String(this.score));

      localStorage.setItem(keys.fruitsCollected, String(this.fruits));
      localStorage.setItem(keys.completedAt, new Date().toISOString());
    } catch (e) {
      console.warn('Game save error:', e);
    }
  }
}

// ============================================================
// GAME OVER SCENE
// ============================================================
class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOver' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1A1A2E, 0x1A1A2E, 0x4A0000, 0x4A0000, 1);
    bg.fillRect(0, 0, width, height);

    // Message
    this.add.text(width / 2, height * 0.25, '🪶 Oh non !', {
      fontSize: 'clamp(24px, 6vw, 40px)', fontFamily: 'Arial Black', color: '#E53935',
      align: 'center',
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.4, 'Le perroquet a perdu toutes ses plumes !', {
      fontSize: 'clamp(12px, 3vw, 16px)', fontFamily: 'Arial', color: 'rgba(255,255,255,0.8)',
      align: 'center',
    }).setOrigin(0.5);

    // Score
    this.add.text(width / 2, height * 0.52, 'Score : ' + (this.score || 0), {
      fontSize: '18px', fontFamily: 'Arial Black', color: '#FFD700',
    }).setOrigin(0.5);

    // Bouton Rejouer
    const btnReplay = this.add.text(width / 2, height * 0.68, '🔄  Rejouer', {
      fontSize: 'clamp(14px, 3.5vw, 20px)', fontFamily: 'Arial Black', color: '#FFFFFF',
      backgroundColor: '#FF8C00', padding: { x: 20, y: 10 }, align: 'center',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btnReplay.on('pointerover', () => btnReplay.setStyle({ backgroundColor: '#FFA726' }));
    btnReplay.on('pointerout', () => btnReplay.setStyle({ backgroundColor: '#FF8C00' }));
    btnReplay.on('pointerdown', () => this.scene.start('Level1'));

    // Bouton Retour
    const btnBack = this.add.text(width / 2, height * 0.82, '🏠  Retour espace membre', {
      fontSize: 'clamp(11px, 2.5vw, 14px)', fontFamily: 'Arial', color: 'rgba(255,255,255,0.5)',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btnBack.on('pointerdown', () => window.location.href = './espace-membre.html');
  }
}

// ============================================================
// VICTORY SCENE
// ============================================================
class VictoryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Victory' });
  }

  create(data) {
    const score = data?.score || 0;
    const fruits = data?.fruitsCollected || 0;
    const { width, height } = this.cameras.main;
    const reward = GAME_CONFIG.rewards.level1;

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1A1A2E, 0x1A1A2E, 0x0F3460, 0x0F3460, 1);
    bg.fillRect(0, 0, width, height);

    // Particules confettis
    for (let i = 0; i < 20; i++) {
      const colors = [0xFFD700, 0x2ECC71, 0xFF8C00, 0xE53935, 0x00CED1];
      const p = this.add.circle(
        Math.random() * width, Math.random() * height,
        Phaser.Math.Between(2, 5),
        Phaser.Utils.Array.GetRandom(colors),
        0.6
      );
      this.tweens.add({
        targets: p, y: p.y - 200 - Math.random() * 100,
        alpha: 0, duration: 2000 + Math.random() * 2000, repeat: -1,
        delay: Math.random() * 2000,
        onRepeat: () => { p.y = height + 20; p.alpha = 0.6; },
      });
    }

    // Titre
    this.add.text(width / 2, height * 0.12, '🎉 Bravo !', {
      fontSize: 'clamp(28px, 7vw, 44px)', fontFamily: 'Arial Black', color: '#FFD700',
      align: 'center',
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.23, 'Tu as battu le Toucan Tambour ! 🦜', {
      fontSize: 'clamp(13px, 3vw, 18px)', fontFamily: 'Arial', color: '#FAFAFA',
      align: 'center',
    }).setOrigin(0.5);

    // Badge
    const badgeBg = this.add.graphics();
    badgeBg.fillStyle(0xFFD700, 0.15);
    badgeBg.fillRoundedRect(width / 2 - 140, height * 0.31, 280, 50, 12);
    badgeBg.lineStyle(2, 0xFFD700, 0.5);
    badgeBg.strokeRoundedRect(width / 2 - 140, height * 0.31, 280, 50, 12);

    this.add.text(width / 2, height * 0.365, '🏆 Badge : ' + GAME_CONFIG.badges.level1, {
      fontSize: 'clamp(11px, 2.5vw, 14px)', fontFamily: 'Arial Black', color: '#FFD700',
      align: 'center',
    }).setOrigin(0.5);

    // Stats
    this.add.text(width / 2, height * 0.47, '⭐ ' + score + ' points  |  🍌 ' + fruits + ' fruits', {
      fontSize: '14px', fontFamily: 'Arial', color: 'rgba(255,255,255,0.7)',
    }).setOrigin(0.5);

    // Récompense
    this.add.text(width / 2, height * 0.55, '🎁 Tu as gagné une récompense du Club !', {
      fontSize: 'clamp(12px, 2.8vw, 16px)', fontFamily: 'Arial', color: '#FAFAFA',
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.62, reward.description, {
      fontSize: 'clamp(10px, 2.2vw, 13px)', fontFamily: 'Arial', color: 'rgba(255,255,255,0.6)',
      align: 'center', lineSpacing: 3,
    }).setOrigin(0.5).setWordWrapWidth(width * 0.75);

    // Bouton Récompense
    const btnReward = this.add.text(width / 2, height * 0.74, reward.buttonText, {
      fontSize: 'clamp(13px, 3vw, 17px)', fontFamily: 'Arial Black', color: '#1A1A2E',
      backgroundColor: '#FFD700', padding: { x: 20, y: 10 }, align: 'center',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btnReward.on('pointerover', () => btnReward.setStyle({ backgroundColor: '#FFA726' }));
    btnReward.on('pointerout', () => btnReward.setStyle({ backgroundColor: '#FFD700' }));
    btnReward.on('pointerdown', () => window.open(reward.url, '_blank'));

    // Bouton Niveau suivant
    const btnNext = this.add.text(width / 2, height * 0.84, '▶  Niveau suivant', {
      fontSize: 'clamp(12px, 2.8vw, 15px)', fontFamily: 'Arial Black', color: '#FFFFFF',
      backgroundColor: '#2ECC71', padding: { x: 16, y: 8 }, align: 'center',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btnNext.on('pointerover', () => btnNext.setStyle({ backgroundColor: '#27AE60' }));
    btnNext.on('pointerout', () => btnNext.setStyle({ backgroundColor: '#2ECC71' }));
    btnNext.on('pointerdown', () => {
      this.add.text(width / 2, height * 0.92, '🌴 Le prochain niveau arrive bientôt dans le Club !', {
        fontSize: 'clamp(10px, 2.2vw, 13px)', fontFamily: 'Arial', color: '#FFD700',
      }).setOrigin(0.5);
    });

    // Bouton Retour
    const btnBack = this.add.text(width / 2, height * 0.95, '🏠  Retour', {
      fontSize: '11px', fontFamily: 'Arial', color: 'rgba(255,255,255,0.4)',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btnBack.on('pointerdown', () => window.location.href = './espace-membre.html');

    // Lien YouTube secondaire
    this.add.text(width / 2, height * 0.99, '📺  Voir la chaîne YouTube', {
      fontSize: '10px', fontFamily: 'Arial', color: 'rgba(255,255,255,0.3)',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => window.open('https://www.youtube.com/@El-Ramon-Music', '_blank'));

    // Mention affiliation
    this.add.text(width / 2, height - 5, 'Certains liens sont des liens partenaires et soutiennent le projet.', {
      fontSize: '9px', fontFamily: 'Arial', color: 'rgba(255,255,255,0.2)',
    }).setOrigin(0.5);
  }
}

// ============================================================
// INITIALISATION PHASER
// ============================================================
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
  scene: [BootScene, StartScene, Level1Scene, GameOverScene, VictoryScene],
  pixelArt: false,
  roundPixels: true,
};

// Créer l'instance Phaser
const game = new Phaser.Game(gameConfig);

// Exposer pour les contrôles mobile
window._phaserGame = game;
