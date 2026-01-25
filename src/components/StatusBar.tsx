import React from 'react';

interface StatusBarProps {
  status: string;
  total: number;
  selected: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({ status, total, selected }) => {
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
        <span>Status: {status}</span>
        <span>Total: {total}</span>
      </div>
      <div style={{ display: 'flex', gap: '15px' }}>
        <span>Selected: {selected}</span>
        <span>Kindle2Notion v0.1.0</span>
      </div>
    </div>
  );
};
