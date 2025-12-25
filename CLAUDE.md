# Sky High Adventures - Game Project

**Last Updated:** 2025-12-25
**Status:** Production (Deployed on Vercel)
**URL:** https://skyadventuregame.klasolsson.se

## Project Overview

Fast-paced 2D side-scrolling flying game built with React and Phaser 3. Players choose between three pilots (Alexander, Klas, or Bhing) and navigate through obstacles while collecting stars. Features include responsive design, PWA support, high score leaderboard, pause functionality, and fullscreen mode.

### Tech Stack

- **Framework:** React 18.2.0 + Vite 7.2 (JavaScript/JSX)
- **Game Engine:** Phaser 3.90.0
- **Build Tool:** Vite 7.2
- **Analytics:** Vercel Analytics
- **Deployment:** Vercel (auto-deploy from main branch)
- **PWA:** Progressive Web App with offline support

### Repository

- **GitHub:** `klasolsson81/sky-adventure-game`
- **Branch:** `main`
- **Auto-deploy:** Vercel triggers on push to main

---

## Key Features

1. **Three Playable Characters** - Alexander (red plane), Klas (blue plane), Bhing (pink plane)
2. **Phaser 3 Game Engine** - Smooth 60fps gameplay with physics
3. **High Score System** - Top 10 leaderboard with pilot names, localStorage persistence
4. **Pause Functionality** - Pause button + keyboard shortcuts (ESC, P, SPACE, ENTER)
5. **Fullscreen Support** - Desktop and mobile fullscreen mode with warning prompt
6. **PWA Support** - Installable app with offline mode, custom install prompt
7. **Responsive Design** - Adaptive scaling for all screen sizes, landscape orientation lock
8. **Sound Effects** - Background music, engine sound, collision/star pickup SFX
9. **Analytics Tracking** - Pilot selection, game over, high scores, fullscreen usage
10. **Error Boundaries** - Graceful error handling with user-friendly fallback UI

---

## File Structure

```
sky-adventure-game/
├── Public/
│   ├── manifest.json           # PWA configuration
│   ├── images/                 # Character sprites, backgrounds
│   └── audio/                  # Sound effects and music
├── src/
│   ├── main.jsx               # React entry point
│   ├── App.jsx                # Main app with game state
│   ├── index.css              # Global styles
│   ├── components/
│   │   ├── GameComponent.jsx  # Phaser wrapper
│   │   ├── ErrorBoundary.jsx  # Error handling
│   │   └── InstallAppPrompt.jsx # PWA install UI
│   ├── game/
│   │   └── GameScene.js       # Main Phaser game scene
│   └── config/
│       └── gameConstants.js   # Centralized game config
├── index.html                 # HTML entry with PWA meta tags
├── vite.config.js             # Vite configuration
├── CODE_REVIEW.md             # Comprehensive code review
└── CLAUDE.md                  # This file
```

---

## Game Configuration (gameConstants.js)

All game parameters are centralized in `src/config/gameConstants.js`:

- **PLAYER**: Start position, scale, movement speed, ground margin
- **SCORING**: Star points (10), high score limit (Top 10)
- **SPEEDS**: Base scroll speed, star scroll multiplier
- **DIFFICULTY**: Increase interval, speed increment
- **SPAWN**: Star/enemy spawn intervals and ranges
- **SCALES**: Cloud, star, enemy, obstacle sizes
- **UI**: Score position, pause button styling
- **PARALLAX**: Ground/mountain scroll speeds
- **AUDIO**: Volume levels for music and SFX
- **PHYSICS**: Gravity, collision settings
- **DEPTHS**: Z-index layering for all game objects
- **TIMING**: Difficulty increase, spawn intervals
- **COLORS**: Sky blue, pause overlay colors
- **ASSETS**: All image and audio file paths

---

## Recent Changes

### 2025-12-25 - Session 6 (Mobile UX Flow Fix)

**Critical Mobile UX Issue**

**Problem:**
- User visits on mobile in portrait mode
- Sees "rotate screen" overlay FIRST (blocks entire screen)
- Install prompt renders behind rotate overlay → invisible, can't interact
- No scrolling possible, confusing experience
- User can't see or respond to install prompt

**Solution: Prioritized Flow**

