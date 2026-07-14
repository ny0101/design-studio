import { createElement, useCallback, useEffect, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  Arrow,
  Circle,
  Ellipse,
  Group,
  Image as KonvaImage,
  Layer,
  Line,
  Rect,
  RegularPolygon,
  Stage,
  Star,
  Text,
  Transformer,
} from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import Konva from "konva";
import type {
  CanvasElement,
  CanvasPan,
  FillGradient,
  IconElement,
  ImageElement,
  ShapeStroke,
  TextElement,
} from "../../types/studio";
import { getIconComponent } from "../../utils/icons";
import { useStudioStore } from "../../store/studio-store";
import { useTranslation } from "../../hooks/useTranslation";
import { createShapeElement } from "../../utils/shapes";
import { DEFAULT_FONT } from "../../utils/fonts";
import { createImageElement } from "../../utils/images";
import { buildSvg } from "../../utils/svg-export";
import { DocumentSizeMenu } from "./DocumentSizeMenu";

const MIN_SIZE = 5;

const gradientProps = (
  gradient: FillGradient | undefined,
  width: number,
  height: number,
  centered: boolean,
) => {
  if (!gradient?.enabled) return {};
  const radians = (gradient.angle * Math.PI) / 180;
  const centerX = centered ? 0 : width / 2;
  const centerY = centered ? 0 : height / 2;
  const half = {
    x: (Math.cos(radians) * width) / 2,
    y: (Math.sin(radians) * height) / 2,
  };
  return {
    fillPriority: "linear-gradient",
    fillLinearGradientStartPoint: { x: centerX - half.x, y: centerY - half.y },
    fillLinearGradientEndPoint: { x: centerX + half.x, y: centerY + half.y },
    fillLinearGradientColorStops: [0, gradient.from, 1, gradient.to],
  };
};

const strokeProps = (stroke: ShapeStroke | undefined) =>
  stroke?.enabled ? { stroke: stroke.color, strokeWidth: stroke.width } : {};
const RULER_SIZE = 22;
const SAFE_AREA_INSET = 54;
const SNAP_THRESHOLD = 6;
const id = () => crypto.randomUUID();

function RasterImage({
  element,
  shared,
}: {
  element: ImageElement;
  shared: Record<string, unknown>;
}) {
  const [image, setImage] = useState<HTMLImageElement>();
  const node = useRef<Konva.Image>(null);
  useEffect(() => {
    const next = new window.Image();
    next.onload = () => setImage(next);
    next.src = element.src;
  }, [element.src]);
  const brightness = (element.brightness - 100) / 100;
  const contrast = element.contrast ?? 0;
  const saturation = element.saturation ?? 0;
  const blurRadius = element.blurRadius ?? 0;
  const grayscale = element.grayscale ?? false;
  const filters: typeof Konva.Filters.Brighten[] = [];
  if (brightness !== 0) filters.push(Konva.Filters.Brighten);
  if (contrast !== 0) filters.push(Konva.Filters.Contrast);
  if (saturation !== 0) filters.push(Konva.Filters.HSL);
  if (blurRadius > 0) filters.push(Konva.Filters.Blur);
  if (grayscale) filters.push(Konva.Filters.Grayscale);
  useEffect(() => {
    const konvaImage = node.current;
    if (!konvaImage || !image) return;
    if (filters.length) konvaImage.cache();
    else konvaImage.clearCache();
    konvaImage.getLayer()?.batchDraw();
  }, [
    image,
    filters.length,
    brightness,
    contrast,
    saturation,
    blurRadius,
    grayscale,
    element.width,
    element.height,
    element.radius,
    element.crop,
  ]);
  return (
    <KonvaImage
      ref={node}
      {...shared}
      image={image}
      width={element.width}
      height={element.height}
      cornerRadius={element.radius}
      crop={element.crop}
      scaleX={element.flipX ? -1 : 1}
      scaleY={element.flipY ? -1 : 1}
      offsetX={element.flipX ? element.width : 0}
      offsetY={element.flipY ? element.height : 0}
      filters={filters}
      brightness={brightness}
      contrast={contrast}
      saturation={saturation / 50}
      blurRadius={blurRadius}
      shadowEnabled={element.shadow?.enabled ?? false}
      shadowColor={element.shadow?.color}
      shadowBlur={element.shadow?.blur}
      shadowOffsetX={element.shadow?.offsetX}
      shadowOffsetY={element.shadow?.offsetY}
    />
  );
}

