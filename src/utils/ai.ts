import Anthropic from "@anthropic-ai/sdk";
import type { Language } from "../types/studio";

const ANTHROPIC_KEY_STORAGE = "design-studio:anthropic-key";
const HUGGINGFACE_KEY_STORAGE = "design-studio:huggingface-key";
const GEMINI_KEY_STORAGE = "design-studio:gemini-key";
const PROXY_URL_STORAGE = "design-studio:proxy-url";

const readKey = (storageKey: string): string => {
  try {
    return window.localStorage.getItem(storageKey) ?? "";
  } catch {
    return "";
  }
};

const writeKey = (storageKey: string, value: string) => {
  try {
    window.localStorage.setItem(storageKey, value);
  } catch {
    // Storage unavailable; the key simply won't persist across reloads.
  }
};

export const loadApiKey = () => readKey(ANTHROPIC_KEY_STORAGE);
export const persistApiKey = (key: string) => writeKey(ANTHROPIC_KEY_STORAGE, key);
export const loadHuggingFaceKey = () => readKey(HUGGINGFACE_KEY_STORAGE);
export const persistHuggingFaceKey = (key: string) => writeKey(HUGGINGFACE_KEY_STORAGE, key);
export const loadGeminiKey = () => readKey(GEMINI_KEY_STORAGE);
export const persistGeminiKey = (key: string) => writeKey(GEMINI_KEY_STORAGE, key);
export const loadProxyUrl = () => readKey(PROXY_URL_STORAGE);
export const persistProxyUrl = (url: string) => writeKey(PROXY_URL_STORAGE, url);

export type ImageProvider = "pollinations" | "huggingface" | "gemini";
export type ReferenceMode = "style" | "edit" | "composite";
export type AiErrorKind = "auth" | "rateLimit" | "api" | "network";

export class AiRequestError extends Error {
  kind: AiErrorKind;
  constructor(message: string, kind: AiErrorKind = "api") {
    super(message);
    this.kind = kind;
  }
}

export interface GeneratedImage {
  src: string;
  width: number;
  height: number;
}

const QUALITY_SUFFIX =
  ", 3D render, glossy translucent glass material, soft studio lighting, subtle reflections " +
  "and highlights, vibrant saturated colors, smooth rounded shapes, tiny sparkle particles, " +
  "centered single object, isolated on plain white background, product icon visualization, " +
  "high detail, no text, no watermark";

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(blob);
  });

export function measureImage(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error("Could not read generated image"));
    img.src = dataUrl;
  });
}

/** Pollinations.ai — free, keyless, text-to-image only. Lowest quality ceiling. */
export async function generateImagePollinations(
  prompt: string,
  width: number,
  height: number,
): Promise<GeneratedImage> {
  const boostedPrompt = `${prompt}${QUALITY_SUFFIX}`;
  const seed = Math.floor(Math.random() * 1_000_000);
  const url =
    `https://image.pollinations.ai/prompt/${encodeURIComponent(boostedPrompt)}` +
    `?width=${Math.min(1920, width)}&height=${Math.min(1920, height)}` +
    `&model=flux&enhance=true&seed=${seed}&nologo=true`;
  const response = await fetch(url);
  if (!response.ok) throw new AiRequestError(`Image service error (${response.status})`);
  const src = await blobToDataUrl(await response.blob());
  return { src, width, height };
}

export const DEFAULT_HF_MODEL = "black-forest-labs/FLUX.1-schnell";
const HF_MODEL_STORAGE = "design-studio:hf-model";
export const loadHfModel = () => readKey(HF_MODEL_STORAGE) || DEFAULT_HF_MODEL;
export const persistHfModel = (model: string) => writeKey(HF_MODEL_STORAGE, model);

/**
 * A handful of Hugging Face model repos worth trying for glossy 3D icon/design-asset
 * renders. FLUX.1-schnell is the confirmed-working default. The others are not
 * guaranteed to be served by Hugging Face's free serverless Inference API — long-tail
 * community LoRA/fine-tune repos are hit-or-miss on that API (it mainly hosts a curated
 * set of flagship checkpoints), so treat anything but the default as worth a try, not a
 * promise. Switching back to the default is always one field away.
 */
export const SUGGESTED_HF_MODELS = [
  "black-forest-labs/FLUX.1-schnell",
  "black-forest-labs/FLUX.1-dev",
  "stabilityai/stable-diffusion-3.5-large-turbo",
  "rangwani-harsh/3d-icon-Flux-LoRA",
  "thliang01/3d-icon-sdxl-dora-v0-8",
];

// The legacy api-inference.huggingface.co host is deprecated (returns 530 through
// the proxy). Hugging Face routes serverless inference through router.huggingface.co now.
const hfEndpoint = (model: string) =>
  `https://router.huggingface.co/hf-inference/models/${model}`;

/**
 * Hugging Face free Inference API — needs a free token, no billing. Text-to-image only.
 * Hugging Face does not send CORS headers, so a static site must route through a proxy
 * (see worker/image-proxy.js). When proxyUrl is set the request goes:
 *   browser -> proxyUrl?url=<HF endpoint> -> Hugging Face
 */