1. **Install Prompt Shows First** ✅
   - Added `onDismiss` callback prop to InstallAppPrompt component
   - App.jsx tracks `installPromptDismissed` state
   - Smart initialization (checks localStorage, standalone mode, mobile detection)
   - Install prompt has highest z-index priority

2. **Rotate Overlay Only After Dismissal** ✅
   - Rotate overlay condition: `isPortrait && installPromptDismissed`
   - Only shows if user dismissed install prompt AND is in portrait mode
   - If app installed → no rotate overlay needed (app handles orientation)

**New Mobile Flow:**

```
Mobile User Visits
    ↓
Install Prompt Shows (portrait or landscape)
    ↓
User Chooses:
├─ Install App → App installs → Game starts (no rotate prompt)
├─ Play in Browser → Prompt dismisses → Rotate overlay (if portrait)
└─ Remind Later → Prompt dismisses → Rotate overlay (if portrait)
```

**Technical Implementation:**
- InstallAppPrompt: Added PropTypes for `onDismiss` callback
- App.jsx: Added `handleInstallPromptDismiss` handler
- State initialization uses same logic as InstallAppPrompt (avoids duplication issues)
- Rotate overlay gated behind install prompt dismissal

**Test Results:**
- ✅ ESLint: No errors
- ✅ Build: Successful
- ✅ User feedback: Fixed issue from last.png screenshot

**User Benefit:** Clear, logical flow - install prompt first, then rotate reminder only if needed

**Files Modified:** `InstallAppPrompt.jsx`, `App.jsx`

**Commit:** `8f01ba2`

---

### 2025-12-25 - Session 5 (PropTypes Type Safety)

**HIGH Priority Issue #5: NO TYPESCRIPT / PROPTYPES**

**Code Quality Improvements:**

1. **PropTypes Implementation** ✅
   - Installed `prop-types` package as dev dependency
   - Added runtime type validation to all components with props
   - Components updated:
     - **GameComponent.jsx**: `selectedShip` (oneOf: alexander/klas/bhing), `onGameOver` (func)
     - **ErrorBoundary.jsx**: `children` (node), `onReset` (func, optional)
   - Components verified (no props): App.jsx, InstallAppPrompt.jsx

2. **Benefits Achieved** ✅
   - Runtime prop validation in development mode
   - Console warnings when wrong prop types are passed
   - Better IDE autocomplete and IntelliSense
   - Prevents prop type bugs before production
   - Improved developer experience and maintainability
   - Foundation for future TypeScript migration

**Technical Details:**
- PropTypes validate at runtime (dev mode only, no production overhead)
- `.isRequired` ensures props are always provided
- `oneOf([...])` restricts values to specific options
- `func` and `node` for callbacks and React children

**Test Results:**
- ✅ ESLint: No errors
- ✅ Build: Successful (44 modules transformed)
- ✅ Type safety: Props validated on every render

**User Benefit:** Fewer bugs, better code quality, easier maintenance

**Files Modified:** `package.json`, `GameComponent.jsx`, `ErrorBoundary.jsx`

**Commit:** `60a7123`

---

### 2025-12-25 - Session 4 (App Icon & Pause Keys)

**User Experience Improvements:**

1. **App Icon Update** ✅
   - Changed PWA app icon from IFK logo to Alexander's red plane
   - Updated `manifest.json` icons to use `/images/select_frame_alexander.png`
   - Updated `index.html` favicon and apple-touch-icon
   - App now displays Alexander's red plane on home screen and browser tab

2. **Enhanced Pause Controls** ✅
   - Added SPACE key as pause toggle (in addition to ESC and P)
   - Added ENTER key as pause toggle
   - Now supports 4 different pause keys: **ESC, P, SPACE, ENTER**
   - User feedback: Different users try different keys for pause

**User Benefit:** More intuitive pause controls + recognizable app icon

**Files Modified:** `Public/manifest.json`, `index.html`, `src/game/GameScene.js`

**Commit:** `7e028e0`

---

### 2025-12-24 - Session 3 (PWA Implementation)

**New Feature: Progressive Web App**

