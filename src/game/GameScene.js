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

    // Create parallax background (4 layers)
    this.bgLayers = [];
    this.createParallaxLayer('bg_sky', 0.2);
    this.createParallaxLayer('bg_mountains', 0.4);
    this.createParallaxLayer('bg_hills', 0.6);
    this.createParallaxLayer('bg_ground', 1);

    // Determine ship image
    const shipImages = {
      'alexander': 'ship_red',
      'klas': 'ship_blue',
      'bhing': 'ship_purple'
    };
    const shipKey = shipImages[this.selectedShip] || 'ship_red';

    // Create player
    this.player = this.physics.add.sprite(200, height / 2, shipKey);
    this.player.setScale(0.5);
    this.player.setCollideWorldBounds(true);

    // Create smoke particle emitter
    this.smokeEmitter = this.add.particles(0, 0, 'particle_smoke', {
      speed: { min: -100, max: -50 },
      angle: { min: 170, max: 190 },
      scale: { start: 0.3, end: 0.6 },
      alpha: { start: 0.7, end: 0 },
      lifespan: 800,
      blendMode: 'NORMAL',
      frequency: 30
    });

    // Attach emitter to player
    this.smokeEmitter.startFollow(this.player, -30, 0);

    // Groups
    this.stars = this.physics.add.group();
    this.enemies = this.physics.add.group();

    // Score display (top left with star icon)
    const starIcon = this.add.image(50, 50, 'pickup_star');
    starIcon.setScale(0.5);
    starIcon.setScrollFactor(0);
    starIcon.setDepth(1000);

    this.scoreText = this.add.text(90, 30, '0000', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '48px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6
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

    this.starSpawnInterval = 2500;
    this.enemySpawnInterval = 2000;
  }

  createParallaxLayer(key, scrollFactor) {
    const width = this.scale.width;
    const height = this.scale.height;

    const layer1 = this.add.tileSprite(0, 0, width, height, key).setOrigin(0, 0);
    const layer2 = this.add.tileSprite(width, 0, width, height, key).setOrigin(0, 0);

    this.bgLayers.push({ sprites: [layer1, layer2], scrollFactor });
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

    // Update parallax background
    const scrollSpeed = this.baseScrollSpeed * this.speedMultiplier;
    this.bgLayers.forEach(layer => {
      layer.sprites.forEach(sprite => {
        sprite.tilePositionX += scrollSpeed * layer.scrollFactor;
      });
    });

    // Increase difficulty over time
    this.difficultyTimer += delta;
    if (this.difficultyTimer > 5000) {
      this.speedMultiplier += 0.05;
      this.difficultyTimer = 0;
    }

    // Spawn stars
    this.starSpawnTimer += delta;
    if (this.starSpawnTimer > this.starSpawnInterval) {
      this.spawnStarWave();
      this.starSpawnTimer = 0;
    }

    // Spawn enemies
    this.enemySpawnTimer += delta;
    if (this.enemySpawnTimer > this.enemySpawnInterval) {
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
    const numStars = Phaser.Math.Between(4, 7);

    // Choose spawn pattern
    const pattern = Phaser.Math.Between(0, 2);

    if (pattern === 0) {
      // Arc/wave pattern (like concept art)
      const centerY = height / 2;
      const arcRadius = 120;
      for (let i = 0; i < numStars; i++) {
        const angle = (Math.PI / (numStars - 1)) * i - Math.PI / 2;
        const x = width + i * 60;
        const y = centerY + Math.sin(angle) * arcRadius;
        this.createStar(x, y);
      }
    } else if (pattern === 1) {
      // Horizontal line
      const y = Phaser.Math.Between(100, height - 100);
      for (let i = 0; i < numStars; i++) {
        this.createStar(width + i * 70, y);
      }
    } else {
      // Vertical wave
      const startY = Phaser.Math.Between(80, 200);
      for (let i = 0; i < numStars; i++) {
        this.createStar(width + i * 60, startY + Math.sin(i * 0.5) * 100);
      }
    }
  }

  createStar(x, y) {
    const star = this.stars.create(x, y, 'pickup_star');
    star.setScale(0.4);
    star.setVelocity(0, 0);
  }

  spawnEnemies() {
    const height = this.scale.height;
    const width = this.scale.width;

    // Smart spawning - ensure there's always a gap
    const numEnemies = Phaser.Math.Between(1, 3);
    const safeZoneHeight = 200; // Minimum gap for player
    const lanes = Math.floor(height / safeZoneHeight);
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
        const y = lane * safeZoneHeight + safeZoneHeight / 2;
        const enemyType = Phaser.Math.Between(0, 1) === 0 ? 'enemy_cloud' : 'enemy_robot';
        this.createEnemy(width + 50, y, enemyType);
      }
    }
  }

  createEnemy(x, y, type) {
    const enemy = this.enemies.create(x, y, type);
    enemy.setScale(0.5);
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
    this.scoreText.setText(scoreStr);
  }
}
