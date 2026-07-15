import { removeBackground } from "@imgly/background-removal";

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(blob);
  });

/**
 * Cuts the subject out of an image and returns a transparent-background PNG data URL.
 * Runs fully client-side (ONNX/WASM model fetched from IMG.LY's CDN on first use,
 * then cached by the browser) — no API key, no server, no usage limit.
 */
export async function removeImageBackground(src: string): Promise<string> {
  const blob = await removeBackground(src);
  return blobToDataUrl(blob);
}
