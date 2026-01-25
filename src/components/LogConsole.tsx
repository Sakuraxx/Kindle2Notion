import React, { useEffect, useRef } from 'react';

export const LogConsole: React.FC<{ logs: string[] }> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div
      style={{
        height: '140px',
        background: '#1e1e1e',
        color: '#d4d4d4',
        padding: '10px',
        fontFamily: 'monospace',
        fontSize: '12px',
        overflowY: 'auto',
        borderTop: '1px solid #333',
      }}
      ref={scrollRef}
    >
      <div style={{ color: '#6a9955', marginBottom: '5px', fontSize: '10px' }}>TERMINAL</div>
      {logs.map((log, i) => (
        <div
          key={i}
          style={{ marginBottom: '2px', borderLeft: '2px solid #333', paddingLeft: '8px' }}
        >
          <span style={{ color: '#569cd6' }}>&gt;</span> {log}
        </div>
      ))}
      {logs.length === 0 && <div style={{ color: '#555' }}>Waiting for task execution...</div>}
    </div>
  );
};
