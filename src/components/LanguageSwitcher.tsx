import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { getAllLanguages, type Language } from '../i18n/i18n';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isHovering, setIsHovering] = useState(false);
  const languages = getAllLanguages();
  const currentLang = languages.find(l => l.code === language);

  const toggleLanguage = () => {
    const nextLang = language === 'zh' ? 'en' : 'zh';
    setLanguage(nextLang as Language);
  };

  return (
    <button
      onClick={toggleLanguage}
      title={`Current: ${currentLang?.name} | Click to switch`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '36px',
        height: '36px',
        background: isHovering ? '#e8e8e8' : '#f5f5f5',
        border: '1px solid #ddd',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '18px',
        transition: 'all 0.2s ease',
        padding: 0,
      }}
    >
      🌐
    </button>
  );
};
