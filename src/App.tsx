// App.tsx
import { ConfigPanel } from "./components/ConfigPanel";
import { SearchBar } from "./components/SearchBar";
import { LogConsole } from "./components/LogConsole";
import { StatusBar } from "./components/StatusBar";
import { ClippingTree } from "./components/ClippingTree";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { useAppLogic } from "./hooks/useAppLogic"; // Import the single hook
import { useLanguage } from "./i18n/LanguageContext";
import "./App.css";

function App() {
  const data = useAppLogic();
  const { t } = useLanguage();

  return (
    <div className="app-container">
      <div className="main-content">
        <header>
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80px' }}>
            <div style={{ textAlign: 'center' }}>
              <h1>{t.header.title}</h1>
              <p>{t.header.subtitle}</p>
            </div>
            <div style={{ position: 'absolute', right: 0 }}>
              <LanguageSwitcher />
            </div>
          </div>
        </header>
        <ConfigPanel 
          apiKey={data.apiKey} setApiKey={data.setApiKey}
          databaseId={data.databaseId} setDatabaseId={data.setDatabaseId}
          onSave={data.saveConfig}
        />

        <div className="toolbar">
          <button onClick={data.handleImport}>
            📂 {t.buttons.import}
          </button>
          
          {/* New Compare Button */}
          <button 
            className="secondary" 
            onClick={data.handleCompare}
            disabled={data.kindleClippings.length === 0 || data.isComparing}
            title={t.messages.compareTooltip}
          >
            🔄 {t.buttons.compare}
          </button>

          <SearchBar value={data.searchTerm} onChange={data.setSearchTerm} />
          
          <button 
            className="primary"
            onClick={data.handleSync} 
            disabled={data.selectedIndices.size === 0}
          >
            🚀 {t.buttons.sync} ({data.selectedIndices.size})
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
        statusKey={data.statusKey} 
        total={data.kindleClippings.length} 
        selected={data.selectedIndices.size} 
      />
    </div>
  );
};

export default App;