function IconNode({
  element,
  shared,
}: {
  element: IconElement;
  shared: Record<string, unknown>;
}) {
  const [image, setImage] = useState<HTMLImageElement>();
  const rasterSize = Math.max(
    64,
    Math.ceil(Math.max(element.width, element.height) / 64) * 128,
  );
  useEffect(() => {
    const IconComponent = getIconComponent(element.icon);
    if (!IconComponent) return;
    const svg = renderToStaticMarkup(
      createElement(IconComponent, {
        color: element.color,
        strokeWidth: element.strokeWidth ?? 2,
        size: rasterSize,
      }),
    );
    const next = new window.Image();
    next.onload = () => setImage(next);
    next.src = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }, [element.icon, element.color, element.strokeWidth, rasterSize]);
  return (
    <KonvaImage {...shared} image={image} width={element.width} height={element.height} />
  );
}

function ElementNode({
  element,
  editingId,
  onEditText,
}: {
  element: CanvasElement;
  editingId: string | null;
  onEditText: (id: string) => void;
}) {
  const { select, toggleSelect, update } = useStudioStore();
  if (element.hidden) return null;
  const selectNode = (
    event: KonvaEventObject<MouseEvent> | KonvaEventObject<TouchEvent>,
  ) => {
    const shift = "shiftKey" in event.evt && event.evt.shiftKey;
    if (shift) {
      toggleSelect(element.id);
      return;
    }
    const { selectedIds } = useStudioStore.getState();
    if (!selectedIds.includes(element.id)) select(element.id, { expandGroup: true });
  };
  const transformEnd = (event: KonvaEventObject<Event>) => {
    const node = event.target;
    const scaleX = Math.abs(node.scaleX());
    const scaleY = Math.abs(node.scaleY());
    node.scaleX(1);
    node.scaleY(1);
    const base = { x: node.x(), y: node.y(), rotation: node.rotation() };
    if (element.kind === "circle") {
      update(element.id, {
        ...base,
        radius: Math.max(MIN_SIZE, element.radius * ((scaleX + scaleY) / 2)),
      });
    } else if (element.kind === "ellipse") {
      update(element.id, {
        ...base,
        radiusX: Math.max(MIN_SIZE, element.radiusX * scaleX),
        radiusY: Math.max(MIN_SIZE, element.radiusY * scaleY),
      });
    } else if (element.kind === "polygon") {
      update(element.id, {
        ...base,
        radius: Math.max(MIN_SIZE, element.radius * ((scaleX + scaleY) / 2)),
      });
    } else if (element.kind === "star") {
      const factor = (scaleX + scaleY) / 2;
      update(element.id, {
        ...base,
        innerRadius: Math.max(MIN_SIZE / 2, element.innerRadius * factor),
        outerRadius: Math.max(MIN_SIZE, element.outerRadius * factor),
      });
    } else if (element.kind === "arrow" || element.kind === "line") {
      update(element.id, {
        ...base,
        points: element.points.map((value, index) =>
          index % 2 === 0 ? value * scaleX : value * scaleY,
        ),
      });
    } else if (element.kind === "text") {
      update(element.id, {
        ...base,
        width: Math.max(MIN_SIZE * 4, element.width * scaleX),
        fontSize: Math.max(6, Math.round(element.fontSize * scaleY)),
      });
    } else {
      update(element.id, {
        ...base,
        width: Math.max(MIN_SIZE, element.width * scaleX),
        height: Math.max(MIN_SIZE, element.height * scaleY),
      });
    }
  };
  const shared = {
    id: element.id,
    x: element.x,
    y: element.y,
    rotation: element.rotation,
    opacity: element.opacity,
    draggable: !element.locked,
    onMouseDown: selectNode,
    onTap: selectNode,
    onTransformEnd: transformEnd,
  };
  if (element.kind === "text")
    return (
      <Text
        {...shared}
        visible={editingId !== element.id}
        text={element.text}
        width={element.width}
        fontSize={element.fontSize}
        fontFamily={element.fontFamily ?? DEFAULT_FONT}
        fontStyle={String(element.fontWeight ?? 400)}
        fill={element.fill}
        lineHeight={element.lineHeight}
        letterSpacing={element.letterSpacing ?? 0}
        align={element.align ?? "left"}
        shadowEnabled={element.shadow?.enabled ?? false}
        shadowColor={element.shadow?.color}
        shadowBlur={element.shadow?.blur}
        shadowOffsetX={element.shadow?.offsetX}
        shadowOffsetY={element.shadow?.offsetY}
        stroke={element.outline?.enabled ? element.outline.color : undefined}
        strokeWidth={element.outline?.enabled ? element.outline.width : 0}
        fillAfterStrokeEnabled
        shadowForStrokeEnabled={false}
        onDblClick={() => !element.locked && onEditText(element.id)}
        onDblTap={() => !element.locked && onEditText(element.id)}
      />
    );
  if (element.kind === "rect")
    return (
      <Rect
        {...shared}
        width={element.width}
        height={element.height}
        fill={element.fill}
        cornerRadius={element.radius}
        {...gradientProps(element.gradient, element.width, element.height, false)}
        {...strokeProps(element.stroke)}
        shadowEnabled={element.shadow?.enabled ?? false}
        shadowColor={element.shadow?.color}
        shadowBlur={element.shadow?.blur}
        shadowOffsetX={element.shadow?.offsetX}
        shadowOffsetY={element.shadow?.offsetY}
        shadowForStrokeEnabled={false}
      />
    );
  if (element.kind === "circle")
    return (
      <Circle
        {...shared}
        radius={element.radius}
        fill={element.fill}
        {...gradientProps(element.gradient, element.radius * 2, element.radius * 2, true)}
        {...strokeProps(element.stroke)}
      />
    );
  if (element.kind === "ellipse")
    return (
      <Ellipse
        {...shared}
        radiusX={element.radiusX}
        radiusY={element.radiusY}
        fill={element.fill}
        {...gradientProps(element.gradient, element.radiusX * 2, element.radiusY * 2, true)}
        {...strokeProps(element.stroke)}
      />
    );
  if (element.kind === "polygon")
    return (
      <RegularPolygon
        {...shared}
        sides={element.sides}
        radius={element.radius}
        fill={element.fill}
        {...gradientProps(element.gradient, element.radius * 2, element.radius * 2, true)}
        {...strokeProps(element.stroke)}
      />
    );
  if (element.kind === "star")
    return (
      <Star
        {...shared}
        numPoints={element.points}
        innerRadius={element.innerRadius}
        outerRadius={element.outerRadius}
        fill={element.fill}
        {...gradientProps(
          element.gradient,
          element.outerRadius * 2,
          element.outerRadius * 2,
          true,
        )}
        {...strokeProps(element.stroke)}
      />
    );
  if (element.kind === "arrow")
    return (
      <Arrow
        {...shared}
        points={element.points}
        stroke={element.stroke}
        fill={element.stroke}
        strokeWidth={element.strokeWidth}
        pointerLength={element.pointerLength}
        pointerWidth={element.pointerWidth}
        hitStrokeWidth={24}
        lineCap="round"
      />
    );
  if (element.kind === "line")
    return (
      <Line
        {...shared}
        points={element.points}
        stroke={element.stroke}
        strokeWidth={element.strokeWidth}
        hitStrokeWidth={24}
        lineCap="round"
      />
    );
  if (element.kind === "icon") return <IconNode element={element} shared={shared} />;
  return <RasterImage element={element} shared={shared} />;
}

