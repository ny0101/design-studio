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
  Ruler,
  Settings,
  SquareDashed,
  Undo2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { APP_INFO } from "../../config/app";
import { useStudioStore } from "../../store/studio-store";
import { useTranslation } from "../../hooks/useTranslation";

const EXPORT_FORMATS = ["png", "png-transparent", "jpg", "svg", "pdf"] as const;

function ExportMenu() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!menu.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open]);
  const exportAs = (format: string) => {
    setOpen(false);
    window.dispatchEvent(
      new CustomEvent("design-studio:export", { detail: { format } }),
    );
  };
  return (
    <div className="export-menu" ref={menu}>
      <button className="toolbar-button primary" onClick={() => setOpen(!open)}>
        <Download size={16} />
        {t("toolbar.export")}
      </button>
      {open && (
        <div className="export-dropdown">
          {EXPORT_FORMATS.map((format) => (
            <button key={format} onClick={() => exportAs(format)}>
              {t(`export.${format}`)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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
    toggleRulers,
    toggleSafeArea,
    showGrid,
    showGuides,
    showRulers,
    showSafeArea,
  } = useStudioStore();
  const { t, language, setLanguage } = useTranslation();
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
          className={showRulers ? "toolbar-icon selected" : "toolbar-icon"}
          onClick={toggleRulers}
          title={t("toolbar.toggleRulers")}
        >
          <Ruler size={17} />
        </button>
        <button
          className={showSafeArea ? "toolbar-icon selected" : "toolbar-icon"}
          onClick={toggleSafeArea}
          title={t("toolbar.toggleSafeArea")}
        >
          <SquareDashed size={17} />
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
        <ExportMenu />
        <button className="toolbar-icon" title={t("toolbar.settings")}>
          <Settings size={17} />
        </button>
      </div>
    </header>
  );
}
