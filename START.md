# 🚀 TyperSpace mit Upstash starten

## Problem gelöst: CORS-Blockierung umgangen!

Upstash blockiert direkte Browser-Anfragen. Deshalb läuft jetzt ein **lokaler Proxy-Server**, der die Kommunikation übernimmt.

---

## ⚡ Schnellstart (EINFACH)

Ein Befehl startet **alles** (Proxy + Frontend):

```bash
npm start
```

Das startet:
- ✅ Proxy-Server auf Port **3001**
- ✅ Frontend auf Port **9000** (öffnet automatisch im Browser)

---

## 🔍 Was passiert?

```
Browser (localhost:9000)
    ↓
    ↓ Highscore-Anfragen
    ↓
Proxy-Server (localhost:3001)
    ↓
    ↓ Fügt Authorization hinzu
    ↓
Upstash Redis (adjusted-caiman-48795.upstash.io)
    ↓
    ↓ Speichert in "battleship_db"
    ↓
Key: "typerspace_highscores"
```

**Kein CORS-Problem mehr!** ✅

---

## 🧪 Testen

### 1. Starte das Spiel
```bash
npm start
```

### 2. Prüfe die Logs

**Im Terminal siehst du:**
```
✅ Upstash credentials loaded
   URL: https://adjusted-caiman-48795.upstash.io

🚀 TyperSpace Proxy Server running!
   Local:   http://localhost:3001
   Health:  http://localhost:3001/health
```

**Im Browser (Console F12):**
```
TyperSpace module loaded!
Upstash client configured (via proxy)
HighscoreService initialized with Upstash
```

### 3. Spiele ein Level

Nach dem Spiel solltest du sehen:
```
Highscore saved: 12450 (medium)
✅ SET successful: typerspace_highscores
Saved to Upstash successfully
```

### 4. Prüfe Upstash Console

1. Gehe zu [console.upstash.com](https://console.upstash.com)
2. Wähle `battleship_db`
3. **Data Browser** Tab
4. Suche Key: `typerspace_highscores`
5. **Du solltest jetzt deine Scores sehen!** 🎉

---

## 🛠️ Alternative Startmethoden

### Manuell (zwei Terminals):

**Terminal 1 - Proxy starten:**
```bash
npm run proxy
```

**Terminal 2 - Frontend starten:**
```bash
npm run dev
```

---

## 🔧 Troubleshooting

### Fehler: "Port 3001 already in use"
```bash
# Windows:
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Oder einfach:
# Ändere in server.js: const PORT = 3002
```

### Fehler: "Upstash credentials not found"
```bash
# Prüfe .env Datei:
cat .env

# Sollte enthalten:
UPSTASH_REDIS_REST_URL="https://adjusted-caiman-48795.upstash.io"
UPSTASH_REDIS_REST_TOKEN="Ab6bAAInc..."
```

### Fehler: "Proxy GET/SET failed"
- Prüfe, ob Proxy läuft: http://localhost:3001/health
- Prüfe Upstash Console: Ist battleship_db erreichbar?
- Prüfe Credentials: Sind sie noch gültig?

---

## 📊 Datenstruktur in Upstash

Nach dem ersten Spiel siehst du in Upstash:

**Key:** `typerspace_highscores`

**Value:**
```json
{
  "version": "1.0",
  "lastUpdated": 1739234567890,
  "entries": {
    "easy": [
      {
        "id": "1739234567890_abc123",
        "score": 12450,
        "accuracy": 94,
        "wpm": 52,
        ...
      }
    ],
    "medium": [],
    "hard": [],
    "ultra": []
  }
}
```

---

## ✅ Zusammenfassung

- **Proxy-Server löst CORS-Problem** ✓
- **Ein Befehl startet alles:** `npm start` ✓
- **Alle Highscores werden in Upstash gespeichert** ✓
- **Alle Spieler sehen dieselben Highscores** ✓

---

## 🚀 Los geht's!

```bash
npm start
```

Viel Spaß beim Spielen! 🎮
