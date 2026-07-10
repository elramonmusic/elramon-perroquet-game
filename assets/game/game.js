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
// Ancien objet SFX manuel supprimé. L'audio utilise maintenant Phaser Sound Manager.

// ============================================================
// PRELOAD SCENE — Chargement des assets réels (images et audio)
// ============================================================
class PreloadScene extends Phaser.Scene {
  constructor() { super({ key: 'Preload' }); }
  preload() {
    this.load.spritesheet('real_parrot', '../assets/images/game/parrot.png?v=5', { frameWidth: 250, frameHeight: 250 });
    
    // Fonds Parallax HD
    this.load.image('parallax_ciel', '../assets/images/game/parallax/ciel.png?v=1');
    this.load.image('parallax_montagnes', '../assets/images/game/parallax/montagnes.png?v=1');
    this.load.image('parallax_plage', '../assets/images/game/parallax/plage.png?v=1');
    this.load.image('parallax_feuilles', '../assets/images/game/parallax/feuilles.png?v=1');
    
    // Level 2 Assets
    this.load.image('lvl2_ciel', '../assets/images/game/level2/bg_ciel_temple.png?v=1');
    this.load.image('lvl2_montagnes', '../assets/images/game/level2/bg_montagnes_temple.png?v=1');
    this.load.image('lvl2_plage', '../assets/images/game/level2/bg_plage_temple.png?v=1');
    this.load.image('lvl2_feuilles', '../assets/images/game/level2/bg_feuilles_temple.png?v=1');
    this.load.image('mushroom', '../assets/images/game/level2/mushroom.png?v=1');
    this.load.spritesheet('boss_singe', '../assets/images/game/level2/boss_singe_maracasse.png?v=1', { frameWidth: 250, frameHeight: 250 });
    this.load.image('particle_star', '../assets/images/game/star.png?v=1');
    this.load.image('victory_bg', '../assets/images/game/victory_bg.png?v=2');
    this.load.image('fruit_banana', '../assets/images/game/banana.png?v=1');
    this.load.image('fruit_orange', '../assets/images/game/orange.png?v=1');
    this.load.image('fruit_cherry', '../assets/images/game/cherry.png?v=1');
    this.load.image('platform_tex', '../assets/images/game/platform.png?v=51');
    this.load.spritesheet('fruits_sheet', '../assets/images/game/fruit.png?v=51', { frameWidth: 120, frameHeight: 180 });
    this.load.spritesheet('enemy_crab', '../assets/images/game/crab.png?v=52', { frameWidth: 250, frameHeight: 250 });
    this.load.spritesheet('enemy_snake', '../assets/images/game/snake.png?v=52', { frameWidth: 250, frameHeight: 250 });
    
    this.load.spritesheet('boss_toucan', '../assets/images/game/boss.png?v=50', { frameWidth: 250, frameHeight: 250 });

    this.load.audio('bgm_tropical', '../assets/audio/game/bgm_tropical.mp3?v=2');
    this.load.audio('sfx_boss_drum', '../assets/audio/game/sfx_boss_drum.mp3?v=1');
    this.load.audio('sfx_chest', '../assets/audio/game/sfx_chest.mp3?v=1');
    this.load.audio('sfx_collect_fruit', '../assets/audio/game/sfx_collect_fruit.mp3?v=1');
    this.load.audio('sfx_collect_note', '../assets/audio/game/sfx_collect_note.mp3?v=3');
    this.load.audio('sfx_hit_boss', '../assets/audio/game/sfx_hit_boss.mp3?v=1');
    this.load.audio('sfx_hit_enemy', '../assets/audio/game/sfx_hit_enemy.mp3?v=1');
    this.load.audio('sfx_hit_player', '../assets/audio/game/sfx_hit_player.mp3?v=1');
    this.load.audio('sfx_jump', '../assets/audio/game/sfx_jump.mp3?v=1');
    this.load.audio('sfx_potion', '../assets/audio/game/sfx_potion.mp3?v=1');
    this.load.audio('sfx_shoot', '../assets/audio/game/sfx_shoot.mp3?v=1');
    this.load.audio('sfx_victory', '../assets/audio/game/sfx_victory.mp3?v=1');
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

    // --- Note de Musique (16x16) ---
    g.clear();
    g.fillStyle(0x9C27B0, 1);
    g.fillCircle(4, 12, 4);
    g.fillCircle(12, 10, 4);
    g.fillRect(6, 2, 2, 10);
    g.fillRect(14, 0, 2, 10);
    g.fillRect(6, 2, 10, 3);
    g.generateTexture('note', 16, 16);

    // --- Soleil Bonus (24x24) ---
    g.clear();
    g.fillStyle(0xFFD700, 1);
    g.fillCircle(12, 12, 8);
    // Rayons
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      g.fillTriangle(
        12 + Math.cos(angle - 0.2) * 8, 12 + Math.sin(angle - 0.2) * 8,
        12 + Math.cos(angle + 0.2) * 8, 12 + Math.sin(angle + 0.2) * 8,
        12 + Math.cos(angle) * 12, 12 + Math.sin(angle) * 12
      );
    }
    g.generateTexture('sun', 24, 24);

    // --- Plume (Vie) (12x24) ---
    g.clear();
    g.fillStyle(0xFFFFFF, 1);
    g.fillEllipse(6, 12, 6, 12);
    g.fillStyle(0xFF8C00, 1);
    g.fillEllipse(6, 12, 4, 8);
    g.fillStyle(0x2ECC71, 1);
    g.fillRect(5, 20, 2, 4);
    g.generateTexture('plume', 12, 24);

    // --- Plume Vide (12x24) ---
    g.clear();
    g.fillStyle(0x333333, 0.4);
    g.fillEllipse(6, 12, 6, 12);
    g.generateTexture('plume_empty', 12, 24);

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

