import type { CanvasPan, ImageElement } from "../types/studio";

const MAX_DIMENSION = 640;

export interface ImageSource {
  src: string;
  naturalWidth: number;
  naturalHeight: number;
}

export function loadImageSource(file: File): Promise<ImageSource> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const src = String(reader.result);
      const probe = new Image();
      probe.onload = () =>
        resolve({ src, naturalWidth: probe.width, naturalHeight: probe.height });
      probe.onerror = reject;
      probe.src = src;
    };
    reader.readAsDataURL(file);
  });
}

export async function createImageElement(
  file: File,
  center: CanvasPan,
): Promise<ImageElement> {
  const { src, naturalWidth, naturalHeight } = await loadImageSource(file);
  const fit = Math.min(1, MAX_DIMENSION / Math.max(naturalWidth, naturalHeight));
  const width = Math.max(1, Math.round(naturalWidth * fit));
  const height = Math.max(1, Math.round(naturalHeight * fit));
  return {
    id: crypto.randomUUID(),
    name: file.name,
    kind: "image",
    src,
    x: center.x - width / 2,
    y: center.y - height / 2,
    width,
    height,
    radius: 0,
    brightness: 100,
    rotation: 0,
    opacity: 1,
    hidden: false,
    locked: false,
  };
}

export function computeCenteredCrop(
  naturalWidth: number,
  naturalHeight: number,
  ratio: number,
): { x: number; y: number; width: number; height: number } {
  const naturalRatio = naturalWidth / naturalHeight;
  let width = naturalWidth;
  let height = naturalHeight;
  if (naturalRatio > ratio) width = naturalHeight * ratio;
  else height = naturalWidth / ratio;
  return {
    x: (naturalWidth - width) / 2,
    y: (naturalHeight - height) / 2,
    width,
    height,
  };
}
