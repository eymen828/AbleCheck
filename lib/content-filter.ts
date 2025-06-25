// Beleidigungsfilter für deutsche Sprache
const OFFENSIVE_WORDS = [
  // Basis-Schimpfwörter (zensiert für Produktionsumgebung)
  "idiot",
  "dumm",
  "blöd",
  "scheiß",
  "mist",
  "kacke",
  "arsch",
  "verdammt",
  "hölle",
  "teufel",
  "dreck",
  "schwein",
  "sau",
  // Diskriminierende Begriffe
  "behindert",
  "spast",
  "mongo",
  "irre",
  "verrückt",
  "gestört",
  // Hassrede-Begriffe (stark zensiert)
  "nazi",
  "faschos",
  "terror",
  "hass",
  "gewalt",
  // Spam-Begriffe
  "viagra",
  "casino",
  "gewinn",
  "gratis",
  "kostenlos",
  "angebot",
]

const REPLACEMENT_WORDS = ["***", "[zensiert]", "[entfernt]", "...", "###"]

export interface ContentModerationResult {
  isClean: boolean
  filteredText: string
  detectedWords: string[]
  severity: "low" | "medium" | "high"
}

export function moderateContent(text: string): ContentModerationResult {
  if (!text || typeof text !== "string") {
    return {
      isClean: true,
      filteredText: text || "",
      detectedWords: [],
      severity: "low",
    }
  }

  const lowerText = text.toLowerCase()
  const detectedWords: string[] = []
  let filteredText = text
  let severity: "low" | "medium" | "high" = "low"

  // Prüfe auf offensive Wörter
  OFFENSIVE_WORDS.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi")
    if (regex.test(lowerText)) {
      detectedWords.push(word)

      // Bestimme Schweregrad
      if (word.includes("nazi") || word.includes("terror") || word.includes("hass")) {
        severity = "high"
      } else if (word.includes("behindert") || word.includes("spast")) {
        severity = "medium"
      }

      // Ersetze das Wort
      const replacement = REPLACEMENT_WORDS[Math.floor(Math.random() * REPLACEMENT_WORDS.length)]
      filteredText = filteredText.replace(regex, replacement)
    }
  })

  // Prüfe auf verdächtige Muster
  const suspiciousPatterns = [
    /(.)\1{4,}/g, // Wiederholte Zeichen (aaaaa)
    /[A-Z]{10,}/g, // Zu viele Großbuchstaben
    /[!@#$%^&*]{5,}/g, // Zu viele Sonderzeichen
  ]

  suspiciousPatterns.forEach((pattern) => {
    if (pattern.test(text)) {
      detectedWords.push("verdächtiges Muster")
      if (severity === "low") severity = "medium"
    }
  })

  return {
    isClean: detectedWords.length === 0,
    filteredText,
    detectedWords,
    severity,
  }
}

export function shouldBlockContent(result: ContentModerationResult): boolean {
  return result.severity === "high" || result.detectedWords.length >= 3
}

export function getContentWarning(result: ContentModerationResult): string | null {
  if (result.isClean) return null

  switch (result.severity) {
    case "high":
      return "Dieser Inhalt enthält möglicherweise hasserfüllte oder diskriminierende Sprache."
    case "medium":
      return "Dieser Inhalt enthält möglicherweise unangemessene Sprache."
    case "low":
      return "Dieser Inhalt wurde automatisch moderiert."
    default:
      return null
  }
}
