# 🔍 Upstash Debug Guide

## Problem: Keine Daten auf dem Server sichtbar

### Schritt 1: Browser-Console öffnen

1. Starte das Spiel: `npm start`
2. Öffne Browser-Console: `F12` → Console Tab
3. Schau nach diesen Log-Nachrichten:

```
TyperSpace module loaded!
HighscoreService initialized with Upstash
```

**Wenn du siehst:** `HighscoreService initialized with localStorage`
→ **Problem:** Upstash-Credentials werden nicht geladen!

---

### Schritt 2: Upstash-Verbindung testen

In der Browser-Console, führe aus:

```javascript
await testUpstash()
```

Dies wird die Verbindung zu Upstash testen und detaillierte Fehler anzeigen.

**Mögliche Fehler:**

#### ❌ CORS Error
```
Access to fetch at 'https://adjusted-caiman-48795.upstash.io'
has been blocked by CORS policy
```

**Ursache:** Upstash blockiert direkte Browser-Anfragen aus Sicherheitsgründen.

**Lösung:** Du brauchst einen Backend-Proxy! Siehe unten.

#### ❌ "Upstash is not configured"
```
❌ Upstash is not configured. Check your .env file.
```

**Ursache:** Environment-Variablen werden nicht geladen.

**Lösung:**
1. Prüfe ob `.env` Datei existiert: `ls .env`
2. Prüfe Inhalt: `cat .env`
3. Rebuild: `npm run build`

---

### Schritt 3: Credentials prüfen

```bash
# In PowerShell/Terminal:
cat .env
```

Du solltest sehen:
```
UPSTASH_REDIS_REST_URL="https://adjusted-caiman-48795.upstash.io"
UPSTASH_REDIS_REST_TOKEN="Ab6bAAIncDIy..."
```

---

## 🛠️ Lösungen

### Lösung 1: CORS Problem beheben (EMPFOHLEN)

Upstash blockiert direkte Browser-Anfragen. Du brauchst einen Backend-Proxy.

**Option A: Vercel/Netlify Edge Functions**
- Erstelle eine Serverless Function
- Die Function macht die Upstash-Anfragen serverseitig
- Frontend ruft deine Function auf

**Option B: Einfacher Node.js-Proxy**
Ich kann einen minimalen Express-Server erstellen, der:
1. Auf Port 3001 läuft
2. Frontend-Anfragen empfängt
3. Diese an Upstash weiterleitet
4. Ergebnis zurückgibt

**Option C: Upstash REST-Proxy in der Upstash-Konsole aktivieren**
Manche Upstash-Pläne haben einen eingebauten CORS-Proxy.

---

### Lösung 2: Nur localStorage verwenden

Wenn du erst mal lokal testen willst:

1. Lösche/benenne `.env` um
2. Rebuild: `npm run build`
3. Das System fällt automatisch auf localStorage zurück

---

## 🧪 Manuelle Tests

### In Upstash Console:

1. Gehe zu [console.upstash.com](https://console.upstash.com)
2. Wähle `battleship_db`
3. Gehe zu **Data Browser**
4. Klicke **Add Key**
5. Setze:
   - Key: `test_typerspace`
   - Value: `{"test": "works!"}`
6. Speichern

### Im Browser:

```javascript
// Test GET direkt
fetch('https://adjusted-caiman-48795.upstash.io/get/test_typerspace', {
    headers: {
        'Authorization': 'Bearer Ab6bAAIncDIyOWU4YThmMzMwMzk0M2NkOTdiNThhZTlkMDYwYmM5MHAyNDg3OTU'
    }
})
.then(r => r.json())
.then(d => console.log('Upstash response:', d))
.catch(e => console.error('Error:', e));
```

Wenn dies einen **CORS-Fehler** wirft → Du brauchst einen Backend-Proxy!

---

## 💡 Empfohlene nächste Schritte

Ich empfehle **Option B: Node.js-Proxy** (schnell & einfach):

1. Ich erstelle einen minimalen Express-Server (`server.js`)
2. Du startest ihn mit `node server.js` (parallel zu `npm start`)
3. Frontend kommuniziert mit dem Proxy
4. Proxy kommuniziert mit Upstash
5. **Kein CORS-Problem mehr!**

Soll ich das für dich erstellen?

---

## 📞 Debug-Checkliste

- [ ] `.env` Datei existiert
- [ ] Credentials sind korrekt
- [ ] `npm run build` erfolgreich
- [ ] Console zeigt "HighscoreService initialized with Upstash"
- [ ] `testUpstash()` läuft ohne Fehler
- [ ] Upstash Console zeigt den Key `typerspace_highscores`
