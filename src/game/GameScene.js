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

    // Create parallax background (4 layers) - using single sprite per layer
    this.bgLayers = [];
    this.createParallaxLayer('bg_sky', 0, 1, false);           // Sky fills screen, no scroll
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
    this.player.setScale(0.65);  // Bigger player for better visibility
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
    this.smokeEmitter.startFollow(this.player, -120, 10);
    this.smokeEmitter.setDepth(this.player.depth - 1);  // Smoke strictly behind player

    // Groups
    this.stars = this.physics.add.group();
    this.enemies = this.physics.add.group();

    // Score display (top left with star icon) - smaller and better positioned
    const starIcon = this.add.image(30, 30, 'pickup_star');
    starIcon.setScale(0.15);  // Even smaller UI icon
    starIcon.setScrollFactor(0);
    starIcon.setDepth(1000);

    this.scoreText = this.add.text(65, 15, 'Poäng: 0000', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '32px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
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
    const tex = this.textures.get(key);
    const texHeight = tex.getSourceImage().height;
    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;

    // Calculate the physical height this layer should occupy
    const targetHeight = texHeight * scale;

    // Create a tileSprite that fills the FULL width, but has the scaled-down height
    const sprite = this.add.tileSprite(gameWidth / 2, 0, gameWidth, targetHeight, key);

    if (anchorBottom) {
      sprite.setOrigin(0.5, 1); // Anchor bottom-center
      sprite.setPosition(gameWidth / 2, gameHeight); // Stick to bottom
    } else {
      sprite.setOrigin(0.5, 0); // Anchor top-center (for sky)
      sprite.setPosition(gameWidth / 2, 0);
      // For sky, we might want full height if it cuts off
      sprite.height = gameHeight;
    }

    sprite.setScrollFactor(0); // Fix to camera

    // CRITICAL FIX: Scale the texture pattern, NOT the sprite object
    sprite.setTileScale(scale, scale);

    sprite.setDepth(this.bgLayers.length);

    // Store for update loop
    this.bgLayers.push({ sprite, scrollFactor });
  }

  update(time, delta) {
    if (this.isGameOver) return;

    // Player movement
    const moveSpeed = 300;
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

    // Update parallax background - scroll texture instead of moving sprites
    const scrollSpeed = this.baseScrollSpeed * this.speedMultiplier;
    this.bgLayers.forEach(layer => {
      layer.sprite.tilePositionX += scrollSpeed * layer.scrollFactor;
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

    // Move and clean up enemies
    this.enemies.children.entries.forEach(enemy => {
      enemy.x -= scrollSpeed * 1.5;
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
    star.setScale(0.22);  // Bigger to match larger player (was 0.15)
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
    const safeZoneHeight = 220;  // Increased from 180 for bigger gaps
    const lanes = Math.floor(skyHeight / safeZoneHeight);
    const occupiedLanes = [];

    for (let i = 0; i < numEnemies && occupiedLanes.length < lanes - 1; i++) {
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
    enemy.setScale(0.22);  // Bigger to match larger player (was 0.18)
    enemy.setDepth(100);   // In front of background
    enemy.setBodySize(120, 80);  // Set hitbox to match visual size
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
    explosion.setScale(1.5);

    player.setVisible(false);

    // Wait a moment then trigger game over
    this.time.delayedCall(1000, () => {
      if (this.onGameOverCallback) {
        this.onGameOverCallback(this.score);
      }
    });
  }

  updateScoreDisplay() {
    const scoreStr = this.score.toString().padStart(4, '0');
    this.scoreText.setText('Poäng: ' + scoreStr);
  }
}
