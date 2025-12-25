import { useState, useEffect, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
import GameComponent from './components/GameComponent';
import ErrorBoundary from './components/ErrorBoundary';
import InstallAppPrompt from './components/InstallAppPrompt';
import Modal from './components/Modal';
import './index.css';

function App() {
  const [gameState, setGameState] = useState('menu'); // menu, select, playing, gameover
  const [selectedShip, setSelectedShip] = useState(null);
  const [score, setScore] = useState(0);
  const [isPortrait, setIsPortrait] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFullscreenWarning, setShowFullscreenWarning] = useState(false);

  // Detect if running as installed PWA (standalone mode)
  const [isStandalone] = useState(() => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
  });

  // Track if install prompt should show (same logic as InstallAppPrompt component)
  const [installPromptDismissed, setInstallPromptDismissed] = useState(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // If already dismissed, in standalone mode, or not mobile → consider dismissed
    return dismissed || isStandalone || !isMobile;
  });
  const [highScores, setHighScores] = useState(() => {
    const saved = localStorage.getItem('skyHighScores');
    if (!saved) return [];

    try {
      const parsed = JSON.parse(saved);
      // Check if old format (array of numbers) - if so, clear it
      if (parsed.length > 0 && typeof parsed[0] === 'number') {
        localStorage.removeItem('skyHighScores');
        return [];
      }
      // New format: array of { name, score } objects
      return parsed;
    } catch {
      return [];
    }
  });

  // FIX #1: Singleton Audio instances to prevent memory leaks
  const audioRef = useRef(null);

  // Initialize audio on mount, cleanup on unmount
  useEffect(() => {
    audioRef.current = new Audio('/audio/sfx_click.mp3');
    audioRef.current.volume = 1.0;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  // Helper function to play click sound (reuses singleton)
  const playClickSound = (volume = 1.0) => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Reset to start
      audioRef.current.volume = volume;
      audioRef.current.play().catch(() => {});
    }
  };

  // Detect orientation changes
  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // Detect fullscreen changes
  useEffect(() => {
    const checkFullscreen = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', checkFullscreen);
    return () => {
      document.removeEventListener('fullscreenchange', checkFullscreen);
    };
  }, []);

  const handleStartClick = () => {
    // Check if on mobile and not in fullscreen
    const isMobile = window.innerWidth <= 768;
    if (isMobile && !document.fullscreenElement) {
      // Show warning for mobile users not in fullscreen
      setShowFullscreenWarning(true);
    } else {
      // Proceed to game
      playClickSound();
      setGameState('select');
    }
  };

  const handleStartWithoutFullscreen = () => {
    playClickSound();
    setShowFullscreenWarning(false);
    setGameState('select');
  };

  const handleStartWithFullscreen = () => {
    playClickSound();
    setShowFullscreenWarning(false);

    // Enter fullscreen first
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().then(() => {
        setGameState('select');
      }).catch(() => {
        setGameState('select');
      });
    } else {
      setGameState('select');
    }
  };

  const handleFullscreen = () => {
    playClickSound();

    if (!document.fullscreenElement) {
      // Enter fullscreen
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});

        // FIX #15: Track fullscreen usage
        if (window.va) {
          window.va('track', 'Fullscreen Enabled');
        }
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const handleShipHover = () => {
    // Play hover sound at lower volume
    playClickSound(0.3);
  };

  const handleShipSelect = (ship) => {
    playClickSound();
    setSelectedShip(ship);
    setGameState('playing');

    // FIX #15: Track pilot selection
    if (window.va) {
      window.va('track', 'Pilot Selected', { pilot: ship });
    }
  };

  const handleGameOver = (finalScore) => {
    setScore(finalScore);

    // Capitalize pilot name
    const pilotName = selectedShip.charAt(0).toUpperCase() + selectedShip.slice(1);

    // Create new score entry with unique ID (FIX #14: stable keys)
    const newEntry = {
      id: Date.now(),
      name: pilotName,
      score: finalScore
    };

    // Update high scores - Top 10
    const newHighScores = [...highScores, newEntry]
      .sort((a, b) => b.score - a.score) // Sort by score descending
      .slice(0, 10); // Keep top 10

    setHighScores(newHighScores);

    // FIX #15: Track game over and high score achievements
    const isTopScore = newHighScores[0].score === finalScore;
    const isPersonalBest = !highScores.some(entry =>
      entry.name.toLowerCase() === selectedShip && entry.score >= finalScore
    );

    if (window.va) {
      window.va('track', 'Game Over', {
        pilot: pilotName,
        score: finalScore,
        isTopScore,
        isPersonalBest,
        leaderboardPosition: newHighScores.findIndex(e => e === newEntry) + 1
      });

      if (isTopScore) {
        window.va('track', 'High Score Achieved', { score: finalScore, pilot: pilotName });
      }
    }

    // FIX #3: Safe localStorage with error handling
    try {
      const serialized = JSON.stringify(newHighScores);
      localStorage.setItem('skyHighScores', serialized);
    } catch (error) {
      // Handle quota exceeded or other storage errors
      console.error('Failed to save high scores to localStorage:', error);

      // If quota exceeded, try to clear old data and retry
      if (error.name === 'QuotaExceededError') {
        try {
          // Clear all localStorage and try again with just current scores
          localStorage.clear();
          localStorage.setItem('skyHighScores', JSON.stringify(newHighScores));
        } catch (retryError) {
          console.error('Failed to save even after clearing localStorage:', retryError);
          // Continue anyway - scores will still show in current session
        }
      }
    }

    setGameState('gameover');
  };

  const handlePlayAgain = () => {
    playClickSound();
    setSelectedShip(null);
    setGameState('select');

    // FIX #15: Track replay
    if (window.va) {
      window.va('track', 'Play Again', { previousScore: score });
    }
  };

  const handleInstallPromptDismiss = () => {
    setInstallPromptDismissed(true);
  };

  return (
    <div className="app">
      {/* PWA Install Prompt - Shows on mobile/tablet first visit */}
      <InstallAppPrompt onDismiss={handleInstallPromptDismiss} />

      {/* Portrait Mode Overlay - Only show after install prompt dismissed */}
      <Modal
        isOpen={isPortrait && installPromptDismissed}
        icon="📱 ↻"
        title="Vänligen rotera telefonen"
        className="rotate-overlay"
      >
        <p>Spelet spelas bäst i liggande läge</p>
      </Modal>

      {gameState === 'menu' && (
        <div className="menu-screen">
          <h1 className="game-title">Sky High Adventures</h1>
          <div className="button-container">
            <button className="start-button" onClick={handleStartClick}>
              Starta Spel
            </button>
            {/* Only show fullscreen toggle in browser mode, not in installed PWA */}
            {!isStandalone && (
              <button
                className="fullscreen-toggle-button"
                onClick={handleFullscreen}
              >
                {isFullscreen ? '⊗ Avsluta\nHelskärm' : '🖵 Aktivera\nHelskärm'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Fullscreen Warning Modal for Mobile */}
      <Modal
        isOpen={showFullscreenWarning}
        icon="⚠️"
        title="Helskärmsläge"
      >
        <p>
          Spelet är optimerat för PC och fungerar bäst på mobil i helskärmsläge.
        </p>
        <p className="modal-subtitle">
          Vill du aktivera helskärmsläge för bästa upplevelse?
        </p>
        <div className="modal-buttons">
          <button className="modal-button primary" onClick={handleStartWithFullscreen}>
            🖵 Starta med Helskärm
          </button>
          <button className="modal-button secondary" onClick={handleStartWithoutFullscreen}>
            Fortsätt utan
          </button>
        </div>
      </Modal>

      {gameState === 'select' && (
        <div className="select-screen">
          <h2 className="select-title">Välj din pilot</h2>
          <div className="ship-container">
            <div
              className="ship-option"
              onClick={() => handleShipSelect('alexander')}
              onMouseEnter={handleShipHover}
            >
              <img src="/images/select_frame_alexander.png" alt="Alexander" />
            </div>
            <div
              className="ship-option"
              onClick={() => handleShipSelect('klas')}
              onMouseEnter={handleShipHover}
            >
              <img src="/images/select_frame_klas.png" alt="Klas" />
            </div>
            <div
              className="ship-option"
              onClick={() => handleShipSelect('bhing')}
              onMouseEnter={handleShipHover}
            >
              <img src="/images/select_frame_bhing.png" alt="Bhing" />
            </div>
          </div>
        </div>
      )}

      {gameState === 'playing' && selectedShip && (
        <ErrorBoundary onReset={() => setGameState('menu')}>
          <GameComponent
            selectedShip={selectedShip}
            onGameOver={handleGameOver}
          />
        </ErrorBoundary>
      )}

      {gameState === 'gameover' && (
        <div className="gameover-screen">
          <h1 className="gameover-title">Game Over!</h1>
          <div className="score-display">
            <p className="final-score">Din poäng: {score}</p>
          </div>
          <button className="play-again-button" onClick={handlePlayAgain}>
            Spela igen
          </button>
          <div className="highscore-display">
            <h3>Top 10 High Scores</h3>
            <ol>
              {highScores.length > 0 ? (
                highScores.map((entry, idx) => {
                  // Highlight ONLY the first (most recent) matching score
                  const firstMatchIndex = highScores.findIndex(e =>
                    e.score === score && e.name.toLowerCase() === selectedShip
                  );
                  const isCurrentScore = idx === firstMatchIndex && firstMatchIndex !== -1;
                  return (
                    <li
                      key={entry.id || `${entry.name}-${entry.score}-${idx}`}
                      className={isCurrentScore ? 'current-highscore' : ''}
                    >
                      {entry.name} - {entry.score}
                    </li>
                  );
                })
              ) : (
                <li>Inga rekord än</li>
              )}
            </ol>
          </div>
        </div>
      )}

      {/* Copyright Footer - Visible on all screens */}
      <div className="copyright">© Klas Olsson 2025</div>

      {/* Vercel Analytics */}
      <Analytics />
    </div>
  );
}

export default App;
