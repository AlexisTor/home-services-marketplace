import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations
import enTranslation from './i18n/locales/en.json';
import esTranslation from './i18n/locales/es.json';

const resources = {
  en: {
    translation: enTranslation
  },
  es: {
    translation: esTranslation
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
