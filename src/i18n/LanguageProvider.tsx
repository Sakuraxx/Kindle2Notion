import React, { useState, useEffect, ReactNode } from 'react';
import { LanguageContext } from './LanguageContext';
import { getTranslation, getStoredLanguage, setStoredLanguage, type Language } from './i18n';

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return getStoredLanguage();
  });

  const [t, setT] = useState(getTranslation(language));

  useEffect(() => {
    setStoredLanguage(language);
    setT(getTranslation(language));
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