function SelectionTransformer() {
  const transformer = useRef<Konva.Transformer>(null);
  const { elements, selectedIds } = useStudioStore();
  const selectedElements = elements.filter(
    (item) => selectedIds.includes(item.id) && !item.locked && !item.hidden,
  );
  useEffect(() => {
    const node = transformer.current;
    if (!node) return;
    const stage = node.getStage();
    const targets = selectedElements
      .map((item) => stage?.findOne(`#${item.id}`))
      .filter((target): target is NonNullable<typeof target> => Boolean(target));
    node.nodes(targets);
    node.getLayer()?.batchDraw();
  }, [selectedElements, elements]);
  const selected = selectedElements.length === 1 ? selectedElements[0] : undefined;
  const anchors =
    selectedElements.length > 1
      ? ["top-left", "top-right", "bottom-left", "bottom-right"]
      : selected?.kind === "text"
        ? ["top-left", "top-right", "bottom-left", "bottom-right", "middle-left", "middle-right"]
        : selected?.kind === "circle" || selected?.kind === "polygon" || selected?.kind === "star"
          ? ["top-left", "top-right", "bottom-left", "bottom-right"]
          : selected?.kind === "arrow" || selected?.kind === "line"
            ? ["middle-left", "middle-right"]
            : undefined;
  return (
    <Transformer
      ref={transformer}
      enabledAnchors={anchors}
      rotateEnabled
      anchorSize={9}
      anchorCornerRadius={4}
      anchorStroke="#6C7CFF"
      borderStroke="#6C7CFF"
      anchorFill="#FFFFFF"
      ignoreStroke
      boundBoxFunc={(oldBox, newBox) =>
        Math.abs(newBox.width) < MIN_SIZE || Math.abs(newBox.height) < MIN_SIZE
          ? oldBox
          : newBox
      }
    />
  );
}

const pickRulerStep = (scale: number) => {
  const steps = [5, 10, 25, 50, 100, 250, 500, 1000, 2500];
  return steps.find((step) => step * scale >= 55) ?? 5000;
};

