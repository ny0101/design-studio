import type { CanvasElement, CanvasPan } from "../types/studio";

export type ShapePreset =
  | "rectangle"
  | "rounded"
  | "circle"
  | "ellipse"
  | "triangle"
  | "polygon"
  | "star"
  | "arrow"
  | "line";

export const SHAPE_PRESETS: ShapePreset[] = [
  "rectangle",
  "rounded",
  "circle",
  "ellipse",
  "triangle",
  "polygon",
  "star",
  "arrow",
  "line",
];

const DEFAULT_FILL = "#6C7CFF";

const base = (name: string) => ({
  id: crypto.randomUUID(),
  name,
  rotation: 0,
  opacity: 1,
  hidden: false,
  locked: false,
});

export function createShapeElement(
  preset: ShapePreset,
  center: CanvasPan,
  name: string,
): CanvasElement {
  switch (preset) {
    case "rectangle":
      return {
        ...base(name),
        kind: "rect",
        x: center.x - 130,
        y: center.y - 80,
        width: 260,
        height: 160,
        fill: DEFAULT_FILL,
        radius: 0,
      };
    case "rounded":
      return {
        ...base(name),
        kind: "rect",
        x: center.x - 130,
        y: center.y - 80,
        width: 260,
        height: 160,
        fill: DEFAULT_FILL,
        radius: 26,
      };
    case "circle":
      return {
        ...base(name),
        kind: "circle",
        x: center.x,
        y: center.y,
        radius: 120,
        fill: DEFAULT_FILL,
      };
    case "ellipse":
      return {
        ...base(name),
        kind: "ellipse",
        x: center.x,
        y: center.y,
        radiusX: 150,
        radiusY: 95,
        fill: DEFAULT_FILL,
      };
    case "triangle":
      return {
        ...base(name),
        kind: "polygon",
        x: center.x,
        y: center.y,
        sides: 3,
        radius: 135,
        fill: DEFAULT_FILL,
      };
    case "polygon":
      return {
        ...base(name),
        kind: "polygon",
        x: center.x,
        y: center.y,
        sides: 6,
        radius: 130,
        fill: DEFAULT_FILL,
      };
    case "star":
      return {
        ...base(name),
        kind: "star",
        x: center.x,
        y: center.y,
        points: 5,
        innerRadius: 62,
        outerRadius: 130,
        fill: DEFAULT_FILL,
      };
    case "arrow":
      return {
        ...base(name),
        kind: "arrow",
        x: center.x - 130,
        y: center.y,
        points: [0, 0, 260, 0],
        stroke: DEFAULT_FILL,
        strokeWidth: 8,
        pointerLength: 20,
        pointerWidth: 20,
      };
    case "line":
      return {
        ...base(name),
        kind: "line",
        x: center.x - 130,
        y: center.y,
        points: [0, 0, 260, 0],
        stroke: DEFAULT_FILL,
        strokeWidth: 6,
      };
  }
}
