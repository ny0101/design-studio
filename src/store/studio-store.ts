import { create } from "zustand";
import type {
  CanvasElement,
  CanvasPan,
  CanvasSize,
  ColorTheme,
  Language,
  StudioState,
  StudioTool,
  WorkspaceView,
} from "../types/studio";
import { detectLanguage, persistLanguage } from "../utils/i18n";
import { DEFAULT_CANVAS_SIZE, loadStoredProject } from "../utils/project";

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

const PASTE_OFFSET = 24;

const withNewId = (element: CanvasElement, offset = PASTE_OFFSET): CanvasElement => ({
  ...element,
  id: crypto.randomUUID(),
  x: element.x + offset,
  y: element.y + offset,
});

const cloneSelection = (elements: CanvasElement[]): CanvasElement[] => {
  const groupMap = new Map<string, string>();
  return elements.map((element) => {
    const copy = withNewId(element);
    if (element.groupId) {
      if (!groupMap.has(element.groupId)) {
        groupMap.set(element.groupId, crypto.randomUUID());
      }
      copy.groupId = groupMap.get(element.groupId);
    }
    return copy;
  });
};

interface StudioActions {
  setView: (view: WorkspaceView) => void;
  setTheme: (theme: ColorTheme) => void;
  setLanguage: (language: Language) => void;
  setTool: (tool: StudioTool) => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: CanvasPan | null) => void;
  setCanvasSize: (size: CanvasSize) => void;
  loadProject: (elements: CanvasElement[], size: CanvasSize) => void;
  resetProject: () => void;
  toggleGrid: () => void;
  toggleGuides: () => void;
  toggleRulers: () => void;
  toggleSafeArea: () => void;
  select: (id: string | null, options?: { expandGroup?: boolean }) => void;
  toggleSelect: (id: string) => void;
  add: (element: CanvasElement, options?: { select?: boolean }) => void;
  update: (id: string, patch: Partial<CanvasElement>) => void;
  updateMany: (entries: { id: string; patch: Partial<CanvasElement> }[]) => void;
  rename: (id: string, name: string) => void;
  remove: (id: string) => void;
  removeSelected: () => void;
  reorder: (id: string, direction: "up" | "down") => void;
  copy: () => void;
  paste: () => void;
  duplicate: (id?: string) => void;
  group: () => void;
  ungroup: () => void;
  applyTemplate: (elements: CanvasElement[]) => void;
  undo: () => void;
  redo: () => void;
}

const storedProject = loadStoredProject();

