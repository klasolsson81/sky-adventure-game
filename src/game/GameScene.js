import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    this.selectedShip = data.selectedShip;
    this.onGameOverCallback = data.onGameOver;
  }

  preload() {
    // Background layers
    this.load.image('bg_sky', '/images/bg_sky.png');
    this.load.image('bg_mountains', '/images/bg_mountains.png');
    this.load.image('bg_hills', '/images/bg_hills.png');
    this.load.image('bg_ground', '/images/bg_ground.png');

    // Player ships
    this.load.image('ship_red', '/images/ship_red.png');
    this.load.image('ship_blue', '/images/ship_blue.png');
    this.load.image('ship_purple', '/images/ship_purple.png');

    // Enemies and pickups
    this.load.image('enemy_cloud', '/images/enemy_cloud.png');
    this.load.image('enemy_robot', '/images/enemy_robot.png');
    this.load.image('pickup_star', '/images/pickup_star.png');

    // Effects
    this.load.image('explosion', '/images/explosion.png');
    this.load.image('particle_smoke', '/images/particle_smoke.png');

    // Audio
    this.load.audio('music_bg', '/audio/music_bg.mp3');
    this.load.audio('engine_loop', '/audio/engine_loop.mp3');
    this.load.audio('sfx_star', '/audio/sfx_star.mp3');
    this.load.audio('sfx_explosion', '/audio/sfx_explosion.mp3');
  }

  create() {
    // Game dimensions
    const width = this.scale.width;
    const height = this.scale.height;

    // Game state
    this.isGameOver = false;
    this.score = 0;
    this.speedMultiplier = 1;
    this.baseScrollSpeed = 2;

    // Dynamic scale ratio based on screen height (baseline: 1080px)
    this.scaleRatio = height / 1080;

    // Create sky background FIRST - as stretched image (no tiling)
    const sky = this.add.image(width / 2, height / 2, 'bg_sky');
    sky.setDisplaySize(width, height);  // Stretch to fill entire screen
    sky.setScrollFactor(0);  // Lock in place
    sky.setDepth(0);  // Behind everything

    // Create parallax background (3 layers) - using single sprite per layer
    this.bgLayers = [];
    this.createParallaxLayer('bg_mountains', 0.2, 0.6, true);  // Mountains bigger - peek above hills
    this.createParallaxLayer('bg_hills', 0.5, 0.4, true);      // Hills medium scroll
    this.createParallaxLayer('bg_ground', 1.0, 0.25, true);    // Ground fast scroll, thin strip

    // Determine ship image
    const shipImages = {
      'alexander': 'ship_red',
      'klas': 'ship_blue',
      'bhing': 'ship_purple'
    };
    const shipKey = shipImages[this.selectedShip] || 'ship_red';

    // Create player (positioned in sky area)
    this.player = this.physics.add.sprite(250, height * 0.4, shipKey);
    this.player.setScale(0.7 * this.scaleRatio);  // Responsive scaling
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(100);  // Player in front of background

    // Create smoke particle emitter
    this.smokeEmitter = this.add.particles(0, 0, 'particle_smoke', {
      speed: { min: -60, max: -30 },
      angle: { min: 170, max: 190 },
      scale: { start: 0.1, end: 0 },  // Start small, fade to nothing
      alpha: { start: 0.4, end: 0 },
      lifespan: 400,
      blendMode: 'NORMAL',
      frequency: 60,
      quantity: 1  // Emit fewer particles for cleaner look
    });

    // Attach emitter to player's tail - larger offset for proper tail placement
    this.smokeEmitter.startFollow(this.player, -120 * this.scaleRatio, 10 * this.scaleRatio);
    this.smokeEmitter.setDepth(this.player.depth - 1);  // Smoke strictly behind player

    // Groups
    this.stars = this.physics.add.group();
    this.enemies = this.physics.add.group();

    // Score display (top left with star icon) - responsive scaling
    const starIcon = this.add.image(30 * this.scaleRatio, 30 * this.scaleRatio, 'pickup_star');
    starIcon.setScale(0.15 * this.scaleRatio);  // Responsive scaling
    starIcon.setScrollFactor(0);
    starIcon.setDepth(1000);

    // Dynamic font size based on scaleRatio
    const fontSize = Math.floor(40 * this.scaleRatio);
    this.scoreText = this.add.text(65 * this.scaleRatio, 15 * this.scaleRatio, 'Poäng: 0', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: `${fontSize}px`,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: Math.max(2, Math.floor(4 * this.scaleRatio))
    });
    this.scoreText.setScrollFactor(0);
    this.scoreText.setDepth(1000);

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();

    // Collision detection
    this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

    // Audio
    this.musicBg = this.sound.add('music_bg', { loop: true, volume: 0.5 });
    this.engineSound = this.sound.add('engine_loop', { loop: true, volume: 0.3 });

    this.musicBg.play();
    this.engineSound.play();

    // Spawn timers
    this.starSpawnTimer = 0;
    this.enemySpawnTimer = 0;
    this.difficultyTimer = 0;

    // Base spawn intervals (will decrease with speedMultiplier)
    this.baseStarSpawnInterval = 3500;
    this.baseEnemySpawnInterval = 3000;
  }

  createParallaxLayer(key, scrollFactor, scale, anchorBottom = true) {
    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;

    // Use tileSprite for seamless scrolling backgrounds
    const tex = this.textures.get(key);
    const texHeight = tex.getSourceImage().height;

    // Apply responsive scaling
    const responsiveScale = scale * this.scaleRatio;

    // Calculate the physical height this layer should occupy
    const targetHeight = texHeight * responsiveScale;

    // Create a tileSprite that fills the FULL width, but has the scaled-down height
    const sprite = this.add.tileSprite(gameWidth / 2, 0, gameWidth, targetHeight, key);

    if (anchorBottom) {
      sprite.setOrigin(0.5, 1); // Anchor bottom-center
      sprite.setPosition(gameWidth / 2, gameHeight); // Stick to bottom
    } else {
      sprite.setOrigin(0.5, 0); // Anchor top-center
      sprite.setPosition(gameWidth / 2, 0);
      sprite.height = gameHeight;
    }

    sprite.setScrollFactor(0); // Fix to camera

    // Scale the texture pattern, NOT the sprite object
    sprite.setTileScale(responsiveScale, responsiveScale);

    sprite.setDepth(this.bgLayers.length + 1);  // Start at depth 1 (sky is at 0)

    // Store for update loop
    this.bgLayers.push({ sprite, scrollFactor });
  }

  update(time, delta) {
    if (this.isGameOver) return;

    const width = this.scale.width;
    const height = this.scale.height;
    const moveSpeed = 300;

    // Touch controls for mobile - move towards finger position
    const pointer = this.input.activePointer;
    if (pointer.isDown) {
      // Calculate distance to touch point
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        pointer.x,
        pointer.y
      );

      // Deadzone: if close enough to finger, stop moving to prevent shaking
      if (distance < 10) {
        this.player.setVelocity(0, 0);
      } else {
        // Move player towards the touch position
        this.physics.moveTo(this.player, pointer.x, pointer.y, moveSpeed);
      }
    } else {
      // Keyboard controls (fallback for desktop)
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-moveSpeed);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(moveSpeed);
      } else {
        this.player.setVelocityX(0);
      }

      if (this.cursors.up.isDown) {
        this.player.setVelocityY(-moveSpeed);
      } else if (this.cursors.down.isDown) {
        this.player.setVelocityY(moveSpeed);
      } else {
        this.player.setVelocityY(0);
      }
    }

    // Update parallax background - scroll texture instead of moving sprites
    const scrollSpeed = this.baseScrollSpeed * this.speedMultiplier;
    this.bgLayers.forEach(layer => {
      // Only update tilePosition for tileSprites (not regular images like bg_sky)
      if (layer.sprite.tilePositionX !== undefined && layer.scrollFactor > 0) {
        layer.sprite.tilePositionX += scrollSpeed * layer.scrollFactor;
      }
    });

    // Aggressive difficulty progression - faster and more frequent
    this.difficultyTimer += delta;
    if (this.difficultyTimer > 3000) {  // Every 3 seconds (was 5000)
      this.speedMultiplier += 0.1;       // Bigger jumps (was 0.05)
      this.difficultyTimer = 0;
    }

    // Dynamic spawn intervals based on speedMultiplier
    // As speed increases, spawns happen more frequently!
    const currentStarInterval = this.baseStarSpawnInterval / this.speedMultiplier;
    const currentEnemyInterval = this.baseEnemySpawnInterval / this.speedMultiplier;

    // Spawn stars
    this.starSpawnTimer += delta;
    if (this.starSpawnTimer > currentStarInterval) {
      this.spawnStarWave();
      this.starSpawnTimer = 0;
    }

    // Spawn enemies
    this.enemySpawnTimer += delta;
    if (this.enemySpawnTimer > currentEnemyInterval) {
      this.spawnEnemies();
      this.enemySpawnTimer = 0;
    }

    // Move and clean up stars
    this.stars.children.entries.forEach(star => {
      star.x -= scrollSpeed * 2;
      if (star.x < -50) {
        star.destroy();
      }
    });

    // Move and clean up enemies - use speedFactor for variable speeds
    this.enemies.children.entries.forEach(enemy => {
      enemy.x -= scrollSpeed * 1.5 * enemy.speedFactor;  // Clouds move faster!
      if (enemy.x < -100) {
        enemy.destroy();
      }
    });
  }

  spawnStarWave() {
    const height = this.scale.height;
    const width = this.scale.width;
    const numStars = Phaser.Math.Between(3, 5);  // Reduced from 4-7 to 3-5

    // Stars spawn in the sky area (top 70% of screen)
    const skyHeight = height * 0.7;

    // Choose spawn pattern
    const pattern = Phaser.Math.Between(0, 2);

    if (pattern === 0) {
      // Arc/wave pattern (like concept art)
      const centerY = skyHeight / 2 + 50;
      const arcRadius = 150;  // Increased for wider spread
      for (let i = 0; i < numStars; i++) {
        const angle = (Math.PI / (numStars - 1)) * i - Math.PI / 2;
        const x = width + i * 100;  // Increased spacing from 60 to 100
        const y = centerY + Math.sin(angle) * arcRadius;
        this.createStar(x, y);
      }
    } else if (pattern === 1) {
      // Horizontal line with more spacing
      const y = Phaser.Math.Between(100, skyHeight - 50);
      for (let i = 0; i < numStars; i++) {
        this.createStar(width + i * 120, y);  // Increased spacing from 70 to 120
      }
    } else {
      // Vertical wave with more spacing
      const startY = Phaser.Math.Between(100, 250);
      for (let i = 0; i < numStars; i++) {
        this.createStar(width + i * 100, startY + Math.sin(i * 0.5) * 120);  // Increased spacing
      }
    }
  }

  createStar(x, y) {
    const star = this.stars.create(x, y, 'pickup_star');

    // Responsive sizing: larger on PC, smaller on mobile
    const maxScale = this.scale.width > 768 ? 0.18 : 0.08;  // PC vs Mobile
    const starScale = Math.min(0.25 * this.scaleRatio, maxScale);
    star.setScale(starScale);
    star.setDepth(100);   // In front of background

    // Use circular hitbox for forgiving collection
    // Slightly smaller radius than full image for better gameplay feel
    const radius = star.width * 0.08;
    star.body.setCircle(radius);
    star.body.setOffset(star.width / 2 - radius, star.height / 2 - radius);

    star.setVelocity(0, 0);
  }

  spawnEnemies() {
    const height = this.scale.height;
    const width = this.scale.width;

    // Smart spawning in the sky area (top 60% of screen)
    const numEnemies = Phaser.Math.Between(1, 2);  // Reduced from 1-3 to 1-2
    const skyHeight = height * 0.6; // Top 60% is sky

    // Dynamic safeZoneHeight based on screen size (responsive for mobile)
    const safeZoneHeight = Math.max(120, 150 * this.scaleRatio);
    const lanes = Math.floor(skyHeight / safeZoneHeight);
    const occupiedLanes = [];

    // Fixed loop condition: removed "- 1" to work with small lane counts
    for (let i = 0; i < numEnemies && occupiedLanes.length < lanes; i++) {
      let lane;
      let attempts = 0;

      // Find an unoccupied lane
      do {
        lane = Phaser.Math.Between(0, lanes - 1);
        attempts++;
      } while (occupiedLanes.includes(lane) && attempts < 10);

      if (attempts < 10) {
        occupiedLanes.push(lane);
        const y = 100 + lane * safeZoneHeight + safeZoneHeight / 2;
        const enemyType = Phaser.Math.Between(0, 1) === 0 ? 'enemy_cloud' : 'enemy_robot';
        this.createEnemy(width + 50, y, enemyType);
      }
    }
  }

  createEnemy(x, y, type) {
    const enemy = this.enemies.create(x, y, type);

    // Responsive sizing: larger on PC, smaller on mobile
    const maxScale = this.scale.width > 768 ? 0.18 : 0.08;  // PC vs Mobile
    const enemyScale = Math.min(0.25 * this.scaleRatio, maxScale);
    enemy.setScale(enemyScale);
    enemy.setDepth(100);   // In front of background

    // Hitbox size should also be responsive
    const maxHitboxScale = this.scale.width > 768 ? 1.2 : 0.8;
    const hitboxScale = Math.min(this.scaleRatio, maxHitboxScale);
    enemy.setBodySize(120 * hitboxScale, 80 * hitboxScale);

    // Variable speed based on enemy type - creates dynamic difficulty
    if (type === 'enemy_cloud') {
      enemy.speedFactor = 1.5;  // Clouds move 50% faster!
    } else {
      enemy.speedFactor = 1.0;  // Robots/barrels move with background
    }

    enemy.setVelocity(0, 0);
  }

  collectStar(player, star) {
    star.destroy();
    this.score += 10;
    this.updateScoreDisplay();
    this.sound.play('sfx_star', { volume: 0.4 });
  }

  hitEnemy(player, enemy) {
    if (this.isGameOver) return;

    this.isGameOver = true;

    // Stop all audio and effects
    this.musicBg.stop();
    this.engineSound.stop();
    this.smokeEmitter.stop();

    // Play explosion effect
    this.sound.play('sfx_explosion', { volume: 0.6 });

    const explosion = this.add.sprite(player.x, player.y, 'explosion');
    explosion.setScale(1.5 * this.scaleRatio);

    player.setVisible(false);

    // Wait a moment then trigger game over
    this.time.delayedCall(1000, () => {
      if (this.onGameOverCallback) {
        this.onGameOverCallback(this.score);
      }
    });
  }

  updateScoreDisplay() {
    this.scoreText.setText('Poäng: ' + this.score);
  }
}
