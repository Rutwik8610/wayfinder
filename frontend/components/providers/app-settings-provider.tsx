'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import english from '@/messages/en.json'
import hindi from '@/messages/hi.json'

export type Language = 'en' | 'hi'
export type Theme = 'light' | 'dark' | 'system'

const catalogs: Record<Language, Record<string, string>> = { en: english, hi: hindi }
const languageKey = 'wayfinder-language'
const themeKey = 'wayfinder-theme'

type AppSettings = {
  language: Language
  theme: Theme
  setLanguage: (language: Language) => void
  setTheme: (theme: Theme) => void
  t: (key: string, values?: Record<string, string | number>) => string
}

const AppSettingsContext = createContext<AppSettings | null>(null)

function persistCookie(key: string, value: string) {
  document.cookie = `${key}=${encodeURIComponent(value)};path=/;max-age=31536000;samesite=lax`
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  const update = () => {
    const dark = theme === 'dark' || (theme === 'system' && media.matches)
    root.classList.toggle('dark', dark)
    root.classList.toggle('light', !dark)
  }
  update()
  if (theme === 'system') {
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }
}

export function AppSettingsProvider({
  children,
  initialLanguage,
  initialTheme,
}: {
  children: ReactNode
  initialLanguage: Language
  initialTheme: Theme
}) {
  const pathname = usePathname()
  const [language, setLanguageState] = useState(initialLanguage)
  const [theme, setThemeState] = useState(initialTheme)

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage)
    localStorage.setItem(languageKey, nextLanguage)
    persistCookie(languageKey, nextLanguage)
  }

  const setTheme = (nextTheme: Theme) => {
    setThemeState(nextTheme)
    localStorage.setItem(themeKey, nextTheme)
    persistCookie(themeKey, nextTheme)
    applyTheme(nextTheme)
  }

  useEffect(() => {
    const storedLanguage = localStorage.getItem(languageKey)
    const storedTheme = localStorage.getItem(themeKey)
    if (storedLanguage === 'en' || storedLanguage === 'hi') setLanguageState(storedLanguage)
    if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system') setThemeState(storedTheme)

    const syncFromStorage = (event: StorageEvent) => {
      if (event.key === languageKey && (event.newValue === 'en' || event.newValue === 'hi')) {
        setLanguageState(event.newValue)
      }
      if (event.key === themeKey && (event.newValue === 'light' || event.newValue === 'dark' || event.newValue === 'system')) {
        setThemeState(event.newValue)
      }
    }
    window.addEventListener('storage', syncFromStorage)
    return () => window.removeEventListener('storage', syncFromStorage)
  }, [])

  useEffect(() => {
    document.documentElement.lang = language
    document.title = catalogs[language]['app.title']
  }, [language, pathname])

  useEffect(() => applyTheme(theme), [theme])

  const value = useMemo<AppSettings>(() => ({
    language,
    theme,
    setLanguage,
    setTheme,
    t: (key, values = {}) => {
      let message = catalogs[language][key] ?? catalogs.en[key] ?? key
      for (const [name, replacement] of Object.entries(values)) {
        message = message.replaceAll(`{${name}}`, String(replacement))
      }
      return message
    },
  }), [language, theme])

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>
}

export function useAppSettings() {
  const settings = useContext(AppSettingsContext)
  if (!settings) throw new Error('useAppSettings must be used inside AppSettingsProvider')
  return settings
}