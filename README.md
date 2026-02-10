# TyperSpace - Game Development Project

Eine vollständige Spieleentwicklungsumgebung basierend auf **TypeScript** und **Phaser 3**.

## 📋 Projektstruktur

```
src/
├── index.ts              # Einstiegspunkt der Anwendung
├── scenes/               # Spielszenen
│   ├── BootScene.ts      # Initialisierungsszene
│   └── MainScene.ts      # Hauptspielszene
├── objects/              # Spielobjekte und Sprites
└── utils/                # Hilfsfunktionen und Tools
public/
├── index.html            # HTML-Einstiegspunkt
└── assets/               # Spielressourcen (Bilder, Sounds, etc.)
```

## 🚀 Erste Schritte

### Installation
```bash
npm install
```

### Entwicklung starten
```bash
npm run dev
```

Das Spiel ist dann verfügbar unter `http://localhost:8080`

### Für Production bauen
```bash
npm run build
```

## 🛠️ Verfügbare Scripts

- `npm run dev` - Entwicklungsserver mit Hot-Reload starten
- `npm run build` - Für Production optimiert bauen
- `npm start` - Alias für `npm run dev`
- `npm test` - Tests ausführen (Jest)

## 🎮 Spieleentwicklung

### Szenen hinzufügen
Neue Szenen können im `src/scenes/` Verzeichnis erstellt werden:

```typescript
export class MyScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MyScene' });
    }

    create() {
        // Initialisierungscode
    }

    update() {
        // Update-Logik jeden Frame
    }
}
```

### Spielobjekte erstellen
Alle Spielobjekte (Sprites, Gruppen, etc.) sollten im `src/objects/` Verzeichnis definiert werden.

### Hilfsfunktionen
Wiederverwendbare Funktionen können im `src/utils/` Verzeichnis erstellt werden.

## 📚 Resources

- [Phaser 3 Dokumentation](https://phaser.io/docs/2.13.3)
- [TypeScript Dokumentation](https://www.typescriptlang.org/docs/)
- [Webpack Dokumentation](https://webpack.js.org/docs/)

## 📝 Lizenz

MIT
