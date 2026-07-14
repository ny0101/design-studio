import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  FlipHorizontal2,
  FlipVertical2,
  ImagePlus,
  SlidersHorizontal,
} from "lucide-react";
import type {
  CanvasElement,
  ElementShadow,
  ImageElement,
  TextAlign,
  TextElement,
} from "../../types/studio";
import { useStudioStore } from "../../store/studio-store";
import { useTranslation } from "../../hooks/useTranslation";
import { DEFAULT_FONT, FONT_FAMILIES, FONT_WEIGHTS } from "../../utils/fonts";
import { computeCenteredCrop, loadImageSource } from "../../utils/images";

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

const DEFAULT_SHADOW: ElementShadow = {
  enabled: false,
  color: "#000000",
  blur: 12,
  offsetX: 0,
  offsetY: 6,
};

function ShadowControls({
  shadow,
  onChange,
}: {
  shadow: ElementShadow;
  onChange: (shadow: ElementShadow) => void;
}) {
  const { t } = useTranslation();
  return (
    <section>
      <h3>{t("properties.shadow")}</h3>
      <label className="property-toggle">
        <input
          type="checkbox"
          checked={shadow.enabled}
          onChange={(event) => onChange({ ...shadow, enabled: event.target.checked })}
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
              onChange={(event) => onChange({ ...shadow, color: event.target.value })}
            />
          </label>
          <NumberField
            label={t("properties.blur")}
            value={shadow.blur}
            max={80}
            onChange={(value) => onChange({ ...shadow, blur: value })}
          />
          <NumberField
            label={t("properties.offsetX")}
            value={shadow.offsetX}
            min={-60}
            max={60}
            onChange={(value) => onChange({ ...shadow, offsetX: value })}
          />
          <NumberField
            label={t("properties.offsetY")}
            value={shadow.offsetY}
            min={-60}
            max={60}
            onChange={(value) => onChange({ ...shadow, offsetY: value })}
          />
        </>
      )}
    </section>
  );
}

