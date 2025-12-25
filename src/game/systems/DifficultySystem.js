import * as GAME from '../../config/gameConstants.js';

/**
 * DifficultySystem - Handles progressive difficulty scaling
 * Increases speed multiplier over time to make game harder
 */
export class DifficultySystem {
  constructor(scene) {
    this.scene = scene;
    this.difficultyTimer = 0;
    this.speedMultiplier = GAME.DIFFICULTY.SPEED_MULTIPLIER_START;
  }

  /**
   * Update difficulty progression
   * @param {number} delta - Time since last frame in ms
   */
  update(delta) {
    this.difficultyTimer += delta;

    if (this.difficultyTimer > GAME.DIFFICULTY.INCREASE_INTERVAL) {
      this.speedMultiplier += GAME.DIFFICULTY.SPEED_INCREMENT;
      this.difficultyTimer = 0;
    }
  }

  /**
   * Get current speed multiplier
   * @returns {number}
   */
  getSpeedMultiplier() {
    return this.speedMultiplier;
  }

  /**
   * Reset difficulty to starting values
   */
  reset() {
    this.difficultyTimer = 0;
    this.speedMultiplier = GAME.DIFFICULTY.SPEED_MULTIPLIER_START;
  }
}
