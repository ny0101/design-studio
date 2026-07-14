import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ImagePlus,
  SlidersHorizontal,
} from "lucide-react";
import type { CanvasElement, TextAlign, TextElement } from "../../types/studio";
import { useStudioStore } from "../../store/studio-store";
import { useTranslation } from "../../hooks/useTranslation";
import { DEFAULT_FONT, FONT_FAMILIES, FONT_WEIGHTS } from "../../utils/fonts";

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

function TextProperties({
  element,
  change,
}: {
  element: TextElement;
  change: (patch: Partial<TextElement>) => void;
}) {
  const { t } = useTranslation();
  const shadow = element.shadow ?? {
    enabled: false,
    color: "#000000",
    blur: 12,
    offsetX: 0,
    offsetY: 6,
  };
  const outline = element.outline ?? { enabled: false, color: "#FFFFFF", width: 2 };
  const aligns: { value: TextAlign; icon: typeof AlignLeft; label: string }[] = [
    { value: "left", icon: AlignLeft, label: t("properties.alignLeft") },
    { value: "center", icon: AlignCenter, label: t("properties.alignCenter") },
    { value: "right", icon: AlignRight, label: t("properties.alignRight") },
  ];
  return (
    <>
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
          <span>{t("properties.fontFamily")}</span>
          <select
            value={element.fontFamily ?? DEFAULT_FONT}
            onChange={(event) => change({ fontFamily: event.target.value })}
          >
            {FONT_FAMILIES.map((font) => (
              <option key={font.label} value={font.value}>
                {font.label}
              </option>
            ))}
          </select>
        </label>
        <label className="property-field">
          <span>{t("properties.fontWeight")}</span>
          <select
            value={element.fontWeight ?? 400}
            onChange={(event) => change({ fontWeight: Number(event.target.value) })}
          >
            {FONT_WEIGHTS.map((weight) => (
              <option key={weight.value} value={weight.value}>
                {t(`weights.${weight.key}`)}
              </option>
            ))}
          </select>
        </label>
        <NumberField
          label={t("properties.size")}
          value={element.fontSize}
          min={6}
          max={300}
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
        <NumberField
          label={t("properties.letterSpacing")}
          value={Math.round(element.letterSpacing ?? 0)}
          min={-5}
          max={40}
          onChange={(value) => change({ letterSpacing: value })}
        />
        <NumberField
          label={t("properties.lineHeight")}
          value={Math.round(element.lineHeight * 100)}
          min={70}
          max={250}
          onChange={(value) => change({ lineHeight: value / 100 })}
        />
        <div className="property-field">
          <span>{t("properties.alignment")}</span>
          <div className="align-buttons">
            {aligns.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                className={(element.align ?? "left") === value ? "selected" : undefined}
                onClick={() => change({ align: value })}
                title={label}
              >
                <Icon size={15} />
              </button>
            ))}
          </div>
        </div>
      </section>
      <section>
        <h3>{t("properties.shadow")}</h3>
        <label className="property-toggle">
          <input
            type="checkbox"
            checked={shadow.enabled}
            onChange={(event) =>
              change({ shadow: { ...shadow, enabled: event.target.checked } })
            }
          />
          <span>{t("properties.enabled")}</span>
        </label>
        {shadow.enabled && (
          <>
            <label className="property-field color">
              <span>{t("properties.color")}</span>
              <input
                type="color"
                value={shadow.color}
                onChange={(event) =>
                  change({ shadow: { ...shadow, color: event.target.value } })
                }
              />
            </label>
            <NumberField
              label={t("properties.blur")}
              value={shadow.blur}
              max={80}
              onChange={(value) => change({ shadow: { ...shadow, blur: value } })}
            />
            <NumberField
              label={t("properties.offsetX")}
              value={shadow.offsetX}
              min={-60}
              max={60}
              onChange={(value) => change({ shadow: { ...shadow, offsetX: value } })}
            />
            <NumberField
              label={t("properties.offsetY")}
              value={shadow.offsetY}
              min={-60}
              max={60}
              onChange={(value) => change({ shadow: { ...shadow, offsetY: value } })}
            />
          </>
        )}
      </section>
      <section>
        <h3>{t("properties.outline")}</h3>
        <label className="property-toggle">
          <input
            type="checkbox"
            checked={outline.enabled}
            onChange={(event) =>
              change({ outline: { ...outline, enabled: event.target.checked } })
            }
          />
          <span>{t("properties.enabled")}</span>
        </label>
        {outline.enabled && (
          <>
            <label className="property-field color">
              <span>{t("properties.color")}</span>
              <input
                type="color"
                value={outline.color}
                onChange={(event) =>
                  change({ outline: { ...outline, color: event.target.value } })
                }
              />
            </label>
            <NumberField
              label={t("properties.outlineWidth")}
              value={outline.width}
              min={1}
              max={24}
              onChange={(value) => change({ outline: { ...outline, width: value } })}
            />
          </>
        )}
      </section>
    </>
  );
}

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
      {element.kind === "text" && <TextProperties element={element} change={change} />}
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
      {element.kind === "ellipse" && (
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
        </section>
      )}
      {element.kind === "polygon" && (
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
            label={t("properties.sides")}
            value={element.sides}
            min={3}
            max={12}
            onChange={(value) => change({ sides: value })}
          />
        </section>
      )}
      {element.kind === "star" && (
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
            label={t("properties.starPoints")}
            value={element.points}
            min={3}
            max={12}
            onChange={(value) => change({ points: value })}
          />
          <NumberField
            label={t("properties.innerRadius")}
            value={Math.round(element.innerRadius)}
            min={5}
            max={400}
            onChange={(value) => change({ innerRadius: value })}
          />
        </section>
      )}
      {(element.kind === "arrow" || element.kind === "line") && (
        <section>
          <h3>{t("properties.shape")}</h3>
          <label className="property-field color">
            <span>{t("properties.stroke")}</span>
            <input
              type="color"
              value={element.stroke}
              onChange={(event) => change({ stroke: event.target.value })}
            />
          </label>
          <NumberField
            label={t("properties.strokeWidth")}
            value={element.strokeWidth}
            min={1}
            max={40}
            onChange={(value) => change({ strokeWidth: value })}
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
