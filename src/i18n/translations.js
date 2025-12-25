/**
 * i18n Translations for Sky High Adventures
 * FIX #11: Extract hardcoded strings for internationalization
 *
 * Supported languages: Swedish (sv), English (en)
 */

export const translations = {
  sv: {
    menu: {
      title: 'Sky High Adventures',
      startGame: 'Starta Spel',
      fullscreenEnable: '🖵 Aktivera\nHelskärm',
      fullscreenExit: '⊗ Avsluta\nHelskärm'
    },
    fullscreenModal: {
      title: 'Helskärmsläge',
      description: 'Spelet är optimerat för PC och fungerar bäst på mobil i helskärmsläge.',
      question: 'Vill du aktivera helskärmsläge för bästa upplevelse?',
      startWithFullscreen: '🖵 Starta med Helskärm',
      continueWithout: 'Fortsätt utan'
    },
    select: {
      title: 'Välj din pilot'
    },
    game: {
      score: 'Poäng:',
      paused: 'PAUSAT',
      pauseInstructions: 'Tryck ESC eller P för att fortsätta',
      resumeButton: '▶ Fortsätt'
    },
    gameover: {
      title: 'Game Over!',
      yourScore: 'Din poäng:',
      playAgain: 'Spela igen',
      highScoresTitle: 'Top 10 High Scores',
      noRecords: 'Inga rekord än'
    },
    rotate: {
      icon: '📱 ↻',
      title: 'Vänligen rotera telefonen',
      description: 'Spelet spelas bäst i liggande läge'
    },
    error: {
      title: '😵 Oops! Något gick fel',
      message: 'Spelet stötte på ett oväntat problem. Försök ladda om sidan eller starta om spelet.',
      technicalInfo: 'Teknisk information (endast synlig i development)',
      tryAgain: '🔄 Försök igen',
      reloadPage: '🔃 Ladda om sidan'
    },
    install: {
      // Install prompt
      installIcon: '📱',
      installTitle: 'Installera Sky High Adventures',
      installDescription: 'Få en bättre spelupplevelse! Installera appen för:',
      features: {
        faster: '⚡ Snabbare laddning',
        offline: '📴 Spela offline',
        homescreen: '🏠 Egen ikon på hemskärmen',
        fullscreen: '🎮 Helskärmsläge automatiskt'
      },
      installButton: '📲 Installera App',
      playInBrowser: '🌐 Spela i Webbläsaren',
      remindLater: '⏰ Påminn Senare',
      installNote: 'Tryck "Installera App" för att lägga till på hemskärmen',
      manualInstall: 'Gå till webbläsarens meny och välj "Lägg till på hemskärmen"',

      // Confirmation screen
      confirmIcon: '🎉',
      confirmTitle: 'Appen är installerad!',
      confirmDescription: 'Sky High Adventures har installerats på din enhet.',
      step1: 'Stäng den här webbläsarfliken',
      step2: 'Hitta Sky High Adventures-ikonen på din hemskärm',
      step3: 'Tryck på ikonen för att öppna appen',
      confirmNote: '🏠 Leta efter det röda flygplanet bland dina appar!',
      understood: '✓ Jag förstår'
    },
    footer: {
      copyright: '© Klas Olsson 2025',
      madeBy: 'Skapad av',
      website: 'klasolsson.se'
    }
  },
  en: {
    menu: {
      title: 'Sky High Adventures',
      startGame: 'Start Game',
      fullscreenEnable: '🖵 Enable\nFullscreen',
      fullscreenExit: '⊗ Exit\nFullscreen'
    },
    fullscreenModal: {
      title: 'Fullscreen Mode',
      description: 'The game is optimized for PC and works best on mobile in fullscreen mode.',
      question: 'Do you want to enable fullscreen mode for the best experience?',
      startWithFullscreen: '🖵 Start with Fullscreen',
      continueWithout: 'Continue without'
    },
    select: {
      title: 'Choose your pilot'
    },
    game: {
      score: 'Score:',
      paused: 'PAUSED',
      pauseInstructions: 'Press ESC or P to continue',
      resumeButton: '▶ Resume'
    },
    gameover: {
      title: 'Game Over!',
      yourScore: 'Your score:',
      playAgain: 'Play again',
      highScoresTitle: 'Top 10 High Scores',
      noRecords: 'No records yet'
    },
    rotate: {
      icon: '📱 ↻',
      title: 'Please rotate your phone',
      description: 'The game is best played in landscape mode'
    },
    error: {
      title: '😵 Oops! Something went wrong',
      message: 'The game encountered an unexpected problem. Try reloading the page or restarting the game.',
      technicalInfo: 'Technical information (only visible in development)',
      tryAgain: '🔄 Try again',
      reloadPage: '🔃 Reload page'
    },
    install: {
      // Install prompt
      installIcon: '📱',
      installTitle: 'Install Sky High Adventures',
      installDescription: 'Get a better gaming experience! Install the app for:',
      features: {
        faster: '⚡ Faster loading',
        offline: '📴 Play offline',
        homescreen: '🏠 Own icon on home screen',
        fullscreen: '🎮 Automatic fullscreen mode'
      },
      installButton: '📲 Install App',
      playInBrowser: '🌐 Play in Browser',
      remindLater: '⏰ Remind Later',
      installNote: 'Press "Install App" to add to home screen',
      manualInstall: 'Go to browser menu and select "Add to home screen"',

      // Confirmation screen
      confirmIcon: '🎉',
      confirmTitle: 'App is installed!',
      confirmDescription: 'Sky High Adventures has been installed on your device.',
      step1: 'Close this browser tab',
      step2: 'Find the Sky High Adventures icon on your home screen',
      step3: 'Tap the icon to open the app',
      confirmNote: '🏠 Look for the red airplane among your apps!',
      understood: '✓ I understand'
    },
    footer: {
      copyright: '© Klas Olsson 2025',
      madeBy: 'Created by',
      website: 'klasolsson.se'
    }
  }
};

/**
 * Get translations for a specific language
 * @param {string} lang - Language code ('sv' or 'en')
 * @returns {object} Translation object
 */
export const getTranslations = (lang = 'sv') => {
  return translations[lang] || translations.sv;
};

/**
 * Supported languages
 */
export const LANGUAGES = {
  SV: 'sv',
  EN: 'en'
};

/**
 * Language display names
 */
export const LANGUAGE_NAMES = {
  sv: 'Svenska',
  en: 'English'
};
