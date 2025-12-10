import { useState, useEffect } from 'react';
import GameComponent from './components/GameComponent';
import './index.css';

function App() {
  const [gameState, setGameState] = useState('menu'); // menu, select, playing, gameover
  const [selectedShip, setSelectedShip] = useState(null);
  const [score, setScore] = useState(0);
  const [isPortrait, setIsPortrait] = useState(false);
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

  const handleStartClick = () => {
    const audio = new Audio('/audio/sfx_click.mp3');
    audio.play().catch(() => {});
    setGameState('select');
  };

  const handleFullscreen = () => {
    const audio = new Audio('/audio/sfx_click.mp3');
    audio.play().catch(() => {});

    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  const handleShipHover = () => {
    // Play hover sound (separate instance so it doesn't cut off click)
    const audio = new Audio('/audio/sfx_click.mp3');
    audio.volume = 0.3; // Quieter for hover
    audio.play().catch(() => {});
  };

  const handleShipSelect = (ship) => {
    const audio = new Audio('/audio/sfx_click.mp3');
    audio.play().catch(() => {});
    setSelectedShip(ship);
    setGameState('playing');
  };

  const handleGameOver = (finalScore) => {
    setScore(finalScore);

    // Capitalize pilot name
    const pilotName = selectedShip.charAt(0).toUpperCase() + selectedShip.slice(1);

    // Create new score entry
    const newEntry = { name: pilotName, score: finalScore };

    // Update high scores - Top 10
    const newHighScores = [...highScores, newEntry]
      .sort((a, b) => b.score - a.score) // Sort by score descending
      .slice(0, 10); // Keep top 10

    setHighScores(newHighScores);
    localStorage.setItem('skyHighScores', JSON.stringify(newHighScores));

    setGameState('gameover');
  };

  const handlePlayAgain = () => {
    const audio = new Audio('/audio/sfx_click.mp3');
    audio.play().catch(() => {});
    setSelectedShip(null);
    setGameState('select');
  };

  return (
    <div className="app">
      {/* Portrait Mode Overlay - Force Landscape */}
      {isPortrait && (
        <div className="rotate-overlay">
          <div className="rotate-content">
            <div className="rotate-icon">📱 ↻</div>
            <h2>Vänligen rotera telefonen</h2>
            <p>Spelet spelas bäst i liggande läge</p>
          </div>
        </div>
      )}

      {gameState === 'menu' && (
        <div className="menu-screen">
          <h1 className="game-title">Sky High Adventures</h1>
          <button className="start-button" onClick={handleStartClick}>
            Starta Spel
          </button>
          <button className="fullscreen-button" onClick={handleFullscreen}>
            🖵 Helskärm
          </button>
        </div>
      )}

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
        <GameComponent
          selectedShip={selectedShip}
          onGameOver={handleGameOver}
        />
      )}

      {gameState === 'gameover' && (
        <div className="gameover-screen">
          <h1 className="gameover-title">Game Over!</h1>
          <div className="score-display">
            <p className="final-score">Din poäng: {score}</p>
          </div>
          <div className="highscore-display">
            <h3>Top 10 High Scores</h3>
            <ol>
              {highScores.length > 0 ? (
                highScores.map((entry, idx) => {
                  // Highlight current player's score
                  const isCurrentScore = entry.score === score &&
                                        entry.name.toLowerCase() === selectedShip;
                  return (
                    <li
                      key={idx}
                      style={isCurrentScore ? {
                        color: '#FFD700',
                        fontWeight: 'bold',
                        textShadow: '0 0 10px #FFD700'
                      } : {}}
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
          <button className="play-again-button" onClick={handlePlayAgain}>
            Spela igen
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