function Ruler({
  orientation,
  offset,
  scale,
  length,
}: {
  orientation: "horizontal" | "vertical";
  offset: number;
  scale: number;
  length: number;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const node = canvas.current;
    if (!node || length <= 0) return;
    const dpr = window.devicePixelRatio || 1;
    const horizontal = orientation === "horizontal";
    node.width = (horizontal ? length : RULER_SIZE) * dpr;
    node.height = (horizontal ? RULER_SIZE : length) * dpr;
    const ctx = node.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, length, RULER_SIZE);
    ctx.font = "9px Inter, system-ui, sans-serif";
    ctx.fillStyle = "#8a8f9c";
    ctx.strokeStyle = "#464a56";
    const step = pickRulerStep(scale);
    const minor = step / 5;
    const firstIndex = Math.floor(-offset / scale / minor);
    const lastIndex = Math.ceil((length - offset) / scale / minor);
    ctx.beginPath();
    for (let index = firstIndex; index <= lastIndex; index += 1) {
      const value = index * minor;
      const screen = value * scale + offset;
      const major = index % 5 === 0;
      const tick = major ? RULER_SIZE - 12 : RULER_SIZE - 5;
      if (horizontal) {
        ctx.moveTo(screen + 0.5, tick);
        ctx.lineTo(screen + 0.5, RULER_SIZE);
      } else {
        ctx.moveTo(tick, screen + 0.5);
        ctx.lineTo(RULER_SIZE, screen + 0.5);
      }
      if (major) {
        if (horizontal) {
          ctx.fillText(String(Math.round(value)), screen + 3, 9);
        } else {
          ctx.save();
          ctx.translate(9, screen + 3);
          ctx.rotate(-Math.PI / 2);
          ctx.textAlign = "right";
          ctx.fillText(String(Math.round(value)), 0, 0);
          ctx.restore();
        }
      }
    }
    ctx.stroke();
  }, [orientation, offset, scale, length]);
  return <canvas ref={canvas} className={`ruler ruler-${orientation}`} />;
}

interface SnapTargets {
  vertical: number[];
  horizontal: number[];
}

