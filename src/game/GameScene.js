import Phaser from 'phaser';
import * as GAME from '../config/gameConstants.js';
import { ParallaxSystem } from './systems/ParallaxSystem.js';
import { SpawnSystem } from './systems/SpawnSystem.js';
import { DifficultySystem } from './systems/DifficultySystem.js';
import { getTranslations } from '../i18n/translations.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    this.selectedShip = data.selectedShip;
    this.onGameOverCallback = data.onGameOver;
    this.lang = data.lang || 'sv';
    this.t = getTranslations(this.lang);
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

    // Dynamic scale ratio based on screen height (baseline: 1080px)
    this.scaleRatio = height / 1080;

    // Initialize game systems (FIX #6: Refactored from 545 lines to modular architecture)
    this.parallaxSystem = new ParallaxSystem(this);
    this.spawnSystem = new SpawnSystem(this);
    this.difficultySystem = new DifficultySystem(this);

    // Set camera background to sky blue (prevents sub-pixel artifacts)
    this.cameras.main.setBackgroundColor(GAME.COLORS.SKY_BLUE);

    // Create sky background FIRST - as stretched image (no tiling)
    const sky = this.add.image(width / 2, height / 2, 'bg_sky');
    sky.setOrigin(0.5, 0.5);  // Center origin
    // Bleed over edges slightly to eliminate any sub-pixel seams
    sky.setDisplaySize(width * GAME.PARALLAX.SKY_BLEED, height * GAME.PARALLAX.SKY_BLEED);
    sky.setScrollFactor(0);  // Lock in place
    sky.setDepth(GAME.DEPTHS.SKY);  // Behind everything

    // Create parallax background (3 layers) using ParallaxSystem
    this.parallaxSystem.createLayer('bg_mountains', GAME.PARALLAX.MOUNTAINS_SCROLL_FACTOR, GAME.PARALLAX.MOUNTAINS_SCALE, true);
    this.parallaxSystem.createLayer('bg_hills', GAME.PARALLAX.HILLS_SCROLL_FACTOR, GAME.PARALLAX.HILLS_SCALE, true);
    this.parallaxSystem.createLayer('bg_ground', GAME.PARALLAX.GROUND_SCROLL_FACTOR, GAME.PARALLAX.GROUND_SCALE, true);

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
    this.scoreText = this.add.text(GAME.UI.SCORE_TEXT_X * this.scaleRatio, GAME.UI.SCORE_TEXT_Y * this.scaleRatio, `${this.t.game.score} 0`, {
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

    // Update game systems (FIX #6: Clean separation of concerns)
    const speedMultiplier = this.difficultySystem.getSpeedMultiplier();
    const scrollSpeed = this.parallaxSystem.baseScrollSpeed * speedMultiplier;

    this.difficultySystem.update(delta);
    this.parallaxSystem.update(speedMultiplier);
    this.spawnSystem.update(delta, speedMultiplier);
    this.spawnSystem.updateStars(scrollSpeed);
    this.spawnSystem.updateEnemies(scrollSpeed);
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
    this.scoreText.setText(`${this.t.game.score} ${this.score}`);
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
      const title = this.add.text(width / 2, height * GAME.UI.PAUSE_TITLE_Y_RATIO, this.t.game.paused, {
        fontFamily: 'Arial Black, sans-serif',
        fontSize: `${Math.floor(GAME.UI.PAUSE_TITLE_FONT_SIZE * this.scaleRatio)}px`,
        color: GAME.COLORS.PAUSE_TITLE_COLOR,
        stroke: GAME.COLORS.SCORE_STROKE_COLOR,
        strokeThickness: Math.max(6, Math.floor(GAME.UI.PAUSE_TITLE_STROKE * this.scaleRatio))
      }).setOrigin(0.5);

      // Instructions
      const instructions = this.add.text(width / 2, height * GAME.UI.PAUSE_INSTRUCTIONS_Y_RATIO, this.t.game.pauseInstructions, {
        fontFamily: 'Arial, sans-serif',
        fontSize: `${Math.floor(GAME.UI.PAUSE_INSTRUCTIONS_FONT_SIZE * this.scaleRatio)}px`,
        color: GAME.COLORS.PAUSE_TEXT_COLOR
      }).setOrigin(0.5);

      // Resume button (interactive)
      const resumeBtn = this.add.text(width / 2, height * GAME.UI.PAUSE_RESUME_Y_RATIO, this.t.game.resumeButton, {
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
