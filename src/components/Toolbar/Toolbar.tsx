import {
  ChevronDown,
  Download,
  Eye,
  Grid2X2,
  History,
  Minus,
  MousePointer2,
  Plus,
  Redo2,
  Settings,
  Undo2,
} from "lucide-react";
import { APP_INFO } from "../../config/app";
import { useStudioStore } from "../../store/studio-store";

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
          title="Undo"
        >
          <Undo2 size={17} />
        </button>
        <button
          className="toolbar-icon"
          onClick={redo}
          disabled={!future.length}
          title="Redo"
        >
          <Redo2 size={17} />
        </button>
      </div>
      <div className="zoom-control">
        <button onClick={() => setZoom(zoom - 10)} title="Zoom out">
          <Minus size={15} />
        </button>
        <span>{zoom}%</span>
        <button onClick={() => setZoom(zoom + 10)} title="Zoom in">
          <Plus size={15} />
        </button>
        <ChevronDown size={13} />
      </div>
      <div className="toolbar-actions">
        <button
          className={showGrid ? "toolbar-icon selected" : "toolbar-icon"}
          onClick={toggleGrid}
          title="Toggle grid"
        >
          <Grid2X2 size={17} />
        </button>
        <button
          className={showGuides ? "toolbar-icon selected" : "toolbar-icon"}
          onClick={toggleGuides}
          title="Toggle guides"
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
          기존 편집기
        </button>
        <button className="toolbar-button" title="Preview">
          <Eye size={16} />
          미리보기
        </button>
        <button className="toolbar-button primary" onClick={download}>
          <Download size={16} />
          내보내기
        </button>
        <button className="toolbar-icon" title="Settings">
          <Settings size={17} />
        </button>
      </div>
    </header>
  );
}
