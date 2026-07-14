export type WorkspaceView = "studio" | "about";
export type ColorTheme = "dark" | "light";
export type Language = "ko" | "en";
export type StudioTool =
  | "select"
  | "text"
  | "image"
  | "shape"
  | "background"
  | "elements"
  | "template"
  | "upload";
export type ElementKind =
  | "text"
  | "rect"
  | "circle"
  | "image"
  | "ellipse"
  | "polygon"
  | "star"
  | "arrow"
  | "line"
  | "icon";

export interface BaseElement {
  id: string;
  name: string;
  kind: ElementKind;
  x: number;
  y: number;
  rotation: number;
  opacity: number;
  hidden: boolean;
  locked: boolean;
  groupId?: string;
}

export interface ElementShadow {
  enabled: boolean;
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
}

export interface TextOutline {
  enabled: boolean;
  color: string;
  width: number;
}

export type TextAlign = "left" | "center" | "right";

export interface TextElement extends BaseElement {
  kind: "text";
  text: string;
  fontSize: number;
  fontFamily?: string;
  fontWeight?: number;
  fill: string;
  width: number;
  lineHeight: number;
  letterSpacing?: number;
  align?: TextAlign;
  shadow?: ElementShadow;
  outline?: TextOutline;
}

export interface RectElement extends BaseElement {
  kind: "rect";
  width: number;
  height: number;
  fill: string;
  radius: number;
  shadow?: ElementShadow;
}

export interface CircleElement extends BaseElement {
  kind: "circle";
  radius: number;
  fill: string;
}

export interface ImageCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImageElement extends BaseElement {
  kind: "image";
  src: string;
  width: number;
  height: number;
  radius: number;
  brightness: number;
  flipX?: boolean;
  flipY?: boolean;
  contrast?: number;
  saturation?: number;
  blurRadius?: number;
  grayscale?: boolean;
  crop?: ImageCrop;
  shadow?: ElementShadow;
}

export interface EllipseElement extends BaseElement {
  kind: "ellipse";
  radiusX: number;
  radiusY: number;
  fill: string;
}

export interface PolygonElement extends BaseElement {
  kind: "polygon";
  sides: number;
  radius: number;
  fill: string;
}

export interface StarElement extends BaseElement {
  kind: "star";
  points: number;
  innerRadius: number;
  outerRadius: number;
  fill: string;
}

export interface ArrowElement extends BaseElement {
  kind: "arrow";
  points: number[];
  stroke: string;
  strokeWidth: number;
  pointerLength: number;
  pointerWidth: number;
}

export interface LineElement extends BaseElement {
  kind: "line";
  points: number[];
  stroke: string;
  strokeWidth: number;
}

export interface IconElement extends BaseElement {
  kind: "icon";
  icon: string;
  color: string;
  width: number;
  height: number;
  strokeWidth?: number;
}

export type CanvasElement =
  | TextElement
  | RectElement
  | CircleElement
  | ImageElement
  | EllipseElement
  | PolygonElement
  | StarElement
  | ArrowElement
  | LineElement
  | IconElement;

export interface CanvasPan {
  x: number;
  y: number;
}

export interface StudioState {
  view: WorkspaceView;
  theme: ColorTheme;
  language: Language;
  activeTool: StudioTool;
  zoom: number;
  pan: CanvasPan | null;
  showGrid: boolean;
  showGuides: boolean;
  showRulers: boolean;
  showSafeArea: boolean;
  elements: CanvasElement[];
  selectedIds: string[];
  clipboard: CanvasElement[];
  past: CanvasElement[][];
  future: CanvasElement[][];
}
