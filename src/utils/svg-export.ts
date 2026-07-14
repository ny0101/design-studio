import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type {
  ArrowElement,
  CanvasElement,
  ElementShadow,
  ImageElement,
  TextElement,
} from "../types/studio";
import { DEFAULT_FONT } from "./fonts";
import { getIconComponent } from "./icons";

const esc = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const num = (value: number) => String(Math.round(value * 100) / 100);

const groupTransform = (element: CanvasElement) => {
  const parts = [`translate(${num(element.x)} ${num(element.y)})`];
  if (element.rotation) parts.push(`rotate(${num(element.rotation)})`);
  return parts.join(" ");
};

const shadowFilter = (shadow?: ElementShadow) =>
  shadow?.enabled
    ? `filter="drop-shadow(${num(shadow.offsetX)}px ${num(shadow.offsetY)}px ${num(
        shadow.blur,
      )}px ${esc(shadow.color)})"`
    : "";

const openGroup = (element: CanvasElement, extras = "") =>
  `<g transform="${groupTransform(element)}" opacity="${num(element.opacity)}"${
    extras ? ` ${extras}` : ""
  }>`;

const polygonPoints = (sides: number, radius: number) =>
  Array.from({ length: sides }, (_, index) => {
    const angle = (2 * Math.PI * index) / sides - Math.PI / 2;
    return `${num(radius * Math.cos(angle))},${num(radius * Math.sin(angle))}`;
  }).join(" ");

const starPoints = (points: number, innerRadius: number, outerRadius: number) =>
  Array.from({ length: points * 2 }, (_, index) => {
    const radius = index % 2 === 0 ? outerRadius : innerRadius;
    const angle = (Math.PI * index) / points - Math.PI / 2;
    return `${num(radius * Math.cos(angle))},${num(radius * Math.sin(angle))}`;
  }).join(" ");

function renderText(element: TextElement): string {
  const fontFamily = element.fontFamily ?? DEFAULT_FONT;
  const weight = element.fontWeight ?? 400;
  const letterSpacing = element.letterSpacing ?? 0;
  const align = element.align ?? "left";
  const anchor = align === "center" ? "middle" : align === "right" ? "end" : "start";
  const anchorX = align === "center" ? element.width / 2 : align === "right" ? element.width : 0;
  const lineStep = element.fontSize * element.lineHeight;
  const outline = element.outline?.enabled
    ? `stroke="${esc(element.outline.color)}" stroke-width="${num(element.outline.width)}" paint-order="stroke"`
    : "";
  const lines = element.text
    .split("\n")
    .map(
      (line, index) =>
        `<tspan x="${num(anchorX)}" y="${num(element.fontSize * 0.85 + index * lineStep)}">${esc(line)}</tspan>`,
    )
    .join("");
  return (
    openGroup(element, shadowFilter(element.shadow)) +
    `<text fill="${esc(element.fill)}" font-family="${esc(fontFamily)}" font-size="${num(element.fontSize)}" font-weight="${weight}" letter-spacing="${num(letterSpacing)}" text-anchor="${anchor}" ${outline}>${lines}</text></g>`
  );
}

function renderImage(element: ImageElement): string {
  const cssFilters: string[] = [];
  if (element.brightness !== 100) cssFilters.push(`brightness(${element.brightness / 100})`);
  if (element.contrast) cssFilters.push(`contrast(${(element.contrast + 100) / 100})`);
  if (element.saturation) cssFilters.push(`saturate(${(element.saturation + 100) / 100})`);
  if (element.blurRadius) cssFilters.push(`blur(${element.blurRadius}px)`);
  if (element.grayscale) cssFilters.push("grayscale(1)");
  if (element.shadow?.enabled) {
    cssFilters.push(
      `drop-shadow(${num(element.shadow.offsetX)}px ${num(element.shadow.offsetY)}px ${num(element.shadow.blur)}px ${element.shadow.color})`,
    );
  }
  const style = cssFilters.length ? ` style="filter: ${esc(cssFilters.join(" "))}"` : "";
  const clipId = `clip-${element.id}`;
  const clip = element.radius
    ? `<clipPath id="${clipId}"><rect width="${num(element.width)}" height="${num(element.height)}" rx="${num(element.radius)}"/></clipPath>`
    : "";
  const flips: string[] = [];
  if (element.flipX) flips.push(`translate(${num(element.width)} 0) scale(-1 1)`);
  if (element.flipY) flips.push(`translate(0 ${num(element.height)}) scale(1 -1)`);
  const flipTransform = flips.length ? ` transform="${flips.join(" ")}"` : "";
  const content = element.crop
    ? `<svg width="${num(element.width)}" height="${num(element.height)}" viewBox="${num(element.crop.x)} ${num(element.crop.y)} ${num(element.crop.width)} ${num(element.crop.height)}" preserveAspectRatio="none"><image href="${esc(element.src)}"/></svg>`
    : `<image href="${esc(element.src)}" width="${num(element.width)}" height="${num(element.height)}" preserveAspectRatio="none"/>`;
  const clipAttr = element.radius ? ` clip-path="url(#${clipId})"` : "";
  return (
    openGroup(element) +
    `${clip}<g${clipAttr}${flipTransform}${style}>${content}</g></g>`
  );
}