export async function generateImageHuggingFace(
  prompt: string,
  width: number,
  height: number,
  apiKey: string,
  proxyUrl: string,
  model: string = DEFAULT_HF_MODEL,
): Promise<GeneratedImage> {
  const boostedPrompt = `${prompt}${QUALITY_SUFFIX}`;
  const clampedWidth = Math.min(1024, width);
  const clampedHeight = Math.min(1024, height);
  const hfUrl = hfEndpoint(model);
  const endpoint = proxyUrl
    ? `${proxyUrl.replace(/\/$/, "")}/?url=${encodeURIComponent(hfUrl)}`
    : hfUrl;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: boostedPrompt,
      parameters: { width: clampedWidth, height: clampedHeight },
    }),
  });
  const contentType = response.headers.get("content-type") ?? "";
  if (!response.ok || contentType.includes("application/json")) {
    const body = await response.json().catch(() => null);
    let detail = String(body?.error ?? body?.message ?? `HTTP ${response.status}`);
    if (response.status === 404) {
      detail += ` — "${model}" isn't served by the free Inference API. Try a different model ID (e.g. ${DEFAULT_HF_MODEL}).`;
    }
    const kind: AiErrorKind =
      response.status === 401 || response.status === 403
        ? "auth"
        : response.status === 429
          ? "rateLimit"
          : "api";
    throw new AiRequestError(detail, kind);
  }
  const src = await blobToDataUrl(await response.blob());
  return { src, width: clampedWidth, height: clampedHeight };
}

const GEMINI_MODEL = "gemini-2.5-flash-image";

const MODE_INSTRUCTIONS: Record<ReferenceMode, string> = {
  style:
    "Use the attached image only as a mood, color palette, and style reference. " +
    "Do not copy its exact subject or composition. Generate a new image of: ",
  edit:
    "Edit the attached image according to this instruction, keeping everything else " +
    "as close to the original as possible: ",
  composite:
    "Keep the main subject or product in the attached image exactly as it is " +
    "(same shape, colors, proportions, details). Only change or add the background " +
    "or scene around it to match: ",
};

const parseDataUrl = (dataUrl: string) => {
  const match = /^data:(.+?);base64,(.+)$/.exec(dataUrl);
  if (!match) throw new AiRequestError("Invalid reference image data");
  return { mimeType: match[1], data: match[2] };
};

/** Google Gemini free tier — supports reference-image generation (style/edit/composite). */
export async function generateImageGemini(
  prompt: string,
  apiKey: string,
  referenceImage: string | null,
  mode: ReferenceMode,
): Promise<GeneratedImage> {
  const parts: Record<string, unknown>[] = [];
  if (referenceImage) {
    parts.push({ inlineData: parseDataUrl(referenceImage) });
  }
  const text = referenceImage ? MODE_INSTRUCTIONS[mode] + prompt : `${prompt}${QUALITY_SUFFIX}`;
  parts.push({ text });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts }] }),
    },
  );
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message: string = body?.error?.message ?? `HTTP ${response.status}`;
    const status: string | undefined = body?.error?.status;
    const kind: AiErrorKind =
      response.status === 401 ||
      response.status === 403 ||
      status === "UNAUTHENTICATED" ||
      status === "PERMISSION_DENIED"
        ? "auth"
        : response.status === 429 || status === "RESOURCE_EXHAUSTED"
          ? "rateLimit"
          : "api";
    throw new AiRequestError(message, kind);
  }
  interface GeminiPart {
    inlineData?: { mimeType: string; data: string };
  }
  const imagePart = (body?.candidates?.[0]?.content?.parts as GeminiPart[] | undefined)?.find(
    (part) => part.inlineData,
  );
  if (!imagePart?.inlineData) {
    throw new AiRequestError("Gemini did not return an image for this prompt", "api");
  }
  const { mimeType, data } = imagePart.inlineData;
  return { src: `data:${mimeType};base64,${data}`, width: 0, height: 0 };
}

export interface GeneratedCopy {
  headline: string;
  subline: string;
}

const COPY_SCHEMA = {
  type: "object",
  properties: {
    headline: {
      type: "string",
      description: "Short punchy headline for the design, max 6 words",
    },
    subline: {
      type: "string",
      description: "Supporting subline, max 14 words",
    },
  },
  required: ["headline", "subline"],
  additionalProperties: false,
} as const;

export async function generateCopy(
  brief: string,
  apiKey: string,
  language: Language,
): Promise<GeneratedCopy> {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 2048,
    thinking: { type: "adaptive" },
    output_config: { format: { type: "json_schema", schema: COPY_SCHEMA } },
    system:
      "You are a senior copywriter for a graphic design tool. " +
      "Given a design brief, write one headline and one subline for the artwork. " +
      (language === "ko"
        ? "Write the copy in Korean."
        : "Write the copy in English."),
    messages: [{ role: "user", content: brief }],
  });
  const text = response.content.find((block) => block.type === "text");
  if (!text || text.type !== "text") throw new Error("Empty response");
  return JSON.parse(text.text) as GeneratedCopy;
}

export function describeAiError(error: unknown): AiErrorKind {
  if (error instanceof AiRequestError) return error.kind;
  if (error instanceof Anthropic.AuthenticationError) return "auth";
  if (error instanceof Anthropic.RateLimitError) return "rateLimit";
  if (error instanceof Anthropic.APIError) return "api";
  return "network";
}

export function describeAiErrorDetail(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
