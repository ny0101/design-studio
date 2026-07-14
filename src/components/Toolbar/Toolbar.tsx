import {
  ChevronDown,
  Download,
  Eye,
  Grid2X2,
  History,
  Languages,
  Minus,
  MousePointer2,
  Plus,
  Redo2,
  Settings,
  Undo2,
} from "lucide-react";
import { APP_INFO } from "../../config/app";
import { useStudioStore } from "../../store/studio-store";
import { useTranslation } from "../../hooks/useTranslation";

export function Toolbar() {
  const {
    zoom,
    setZoom,
    undo,
    redo,
    past,
    future,
    toggleGrid,
    toggleGuides,
    showGrid,
    showGuides,
  } = useStudioStore();
  const { t, language, setLanguage } = useTranslation();
  const download = () => window.dispatchEvent(new Event("design-studio:export"));
  return (
    <header className="toolbar">
      <div className="toolbar-start">
        <button
          className="brand"
          onClick={() => useStudioStore.getState().setView("studio")}
        >
          <span className="brand-mark">DS</span>
          <span>{APP_INFO.name}</span>
        </button>
        <span className="toolbar-divider" />
        <button
          className="toolbar-icon"
          onClick={undo}
          disabled={!past.length}
          title={t("toolbar.undo")}
        >
          <Undo2 size={17} />
        </button>
        <button
          className="toolbar-icon"
          onClick={redo}
          disabled={!future.length}
          title={t("toolbar.redo")}
        >
          <Redo2 size={17} />
        </button>
      </div>
      <div className="zoom-control">
        <button onClick={() => setZoom(zoom - 10)} title={t("toolbar.zoomOut")}>
          <Minus size={15} />
        </button>
        <span>{zoom}%</span>
        <button onClick={() => setZoom(zoom + 10)} title={t("toolbar.zoomIn")}>
          <Plus size={15} />
        </button>
        <ChevronDown size={13} />
      </div>
      <div className="toolbar-actions">
        <button
          className="language-toggle"
          onClick={() => setLanguage(language === "ko" ? "en" : "ko")}
          title={t("toolbar.language")}
        >
          <Languages size={17} />
          <span>{language === "ko" ? "KO" : "EN"}</span>
        </button>
        <button
          className={showGrid ? "toolbar-icon selected" : "toolbar-icon"}
          onClick={toggleGrid}
          title={t("toolbar.toggleGrid")}
        >
          <Grid2X2 size={17} />
        </button>
        <button
          className={showGuides ? "toolbar-icon selected" : "toolbar-icon"}
          onClick={toggleGuides}
          title={t("toolbar.toggleGuides")}
        >
          <MousePointer2 size={17} />
        </button>
        <button
          className="toolbar-button"
          onClick={() =>
            window.open("./legacy/design-studio.html", "_blank", "noopener,noreferrer")
          }
        >
          <History size={16} />
          {t("toolbar.legacyEditor")}
        </button>
        <button className="toolbar-button" title={t("toolbar.preview")}>
          <Eye size={16} />
          {t("toolbar.preview")}
        </button>
        <button className="toolbar-button primary" onClick={download}>
          <Download size={16} />
          {t("toolbar.export")}
        </button>
        <button className="toolbar-icon" title={t("toolbar.settings")}>
          <Settings size={17} />
        </button>
      </div>
    </header>
  );
}
