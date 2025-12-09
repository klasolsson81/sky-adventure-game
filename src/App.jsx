import { useState } from 'react';
import GameComponent from './components/GameComponent';
import './index.css';

function App() {
  const [gameState, setGameState] = useState('menu'); // menu, select, playing, gameover
  const [selectedShip, setSelectedShip] = useState(null);
  const [score, setScore] = useState(0);
  const [highScores, setHighScores] = useState(() => {
    const saved = localStorage.getItem('skyHighScores');
    return saved ? JSON.parse(saved) : [];
  });

  const handleStartClick = () => {
    const audio = new Audio('/audio/sfx_click.mp3');
    audio.play().catch(() => {});
    setGameState('select');
  };

  const handleShipSelect = (ship) => {
    const audio = new Audio('/audio/sfx_click.mp3');
    audio.play().catch(() => {});
    setSelectedShip(ship);
    setGameState('playing');
  };

  const handleGameOver = (finalScore) => {
    setScore(finalScore);

    // Update high scores
    const newHighScores = [...highScores, finalScore]
      .sort((a, b) => b - a)
      .slice(0, 3);

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
      {gameState === 'menu' && (
        <div className="menu-screen">
          <h1 className="game-title">Sky High Adventures</h1>
          <button className="start-button" onClick={handleStartClick}>
            Starta Spel
          </button>
        </div>
      )}

      {gameState === 'select' && (
        <div className="select-screen">
          <h2 className="select-title">Välj ditt skepp</h2>
          <div className="ship-container">
            <div className="ship-option" onClick={() => handleShipSelect('alexander')}>
              <img src="/images/select_frame_alexander.png" alt="Alexander" />
              <p>Alexander</p>
            </div>
            <div className="ship-option" onClick={() => handleShipSelect('klas')}>
              <img src="/images/select_frame_klas.png" alt="Klas" />
              <p>Klas</p>
            </div>
            <div className="ship-option" onClick={() => handleShipSelect('bhing')}>
              <img src="/images/select_frame_bhing.png" alt="Bhing" />
              <p>Bhing</p>
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
            <h3>Top 3 High Scores</h3>
            <ol>
              {highScores.length > 0 ? (
                highScores.map((hs, idx) => (
                  <li key={idx}>{hs}</li>
                ))
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
