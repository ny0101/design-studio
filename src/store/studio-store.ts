import { create } from "zustand";
import type {
  CanvasElement,
  CanvasPan,
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
    fontWeight: 700,
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
    fontWeight: 700,
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
  setPan: (pan: CanvasPan) => void;
  toggleGrid: () => void;
  toggleGuides: () => void;
  toggleRulers: () => void;
  toggleSafeArea: () => void;
  select: (id: string | null) => void;
  add: (element: CanvasElement, options?: { select?: boolean }) => void;
  update: (id: string, patch: Partial<CanvasElement>) => void;
  remove: (id: string) => void;
  reorder: (id: string, direction: "up" | "down") => void;
  copy: () => void;
  paste: () => void;
  duplicate: (id?: string) => void;
  undo: () => void;
  redo: () => void;
}

const PASTE_OFFSET = 24;

const withNewId = (element: CanvasElement, offset = PASTE_OFFSET): CanvasElement => ({
  ...element,
  id: crypto.randomUUID(),
  x: element.x + offset,
  y: element.y + offset,
});

export const useStudioStore = create<StudioState & StudioActions>((set) => ({
  view: "studio",
  theme: "dark",
  language: detectLanguage(),
  activeTool: "select",
  zoom: 62,
  pan: null,
  showGrid: false,
  showGuides: true,
  showRulers: false,
  showSafeArea: false,
  elements: initialElements,
  selectedId: "heading",
  clipboard: [],
  past: [],
  future: [],
  setView: (view) => set({ view }),
  setTheme: (theme) => set({ theme }),
  setLanguage: (language) => {
    persistLanguage(language);
    set({ language });
  },
  setTool: (activeTool) => set({ activeTool }),
  setZoom: (zoom) => set({ zoom: Math.min(400, Math.max(10, Math.round(zoom))) }),
  setPan: (pan) => set({ pan }),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  toggleGuides: () => set((state) => ({ showGuides: !state.showGuides })),
  toggleRulers: () => set((state) => ({ showRulers: !state.showRulers })),
  toggleSafeArea: () => set((state) => ({ showSafeArea: !state.showSafeArea })),
  select: (selectedId) => set({ selectedId }),
  add: (element, options) =>
    set((state) => ({
      ...saveHistory(state),
      elements: [...state.elements, element],
      selectedId: options?.select === false ? state.selectedId : element.id,
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
  copy: () =>
    set((state) => {
      const selected = state.elements.find((item) => item.id === state.selectedId);
      return selected ? { clipboard: [{ ...selected }] } : state;
    }),
  paste: () =>
    set((state) => {
      if (!state.clipboard.length) return state;
      const pasted = state.clipboard.map((item) => withNewId(item));
      return {
        ...saveHistory(state),
        elements: [...state.elements, ...pasted],
        selectedId: pasted[pasted.length - 1].id,
      };
    }),
  duplicate: (id) =>
    set((state) => {
      const targetId = id ?? state.selectedId;
      const source = state.elements.find((item) => item.id === targetId);
      if (!source) return state;
      const copy = withNewId(source);
      return {
        ...saveHistory(state),
        elements: [...state.elements, copy],
        selectedId: copy.id,
      };
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
