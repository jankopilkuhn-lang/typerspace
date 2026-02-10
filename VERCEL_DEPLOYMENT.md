# 🚀 TyperSpace auf Vercel deployen

## Voraussetzungen

- Vercel Account (kostenlos): https://vercel.com/signup
- Vercel CLI installiert (optional): `npm i -g vercel`
- Upstash Redis Datenbank (bereits vorhanden: `battleship_db`)

---

## 📝 Schritt-für-Schritt Anleitung

### Option 1: Deployment über Vercel Dashboard (Empfohlen)

#### 1. GitHub Repository pushen
```bash
git add .
git commit -m "Add Vercel serverless functions for deployment"
git push
```

#### 2. Projekt zu Vercel importieren
1. Gehe zu: https://vercel.com/new
2. Klicke auf **"Import Git Repository"**
3. Wähle dein **TyperSpace** Repository aus
4. Klicke auf **"Import"**

#### 3. Environment Variables konfigurieren
Im Vercel Dashboard, **bevor** du deployest:

1. Gehe zu **"Environment Variables"**
2. Füge hinzu:
   ```
   Name: UPSTASH_REDIS_REST_URL
   Value: https://adjusted-caiman-48795.upstash.io
   ```
3. Füge hinzu:
   ```
   Name: UPSTASH_REDIS_REST_TOKEN
   Value: [Dein Token aus .env Datei]
   ```
4. Wähle bei beiden: **Production**, **Preview**, **Development**

#### 4. Build Settings
Vercel erkennt automatisch:
- **Framework Preset**: Other
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### 5. Deploy!
Klicke auf **"Deploy"** 🎉

Vercel wird:
- Dependencies installieren
- Projekt builden
- Serverless Functions erstellen
- Live-URL generieren (z.B. `typerspace.vercel.app`)

---

### Option 2: Deployment über CLI

```bash
# 1. Vercel CLI installieren (falls noch nicht installiert)
npm i -g vercel

# 2. In Vercel einloggen
vercel login

# 3. Projekt deployen
vercel

# Folge den Anweisungen:
# - Set up and deploy? → Yes
# - Which scope? → Dein Account
# - Link to existing project? → No
# - Project name? → typerspace (oder eigener Name)
# - Directory? → ./ (Enter drücken)
# - Override settings? → No

# 4. Environment Variables setzen
vercel env add UPSTASH_REDIS_REST_URL
# Wert eingeben: https://adjusted-caiman-48795.upstash.io

vercel env add UPSTASH_REDIS_REST_TOKEN
# Wert eingeben: [Dein Token aus .env]

# 5. Neu deployen mit Environment Variables
vercel --prod
```

---

## 🧪 Nach dem Deployment testen

### 1. Öffne deine Vercel URL
Zum Beispiel: `https://typerspace.vercel.app`

### 2. Browser Console öffnen (F12)
Du solltest sehen:
```
Upstash client configured (via Vercel proxy)
Proxy URL: /api/redis
```

### 3. Spiele ein Level
- Wähle Schwierigkeitsgrad
- Spiele ein Level
- Gib deinen Namen ein
- Klicke "✓ Speichern"

### 4. Prüfe Logs in Vercel
1. Gehe zu: https://vercel.com/dashboard
2. Wähle dein Projekt
3. Klicke auf "Deployments" → "Functions"
4. Du solltest sehen: `✅ SET successful: typerspace_highscores`

### 5. Prüfe Upstash Console
1. Gehe zu: https://console.upstash.com
2. Wähle `battleship_db`
3. Data Browser → Key: `typerspace_highscores`
4. Dein Score sollte da sein! 🎉

---

## 🔧 Troubleshooting

### Fehler: "Server configuration error"
**Problem**: Environment Variables fehlen

**Lösung**:
```bash
# Über CLI:
vercel env add UPSTASH_REDIS_REST_URL
vercel env add UPSTASH_REDIS_REST_TOKEN
vercel --prod

# Oder im Dashboard:
# Settings → Environment Variables → Add
```

### Fehler: "Module not found"
**Problem**: Dependencies nicht installiert

**Lösung**:
```bash
# Lokal testen:
npm install
npm run build

# Vercel neu deployen:
vercel --prod
```

### API Routen funktionieren nicht
**Problem**: Rewrites in vercel.json falsch

**Lösung**: Prüfe `vercel.json` - sollte `/api/redis/get/:key` haben

---

## 📊 Vercel vs. Lokal

| Feature | Lokal (`npm start`) | Vercel |
|---------|---------------------|--------|
| Proxy | Express Server (Port 3001) | Serverless Functions |
| URL | `localhost:9000` | `*.vercel.app` |
| Upstash | ✓ | ✓ |
| Highscores | ✓ | ✓ |
| Automatische Updates | Nein | Ja (bei Git Push) |

---

## 🔄 Updates deployen

Nach Änderungen am Code:

```bash
# 1. Committen und pushen
git add .
git commit -m "Update feature X"
git push

# Vercel deployed automatisch! 🎉
```

Oder manuell:
```bash
vercel --prod
```

---

## ✅ Erfolgreiches Deployment

Du weißt, dass es funktioniert, wenn:
- ✅ App lädt auf Vercel URL
- ✅ Console zeigt: "Upstash client configured (via Vercel proxy)"
- ✅ Highscores können gespeichert werden
- ✅ Highscores erscheinen in Upstash Console
- ✅ Leaderboard zeigt Scores an

---

## 🚀 Fertig!

Deine App ist jetzt live auf Vercel und kann von überall aufgerufen werden!

**Teile deine Vercel URL:**
`https://typerspace.vercel.app`

Viel Spaß beim Spielen! 🎮
