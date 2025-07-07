export interface Category {
  id: string
  name: string
  description: string
  icon: string
  color: string
  subcategories?: Category[]
}

export interface AccessibilityFeature {
  id: string
  name: string
  description: string
  icon: string
  ratingKey: keyof AccessibilityRatings
}

export interface AccessibilityRatings {
  wheelchair_access: number
  entrance_access: number
  bathroom_access: number
  table_height: number
  staff_helpfulness: number
}

// Hauptkategorien für Ortstypen
export const placeCategories: Category[] = [
  {
    id: "restaurants",
    name: "Restaurants & Gastronomie",
    description: "Restaurants, Cafés, Bars und andere gastronomische Betriebe",
    icon: "🍽️",
    color: "#FF6B6B",
    subcategories: [
      {
        id: "restaurants_fine_dining",
        name: "Gehobene Restaurants",
        description: "Fine Dining und gehobene Gastronomie",
        icon: "🍷",
        color: "#FF6B6B"
      },
      {
        id: "restaurants_casual",
        name: "Casual Dining",
        description: "Familienrestaurants und legere Restaurants",
        icon: "🍕",
        color: "#FF6B6B"
      },
      {
        id: "cafes",
        name: "Cafés & Bäckereien",
        description: "Kaffeehäuser, Cafés und Bäckereien",
        icon: "☕",
        color: "#FF6B6B"
      },
      {
        id: "fast_food",
        name: "Fast Food",
        description: "Schnellrestaurants und Imbisse",
        icon: "🍔",
        color: "#FF6B6B"
      },
      {
        id: "bars_pubs",
        name: "Bars & Kneipen",
        description: "Bars, Kneipen und Nachtlokale",
        icon: "🍻",
        color: "#FF6B6B"
      }
    ]
  },
  {
    id: "healthcare",
    name: "Gesundheitswesen",
    description: "Medizinische Einrichtungen und Gesundheitsdienste",
    icon: "🏥",
    color: "#4ECDC4",
    subcategories: [
      {
        id: "hospitals",
        name: "Krankenhäuser",
        description: "Allgemeine und spezialisierte Krankenhäuser",
        icon: "🏥",
        color: "#4ECDC4"
      },
      {
        id: "clinics",
        name: "Praxen & Kliniken",
        description: "Arztpraxen und ambulante Kliniken",
        icon: "👩‍⚕️",
        color: "#4ECDC4"
      },
      {
        id: "pharmacies",
        name: "Apotheken",
        description: "Apotheken und Sanitätshäuser",
        icon: "💊",
        color: "#4ECDC4"
      },
      {
        id: "therapy",
        name: "Therapiezentren",
        description: "Physiotherapie, Ergotherapie und andere Therapien",
        icon: "🤲",
        color: "#4ECDC4"
      },
      {
        id: "dental",
        name: "Zahnmedizin",
        description: "Zahnarztpraxen und Kieferorthopädie",
        icon: "🦷",
        color: "#4ECDC4"
      }
    ]
  },
  {
    id: "shopping",
    name: "Einkaufen",
    description: "Geschäfte, Märkte und Einkaufszentren",
    icon: "🛍️",
    color: "#45B7D1",
    subcategories: [
      {
        id: "supermarkets",
        name: "Supermärkte",
        description: "Lebensmittelmärkte und Discounter",
        icon: "🛒",
        color: "#45B7D1"
      },
      {
        id: "shopping_centers",
        name: "Einkaufszentren",
        description: "Shopping-Center und Kaufhäuser",
        icon: "🏬",
        color: "#45B7D1"
      },
      {
        id: "clothing",
        name: "Bekleidung",
        description: "Kleidungsgeschäfte und Boutiquen",
        icon: "👕",
        color: "#45B7D1"
      },
      {
        id: "electronics",
        name: "Elektronik",
        description: "Elektronikfachmärkte und Technikgeschäfte",
        icon: "📱",
        color: "#45B7D1"
      },
      {
        id: "specialty_stores",
        name: "Fachgeschäfte",
        description: "Spezialisierte Einzelhandelsgeschäfte",
        icon: "🏪",
        color: "#45B7D1"
      }
    ]
  },
  {
    id: "education",
    name: "Bildung & Lernen",
    description: "Bildungseinrichtungen und Lernorte",
    icon: "📚",
    color: "#96CEB4",
    subcategories: [
      {
        id: "schools",
        name: "Schulen",
        description: "Grund-, Haupt-, Real- und Gesamtschulen",
        icon: "🏫",
        color: "#96CEB4"
      },
      {
        id: "universities",
        name: "Hochschulen",
        description: "Universitäten und Fachhochschulen",
        icon: "🎓",
        color: "#96CEB4"
      },
      {
        id: "libraries",
        name: "Bibliotheken",
        description: "Öffentliche und wissenschaftliche Bibliotheken",
        icon: "📖",
        color: "#96CEB4"
      },
      {
        id: "museums",
        name: "Museen",
        description: "Museen und Ausstellungshäuser",
        icon: "🏛️",
        color: "#96CEB4"
      },
      {
        id: "training_centers",
        name: "Bildungszentren",
        description: "Weiterbildungs- und Schulungszentren",
        icon: "📋",
        color: "#96CEB4"
      }
    ]
  },
  {
    id: "transportation",
    name: "Verkehr & Transport",
    description: "Öffentliche Verkehrsmittel und Verkehrsknotenpunkte",
    icon: "🚇",
    color: "#FECA57",
    subcategories: [
      {
        id: "train_stations",
        name: "Bahnhöfe",
        description: "Bahnhöfe und S-Bahn-Stationen",
        icon: "🚄",
        color: "#FECA57"
      },
      {
        id: "bus_stops",
        name: "Bushaltestellen",
        description: "Bus- und Straßenbahnhaltestellen",
        icon: "🚌",
        color: "#FECA57"
      },
      {
        id: "metro_stations",
        name: "U-Bahn-Stationen",
        description: "U-Bahn und Metro-Stationen",
        icon: "🚇",
        color: "#FECA57"
      },
      {
        id: "airports",
        name: "Flughäfen",
        description: "Flughäfen und Terminals",
        icon: "✈️",
        color: "#FECA57"
      },
      {
        id: "parking",
        name: "Parkplätze",
        description: "Parkplätze und Parkhäuser",
        icon: "🅿️",
        color: "#FECA57"
      }
    ]
  },
  {
    id: "accommodation",
    name: "Unterkunft",
    description: "Hotels, Pensionen und andere Unterkünfte",
    icon: "🏨",
    color: "#A8E6CF",
    subcategories: [
      {
        id: "hotels",
        name: "Hotels",
        description: "Hotels aller Kategorien",
        icon: "🏨",
        color: "#A8E6CF"
      },
      {
        id: "hostels",
        name: "Hostels & Pensionen",
        description: "Jugendherbergen und Pensionen",
        icon: "🏠",
        color: "#A8E6CF"
      },
      {
        id: "vacation_rentals",
        name: "Ferienwohnungen",
        description: "Ferienwohnungen und Apartments",
        icon: "🏡",
        color: "#A8E6CF"
      }
    ]
  },
  {
    id: "entertainment",
    name: "Unterhaltung & Freizeit",
    description: "Freizeiteinrichtungen und Unterhaltung",
    icon: "🎭",
    color: "#DDA0DD",
    subcategories: [
      {
        id: "cinemas",
        name: "Kinos",
        description: "Kinos und Filmtheater",
        icon: "🎬",
        color: "#DDA0DD"
      },
      {
        id: "theaters",
        name: "Theater",
        description: "Theater und Opernhäuser",
        icon: "🎭",
        color: "#DDA0DD"
      },
      {
        id: "sports_facilities",
        name: "Sporteinrichtungen",
        description: "Fitnessstudios, Schwimmbäder und Sportzentren",
        icon: "🏋️",
        color: "#DDA0DD"
      },
      {
        id: "parks",
        name: "Parks & Erholung",
        description: "Parks, Gärten und Erholungsgebiete",
        icon: "🌳",
        color: "#DDA0DD"
      },
      {
        id: "amusement",
        name: "Vergnügung",
        description: "Freizeitparks und Spielhallen",
        icon: "🎢",
        color: "#DDA0DD"
      }
    ]
  },
  {
    id: "services",
    name: "Dienstleistungen",
    description: "Öffentliche und private Dienstleistungen",
    icon: "🏛️",
    color: "#FFB347",
    subcategories: [
      {
        id: "government",
        name: "Behörden",
        description: "Ämter und Behörden",
        icon: "🏛️",
        color: "#FFB347"
      },
      {
        id: "banks",
        name: "Banken",
        description: "Banken und Sparkassen",
        icon: "🏦",
        color: "#FFB347"
      },
      {
        id: "post_offices",
        name: "Post",
        description: "Postfilialen und Paketshops",
        icon: "📮",
        color: "#FFB347"
      },
      {
        id: "beauty_services",
        name: "Beauty & Wellness",
        description: "Friseure, Kosmetik und Wellness",
        icon: "💅",
        color: "#FFB347"
      },
      {
        id: "repair_services",
        name: "Reparaturdienste",
        description: "Werkstätten und Reparaturservices",
        icon: "🔧",
        color: "#FFB347"
      }
    ]
  },
  {
    id: "religious",
    name: "Religiöse Stätten",
    description: "Kirchen, Moscheen, Synagogen und andere religiöse Orte",
    icon: "⛪",
    color: "#87CEEB",
    subcategories: [
      {
        id: "churches",
        name: "Kirchen",
        description: "Christliche Kirchen aller Konfessionen",
        icon: "⛪",
        color: "#87CEEB"
      },
      {
        id: "mosques",
        name: "Moscheen",
        description: "Islamische Gebetsstätten",
        icon: "🕌",
        color: "#87CEEB"
      },
      {
        id: "synagogues",
        name: "Synagogen",
        description: "Jüdische Gemeindezentren",
        icon: "🕍",
        color: "#87CEEB"
      },
      {
        id: "other_religious",
        name: "Andere religiöse Stätten",
        description: "Buddhistische, hinduistische und andere religiöse Orte",
        icon: "🛕",
        color: "#87CEEB"
      }
    ]
  }
]

