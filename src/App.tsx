import { About } from "./components/About";
import { DesignCanvas } from "./components/Canvas/DesignCanvas";
import { Footer } from "./components/Footer";
import { PropertiesPanel } from "./components/Properties/PropertiesPanel";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { Toolbar } from "./components/Toolbar/Toolbar";
import { LayersPanel } from "./components/Layers/LayersPanel";
import { useStudioStore } from "./store/studio-store";
import { useTranslation } from "./hooks/useTranslation";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";

export default function App() {
  const { theme, view } = useStudioStore();
  const { t } = useTranslation();
  useKeyboardShortcuts();
  return (
    <div className="app-shell" data-theme={theme}>
      <Toolbar />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          {view === "about" ? <About /> : <DesignCanvas />}
        </main>
        {view === "studio" && <LayersPanel />}
        {view === "studio" && <PropertiesPanel />}
      </div>
      <Footer />
      <p className="creator-notice" role="status">
        {t("app.creatorNotice")}
      </p>
    </div>
  );
}
