/**
 * Game Constants - Centralized configuration
 * FIX #9: Extract magic numbers to prevent scattered hardcoded values
 */

// Player Configuration
export const PLAYER = {
  START_X: 250,
  START_Y_RATIO: 0.4, // 40% from top
  SCALE: 0.15,
  MOVE_SPEED: 400,
  GROUND_MARGIN_RATIO: 50 // Responsive ground margin multiplier
};

// Scoring
export const SCORING = {
  STAR_POINTS: 10,
  HIGH_SCORE_LIMIT: 10 // Top 10 leaderboard
};

// Game Speeds
export const SPEEDS = {
  BASE_SCROLL: 2,
  STAR_SCROLL_MULTIPLIER: 2,
  ENEMY_SCROLL_MULTIPLIER: 1.5,
  CLOUD_SPEED_FACTOR: 1.5, // Clouds move 50% faster
  ROBOT_SPEED_FACTOR: 1.0
};

// Difficulty Progression
export const DIFFICULTY = {
  INCREASE_INTERVAL: 3000, // Every 3 seconds
  SPEED_INCREMENT: 0.1,    // +10% speed each interval
  BASE_STAR_SPAWN_INTERVAL: 3500,
  BASE_ENEMY_SPAWN_INTERVAL: 3000
};

// Spawn Configuration
export const SPAWN = {
  // Stars
  MIN_STARS_PER_WAVE: 3,
  MAX_STARS_PER_WAVE: 5,
  STAR_ARC_SPACING: 100,
  STAR_HORIZONTAL_SPACING: 120,
  STAR_WAVE_SPACING: 100,
  STAR_ARC_RADIUS_MAX: 150, // Maximum arc radius for star waves
  STAR_MARGIN_PADDING: 50, // Padding from spawn margins

  // Enemies
  MIN_ENEMIES: 1,
  MAX_ENEMIES: 2,
  LANE_HEIGHT: 70,
  LANE_RANDOM_OFFSET: 35,
  ENEMY_X_OFFSET: 50, // X position offset when spawning
  MAX_LANE_ATTEMPTS: 10, // Max attempts to find unoccupied lane

  // Margins
  TOP_MARGIN: 80,    // Below score display
  BOTTOM_MARGIN: 200, // Above ground (stars)
  ENEMY_TOP_MARGIN: 60,
  ENEMY_BOTTOM_MARGIN: 80,

  // Cleanup thresholds
  STAR_CLEANUP_X: -50, // X position to destroy stars
  ENEMY_CLEANUP_X: -100 // X position to destroy enemies
};

// Entity Scales (responsive)
export const SCALES = {
  // Desktop
  STAR_DESKTOP: 0.08,
  ENEMY_DESKTOP: 0.15,

  // Mobile
  STAR_MOBILE: 0.035,
  ENEMY_MOBILE: 0.06,

  // UI
  SCORE_ICON: 0.12,

  // Detection threshold
  MOBILE_HEIGHT_THRESHOLD: 600
};

// UI Positioning (ratios for responsive design)
export const UI = {
  SCORE_X: 30,
  SCORE_Y: 30,
  SCORE_TEXT_X: 70,
  SCORE_TEXT_Y: 18,
  SCORE_FONT_SIZE: 48,
  SCORE_STROKE: 8,

  PAUSE_BUTTON_X_OFFSET: 80,
  PAUSE_BUTTON_Y: 30,
  PAUSE_BUTTON_FONT_SIZE: 48,
  PAUSE_BUTTON_STROKE: 6,

  PAUSE_TITLE_Y_RATIO: 0.3,
  PAUSE_TITLE_FONT_SIZE: 80,
  PAUSE_TITLE_STROKE: 10,
  PAUSE_INSTRUCTIONS_Y_RATIO: 0.45,
  PAUSE_INSTRUCTIONS_FONT_SIZE: 24,
  PAUSE_RESUME_Y_RATIO: 0.6,
  PAUSE_RESUME_FONT_SIZE: 36,
  PAUSE_RESUME_STROKE: 6
};

// Parallax Layers
export const PARALLAX = {
  MOUNTAINS_SCROLL_FACTOR: 0.2,
  MOUNTAINS_SCALE: 0.5,
  HILLS_SCROLL_FACTOR: 0.5,
  HILLS_SCALE: 0.4,
  GROUND_SCROLL_FACTOR: 1.0,
  GROUND_SCALE: 0.35,
  SKY_BLEED: 1.02 // Slight oversize to prevent seams
};

// Audio Volumes
export const AUDIO = {
  MUSIC_VOLUME: 0.5,
  ENGINE_VOLUME: 0.3,
  STAR_SFX_VOLUME: 0.4,
  EXPLOSION_SFX_VOLUME: 0.6
};

// Physics
export const PHYSICS = {
  TOUCH_DEADZONE: 10, // Minimum distance before moving
  HITBOX_SIZE_RATIO: 0.6, // Hitbox is 60% of sprite size
  STAR_HITBOX_RATIO: 0.4
};

// Depths (Z-index for rendering order)
export const DEPTHS = {
  SKY: 0,
  MOUNTAINS: 1,
  HILLS: 2,
  GROUND: 3,
  PLAYER: 100,
  ENEMIES: 100,
  STARS: 100,
  SCORE_UI: 1000,
  PAUSE_BUTTON: 1001,
  PAUSE_OVERLAY: 5000
};

// Timing
export const TIMING = {
  GAME_OVER_DELAY: 1000, // Wait before showing game over screen
  EXPLOSION_SCALE: 1.5
};

// Color Codes
export const COLORS = {
  SKY_BLUE: '#87CEEB',
  PAUSE_OVERLAY_BG: 0x000000,
  PAUSE_OVERLAY_ALPHA: 0.8,
  PAUSE_TITLE_COLOR: '#FFD700',
  PAUSE_TEXT_COLOR: '#FFFFFF',
  RESUME_BUTTON_COLOR: '#4CAF50',
  SCORE_TEXT_COLOR: '#FFFFFF',
  SCORE_STROKE_COLOR: '#000000'
};

// Asset Paths (for future refactoring)
export const ASSETS = {
  BACKGROUNDS: {
    SKY: '/images/bg_sky.png',
    MOUNTAINS: '/images/bg_mountains.png',
    HILLS: '/images/bg_hills.png',
    GROUND: '/images/bg_ground.png'
  },
  SHIPS: {
    RED: '/images/ship_red.png',
    BLUE: '/images/ship_blue.png',
    PURPLE: '/images/ship_purple.png'
  },
  ENEMIES: {
    CLOUD: '/images/enemy_cloud.png',
    ROBOT: '/images/enemy_robot.png'
  },
  PICKUPS: {
    STAR: '/images/pickup_ifk.png'
  },
  EFFECTS: {
    EXPLOSION: '/images/explosion.png',
    SMOKE: '/images/particle_smoke.png'
  },
  AUDIO: {
    MUSIC: '/audio/music_bg.mp3',
    ENGINE: '/audio/engine_loop.mp3',
    STAR_SFX: '/audio/sfx_star.mp3',
    EXPLOSION_SFX: '/audio/sfx_explosion.mp3',
    CLICK_SFX: '/audio/sfx_click.mp3'
  }
};
