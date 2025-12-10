# Sky High Adventures ✈️⭐

Ett fartfyllt flygspel där du styr din pilot genom himlen, samlar stjärnor och undviker farliga hinder!

## 🎮 Om Spelet

Sky High Adventures är ett webbläsarbaserat endless runner-spel utvecklat med React och Phaser 3. Välj din pilot (Alexander, Klas eller Bhing), flyg genom vackra parallax-bakgrunder och försök slå rekorden!

**Spela direkt:** [https://skyadventuregame.klasolsson.se](https://skyadventuregame.klasolsson.se)

## ✨ Funktioner

- **3 Unika Piloter** - Välj mellan Alexander, Klas och Bhing, var och en med sitt eget färgglada flygplan
- **Progressiv Svårighetsgrad** - Spelet blir gradvis snabbare och utmanande ju längre du spelar
- **Dynamiska Fiender** - Moln och robotar med olika hastigheter och rörelsebanor
- **Parallax-bakgrunder** - Fyra lager av vackra bakgrunder som skapar djup och rörelse
- **Partikeleffekter** - Rök från motorn och explosionseffekter
- **Ljudeffekter** - Bakgrundsmusik, motorljud, och SFX för stjärnor och explosioner
- **Top 10 Leaderboard** - Tävla om de bästa poängen med lokalt sparade rekord
- **Responsiv Design** - Fungerar perfekt på både desktop och mobil
- **Touch-styrning** - Intuitiv fingerstyrning där planet följer din touch
- **Fullskärmsläge** - Helskärm för maximal spelupplevelse

## 🎯 Hur Man Spelar

### Desktop (Tangentbord)
- **Piltangenter** - Styr planet upp, ner, vänster och höger
- **Mål** - Samla gula stjärnor för poäng
- **Undvik** - Moln och robotar som kommer flygande!

### Mobil (Touch)
- **Tryck och håll** - Planet flyger mot där du trycker på skärmen
- **Rotera enheten** - Spelet spelas bäst i liggande läge
- **Helskärm** - Tryck på helskärmsknappen för bästa upplevelsen

## 🛠️ Teknologier

- **React** - UI och komponenthantering
- **Phaser 3** - Spelmotorn för rendering och fysik
- **Vite** - Snabb utvecklingsserver och build-verktyg
- **JavaScript (ES6+)** - Modern JavaScript
- **HTML5 Canvas** - För spelrendering
- **CSS3** - Styling och animationer
- **LocalStorage** - För att spara high scores

## 📦 Installation

### Förutsättningar
- Node.js (v16 eller senare)
- npm eller yarn

### Steg för steg

1. **Klona projektet**
   ```bash
   git clone https://github.com/klasolsson81/sky-adventure-game.git
   cd sky-adventure-game
   ```

2. **Installera beroenden**
   ```bash
   npm install
   ```

3. **Starta utvecklingsserver**
   ```bash
   npm run dev
   ```

4. **Öppna i webbläsare**
   - Navigera till `http://localhost:5173`

## 🚀 Bygga för Produktion

```bash
npm run build
```

Detta skapar en optimerad produktionsversion i `dist/`-mappen.

### Förhandsgranska produktionsbygget

```bash
npm run preview
```

## 📁 Projektstruktur

```
sky-adventure-game/
├── Public/                    # Statiska filer
│   ├── images/               # Sprites, bakgrunder, och grafik
│   └── audio/                # Ljudeffekter och musik
├── src/
│   ├── components/
│   │   └── GameComponent.jsx # Phaser-spelcontainer
│   ├── game/
│   │   └── GameScene.js      # Huvudsaklig spellogik
│   ├── App.jsx               # React app och spelstatus
│   ├── main.jsx              # Entry point
│   └── index.css             # Global styling
├── index.html                # HTML-template
├── vite.config.js            # Vite-konfiguration
└── package.json              # Projektberoenden
```

## 🎨 Spelmekanik

### Poängsystem
- **Stjärnor**: +10 poäng per stjärna
- **Överlevnad**: Ju längre du överlever, desto högre poäng

### Svårighetsgrad
- Spelet ökar hastigheten var 3:e sekund
- Fiender spawnar oftare när hastigheten ökar
- Moln rör sig 50% snabbare än robotar

### Spawning
- Stjärnor spawnar i olika mönster (båge, horisontell linje, våg)
- Fiender spawnar i "lanes" för att undvika unfair död
- Dynamiska spawn-intervall baserade på spelhastighet

## 🎵 Ljud och Musik

- **Bakgrundsmusik** - Loopande äventyrsmusik
- **Motorljud** - Kontinuerligt motorljud under flygning
- **Stjärn-SFX** - Bekräftande ljud när du samlar stjärnor
- **Explosions-SFX** - Dramatiskt ljud när du krockar
- **Meny-clicks** - Feedback för knapptryckningar

## 🏆 High Score System

- Top 10 rekordlistan sparas lokalt i webbläsaren
- Visar pilotnamn och poäng
- Aktuell spelomgångs poäng highlightas med guld
- Persistent mellan sessioner via localStorage

## 📱 Mobilanpassning

- **Automatisk orientering** - Varnar om enheten är i porträttläge
- **Touch-optimerad UI** - Stora, lättklickade knappar
- **Responsiv skalning** - Anpassar sig till alla skärmstorlekar
- **Helskärmsläge** - Fullscreen API för immersiv upplevelse

## 🐛 Kända Buggar / Begränsningar

Inga kända buggar för tillfället! Om du hittar något, vänligen öppna en issue.

## 🤝 Bidra

Contributions, issues och feature requests är välkomna!

1. Forka projektet
2. Skapa en feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit dina ändringar (`git commit -m 'Add some AmazingFeature'`)
4. Push till branchen (`git push origin feature/AmazingFeature`)
5. Öppna en Pull Request

## 📝 Licens

Detta projekt är skapat för utbildningssyfte.

## 👨‍💻 Utvecklare

**Klas Olsson**

- GitHub: [@klasolsson81](https://github.com/klasolsson81)
- Webbplats: [https://skyadventuregame.klasolsson.se](https://skyadventuregame.klasolsson.se)

---

## 🙏 Tack Till

- **Claude Code** - AI-assisterad utveckling
- **Phaser 3** - Fantastisk spelmotor
- **React** - Kraftfullt UI-ramverk
- **Vite** - Blixtsnabb utvecklingsmiljö

---

**Gjort med ❤️ och mycket kaffe ☕**

Tack för att du spelar Sky High Adventures! 🎮✨
