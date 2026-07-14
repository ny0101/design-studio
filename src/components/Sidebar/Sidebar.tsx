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

const tools: { id: StudioTool; label: string; icon: typeof MousePointer2 }[] = [
  { id: "select", label: "Select", icon: MousePointer2 },
  { id: "text", label: "Text", icon: Type },
  { id: "image", label: "Image", icon: Image },
  { id: "shape", label: "Shape", icon: Shapes },
  { id: "background", label: "Background", icon: Palette },
  { id: "elements", label: "Elements", icon: Sparkles },
  { id: "template", label: "Template", icon: LayoutTemplate },
  { id: "upload", label: "Upload", icon: Upload },
];
export function Sidebar() {
  const input = useRef<HTMLInputElement>(null);
  const { activeTool, setTool, add } = useStudioStore();
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
    <aside className="tool-sidebar" aria-label="Design tools">
      <input
        ref={input}
        className="sr-only"
        type="file"
        accept="image/*"
        onChange={(event) => event.target.files?.[0] && onUpload(event.target.files[0])}
      />
      <div className="tool-list">
        {tools.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={activeTool === id ? "tool-item active" : "tool-item"}
            onClick={() => (id === "upload" ? input.current?.click() : setTool(id))}
            title={label}
          >
            <Icon size={20} />
            <span>{label}</span>
          </button>
        ))}
      </div>
      <div className="sidebar-footer">
        <BoxSelect size={18} />
        <span>
          Phase 1<br />
          workspace
        </span>
      </div>
    </aside>
  );
}
