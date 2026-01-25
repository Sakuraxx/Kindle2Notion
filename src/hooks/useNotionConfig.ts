// src/hooks/useNotionConfig.ts
import { useState, useEffect } from "react";

export function useNotionConfig() {
  const [apiKey, setApiKey] = useState("");
  const [databaseId, setDatabaseId] = useState("");

  useEffect(() => {
    // Load config from localStorage on mount
    const savedKey = localStorage.getItem("notion_api_key");
    const savedDbId = localStorage.getItem("notion_database_id");
    if (savedKey) setApiKey(savedKey);
    if (savedDbId) setDatabaseId(savedDbId);
  }, []);

  const saveConfig = () => {
    localStorage.setItem("notion_api_key", apiKey);
    localStorage.setItem("notion_database_id", databaseId);
  };

  return { apiKey, setApiKey, databaseId, setDatabaseId, saveConfig };
}