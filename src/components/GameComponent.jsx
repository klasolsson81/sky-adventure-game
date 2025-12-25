import { useEffect, useRef, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import Phaser from 'phaser';
import GameScene from '../game/GameScene';

function GameComponent({ selectedShip, onGameOver }) {
  const gameRef = useRef(null);
  const phaserGameRef = useRef(null);

  // FIX #13: Loading states for asset loading
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

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

    setIsLoading(true);
    setLoadError(null);

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
      backgroundColor: '#87CEEB',
      // FIX #13: Loading callbacks
      callbacks: {
        preBoot: () => {
          setIsLoading(true);
        },
        postBoot: (game) => {
          // Add global event listener for scene creation
          game.events.on('create', () => {
            // Scene is fully loaded and created
            setIsLoading(false);
          });

          // Fallback timeout in case events don't fire
          setTimeout(() => {
            setIsLoading(false);
          }, 5000); // 5 second timeout
        }
      }
    };

    phaserGameRef.current = new Phaser.Game(config);

    // Start the scene
    phaserGameRef.current.scene.start('GameScene', {
      selectedShip,
      onGameOver: stableOnGameOver
    });

    // Listen for scene load events
    const scene = phaserGameRef.current.scene.getScene('GameScene');
    if (scene) {
      // Listen for load completion
      scene.load.on('complete', () => {
        setIsLoading(false);
      });

      // Listen for load errors
      scene.load.on('loaderror', (file) => {
        console.error('Failed to load asset:', file.key, file.url);
        setLoadError(`Failed to load: ${file.key}`);
        setIsLoading(false);
      });
    }

    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, [selectedShip, stableOnGameOver]);

  // FIX #13: Show loading screen while assets load
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="spinner"></div>
          <p>Laddar spel...</p>
        </div>

        <style>{`
          .loading-screen {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(to bottom, #87CEEB, #E0F6FF);
          }

          .loading-content {
            text-align: center;
            padding: 2rem;
          }

          .spinner {
            width: 60px;
            height: 60px;
            border: 6px solid rgba(0, 0, 0, 0.1);
            border-top-color: #FF6B35;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1.5rem auto;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }

          .loading-content p {
            font-size: 1.5rem;
            color: #333;
            font-weight: bold;
            text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
          }

          @media (max-width: 768px) {
            .spinner {
              width: 50px;
              height: 50px;
              border-width: 5px;
            }

            .loading-content p {
              font-size: 1.2rem;
            }
          }
        `}</style>
      </div>
    );
  }

  // FIX #13: Show error screen if assets fail to load
  if (loadError) {
    return (
      <div className="load-error-screen">
        <div className="load-error-content">
          <h2>⚠️ Kunde inte ladda spelet</h2>
          <p>{loadError}</p>
          <p className="error-description">
            Det gick inte att ladda alla resurser. Kontrollera din internetanslutning och försök igen.
          </p>
          <button
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            🔄 Försök igen
          </button>
        </div>

        <style>{`
          .load-error-screen {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(to bottom, #1a1a2e, #16213e);
            padding: 2rem;
          }

          .load-error-content {
            background: rgba(255, 255, 255, 0.1);
            padding: 2.5rem;
            border-radius: 20px;
            max-width: 500px;
            text-align: center;
            border: 3px solid #ff4444;
            box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
          }

          .load-error-content h2 {
            font-size: 2rem;
            color: #ff4444;
            margin-bottom: 1rem;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
          }

          .load-error-content p {
            color: white;
            font-size: 1.1rem;
            margin-bottom: 1rem;
            line-height: 1.6;
          }

          .error-description {
            color: #ccc;
            font-size: 1rem;
            margin-bottom: 2rem;
          }

          .retry-button {
            background: linear-gradient(to bottom, #4CAF50, #45a049);
            color: white;
            font-size: 1.2rem;
            font-weight: bold;
            padding: 1rem 2rem;
            border: 3px solid #2d6b2f;
            border-radius: 12px;
            cursor: pointer;
            box-shadow: 0 6px 0 #2d6b2f;
            transition: all 0.2s;
            text-transform: uppercase;
            font-family: 'Arial Black', sans-serif;
          }

          .retry-button:hover {
            transform: translateY(2px);
            box-shadow: 0 4px 0 #2d6b2f;
          }

          .retry-button:active {
            transform: translateY(4px);
            box-shadow: 0 2px 0 #2d6b2f;
          }

          @media (max-width: 768px) {
            .load-error-content h2 {
              font-size: 1.5rem;
            }

            .load-error-content p {
              font-size: 1rem;
            }

            .retry-button {
              font-size: 1rem;
              padding: 0.9rem 1.5rem;
            }
          }
        `}</style>
      </div>
    );
  }

  return <div ref={gameRef} className="game-container"></div>;
}

GameComponent.propTypes = {
  selectedShip: PropTypes.oneOf(['alexander', 'klas', 'bhing']).isRequired,
  onGameOver: PropTypes.func.isRequired
};

export default GameComponent;
