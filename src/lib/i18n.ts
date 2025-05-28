// src/lib/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import your translation files
import enUiTranslations from '../locales/en/ui.json';
import tnUiTranslations from '../locales/tn/ui.json';

export const resources = {
  en: {
    ui: enUiTranslations, // 'ui' is the default namespace for UI text
  },
  tn: {
    ui: tnUiTranslations,
  },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: import.meta.env.DEV, // Vite environment variable for development mode
    fallbackLng: 'en',         // Language to use if detected language is unavailable
    defaultNS: 'ui',           // Default namespace
    ns: ['ui'],                // List of namespaces
    interpolation: {
      escapeValue: false,      // React already protects against XSS
    },
    resources,
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'], // Order of detection
      caches: ['localStorage'], // Cache detected language in localStorage
    },
  });

export default i18n;
