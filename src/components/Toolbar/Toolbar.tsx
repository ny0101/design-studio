import {
  ChevronDown,
  Download,
  Eye,
  ExternalLink,
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
import { parseProjectFile, serializeProject } from "../../utils/project";

const EXPORT_FORMATS = ["png", "png-transparent", "jpg", "svg", "pdf"] as const;

function useDismiss(open: boolean, close: () => void) {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) close();
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open, close]);
  return container;
}

const ZOOM_PRESETS = [25, 50, 75, 100, 150, 200, 400];

function ZoomMenu() {
  const { t } = useTranslation();
  const setZoom = useStudioStore((state) => state.setZoom);
  const [open, setOpen] = useState(false);
  const container = useDismiss(open, () => setOpen(false));
  return (
    <div className="export-menu" ref={container}>
      <button className="toolbar-icon" onClick={() => setOpen(!open)} title={t("toolbar.zoomMenu")}>
        <ChevronDown size={13} />
      </button>
      {open && (
        <div className="export-dropdown">
          <button
            onClick={() => {
              setOpen(false);
              window.dispatchEvent(new Event("design-studio:fit"));
            }}
          >
            {t("toolbar.zoomFit")}
          </button>
          {ZOOM_PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => {
                setZoom(preset);
                setOpen(false);
              }}
            >
              {preset}%
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SettingsMenu() {
  const { t } = useTranslation();
  const { theme, setTheme, resetProject, loadProject } = useStudioStore();
  const [open, setOpen] = useState(false);
  const container = useDismiss(open, () => setOpen(false));
  const fileInput = useRef<HTMLInputElement>(null);
  const saveProject = () => {
    const { elements, canvasSize } = useStudioStore.getState();
    const blob = new Blob([serializeProject(elements, canvasSize)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "design-studio-project.json";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    setOpen(false);
  };
  const openProject = async (file: File) => {
    const data = parseProjectFile(await file.text());
    if (data) loadProject(data.elements, data.canvasSize);
    setOpen(false);
  };
  return (
    <div className="export-menu" ref={container}>
      <input
        ref={fileInput}
        className="sr-only"
        type="file"
        accept="application/json,.json"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void openProject(file);
          event.target.value = "";
        }}
      />
      <button className="toolbar-icon" onClick={() => setOpen(!open)} title={t("toolbar.settings")}>
        <Settings size={17} />
      </button>
      {open && (
        <div className="export-dropdown">
          <button
            onClick={() => {
              resetProject();
              setOpen(false);
            }}
          >
            {t("menu.newDocument")}
          </button>
          <button onClick={() => fileInput.current?.click()}>
            {t("menu.openProject")}
          </button>
          <button onClick={saveProject}>{t("menu.saveProject")}</button>
          <button
            onClick={() => {
              setTheme(theme === "dark" ? "light" : "dark");
              setOpen(false);
            }}
          >
            {theme === "dark" ? t("menu.lightTheme") : t("menu.darkTheme")}
          </button>
        </div>
      )}
    </div>
  );
}

function ExportMenu() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const menu = useDismiss(open, () => setOpen(false));
  const exportAs = (format: string) => {
    setOpen(false);
    window.dispatchEvent(
      new CustomEvent("design-studio:export", { detail: { format } }),
    );
  };
  const exportToFigma = () => {
    exportAs("svg");
    window.alert(t("export.figmaInstructions"));
  };
  return (
    <div className="export-menu" ref={menu}>
      <button className="toolbar-button primary" onClick={() => setOpen(!open)}>
        <Download size={16} />
        <span className="toolbar-button-label">{t("toolbar.export")}</span>
      </button>
      {open && (
        <div className="export-dropdown">
          {EXPORT_FORMATS.map((format) => (
            <button key={format} onClick={() => exportAs(format)}>
              {t(`export.${format}`)}
            </button>
          ))}
          <span className="export-dropdown-divider" />
          <button onClick={exportToFigma}>
            <ExternalLink size={13} />
            {t("export.figma")}
          </button>
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
        <ZoomMenu />
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
          className={
            showGrid
              ? "toolbar-icon toolbar-icon-compact-hide selected"
              : "toolbar-icon toolbar-icon-compact-hide"
          }
          onClick={toggleGrid}
          title={t("toolbar.toggleGrid")}
        >
          <Grid2X2 size={17} />
        </button>
        <button
          className={
            showGuides
              ? "toolbar-icon toolbar-icon-compact-hide selected"
              : "toolbar-icon toolbar-icon-compact-hide"
          }
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
        <SettingsMenu />
      </div>
    </header>
  );
}
