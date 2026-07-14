import { ImagePlus, SlidersHorizontal } from "lucide-react";
import type { CanvasElement } from "../../types/studio";
import { useStudioStore } from "../../store/studio-store";
import { useTranslation } from "../../hooks/useTranslation";

const NumberField = ({
  label,
  value,
  onChange,
  min = 0,
  max = 300,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) => (
  <label className="property-field">
    <span>{label}</span>
    <div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <output>{value}</output>
    </div>
  </label>
);

function EmptyProperties() {
  const { t } = useTranslation();
  return (
    <div className="empty-properties">
      <SlidersHorizontal size={24} />
      <b>{t("properties.emptyTitle")}</b>
      <p>{t("properties.emptyHint")}</p>
    </div>
  );
}

export function PropertiesPanel() {
  const { elements, selectedId, update, add } = useStudioStore();
  const { t } = useTranslation();
  const selected = elements.find((element) => element.id === selectedId);
  const upload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () =>
      add({
        id: crypto.randomUUID(),
        name: file.name,
        kind: "image",
        src: String(reader.result),
        x: 190,
        y: 200,
        width: 620,
        height: 430,
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
    <aside className="properties-panel">
      <div className="panel-heading">
        <p>{t("properties.title")}</p>
        <span>{selected ? t(`kinds.${selected.kind}`) : t("kinds.noSelection")}</span>
      </div>
      {!selected && <EmptyProperties />}
      {selected && <Properties element={selected} update={update} upload={upload} />}
    </aside>
  );
}

function Properties({
  element,
  update,
  upload,
}: {
  element: CanvasElement;
  update: (id: string, patch: Partial<CanvasElement>) => void;
  upload: (file: File) => void;
}) {
  const { t } = useTranslation();
  const change = (patch: Partial<CanvasElement>) => update(element.id, patch);
  return (
    <div className="property-groups">
      <section>
        <h3>{t("properties.transform")}</h3>
        <div className="property-row">
          <label>
            X
            <input
              type="number"
              value={Math.round(element.x)}
              onChange={(event) => change({ x: Number(event.target.value) })}
            />
          </label>
          <label>
            Y
            <input
              type="number"
              value={Math.round(element.y)}
              onChange={(event) => change({ y: Number(event.target.value) })}
            />
          </label>
        </div>
        <NumberField
          label={t("properties.opacity")}
          value={Math.round(element.opacity * 100)}
          max={100}
          onChange={(value) => change({ opacity: value / 100 })}
        />
        <NumberField
          label={t("properties.rotation")}
          value={Math.round(element.rotation)}
          min={-180}
          max={180}
          onChange={(value) => change({ rotation: value })}
        />
      </section>
      {element.kind === "text" && (
        <section>
          <h3>{t("properties.text")}</h3>
          <label className="property-field">
            <span>{t("properties.content")}</span>
            <textarea
              value={element.text}
              onChange={(event) => change({ text: event.target.value })}
            />
          </label>
          <label className="property-field">
            <span>{t("properties.font")}</span>
            <select
              value={element.fontStyle}
              onChange={(event) =>
                change({ fontStyle: event.target.value as "normal" | "bold" })
              }
            >
              <option value="normal">{t("properties.regular")}</option>
              <option value="bold">{t("properties.bold")}</option>
            </select>
          </label>
          <NumberField
            label={t("properties.size")}
            value={element.fontSize}
            min={12}
            max={220}
            onChange={(value) => change({ fontSize: value })}
          />
          <label className="property-field color">
            <span>{t("properties.color")}</span>
            <input
              type="color"
              value={element.fill}
              onChange={(event) => change({ fill: event.target.value })}
            />
          </label>
        </section>
      )}
      {element.kind === "rect" && (
        <section>
          <h3>{t("properties.shape")}</h3>
          <label className="property-field color">
            <span>{t("properties.fill")}</span>
            <input
              type="color"
              value={element.fill}
              onChange={(event) => change({ fill: event.target.value })}
            />
          </label>
          <NumberField
            label={t("properties.radius")}
            value={element.radius}
            max={180}
            onChange={(value) => change({ radius: value })}
          />
        </section>
      )}
      {element.kind === "circle" && (
        <section>
          <h3>{t("properties.shape")}</h3>
          <label className="property-field color">
            <span>{t("properties.fill")}</span>
            <input
              type="color"
              value={element.fill}
              onChange={(event) => change({ fill: event.target.value })}
            />
          </label>
          <NumberField
            label={t("properties.radius")}
            value={element.radius}
            max={420}
            onChange={(value) => change({ radius: value })}
          />
        </section>
      )}
      {element.kind === "image" && (
        <section>
          <h3>{t("properties.image")}</h3>
          <label className="upload-replace">
            <ImagePlus size={16} />
            {t("properties.replaceImage")}
            <input
              type="file"
              accept="image/*"
              onChange={(event) =>
                event.target.files?.[0] && upload(event.target.files[0])
              }
            />
          </label>
          <NumberField
            label={t("properties.radius")}
            value={element.radius}
            max={180}
            onChange={(value) => change({ radius: value })}
          />
          <NumberField
            label={t("properties.brightness")}
            value={element.brightness}
            min={0}
            max={200}
            onChange={(value) => change({ brightness: value })}
          />
        </section>
      )}
    </div>
  );
}
