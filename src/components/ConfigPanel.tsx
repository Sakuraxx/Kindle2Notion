import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

interface ConfigPanelProps {
  apiKey: string;
  setApiKey: (val: string) => void;
  databaseId: string;
  setDatabaseId: (val: string) => void;
  onSave: () => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  apiKey,
  setApiKey,
  databaseId,
  setDatabaseId,
  onSave,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <div
      style={{
        marginBottom: '15px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        overflow: 'hidden',
      }}
    >
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '10px 15px',
          background: '#f8f9fa',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>⚙️ {t.configPanel.title}</span>
        <span>{isOpen ? '▴' : '▾'}</span>
      </div>

      {isOpen && (
        <div
          style={{
            padding: '15px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: '#fff',
          }}
        >
          <div>
            <label
              style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}
            >
              {t.configPanel.apiKeyLabel}
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={t.configPanel.apiKeyPlaceholder}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
              }}
            />
          </div>
          <div>
            <label
              style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}
            >
              {t.configPanel.databaseIdLabel}
            </label>
            <input
              type="text"
              value={databaseId}
              onChange={(e) => setDatabaseId(e.target.value)}
              placeholder={t.configPanel.databaseIdPlaceholder}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
              }}
            />
          </div>
          <button
            onClick={onSave}
            style={{
              padding: '8px',
              background: '#0078d4',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {t.configPanel.saveButton}
          </button>
        </div>
      )}
    </div>
  );
};