    const parrot = this.add.sprite(w / 2, h * 0.55, 'real_parrot').setDisplaySize(80, 80);
    
    if (!this.anims.exists('parrot_fly')) {
      this.anims.create({
        key: 'parrot_fly',
        frames: this.anims.generateFrameNumbers('real_parrot', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
      });
    }
    parrot.play('parrot_fly');
    
    this.tweens.add({ targets: parrot, y: h * 0.55 - 15, yoyo: true, repeat: -1, duration: 1200, ease: 'Sine.easeInOut' });

    const btnPlay = this.add.text(w / 2, h * 0.78, '🎮  Jouer', {
      fontSize: '22px', fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#FFFFFF', backgroundColor: '#FF8C00', padding: { x: 24, y: 12 }, align: 'center',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btnPlay.on('pointerover', () => btnPlay.setStyle({ backgroundColor: '#FFA726' }));
    btnPlay.on('pointerout', () => btnPlay.setStyle({ backgroundColor: '#FF8C00' }));
    btnPlay.on('pointerdown', () => {
      this.sound.play('sfx_collect_note');
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
class BaseLevelScene extends Phaser.Scene {
  constructor(key) { super({ key }); }

  create() {
    const cfg = GAME_CONFIG;
    const level = cfg[this.levelKey];

    this.score = 0;
    this.fruits = 0;
    this.lives = cfg.player.lives;
    this.invincibleUntil = 0;
    this.potionActiveUntil = 0;
    this.bossActive = false;
    this.canDoubleJump = this.levelKey === 'level2' || (typeof DEBUG_MODE !== 'undefined' ? DEBUG_MODE : false);
    this.hasDoubleJumped = false;
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

    // --- Sol / Plateformes ---
    this.platforms = this.physics.add.staticGroup();
    // Le sol principal
    const ground = this.add.tileSprite(0, level.worldHeight, level.worldWidth * 2, 80, 'platform_tex').setOrigin(0, 1);
    this.physics.add.existing(ground, true);
    this.platforms.add(ground);

    // --- Plateformes ---
    level.platforms.forEach(p => {
      // Ombre / Bordure pour détacher la plateforme du décor
      this.add.rectangle(p.x, p.y, p.w, p.h, 0x000000, 0.5).setOrigin(-0.02, -0.1);
      
      this.add.tileSprite(p.x, p.y, p.w, p.h, 'platform_tex').setOrigin(0, 0);

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
    // Le sprite original fait 250x250. On le réduit visuellement.
    this.player.setDisplaySize(50, 50);
    
    // Hitbox sur la taille originale (250x250)
    // On centre la hitbox sur le perroquet (ex: 150x150, offset 50x50)
    this.player.body.setSize(150, 150);
    this.player.body.setOffset(50, 50);

    // Animation
    if (!this.anims.exists('parrot_fly')) {
      this.anims.create({
        key: 'parrot_fly',
        frames: this.anims.generateFrameNumbers('real_parrot', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
      });
    }
    this.player.play('parrot_fly');

    this.physics.add.collider(this.player, this.platforms);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // --- Fruits (sprites animés) ---
    const fruitAnimKeys = ['fruit_mango', 'fruit_pineapple', 'fruit_banana_anim', 'fruit_coconut', 'fruit_watermelon', 'fruit_grapes'];
    
    // Création des animations de clignement des yeux
    const animStarts = [0, 2, 4, 6, 8, 10];
    animStarts.forEach((startFrame, index) => {
      const key = fruitAnimKeys[index];
      if (!this.anims.exists(key)) {
        this.anims.create({
          key: key,
          frames: this.anims.generateFrameNumbers('fruits_sheet', { frames: [startFrame, startFrame + 1, startFrame] }),
          frameRate: 15, // Clignement très rapide
          repeat: -1,
          repeatDelay: Phaser.Math.Between(2000, 5000) // Délai aléatoire entre chaque clignement
        });
      }
    });

    this.fruitSprites = [];
    level.fruits.forEach(f => {
      const sprite = this.physics.add.sprite(f.x, f.y, 'fruits_sheet');
      sprite.body.allowGravity = false;
      sprite.setImmovable(true);
      
      const anim = Phaser.Math.RND.pick(fruitAnimKeys);
      sprite.play(anim);
      
      // Ajustement de la taille
      sprite.setDisplaySize(36, 54);
      sprite.body.setSize(120, 180);

      sprite.fruitType = f.type;
      sprite.fruitBaseY = f.y;
      this.fruitSprites.push(sprite);
      this.physics.add.overlap(this.player, sprite, this.collectFruit, null, this);
    });

    // --- Collectibles (Notes & Soleils) ---
    this.collectibleSprites = [];
    if (level.collectibles) {
      level.collectibles.forEach(c => {
        const sprite = this.physics.add.staticImage(c.x, c.y, c.type);
        sprite.collectibleType = c.type;
        sprite.baseY = c.y;
        this.collectibleSprites.push(sprite);
        this.physics.add.overlap(this.player, sprite, this.collectSpecial, null, this);
      });
    }

    
    // --- Champignons Rebondissants ---
    this.mushrooms = this.physics.add.staticGroup();
    if (level.mushrooms) {
      level.mushrooms.forEach(m => {
        const mush = this.mushrooms.create(m.x, m.y, 'mushroom');
        mush.setDisplaySize(64, 64);
        // Hitbox plus petite et concentrée sur le haut du champignon
        mush.body.setSize(40, 20);
        mush.body.setOffset(12, 10);
      });
      this.physics.add.collider(this.player, this.mushrooms, this.bounceMushroom, null, this);
    }

    // --- Potion ---
    this.potion = this.physics.add.staticImage(level.potion.x, level.potion.y, 'potion');
    this.physics.add.overlap(this.player, this.potion, this.collectPotion, null, this);

    // Animations Ennemis
    if (!this.anims.exists('crab_walk')) {
      this.anims.create({ key: 'crab_walk', frames: this.anims.generateFrameNumbers('enemy_crab', { start: 0, end: 3 }), frameRate: 8, repeat: -1 });
    }
    if (!this.anims.exists('snake_walk')) {
      this.anims.create({ key: 'snake_walk', frames: this.anims.generateFrameNumbers('enemy_snake', { start: 0, end: 3 }), frameRate: 8, repeat: -1 });
    }

    // --- Ennemis ---
    this.enemies = this.physics.add.group();
    level.enemies.forEach(e => {
      const cfgE = GAME_CONFIG.enemyTypes[e.type];
      const texMap = { crabe: 'enemy_crab', serpent: 'enemy_snake' };
      const enemy = this.physics.add.sprite(e.x, e.y, texMap[e.type]);
      
      enemy.setDisplaySize(80, 80); // Taille visuelle 80x80
      enemy.setDepth(10); // S'assure qu'ils sont dessinés au premier plan
      
      if (e.type === 'crabe') {
        enemy.play('crab_walk');
        // Les pieds du crabe sont à y=190 sur la frame de 250
        enemy.body.setSize(200, 125).setOffset(25, 65);
      }
      if (e.type === 'serpent') {
        enemy.play('snake_walk');
        // Les pieds du serpent sont à y=223 sur la frame de 250
        enemy.body.setSize(200, 156).setOffset(25, 67);
      }
      
      enemy.enemyType = e.type;
      enemy.scoreValue = cfgE.score;
      enemy.alive = true;
      enemy.patrolOrigin = e.x;
      enemy.patrolRange = e.range;
      enemy.patrolSpeed = e.speed;
      enemy.facingRight = true;
      
      this.physics.add.collider(enemy, this.platforms);
      this.physics.add.overlap(this.player, enemy, this.hitEnemy, null, this);

      this.enemies.add(enemy);
    });

    // --- Projectiles joueur ---
    this.bullets = this.physics.add.group({ maxSize: 10 });
    this.physics.add.overlap(this.bullets, this.enemies, this.bulletHitEnemy, null, this);

    // --- Projectiles ennemis (singe) ---
    this.enemyBullets = this.physics.add.group();
    this.physics.add.overlap(this.player, this.enemyBullets, this.hitByProjectile, null, this);

    // Audio BGM
    if (!this.sound.get('bgm_tropical')) {
      this.bgm = this.sound.add('bgm_tropical', { loop: true, volume: 0.5 });
      this.bgm.play();
    } else {
      this.bgm = this.sound.get('bgm_tropical');
      if (!this.bgm.isPlaying) this.bgm.play();
    }
    
    // Config Physics monde (invisible trigger) ---
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
    // --- Décor et Parallax ---
    const scaleY = 450 / 375; // 1.2 pour adapter la hauteur 375 à l'écran 450
    // On met une largeur de 800 pour couvrir l'écran (le TileSprite se répètera si on avance)
    
    // 1. Ciel (le plus lent, tout au fond)
    this.bgCiel = this.add.tileSprite(0, 0, 800 / scaleY + 10, 375, 'parallax_ciel').setOrigin(0, 0).setScale(scaleY).setScrollFactor(0).setDepth(-10);
    // 2. Montagnes et mer (moyen)
    this.bgMontagnes = this.add.tileSprite(0, 0, 800 / scaleY + 10, 375, 'parallax_montagnes').setOrigin(0, 0).setScale(scaleY).setScrollFactor(0).setDepth(-9);
    // 3. Plage et palmiers arrière (plus rapide)
    this.bgPlage = this.add.tileSprite(0, 0, 800 / scaleY + 10, 375, 'parallax_plage').setOrigin(0, 0).setScale(scaleY).setScrollFactor(0).setDepth(-8);
    // 4. Feuilles (au premier plan absolu, bouge très vite)
    this.bgFeuilles = this.add.tileSprite(0, 0, 800 / scaleY + 10, 375, 'parallax_feuilles').setOrigin(0, 0).setScale(scaleY).setScrollFactor(0).setDepth(100);

    // Particules ambiantes (Lucioles/Pollen)
    this.pollenEmitter = this.add.particles(0, 0, 'particle_star', {
      x: { min: 0, max: GAME_CONFIG.level1.worldWidth },
      y: { min: 0, max: 450 },
      lifespan: { min: 3000, max: 6000 },
      speedY: { min: -5, max: -15 },
      speedX: { min: -20, max: 20 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 0, end: 0.6 },
      tint: 0xFFD700,
      blendMode: 'ADD',
      frequency: 300
    }).setDepth(50);

    // Sable de base
    const sand = this.add.graphics();
    sand.fillStyle(0xF4D03F, 0.5);
    sand.fillRect(0, 450 - 60, ww, 60);

    // L'océan est maintenant géré par le parallax, donc plus besoin de Graphics
    // (Ancien code d'eau commenté)
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
    
    // UI Plumes
    this.hudPlumes = [];
    for (let i = 0; i < 3; i++) {
      const plume = this.add.image(24 + i * 16, 26, 'plume').setScale(0.8);
      this.hudPlumes.push(plume);
      this.hudContainer.add(plume);
    }
    
    this.hudContainer.add([
      this.add.text(90, 26, '🍌', { fontSize: '16px' }),
      this.add.text(116, 26, '0', { fontSize: '16px', fontFamily: 'Arial Black, Arial', color: '#FFA726' }),
      this.add.text(156, 26, '⭐', { fontSize: '16px' }),
      this.add.text(182, 26, '0', { fontSize: '16px', fontFamily: 'Arial Black, Arial', color: '#FFFFFF' }),
    ]);

    // HUD fruits + score refs
    this.hudFruitsText = this.hudContainer.list.slice(-3)[0]; // The '0' text for fruits
    this.hudScoreText = this.hudContainer.list.slice(-1)[0];  // The '0' text for score

    // Boss HP (caché)
    this.hudBossContainer = this.add.container(0, 0).setScrollFactor(0).setDepth(100).setVisible(false);
    const bossBg = this.add.graphics();
    bossBg.fillStyle(0x1A1A2E, 0.7);
    bossBg.fillRoundedRect(w / 2 - 80, 50, 160, 30, 10);
    this.hudBossContainer.add(bossBg);
    this.hudBossLabel = this.add.text(w / 2, 57, GAME_CONFIG[this.levelKey] ? GAME_CONFIG[this.levelKey].boss.name : 'Boss', {
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
    
    // --- Bouton Son ---
    const soundBtn = this.add.text(GAME_CONFIG.width - 50, 20, '🔊', { fontSize: '24px' })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(150)
      .setInteractive({ useHandCursor: true });
      
    soundBtn.text = this.sound.mute ? '🔇' : '🔊';

    soundBtn.on('pointerdown', () => {
      this.sound.mute = !this.sound.mute;
      soundBtn.text = this.sound.mute ? '🔇' : '🔊';
    });
  }

  updateHUD() {
    this.hudPlumes.forEach((plume, i) => {
      plume.setTexture(i < this.lives ? 'plume' : 'plume_empty');
    });
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

    if (typeof DEBUG_MODE !== 'undefined' && DEBUG_MODE) {
      this.debugText = this.add.text(10, 50, '', { font: '16px Courier', fill: '#00ff00', backgroundColor: '#000000' }).setScrollFactor(0).setDepth(100);
    }
  }

  // --- UPDATE ---
  update(time, delta) {
    if (this.gameOver || this._paused) return;

    if (this.debugText) {
      const fps = Math.round(1000 / delta);
      const activeEnemies = this.enemies.getChildren().filter(e => e.alive).length;
      this.debugText.setText(
        `FPS: ${fps}\n` +
        `Player: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})\n` +
        `Boss: ${this.boss ? '(' + Math.round(this.boss.x) + ', ' + Math.round(this.boss.y) + ') HP:' + this.bossHP : 'N/A'}\n` +
        `Enemies: ${activeEnemies}\n`
      );
    }

    // Effet Parallax
    if (this.bgCiel) {
      const sx = this.cameras.main.scrollX;
      this.bgCiel.tilePositionX = sx * 0.05;
      this.bgMontagnes.tilePositionX = sx * 0.2;
      this.bgPlage.tilePositionX = sx * 0.5;
      this.bgFeuilles.tilePositionX = sx * 1.3; // Plus rapide que la caméra !
    }

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
      this.sound.play('sfx_jump');
    }

    // Tir
    const fire = Phaser.Input.Keyboard.JustDown(this.keyFire) || Phaser.Input.Keyboard.JustDown(this.keyCtrl) || window._gameControls.fire;
    if (fire) {
      if (this.fruits > 0) {
        this.fireBullet();
        window._gameControls.fire = false;
        this.sound.play('sfx_shoot');
      } else {
        // Feedback plus de munitions
        window._gameControls.fire = false;
        const msg = this.add.text(this.player.x, this.player.y - 40, 'Plus de fruits !\nSaute !', {
          fontSize: '12px', fontFamily: 'Arial Black', color: '#FF6B6B', align: 'center', stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5).setDepth(150);
        this.tweens.add({ targets: msg, y: msg.y - 30, alpha: 0, duration: 1000, onComplete: () => msg.destroy() });
      }
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

    // L'océan parallax gère déjà l'eau
    // Ancien code d'animation d'eau commenté

    // Visuel joueur
    this.updatePlayerVisual();

    // HUD
    this.updateHUD();
  }

  // --- Tir ---
  fireBullet() {
    this.fruits--;
    const dir = this.player.facingRight !== false ? 1 : -1;
    const bullet = this.bullets.create(this.player.x + dir * 20, this.player.y - 5, 'fruit_orange');
    bullet.setDisplaySize(20, 20); // Taille du projectile
    bullet.body.setAllowGravity(false);
    bullet.setVelocityX(GAME_CONFIG.physics.bulletSpeed * dir);
    bullet.setAngularVelocity(dir * 500); // Fait rouler le fruit dans les airs
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
    emitter.explode(10, fruit.x, fruit.y);
    this.time.delayedCall(1000, () => emitter.destroy());
    
    this.sound.play('sfx_collect_fruit');

    fruit.destroy();
    this.score += 10;
    this.fruits++;
    const txt = this.add.text(fruit.x, fruit.y - 10, '+10', {
      fontSize: '16px', fontFamily: 'Arial Black', color: '#FFD700',
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(50);
    this.tweens.add({ targets: txt, y: txt.y - 40, scale: 1.5, alpha: 0, duration: 600, ease: 'Cubic.easeOut', onComplete: () => txt.destroy() });
  }
  
  
  // --- Champignons Rebondissants ---
  bounceMushroom(player, mushroom) {
    if (player.body.velocity.y > 0 && player.body.bottom <= mushroom.body.bottom) {
      player.setVelocityY(-700);
      this.sound.play('sfx_jump', { rate: 0.7 });
      this.hasDoubleJumped = false;
      this.tweens.add({
        targets: mushroom,
        scaleY: 0.5,
        scaleX: 1.2,
        yoyo: true,
        duration: 100,
        onUpdate: () => { mushroom.body.updateFromGameObject(); }
      });
    }
  }

  // --- Collecter Spécial (Note ou Soleil) ---
  collectSpecial(player, item) {
    if (!item.active) return;
    item.destroy();
    this.sound.play(item.collectibleType === 'note' ? 'sfx_collect_note' : 'sfx_potion');
    
    let pts = item.collectibleType === 'note' ? 25 : 50;
    this.score += pts;
    
    // Particules
    const emitter = this.add.particles(item.x, item.y, 'particle_star', {
      speed: { min: 80, max: 200 },
      scale: { start: 1.5, end: 0 },
      alpha: { start: 1, end: 0 },
      tint: item.collectibleType === 'note' ? 0x9C27B0 : 0xFFD700,
      lifespan: 800,
      quantity: 12,
      gravityY: 300,
      emitting: false
    }).setDepth(60);
    emitter.explode(15, item.x, item.y);
    this.time.delayedCall(1000, () => emitter.destroy());

    const txt = this.add.text(item.x, item.y - 15, '+' + pts, {
      fontSize: '18px', fontFamily: 'Arial Black', color: item.collectibleType === 'note' ? '#9C27B0' : '#FFD700',
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(50);
    this.tweens.add({ targets: txt, y: txt.y - 40, scale: 1.5, alpha: 0, duration: 600, ease: 'Cubic.easeOut', onComplete: () => txt.destroy() });
  }

  // --- Collecter potion ---
  collectPotion(player, potion) {
    potion.destroy();
    this.sound.play('sfx_collect_note');
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
    if (!bullet.active) return;
    bullet.disableBody(true, true); // Désactive au lieu de détruire immédiatement pour éviter les crashs de physique
    this.time.delayedCall(50, () => { if (bullet) bullet.destroy(); });

    if (!enemy.active || !enemy.alive) return;
    this.defeatEnemy(enemy);
  }

  // --- Défaire ennemi ---
  defeatEnemy(enemy) {
    enemy.alive = false;
    this.score += enemy.scoreValue;
    
    // Désactiver le corps physique immédiatement pour éviter les crashs de collision
    if (enemy.body) enemy.body.enable = false;
    
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
    emitter.explode(15, enemy.x, enemy.y);
    this.time.delayedCall(1000, () => emitter.destroy());
    
    this.sound.play('sfx_hit_enemy');

    const txt = this.add.text(enemy.x, enemy.y - 15, '+' + enemy.scoreValue, {
      fontSize: '16px', fontFamily: 'Arial Black', color: '#2ECC71',
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(50);
    this.tweens.add({ targets: enemy, alpha: 0, scaleX: 0, scaleY: 0, duration: 200, ease: 'Back.easeIn', onComplete: () => { 
      if (enemy.active) enemy.destroy(); 
    } });
    this.tweens.add({ targets: txt, y: txt.y - 40, scale: 1.5, alpha: 0, duration: 600, ease: 'Cubic.easeOut', onComplete: () => txt.destroy() });
  }

  // --- Joueur touché ---
  playerHit() {
    this.lives--;
    this.invincibleUntil = this.time.now + GAME_CONFIG.player.invincibleTime;
    
    this.sound.play('sfx_hit_player');

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
    
    this.sound.play('sfx_hit_player');
    
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
    this.enemies.getChildren().forEach(enemy => {
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

    const bossCfg = GAME_CONFIG[this.levelKey].boss;
    const worldH = GAME_CONFIG.level1.worldHeight;
    const worldW = GAME_CONFIG.level1.worldWidth;
    
    // Verrouiller la caméra et le monde sur l'arène (les 800 derniers pixels)
    this.cameras.main.setBounds(worldW - 800, 0, 800, worldH);
    this.physics.world.setBounds(worldW - 800, 0, 800, worldH);

    this.boss = this.physics.add.sprite(bossCfg.x, bossCfg.y, bossCfg.spriteKey || 'boss_toucan');
    this.boss.setDisplaySize(130, 130);
    this.boss.setImmovable(true).setBounce(0).setCollideWorldBounds(true);
    this.boss.body.allowGravity = false;
    
    // Hitbox ajustée pour que les pieds (y=224) touchent le sol sans s'enfoncer
    this.boss.body.setSize(150, 174).setOffset(50, 50);
    
    const bossAnimKey = 'boss_anim_' + (bossCfg.spriteKey || 'boss_toucan');
    if (!this.anims.exists(bossAnimKey)) {
      this.anims.create({
        key: bossAnimKey,
        frames: this.anims.generateFrameNumbers(bossCfg.spriteKey || 'boss_toucan', { start: 0, end: 3 }),
        frameRate: 8,
        repeat: -1
      });
    }
    this.boss.play(bossAnimKey);
    this.boss.facingRight = false;
    this.physics.add.collider(this.boss, this.platforms);
    this.physics.add.overlap(this.player, this.boss, this.hitBoss, null, this);
    this.physics.add.overlap(this.bullets, this.boss, this.bulletHitBoss, null, this);

    this.hudBossContainer.setVisible(true);

    this.lastBossShot = 0;
    this.bossAITimer = this.time.addEvent({ delay: 200, callback: () => this.updateBoss(), loop: true });

    const msg = this.add.text(this.cameras.main.midX, 100, '⚠️ ' + bossCfg.name + ' !', {
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

    if (now - this.lastBossShot > GAME_CONFIG[this.levelKey].boss.shootInterval) {
      this.lastBossShot = now;
      this.sound.play('sfx_boss_drum');
      const proj = this.bossProjectiles.create(this.boss.x, this.boss.y + 20, 'seed');
      proj.body.setAllowGravity(false);
      proj.setVelocityX(250 * dir);
      this.time.delayedCall(2000, () => { if (proj.active) proj.destroy(); });
    }
  }

  // --- Joueur vs boss ---
  hitBoss(player, boss) {
    const now = this.time.now;
    const bossCfg = GAME_CONFIG[this.levelKey].boss;

    if (player.body.velocity.y > 0 && player.y < boss.y - 15) {
      if (this.bossStunUntil < now) {
        this.bossHP--;
        this.bossStunUntil = now + bossCfg.stunDuration;
        player.setVelocityY(-300);
        this.bossSpeed += 20;
        
        this.sound.play('sfx_hit_boss');

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
    if (!bullet.active) return;
    bullet.disableBody(true, true);
    this.time.delayedCall(50, () => { if (bullet) bullet.destroy(); });
    
    // Le boss prend des dégâts aussi par les balles maintenant !
    if (this.bossStunUntil < this.time.now) {
       this.bossHP--;
       this.bossSpeed += 10;
       this.sound.play('sfx_hit_boss');
       
       const txt = this.add.text(boss.x, boss.y - 30, '💥', { fontSize: '28px' }).setOrigin(0.5).setDepth(50);
       this.tweens.add({ targets: txt, y: txt.y - 50, scale: 1.5, alpha: 0, duration: 600, onComplete: () => txt.destroy() });

       if (this.bossHP <= 0) {
         this.defeatBoss();
         return;
       }
    }
    
    this.bossStunUntil = this.time.now + GAME_CONFIG[this.levelKey].boss.stunDuration;
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
      tint: 0xFFD700,
      lifespan: 1000,
      gravityY: 400,
      frequency: 50,
      blendMode: 'ADD'
    }).setDepth(60);
    emitter.startFollow(this.boss);

    this.tweens.add({ 
      targets: this.boss, y: this.boss.y - 150, alpha: 0, scale: 1.5, angle: 360, duration: 1500, ease: 'Cubic.easeIn',
      onComplete: () => {
        emitter.stopFollow();
        emitter.stop();
        if (this.boss.active) this.boss.destroy();
        this.showPerch();
      }
    });

    const bossName = GAME_CONFIG[this.levelKey].boss.name;
    const msg = this.add.text(this.cameras.main.midX, 120, "🐦 " + bossName + " est vaincu !", {
      fontSize: '18px', fontFamily: 'Arial Black', color: '#FFD700',
      stroke: '#1A1A2E', strokeThickness: 3,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
    this.tweens.add({ targets: msg, alpha: 0, delay: 2500, duration: 800, onComplete: () => msg.destroy() });
  }

  // --- Perchoir ---
  showPerch() {
    const pc = GAME_CONFIG[this.levelKey].perch;
    this.perch = this.physics.add.staticImage(pc.x, pc.y, 'perch');
    this.physics.add.overlap(this.player, this.perch, this.reachPerch, null, this);
  }

  reachPerch(player, perch) {
    perch.destroy();
    this.saveProgress();
    this.scene.start('Victory', { score: this.score, fruitsCollected: this.fruits, lives: this.lives, level: this.levelKey });
  }

  // --- Visuel invincibilité ---
  updatePlayerVisual() {
    // Retirer l'ancien mécanisme de changement de texture pour 'real_parrot'
    // car on utilise maintenant une animation spritesheet.
    
    // Gérer juste le clignotement d'invincibilité
    if (this.invincibleUntil > this.time.now) {
      this.player.setAlpha(Math.sin(this.time.now / 50) > 0 ? 0.5 : 1);
    } else {
      this.player.setAlpha(1);
    }
    
    if (this.potionActiveUntil > this.time.now) {
      const remaining = Math.ceil((this.potionActiveUntil - this.time.now) / 1000);
      this.hudPotionIndicator.setText('✨ ' + remaining + 's');
      this.hudPotionIndicator.setVisible(true);
    } else {
      this.hudPotionIndicator.setVisible(false);
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

// ============================================================
// LEVEL 1 SCENE
// ============================================================
class Level1Scene extends BaseLevelScene {
  constructor() { super('Level1'); }
  init() { this.levelKey = 'level1'; }
}

// ============================================================
// LEVEL 2 SCENE : Le Temple du Soleil Chantant
// ============================================================
class Level2Scene extends BaseLevelScene {
  constructor() { super('Level2'); }
  init() { this.levelKey = 'level2'; }
  create() {
    super.create();
    // Utiliser les visuels du Niveau 2
    if (this.bgCiel) { this.bgCiel.clearTint(); this.bgCiel.setTexture('lvl2_ciel'); }
    if (this.bgMontagnes) { this.bgMontagnes.clearTint(); this.bgMontagnes.setTexture('lvl2_montagnes'); }
    if (this.bgPlage) { this.bgPlage.clearTint(); this.bgPlage.setTexture('lvl2_plage'); }
    if (this.bgFeuilles) { this.bgFeuilles.clearTint(); this.bgFeuilles.setTexture('lvl2_feuilles'); }
  }
}

class GameOverScene extends Phaser.Scene {
  constructor() { super({ key: 'GameOver' }); }

  create(data) {
    this.sound.stopAll(); // Arrêter la BGM
    
    saveGameScore(this, false, data);
    this.scene.pause();
    window.showCoffreTropical(data.score || 0, false);
  }
}

// ============================================================
// VICTORY SCENE
// ============================================================
class VictoryScene extends Phaser.Scene {
  constructor() { super({ key: 'Victory' }); }

  create(data) {
    this.sound.stopAll();
    this.sound.play('sfx_victory');
    
    saveGameScore(this, true, data);

    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    const cx = w / 2;
    const cy = h / 2;

    // Fond personnalisé
    const bg = this.add.image(cx, cy, 'victory_bg');
    bg.setDisplaySize(w, h);

    // Voile sombre léger pour la lisibilité
    this.add.rectangle(0, 0, w, h, 0x000000, 0.4).setOrigin(0, 0);

    // Confettis
    const emitter = this.add.particles(0, -50, 'particle_star', {
      x: { min: 0, max: w },
      y: -50,
      lifespan: 4000,
      speedY: { min: 100, max: 300 },
      speedX: { min: -50, max: 50 },
      scale: { start: 1, end: 0.5 },
      quantity: 2, // Limite pour mobile
      tint: [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF],
      gravityY: 100
    });

    // Perroquet animé
    const parrot = this.add.sprite(cx, cy - 110, 'real_parrot').setScale(0.8);
    if (!this.anims.exists('parrot_fly')) {
      this.anims.create({
        key: 'parrot_fly',
        frames: this.anims.generateFrameNumbers('real_parrot', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
      });
    }
    parrot.play('parrot_fly');

    // Sauvegarde Best Score
    const keys = GAME_CONFIG.storageKeys;
    let bestScore = parseInt(localStorage.getItem(keys.bestScore) || '0', 10);
    const finalScore = data.score || 0;
    let isNewRecord = false;
    
    if (finalScore > bestScore) {
      bestScore = finalScore;
      localStorage.setItem(keys.bestScore, bestScore.toString());
      isNewRecord = true;
    }

    // Textes
    if (data.level === 'level2') {
      this.add.text(cx, 40, 'Temple Conquis ! ☀️', { fontSize: '32px', fontFamily: 'Arial Black', color: '#FFD700', stroke: '#000', strokeThickness: 5 }).setOrigin(0.5);
      this.add.text(cx, 80, 'Le Temple chante encore plus fort... Suite bientôt disponible !', { fontSize: '16px', fontFamily: 'Arial', color: '#FFF' }).setOrigin(0.5);
    } else {
      this.add.text(cx, 40, 'Victoire Tropicale ! ☀️', { fontSize: '32px', fontFamily: 'Arial Black', color: '#FFD700', stroke: '#000', strokeThickness: 5 }).setOrigin(0.5);
    this.add.text(cx, 80, 'Tu as fait chanter le soleil avec le perroquet d’El Ramon Music.', { fontSize: '16px', fontFamily: 'Arial', color: '#FFF' }).setOrigin(0.5);
    }

    // Le badge réel est généré par le serveur (Supabase) pour éviter la triche.
    // On affiche un texte d'attente qui se mettra à jour dès que le serveur répond.
    const blockY = cy + 10;
    this.add.text(cx, blockY - 20, `Score final : ${finalScore}`, { fontSize: '24px', fontFamily: 'Arial Black', color: '#2ECC71', stroke: '#000', strokeThickness: 3 }).setOrigin(0.5);
    this.add.text(cx, blockY + 10, `Meilleur score : ${bestScore}`, { fontSize: '18px', fontFamily: 'Arial', color: '#FFF' }).setOrigin(0.5);
    
    const badgeText = this.add.text(cx, blockY + 40, `Analyse du score... ⏳`, { fontSize: '20px', fontFamily: 'Arial Black', color: '#FF9800', stroke: '#000', strokeThickness: 2 }).setOrigin(0.5);

    // Écoute de l'événement émis par saveGameScore
    this.events.once('score_saved', (serverBadge) => {
      badgeText.setText(`Badge obtenu : ${serverBadge}`);
    });

    // Messages Spéciaux
    let msgY = blockY + 80;
    if (isNewRecord) {
      this.add.text(cx, msgY, 'Nouveau record tropical ! 🏆☀️', { fontSize: '16px', fontFamily: 'Arial Black', color: '#FFD700' }).setOrigin(0.5);
      msgY += 25;
    }
    this.add.text(cx, msgY, data.level === 'level2' ? 'La magie du temple est restaurée ✨' : 'Le Toucan Tambour est calmé 🥁☀️', { fontSize: '16px', fontFamily: 'Arial Black', color: '#00BCD4' }).setOrigin(0.5);

    // --- Boutons interactifs ---
    const createBtn = (x, y, wBtn, text, color, onClick) => {
      const bg = this.add.rectangle(x, y, wBtn, 40, color, 1).setInteractive({ useHandCursor: true }).setStrokeStyle(2, 0xFFFFFF);
      const txt = this.add.text(x, y, text, { fontSize: '16px', fontFamily: 'Arial Black', color: '#FFF' }).setOrigin(0.5);
      
      bg.on('pointerover', () => { bg.setFillStyle(0xFFFFFF); txt.setColor('#000'); });
      bg.on('pointerout', () => { bg.setFillStyle(color); txt.setColor('#FFF'); });
      bg.on('pointerdown', () => {
        this.tweens.add({ targets: [bg, txt], scale: 0.9, duration: 50, yoyo: true, onComplete: onClick });
      });
    };

    // Ligne 1 : Rejouer / Niveau Suivant | Partager
    if (data.level === 'level1') {
      createBtn(cx - 130, h - 70, 240, '➡️ Niveau Suivant', 0x2ECC71, () => {
        this.scene.start('Level2', { score: finalScore, lives: data.lives, fruits: data.fruits });
      });
    } else {
      createBtn(cx - 130, h - 70, 240, '🔄 Rejouer le Niveau 2', 0x2ECC71, () => {
        this.scene.start('Level2');
      });
    }

    createBtn(cx + 130, h - 70, 240, '📤 Partager mon score', 0x3498DB, () => {
      const shareText = `J’ai fait chanter le soleil avec le perroquet d’El Ramon Music 🦜☀️ Mon score : ${finalScore} pts. Viens battre mon score ! ${window.location.origin}`;
      if (navigator.share) {
        navigator.share({ title: 'Le Perroquet Tropical', text: shareText }).catch(console.error);
      } else {
        navigator.clipboard.writeText(shareText).then(() => {
          const toast = this.add.text(cx + 130, h - 30, 'Score copié !', { fontSize: '14px', color: '#FFD700' }).setOrigin(0.5);
          this.time.delayedCall(2000, () => toast.destroy());
        });
      }
    });

    // Ligne 2 : Coffre | Retour
    createBtn(cx - 130, h - 20, 240, '🎁 Ouvrir mon Coffre Tropical', 0x9B59B6, () => {
      // Ouvre le overlay HTML existant
      window.showCoffreTropical(finalScore, true);
    });

    createBtn(cx + 130, h - 20, 240, '🏠 Retour au Club', 0xE67E22, () => {
      window.location.href = './espace-membre.html';
    });

    // Bouton Mute
    const muteText = this.sound.mute ? '🔇' : '🔊';
    const muteBtn = this.add.text(w - 30, 20, muteText, { fontSize: '24px' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    muteBtn.on('pointerdown', () => {
      this.sound.mute = !this.sound.mute;
      muteBtn.setText(this.sound.mute ? '🔇' : '🔊');
    });
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
    level: scene.levelKey || 'Level1',
    fruits_collected: data.fruitsCollected || 0,
    boss_defeated: bossDefeated,
    lives_remaining: data.lives || 0,
    time_seconds: 0
  };

  try {
    const res = await fetch('/game-score', {
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
      debug: typeof DEBUG_MODE !== 'undefined' ? DEBUG_MODE : false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [PreloadScene, BootScene, StartScene, Level1Scene, Level2Scene, GameOverScene, VictoryScene],
  pixelArt: false,
  roundPixels: true,
};

const game = new Phaser.Game(gameConfig);

window.showCoffreTropical = function(score, isVictory) {
  const overlay = document.getElementById('coffre-overlay');
  if (!overlay) return;

  const title = document.getElementById('coffre-title');
  const scoreEl = document.getElementById('coffre-score');
  const rankEl = document.getElementById('coffre-rank');
  const bestEl = document.getElementById('coffre-best');
  const buttonsEl = document.getElementById('coffre-buttons');

  // Afficher l'overlay
  overlay.style.display = 'flex';

  // Calcul du rang
  let currentRank = GAME_CONFIG.ranks[0].name;
  for (let r of GAME_CONFIG.ranks) {
    if (score >= r.min) currentRank = r.name;
  }

  // Meilleur score
  const keys = GAME_CONFIG.storageKeys;
  const bestScore = parseInt(localStorage.getItem(keys.bestScore) || '0');

  // Textes
  title.innerText = isVictory ? "Ton Coffre Tropical est débloqué 🦜☀️" : "Plus de plumes ! 🦜💥";
  title.style.color = isVictory ? '#FFD700' : '#E53935';
  scoreEl.innerText = `Score: ${score}`;
  rankEl.innerText = `Rang: ${currentRank}`;
  bestEl.innerText = `Meilleur: ${Math.max(score, bestScore)}`;

  // Boutons dynamiques
  buttonsEl.innerHTML = '';

  const createBtn = (text, bgColor, textColor, onClick) => {
    const a = document.createElement('a');
    a.href = '#';
    a.style.background = bgColor;
    a.style.color = textColor;
    a.style.textDecoration = 'none';
    a.style.padding = '12px 24px';
    a.style.borderRadius = '50px';
    a.style.fontWeight = 'bold';
    a.style.fontFamily = "'Outfit', sans-serif";
    a.style.display = 'block';
    a.innerText = text;
    a.onclick = (e) => { e.preventDefault(); onClick(); };
    buttonsEl.appendChild(a);
  };

  if (isVictory) {
    const bonuses = [
      { text: '🎁 Bonus surprise (Suno)', link: GAME_CONFIG.bonusLinks.suno },
      { text: '🎁 Bonus surprise (Kling)', link: GAME_CONFIG.bonusLinks.kling },
      { text: '🎁 Bonus surprise (Flow)', link: GAME_CONFIG.bonusLinks.flow }
    ];
    bonuses.forEach(b => {
      createBtn(b.text, '#2ECC71', '#FFF', () => window.open(b.link, '_blank'));
    });
    
    // Bouton pour fermer le coffre et revenir à l'écran de victoire Phaser
    createBtn('❌ Fermer le Coffre', 'rgba(255,255,255,0.1)', '#FFF', () => {
      overlay.style.display = 'none';
    });
  } else {
    createBtn('🔄 Rejouer', '#FF8C00', '#FFF', () => {
      overlay.style.display = 'none';
      game.scene.getScenes(true).forEach(s => s.scene.stop());
      game.scene.start('Level1');
    });
  }

  // Share API
  if (navigator.share) {
    createBtn('📲 Partager mon score', '#00BCD4', '#FFF', async () => {
      try {
        await navigator.share({
          title: 'El Ramon Music Club',
          text: `J'ai atteint le rang "${currentRank}" avec ${score} points au mini-jeu Tropical ! Rejoins-nous ! 🦜☀️`,
          url: window.location.origin
        });
      } catch(e) {}
    });
  } else {
    createBtn('📋 Copier mon score', '#00BCD4', '#FFF', () => {
      navigator.clipboard.writeText(`J'ai atteint le rang "${currentRank}" avec ${score} points au mini-jeu Tropical ! Rejoins-nous ! 🦜☀️ ${window.location.origin}`);
      alert('Score copié dans le presse-papiers !');
    });
  }

  createBtn('🏠 Retour Dashboard', 'rgba(255,255,255,0.1)', '#FFF', () => {
    window.location.href = './espace-membre.html';
  });
};
