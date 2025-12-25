import Phaser from 'phaser';
import * as GAME from '../../config/gameConstants.js';

/**
 * SpawnSystem - Handles spawning of stars and enemies
 * Manages spawn timers, patterns, and cleanup
 */
export class SpawnSystem {
  constructor(scene) {
    this.scene = scene;
    this.starSpawnTimer = 0;
    this.enemySpawnTimer = 0;
    this.baseStarSpawnInterval = GAME.DIFFICULTY.BASE_STAR_SPAWN_INTERVAL;
    this.baseEnemySpawnInterval = GAME.DIFFICULTY.BASE_ENEMY_SPAWN_INTERVAL;
  }

  /**
   * Update spawn timers and trigger spawns
   * @param {number} delta - Time since last frame in ms
   * @param {number} speedMultiplier - Current game speed multiplier
   */
  update(delta, speedMultiplier) {
    // Dynamic spawn intervals based on speedMultiplier
    // As speed increases, spawns happen more frequently!
    const currentStarInterval = this.baseStarSpawnInterval / speedMultiplier;
    const currentEnemyInterval = this.baseEnemySpawnInterval / speedMultiplier;

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
  }

  /**
   * Spawn a wave of stars in various patterns
   */
  spawnStarWave() {
    const height = this.scene.scale.height;
    const width = this.scene.scale.width;
    const numStars = Phaser.Math.Between(
      GAME.SPAWN.MIN_STARS_PER_WAVE,
      GAME.SPAWN.MAX_STARS_PER_WAVE
    );

    // Stars spawn in same area as enemies: fixed margins for consistency
    const topMargin = GAME.SPAWN.TOP_MARGIN;  // Below score display
    const bottomMargin = GAME.SPAWN.BOTTOM_MARGIN;  // Above ground level
    const spawnHeight = height - topMargin - bottomMargin;

    // Choose spawn pattern
    const pattern = Phaser.Math.Between(0, 2);

    if (pattern === 0) {
      // Arc/wave pattern (like concept art)
      const centerY = topMargin + spawnHeight / 2;
      const arcRadius = Math.min(GAME.SPAWN.STAR_ARC_RADIUS_MAX, spawnHeight / 3);
      for (let i = 0; i < numStars; i++) {
        const angle = (Math.PI / (numStars - 1)) * i - Math.PI / 2;
        const x = width + i * GAME.SPAWN.STAR_ARC_SPACING;
        const y = centerY + Math.sin(angle) * arcRadius;
        this.createStar(x, y);
      }
    } else if (pattern === 1) {
      // Horizontal line with more spacing
      const y = Phaser.Math.Between(
        topMargin + GAME.SPAWN.STAR_MARGIN_PADDING,
        height - bottomMargin - GAME.SPAWN.STAR_MARGIN_PADDING
      );
      for (let i = 0; i < numStars; i++) {
        this.createStar(width + i * GAME.SPAWN.STAR_HORIZONTAL_SPACING, y);
      }
    } else {
      // Vertical wave with more spacing
      const startY = Phaser.Math.Between(
        topMargin + GAME.SPAWN.STAR_MARGIN_PADDING,
        topMargin + Math.min(GAME.SPAWN.BOTTOM_MARGIN, spawnHeight / 2)
      );
      for (let i = 0; i < numStars; i++) {
        this.createStar(
          width + i * GAME.SPAWN.STAR_WAVE_SPACING,
          startY + Math.sin(i * 0.5) * GAME.SPAWN.STAR_HORIZONTAL_SPACING
        );
      }
    }
  }

  /**
   * Create a single star
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  createStar(x, y) {
    const star = this.scene.stars.create(x, y, 'pickup_ifk');

    // Small, nimble IFK logos - easy to navigate around
    const isDesktop = this.scene.scale.height > GAME.SCALES.MOBILE_HEIGHT_THRESHOLD;
    const targetScale = isDesktop ? GAME.SCALES.STAR_DESKTOP : GAME.SCALES.STAR_MOBILE;
    star.setScale(targetScale);
    star.setDepth(GAME.DEPTHS.STARS);

    // Use circular hitbox matching the small sprite
    const radius = star.width * GAME.PHYSICS.STAR_HITBOX_RATIO;
    star.body.setCircle(radius);
    star.body.setOffset(star.width / 2 - radius, star.height / 2 - radius);

    star.setVelocity(0, 0);
  }

  /**
   * Spawn multiple enemies in lanes
   */
  spawnEnemies() {
    const height = this.scene.scale.height;
    const width = this.scene.scale.width;

    // Enemies spawn in lanes across the sky
    const numEnemies = Phaser.Math.Between(GAME.SPAWN.MIN_ENEMIES, GAME.SPAWN.MAX_ENEMIES);

    // Expand spawn area to reach closer to top and bottom
    const topMargin = GAME.SPAWN.ENEMY_TOP_MARGIN;
    const bottomMargin = GAME.SPAWN.ENEMY_BOTTOM_MARGIN;
    const spawnHeight = height - topMargin - bottomMargin;

    // Smaller lane height for more lanes, plus random offset for variety
    const laneHeight = GAME.SPAWN.LANE_HEIGHT;
    const randomOffset = GAME.SPAWN.LANE_RANDOM_OFFSET;
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

  /**
   * Create a single enemy
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {string} type - Enemy type ('enemy_cloud' or 'enemy_robot')
   */
  createEnemy(x, y, type) {
    const enemy = this.scene.enemies.create(x, y, type);

    // Small, nimble enemies - easy to navigate around
    const isDesktop = this.scene.scale.height > GAME.SCALES.MOBILE_HEIGHT_THRESHOLD;
    const targetScale = isDesktop ? GAME.SCALES.ENEMY_DESKTOP : GAME.SCALES.ENEMY_MOBILE;
    enemy.setScale(targetScale);
    enemy.setDepth(GAME.DEPTHS.ENEMIES);

    // Hitbox size matching the small sprite
    enemy.setBodySize(
      enemy.width * GAME.PHYSICS.HITBOX_SIZE_RATIO,
      enemy.height * GAME.PHYSICS.HITBOX_SIZE_RATIO
    );

    // Variable speed based on enemy type - creates dynamic difficulty
    if (type === 'enemy_cloud') {
      enemy.speedFactor = GAME.SPEEDS.CLOUD_SPEED_FACTOR;  // Clouds move 50% faster!
    } else {
      enemy.speedFactor = GAME.SPEEDS.ROBOT_SPEED_FACTOR;  // Robots/barrels move with background
    }

    enemy.setVelocity(0, 0);
  }

  /**
   * Move and cleanup stars that went off screen
   * @param {number} scrollSpeed - Current scroll speed
   */
  updateStars(scrollSpeed) {
    this.scene.stars.children.entries.forEach(star => {
      star.x -= scrollSpeed * GAME.SPEEDS.STAR_SCROLL_MULTIPLIER;
      if (star.x < GAME.SPAWN.STAR_CLEANUP_X) {
        star.destroy();
      }
    });
  }

  /**
   * Move and cleanup enemies that went off screen
   * @param {number} scrollSpeed - Current scroll speed
   */
  updateEnemies(scrollSpeed) {
    this.scene.enemies.children.entries.forEach(enemy => {
      enemy.x -= scrollSpeed * GAME.SPEEDS.ENEMY_SCROLL_MULTIPLIER * enemy.speedFactor;
      if (enemy.x < GAME.SPAWN.ENEMY_CLEANUP_X) {
        enemy.destroy();
      }
    });
  }
}
