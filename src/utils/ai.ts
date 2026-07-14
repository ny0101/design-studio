import Anthropic from "@anthropic-ai/sdk";
import type { Language } from "../types/studio";

const API_KEY_STORAGE = "design-studio:anthropic-key";

export function loadApiKey(): string {
  try {
    return window.localStorage.getItem(API_KEY_STORAGE) ?? "";
  } catch {
    return "";
  }
}

export function persistApiKey(key: string) {
  try {
    window.localStorage.setItem(API_KEY_STORAGE, key);
  } catch {
    // Storage unavailable; the key simply won't persist across reloads.
  }
}

export interface GeneratedImage {
  src: string;
  width: number;
  height: number;
}

export async function generateImage(
  prompt: string,
  width: number,
  height: number,
): Promise<GeneratedImage> {
  const url =
    `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}` +
    `?width=${Math.min(1920, width)}&height=${Math.min(1920, height)}&nologo=true`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Image service error (${response.status})`);
  const blob = await response.blob();
  const src = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(blob);
  });
  return { src, width, height };
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

export function describeAiError(error: unknown): string {
  if (error instanceof Anthropic.AuthenticationError) return "auth";
  if (error instanceof Anthropic.RateLimitError) return "rateLimit";
  if (error instanceof Anthropic.APIError) return "api";
  return "network";
}
