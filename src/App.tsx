// Services
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

// Hooks
import { useNotionConfig } from "./hooks/useNotionConfig";
import { useKindleData } from "./hooks/useKindleData";
import { useLogger } from "./hooks/useLogger";

// CSS
import "./App.css";

function App() {
  // 1. Domain-specific hooks
  const config = useNotionConfig();
  const data = useKindleData();
  const logger = useLogger();

  // 2. Orchestration logic (Keep this in App or a dedicated sync hook)
  const handleSync = async () => {
    if (!config.apiKey || !config.databaseId) {
      alert("Config missing");
      return;
    }

    const toSync = data.kindleClippings.filter((_, i) => data.selectedIndices.has(i));
    if (toSync.length === 0) return;

    logger.setStatusText("Syncing...");
    try {
      logger.addLog(`>>> Starting sync for ${toSync.length} items`);
      
      // ... Step 1: Adapt
      const kindleBooks = adaptKindleClippingsToBooks(toSync);
      
      // ... Step 2: Fetch
      const notionClippings = await getAllBookClippings(config.apiKey, config.databaseId);
      const notionBooks = adaptNotionBooksToStandardBooks(notionClippings);

      // ... Step 3: Compare & Upload
      const comparison = compareBooks(notionBooks, kindleBooks);
      
      if (comparison.newBooks.length > 0) {
        await createNotionPagesForNewBooks(config.apiKey, config.databaseId, comparison.newBooks, logger.addLog);
      }
      if (comparison.updatedBooks.length > 0) {
        await appendNotionBlocksToExistingBooks(config.apiKey, comparison.updatedBooks, logger.addLog);
      }

      logger.setStatusText("Sync successful");
    } catch (error: any) {
      logger.setStatusText("Sync failed");
      logger.addLog(`Error: ${error.message}`);
    }
  };

  return (
    <div className="app-container">
      <div className="main-content">
        <header>
          <h1>Kindle2Notion</h1>
          <p>Seamlessly sync your Kindle reading notes to Notion database</p>
        </header>
        <ConfigPanel 
          apiKey={config.apiKey} setApiKey={config.setApiKey}
          databaseId={config.databaseId} setDatabaseId={config.setDatabaseId}
          onSave={() => { config.saveConfig(); logger.addLog("System: Config saved"); }}
        />

        <div className="toolbar">
          <button onClick={() => data.handleImport((n) => logger.addLog(`Imported ${n} items`))}>
            📂 Import
          </button>
          <SearchBar value={data.searchTerm} onChange={data.setSearchTerm} />
          <button onClick={handleSync} disabled={data.selectedIndices.size === 0}>
            🚀 Sync ({data.selectedIndices.size})
          </button>
        </div>
        <div className="tree-container">
          <ClippingTree 
            groups={data.displayGroups} 
            selectedIndices={data.selectedIndices} 
            onToggle={data.handleToggle} />
        </div>
      </div>

      <LogConsole logs={logger.logs} />
      <StatusBar 
        status={logger.statusText} 
        total={data.kindleClippings.length} 
        selected={data.selectedIndices.size} 
      />
    </div>
  );
};

export default App;