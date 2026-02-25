import React, { useEffect, useRef } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import "./LogConsole.css";

export const LogConsole: React.FC<{ logs: string[] }> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="log-console">
      <div className="log-title">{t.logConsole.title}</div>
      {logs.map((log, i) => (
        <div key={i} className="log-line">
          <span className="log-prefix">&gt;</span> {log}
        </div>
      ))}
    </div>
  );
};
