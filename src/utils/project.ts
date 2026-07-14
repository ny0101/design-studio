import type { CanvasElement, CanvasSize } from "../types/studio";

const PROJECT_STORAGE_KEY = "design-studio:project";

export const DEFAULT_CANVAS_SIZE: CanvasSize = { width: 1080, height: 1080 };

export interface ProjectData {
  version: 1;
  canvasSize: CanvasSize;
  elements: CanvasElement[];
}

const sanitize = (parsed: unknown): ProjectData | null => {
  if (!parsed || typeof parsed !== "object") return null;
  const data = parsed as { elements?: unknown; canvasSize?: CanvasSize };
  if (!Array.isArray(data.elements)) return null;
  const size = data.canvasSize;
  const valid =
    size &&
    Number.isFinite(size.width) &&
    Number.isFinite(size.height) &&
    size.width >= 100 &&
    size.height >= 100;
  return {
    version: 1,
    canvasSize: valid ? { width: size.width, height: size.height } : DEFAULT_CANVAS_SIZE,
    elements: data.elements as CanvasElement[],
  };
};

export function loadStoredProject(): ProjectData | null {
  try {
    const raw = window.localStorage.getItem(PROJECT_STORAGE_KEY);
    return raw ? sanitize(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function storeProject(elements: CanvasElement[], canvasSize: CanvasSize) {
  try {
    window.localStorage.setItem(
      PROJECT_STORAGE_KEY,
      JSON.stringify({ version: 1, canvasSize, elements }),
    );
  } catch {
    // Storage may be full (large embedded images); autosave silently skips.
  }
}

export function serializeProject(
  elements: CanvasElement[],
  canvasSize: CanvasSize,
): string {
  return JSON.stringify({ version: 1, canvasSize, elements }, null, 2);
}

export function parseProjectFile(text: string): ProjectData | null {
  try {
    return sanitize(JSON.parse(text));
  } catch {
    return null;
  }
}
