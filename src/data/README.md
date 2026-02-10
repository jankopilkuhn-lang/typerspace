# Level-Wörter Verwaltung

Diese Datei erklärt, wie du die Wörter für die verschiedenen Level in TyperSpace pflegst.

## 📝 Wörter bearbeiten

Die Wörter für alle Level werden in der Datei **`level-words.json`** verwaltet.

### Struktur

```json
{
  "levels": {
    "easy": {
      "name": "Einfach",
      "description": "Kurze, einfache Wörter für Anfänger",
      "words": ["Auto", "Haus", ...]
    }
  }
}
```

### Vorhandene Level

- **easy** - Einfache, kurze Wörter (3-5 Buchstaben)
- **medium** - Mittelschwere Wörter (6-10 Buchstaben)
- **hard** - Schwierige, längere Wörter (8-15 Buchstaben)
- **ultra** - Ultra-schwierige Wörter (12+ Buchstaben)

## ✏️ Wörter hinzufügen oder ändern

1. Öffne die Datei `level-words.json`
2. Suche das entsprechende Level (z.B. `"easy"`)
3. Füge Wörter zum `"words"` Array hinzu oder entferne welche
4. Speichere die Datei
5. Starte das Spiel neu oder lade die Seite neu

### Beispiel: Wörter zu "Easy" hinzufügen

```json
{
  "levels": {
    "easy": {
      "name": "Einfach",
      "description": "Kurze, einfache Wörter für Anfänger",
      "words": [
        "Auto",
        "Haus",
        "Boot",    // ← Neues Wort hinzugefügt
        "Zug"      // ← Neues Wort hinzugefügt
      ]
    }
  }
}
```

## ➕ Neues Level hinzufügen

Du kannst auch komplett neue Schwierigkeitsstufen hinzufügen:

```json
{
  "levels": {
    "extreme": {
      "name": "Extrem",
      "description": "Nur für echte Profis!",
      "words": [
        "Donaudampfschifffahrtsgesellschaft",
        "Rindfleischetikettierungsüberwachungsaufgabenübertragungsgesetz"
      ]
    }
  }
}
```

Um das neue Level im Spiel zu verwenden, musst du es in der Szene auswählen:
```typescript
this.game.state.start('Level1Scene', true, false, 'extreme');
```

## 🎯 Tipps für gute Wortlisten

1. **Konsistente Schwierigkeit** - Achte darauf, dass alle Wörter eines Levels ähnlich schwer sind
2. **Abwechslung** - Mische verschiedene Worttypen (Substantive, Verben, etc.)
3. **Keine Duplikate** - Jedes Wort sollte nur einmal pro Level vorkommen
4. **Rechtschreibung** - Achte auf korrekte deutsche Rechtschreibung
5. **Genug Wörter** - Jedes Level sollte mindestens 50 Wörter haben, damit es nicht zu repetitiv wird

## 🔍 JSON-Schema Unterstützung

Die Datei `level-words.schema.json` bietet Autovervollständigung in VS Code:
- Hover über Felder für Beschreibungen
- Automatische Validierung der Struktur
- IntelliSense beim Bearbeiten

## 🛠️ Technische Details

Die Wörter werden in `src/data/words.ts` geladen und über die Funktion `getWordsByDifficulty()` bereitgestellt:

```typescript
import { getWordsByDifficulty } from '../data/words';

const wordList = getWordsByDifficulty('easy');
```

Verfügbare Funktionen:
- `getWordsByDifficulty(difficulty: string)` - Gibt Wortliste für ein Level zurück
- `getAvailableLevels()` - Gibt alle verfügbaren Level-Keys zurück
- `getLevelConfig(difficulty: string)` - Gibt vollständige Level-Konfiguration zurück
