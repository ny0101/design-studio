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
export type ElementKind = "text" | "rect" | "circle" | "image";

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
}

export interface TextElement extends BaseElement {
  kind: "text";
  text: string;
  fontSize: number;
  fontStyle: "normal" | "bold";
  fill: string;
  width: number;
  lineHeight: number;
}

export interface RectElement extends BaseElement {
  kind: "rect";
  width: number;
  height: number;
  fill: string;
  radius: number;
}

export interface CircleElement extends BaseElement {
  kind: "circle";
  radius: number;
  fill: string;
}

export interface ImageElement extends BaseElement {
  kind: "image";
  src: string;
  width: number;
  height: number;
  radius: number;
  brightness: number;
}

export type CanvasElement = TextElement | RectElement | CircleElement | ImageElement;

export interface StudioState {
  view: WorkspaceView;
  theme: ColorTheme;
  language: Language;
  activeTool: StudioTool;
  zoom: number;
  showGrid: boolean;
  showGuides: boolean;
  elements: CanvasElement[];
  selectedId: string | null;
  clipboard: CanvasElement[];
  past: CanvasElement[][];
  future: CanvasElement[][];
}