// Zugänglichkeits-Features
export const accessibilityFeatures: AccessibilityFeature[] = [
  {
    id: "wheelchair_access",
    name: "Rollstuhlzugang",
    description: "Zugänglichkeit für Rollstuhlfahrer",
    icon: "♿",
    ratingKey: "wheelchair_access"
  },
  {
    id: "entrance_access",
    name: "Eingangsbereich",
    description: "Barrierefreier Eingang ohne Stufen oder mit Rampe",
    icon: "🚪",
    ratingKey: "entrance_access"
  },
  {
    id: "bathroom_access",
    name: "Toiletten",
    description: "Behindertengerechte Toiletten",
    icon: "🚻",
    ratingKey: "bathroom_access"
  },
  {
    id: "table_height",
    name: "Tischhöhe",
    description: "Angemessene Tischhöhe für Rollstuhlfahrer",
    icon: "🪑",
    ratingKey: "table_height"
  },
  {
    id: "staff_helpfulness",
    name: "Personal",
    description: "Hilfsbereitschaft und Sensibilität des Personals",
    icon: "👥",
    ratingKey: "staff_helpfulness"
  }
]

// Behinderungsarten für personalisierte Filterung
export const disabilityTypes: Category[] = [
  {
    id: "mobility",
    name: "Gehbehinderung",
    description: "Einschränkungen der Gehfähigkeit, Rollstuhlnutzer",
    icon: "♿",
    color: "#FF6B6B"
  },
  {
    id: "visual",
    name: "Sehbehinderung",
    description: "Sehbehinderung und Blindheit",
    icon: "👁️",
    color: "#4ECDC4"
  },
  {
    id: "hearing",
    name: "Hörbehinderung",
    description: "Hörbehinderung und Gehörlosigkeit",
    icon: "👂",
    color: "#45B7D1"
  },
  {
    id: "cognitive",
    name: "Kognitive Beeinträchtigung",
    description: "Lern- und geistige Behinderungen",
    icon: "🧠",
    color: "#96CEB4"
  },
  {
    id: "multiple",
    name: "Mehrfachbehinderung",
    description: "Kombination verschiedener Behinderungen",
    icon: "🤝",
    color: "#FECA57"
  }
]

