import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  const { t } = useLanguage();

  return (
    <div style={{ flex: 1, position: 'relative' }}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t.searchBar.placeholder}
        style={{
          width: '100%',
          padding: '8px 12px',
          paddingLeft: '35px',
          borderRadius: '6px',
          border: '1px solid #ddd',
          boxSizing: 'border-box',
        }}
      />
      <span
        style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#aaa',
        }}
      >
        🔍
      </span>
    </div>
  );
};
