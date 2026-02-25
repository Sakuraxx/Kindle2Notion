import enTranslations from './translations/en.json';
import zhTranslations from './translations/zh.json';

export type Language = 'en' | 'zh';
export type TranslationKeys = typeof enTranslations;

const translations: Record<Language, TranslationKeys> = {
  en: enTranslations,
  zh: zhTranslations,
};

export const getTranslation = (lang: Language): TranslationKeys => {
  return translations[lang];
};

export const getAllLanguages = (): { code: Language; name: string }[] => [
  { code: 'zh', name: zhTranslations.common.languageName },
  { code: 'en', name: enTranslations.common.languageName },
];

export const getStoredLanguage = (): Language => {
  const stored = localStorage.getItem('language');
  if (stored === 'en' || stored === 'zh') {
    return stored;
  }
  // Default to Chinese
  return 'zh';
};

export const setStoredLanguage = (lang: Language) => {
  localStorage.setItem('language', lang);
};
