// src/hooks/useLogger.ts
import { useState } from "react";

export function useLogger() {
  const [logs, setLogs] = useState<string[]>([]);
  const [statusText, setStatusText] = useState("Ready");

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `${timestamp} - ${message}`]);
  };

  return { logs, statusText, setStatusText, addLog };
}