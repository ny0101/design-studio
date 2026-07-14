import type { ReactNode } from "react";
import type { ShapePreset } from "../../utils/shapes";
import { SHAPE_PRESETS, createShapeElement } from "../../utils/shapes";
import { CANVAS_SIZE } from "../Canvas/DesignCanvas";
import { useStudioStore } from "../../store/studio-store";
import { useTranslation } from "../../hooks/useTranslation";

const glyphs: Record<ShapePreset, ReactNode> = {
  rectangle: <rect x="3" y="6" width="18" height="12" />,
  rounded: <rect x="3" y="6" width="18" height="12" rx="4" />,
  circle: <circle cx="12" cy="12" r="9" />,
  ellipse: <ellipse cx="12" cy="12" rx="10" ry="6.5" />,
  triangle: <polygon points="12,4 21,20 3,20" />,
  polygon: <polygon points="12,3 19.8,7.5 19.8,16.5 12,21 4.2,16.5 4.2,7.5" />,
  star: <polygon points="12,3 14.4,9 20.8,9.2 15.8,13.2 17.6,19.4 12,15.8 6.4,19.4 8.2,13.2 3.2,9.2 9.6,9" />,
  arrow: (
    <path
      d="M3 12h13m0 0-5-5m5 5-5 5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  line: (
    <path d="M4 19 20 5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
  ),
};

export function ShapePicker() {
  const { add, setTool } = useStudioStore();
  const { t } = useTranslation();
  const pick = (preset: ShapePreset) => {
    add(
      createShapeElement(
        preset,
        { x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2 },
        t(`shapes.${preset}`),
      ),
    );
    setTool("select");
  };
  return (
    <div className="shape-panel">
      <p className="shape-panel-title">{t("shapes.title")}</p>
      <div className="shape-grid">
        {SHAPE_PRESETS.map((preset) => (
          <button
            key={preset}
            onClick={() => pick(preset)}
            title={t(`shapes.${preset}`)}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              {glyphs[preset]}
            </svg>
            <span>{t(`shapes.${preset}`)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
