import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * PWA Install Prompt for Mobile/Tablet
 * Shows on first visit, offers to install app or play in browser
 */
function InstallAppPrompt({ onDismiss }) {
  // Initialize showPrompt based on conditions
  const [showPrompt, setShowPrompt] = useState(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        window.navigator.standalone === true;

    // Only show on mobile/tablet, not already installed, not dismissed
    return isMobile && !isStandalone && !dismissed;
  });

  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {

    // Capture the beforeinstallprompt event
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('User accepted PWA install');
      }

      setDeferredPrompt(null);
    }

    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');

    // Notify parent that prompt was dismissed
    if (onDismiss) {
      onDismiss();
    }
  };

  const handlePlayInBrowser = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');

    // Notify parent that prompt was dismissed
    if (onDismiss) {
      onDismiss();
    }
  };

  const handleRemindLater = () => {
    setShowPrompt(false);
    // Don't set localStorage, so it shows again next visit

    // Notify parent that prompt was dismissed
    if (onDismiss) {
      onDismiss();
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="install-prompt-overlay">
      <div className="install-prompt-content">
        <div className="install-prompt-header">
          <div className="install-prompt-icon">📱</div>
          <h2>Installera Sky High Adventures</h2>
        </div>

        <p className="install-prompt-description">
          Få en bättre spelupplevelse! Installera appen för:
        </p>

        <ul className="install-prompt-features">
          <li>⚡ Snabbare laddning</li>
          <li>📴 Spela offline</li>
          <li>🏠 Egen ikon på hemskärmen</li>
          <li>🎮 Helskärmsläge automatiskt</li>
        </ul>

        <div className="install-prompt-buttons">
          {deferredPrompt && (
            <button
              className="install-button primary"
              onClick={handleInstall}
            >
              📲 Installera App
            </button>
          )}

          <button
            className="install-button secondary"
            onClick={handlePlayInBrowser}
          >
            🌐 Spela i Webbläsaren
          </button>

          <button
            className="install-button tertiary"
            onClick={handleRemindLater}
          >
            ⏰ Påminn Senare
          </button>
        </div>

        <p className="install-prompt-note">
          <small>
            {deferredPrompt
              ? 'Tryck "Installera App" för att lägga till på hemskärmen'
              : 'Gå till webbläsarens meny och välj "Lägg till på hemskärmen"'}
          </small>
        </p>
      </div>

      <style>{`
        .install-prompt-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 1.5rem;
          animation: fadeIn 0.3s ease;
        }

        .install-prompt-content {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border-radius: 24px;
          padding: 2rem;
          max-width: 450px;
          width: 100%;
          border: 3px solid #FFD700;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8),
                      0 0 40px rgba(255, 215, 0, 0.3);
          animation: slideUp 0.4s ease;
        }

        .install-prompt-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .install-prompt-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          animation: bounce 2s infinite;
        }

        .install-prompt-content h2 {
          font-size: 1.8rem;
          color: #FFD700;
          margin: 0 0 0.5rem 0;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }

        .install-prompt-description {
          color: #fff;
          font-size: 1.1rem;
          margin-bottom: 1rem;
          text-align: center;
        }

        .install-prompt-features {
          list-style: none;
          padding: 0;
          margin: 1.5rem 0;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 1rem;
        }

        .install-prompt-features li {
          color: #fff;
          padding: 0.5rem 0;
          font-size: 1.05rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .install-prompt-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
          margin-top: 1.5rem;
        }

        .install-button {
          padding: 1rem 1.5rem;
          border: none;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Arial Black', sans-serif;
          text-transform: uppercase;
        }

        .install-button.primary {
          background: linear-gradient(135deg, #4CAF50, #45a049);
          color: white;
          box-shadow: 0 6px 0 #2d6b2f, 0 8px 20px rgba(76, 175, 80, 0.4);
        }

        .install-button.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 0 #2d6b2f, 0 12px 25px rgba(76, 175, 80, 0.5);
        }

        .install-button.primary:active {
          transform: translateY(4px);
          box-shadow: 0 2px 0 #2d6b2f;
        }

        .install-button.secondary {
          background: linear-gradient(135deg, #2196F3, #1976D2);
          color: white;
          box-shadow: 0 6px 0 #0D47A1, 0 8px 20px rgba(33, 150, 243, 0.4);
        }

        .install-button.secondary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 0 #0D47A1, 0 12px 25px rgba(33, 150, 243, 0.5);
        }

        .install-button.secondary:active {
          transform: translateY(4px);
          box-shadow: 0 2px 0 #0D47A1;
        }

        .install-button.tertiary {
          background: rgba(255, 255, 255, 0.1);
          color: #ccc;
          border: 2px solid rgba(255, 255, 255, 0.2);
          box-shadow: none;
          font-size: 0.95rem;
        }

        .install-button.tertiary:hover {
          background: rgba(255, 255, 255, 0.15);
          color: #fff;
        }

        .install-prompt-note {
          text-align: center;
          margin-top: 1rem;
          color: #aaa;
        }

        .install-prompt-note small {
          font-size: 0.85rem;
          line-height: 1.4;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @media (max-width: 768px) {
          .install-prompt-content {
            padding: 1.5rem;
          }

          .install-prompt-content h2 {
            font-size: 1.5rem;
          }

          .install-prompt-icon {
            font-size: 3rem;
          }

          .install-button {
            padding: 0.9rem 1.2rem;
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}

InstallAppPrompt.propTypes = {
  onDismiss: PropTypes.func
};

export default InstallAppPrompt;
