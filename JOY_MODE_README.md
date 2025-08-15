# Joy Mode für AbleCheck 🎮✨

Das Joy Mode Feature fügt Gamification-Elemente zur AbleCheck App hinzu, um das Bewerten von Barrierefreiheit zu einem spielerischen Erlebnis zu machen.

## Features

### 🎯 Punktesystem
- **Standard-Bewertung**: +20 Punkte
- **Check-In Bewertung**: +50 Punkte (mit Standortverifikation)

### 🏆 Achievement System
Das System enthält folgende Achievements:

1. **Erste Bewertung** (10 Punkte)
   - Deine erste Bewertung für die Barrierefreiheit

2. **Hilfreicher Helfer** (50 Punkte)
   - 5 Bewertungen abgegeben

3. **Barrierefreiheits-Champion** (100 Punkte)
   - 10 Bewertungen abgegeben

4. **Check-In Meister** (75 Punkte)
   - 5 Check-In Bewertungen mit Standortverifikation

5. **Community-Builder** (250 Punkte)
   - 25 Bewertungen abgegeben

### 📈 Level System
- **Level 1**: 0-99 Punkte
- **Level 2**: 100-199 Punkte
- **Level 3**: 200-299 Punkte
- usw. (alle 100 Punkte ein neues Level)

### 🎊 Visuelle Effekte
- **Animierte Benachrichtigungen** für Punkte, Achievements und Level-Ups
- **Konfetti-Animationen** bei besonderen Erfolgen
- **Fortschrittsbalken** für Level und Achievement-Progress
- **Farbkodierte UI** mit Gradients und Icons

## Technische Implementation

### Komponenten
- `joy-mode.tsx` - Haupt-Joy-Mode Dashboard
- `joy-mode-notification.tsx` - Benachrichtigungssystem mit Animationen
- `useJoyMode()` Hook - für Integration in andere Komponenten

### Datenspeicherung
- Lokale Speicherung mit `localStorage`
- Persistente Stats zwischen Sitzungen
- Automatische Achievement-Überprüfung

### Integration
Das Joy Mode ist in folgende Bereiche integriert:
- **Hauptseite**: Joy Mode Dashboard mit Ein/Aus-Schalter
- **Place-Bewertungsseite**: Automatische Punktevergabe bei Bewertungen
- **Globale Benachrichtigungen**: Toast-Notifications für alle Erfolge

## Aktivierung

1. Auf der Hauptseite das Joy Mode Dashboard finden
2. Den Schalter "Joy Mode aktivieren" einschalten
3. Bewertungen abgeben und Punkte sammeln!

## Entwicklung

### Debug-Funktionen (nur in Development)
- Test-Buttons zum manuellen Hinzufügen von Punkten
- Stats zurücksetzen
- Achievement-Testing

### Dependencies
- `framer-motion`: Für flüssige Animationen
- `lucide-react`: Icons
- `@radix-ui/*`: UI-Komponenten

## Zukünftige Erweiterungen

Mögliche weitere Features:
- **Streaks**: Bonus für tägliche Bewertungen
- **Leaderboards**: Community-Vergleiche
- **Badges**: Spezielle Auszeichnungen
- **Soziale Features**: Teilen von Achievements
- **Saison-Events**: Zeitlich begrenzte Challenges

---

*Joy Mode macht das Helfen bei der Barrierefreiheit zu einem spielerischen und motivierenden Erlebnis! 🌟*