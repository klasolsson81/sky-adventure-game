import * as GAME from '../../config/gameConstants.js';

/**
 * ParallaxSystem - Handles parallax scrolling background layers
 * Creates depth effect by scrolling layers at different speeds
 */
export class ParallaxSystem {
  constructor(scene) {
    this.scene = scene;
    this.bgLayers = [];
    this.baseScrollSpeed = GAME.SPEEDS.BASE_SCROLL;
  }

  /**
   * Create a parallax scrolling layer
   * @param {string} key - Texture key
   * @param {number} scrollFactor - Speed multiplier for this layer
   * @param {number} scale - Scale factor for this layer
   * @param {boolean} anchorBottom - Whether to anchor to bottom of screen
   */
  createLayer(key, scrollFactor, scale, anchorBottom = true) {
    const gameWidth = this.scene.scale.width;
    const gameHeight = this.scene.scale.height;
    const scaleRatio = this.scene.scaleRatio;

    // Use tileSprite for seamless scrolling backgrounds
    const tex = this.scene.textures.get(key);
    const texHeight = tex.getSourceImage().height;

    // Apply responsive scaling
    const responsiveScale = scale * scaleRatio;

    // Calculate the physical height this layer should occupy
    // Use Math.ceil to avoid sub-pixel rendering issues
    const targetHeight = Math.ceil(texHeight * responsiveScale);

    // Create a tileSprite that fills the FULL width, but has the scaled-down height
    // Small 2px bleed for seamless edges (images are now properly cropped)
    const sprite = this.scene.add.tileSprite(gameWidth / 2, 0, gameWidth, targetHeight + 2, key);

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

  /**
   * Update parallax scrolling
   * @param {number} speedMultiplier - Current game speed multiplier
   */
  update(speedMultiplier) {
    const scrollSpeed = this.baseScrollSpeed * speedMultiplier;

    this.bgLayers.forEach(layer => {
      // Only update tilePosition for tileSprites (not regular images like bg_sky)
      if (layer.sprite.tilePositionX !== undefined && layer.scrollFactor > 0) {
        layer.sprite.tilePositionX += scrollSpeed * layer.scrollFactor;
      }
    });
  }

  /**
   * Get all background layers
   * @returns {Array}
   */
  getLayers() {
    return this.bgLayers;
  }
}
