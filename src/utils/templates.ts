import type { CanvasElement } from "../types/studio";

export interface BuiltinTemplate {
  key: string;
  elements: CanvasElement[];
}

export interface UserTemplate {
  id: string;
  name: string;
  elements: CanvasElement[];
}

const TEMPLATE_STORAGE_KEY = "design-studio:user-templates";

const base = (name: string) => ({
  id: "",
  name,
  rotation: 0,
  opacity: 1,
  hidden: false,
  locked: false,
});

const background = (fill: string): CanvasElement => ({
  ...base("Background"),
  kind: "rect",
  x: 0,
  y: 0,
  width: 1080,
  height: 1080,
  fill,
  radius: 0,
  locked: true,
});

export const BUILTIN_TEMPLATES: BuiltinTemplate[] = [
  {
    key: "summerSale",
    elements: [
      background("#F5F3EE"),
      {
        ...base("Accent circle"),
        kind: "circle",
        x: 854,
        y: 222,
        radius: 158,
        fill: "#B4FF55",
      },
      {
        ...base("Headline"),
        kind: "text",
        x: 94,
        y: 304,
        text: "SUMMER\nSALE",
        fontSize: 138,
        fontWeight: 700,
        fill: "#15161A",
        width: 760,
        lineHeight: 0.9,
      },
      {
        ...base("Offer label"),
        kind: "text",
        x: 102,
        y: 745,
        text: "UP TO 70% OFF · JULY 2026",
        fontSize: 30,
        fontWeight: 700,
        fill: "#15161A",
        width: 700,
        lineHeight: 1.2,
      },
    ],
  },
  {
    key: "minimalQuote",
    elements: [
      background("#F7F4EF"),
      {
        ...base("Top rule"),
        kind: "rect",
        x: 470,
        y: 200,
        width: 140,
        height: 6,
        fill: "#15161A",
        radius: 3,
      },
      {
        ...base("Quote"),
        kind: "text",
        x: 120,
        y: 380,
        text: "Design is\nintelligence\nmade visible.",
        fontSize: 92,
        fontWeight: 600,
        fill: "#15161A",
        width: 840,
        lineHeight: 1.15,
        align: "center",
        fontFamily: "Georgia, 'Times New Roman', serif",
      },
      {
        ...base("Attribution"),
        kind: "text",
        x: 340,
        y: 800,
        text: "— ALINA WHEELER",
        fontSize: 26,
        fontWeight: 500,
        fill: "#8a8577",
        width: 400,
        lineHeight: 1.2,
        align: "center",
        letterSpacing: 4,
      },
    ],
  },
  {
    key: "productPromo",
    elements: [
      background("#FFFFFF"),
      {
        ...base("Color block"),
        kind: "rect",
        x: 0,
        y: 620,
        width: 1080,
        height: 460,
        fill: "#16181D",
        radius: 0,
      },
      {
        ...base("Badge"),
        kind: "rect",
        x: 90,
        y: 96,
        width: 180,
        height: 64,
        fill: "#F0428C",
        radius: 32,
      },
      {
        ...base("Badge text"),
        kind: "text",
        x: 90,
        y: 112,
        text: "NEW",
        fontSize: 32,
        fontWeight: 800,
        fill: "#FFFFFF",
        width: 180,
        lineHeight: 1,
        align: "center",
        letterSpacing: 4,
      },
      {
        ...base("Product name"),
        kind: "text",
        x: 90,
        y: 240,
        text: "Aurora\nHeadphones",
        fontSize: 96,
        fontWeight: 700,
        fill: "#16181D",
        width: 880,
        lineHeight: 1.05,
      },
      {
        ...base("Price"),
        kind: "text",
        x: 90,
        y: 700,
        text: "$129",
        fontSize: 120,
        fontWeight: 800,
        fill: "#B4FF55",
        width: 500,
        lineHeight: 1,
      },
      {
        ...base("Tagline"),
        kind: "text",
        x: 90,
        y: 880,
        text: "Free shipping this week only",
        fontSize: 32,
        fontWeight: 400,
        fill: "#FFFFFF",
        width: 800,
        lineHeight: 1.2,
      },
      {
        ...base("Star"),
        kind: "star",
        x: 900,
        y: 180,
        points: 5,
        innerRadius: 40,
        outerRadius: 86,
        fill: "#FFD43B",
      },
    ],
  },
  {
    key: "eventPoster",
    elements: [
      background("#15161A"),
      {
        ...base("Glow circle"),
        kind: "circle",
        x: 540,
        y: 330,
        radius: 230,
        fill: "#6C7CFF",
        opacity: 0.35,
      },
      {
        ...base("Title"),
        kind: "text",
        x: 90,
        y: 250,
        text: "NIGHT\nWAVES",
        fontSize: 150,
        fontWeight: 800,
        fill: "#FFFFFF",
        width: 900,
        lineHeight: 0.95,
        align: "center",
        shadow: { enabled: true, color: "#6C7CFF", blur: 40, offsetX: 0, offsetY: 0 },
      },
      {
        ...base("Date"),
        kind: "text",
        x: 90,
        y: 660,
        text: "SAT · AUG 22 · 8PM",
        fontSize: 40,
        fontWeight: 600,
        fill: "#B4FF55",
        width: 900,
        lineHeight: 1.2,
        align: "center",
        letterSpacing: 6,
      },
      {
        ...base("Venue"),
        kind: "text",
        x: 90,
        y: 760,
        text: "Riverside Warehouse, Seoul",
        fontSize: 28,
        fontWeight: 400,
        fill: "#AEB3C0",
        width: 900,
        lineHeight: 1.2,
        align: "center",
      },
      {
        ...base("Bottom rule"),
        kind: "line",
        x: 340,
        y: 880,
        points: [0, 0, 400, 0],
        stroke: "#464A56",
        strokeWidth: 2,
      },
    ],
  },
  {
    key: "webinarInvite",
    elements: [
      background("#6C7CFF"),
      {
        ...base("Card"),
        kind: "rect",
        x: 90,
        y: 170,
        width: 900,
        height: 740,
        fill: "#FFFFFF",
        radius: 36,
        shadow: { enabled: true, color: "#3A45A0", blur: 60, offsetX: 0, offsetY: 24 },
      },
      {
        ...base("Eyebrow"),
        kind: "text",
        x: 170,
        y: 260,
        text: "FREE LIVE WEBINAR",
        fontSize: 26,
        fontWeight: 700,
        fill: "#6C7CFF",
        width: 700,
        lineHeight: 1.2,
        letterSpacing: 5,
      },
      {
        ...base("Title"),
        kind: "text",
        x: 170,
        y: 330,
        text: "Designing\nfor Scale",
        fontSize: 104,
        fontWeight: 700,
        fill: "#16181D",
        width: 740,
        lineHeight: 1.05,
      },
      {
        ...base("Schedule"),
        kind: "text",
        x: 170,
        y: 640,
        text: "Thursday, September 3\n11:00 AM KST",
        fontSize: 34,
        fontWeight: 500,
        fill: "#4A4E5A",
        width: 700,
        lineHeight: 1.4,
      },
      {
        ...base("CTA"),
        kind: "rect",
        x: 170,
        y: 790,
        width: 320,
        height: 76,
        fill: "#16181D",
        radius: 38,
      },
      {
        ...base("CTA text"),
        kind: "text",
        x: 170,
        y: 812,
        text: "Save my seat",
        fontSize: 30,
        fontWeight: 600,
        fill: "#FFFFFF",
        width: 320,
        lineHeight: 1,
        align: "center",
      },
      {
        ...base("Rocket"),
        kind: "icon",
        icon: "Rocket",
        color: "#6C7CFF",
        x: 790,
        y: 720,
        width: 130,
        height: 130,
        strokeWidth: 2,
      },
    ],
  },
  {
    key: "brandGrid",
    elements: [
      background("#B4FF55"),
      {
        ...base("Big circle"),
        kind: "circle",
        x: 780,
        y: 740,
        radius: 260,
        fill: "#16181D",
      },
      {
        ...base("Polygon"),
        kind: "polygon",
        x: 220,
        y: 800,
        sides: 6,
        radius: 130,
        fill: "#FFFFFF",
      },
      {
        ...base("Headline"),
        kind: "text",
        x: 90,
        y: 130,
        text: "MAKE IT\nBOLD.",
        fontSize: 150,
        fontWeight: 800,
        fill: "#16181D",
        width: 900,
        lineHeight: 0.95,
      },
      {
        ...base("Subline"),
        kind: "text",
        x: 94,
        y: 480,
        text: "Brand systems that refuse to whisper",
        fontSize: 34,
        fontWeight: 500,
        fill: "#16181D",
        width: 700,
        lineHeight: 1.3,
      },
    ],
  },
];

export function loadUserTemplates(): UserTemplate[] {
  try {
    const raw = window.localStorage.getItem(TEMPLATE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveUserTemplate(name: string, elements: CanvasElement[]): UserTemplate[] {
  const templates = loadUserTemplates();
  const next = [
    ...templates,
    { id: crypto.randomUUID(), name, elements: elements.map((item) => ({ ...item })) },
  ];
  window.localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function deleteUserTemplate(id: string): UserTemplate[] {
  const next = loadUserTemplates().filter((template) => template.id !== id);
  window.localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(next));
  return next;
}
