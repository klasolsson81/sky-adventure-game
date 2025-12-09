import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import GameScene from '../game/GameScene';

function GameComponent({ selectedShip, onGameOver }) {
  const gameRef = useRef(null);
  const phaserGameRef = useRef(null);

  useEffect(() => {
    if (!gameRef.current) return;

    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: gameRef.current,
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
      onGameOver
    });

    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, [selectedShip, onGameOver]);

  return <div ref={gameRef} className="game-container"></div>;
}

export default GameComponent;
