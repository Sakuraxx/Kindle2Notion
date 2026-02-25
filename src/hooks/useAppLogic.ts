// hooks/useAppLogic.ts
import { useState, useEffect, useMemo } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";

import type { KindleClipping, BookGroup } from "../models/kindle-clipping.model";
import type { Book } from "../models/comparison.model";
import { parseKindleClippings } from "../services/kindle-parser";
import { adaptKindleClippingsToBooks } from "../services/kindle-adapter";
import { adaptNotionBooksToStandardBooks } from "../services/notion-adapter";
import { filterUniqueClippings } from "../services/comparison-service";
import { 
  getAllBookClippings, 
  createNotionPagesForNewBooks, 
  appendNotionBlocksToExistingBooks 
} from "../services/notion-service";
import { useLanguage } from "../i18n/LanguageContext";

type StatusKey = 'ready' | 'importing' | 'comparing' | 'syncing' | 'success' | 'error' | 'compareSuccess' | 'syncSuccess';

export function useAppLogic() {
  const { t } = useLanguage();
  const [kindleClippings, setKindleClippings] = useState<KindleClipping[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusKey, setStatusKey] = useState<StatusKey>('ready');
  
  // Cache Notion IDs: Map<"Title|Author", PageID>
  const [existingBookIds, setExistingBookIds] = useState<Map<string, string>>(new Map());

  const [apiKey, setApiKey] = useState("");
  const [databaseId, setDatabaseId] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  
  // Track if Compare is in progress
  const [isComparing, setIsComparing] = useState(false);
  
  // Track collapsed book nodes
  const [collapsedBookKeys, setCollapsedBookKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    const savedKey = localStorage.getItem("notion_api_key");
    const savedDbId = localStorage.getItem("notion_database_id");
    if (savedKey) setApiKey(savedKey);
    if (savedDbId) setDatabaseId(savedDbId);
  }, []);

  const displayGroups = useMemo(() => {
    const groups = new Map<string, BookGroup>();

    kindleClippings.forEach((clipping, index) => {
      const matches = 
        clipping.bookName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clipping.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clipping.content.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matches) return;

      const key = `${clipping.bookName}-${clipping.author}`;
      if (!groups.has(key)) {
        groups.set(key, {
          key,
          bookName: clipping.bookName,
          author: clipping.author,
          children: []
        });
      }
      groups.get(key)!.children.push({ originalIndex: index, clipping });
    });

    return Array.from(groups.values());
  }, [kindleClippings, searchTerm]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `${timestamp} - ${message}`]);
  };

  const saveConfig = () => {
    localStorage.setItem("notion_api_key", apiKey);
    localStorage.setItem("notion_database_id", databaseId);
    addLog(t.logs.configSaved);
  };

  const handleImport = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: "Text files", extensions: ["txt"] }],
      });

      if (selected && typeof selected === "string") {
        setStatusKey('importing');
        const content = await readTextFile(selected);
        const data = await parseKindleClippings(content);
        
        // Reset state on new import
        setKindleClippings(data);
        setSelectedIndices(new Set()); 
        setExistingBookIds(new Map()); // Clear cache
        
        setStatusKey('success');
        addLog(t.logs.parsedClippings.replace('{count}', data.length.toString()));
        
        // Collapse all nodes after import
        setTimeout(() => {
          const groups = new Map<string, boolean>();
          data.forEach(clipping => {
            const key = `${clipping.bookName}-${clipping.author}`;
            groups.set(key, true);
          });
          setCollapsedBookKeys(new Set(groups.keys()));
        }, 0);
      }
    } catch (err: any) {
      addLog(t.logs.importFailed.replace('{error}', err.message));
    }
  };

  const handleToggle = (indices: number[]) => {
    const next = new Set(selectedIndices);
    const allPresent = indices.every(idx => next.has(idx));
    if (allPresent) indices.forEach(idx => next.delete(idx));
    else indices.forEach(idx => next.add(idx));
    setSelectedIndices(next);
  };

  const handleCompare = async () => {
    if (!apiKey || !databaseId) {
      alert("Please configure Notion information first");
      return;
    }
    if (kindleClippings.length === 0) {
      addLog(t.logs.noClippingsToCompare);
      return;
    }

    setIsComparing(true);
    setStatusKey('comparing');
    addLog(t.logs.compareFetchingNotion);

    try {
      // 1. Fetch Remote
      const notionClippings = await getAllBookClippings(apiKey, databaseId);
      const notionBooks = adaptNotionBooksToStandardBooks(notionClippings);
      console.log("Notion Books:", notionBooks);
      addLog(t.logs.compareRetrieved.replace('{count}', notionBooks.length.toString()));

      // 2. Build ID Map (Title|Author -> ID)
      const idMap = new Map<string, string>();
      notionBooks.forEach(b => {
        if (b.id) {
          idMap.set(`${b.title.toLowerCase()}|${b.author.toLowerCase()}`, b.id);
        }
      });
      setExistingBookIds(idMap);

      // 3. Filter Local Clippings
      const uniqueClippings = filterUniqueClippings(kindleClippings, notionBooks);
      
      const diffCount = kindleClippings.length - uniqueClippings.length;
      setKindleClippings(uniqueClippings);
      setSelectedIndices(new Set());

      setStatusKey('compareSuccess');
      addLog(t.logs.compareFinished.replace('{hidden}', diffCount.toString()).replace('{showing}', uniqueClippings.length.toString()));

      // Collapse all nodes after compare
      setTimeout(() => {
        const groups = new Map<string, boolean>();
        uniqueClippings.forEach(clipping => {
          const key = `${clipping.bookName}-${clipping.author}`;
          groups.set(key, true);
        });
        setCollapsedBookKeys(new Set(groups.keys()));
      }, 0);

    } catch (error: any) {
      setStatusKey('error');
      addLog(t.logs.generalError.replace('{error}', error.message));
    } finally {
      setIsComparing(false);
    }
  };

  // --- Updated: Sync ---
  const handleSync = async () => {
    if (!apiKey || !databaseId) {
      alert("Config missing");
      return;
    }

    // 1. Get selected items from the CURRENT view (which should be the diff already)
    const toSync = kindleClippings.filter((_, i) => selectedIndices.has(i));
    if (toSync.length === 0) {
        addLog(t.logs.syncNoItemsSelected);
        return;
    }

    setStatusKey('syncing');
    addLog(t.logs.syncStarting.replace('{count}', toSync.length.toString()));

    try {
      // 2. Convert to Book format
      const booksToSync = adaptKindleClippingsToBooks(toSync);

      // 3. Separate into New vs Existing based on cached IDs
      const newBooks: Book[] = [];
      const updatedBooks: Book[] = [];

      booksToSync.forEach(book => {
        const key = `${book.title.toLowerCase()}|${book.author.toLowerCase()}`;
        const existingId = existingBookIds.get(key);

        if (existingId) {
          book.id = existingId; // Inject ID
          updatedBooks.push(book);
        } else {
          newBooks.push(book);
        }
      });

      // 4. Upload
      if (newBooks.length > 0) {
        addLog(t.logs.syncCreatingPages.replace('{count}', newBooks.length.toString()));
        await createNotionPagesForNewBooks(apiKey, databaseId, newBooks, addLog);
      }

      if (updatedBooks.length > 0) {
        addLog(t.logs.syncAppendingPages.replace('{count}', updatedBooks.length.toString()));
        await appendNotionBlocksToExistingBooks(apiKey, updatedBooks, addLog);
      }

      setStatusKey('syncSuccess');
      addLog(t.logs.syncCompleted);

      // Optional: Clear processed items from view? 
      // For now, let's leave them or user can manually clear/re-import if they want.
      
    } catch (error: any) {
      setStatusKey('error');
      addLog(t.logs.generalError.replace('{error}', error.message));
    }
  };

  const handleToggleBookNode = (key: string) => {
    const next = new Set(collapsedBookKeys);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    setCollapsedBookKeys(next);
  };

  return {
    kindleClippings,
    selectedIndices,
    searchTerm,
    setSearchTerm,
    statusKey,
    apiKey,
    setApiKey,
    databaseId,
    setDatabaseId,
    logs,
    displayGroups,
    saveConfig,
    handleImport,
    handleToggle,
    handleCompare,
    handleSync,
    isComparing,
    collapsedBookKeys,
    handleToggleBookNode
  };
}