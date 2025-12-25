import { useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import Phaser from 'phaser';
import GameScene from '../game/GameScene';

function GameComponent({ selectedShip, onGameOver }) {
  const gameRef = useRef(null);
  const phaserGameRef = useRef(null);

  // FIX #4: Stable callback ref to prevent unnecessary re-renders
  const onGameOverRef = useRef(onGameOver);

  useEffect(() => {
    onGameOverRef.current = onGameOver;
  }, [onGameOver]);

  const stableOnGameOver = useCallback((score) => {
    onGameOverRef.current?.(score);
  }, []);

  useEffect(() => {
    if (!gameRef.current) return;

    const config = {
      type: Phaser.AUTO,
      parent: gameRef.current,
      scale: {
        mode: Phaser.Scale.RESIZE,  // Responsive full-screen mode
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: window.innerWidth,
        height: window.innerHeight,
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false
        }
      },
      scene: GameScene,
      backgroundColor: '#87CEEB'
    };

    phaserGameRef.current = new Phaser.Game(config);

    phaserGameRef.current.scene.start('GameScene', {
      selectedShip,
      onGameOver: stableOnGameOver
    });

    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, [selectedShip, stableOnGameOver]);

  return <div ref={gameRef} className="game-container"></div>;
}

GameComponent.propTypes = {
  selectedShip: PropTypes.oneOf(['alexander', 'klas', 'bhing']).isRequired,
  onGameOver: PropTypes.func.isRequired
};

export default GameComponent;
