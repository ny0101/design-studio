import { useStudioStore } from "../../store/studio-store";
import { useTranslation } from "../../hooks/useTranslation";

const SWATCHES = [
  "#FFFFFF",
  "#F5F3EE",
  "#F7F4EF",
  "#ECEEF2",
  "#16181D",
  "#15161A",
  "#6C7CFF",
  "#B4FF55",
  "#F0428C",
  "#FFD43B",
  "#2EC4B6",
  "#FF7A59",
  "#8338EC",
  "#0EA5E9",
];

export function BackgroundPicker() {
  const { elements, canvasSize, setBackground } = useStudioStore();
  const { t } = useTranslation();
  const first = elements[0];
  const current =
    first &&
    first.kind === "rect" &&
    first.x <= 0 &&
    first.y <= 0 &&
    first.x + first.width >= canvasSize.width &&
    first.y + first.height >= canvasSize.height
      ? first.fill
      : "#FFFFFF";
  return (
    <div className="shape-panel background-panel">
      <p className="shape-panel-title">{t("background.title")}</p>
      <div className="swatch-grid">
        {SWATCHES.map((color) => (
          <button
            key={color}
            className={current.toUpperCase() === color ? "selected" : undefined}
            style={{ background: color }}
            onClick={() => setBackground(color)}
            title={color}
          />
        ))}
      </div>
      <label className="background-custom">
        <span>{t("background.custom")}</span>
        <input
          type="color"
          value={current}
          onChange={(event) => setBackground(event.target.value)}
        />
      </label>
    </div>
  );
}