// Prioritätsstufen für Zugänglichkeit
export const accessibilityPriorities = [
  {
    id: "essential",
    name: "Unverzichtbar",
    description: "Muss vorhanden sein",
    color: "#FF4757",
    weight: 3
  },
  {
    id: "important",
    name: "Wichtig",
    description: "Sollte vorhanden sein",
    color: "#FFA502",
    weight: 2
  },
  {
    id: "nice_to_have",
    name: "Wünschenswert",
    description: "Wäre schön zu haben",
    color: "#2ED573",
    weight: 1
  }
]

// Hilfsfunktionen
export const getCategoryById = (id: string): Category | undefined => {
  const searchInCategories = (categories: Category[]): Category | undefined => {
    for (const category of categories) {
      if (category.id === id) return category
      if (category.subcategories) {
        const found = searchInCategories(category.subcategories)
        if (found) return found
      }
    }
    return undefined
  }
  return searchInCategories(placeCategories)
}

export const getAllCategories = (): Category[] => {
  const flattenCategories = (categories: Category[]): Category[] => {
    const result: Category[] = []
    for (const category of categories) {
      result.push(category)
      if (category.subcategories) {
        result.push(...flattenCategories(category.subcategories))
      }
    }
    return result
  }
  return flattenCategories(placeCategories)
}

export const getAccessibilityScore = (ratings: Partial<AccessibilityRatings>): number => {
  const values = Object.values(ratings).filter(rating => rating !== undefined && rating > 0) as number[]
  if (values.length === 0) return 0
  return values.reduce((sum, rating) => sum + rating, 0) / values.length
}

export const getCategoryColor = (categoryId: string): string => {
  const category = getCategoryById(categoryId)
  return category?.color || "#6B7280"
}

export const filterPlacesByCategory = (places: any[], categoryIds: string[]): any[] => {
  if (categoryIds.length === 0) return places
  
  return places.filter(place => {
    // If place has no categories, don't include it
    if (!place.categories || !Array.isArray(place.categories)) {
      return false
    }
    
    // Check if any of the selected category IDs match any of the place's categories
    return categoryIds.some(selectedCategoryId => 
      place.categories.includes(selectedCategoryId)
    )
  })
}