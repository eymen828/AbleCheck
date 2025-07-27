# 🔔 Push-Benachrichtigungen System

Das AbleCheck Push-Benachrichtigungen System ermöglicht es, Benachrichtigungen an alle registrierten Nutzer zu senden.

## 🚀 Funktionen

### ✅ Implementierte Features

1. **Service Worker** (`/public/sw.js`)
   - Behandelt Push-Events
   - Zeigt Benachrichtigungen an
   - Verwaltet Click-Events

2. **Push-Subscription Management**
   - Nutzer können sich für Benachrichtigungen anmelden
   - Automatische Verwaltung der Subscriptions
   - Speicherung in Supabase-Datenbank

3. **Admin-Panel** (`/push23`)
   - Passwort-geschützter Zugang
   - Senden von Benachrichtigungen an alle Nutzer
   - Anpassbare Titel, Nachricht, Bilder und URLs

4. **Benutzer-Einstellungen**
   - Toggle für Push-Benachrichtigungen im Einstellungsmenü
   - Einfache An-/Abmeldung

## 🔧 Setup-Anleitung

### 1. Datenbank-Tabelle erstellen

Führen Sie das SQL-Skript in Ihrer Supabase-Datenbank aus:

```sql
-- Siehe: scripts/create-push-subscriptions-table.sql
```

### 2. VAPID-Schlüssel generieren (Optional)

Die aktuellen Schlüssel sind bereits funktionsfähig. Für Produktion empfehlen wir neue Schlüssel:

```bash
node -e "const webpush = require('web-push'); const keys = webpush.generateVAPIDKeys(); console.log('Public:', keys.publicKey); console.log('Private:', keys.privateKey);"
```

### 3. Umgebungsvariablen (Empfohlen für Produktion)

```env
VAPID_PUBLIC_KEY=BElOG1JjijoRPzmM1URQieuQAqGIbw5oqRTcpGpgaDIdT5e_q-i8-JlUhQ4W6Rq1AZBkjPgroACYl46lYf08e5o
VAPID_PRIVATE_KEY=dTHO0iAy78Lv-KI8CwdyblaasRYN9m5kU2iFaF66Nnw
PUSH_ADMIN_PASSWORD=push2024admin
```

## 📱 Verwendung

### Für Administratoren

1. **Admin-Panel aufrufen:**
   ```
   https://ihre-domain.com/push23
   ```

2. **Anmelden:**
   - Passwort: `push2024admin`

3. **Benachrichtigung senden:**
   - Titel eingeben (max. 50 Zeichen)
   - Nachricht eingeben (max. 200 Zeichen)
   - Optional: Bild-URL hinzufügen
   - Optional: Ziel-URL hinzufügen
   - "Benachrichtigung senden" klicken

### Für Benutzer

1. **Push-Benachrichtigungen aktivieren:**
   - Einstellungen → Push-Benachrichtigungen
   - Toggle aktivieren
   - Browser-Berechtigung erteilen

2. **Benachrichtigungen erhalten:**
   - Automatisch wenn Admin Nachrichten sendet
   - Klick öffnet die App oder angegebene URL

## 🔐 Sicherheit

### Aktuelle Sicherheitsmaßnahmen

1. **Passwort-Schutz:** Admin-Panel ist passwort-geschützt
2. **Doppelte Authentifizierung:** Passwort in Frontend UND API
3. **RLS-Policies:** Supabase Row Level Security aktiviert
4. **Ungültige Subscriptions:** Automatische Bereinigung

### Empfohlene Verbesserungen für Produktion

1. **Umgebungsvariablen** verwenden statt hardcoded Werte
2. **JWT-basierte Authentifizierung** für Admin-Panel
3. **Rate-Limiting** für API-Endpunkte
4. **IP-Whitelisting** für Admin-Zugang
5. **Audit-Logging** für gesendete Benachrichtigungen

## 🛠️ API-Endpunkte

### `/api/push/subscribe` (POST)
Registriert eine neue Push-Subscription.

```json
{
  "endpoint": "https://...",
  "keys": {
    "p256dh": "...",
    "auth": "..."
  }
}
```

### `/api/push/unsubscribe` (POST)
Entfernt eine Push-Subscription.

```json
{
  "endpoint": "https://..."
}
```

### `/api/push/send` (POST)
Sendet Push-Benachrichtigungen an alle Nutzer.

```json
{
  "title": "Titel",
  "body": "Nachricht",
  "image": "https://example.com/image.jpg",
  "url": "https://example.com/target",
  "adminPassword": "push2024admin"
}
```

## 📊 Funktionsweise

### 1. Subscription-Prozess
```
Nutzer → Berechtigung anfordern → Service Worker registrieren → Subscription erstellen → In DB speichern
```

### 2. Send-Prozess
```
Admin → /push23 → Nachricht eingeben → API-Call → Alle Subscriptions laden → Push-Service → Nutzer
```

### 3. Empfangs-Prozess
```
Push-Service → Service Worker → Benachrichtigung anzeigen → Click → App öffnen
```

## 🔍 Debugging

### Browser-Konsole überprüfen
```javascript
// Service Worker Status
navigator.serviceWorker.ready.then(reg => console.log('SW ready:', reg));

// Push-Manager Status
navigator.serviceWorker.ready.then(reg => 
  reg.pushManager.getSubscription().then(sub => console.log('Subscription:', sub))
);
```

### Häufige Probleme

1. **"Nicht unterstützt"**: Ältere Browser oder HTTP statt HTTPS
2. **Berechtigung verweigert**: Nutzer muss Browser-Einstellungen ändern
3. **Service Worker Fehler**: Cache leeren und neu laden
4. **API-Fehler**: Supabase-Verbindung und Tabelle prüfen

## 📈 Erweiterungsmöglichkeiten

### Geplante Features

1. **Zielgruppen-Targeting**: Nachrichten an spezifische Nutzergruppen
2. **Zeitplanung**: Geplante Benachrichtigungen
3. **Analytics**: Öffnungsraten und Klick-Statistiken
4. **Templates**: Vordefinierte Nachrichtenvorlagen
5. **Mehrsprachigkeit**: Nachrichten in verschiedenen Sprachen

### Technische Verbesserungen

1. **Retry-Mechanismus**: Für fehlgeschlagene Sendevorgänge
2. **Batch-Processing**: Für große Nutzerbasen
3. **Queue-System**: Für hohe Sendelasten
4. **CDN-Integration**: Für Bilder in Benachrichtigungen

## 🚀 Deployment-Checkliste

- [ ] Datenbank-Tabelle erstellt
- [ ] VAPID-Schlüssel konfiguriert
- [ ] Admin-Passwort geändert
- [ ] HTTPS aktiviert (erforderlich für Push-Notifications)
- [ ] Service Worker erreichbar unter `/sw.js`
- [ ] Browser-Kompatibilität getestet
- [ ] Push-Benachrichtigungen im Produktions-Browser getestet

## 📞 Support

Bei Problemen oder Fragen zur Push-Benachrichtigung-Implementierung:

1. Browser-Konsole auf Fehler überprüfen
2. Network-Tab für API-Calls prüfen
3. Supabase-Logs überprüfen
4. Service Worker in den Browser-DevTools überprüfen

---

**Hinweis:** Push-Benachrichtigungen funktionieren nur über HTTPS und in unterstützten Browsern (Chrome, Firefox, Safari, Edge).