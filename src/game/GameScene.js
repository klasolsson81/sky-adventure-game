import Phaser from 'phaser';
import * as GAME from '../config/gameConstants.js';

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
    this.load.image('pickup_ifk', '/images/pickup_ifk.png');

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
    this.baseScrollSpeed = GAME.SPEEDS.BASE_SCROLL;

    // Dynamic scale ratio based on screen height (baseline: 1080px)
    this.scaleRatio = height / 1080;

    // Set camera background to sky blue (prevents sub-pixel artifacts)
    this.cameras.main.setBackgroundColor(GAME.COLORS.SKY_BLUE);

    // Create sky background FIRST - as stretched image (no tiling)
    const sky = this.add.image(width / 2, height / 2, 'bg_sky');
    sky.setOrigin(0.5, 0.5);  // Center origin
    // Bleed over edges slightly to eliminate any sub-pixel seams
    sky.setDisplaySize(width * GAME.PARALLAX.SKY_BLEED, height * GAME.PARALLAX.SKY_BLEED);
    sky.setScrollFactor(0);  // Lock in place
    sky.setDepth(GAME.DEPTHS.SKY);  // Behind everything

    // Create parallax background (3 layers) - using single sprite per layer
    this.bgLayers = [];
    this.createParallaxLayer('bg_mountains', GAME.PARALLAX.MOUNTAINS_SCROLL_FACTOR, GAME.PARALLAX.MOUNTAINS_SCALE, true);  // Mountains smaller - positioned higher
    this.createParallaxLayer('bg_hills', GAME.PARALLAX.HILLS_SCROLL_FACTOR, GAME.PARALLAX.HILLS_SCALE, true);      // Hills medium scroll
    this.createParallaxLayer('bg_ground', GAME.PARALLAX.GROUND_SCROLL_FACTOR, GAME.PARALLAX.GROUND_SCALE, true);    // Ground fast scroll, covers more of bottom

    // Determine ship image
    const shipImages = {
      'alexander': 'ship_red',
      'klas': 'ship_blue',
      'bhing': 'ship_purple'
    };
    const shipKey = shipImages[this.selectedShip] || 'ship_red';

    // Create player (positioned in sky area)
    this.player = this.physics.add.sprite(GAME.PLAYER.START_X, height * GAME.PLAYER.START_Y_RATIO, shipKey);
    this.player.setScale(GAME.PLAYER.SCALE * this.scaleRatio);  // Responsive scaling for high-res images
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(GAME.DEPTHS.PLAYER);  // Player in front of background

    // Groups
    this.stars = this.physics.add.group();
    this.enemies = this.physics.add.group();

    // Score display (top left with IFK icon) - responsive scaling
    const starIcon = this.add.image(GAME.UI.SCORE_X * this.scaleRatio, GAME.UI.SCORE_Y * this.scaleRatio, 'pickup_ifk');
    starIcon.setScale(GAME.SCALES.SCORE_ICON * this.scaleRatio);  // Adjusted for IFK logo size
    starIcon.setScrollFactor(0);
    starIcon.setDepth(GAME.DEPTHS.SCORE_UI);

    // Dynamic font size based on scaleRatio - larger and more visible
    const fontSize = Math.floor(GAME.UI.SCORE_FONT_SIZE * this.scaleRatio);
    this.scoreText = this.add.text(GAME.UI.SCORE_TEXT_X * this.scaleRatio, GAME.UI.SCORE_TEXT_Y * this.scaleRatio, 'Poäng: 0', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: `${fontSize}px`,
      color: GAME.COLORS.SCORE_TEXT_COLOR,  // White with strong shadow
      stroke: GAME.COLORS.SCORE_STROKE_COLOR,
      strokeThickness: Math.max(4, Math.floor(GAME.UI.SCORE_STROKE * this.scaleRatio)),
      shadow: {
        offsetX: 3,
        offsetY: 3,
        color: '#000000',
        blur: 5,
        fill: true
      }
    });
    this.scoreText.setScrollFactor(0);
    this.scoreText.setDepth(GAME.DEPTHS.SCORE_UI);

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();

    // Collision detection
    this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

    // Audio
    this.musicBg = this.sound.add('music_bg', { loop: true, volume: GAME.AUDIO.MUSIC_VOLUME });
    this.engineSound = this.sound.add('engine_loop', { loop: true, volume: GAME.AUDIO.ENGINE_VOLUME });

    this.musicBg.play();
    this.engineSound.play();

    // FIX #8: Pause functionality
    this.isPaused = false;
    this.pauseOverlay = null;

    // Pause button (top-right corner)
    const pauseButton = this.add.text(width - GAME.UI.PAUSE_BUTTON_X_OFFSET * this.scaleRatio, GAME.UI.PAUSE_BUTTON_Y * this.scaleRatio, '⏸', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: `${Math.floor(GAME.UI.PAUSE_BUTTON_FONT_SIZE * this.scaleRatio)}px`,
      color: GAME.COLORS.PAUSE_TEXT_COLOR,
      stroke: GAME.COLORS.SCORE_STROKE_COLOR,
      strokeThickness: Math.max(4, Math.floor(GAME.UI.PAUSE_BUTTON_STROKE * this.scaleRatio))
    })
    .setInteractive({ useHandCursor: true })
    .setScrollFactor(0)
    .setDepth(GAME.DEPTHS.PAUSE_BUTTON)
    .setOrigin(0.5);

    pauseButton.on('pointerdown', () => {
      this.togglePause();
    });

    // Keyboard shortcuts: ESC, P, SPACE, or ENTER to pause/resume
    this.input.keyboard.on('keydown-ESC', () => {
      if (!this.isGameOver) this.togglePause();
    });
    this.input.keyboard.on('keydown-P', () => {
      if (!this.isGameOver) this.togglePause();
    });
    this.input.keyboard.on('keydown-SPACE', () => {
      if (!this.isGameOver) this.togglePause();
    });
    this.input.keyboard.on('keydown-ENTER', () => {
      if (!this.isGameOver) this.togglePause();
    });

    // Spawn timers
    this.starSpawnTimer = 0;
    this.enemySpawnTimer = 0;
    this.difficultyTimer = 0;

    // Base spawn intervals (will decrease with speedMultiplier)
    this.baseStarSpawnInterval = GAME.DIFFICULTY.BASE_STAR_SPAWN_INTERVAL;
    this.baseEnemySpawnInterval = GAME.DIFFICULTY.BASE_ENEMY_SPAWN_INTERVAL;
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
    // Use Math.ceil to avoid sub-pixel rendering issues
    const targetHeight = Math.ceil(texHeight * responsiveScale);

    // Create a tileSprite that fills the FULL width, but has the scaled-down height
    // Small 2px bleed for seamless edges (images are now properly cropped)
    const sprite = this.add.tileSprite(gameWidth / 2, 0, gameWidth, targetHeight + 2, key);

    if (anchorBottom) {
      sprite.setOrigin(0.5, 1); // Anchor bottom-center
      // Use Math.round to avoid sub-pixel positioning
      sprite.setPosition(Math.round(gameWidth / 2), Math.round(gameHeight)); // Stick to bottom
    } else {
      sprite.setOrigin(0.5, 0); // Anchor top-center
      sprite.setPosition(Math.round(gameWidth / 2), 0);
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
    if (this.isGameOver || this.isPaused) return;

    const height = this.scale.height;
    const moveSpeed = GAME.PLAYER.MOVE_SPEED;

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
      if (distance < GAME.PHYSICS.TOUCH_DEADZONE) {
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

    // Prevent player from flying below the ground (allow down to grass level)
    const groundMargin = GAME.PLAYER.GROUND_MARGIN_RATIO * this.scaleRatio; // Responsive ground margin
    if (this.player.y > height - groundMargin) {
      this.player.y = height - groundMargin;
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
    if (this.difficultyTimer > GAME.DIFFICULTY.INCREASE_INTERVAL) {  // Every 3 seconds (was 5000)
      this.speedMultiplier += GAME.DIFFICULTY.SPEED_INCREMENT;       // Bigger jumps (was 0.05)
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
      star.x -= scrollSpeed * GAME.SPEEDS.STAR_SCROLL_MULTIPLIER;
      if (star.x < GAME.SPAWN.STAR_CLEANUP_X) {
        star.destroy();
      }
    });

    // Move and clean up enemies - use speedFactor for variable speeds
    this.enemies.children.entries.forEach(enemy => {
      enemy.x -= scrollSpeed * GAME.SPEEDS.ENEMY_SCROLL_MULTIPLIER * enemy.speedFactor;  // Clouds move faster!
      if (enemy.x < GAME.SPAWN.ENEMY_CLEANUP_X) {
        enemy.destroy();
      }
    });
  }

  spawnStarWave() {
    const height = this.scale.height;
    const width = this.scale.width;
    const numStars = Phaser.Math.Between(GAME.SPAWN.MIN_STARS_PER_WAVE, GAME.SPAWN.MAX_STARS_PER_WAVE);  // Reduced from 4-7 to 3-5

    // Stars spawn in same area as enemies: fixed margins for consistency
    const topMargin = GAME.SPAWN.TOP_MARGIN;  // Below score display
    const bottomMargin = GAME.SPAWN.BOTTOM_MARGIN;  // Above ground level
    const spawnHeight = height - topMargin - bottomMargin;

    // Choose spawn pattern
    const pattern = Phaser.Math.Between(0, 2);

    if (pattern === 0) {
      // Arc/wave pattern (like concept art)
      const centerY = topMargin + spawnHeight / 2;
      const arcRadius = Math.min(GAME.SPAWN.STAR_ARC_RADIUS_MAX, spawnHeight / 3);  // Responsive arc size
      for (let i = 0; i < numStars; i++) {
        const angle = (Math.PI / (numStars - 1)) * i - Math.PI / 2;
        const x = width + i * GAME.SPAWN.STAR_ARC_SPACING;  // Increased spacing from 60 to 100
        const y = centerY + Math.sin(angle) * arcRadius;
        this.createStar(x, y);
      }
    } else if (pattern === 1) {
      // Horizontal line with more spacing
      const y = Phaser.Math.Between(topMargin + GAME.SPAWN.STAR_MARGIN_PADDING, height - bottomMargin - GAME.SPAWN.STAR_MARGIN_PADDING);
      for (let i = 0; i < numStars; i++) {
        this.createStar(width + i * GAME.SPAWN.STAR_HORIZONTAL_SPACING, y);  // Increased spacing from 70 to 120
      }
    } else {
      // Vertical wave with more spacing
      const startY = Phaser.Math.Between(topMargin + GAME.SPAWN.STAR_MARGIN_PADDING, topMargin + Math.min(GAME.SPAWN.BOTTOM_MARGIN, spawnHeight / 2));
      for (let i = 0; i < numStars; i++) {
        this.createStar(width + i * GAME.SPAWN.STAR_WAVE_SPACING, startY + Math.sin(i * 0.5) * GAME.SPAWN.STAR_HORIZONTAL_SPACING);  // Increased spacing
      }
    }
  }

  createStar(x, y) {
    const star = this.stars.create(x, y, 'pickup_ifk');

    // Small, nimble IFK logos - easy to navigate around
    // Use height to detect mobile (mobiles have lower height even in landscape)
    const isDesktop = this.scale.height > GAME.SCALES.MOBILE_HEIGHT_THRESHOLD;
    const targetScale = isDesktop ? GAME.SCALES.STAR_DESKTOP : GAME.SCALES.STAR_MOBILE; // Adjusted for IFK logo (taller than star)
    star.setScale(targetScale);
    star.setDepth(GAME.DEPTHS.STARS);   // In front of background

    // Use circular hitbox matching the small sprite
    const radius = star.width * GAME.PHYSICS.STAR_HITBOX_RATIO;
    star.body.setCircle(radius);
    star.body.setOffset(star.width / 2 - radius, star.height / 2 - radius);

    star.setVelocity(0, 0);
  }

  spawnEnemies() {
    const height = this.scale.height;
    const width = this.scale.width;

    // Enemies spawn in lanes across the sky
    const numEnemies = Phaser.Math.Between(GAME.SPAWN.MIN_ENEMIES, GAME.SPAWN.MAX_ENEMIES);

    // Expand spawn area to reach closer to top and bottom
    const topMargin = GAME.SPAWN.ENEMY_TOP_MARGIN;  // Closer to top, just below score
    const bottomMargin = GAME.SPAWN.ENEMY_BOTTOM_MARGIN;  // Closer to ground but still visible
    const spawnHeight = height - topMargin - bottomMargin;

    // Smaller lane height for more lanes, plus random offset for variety
    const laneHeight = GAME.SPAWN.LANE_HEIGHT;  // Smaller lanes = more distribution
    const randomOffset = GAME.SPAWN.LANE_RANDOM_OFFSET;  // Increased random variation within each lane
    const numLanes = Math.max(4, Math.floor(spawnHeight / laneHeight));
    const occupiedLanes = [];

    for (let i = 0; i < numEnemies && occupiedLanes.length < numLanes; i++) {
      let lane;
      let attempts = 0;

      // Find an unoccupied lane
      do {
        lane = Phaser.Math.Between(0, numLanes - 1);
        attempts++;
      } while (occupiedLanes.includes(lane) && attempts < GAME.SPAWN.MAX_LANE_ATTEMPTS);

      if (attempts < GAME.SPAWN.MAX_LANE_ATTEMPTS) {
        occupiedLanes.push(lane);
        // Calculate Y position with random offset for variety
        const baseLaneY = topMargin + (lane * laneHeight) + (laneHeight / 2);
        const offset = Phaser.Math.Between(-randomOffset, randomOffset);
        const y = Phaser.Math.Clamp(baseLaneY + offset, topMargin, height - bottomMargin);

        const enemyType = Phaser.Math.Between(0, 1) === 0 ? 'enemy_cloud' : 'enemy_robot';
        this.createEnemy(width + GAME.SPAWN.ENEMY_X_OFFSET, y, enemyType);
      }
    }
  }

  createEnemy(x, y, type) {
    const enemy = this.enemies.create(x, y, type);

    // Small, nimble enemies - easy to navigate around
    // Use height to detect mobile (mobiles have lower height even in landscape)
    const isDesktop = this.scale.height > GAME.SCALES.MOBILE_HEIGHT_THRESHOLD;
    const targetScale = isDesktop ? GAME.SCALES.ENEMY_DESKTOP : GAME.SCALES.ENEMY_MOBILE; // 15% storlek på PC, 6% på mobil
    enemy.setScale(targetScale);
    enemy.setDepth(GAME.DEPTHS.ENEMIES);   // In front of background

    // Hitbox size matching the small sprite
    enemy.setBodySize(enemy.width * GAME.PHYSICS.HITBOX_SIZE_RATIO, enemy.height * GAME.PHYSICS.HITBOX_SIZE_RATIO);

    // Variable speed based on enemy type - creates dynamic difficulty
    if (type === 'enemy_cloud') {
      enemy.speedFactor = GAME.SPEEDS.CLOUD_SPEED_FACTOR;  // Clouds move 50% faster!
    } else {
      enemy.speedFactor = GAME.SPEEDS.ROBOT_SPEED_FACTOR;  // Robots/barrels move with background
    }

    enemy.setVelocity(0, 0);
  }

  collectStar(player, star) {
    star.destroy();
    this.score += GAME.SCORING.STAR_POINTS;
    this.updateScoreDisplay();
    this.sound.play('sfx_star', { volume: GAME.AUDIO.STAR_SFX_VOLUME });
  }

  hitEnemy(player) {
    if (this.isGameOver) return;

    this.isGameOver = true;

    // Stop all audio and effects
    this.musicBg.stop();
    this.engineSound.stop();

    // Play explosion effect
    this.sound.play('sfx_explosion', { volume: GAME.AUDIO.EXPLOSION_SFX_VOLUME });

    const explosion = this.add.sprite(player.x, player.y, 'explosion');
    explosion.setScale(GAME.TIMING.EXPLOSION_SCALE * this.scaleRatio);

    player.setVisible(false);

    // Wait a moment then trigger game over
    this.time.delayedCall(GAME.TIMING.GAME_OVER_DELAY, () => {
      if (this.onGameOverCallback) {
        this.onGameOverCallback(this.score);
      }
    });
  }

  updateScoreDisplay() {
    this.scoreText.setText('Poäng: ' + this.score);
  }

  togglePause() {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      // Pause physics and audio
      this.physics.pause();
      this.musicBg.pause();
      this.engineSound.pause();

      // Create semi-transparent overlay
      const width = this.scale.width;
      const height = this.scale.height;

      this.pauseOverlay = this.add.container(0, 0);
      this.pauseOverlay.setDepth(GAME.DEPTHS.PAUSE_OVERLAY);

      // Dark background
      const bg = this.add.rectangle(width / 2, height / 2, width, height, GAME.COLORS.PAUSE_OVERLAY_BG, GAME.COLORS.PAUSE_OVERLAY_ALPHA);

      // Pause title
      const title = this.add.text(width / 2, height * GAME.UI.PAUSE_TITLE_Y_RATIO, 'PAUSAT', {
        fontFamily: 'Arial Black, sans-serif',
        fontSize: `${Math.floor(GAME.UI.PAUSE_TITLE_FONT_SIZE * this.scaleRatio)}px`,
        color: GAME.COLORS.PAUSE_TITLE_COLOR,
        stroke: GAME.COLORS.SCORE_STROKE_COLOR,
        strokeThickness: Math.max(6, Math.floor(GAME.UI.PAUSE_TITLE_STROKE * this.scaleRatio))
      }).setOrigin(0.5);

      // Instructions
      const instructions = this.add.text(width / 2, height * GAME.UI.PAUSE_INSTRUCTIONS_Y_RATIO, 'Tryck ESC eller P för att fortsätta', {
        fontFamily: 'Arial, sans-serif',
        fontSize: `${Math.floor(GAME.UI.PAUSE_INSTRUCTIONS_FONT_SIZE * this.scaleRatio)}px`,
        color: GAME.COLORS.PAUSE_TEXT_COLOR
      }).setOrigin(0.5);

      // Resume button (interactive)
      const resumeBtn = this.add.text(width / 2, height * GAME.UI.PAUSE_RESUME_Y_RATIO, '▶ Fortsätt', {
        fontFamily: 'Arial Black, sans-serif',
        fontSize: `${Math.floor(GAME.UI.PAUSE_RESUME_FONT_SIZE * this.scaleRatio)}px`,
        color: GAME.COLORS.RESUME_BUTTON_COLOR,
        stroke: GAME.COLORS.SCORE_STROKE_COLOR,
        strokeThickness: Math.max(4, Math.floor(GAME.UI.PAUSE_RESUME_STROKE * this.scaleRatio))
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

      resumeBtn.on('pointerover', () => {
        resumeBtn.setScale(1.1);
      });
      resumeBtn.on('pointerout', () => {
        resumeBtn.setScale(1.0);
      });
      resumeBtn.on('pointerdown', () => {
        this.togglePause();
      });

      // Add all to container
      this.pauseOverlay.add([bg, title, instructions, resumeBtn]);
      this.pauseOverlay.setScrollFactor(0);

    } else {
      // Resume physics and audio
      this.physics.resume();
      this.musicBg.resume();
      this.engineSound.resume();

      // Remove overlay
      if (this.pauseOverlay) {
        this.pauseOverlay.destroy();
        this.pauseOverlay = null;
      }
    }
  }
}
