import { Component } from 'react';

/**
 * Error Boundary to catch Phaser game crashes and prevent white screen of death
 * FIX #2: Prevents Phaser errors from crashing the entire React app
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo
    });

    // Optional: Send error to analytics/monitoring service
    if (window.va) {
      window.va('track', 'Game Error', {
        error: error.toString(),
        componentStack: errorInfo.componentStack
      });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });

    // Trigger parent reset callback if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-fallback">
          <div className="error-content">
            <h1 className="error-title">😵 Oops! Något gick fel</h1>
            <p className="error-message">
              Spelet stötte på ett oväntat problem. Försök ladda om sidan eller starta om spelet.
            </p>

            {import.meta.env.MODE === 'development' && this.state.error && (
              <details className="error-details">
                <summary>Teknisk information (endast synlig i development)</summary>
                <pre className="error-stack">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="error-actions">
              <button
                className="error-button primary"
                onClick={this.handleReset}
              >
                🔄 Försök igen
              </button>
              <button
                className="error-button secondary"
                onClick={() => window.location.reload()}
              >
                🔃 Ladda om sidan
              </button>
            </div>
          </div>

          <style>{`
            .error-boundary-fallback {
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: linear-gradient(to bottom, #1a1a2e, #16213e);
              padding: 2rem;
            }

            .error-content {
              background: rgba(255, 255, 255, 0.1);
              padding: 2.5rem;
              border-radius: 20px;
              max-width: 600px;
              text-align: center;
              border: 3px solid #ff4444;
              box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
            }

            .error-title {
              font-size: 2.5rem;
              color: #ff4444;
              margin-bottom: 1.5rem;
              text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
            }

            .error-message {
              font-size: 1.2rem;
              color: white;
              margin-bottom: 2rem;
              line-height: 1.6;
            }

            .error-details {
              text-align: left;
              background: rgba(0, 0, 0, 0.3);
              padding: 1rem;
              border-radius: 8px;
              margin-bottom: 2rem;
              cursor: pointer;
            }

            .error-details summary {
              color: #ffa500;
              font-weight: bold;
              margin-bottom: 0.5rem;
            }

            .error-stack {
              color: #ccc;
              font-size: 0.85rem;
              overflow-x: auto;
              white-space: pre-wrap;
              word-break: break-word;
              margin-top: 0.5rem;
            }

            .error-actions {
              display: flex;
              gap: 1rem;
              justify-content: center;
              flex-wrap: wrap;
            }

            .error-button {
              font-size: 1.2rem;
              font-weight: bold;
              padding: 1rem 2rem;
              border: 3px solid;
              border-radius: 12px;
              cursor: pointer;
              transition: all 0.2s;
              text-transform: uppercase;
              font-family: 'Arial Black', sans-serif;
            }

            .error-button.primary {
              background: linear-gradient(to bottom, #4CAF50, #45a049);
              color: white;
              border-color: #2d6b2f;
              box-shadow: 0 6px 0 #2d6b2f;
            }

            .error-button.primary:hover {
              transform: translateY(2px);
              box-shadow: 0 4px 0 #2d6b2f;
            }

            .error-button.secondary {
              background: linear-gradient(to bottom, #2196F3, #1976D2);
              color: white;
              border-color: #0D47A1;
              box-shadow: 0 6px 0 #0D47A1;
            }

            .error-button.secondary:hover {
              transform: translateY(2px);
              box-shadow: 0 4px 0 #0D47A1;
            }

            @media (max-width: 768px) {
              .error-title {
                font-size: 1.8rem;
              }

              .error-message {
                font-size: 1rem;
              }

              .error-button {
                font-size: 1rem;
                padding: 0.8rem 1.5rem;
              }
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