function TextProperties({
  element,
  change,
}: {
  element: TextElement;
  change: (patch: Partial<TextElement>) => void;
}) {
  const { t } = useTranslation();
  const shadow = element.shadow ?? DEFAULT_SHADOW;
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
      <ShadowControls shadow={shadow} onChange={(next) => change({ shadow: next })} />
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

const CROP_PRESETS: { key: string; ratio: number | null }[] = [
  { key: "original", ratio: null },
  { key: "1:1", ratio: 1 },
  { key: "4:3", ratio: 4 / 3 },
  { key: "3:4", ratio: 3 / 4 },
  { key: "16:9", ratio: 16 / 9 },
  { key: "9:16", ratio: 9 / 16 },
];

function ImageProperties({
  element,
  change,
  upload,
}: {
  element: ImageElement;
  change: (patch: Partial<ImageElement>) => void;
  upload: (file: File) => void;
}) {
  const { t } = useTranslation();
  const shadow = element.shadow ?? DEFAULT_SHADOW;
  const applyCrop = (key: string) => {
    const preset = CROP_PRESETS.find((item) => item.key === key);
    if (!preset) return;
    const probe = new Image();
    probe.onload = () => {
      if (preset.ratio === null) {
        change({
          crop: undefined,
          height: Math.round(element.width * (probe.height / probe.width)),
        });
      } else {
        change({
          crop: computeCenteredCrop(probe.width, probe.height, preset.ratio),
          height: Math.round(element.width / preset.ratio),
        });
      }
    };
    probe.src = element.src;
  };
  const currentCrop = element.crop
    ? (CROP_PRESETS.find(
        (item) =>
          item.ratio !== null &&
          element.crop &&
          Math.abs(element.crop.width / element.crop.height - item.ratio) < 0.01,
      )?.key ?? "original")
    : "original";
  return (
    <>
      <section>
        <h3>{t("properties.image")}</h3>
        <label className="upload-replace">
          <ImagePlus size={16} />
          {t("properties.replaceImage")}
          <input
            type="file"
            accept="image/*"
            onChange={(event) => event.target.files?.[0] && upload(event.target.files[0])}
          />
        </label>
        <div className="property-field">
          <span>{t("properties.flip")}</span>
          <div className="align-buttons">
            <button
              className={element.flipX ? "selected" : undefined}
              onClick={() => change({ flipX: !element.flipX })}
              title={t("properties.flipH")}
            >
              <FlipHorizontal2 size={15} />
            </button>
            <button
              className={element.flipY ? "selected" : undefined}
              onClick={() => change({ flipY: !element.flipY })}
              title={t("properties.flipV")}
            >
              <FlipVertical2 size={15} />
            </button>
          </div>
        </div>
        <label className="property-field">
          <span>{t("properties.crop")}</span>
          <select value={currentCrop} onChange={(event) => applyCrop(event.target.value)}>
            {CROP_PRESETS.map((preset) => (
              <option key={preset.key} value={preset.key}>
                {preset.key === "original" ? t("properties.cropOriginal") : preset.key}
              </option>
            ))}
          </select>
        </label>
        <NumberField
          label={t("properties.radius")}
          value={element.radius}
          max={180}
          onChange={(value) => change({ radius: value })}
        />
      </section>
      <section>
        <h3>{t("properties.filters")}</h3>
        <NumberField
          label={t("properties.brightness")}
          value={element.brightness}
          min={0}
          max={200}
          onChange={(value) => change({ brightness: value })}
        />
        <NumberField
          label={t("properties.contrast")}
          value={element.contrast ?? 0}
          min={-100}
          max={100}
          onChange={(value) => change({ contrast: value })}
        />
        <NumberField
          label={t("properties.saturation")}
          value={element.saturation ?? 0}
          min={-100}
          max={100}
          onChange={(value) => change({ saturation: value })}
        />
        <NumberField
          label={t("properties.blur")}
          value={element.blurRadius ?? 0}
          max={40}
          onChange={(value) => change({ blurRadius: value })}
        />
        <label className="property-toggle">
          <input
            type="checkbox"
            checked={element.grayscale ?? false}
            onChange={(event) => change({ grayscale: event.target.checked })}
          />
          <span>{t("properties.grayscale")}</span>
        </label>
      </section>
      <ShadowControls shadow={shadow} onChange={(next) => change({ shadow: next })} />
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
  const { elements, selectedIds, update } = useStudioStore();
  const { t } = useTranslation();
  const selected =
    selectedIds.length === 1
      ? elements.find((element) => element.id === selectedIds[0])
      : undefined;
  const multiCount = selectedIds.length;
  const upload = async (file: File) => {
    if (!selected || selected.kind !== "image") return;
    const { src, naturalWidth, naturalHeight } = await loadImageSource(file);
    update(selected.id, {
      src,
      name: file.name,
      height: Math.round(selected.width * (naturalHeight / naturalWidth)),
      crop: undefined,
    });
  };
  return (
    <aside className="properties-panel">
      <div className="panel-heading">
        <p>{t("properties.title")}</p>
        <span>
          {selected
            ? t(`kinds.${selected.kind}`)
            : multiCount > 1
              ? t("properties.multiSelected", { count: multiCount })
              : t("kinds.noSelection")}
        </span>
      </div>
      {!selected && multiCount <= 1 && <EmptyProperties />}
      {!selected && multiCount > 1 && (
        <div className="empty-properties">
          <SlidersHorizontal size={24} />
          <b>{t("properties.multiSelected", { count: multiCount })}</b>
          <p>{t("properties.multiHint")}</p>
        </div>
      )}
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
        <>
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
          <ShadowControls
            shadow={element.shadow ?? DEFAULT_SHADOW}
            onChange={(next) => change({ shadow: next })}
          />
        </>
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
        <ImageProperties element={element} change={change} upload={upload} />
      )}
      {element.kind === "icon" && (
        <section>
          <h3>{t("properties.icon")}</h3>
          <label className="property-field color">
            <span>{t("properties.color")}</span>
            <input
              type="color"
              value={element.color}
              onChange={(event) => change({ color: event.target.value })}
            />
          </label>
          <NumberField
            label={t("properties.strokeWidth")}
            value={element.strokeWidth ?? 2}
            min={1}
            max={4}
            onChange={(value) => change({ strokeWidth: value })}
          />
        </section>
      )}
    </div>
  );
}
