import en from "../locales/en.json";
import ko from "../locales/ko.json";
import type { Language } from "../types/studio";

type Dictionary = { [key: string]: string | Dictionary };

const dictionaries: Record<Language, Dictionary> = { en, ko };

const LANGUAGE_STORAGE_KEY = "design-studio:language";

export function detectLanguage(): Language {
  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored === "ko" || stored === "en") return stored;
  return navigator.language.toLowerCase().startsWith("ko") ? "ko" : "en";
}

export function persistLanguage(language: Language) {
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
}

export function translate(
  language: Language,
  key: string,
  params?: Record<string, string | number>,
): string {
  const resolved = key
    .split(".")
    .reduce<Dictionary | string | undefined>(
      (node, part) => (typeof node === "object" ? node[part] : undefined),
      dictionaries[language],
    );
  if (typeof resolved !== "string") return key;
  if (!params) return resolved;
  return resolved.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}
