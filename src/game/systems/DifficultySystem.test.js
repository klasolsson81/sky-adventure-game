import { describe, it, expect, beforeEach } from 'vitest';
import { DifficultySystem } from './DifficultySystem.js';
import * as GAME from '../../config/gameConstants.js';

describe('DifficultySystem', () => {
  let mockScene;
  let difficultySystem;

  beforeEach(() => {
    mockScene = {};
    difficultySystem = new DifficultySystem(mockScene);
  });

  describe('initialization', () => {
    it('should initialize with correct starting values', () => {
      expect(difficultySystem.difficultyTimer).toBe(0);
      expect(difficultySystem.speedMultiplier).toBe(GAME.DIFFICULTY.SPEED_MULTIPLIER_START);
    });

    it('should store scene reference', () => {
      expect(difficultySystem.scene).toBe(mockScene);
    });
  });

  describe('update()', () => {
    it('should increment difficulty timer', () => {
      const delta = 1000;
      difficultySystem.update(delta);
      expect(difficultySystem.difficultyTimer).toBe(1000);
    });

    it('should NOT increase speed multiplier before interval', () => {
      const delta = GAME.DIFFICULTY.INCREASE_INTERVAL - 100;
      const initialMultiplier = difficultySystem.speedMultiplier;

      difficultySystem.update(delta);

      expect(difficultySystem.speedMultiplier).toBe(initialMultiplier);
    });

    it('should increase speed multiplier after interval', () => {
      const delta = GAME.DIFFICULTY.INCREASE_INTERVAL + 100;
      const initialMultiplier = difficultySystem.speedMultiplier;

      difficultySystem.update(delta);

      expect(difficultySystem.speedMultiplier).toBe(
        initialMultiplier + GAME.DIFFICULTY.SPEED_INCREMENT
      );
    });

    it('should reset timer after interval', () => {
      const delta = GAME.DIFFICULTY.INCREASE_INTERVAL + 100;

      difficultySystem.update(delta);

      expect(difficultySystem.difficultyTimer).toBe(0);
    });

    it('should progressively increase difficulty over multiple updates', () => {
      const delta = GAME.DIFFICULTY.INCREASE_INTERVAL + 100;
      const initialMultiplier = difficultySystem.speedMultiplier;

      // Simulate 3 difficulty increases
      difficultySystem.update(delta);
      difficultySystem.update(delta);
      difficultySystem.update(delta);

      const expectedMultiplier = initialMultiplier + (GAME.DIFFICULTY.SPEED_INCREMENT * 3);
      expect(difficultySystem.speedMultiplier).toBe(expectedMultiplier);
    });
  });

  describe('getSpeedMultiplier()', () => {
    it('should return current speed multiplier', () => {
      expect(difficultySystem.getSpeedMultiplier()).toBe(GAME.DIFFICULTY.SPEED_MULTIPLIER_START);
    });

    it('should return updated multiplier after update', () => {
      const delta = GAME.DIFFICULTY.INCREASE_INTERVAL + 100;
      difficultySystem.update(delta);

      const expected = GAME.DIFFICULTY.SPEED_MULTIPLIER_START + GAME.DIFFICULTY.SPEED_INCREMENT;
      expect(difficultySystem.getSpeedMultiplier()).toBe(expected);
    });
  });

  describe('reset()', () => {
    it('should reset difficulty timer to 0', () => {
      difficultySystem.difficultyTimer = 5000;
      difficultySystem.reset();
      expect(difficultySystem.difficultyTimer).toBe(0);
    });

    it('should reset speed multiplier to starting value', () => {
      difficultySystem.speedMultiplier = 2.5;
      difficultySystem.reset();
      expect(difficultySystem.speedMultiplier).toBe(GAME.DIFFICULTY.SPEED_MULTIPLIER_START);
    });

    it('should reset both timer and multiplier', () => {
      // Increase difficulty a few times
      const delta = GAME.DIFFICULTY.INCREASE_INTERVAL + 100;
      difficultySystem.update(delta);
      difficultySystem.update(delta);

      // Reset
      difficultySystem.reset();

      expect(difficultySystem.difficultyTimer).toBe(0);
      expect(difficultySystem.speedMultiplier).toBe(GAME.DIFFICULTY.SPEED_MULTIPLIER_START);
    });
  });
});
