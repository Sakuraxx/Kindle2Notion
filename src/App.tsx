import { useState, useEffect, useRef } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { parseKindleClippings } from "./services/kindle-parser";
import { adaptKindleClippingsToBooks } from "./services/kindle-adapter";
import { adaptNotionBooksToStandardBooks } from "./services/notion-adapter";
import { compareBooks } from "./services/comparison-service";
import { getAllBookClippings, createNotionPagesForNewBooks, appendNotionBlocksToExistingBooks } from "./services/notion-service";
import type { KindleClipping } from "./models/kindle-clipping.model";

function App() {
  const [kindleClippings, setKindleClippings] = useState<KindleClipping[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [apiKey, setApiKey] = useState("");
  const [databaseId, setDatabaseId] = useState("");
  const [showConfig, setShowConfig] = useState(false);
  const [statusText, setStatusText] = useState("Ready");
  
  // --- New: Log state and ref ---
  const [logs, setLogs] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll logs to bottom
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Helper function: Add log
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    const savedKey = localStorage.getItem("notion_api_key");
    const savedDbId = localStorage.getItem("notion_database_id");
    if (savedKey) setApiKey(savedKey);
    if (savedDbId) setDatabaseId(savedDbId);
  }, []);

  const saveConfig = () => {
    localStorage.setItem("notion_api_key", apiKey);
    localStorage.setItem("notion_database_id", databaseId);
    addLog("System: Notion configuration saved");
    setShowConfig(false);
  };

  const handleImport = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: "Text files", extensions: ["txt"] }],
      });

      if (selected && typeof selected === "string") {
        setStatusText("Reading file...");
        addLog(`File: Reading ${selected}...`);
        const content = await readTextFile(selected);
        const data = await parseKindleClippings(content);
        setKindleClippings(data);
        setSelectedIndices(new Set());
        setStatusText("Import successful");
        addLog(`Parse: Successfully imported ${data.length} clippings`);
      }
    } catch (err: any) {
      addLog(`Error: Import failed - ${err.message}`);
    }
  };

  const toggleSelect = (index: number) => {
    const next = new Set(selectedIndices);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setSelectedIndices(next);
  };

  const handleSync = async () => {
    if (!apiKey || !databaseId) {
      addLog("Warning: Sync interrupted - API Key or Database ID is empty");
      alert("Please configure Notion settings first");
      return;
    }

    const toSync = kindleClippings.filter((_, i) => selectedIndices.has(i));
    if (toSync.length === 0) {
      addLog("Warning: Sync interrupted - No items selected");
      return;
    }

    setStatusText("Syncing...");

    try {
      addLog(`>>> Starting sync task (${toSync.length} items)`);

      addLog("Step 1: Converting Kindle clippings format...");
      const kindleBooks = adaptKindleClippingsToBooks(toSync);
      addLog(`   - Consolidated into ${kindleBooks.length} books`);

      addLog("Step 2: Fetching existing books from Notion...");
      const notionClippings = await getAllBookClippings(apiKey, databaseId);
      addLog(`   - Already existing in Notion: ${notionClippings.length} books`);
      
      const notionBooks = adaptNotionBooksToStandardBooks(notionClippings);

      addLog("Step 3: Comparing local and remote data...");
      const comparison = compareBooks(notionBooks, kindleBooks);
      addLog(`   - Result: ${comparison.newBooks.length} new books, ${comparison.updatedBooks.length} updated books`);

      if (comparison.newBooks.length > 0) {
        addLog(`Step 4: Creating Notion pages for new books...`);
        await createNotionPagesForNewBooks(apiKey, databaseId, comparison.newBooks, (msg) => addLog(msg));
      }

      if (comparison.updatedBooks.length > 0) {
        addLog(`Step 5: Appending new clippings to existing books...`);
        await appendNotionBlocksToExistingBooks(apiKey, comparison.updatedBooks, (msg) => addLog(msg));
      }
      setStatusText("Sync successful");
      addLog("Sync task completed successfully!");
    } catch (error: any) {
      setStatusText("Sync failed");
      addLog(`Sync failed: ${error.message}`);
    }
  };

  return (
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column', 
    height: '100vh', 
    overflow: 'hidden', // Prevent overall scrollbar
    backgroundColor: '#fff'
  }}>
    
    {/* 1. Main operation area - auto fill remaining space */}
    <div style={{ 
      flex: 1, 
      overflowY: 'auto', 
      padding: "20px" 
    }}>
      <h1>Kindle Clippings Sync</h1>
      {/* Configuration panel */}
      <div style={{ marginBottom: "20px", padding: "15px", background: "#f9f9f9", borderRadius: "8px", border: "1px solid #ddd" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>Notion Configuration</h3>
          <button onClick={() => setShowConfig(!showConfig)}>
            {showConfig ? "Collapse" : "Expand Settings"}
          </button>
        </div>

        {showConfig && (
          <div style={{ marginTop: "15px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8em" }}>Notion API Key:</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="ntn_..."
                style={{ width: "100%", boxSizing: "border-box", padding: "8px" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8em" }}>Database/DataSource ID:</label>
              <input
                type="text"
                value={databaseId}
                onChange={(e) => setDatabaseId(e.target.value)}
                placeholder="32-character ID"
                style={{ width: "100%", boxSizing: "border-box", padding: "8px" }}
              />
            </div>
            <button onClick={saveConfig} style={{ backgroundColor: "#0078d4", color: "white", padding: "10px" }}>
              Save Configuration
            </button>
          </div>
        )}
      </div>

      {/* Import and sync buttons */}
      <div style={{ marginBottom: "20px" }}>
        <button onClick={handleImport}>1. Import File</button>
        <button 
          onClick={handleSync} 
          disabled={selectedIndices.size === 0}
          style={{ marginLeft: "10px" }}
        >
          2. Sync Selected ({selectedIndices.size})
        </button>
      </div>

      {/* List area */}
      {/* List area */}
        <div style={{ border: "1px solid #ccc", borderRadius: "4px" }}>
          {kindleClippings.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#888" }}>No data. Please import a file first</div>
          ) : (
            kindleClippings.map((h, i) => (
              <div key={i} style={{ borderBottom: "1px solid #eee", padding: "10px", display: "flex", gap: "10px" }}>
                <input
                  type="checkbox"
                  checked={selectedIndices.has(i)}
                  onChange={() => toggleSelect(i)}
                />
                <div>
                  <strong>{h.bookName}</strong>
                  <span style={{ color: '#888', marginLeft: 8 }}>{h.author}</span>
                  <p style={{ fontSize: "0.9em", color: "#666", margin: "5px 0" }}>{h.content}</p>
                  <div style={{ fontSize: '0.75em', color: '#aaa' }}>{h.timestamp?.toLocaleString()}</div>
                </div>
              </div>
            ))
          )}
        </div>
    </div>

    {/* 2. Operation log panel - fixed height */}
    <div style={{
      height: "120px",
      background: "#1e1e1e",
      color: "#abb2bf",
      padding: "8px 12px",
      fontFamily: "'Cascadia Code', 'Consolas', monospace",
      fontSize: "12px",
      overflowY: "auto",
      borderTop: "1px solid #333"
    }}>
      <div style={{ color: "#5c6370", marginBottom: "5px", fontSize: "10px", textTransform: "uppercase" }}>Terminal Output</div>
      {logs.map((log, index) => (
        <div key={index} style={{ marginBottom: "2px", lineHeight: "1.4" }}>
          <span style={{ color: "#61afef" }}>&gt;</span> {log}
        </div>
      ))}
      <div ref={logEndRef} />
    </div>

    {/* 3. Bottom status bar - fixed at bottom */}
    <div style={{
      height: "28px",
      background: "#007acc", // Classic blue status bar
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 12px",
      fontSize: "12px",
      fontWeight: 500
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <span>Status: {statusText}</span>
        <span>|</span>
        <span>Loaded: {kindleClippings.length} items</span>
      </div>
      <div style={{ display: "flex", gap: "15px" }}>
        <span>Selected: {selectedIndices.size}</span>
        <span>Notion ID: {databaseId ? 'Configured' : 'Not Configured'}</span>
      </div>
    </div>

  </div>
);
}

export default App;