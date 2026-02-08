// App.tsx
import { ConfigPanel } from "./components/ConfigPanel";
import { SearchBar } from "./components/SearchBar";
import { LogConsole } from "./components/LogConsole";
import { StatusBar } from "./components/StatusBar";
import { ClippingTree } from "./components/ClippingTree";
import { useAppLogic } from "./hooks/useAppLogic"; // Import the single hook
import "./App.css";

function App() {
  const data = useAppLogic();

  return (
    <div className="app-container">
      <div className="main-content">
        <header>
          <h1>Kindle2Notion</h1>
          <p>Seamlessly sync your Kindle reading notes to Notion database</p>
        </header>
        <ConfigPanel 
          apiKey={data.apiKey} setApiKey={data.setApiKey}
          databaseId={data.databaseId} setDatabaseId={data.setDatabaseId}
          onSave={data.saveConfig}
        />

        <div className="toolbar">
          <button onClick={data.handleImport}>
            📂 Import
          </button>
          
          {/* New Compare Button */}
          <button 
            className="secondary" 
            onClick={data.handleCompare}
            disabled={data.kindleClippings.length === 0 || data.isComparing}
            title="Fetch Notion data and show only new clippings"
          >
            🔄 Compare
          </button>

          <SearchBar value={data.searchTerm} onChange={data.setSearchTerm} />
          
          <button 
            className="primary"
            onClick={data.handleSync} 
            disabled={data.selectedIndices.size === 0}
          >
            🚀 Sync ({data.selectedIndices.size})
          </button>
        </div>

        <div className="tree-container">
          <ClippingTree 
            groups={data.displayGroups} 
            selectedIndices={data.selectedIndices} 
            onToggle={data.handleToggle}
            collapsedBookKeys={data.collapsedBookKeys}
            onToggleBookNode={data.handleToggleBookNode}
          />
        </div>
      </div>

      <LogConsole logs={data.logs} />
      <StatusBar 
        status={data.statusText} 
        total={data.kindleClippings.length} 
        selected={data.selectedIndices.size} 
      />
    </div>
  );
};

export default App;