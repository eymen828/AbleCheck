# AbleCheck Kategoriensystem

Ein umfassendes Kategoriensystem für die AbleCheck-App, das speziell für Menschen mit Behinderungen entwickelt wurde, um barrierefreie Orte einfach zu finden und zu bewerten.

## Übersicht

Das Kategoriensystem besteht aus mehreren Komponenten:

1. **Ortskategorien** - Verschiedene Arten von Einrichtungen und Orten
2. **Barrierefreiheits-Features** - Spezifische Zugänglichkeitsmerkmale
3. **Behinderungsarten** - Kategorien für verschiedene Behinderungstypen
4. **Prioritätsstufen** - Wichtigkeitsbewertung für Barrierefreiheit

## 🏢 Hauptkategorien für Ortstypen

### 1. Restaurants & Gastronomie 🍽️
- **Gehobene Restaurants** 🍷 - Fine Dining und gehobene Gastronomie
- **Casual Dining** 🍕 - Familienrestaurants und legere Restaurants
- **Cafés & Bäckereien** ☕ - Kaffeehäuser, Cafés und Bäckereien
- **Fast Food** 🍔 - Schnellrestaurants und Imbisse
- **Bars & Kneipen** 🍻 - Bars, Kneipen und Nachtlokale

### 2. Gesundheitswesen 🏥
- **Krankenhäuser** 🏥 - Allgemeine und spezialisierte Krankenhäuser
- **Praxen & Kliniken** 👩‍⚕️ - Arztpraxen und ambulante Kliniken
- **Apotheken** 💊 - Apotheken und Sanitätshäuser
- **Therapiezentren** 🤲 - Physiotherapie, Ergotherapie und andere Therapien
- **Zahnmedizin** 🦷 - Zahnarztpraxen und Kieferorthopädie

### 3. Einkaufen 🛍️
- **Supermärkte** 🛒 - Lebensmittelmärkte und Discounter
- **Einkaufszentren** 🏬 - Shopping-Center und Kaufhäuser
- **Bekleidung** 👕 - Kleidungsgeschäfte und Boutiquen
- **Elektronik** 📱 - Elektronikfachmärkte und Technikgeschäfte
- **Fachgeschäfte** 🏪 - Spezialisierte Einzelhandelsgeschäfte

### 4. Bildung & Lernen 📚
- **Schulen** 🏫 - Grund-, Haupt-, Real- und Gesamtschulen
- **Hochschulen** 🎓 - Universitäten und Fachhochschulen
- **Bibliotheken** 📖 - Öffentliche und wissenschaftliche Bibliotheken
- **Museen** 🏛️ - Museen und Ausstellungshäuser
- **Bildungszentren** 📋 - Weiterbildungs- und Schulungszentren

### 5. Verkehr & Transport 🚇
- **Bahnhöfe** 🚄 - Bahnhöfe und S-Bahn-Stationen
- **Bushaltestellen** 🚌 - Bus- und Straßenbahnhaltestellen
- **U-Bahn-Stationen** 🚇 - U-Bahn und Metro-Stationen
- **Flughäfen** ✈️ - Flughäfen und Terminals
- **Parkplätze** 🅿️ - Parkplätze und Parkhäuser

### 6. Unterkunft 🏨
- **Hotels** 🏨 - Hotels aller Kategorien
- **Hostels & Pensionen** 🏠 - Jugendherbergen und Pensionen
- **Ferienwohnungen** 🏡 - Ferienwohnungen und Apartments

### 7. Unterhaltung & Freizeit 🎭
- **Kinos** 🎬 - Kinos und Filmtheater
- **Theater** 🎭 - Theater und Opernhäuser
- **Sporteinrichtungen** 🏋️ - Fitnessstudios, Schwimmbäder und Sportzentren
- **Parks & Erholung** 🌳 - Parks, Gärten und Erholungsgebiete
- **Vergnügung** 🎢 - Freizeitparks und Spielhallen

### 8. Dienstleistungen 🏛️
- **Behörden** 🏛️ - Ämter und Behörden
- **Banken** 🏦 - Banken und Sparkassen
- **Post** 📮 - Postfilialen und Paketshops
- **Beauty & Wellness** 💅 - Friseure, Kosmetik und Wellness
- **Reparaturdienste** 🔧 - Werkstätten und Reparaturservices

### 9. Religiöse Stätten ⛪
- **Kirchen** ⛪ - Christliche Kirchen aller Konfessionen
- **Moscheen** 🕌 - Islamische Gebetsstätten
- **Synagogen** 🕍 - Jüdische Gemeindezentren
- **Andere religiöse Stätten** 🛕 - Buddhistische, hinduistische und andere religiöse Orte

## ♿ Barrierefreiheits-Features

### Bewertungskategorien
1. **Rollstuhlzugang** ♿ - Zugänglichkeit für Rollstuhlfahrer
2. **Eingangsbereich** 🚪 - Barrierefreier Eingang ohne Stufen oder mit Rampe
3. **Toiletten** 🚻 - Behindertengerechte Toiletten
4. **Tischhöhe** 🪑 - Angemessene Tischhöhe für Rollstuhlfahrer
5. **Personal** 👥 - Hilfsbereitschaft und Sensibilität des Personals

## 🧑‍🦽 Behinderungsarten

