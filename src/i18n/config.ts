import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import HttpBackend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'

export const SUPPORTED_LANGUAGES = ['en', 'ar'] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: 'English',
  ar: 'العربية',
}

export const isRtl = (lng: string) => lng.startsWith('ar')

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: [...SUPPORTED_LANGUAGES],
    fallbackLng: 'en',
    load: 'languageOnly',
    ns: ['translation'],
    defaultNS: 'translation',
    backend: {
      loadPath: '/lang/{{lng}}.json',
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'medicare-lang',
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  })

i18n.on('languageChanged', (lng) => {
  const dir = isRtl(lng) ? 'rtl' : 'ltr'
  document.documentElement.lang = lng
  document.documentElement.dir = dir
})

// تعديل الجزء الأخير ليكون أكثر أماناً
const currentLang = i18n.language || 'en'; // تأمين القيمة إذا كانت undefined
const initialDir = isRtl(currentLang) ? 'rtl' : 'ltr';
document.documentElement.lang = currentLang;
document.documentElement.dir = initialDir;
export default i18n
