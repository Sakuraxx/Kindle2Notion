import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

type StatusKey = 'ready' | 'importing' | 'comparing' | 'syncing' | 'success' | 'error' | 'compareSuccess' | 'syncSuccess';

interface StatusBarProps {
  statusKey: StatusKey;
  total: number;
  selected: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({ statusKey, total, selected }) => {
  const { t } = useLanguage();

  // Map status key to translation key
  const getStatusText = () => {
    const statusMap: Record<StatusKey, string> = {
      'ready': t.messages.ready,
      'importing': t.messages.importing,
      'comparing': t.messages.comparing,
      'syncing': t.messages.syncing,
      'success': t.messages.success,
      'error': t.messages.error,
      'compareSuccess': t.messages.compareSuccess,
      'syncSuccess': t.messages.syncSuccess,
    };
    return statusMap[statusKey];
  };

  return (
    <div
      style={{
        height: '26px',
        background: '#007acc',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 10px',
        fontSize: '11px',
      }}
    >
      <div style={{ display: 'flex', gap: '15px' }}>
        <span>{t.statusBar.status}: {getStatusText()}</span>
        <span>{t.statusBar.total}: {total}</span>
      </div>
      <div style={{ display: 'flex', gap: '15px' }}>
        <span>{t.statusBar.selected}: {selected}</span>
        <span>{t.statusBar.version}</span>
      </div>
    </div>
  );
};