export function DesignCanvas() {
  const stageRef = useRef<Konva.Stage>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<Konva.Layer>(null);
  const artboardRef = useRef<Konva.Rect>(null);
  const snapV = useRef<Konva.Line>(null);
  const snapH = useRef<Konva.Line>(null);
  const snapTargets = useRef<SnapTargets>({ vertical: [], horizontal: [] });
  const dragOrigin = useRef<CanvasPan | null>(null);
  const multiDrag = useRef<
    { id: string; node: Konva.Node; startX: number; startY: number }[] | null
  >(null);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [panning, setPanning] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const {
    elements,
    select,
    zoom,
    setZoom,
    pan,
    setPan,
    canvasSize,
    showGrid,
    showGuides,
    showRulers,
    showSafeArea,
    add,
    setTool,
  } = useStudioStore();
  const { t } = useTranslation();
  const scale = zoom / 100;
  const canvasW = canvasSize.width;
  const canvasH = canvasSize.height;
  const centeredPan: CanvasPan = {
    x: (viewport.width - canvasW * scale) / 2,
    y: (viewport.height - canvasH * scale) / 2,
  };
  const effectivePan = pan ?? centeredPan;

  useEffect(() => {
    const fit = () => {
      const node = viewportRef.current;
      if (!node) return;
      const zoomFit = Math.floor(
        Math.min(
          (node.clientWidth - 90) / canvasW,
          (node.clientHeight - 90) / canvasH,
        ) * 100,
      );
      setZoom(zoomFit);
      setPan(null);
    };
    window.addEventListener("design-studio:fit", fit);
    return () => window.removeEventListener("design-studio:fit", fit);
  }, [canvasW, canvasH, setZoom, setPan]);

  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;
    const observer = new ResizeObserver(() =>
      setViewport({ width: node.clientWidth, height: node.clientHeight }),
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const autoFitted = useRef(false);
  useEffect(() => {
    if (autoFitted.current || viewport.width === 0 || viewport.height === 0) return;
    autoFitted.current = true;
    const zoomFit = Math.floor(
      Math.min((viewport.width - 90) / canvasW, (viewport.height - 90) / canvasH) * 100,
    );
    if (Number.isFinite(zoomFit) && zoomFit > 0 && zoomFit < zoom) {
      setZoom(zoomFit);
    }
  }, [viewport, canvasW, canvasH, zoom, setZoom]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space" || event.repeat) return;
      const target = event.target as HTMLElement;
      if (
        target.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(target.tagName)
      )
        return;
      event.preventDefault();
      setPanning(true);
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") setPanning(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useEffect(() => {
    const download = (href: string, filename: string) => {
      const link = document.createElement("a");
      link.download = filename;
      link.href = href;
      link.click();
    };
    const exportCanvas = async (event: Event) => {
      const format =
        (event as CustomEvent<{ format?: string }>).detail?.format ?? "png";
      const state = useStudioStore.getState();
      const { width: exportW, height: exportH } = state.canvasSize;
      if (format === "svg") {
        const svg = buildSvg(state.elements, exportW, exportH);
        const blob = new Blob([svg], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        download(url, "design-studio.svg");
        URL.revokeObjectURL(url);
        return;
      }
      const stage = stageRef.current;
      const overlay = overlayRef.current;
      if (!stage) return;
      overlay?.visible(false);
      const hiddenNodes: Konva.Node[] = [];
      if (format === "png-transparent") {
        if (artboardRef.current) hiddenNodes.push(artboardRef.current);
        const bottom = state.elements[0];
        if (
          bottom &&
          bottom.kind === "rect" &&
          !bottom.hidden &&
          bottom.x <= 0 &&
          bottom.y <= 0 &&
          bottom.x + bottom.width >= exportW &&
          bottom.y + bottom.height >= exportH
        ) {
          const node = stage.findOne(`#${bottom.id}`);
          if (node) hiddenNodes.push(node);
        }
      }
      hiddenNodes.forEach((node) => node.visible(false));
      const currentScale = state.zoom / 100;
      const position = stage.position();
      const uri = stage.toDataURL({
        x: position.x,
        y: position.y,
        width: exportW * currentScale,
        height: exportH * currentScale,
        pixelRatio: 2 / currentScale,
        mimeType: format === "jpg" ? "image/jpeg" : "image/png",
        quality: 0.92,
      });
      hiddenNodes.forEach((node) => node.visible(true));
      overlay?.visible(true);
      if (format === "pdf") {
        const { jsPDF } = await import("jspdf");
        const doc = new jsPDF({
          orientation: exportW > exportH ? "landscape" : "portrait",
          unit: "px",
          format: [exportW, exportH],
        });
        doc.addImage(uri, "PNG", 0, 0, exportW, exportH);
        doc.save("design-studio.pdf");
        return;
      }
      const extension = format === "jpg" ? "jpg" : "png";
      download(uri, `design-studio.${extension}`);
    };
    window.addEventListener("design-studio:export", exportCanvas);
    return () => window.removeEventListener("design-studio:export", exportCanvas);
  }, []);

  useEffect(() => {
    const onAlign = (event: Event) => {
      const mode = (event as CustomEvent<{ mode?: string }>).detail?.mode;
      const stage = stageRef.current;
      if (!mode || !stage) return;
      const state = useStudioStore.getState();
      const layer = stage.getLayers()[0];
      const items = state.elements
        .filter(
          (element) =>
            state.selectedIds.includes(element.id) &&
            !element.locked &&
            !element.hidden,
        )
        .flatMap((element) => {
          const node = stage.findOne(`#${element.id}`);
          return node
            ? [
                {
                  element,
                  rect: node.getClientRect({ relativeTo: layer, skipShadow: true }),
                },
              ]
            : [];
        });
      if (!items.length) return;
      const bounds =
        items.length > 1
          ? {
              x: Math.min(...items.map((item) => item.rect.x)),
              y: Math.min(...items.map((item) => item.rect.y)),
              right: Math.max(...items.map((item) => item.rect.x + item.rect.width)),
              bottom: Math.max(...items.map((item) => item.rect.y + item.rect.height)),
            }
          : { x: 0, y: 0, right: state.canvasSize.width, bottom: state.canvasSize.height };
      const patches: { id: string; patch: { x?: number; y?: number } }[] = [];
      if (mode === "distributeH" || mode === "distributeV") {
        if (items.length < 3) return;
        const horizontal = mode === "distributeH";
        const sorted = [...items].sort((a, b) =>
          horizontal ? a.rect.x - b.rect.x : a.rect.y - b.rect.y,
        );
        const total = horizontal ? bounds.right - bounds.x : bounds.bottom - bounds.y;
        const occupied = sorted.reduce(
          (sum, item) => sum + (horizontal ? item.rect.width : item.rect.height),
          0,
        );
        const gap = (total - occupied) / (sorted.length - 1);
        let cursor = horizontal ? bounds.x : bounds.y;
        for (const item of sorted) {
          const delta = cursor - (horizontal ? item.rect.x : item.rect.y);
          patches.push({
            id: item.element.id,
            patch: horizontal
              ? { x: item.element.x + delta }
              : { y: item.element.y + delta },
          });
          cursor += (horizontal ? item.rect.width : item.rect.height) + gap;
        }
      } else {
        for (const item of items) {
          let dx = 0;
          let dy = 0;
          if (mode === "left") dx = bounds.x - item.rect.x;
          else if (mode === "centerX")
            dx = (bounds.x + bounds.right) / 2 - (item.rect.x + item.rect.width / 2);
          else if (mode === "right") dx = bounds.right - (item.rect.x + item.rect.width);
          else if (mode === "top") dy = bounds.y - item.rect.y;
          else if (mode === "centerY")
            dy = (bounds.y + bounds.bottom) / 2 - (item.rect.y + item.rect.height / 2);
          else if (mode === "bottom")
            dy = bounds.bottom - (item.rect.y + item.rect.height);
          patches.push({
            id: item.element.id,
            patch: { x: item.element.x + dx, y: item.element.y + dy },
          });
        }
      }
      state.updateMany(patches);
    };
    window.addEventListener("design-studio:align", onAlign);
    return () => window.removeEventListener("design-studio:align", onAlign);
  }, []);

  const onWheel = (event: KonvaEventObject<WheelEvent>) => {
    event.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    if (event.evt.ctrlKey || event.evt.metaKey) {
      const pointer = stage.getPointerPosition();
      if (!pointer) return;
      const oldScale = scale;
      const factor = event.evt.deltaY > 0 ? 0.92 : 1.08;
      const nextZoom = Math.min(400, Math.max(10, Math.round(zoom * factor)));
      const nextScale = nextZoom / 100;
      if (nextZoom === zoom) return;
      const anchor = {
        x: (pointer.x - effectivePan.x) / oldScale,
        y: (pointer.y - effectivePan.y) / oldScale,
      };
      setPan({
        x: pointer.x - anchor.x * nextScale,
        y: pointer.y - anchor.y * nextScale,
      });
      setZoom(nextZoom);
    } else {
      setPan({
        x: effectivePan.x - event.evt.deltaX,
        y: effectivePan.y - event.evt.deltaY,
      });
    }
  };

  const collectSnapTargets = useCallback((dragged: Konva.Node) => {
    const layer = dragged.getLayer();
    const state = useStudioStore.getState();
    const { width, height } = state.canvasSize;
    const vertical = [0, width / 2, width];
    const horizontal = [0, height / 2, height];
    const moving = new Set(
      state.selectedIds.includes(dragged.id()) ? state.selectedIds : [dragged.id()],
    );
    for (const element of state.elements) {
      if (moving.has(element.id) || element.hidden) continue;
      const node = layer?.findOne(`#${element.id}`);
      if (!node) continue;
      const box = node.getClientRect({ relativeTo: layer ?? undefined, skipShadow: true });
      vertical.push(box.x, box.x + box.width / 2, box.x + box.width);
      horizontal.push(box.y, box.y + box.height / 2, box.y + box.height);
    }
    snapTargets.current = { vertical, horizontal };
  }, []);

  const hideSnapLines = () => {
    snapV.current?.visible(false);
    snapH.current?.visible(false);
    overlayRef.current?.batchDraw();
  };

  const onLayerDragEnd = (event: KonvaEventObject<DragEvent>) => {
    hideSnapLines();
    const node = event.target;
    const state = useStudioStore.getState();
    if (multiDrag.current?.length) {
      state.updateMany([
        { id: node.id(), patch: { x: node.x(), y: node.y() } },
        ...multiDrag.current.map((item) => ({
          id: item.id,
          patch: { x: item.node.x(), y: item.node.y() },
        })),
      ]);
    } else {
      state.update(node.id(), { x: node.x(), y: node.y() });
    }
    multiDrag.current = null;
    dragOrigin.current = null;
  };

  const onLayerDragStart = (event: KonvaEventObject<DragEvent>) => {
    const node = event.target;
    const state = useStudioStore.getState();
    if (event.evt.altKey) {
      const element = state.elements.find((item) => item.id === node.id());
      if (element) state.add({ ...element, id: id() }, { select: false });
    }
    collectSnapTargets(node);
    dragOrigin.current = { x: node.x(), y: node.y() };
    if (state.selectedIds.includes(node.id()) && state.selectedIds.length > 1) {
      const layer = node.getLayer();
      multiDrag.current = state.selectedIds
        .filter((selectedId) => selectedId !== node.id())
        .flatMap((selectedId) => {
          const element = state.elements.find((item) => item.id === selectedId);
          const other = layer?.findOne(`#${selectedId}`);
          return other && element && !element.locked
            ? [{ id: selectedId, node: other, startX: other.x(), startY: other.y() }]
            : [];
        });
    } else {
      multiDrag.current = null;
    }
  };

  const onLayerDragMove = (event: KonvaEventObject<DragEvent>) => {
    const node = event.target;
    const layer = node.getLayer();
    if (!layer) return;
    const threshold = SNAP_THRESHOLD / scale;
    const box = node.getClientRect({ relativeTo: layer, skipShadow: true });
    const ownV = [box.x, box.x + box.width / 2, box.x + box.width];
    const ownH = [box.y, box.y + box.height / 2, box.y + box.height];
    let bestV: { delta: number; line: number } | null = null;
    let bestH: { delta: number; line: number } | null = null;
    for (const own of ownV) {
      for (const target of snapTargets.current.vertical) {
        const delta = target - own;
        if (Math.abs(delta) <= threshold && (!bestV || Math.abs(delta) < Math.abs(bestV.delta)))
          bestV = { delta, line: target };
      }
    }
    for (const own of ownH) {
      for (const target of snapTargets.current.horizontal) {
        const delta = target - own;
        if (Math.abs(delta) <= threshold && (!bestH || Math.abs(delta) < Math.abs(bestH.delta)))
          bestH = { delta, line: target };
      }
    }
    if (bestV) node.x(node.x() + bestV.delta);
    if (bestH) node.y(node.y() + bestH.delta);
    if (multiDrag.current && dragOrigin.current) {
      const dx = node.x() - dragOrigin.current.x;
      const dy = node.y() - dragOrigin.current.y;
      for (const item of multiDrag.current) {
        item.node.position({ x: item.startX + dx, y: item.startY + dy });
      }
    }
    const range = 100000;
    if (snapV.current) {
      snapV.current.visible(Boolean(bestV));
      if (bestV) snapV.current.points([bestV.line, -range, bestV.line, range]);
    }
    if (snapH.current) {
      snapH.current.visible(Boolean(bestH));
      if (bestH) snapH.current.points([-range, bestH.line, range, bestH.line]);
    }
    overlayRef.current?.batchDraw();
  };

  const onStageDragEnd = (event: KonvaEventObject<DragEvent>) => {
    const stage = stageRef.current;
    if (stage && event.target === stage) {
      setPan({ x: stage.x(), y: stage.y() });
    }
  };

  const addText = (position: CanvasPan) => {
    add({
      id: id(),
      name: t("defaults.newText"),
      kind: "text",
      x: position.x,
      y: position.y,
      text: t("defaults.newTextContent"),
      fontSize: 68,
      fontWeight: 700,
      fill: "#16181D",
      width: 660,
      lineHeight: 1.1,
      rotation: 0,
      opacity: 1,
      hidden: false,
      locked: false,
    });
    setTool("select");
  };
  const addShape = (position: CanvasPan) => {
    add(createShapeElement("rectangle", position, t("shapes.rectangle")));
    setTool("select");
  };

  const onDropFiles = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/"),
    );
    if (!files.length) return;
    const bounds = viewportRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const position = {
      x: (event.clientX - bounds.left - effectivePan.x) / scale,
      y: (event.clientY - bounds.top - effectivePan.y) / scale,
    };
    for (const [index, file] of files.entries()) {
      const element = await createImageElement(file, {
        x: position.x + index * 30,
        y: position.y + index * 30,
      });
      add(element);
    }
  };

  const onStageClick = (event: KonvaEventObject<MouseEvent>) => {
    if (panning) return;
    const stage = stageRef.current;
    const tool = useStudioStore.getState().activeTool;
    if ((tool === "text" || tool === "shape") && stage) {
      const pointer = stage.getPointerPosition();
      if (!pointer) return;
      const position = {
        x: (pointer.x - effectivePan.x) / scale,
        y: (pointer.y - effectivePan.y) / scale,
      };
      if (tool === "text") addText(position);
      else addShape(position);
      return;
    }
    if (event.target === event.target.getStage()) select(null);
  };

  const gridCols = Math.floor(canvasW / 40) + 1;
  const gridRows = Math.floor(canvasH / 40) + 1;
  const editingText = elements.find(
    (element): element is TextElement =>
      element.id === editingId && element.kind === "text",
  );
  const commitTextEdit = (value: string) => {
    if (editingText) {
      const { update } = useStudioStore.getState();
      update(editingText.id, { text: value });
    }
    setEditingId(null);
  };

  return (
    <section className="native-canvas" aria-label={t("canvas.label")}>
      <div
        ref={viewportRef}
        className="canvas-viewport"
        style={{ cursor: panning ? "grab" : undefined }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDropFiles}
      >
        {viewport.width > 0 && (
          <Stage
            ref={stageRef}
            width={viewport.width}
            height={viewport.height}
            x={effectivePan.x}
            y={effectivePan.y}
            scaleX={scale}
            scaleY={scale}
            draggable={panning}
            onWheel={onWheel}
            onClick={onStageClick}
            onTap={onStageClick}
            onDragEnd={onStageDragEnd}
          >
            <Layer
              listening={!panning}
              onDragStart={onLayerDragStart}
              onDragMove={onLayerDragMove}
              onDragEnd={onLayerDragEnd}
            >
              <Rect
                ref={artboardRef}
                x={0}
                y={0}
                width={canvasW}
                height={canvasH}
                fill="#FFFFFF"
                listening={false}
                shadowColor="rgba(0, 0, 0, 0.4)"
                shadowBlur={40}
                shadowOffsetY={14}
              />
              {elements.map((element) => (
                <ElementNode
                  key={element.id}
                  element={element}
                  editingId={editingId}
                  onEditText={setEditingId}
                />
              ))}
            </Layer>
            <Layer ref={overlayRef} listening={!panning}>
              {showGrid && (
                <Group listening={false}>
                  {Array.from({ length: gridCols }, (_, index) => (
                    <Line
                      key={`v${index}`}
                      points={[index * 40, 0, index * 40, canvasH]}
                      stroke="#16181D"
                      opacity={0.07}
                      strokeWidth={1 / scale}
                    />
                  ))}
                  {Array.from({ length: gridRows }, (_, index) => (
                    <Line
                      key={`h${index}`}
                      points={[0, index * 40, canvasW, index * 40]}
                      stroke="#16181D"
                      opacity={0.07}
                      strokeWidth={1 / scale}
                    />
                  ))}
                </Group>
              )}
              {showGuides && (
                <Group listening={false}>
                  <Line
                    points={[canvasW / 2, 0, canvasW / 2, canvasH]}
                    stroke="#6C7CFF"
                    dash={[10, 8]}
                    opacity={0.55}
                    strokeWidth={1 / scale}
                  />
                  <Line
                    points={[0, canvasH / 2, canvasW, canvasH / 2]}
                    stroke="#6C7CFF"
                    dash={[10, 8]}
                    opacity={0.55}
                    strokeWidth={1 / scale}
                  />
                </Group>
              )}
              {showSafeArea && (
                <Rect
                  x={SAFE_AREA_INSET}
                  y={SAFE_AREA_INSET}
                  width={canvasW - SAFE_AREA_INSET * 2}
                  height={canvasH - SAFE_AREA_INSET * 2}
                  stroke="#F97066"
                  dash={[12, 8]}
                  opacity={0.7}
                  strokeWidth={1.5 / scale}
                  listening={false}
                />
              )}
              <Line
                ref={snapV}
                visible={false}
                stroke="#F0428C"
                strokeWidth={1 / scale}
                listening={false}
              />
              <Line
                ref={snapH}
                visible={false}
                stroke="#F0428C"
                strokeWidth={1 / scale}
                listening={false}
              />
              <SelectionTransformer />
            </Layer>
          </Stage>
        )}
        {editingText && (
          <textarea
            className="text-editor"
            autoFocus
            defaultValue={editingText.text}
            ref={(node) => {
              if (node) {
                node.style.height = "auto";
                node.style.height = `${node.scrollHeight}px`;
                node.select();
              }
            }}
            style={{
              left: editingText.x * scale + effectivePan.x,
              top: editingText.y * scale + effectivePan.y,
              width: editingText.width * scale,
              fontSize: editingText.fontSize * scale,
              fontFamily: editingText.fontFamily ?? DEFAULT_FONT,
              fontWeight: editingText.fontWeight ?? 400,
              letterSpacing: `${(editingText.letterSpacing ?? 0) * scale}px`,
              lineHeight: String(editingText.lineHeight),
              textAlign: editingText.align ?? "left",
              color: editingText.fill,
              transform: `rotate(${editingText.rotation}deg)`,
            }}
            onInput={(event) => {
              const node = event.currentTarget;
              node.style.height = "auto";
              node.style.height = `${node.scrollHeight}px`;
            }}
            onBlur={(event) => commitTextEdit(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                setEditingId(null);
              } else if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.blur();
              }
            }}
          />
        )}
        {showRulers && viewport.width > 0 && (
          <>
            <div className="ruler-corner" />
            <Ruler
              orientation="horizontal"
              offset={effectivePan.x}
              scale={scale}
              length={viewport.width}
            />
            <Ruler
              orientation="vertical"
              offset={effectivePan.y}
              scale={scale}
              length={viewport.height}
            />
          </>
        )}
        <div className="canvas-meta">
          <DocumentSizeMenu />
          <span>{zoom}%</span>
        </div>
      </div>
    </section>
  );
}