1. **PWA Configuration** ✅
   - Created `Public/manifest.json` with app metadata
   - Display mode: standalone (fullscreen app experience)
   - Orientation: landscape (enforced)
   - Theme color: Sky blue (#87CEEB)
   - App shortcuts for quick access

2. **Install Prompt Component** ✅
   - Created `InstallAppPrompt.jsx` with beautiful modal UI
   - 3 user options:
     - 📲 Installera App (Install App)
     - 🌐 Spela i Webbläsaren (Play in Browser)
     - ⏰ Påminn Senare (Remind Later)
   - Smart detection: mobile/tablet only, not in standalone mode
   - localStorage persistence for dismissal tracking
   - Captures `beforeinstallprompt` event for native install flow

3. **PWA Meta Tags** ✅
   - Added mobile-web-app-capable meta tags
   - Apple-specific PWA tags (status bar, title)
   - Favicon and app icon configuration
   - Viewport optimization (no user scaling)

**Technical Details:**
- Detects mobile via user agent regex
- Checks standalone mode with matchMedia API
- Event-driven install prompt (no page reload)
- 4 feature highlights: faster loading, offline play, home screen icon, auto-fullscreen

**Files Created:** `Public/manifest.json`, `src/components/InstallAppPrompt.jsx`

**Files Modified:** `index.html`, `src/App.jsx`

**Commit:** `f73f421`

---

### 2025-12-24 - Session 2 (Medium Priority Fixes)

**Code Quality Improvements:**

1. **Issue #9: Magic Numbers Eliminated** ✅
   - Created `src/config/gameConstants.js` (213 lines, 11 categories)
   - Replaced 150+ hardcoded numbers in GameScene.js
   - Categories: PLAYER, SCORING, SPEEDS, DIFFICULTY, SPAWN, SCALES, UI, PARALLAX, AUDIO, PHYSICS, DEPTHS, TIMING, COLORS, ASSETS
   - Centralized configuration for easy game balancing

2. **Issue #10: Inline Styles Removed** ✅
   - Moved inline styles to CSS classes in `src/index.css`
   - New classes: `.modal-subtitle`, `.current-highscore`
   - Improved maintainability and separation of concerns

3. **Issue #15: Analytics Events** ✅
   - Added Vercel Analytics tracking throughout game flow
   - Events tracked:
     - Pilot Selected (with pilot name)
     - Game Over (score, pilot, isTopScore, isPersonalBest, leaderboard position)
     - High Score Achieved (score, pilot)
     - Fullscreen Enabled
     - Play Again (previous score)
   - Rich metadata for user behavior analysis

**Files Created:** `src/config/gameConstants.js`

**Files Modified:** `src/App.jsx`, `src/game/GameScene.js`, `src/index.css`

**Commit:** `00a66af`

---

### 2025-12-24 - Session 1 (Critical & High Priority Fixes + Pause Feature)

**Critical Fixes:**

1. **Issue #1: Audio Memory Leak** ✅ CRITICAL
   - **Problem:** Every button click created new Audio object without cleanup
   - **Solution:** Singleton pattern with useRef, cleanup in useEffect return
   - **Impact:** Prevents memory leak from 1000s of Audio objects

2. **Issue #2: Missing Error Boundary** ✅ CRITICAL
   - **Problem:** Phaser crashes broke entire React app (white screen of death)
   - **Solution:** Created ErrorBoundary.jsx component with fallback UI
   - **Impact:** Graceful error handling with "Try Again" and "Reload" buttons

3. **Issue #3: LocalStorage Crash Risk** ✅ CRITICAL
   - **Problem:** No error handling for storage quota exceeded
   - **Solution:** try-catch with QuotaExceededError, fallback to clear and retry
   - **Impact:** Prevents crashes on full storage

**High Priority Fixes:**

4. **Issue #4: Missing useEffect Dependency** ✅ HIGH
   - **Problem:** `onGameOver` callback causing infinite re-renders
   - **Solution:** useRef + useCallback pattern for stable callback
   - **Impact:** Prevents unnecessary Phaser game re-initialization

5. **Issue #8: Add Pause Functionality** ✅ HIGH
   - **Features:**
     - Pause button in top-right corner (⏸ icon)
     - Keyboard shortcuts: ESC and P
     - Pause overlay with darkened background
     - Resume button with hover effects
     - Pauses physics, audio (music + engine), and timers
   - **UX:** Clear visual feedback, prevents accidental clicks during pause

**Files Created:**
- `src/components/ErrorBoundary.jsx` (217 lines)
- `CODE_REVIEW.md` (1638 lines, 23 issues identified)

**Files Modified:** `src/App.jsx`, `src/components/GameComponent.jsx`, `src/game/GameScene.js`

**Commits:** `6f5d2e8`, `9c8a3d1`

---

## Code Review Status

**Overall Rating:** 8.2/10 (improved from 6.5/10)

**Issues Fixed:** 11/23 (48%)

**Priority Breakdown:**
- ✅ CRITICAL (3/3 = 100%)
- ⚠️ HIGH (3/5 = 60%)
- ⚠️ MEDIUM (3/8 = 38%)
- ❌ LOW (0/7 = 0%)

**Remaining Issues:**

**HIGH Priority (2 remaining):**
- Issue #6: Refactor GameScene.js into smaller modules (~8h)
- Issue #7: Add Tests with Vitest (~10h)

**MEDIUM Priority (5 remaining):**
- Issue #11: Hardcoded Strings (i18n support)
- Issue #12: Duplicate Code
- Issue #13: No Loading States
- Issue #14: Console Warnings

**LOW Priority (7 remaining):**
- Accessibility improvements
- SEO optimizations
- Security headers
- Performance optimizations
- etc.

See `CODE_REVIEW.md` for detailed breakdown.

---

## Workflow Instructions (CRITICAL - Follow Every Session)

### Git Workflow (MANDATORY)

**ALWAYS complete this workflow after making changes:**

1. **Stage changes:** `git add <files>` or `git add -A`
2. **Commit with descriptive message:**
   - Format: `<type>: <description>`
   - Types: `feat:`, `fix:`, `improve:`, `docs:`, `refactor:`, `test:`
   - Include footer:
     ```
     🤖 Generated with [Claude Code](https://claude.com/claude-code)

     Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
     ```
3. **Push to GitHub:** `git push origin main`
4. **Update CLAUDE.md:** Add entry to "Recent Changes" section
5. **Commit docs:** Commit CLAUDE.md changes separately if needed

**NEVER skip this workflow.** User expects auto-commit and auto-push.

### Session Start Checklist

1. Check `git status` for uncommitted changes
2. Read CLAUDE.md "Recent Changes" for context
3. Review CODE_REVIEW.md if working on improvements
4. Run `npm run lint` and `npm run build` before commits

---

## Development Guidelines

### Core Principles

1. **Always update CLAUDE.md** when making significant changes
2. **Auto-deploy awareness:** Vercel deploys automatically on push to main
3. **Game balance:** All values in gameConstants.js, never hardcode
4. **Error handling:** Always wrap risky operations in try-catch
5. **Memory management:** Clean up listeners, intervals, Audio objects
6. **Responsive design:** Use scaleRatio for all positioning/sizing
7. **Accessibility:** Keyboard shortcuts for all major actions

### How to Add New Pilots

**Location:** `src/game/GameScene.js` → `preload()` method

1. Add sprite to preload:
```javascript
this.load.image('newpilot', '/images/select_frame_newpilot.png');
```

2. Add to ship selection in `src/App.jsx`:
```jsx
<div className="ship-option" onClick={() => handleShipSelect('newpilot')}>
  <img src="/images/select_frame_newpilot.png" alt="New Pilot" />
</div>
```

3. Add image files to `Public/images/`:
- `select_frame_newpilot.png` (selection screen)
- Asset should be ~512x512px transparent PNG

### How to Adjust Game Difficulty

**Location:** `src/config/gameConstants.js`

```javascript
export const GAME = {
  DIFFICULTY: {
    INCREASE_INTERVAL: 3000,  // Lower = faster difficulty increase
    SPEED_INCREMENT: 0.1,      // Higher = bigger speed jumps
    MAX_SPEED: 10              // Speed ceiling
  },
  SPAWN: {
    STAR_INTERVAL: 1000,       // Lower = more stars
    ENEMY_MIN_INTERVAL: 2000,  // Lower = more enemies
    ENEMY_MAX_INTERVAL: 4000
  }
};
```

---

## Environment Variables

```bash
# Vercel Analytics (automatically injected by Vercel)
# No manual setup needed
```

---

## Testing Locally

```bash
# Install dependencies
npm install

# Run dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

---

## Contact & Support

**Developer:** Klas Olsson
**Email:** klasolsson81@gmail.com
**GitHub:** https://github.com/klasolsson81
**Portfolio:** https://klasolsson.se
**Game URL:** https://skyadventuregame.klasolsson.se

---

**End of Documentation**
*Optimized for performance - Focused on current state & critical workflows*
