import { create } from "zustand"
import { persist } from "zustand/middleware"
import { t, type Locale, type TranslationKey } from "@/lib/i18n"

interface LocaleState {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey) => string
}

export const useLocale = create<LocaleState>()(
  persist(
    (set, get) => ({
      locale: "mn",
      setLocale: (locale) => set({ locale }),
      t: (key) => t(key, get().locale),
    }),
    {
      name: "finance-app-locale",
    }
  )
)