### Personalisierte Filterung
1. **Gehbehinderung** ♿ - Einschränkungen der Gehfähigkeit, Rollstuhlnutzer
2. **Sehbehinderung** 👁️ - Sehbehinderung und Blindheit
3. **Hörbehinderung** 👂 - Hörbehinderung und Gehörlosigkeit
4. **Kognitive Beeinträchtigung** 🧠 - Lern- und geistige Behinderungen
5. **Mehrfachbehinderung** 🤝 - Kombination verschiedener Behinderungen

## 📊 Prioritätsstufen für Zugänglichkeit

### Wichtigkeitsbewertung
1. **Unverzichtbar** 🔴 - Muss vorhanden sein (Gewichtung: 3)
2. **Wichtig** 🟡 - Sollte vorhanden sein (Gewichtung: 2)
3. **Wünschenswert** 🟢 - Wäre schön zu haben (Gewichtung: 1)

## 🛠️ Technische Implementierung

### Dateien erstellt:
- `lib/categories.ts` - Hauptdefinitionen und Hilfsfunktionen
- `components/category-selector.tsx` - React-Komponente für Kategorienauswahl
- `category-system-documentation.md` - Diese Dokumentation

### Verfügbare Funktionen:

```typescript
// Kategorie anhand ID finden
getCategoryById(id: string): Category | undefined

// Alle Kategorien (flach) abrufen
getAllCategories(): Category[]

// Barrierefreiheits-Score berechnen
getAccessibilityScore(ratings: Partial<AccessibilityRatings>): number

// Kategorienfarbe abrufen
getCategoryColor(categoryId: string): string

// Orte nach Kategorien filtern
filterPlacesByCategory(places: any[], categoryIds: string[]): any[]
```

### Interfaces:

```typescript
interface Category {
  id: string
  name: string
  description: string
  icon: string
  color: string
  subcategories?: Category[]
}

interface AccessibilityFeature {
  id: string
  name: string
  description: string
  icon: string
  ratingKey: keyof AccessibilityRatings
}

interface AccessibilityRatings {
  wheelchair_access: number
  entrance_access: number
  bathroom_access: number
  table_height: number
  staff_helpfulness: number
}
```

## 🎯 Verwendung

### In der AbleCheck-App integrieren:

1. **Such- und Filterkomponente erweitern:**
```typescript
import { CategorySelector } from "@/components/category-selector"
import { filterPlacesByCategory } from "@/lib/categories"

// In der Komponente verwenden
<CategorySelector
  selectedCategories={selectedCategories}
  onCategoryChange={setSelectedCategories}
/>

// Orte filtern
const filteredPlaces = filterPlacesByCategory(places, selectedCategories)
```

2. **Barrierefreiheits-Score anzeigen:**
```typescript
import { getAccessibilityScore } from "@/lib/categories"

const score = getAccessibilityScore({
  wheelchair_access: 4,
  entrance_access: 5,
  bathroom_access: 3,
  table_height: 4,
  staff_helpfulness: 5
})
```

## 🚀 Erweiterungsmöglichkeiten

### Zukünftige Features:
1. **Personalisierte Empfehlungen** basierend auf Behinderungstyp
2. **KI-gestützte Kategorisierung** neuer Orte
3. **Community-basierte Kategorienerweiterung**
4. **Mehrsprachige Kategorien**
5. **Lokale Anpassungen** für verschiedene Regionen

### Datenbank-Erweiterungen:
```sql
-- Kategorien-Tabelle
CREATE TABLE place_categories (
  id SERIAL PRIMARY KEY,
  place_id UUID REFERENCES places(id),
  category_id VARCHAR(50) NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Benutzer-Präferenzen
CREATE TABLE user_accessibility_preferences (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  disability_types VARCHAR(50)[] DEFAULT '{}',
  priority_features VARCHAR(50)[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 📱 Barrierefreiheit der Komponenten

Das Kategoriensystem wurde mit Fokus auf Barrierefreiheit entwickelt:

- **Screen Reader Kompatibilität** - Alle Kategorien haben semantische Labels
- **Tastaturnavigation** - Vollständig mit Tastatur bedienbar
- **Farbkontraste** - Ausreichende Kontraste für alle Kategorien
- **Touch-optimiert** - Große Touch-Targets für mobile Geräte
- **Sprachausgabe** - Integration mit der Accessibility-API der App

## 📈 Nutzen für Benutzer

### Für Menschen mit Behinderungen:
- **Schnellere Orientierung** durch klare Kategorisierung
- **Personalisierte Suche** nach relevanten Kriterien
- **Zuverlässige Bewertungen** von Barrierefreiheit
- **Community-getriebene Inhalte** von anderen Betroffenen

### Für Betreiber von Einrichtungen:
- **Sichtbarkeit** ihrer Barrierefreiheitsbemühungen
- **Feedback** zur Verbesserung der Zugänglichkeit
- **Zertifizierung** durch Community-Bewertungen

### Für die Gesellschaft:
- **Bewusstseinsschaffung** für Barrierefreiheit
- **Inklusive Gestaltung** des öffentlichen Raums
- **Datenbasis** für weitere Forschung und Entwicklung

---

*Dieses Kategoriensystem wurde speziell für die AbleCheck-App entwickelt und kann als Grundlage für weitere Accessibility-fokussierte Anwendungen dienen.*