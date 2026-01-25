import { useState, useEffect, useMemo } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";

// Models and services
import type { KindleClipping, BookGroup } from "./models/kindle-clipping.model";
import { parseKindleClippings } from "./services/kindle-parser";
import { adaptKindleClippingsToBooks } from "./services/kindle-adapter";
import { adaptNotionBooksToStandardBooks } from "./services/notion-adapter";
import { compareBooks } from "./services/comparison-service";
import { 
  getAllBookClippings, 
  createNotionPagesForNewBooks, 
  appendNotionBlocksToExistingBooks 
} from "./services/notion-service";

// Components
import { ConfigPanel } from "./components/ConfigPanel";
import { SearchBar } from "./components/SearchBar";
import { LogConsole } from "./components/LogConsole";
import { StatusBar } from "./components/StatusBar";
import { ClippingTree } from "./components/ClippingTree";

function App() {
  // --- 1. Basic state ---
  const [kindleClippings, setKindleClippings] = useState<KindleClipping[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusText, setStatusText] = useState("Ready");
  
  // --- 2. Configuration state ---
  const [apiKey, setApiKey] = useState("");
  const [databaseId, setDatabaseId] = useState("");

  // --- 3. Log state ---
  const [logs, setLogs] = useState<string[]>([]);

  // Load cached data on page load
  useEffect(() => {
    const savedKey = localStorage.getItem("notion_api_key");
    const savedDbId = localStorage.getItem("notion_database_id");
    if (savedKey) setApiKey(savedKey);
    if (savedDbId) setDatabaseId(savedDbId);
  }, []);

  // --- 4. Core logic: data transformation (flat -> tree + search filter) ---
  const displayGroups = useMemo(() => {
    const groups = new Map<string, BookGroup>();

    kindleClippings.forEach((clipping, index) => {
      // Fuzzy search logic
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

  // --- 5. Event handlers ---

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `${timestamp} - ${message}`]);
  };

  const saveConfig = () => {
    localStorage.setItem("notion_api_key", apiKey);
    localStorage.setItem("notion_database_id", databaseId);
    addLog("System: Configuration saved locally");
  };

  const handleImport = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: "Text files", extensions: ["txt"] }],
      });

      if (selected && typeof selected === "string") {
        setStatusText("Reading file...");
        const content = await readTextFile(selected);
        const data = await parseKindleClippings(content);
        setKindleClippings(data);
        setSelectedIndices(new Set());
        setStatusText("Import completed");
        addLog(`File: Successfully parsed ${data.length} clippings`);
      }
    } catch (err: any) {
      addLog(`Error: Import failed - ${err.message}`);
    }
  };

  // Handle checkbox toggle (supports single and select all by book)
  const handleToggle = (indices: number[]) => {
    const next = new Set(selectedIndices);
    const allPresent = indices.every(idx => next.has(idx));

    if (allPresent) {
      // If all passed indices are already selected, deselect all
      indices.forEach(idx => next.delete(idx));
    } else {
      // Otherwise, select all
      indices.forEach(idx => next.add(idx));
    }
    setSelectedIndices(next);
  };

  const handleSync = async () => {
    if (!apiKey || !databaseId) {
      alert("Please configure Notion information first");
      return;
    }

    const toSync = kindleClippings.filter((_, i) => selectedIndices.has(i));
    if (toSync.length === 0) return;

    setStatusText("Syncing...");
    try {
      addLog(`>>> Starting sync task: ${toSync.length} clippings selected`);

      // 1. Convert format
      const kindleBooks = adaptKindleClippingsToBooks(toSync);
      addLog(`Parse: Summarized into ${kindleBooks.length} books`);

      // 2. Fetch remote data from Notion
      addLog("Notion: Fetching remote database state...");
      const notionClippings = await getAllBookClippings(apiKey, databaseId);
      const notionBooks = adaptNotionBooksToStandardBooks(notionClippings);

      // 3. Compare differences
      const comparison = compareBooks(notionBooks, kindleBooks);
      addLog(`Compare: ${comparison.newBooks.length} new books, ${comparison.updatedBooks.length} books updated`);

      // 4. Execute upload
      if (comparison.newBooks.length > 0) {
        await createNotionPagesForNewBooks(apiKey, databaseId, comparison.newBooks, addLog);
      }

      if (comparison.updatedBooks.length > 0) {
        await appendNotionBlocksToExistingBooks(apiKey, comparison.updatedBooks, addLog);
      }

      setStatusText("Sync successful");
      addLog("Sync task completed");
    } catch (error: any) {
      setStatusText("Sync failed");
      addLog(`Error: ${error.message}`);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      overflow: 'hidden',
      backgroundColor: '#f5f5f7',
      color: '#333',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      
      {/* Main operation area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: "24px" }}>
        <header style={{ marginBottom: '24px' }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>Kindle2Notion</h1>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Seamlessly sync your Kindle reading notes to Notion database</p>
        </header>

        {/* Configuration panel component */}
        <ConfigPanel 
          apiKey={apiKey} setApiKey={setApiKey}
          databaseId={databaseId} setDatabaseId={setDatabaseId}
          onSave={saveConfig}
        />

        {/* Toolbar */}
        <div style={{ 
            display: 'flex', 
            gap: '12px', 
            margin: '20px 0', 
            alignItems: 'center',
            background: '#fff',
            padding: '12px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
          <button 
            onClick={handleImport}
            style={{ 
              padding: '8px 16px', 
              borderRadius: '6px', 
              border: '1px solid #0078d4',
              background: '#fff',
              color: '#0078d4',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            📂 Import File
          </button>
          
          <SearchBar value={searchTerm} onChange={setSearchTerm} />

          <button 
            onClick={handleSync} 
            disabled={selectedIndices.size === 0}
            style={{ 
              padding: '8px 20px', 
              borderRadius: '6px', 
              border: 'none',
              background: selectedIndices.size === 0 ? '#ccc' : '#0078d4',
              color: '#fff',
              cursor: selectedIndices.size === 0 ? 'not-allowed' : 'pointer',
              fontWeight: 500,
              transition: 'background 0.2s'
            }}
          >
            🚀 Sync Selected ({selectedIndices.size})
          </button>
        </div>

        {/* Clipping tree component */}
        <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <ClippingTree 
            groups={displayGroups} 
            selectedIndices={selectedIndices} 
            onToggle={handleToggle} 
          />
        </div>
      </div>

      {/* Bottom info area */}
      <LogConsole logs={logs} />
      <StatusBar 
        status={statusText} 
        total={kindleClippings.length} 
        selected={selectedIndices.size} 
      />
    </div>
  );
}

export default App;