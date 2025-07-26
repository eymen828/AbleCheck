"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"

export type Language = "de" | "tr" | "en"

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Translation dictionaries
const translations = {
  de: {
    // App title and main
    appTitle: "AbleCheck",
    appSubtitle: "Barrierefreiheit bewerten",
    
    // Navigation and buttons
    settings: "Einstellungen",
    review: "Bewertung",
    addReview: "Bewertung hinzufügen",
    firstReview: "Erste Bewertung hinzufügen",
    login: "Anmelden",
    logout: "Abmelden",
    register: "Registrieren",
    loginRegister: "Anmelden / Registrieren",
    
    // Language settings
    language: "Sprache",
    languageGerman: "Deutsch",
    languageTurkish: "Türkçe",
    languageEnglish: "English",
    
    // Settings menu
    appInfo: "App-Infos",
    checkInHelp: "Check-In Hilfe",
    repeatOnboarding: "Onboarding wiederholen",
    editProfile: "Profil bearbeiten",
    accessibility: "Barrierefreiheit",
    theme: "Design",
    
    // Search and filters
    search: "Suchen",
    searchPlaces: "Orte suchen...",
    filters: "Filter",
    
    // Place details
    details: "Details ansehen",
    verified: "Verifiziert",
    reviews: "Bewertungen",
    noPlaces: "Keine Orte gefunden",
    noPlacesDesc: "Versuchen Sie andere Suchbegriffe.",
    noPlacesYet: "Noch keine Orte bewertet.",
    
    // Ratings
    wheelchair: "Rollstuhl",
    entrance: "Eingang",
    bathroom: "WC",
    tables: "Tische",
    staff: "Personal",
  },
  tr: {
    // App title and main
    appTitle: "AbleCheck",
    appSubtitle: "Erişilebilirlik değerlendirme",
    
    // Navigation and buttons
    settings: "Ayarlar",
    review: "Değerlendirme",
    addReview: "Değerlendirme ekle",
    firstReview: "İlk değerlendirmeyi ekle",
    login: "Giriş yap",
    logout: "Çıkış yap",
    register: "Kayıt ol",
    loginRegister: "Giriş yap / Kayıt ol",
    
    // Language settings
    language: "Dil",
    languageGerman: "Deutsch",
    languageTurkish: "Türkçe",
    languageEnglish: "English",
    
    // Settings menu
    appInfo: "Uygulama Bilgisi",
    checkInHelp: "Check-In Yardım",
    repeatOnboarding: "Tanıtımı tekrarla",
    editProfile: "Profili düzenle",
    accessibility: "Erişilebilirlik",
    theme: "Tema",
    
    // Search and filters
    search: "Ara",
    searchPlaces: "Yer ara...",
    filters: "Filtreler",
    
    // Place details
    details: "Detayları gör",
    verified: "Doğrulanmış",
    reviews: "Değerlendirmeler",
    noPlaces: "Yer bulunamadı",
    noPlacesDesc: "Başka arama terimleri deneyin.",
    noPlacesYet: "Henüz değerlendirilmiş yer yok.",
    
    // Ratings
    wheelchair: "Tekerlekli sandalye",
    entrance: "Giriş",
    bathroom: "Tuvalet",
    tables: "Masalar",
    staff: "Personel",
  },
  en: {
    // App title and main
    appTitle: "AbleCheck",
    appSubtitle: "Rate accessibility",
    
    // Navigation and buttons
    settings: "Settings",
    review: "Review",
    addReview: "Add review",
    firstReview: "Add first review",
    login: "Log in",
    logout: "Log out",
    register: "Register",
    loginRegister: "Log in / Register",
    
    // Language settings
    language: "Language",
    languageGerman: "Deutsch",
    languageTurkish: "Türkçe",
    languageEnglish: "English",
    
    // Settings menu
    appInfo: "App Info",
    checkInHelp: "Check-In Help",
    repeatOnboarding: "Repeat onboarding",
    editProfile: "Edit profile",
    accessibility: "Accessibility",
    theme: "Theme",
    
    // Search and filters
    search: "Search",
    searchPlaces: "Search places...",
    filters: "Filters",
    
    // Place details
    details: "View details",
    verified: "Verified",
    reviews: "Reviews",
    noPlaces: "No places found",
    noPlacesDesc: "Try different search terms.",
    noPlacesYet: "No places rated yet.",
    
    // Ratings
    wheelchair: "Wheelchair",
    entrance: "Entrance",
    bathroom: "Bathroom",
    tables: "Tables",
    staff: "Staff",
  },
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("de")

  useEffect(() => {
    // Load language from localStorage on mount
    const savedLanguage = localStorage.getItem("ablecheck-language") as Language
    if (savedLanguage && (savedLanguage === "de" || savedLanguage === "tr" || savedLanguage === "en")) {
      setLanguageState(savedLanguage)
    }
  }, [])

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage)
    localStorage.setItem("ablecheck-language", newLanguage)
  }

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}