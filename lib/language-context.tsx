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
    options: "Optionen",
    
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
    
    // Statistics
    ratedPlaces: "Bewertete Orte",
    reviewsCount: "Bewertungen",
    checkInReviews: "Check-In Bewertungen",
    
    // Navigation links
    allPlaces: "Alle Orte",
    checkInReviewsLink: "Check-In Bewertungen",
    
    // Call to action
    addReviewCta: "Bewertungen hinzufügen",
    addReviewCtaDesc: "Melden Sie sich an, um Orte zu bewerten und anderen zu helfen.",
    
    // Loading states
    loading: "Laden...",
    loadingProfile: "Lade Profil...",
    saving: "Speichern...",
    
    // Form labels and buttons
    save: "Speichern",
    cancel: "Abbrechen",
    close: "Schließen",
    back: "Zurück",
    next: "Weiter",
    submit: "Absenden",
    
    // Profile
    profile: "Profil",
    username: "Benutzername",
    fullName: "Vollständiger Name",
    email: "E-Mail",
    profilePicture: "Profilbild",
    chooseImage: "Bild wählen",
    enterAvatarUrl: "Oder Avatar URL eingeben (optional)",
    
    // Error messages
    error: "Fehler",
    errorOccurred: "Ein Fehler ist aufgetreten",
    tryAgain: "Versuchen Sie es erneut",
    userNotFound: "Benutzer nicht gefunden",
    loadingError: "Fehler beim Laden",
    savingError: "Fehler beim Speichern",
    
    // Success messages
    success: "Erfolgreich",
    profileSaved: "Profil erfolgreich gespeichert!",
    
    // Validation
    required: "Erforderlich",
    minLength: "Mindestens {0} Zeichen",
    maxLength: "Maximal {0} Zeichen",
    
    // Accessibility
    blindMode: "Blindenmodus",
    blindModeActive: "Blindenmodus aktiv",
    blindModeInactive: "Blindenmodus inaktiv",
    speechSettings: "Spracheinstellungen",
    speechRate: "Sprechgeschwindigkeit",
    speechVolume: "Lautstärke",
    announceOnHover: "Ansage beim Überfahren",
    
    // Common
    yes: "Ja",
    no: "Nein",
    ok: "OK",
    or: "oder",
    and: "und",
    optional: "(optional)",
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
    options: "Seçenekler",
    
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
    
    // Statistics
    ratedPlaces: "Değerlendirilen Yerler",
    reviewsCount: "Değerlendirmeler",
    checkInReviews: "Check-In Değerlendirmeleri",
    
    // Navigation links
    allPlaces: "Tüm Yerler",
    checkInReviewsLink: "Check-In Değerlendirmeleri",
    
    // Call to action
    addReviewCta: "Değerlendirme ekle",
    addReviewCtaDesc: "Yerleri değerlendirmek ve başkalarına yardım etmek için giriş yapın.",
    
    // Loading states
    loading: "Yükleniyor...",
    loadingProfile: "Profil yükleniyor...",
    saving: "Kaydediyor...",
    
    // Form labels and buttons
    save: "Kaydet",
    cancel: "İptal",
    close: "Kapat",
    back: "Geri",
    next: "İleri",
    submit: "Gönder",
    
    // Profile
    profile: "Profil",
    username: "Kullanıcı adı",
    fullName: "Tam ad",
    email: "E-posta",
    profilePicture: "Profil resmi",
    chooseImage: "Resim seç",
    enterAvatarUrl: "Veya avatar URL'si girin (isteğe bağlı)",
    
    // Error messages
    error: "Hata",
    errorOccurred: "Bir hata oluştu",
    tryAgain: "Tekrar deneyin",
    userNotFound: "Kullanıcı bulunamadı",
    loadingError: "Yükleme hatası",
    savingError: "Kaydetme hatası",
    
    // Success messages
    success: "Başarılı",
    profileSaved: "Profil başarıyla kaydedildi!",
    
    // Validation
    required: "Gerekli",
    minLength: "En az {0} karakter",
    maxLength: "En fazla {0} karakter",
    
    // Accessibility
    blindMode: "Görme engelli modu",
    blindModeActive: "Görme engelli modu aktif",
    blindModeInactive: "Görme engelli modu pasif",
    speechSettings: "Konuşma ayarları",
    speechRate: "Konuşma hızı",
    speechVolume: "Ses seviyesi",
    announceOnHover: "Fareyle üzerine geldiğinde duyur",
    
    // Common
    yes: "Evet",
    no: "Hayır",
    ok: "Tamam",
    or: "veya",
    and: "ve",
    optional: "(isteğe bağlı)",
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
    options: "Options",
    
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
    
    // Statistics
    ratedPlaces: "Rated Places",
    reviewsCount: "Reviews",
    checkInReviews: "Check-In Reviews",
    
    // Navigation links
    allPlaces: "All Places",
    checkInReviewsLink: "Check-In Reviews",
    
    // Call to action
    addReviewCta: "Add reviews",
    addReviewCtaDesc: "Sign in to rate places and help others.",
    
    // Loading states
    loading: "Loading...",
    loadingProfile: "Loading profile...",
    saving: "Saving...",
    
    // Form labels and buttons
    save: "Save",
    cancel: "Cancel",
    close: "Close",
    back: "Back",
    next: "Next",
    submit: "Submit",
    
    // Profile
    profile: "Profile",
    username: "Username",
    fullName: "Full name",
    email: "Email",
    profilePicture: "Profile picture",
    chooseImage: "Choose image",
    enterAvatarUrl: "Or enter avatar URL (optional)",
    
    // Error messages
    error: "Error",
    errorOccurred: "An error occurred",
    tryAgain: "Try again",
    userNotFound: "User not found",
    loadingError: "Loading error",
    savingError: "Saving error",
    
    // Success messages
    success: "Success",
    profileSaved: "Profile saved successfully!",
    
    // Validation
    required: "Required",
    minLength: "At least {0} characters",
    maxLength: "Maximum {0} characters",
    
    // Accessibility
    blindMode: "Blind mode",
    blindModeActive: "Blind mode active",
    blindModeInactive: "Blind mode inactive",
    speechSettings: "Speech settings",
    speechRate: "Speech rate",
    speechVolume: "Volume",
    announceOnHover: "Announce on hover",
    
    // Common
    yes: "Yes",
    no: "No",
    ok: "OK",
    or: "or",
    and: "and",
    optional: "(optional)",
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