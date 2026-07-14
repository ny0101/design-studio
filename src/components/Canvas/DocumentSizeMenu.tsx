import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useStudioStore } from "../../store/studio-store";
import { useTranslation } from "../../hooks/useTranslation";

const PRESETS: { key: string; width: number; height: number }[] = [
  { key: "instagramPost", width: 1080, height: 1080 },
  { key: "instagramStory", width: 1080, height: 1920 },
  { key: "youtubeThumbnail", width: 1280, height: 720 },
  { key: "presentation", width: 1920, height: 1080 },
  { key: "a4", width: 794, height: 1123 },
];

export function DocumentSizeMenu() {
  const { canvasSize, setCanvasSize } = useStudioStore();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState(String(canvasSize.width));
  const [height, setHeight] = useState(String(canvasSize.height));
  const menu = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setWidth(String(canvasSize.width));
    setHeight(String(canvasSize.height));
  }, [canvasSize]);
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!menu.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open]);
  const applyCustom = () => {
    const w = Number(width);
    const h = Number(height);
    if (!Number.isFinite(w) || !Number.isFinite(h) || w < 100 || h < 100) return;
    setCanvasSize({ width: w, height: h });
    setOpen(false);
  };
  return (
    <div className="size-menu" ref={menu}>
      <button className="size-menu-trigger" onClick={() => setOpen(!open)}>
        {canvasSize.width} × {canvasSize.height} px
        <ChevronDown size={12} />
      </button>
      {open && (
        <div className="size-dropdown">
          {PRESETS.map((preset) => (
            <button
              key={preset.key}
              className={
                canvasSize.width === preset.width && canvasSize.height === preset.height
                  ? "selected"
                  : undefined
              }
              onClick={() => {
                setCanvasSize({ width: preset.width, height: preset.height });
                setOpen(false);
              }}
            >
              <span>{t(`sizes.${preset.key}`)}</span>
              <em>
                {preset.width}×{preset.height}
              </em>
            </button>
          ))}
          <div className="size-custom">
            <input
              type="number"
              min={100}
              max={8000}
              value={width}
              onChange={(event) => setWidth(event.target.value)}
              aria-label={t("sizes.width")}
            />
            ×
            <input
              type="number"
              min={100}
              max={8000}
              value={height}
              onChange={(event) => setHeight(event.target.value)}
              aria-label={t("sizes.height")}
            />
            <button onClick={applyCustom}>{t("sizes.apply")}</button>
          </div>
        </div>
      )}
    </div>
  );
}
