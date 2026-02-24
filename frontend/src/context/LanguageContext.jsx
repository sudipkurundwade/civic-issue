import * as React from "react"
import { translations } from "@/i18n/translations"

const LanguageContext = React.createContext(null)

export const LANGUAGES = [
    { code: "en", label: "English", nativeLabel: "English" },
    { code: "hi", label: "Hindi", nativeLabel: "हिंदी" },
    { code: "mr", label: "Marathi", nativeLabel: "मराठी" },
]

export function LanguageProvider({ children }) {
    const [lang, setLangState] = React.useState(
        () => localStorage.getItem("civic_lang") || "en"
    )

    const setLang = (code) => {
        localStorage.setItem("civic_lang", code)
        setLangState(code)
    }

    // t(key) → translated string; falls back to English, then key itself
    const t = React.useCallback((key) => {
        return (
            translations[lang]?.[key] ||
            translations["en"]?.[key] ||
            key
        )
    }, [lang])

    return (
        <LanguageContext.Provider value={{ lang, setLang, t, languages: LANGUAGES }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const ctx = React.useContext(LanguageContext)
    if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider")
    return ctx
}
