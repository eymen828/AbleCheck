"use client"

import { Languages } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLanguage, type Language } from "@/lib/language-context"

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage()

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: "de", name: t("languageGerman"), flag: "🇩🇪" },
    { code: "tr", name: t("languageTurkish"), flag: "🇹🇷" },
    { code: "en", name: t("languageEnglish"), flag: "🇺🇸" },
  ]

  const currentLanguage = languages.find(lang => lang.code === language)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm">
          <Languages className="w-4 h-4" />
          {t("language")}
          <span className="ml-auto flex items-center gap-1">
            {currentLanguage?.flag} {currentLanguage?.name}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="left" align="start">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`flex items-center gap-2 ${
              language === lang.code ? "bg-accent" : ""
            }`}
          >
            <span className="text-lg">{lang.flag}</span>
            {lang.name}
            {language === lang.code && (
              <span className="ml-auto text-xs">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}