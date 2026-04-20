import React, { createContext, useContext, useMemo, useState } from 'react'
import { en, es } from './translations.js'

const I18nContext = createContext(null)

const STORAGE_KEY = 'lincesckf.lang'

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem(STORAGE_KEY) || 'en')

  const t = useMemo(() => {
    const dict = lang === 'es' ? es : en
    return (key) => dict[key] ?? key
  }, [lang])

  const toggle = () => {
    setLang((prev) => {
      const next = prev === 'en' ? 'es' : 'en'
      localStorage.setItem(STORAGE_KEY, next)
      return next
    })
  }

  const value = useMemo(() => ({ lang, setLang, toggle, t }), [lang, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
