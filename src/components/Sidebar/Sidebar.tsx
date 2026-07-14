import { useRef } from "react";
import {
  BoxSelect,
  Image,
  LayoutTemplate,
  MousePointer2,
  Palette,
  Shapes,
  Sparkles,
  Type,
  Upload,
} from "lucide-react";
import type { StudioTool } from "../../types/studio";
import { useStudioStore } from "../../store/studio-store";
import { useTranslation } from "../../hooks/useTranslation";

const tools: { id: StudioTool; icon: typeof MousePointer2 }[] = [
  { id: "select", icon: MousePointer2 },
  { id: "text", icon: Type },
  { id: "image", icon: Image },
  { id: "shape", icon: Shapes },
  { id: "background", icon: Palette },
  { id: "elements", icon: Sparkles },
  { id: "template", icon: LayoutTemplate },
  { id: "upload", icon: Upload },
];
export function Sidebar() {
  const input = useRef<HTMLInputElement>(null);
  const { activeTool, setTool, add } = useStudioStore();
  const { t } = useTranslation();
  const onUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () =>
      add({
        id: crypto.randomUUID(),
        name: file.name,
        kind: "image",
        src: String(reader.result),
        x: 180,
        y: 220,
        width: 640,
        height: 420,
        radius: 0,
        brightness: 100,
        rotation: 0,
        opacity: 1,
        hidden: false,
        locked: false,
      });
    reader.readAsDataURL(file);
  };
  return (
    <aside className="tool-sidebar" aria-label={t("canvas.label")}>
      <input
        ref={input}
        className="sr-only"
        type="file"
        accept="image/*"
        onChange={(event) => event.target.files?.[0] && onUpload(event.target.files[0])}
      />
      <div className="tool-list">
        {tools.map(({ id, icon: Icon }) => (
          <button
            key={id}
            className={activeTool === id ? "tool-item active" : "tool-item"}
            onClick={() => (id === "upload" ? input.current?.click() : setTool(id))}
            title={t(`tools.${id}`)}
          >
            <Icon size={20} />
            <span>{t(`tools.${id}`)}</span>
          </button>
        ))}
      </div>
      <div className="sidebar-footer">
        <BoxSelect size={18} />
        <span>{t("sidebar.workspace")}</span>
      </div>
    </aside>
  );
}