export const useStudioStore = create<StudioState & StudioActions>((set) => ({
  view: "studio",
  theme: "dark",
  language: detectLanguage(),
  activeTool: "select",
  zoom: 62,
  pan: null,
  canvasSize: storedProject?.canvasSize ?? DEFAULT_CANVAS_SIZE,
  showGrid: false,
  showGuides: true,
  showRulers: false,
  showSafeArea: false,
  elements: storedProject?.elements ?? initialElements,
  selectedIds: storedProject ? [] : ["heading"],
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
  setCanvasSize: (canvasSize) =>
    set({
      canvasSize: {
        width: Math.min(8000, Math.max(100, Math.round(canvasSize.width))),
        height: Math.min(8000, Math.max(100, Math.round(canvasSize.height))),
      },
      pan: null,
    }),
  loadProject: (elements, canvasSize) =>
    set((state) => ({
      ...saveHistory(state),
      elements: clone(elements),
      canvasSize,
      selectedIds: [],
      pan: null,
    })),
  resetProject: () =>
    set((state) => ({
      ...saveHistory(state),
      elements: clone(initialElements),
      canvasSize: DEFAULT_CANVAS_SIZE,
      selectedIds: [],
      pan: null,
    })),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  toggleGuides: () => set((state) => ({ showGuides: !state.showGuides })),
  toggleRulers: () => set((state) => ({ showRulers: !state.showRulers })),
  toggleSafeArea: () => set((state) => ({ showSafeArea: !state.showSafeArea })),
  select: (id, options) =>
    set((state) => {
      if (!id) return { selectedIds: [] };
      const target = state.elements.find((item) => item.id === id);
      if (!target) return state;
      if (options?.expandGroup && target.groupId) {
        return {
          selectedIds: state.elements
            .filter((item) => item.groupId === target.groupId)
            .map((item) => item.id),
        };
      }
      return { selectedIds: [id] };
    }),
  toggleSelect: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((item) => item !== id)
        : [...state.selectedIds, id],
    })),
  add: (element, options) =>
    set((state) => ({
      ...saveHistory(state),
      elements: [...state.elements, element],
      selectedIds: options?.select === false ? state.selectedIds : [element.id],
    })),
  update: (id, patch) =>
    set((state) => ({
      ...saveHistory(state),
      elements: state.elements.map((item) =>
        item.id === id ? ({ ...item, ...patch } as CanvasElement) : item,
      ),
    })),
  updateMany: (entries) =>
    set((state) => {
      const patches = new Map(entries.map((entry) => [entry.id, entry.patch]));
      return {
        ...saveHistory(state),
        elements: state.elements.map((item) => {
          const patch = patches.get(item.id);
          return patch ? ({ ...item, ...patch } as CanvasElement) : item;
        }),
      };
    }),
  rename: (id, name) =>
    set((state) => ({
      ...saveHistory(state),
      elements: state.elements.map((item) =>
        item.id === id ? { ...item, name } : item,
      ),
    })),
  remove: (id) =>
    set((state) => ({
      ...saveHistory(state),
      elements: state.elements.filter((item) => item.id !== id),
      selectedIds: state.selectedIds.filter((item) => item !== id),
    })),
  removeSelected: () =>
    set((state) => {
      const removable = new Set(
        state.elements
          .filter((item) => state.selectedIds.includes(item.id) && !item.locked)
          .map((item) => item.id),
      );
      if (!removable.size) return state;
      return {
        ...saveHistory(state),
        elements: state.elements.filter((item) => !removable.has(item.id)),
        selectedIds: [],
      };
    }),
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
      const selected = state.elements.filter((item) =>
        state.selectedIds.includes(item.id),
      );
      return selected.length ? { clipboard: clone(selected) } : state;
    }),
  paste: () =>
    set((state) => {
      if (!state.clipboard.length) return state;
      const pasted = cloneSelection(state.clipboard);
      return {
        ...saveHistory(state),
        elements: [...state.elements, ...pasted],
        selectedIds: pasted.map((item) => item.id),
      };
    }),
  duplicate: (id) =>
    set((state) => {
      const sources = id
        ? state.elements.filter((item) => item.id === id)
        : state.elements.filter((item) => state.selectedIds.includes(item.id));
      if (!sources.length) return state;
      const copies = cloneSelection(sources);
      return {
        ...saveHistory(state),
        elements: [...state.elements, ...copies],
        selectedIds: copies.map((item) => item.id),
      };
    }),
  group: () =>
    set((state) => {
      if (state.selectedIds.length < 2) return state;
      const groupId = crypto.randomUUID();
      return {
        ...saveHistory(state),
        elements: state.elements.map((item) =>
          state.selectedIds.includes(item.id) ? { ...item, groupId } : item,
        ),
      };
    }),
  ungroup: () =>
    set((state) => {
      const hasGroup = state.elements.some(
        (item) => state.selectedIds.includes(item.id) && item.groupId,
      );
      if (!hasGroup) return state;
      return {
        ...saveHistory(state),
        elements: state.elements.map((item) =>
          state.selectedIds.includes(item.id)
            ? { ...item, groupId: undefined }
            : item,
        ),
      };
    }),
  applyTemplate: (elements) =>
    set((state) => ({
      ...saveHistory(state),
      elements: elements.map((element) => ({
        ...element,
        id: crypto.randomUUID(),
      })),
      canvasSize: DEFAULT_CANVAS_SIZE,
      selectedIds: [],
      pan: null,
    })),
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
