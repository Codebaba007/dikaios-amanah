import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './locales/en/translation.json';
import bnTranslation from './locales/bn/translation.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      bn: { translation: bnTranslation }
    },
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

// Keep the document language in sync for screen readers and correct text rendering.
const applyDocumentLang = (lng) => {
  document.documentElement.lang = lng;
};

applyDocumentLang(i18n.language || 'en');
i18n.on('languageChanged', applyDocumentLang);

export default i18n;
