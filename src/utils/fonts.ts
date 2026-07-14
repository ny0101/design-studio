export const DEFAULT_FONT = "Inter, 'Noto Sans KR', system-ui, sans-serif";

export const FONT_FAMILIES: { label: string; value: string }[] = [
  { label: "Inter", value: DEFAULT_FONT },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Trebuchet MS", value: "'Trebuchet MS', sans-serif" },
  { label: "Georgia", value: "Georgia, 'Times New Roman', serif" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { label: "Courier New", value: "'Courier New', monospace" },
  { label: "Impact", value: "Impact, 'Arial Black', sans-serif" },
];

export const FONT_WEIGHTS: { key: string; value: number }[] = [
  { key: "light", value: 300 },
  { key: "regular", value: 400 },
  { key: "medium", value: 500 },
  { key: "semibold", value: 600 },
  { key: "bold", value: 700 },
  { key: "extrabold", value: 800 },
  { key: "black", value: 900 },
];