function renderArrow(element: ArrowElement): string {
  const [x1, y1, x2, y2] = element.points;
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const back = {
    x: x2 - element.pointerLength * Math.cos(angle),
    y: y2 - element.pointerLength * Math.sin(angle),
  };
  const perp = { x: -Math.sin(angle), y: Math.cos(angle) };
  const half = element.pointerWidth / 2;
  const head = [
    `${num(x2)},${num(y2)}`,
    `${num(back.x + perp.x * half)},${num(back.y + perp.y * half)}`,
    `${num(back.x - perp.x * half)},${num(back.y - perp.y * half)}`,
  ].join(" ");
  return (
    openGroup(element) +
    `<line x1="${num(x1)}" y1="${num(y1)}" x2="${num(back.x)}" y2="${num(back.y)}" stroke="${esc(element.stroke)}" stroke-width="${num(element.strokeWidth)}" stroke-linecap="round"/>` +
    `<polygon points="${head}" fill="${esc(element.stroke)}"/></g>`
  );
}

function renderElement(element: CanvasElement): string {
  switch (element.kind) {
    case "rect":
      return (
        openGroup(element, shadowFilter(element.shadow)) +
        `<rect width="${num(element.width)}" height="${num(element.height)}" fill="${esc(element.fill)}" rx="${num(element.radius)}"/></g>`
      );
    case "circle":
      return (
        openGroup(element) +
        `<circle r="${num(element.radius)}" fill="${esc(element.fill)}"/></g>`
      );
    case "ellipse":
      return (
        openGroup(element) +
        `<ellipse rx="${num(element.radiusX)}" ry="${num(element.radiusY)}" fill="${esc(element.fill)}"/></g>`
      );
    case "polygon":
      return (
        openGroup(element) +
        `<polygon points="${polygonPoints(element.sides, element.radius)}" fill="${esc(element.fill)}"/></g>`
      );
    case "star":
      return (
        openGroup(element) +
        `<polygon points="${starPoints(element.points, element.innerRadius, element.outerRadius)}" fill="${esc(element.fill)}"/></g>`
      );
    case "line": {
      const [x1, y1, x2, y2] = element.points;
      return (
        openGroup(element) +
        `<line x1="${num(x1)}" y1="${num(y1)}" x2="${num(x2)}" y2="${num(y2)}" stroke="${esc(element.stroke)}" stroke-width="${num(element.strokeWidth)}" stroke-linecap="round"/></g>`
      );
    }
    case "arrow":
      return renderArrow(element);
    case "text":
      return renderText(element);
    case "image":
      return renderImage(element);
    case "icon": {
      const IconComponent = getIconComponent(element.icon);
      if (!IconComponent) return "";
      const markup = renderToStaticMarkup(
        createElement(IconComponent, {
          color: element.color,
          strokeWidth: element.strokeWidth ?? 2,
          width: element.width,
          height: element.height,
        }),
      );
      return openGroup(element) + markup + "</g>";
    }
  }
}

export function buildSvg(
  elements: CanvasElement[],
  width: number,
  height: number,
): string {
  const body = elements
    .filter((element) => !element.hidden)
    .map(renderElement)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n${body}\n</svg>`;
}
