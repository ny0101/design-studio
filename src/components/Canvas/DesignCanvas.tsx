import { useEffect, useRef, useState } from "react";
import {
  Circle,
  Image as KonvaImage,
  Layer,
  Line,
  Rect,
  Stage,
  Text,
  Transformer,
} from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type Konva from "konva";
import type { CanvasElement, ImageElement } from "../../types/studio";
import { useStudioStore } from "../../store/studio-store";
import { useTranslation } from "../../hooks/useTranslation";

const CANVAS_SIZE = 1080;
const MIN_SIZE = 5;
const id = () => crypto.randomUUID();

function RasterImage({
  element,
  shared,
}: {
  element: ImageElement;
  shared: Record<string, unknown>;
}) {
  const [image, setImage] = useState<HTMLImageElement>();
  useEffect(() => {
    const next = new window.Image();
    next.onload = () => setImage(next);
    next.src = element.src;
  }, [element.src]);
  return (
    <KonvaImage
      {...shared}
      image={image}
      width={element.width}
      height={element.height}
      cornerRadius={element.radius}
    />
  );
}

function ElementNode({ element }: { element: CanvasElement }) {
  const { select, update, add } = useStudioStore();
  if (element.hidden) return null;
  const selectNode = () => select(element.id);
  const dragStart = (event: KonvaEventObject<DragEvent>) => {
    if (event.evt.altKey) {
      add({ ...element, id: id() }, { select: false });
    }
  };
  const dragEnd = (event: KonvaEventObject<DragEvent>) =>
    update(element.id, { x: event.target.x(), y: event.target.y() });
  const transformEnd = (event: KonvaEventObject<Event>) => {
    const node = event.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    const base = { x: node.x(), y: node.y(), rotation: node.rotation() };
    if (element.kind === "circle") {
      update(element.id, {
        ...base,
        radius: Math.max(MIN_SIZE, element.radius * ((scaleX + scaleY) / 2)),
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
    onClick: selectNode,
    onTap: selectNode,
    onDragStart: dragStart,
    onDragEnd: dragEnd,
    onTransformEnd: transformEnd,
  };
  if (element.kind === "text")
    return (
      <Text
        {...shared}
        text={element.text}
        width={element.width}
        fontSize={element.fontSize}
        fontStyle={element.fontStyle}
        fill={element.fill}
        lineHeight={element.lineHeight}
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
      />
    );
  if (element.kind === "circle")
    return <Circle {...shared} radius={element.radius} fill={element.fill} />;
  return <RasterImage element={element} shared={shared} />;
}

function SelectionTransformer() {
  const transformer = useRef<Konva.Transformer>(null);
  const { elements, selectedId } = useStudioStore();
  const selected = elements.find((item) => item.id === selectedId);
  useEffect(() => {
    const node = transformer.current;
    if (!node) return;
    const stage = node.getStage();
    const target =
      selected && !selected.locked && !selected.hidden
        ? stage?.findOne(`#${selected.id}`)
        : undefined;
    node.nodes(target ? [target] : []);
    node.getLayer()?.batchDraw();
  }, [selected, elements]);
  const anchors =
    selected?.kind === "text"
      ? ["top-left", "top-right", "bottom-left", "bottom-right", "middle-left", "middle-right"]
      : selected?.kind === "circle"
        ? ["top-left", "top-right", "bottom-left", "bottom-right"]
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

export function DesignCanvas() {
  const stage = useRef<import("konva/lib/Stage").Stage>(null);
  const { elements, select, zoom, showGrid, showGuides, add, setTool } = useStudioStore();
  const { t } = useTranslation();
  const scale = (zoom / 100) * 0.62;
  useEffect(() => {
    const exportCanvas = () => {
      const uri = stage.current?.toDataURL({ pixelRatio: 2 });
      if (!uri) return;
      const link = document.createElement("a");
      link.download = "design-studio.png";
      link.href = uri;
      link.click();
    };
    window.addEventListener("design-studio:export", exportCanvas);
    return () => window.removeEventListener("design-studio:export", exportCanvas);
  }, []);
  const addText = () => {
    const element = {
      id: id(),
      name: t("defaults.newText"),
      kind: "text" as const,
      x: 160,
      y: 180,
      text: t("defaults.newTextContent"),
      fontSize: 68,
      fontStyle: "bold" as const,
      fill: "#16181D",
      width: 660,
      lineHeight: 1.1,
      rotation: 0,
      opacity: 1,
      hidden: false,
      locked: false,
    };
    add(element);
    setTool("select");
  };
  const addShape = () => {
    const element = {
      id: id(),
      name: t("defaults.rectangle"),
      kind: "rect" as const,
      x: 320,
      y: 530,
      width: 260,
      height: 160,
      fill: "#6C7CFF",
      radius: 22,
      rotation: 0,
      opacity: 1,
      hidden: false,
      locked: false,
    };
    add(element);
    setTool("select");
  };
  const onStageClick = (event: KonvaEventObject<MouseEvent>) => {
    if (event.target === event.target.getStage()) {
      const tool = useStudioStore.getState().activeTool;
      if (tool === "text") addText();
      else if (tool === "shape") addShape();
      else select(null);
    }
  };
  return (
    <section className="native-canvas" aria-label={t("canvas.label")}>
      <div className="canvas-meta">
        <span>1080 × 1080 px</span>
        <span>{zoom}%</span>
      </div>
      <div className="canvas-scroll">
        <div
          className="stage-shell"
          style={{
            width: `${CANVAS_SIZE * scale}px`,
            height: `${CANVAS_SIZE * scale}px`,
          }}
        >
          <Stage
            ref={stage}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            scaleX={scale}
            scaleY={scale}
            onClick={onStageClick}
            onTap={onStageClick}
          >
            <Layer>
              {showGrid &&
                Array.from({ length: 28 }, (_, index) => (
                  <Line
                    key={`v${index}`}
                    points={[index * 40, 0, index * 40, CANVAS_SIZE]}
                    stroke="#16181D"
                    opacity={0.07}
                    strokeWidth={1}
                  />
                ))}
              {showGrid &&
                Array.from({ length: 28 }, (_, index) => (
                  <Line
                    key={`h${index}`}
                    points={[0, index * 40, CANVAS_SIZE, index * 40]}
                    stroke="#16181D"
                    opacity={0.07}
                    strokeWidth={1}
                  />
                ))}
              {elements.map((element) => (
                <ElementNode key={element.id} element={element} />
              ))}
              {showGuides && (
                <>
                  <Line
                    points={[540, 0, 540, CANVAS_SIZE]}
                    stroke="#6C7CFF"
                    dash={[10, 8]}
                    opacity={0.55}
                  />
                  <Line
                    points={[0, 540, CANVAS_SIZE, 540]}
                    stroke="#6C7CFF"
                    dash={[10, 8]}
                    opacity={0.55}
                  />
                </>
              )}
              <SelectionTransformer />
            </Layer>
          </Stage>
        </div>
      </div>
    </section>
  );
}
