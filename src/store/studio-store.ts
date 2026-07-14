import { create } from "zustand";
import type {
  CanvasElement,
  ColorTheme,
  Language,
  StudioState,
  StudioTool,
  WorkspaceView,
} from "../types/studio";
import { detectLanguage, persistLanguage } from "../utils/i18n";

const initialElements: CanvasElement[] = [
  {
    id: "background",
    name: "Background",
    kind: "rect",
    x: 0,
    y: 0,
    width: 1080,
    height: 1080,
    fill: "#F5F3EE",
    radius: 0,
    rotation: 0,
    opacity: 1,
    hidden: false,
    locked: true,
  },
  {
    id: "accent",
    name: "Accent circle",
    kind: "circle",
    x: 854,
    y: 222,
    radius: 158,
    fill: "#B4FF55",
    rotation: 0,
    opacity: 1,
    hidden: false,
    locked: false,
  },
  {
    id: "heading",
    name: "Summer headline",
    kind: "text",
    x: 94,
    y: 304,
    text: "SUMMER\nSALE",
    fontSize: 138,
    fontStyle: "bold",
    fill: "#15161A",
    width: 760,
    lineHeight: 0.9,
    rotation: 0,
    opacity: 1,
    hidden: false,
    locked: false,
  },
  {
    id: "label",
    name: "Offer label",
    kind: "text",
    x: 102,
    y: 745,
    text: "UP TO 70% OFF · JULY 2026",
    fontSize: 30,
    fontStyle: "bold",
    fill: "#15161A",
    width: 700,
    lineHeight: 1.2,
    rotation: 0,
    opacity: 1,
    hidden: false,
    locked: false,
  },
];

const clone = (elements: CanvasElement[]) => elements.map((element) => ({ ...element }));
const saveHistory = (state: StudioState) => ({
  past: [...state.past.slice(-39), clone(state.elements)],
  future: [],
});

interface StudioActions {
  setView: (view: WorkspaceView) => void;
  setTheme: (theme: ColorTheme) => void;
  setLanguage: (language: Language) => void;
  setTool: (tool: StudioTool) => void;
  setZoom: (zoom: number) => void;
  toggleGrid: () => void;
  toggleGuides: () => void;
  select: (id: string | null) => void;
  add: (element: CanvasElement) => void;
  update: (id: string, patch: Partial<CanvasElement>) => void;
  remove: (id: string) => void;
  reorder: (id: string, direction: "up" | "down") => void;
  undo: () => void;
  redo: () => void;
}

export const useStudioStore = create<StudioState & StudioActions>((set) => ({
  view: "studio",
  theme: "dark",
  language: detectLanguage(),
  activeTool: "select",
  zoom: 62,
  showGrid: false,
  showGuides: true,
  elements: initialElements,
  selectedId: "heading",
  past: [],
  future: [],
  setView: (view) => set({ view }),
  setTheme: (theme) => set({ theme }),
  setLanguage: (language) => {
    persistLanguage(language);
    set({ language });
  },
  setTool: (activeTool) => set({ activeTool }),
  setZoom: (zoom) => set({ zoom: Math.min(200, Math.max(25, zoom)) }),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  toggleGuides: () => set((state) => ({ showGuides: !state.showGuides })),
  select: (selectedId) => set({ selectedId }),
  add: (element) =>
    set((state) => ({
      ...saveHistory(state),
      elements: [...state.elements, element],
      selectedId: element.id,
    })),
  update: (id, patch) =>
    set((state) => ({
      ...saveHistory(state),
      elements: state.elements.map((item) =>
        item.id === id ? ({ ...item, ...patch } as CanvasElement) : item,
      ),
    })),
  remove: (id) =>
    set((state) => ({
      ...saveHistory(state),
      elements: state.elements.filter((item) => item.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
    })),
  reorder: (id, direction) =>
    set((state) => {
      const index = state.elements.findIndex((item) => item.id === id);
      const swap = direction === "up" ? index + 1 : index - 1;
      if (index < 0 || swap < 0 || swap >= state.elements.length) return state;
      const elements = [...state.elements];
      [elements[index], elements[swap]] = [elements[swap], elements[index]];
      return { ...saveHistory(state), elements };
    }),
  undo: () =>
    set((state) => {
      const previous = state.past.at(-1);
      return previous
        ? {
            elements: clone(previous),
            past: state.past.slice(0, -1),
            future: [clone(state.elements), ...state.future],
          }
        : state;
    }),
  redo: () =>
    set((state) => {
      const next = state.future[0];
      return next
        ? {
            elements: clone(next),
            past: [...state.past, clone(state.elements)],
            future: state.future.slice(1),
          }
        : state;
    }),
}));
