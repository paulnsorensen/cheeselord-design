import type { FlavorName } from "./flavor.js";

export interface SocialDimensions {
  width: number;
  height: number;
}

export interface GeneratedCard {
  html: string;
  width: number;
  height: number;
  /**
   * Every file transitively required to render the card, as paths relative to the
   * installed package root (e.g. `node_modules/@cheeselord/design/`) — matching the
   * `dist`/`assets` layout published in `package.json`'s `files`.
   */
  assets: string[];
}

const fontAssets = ["assets/fonts/fraunces-latin-variable.woff2", "assets/fonts/ibm-plex-mono-latin.woff2"];

const cardClass: Record<FlavorName, string> = {
  "easy-cheese": "fresh-wheel",
  hallouminate: "signal-through-the-melt",
  cheeselord: "norse-cheese-lord",
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function generateSocialCard(options: {
  flavor: FlavorName;
  title: string;
  description: string;
  dimensions: SocialDimensions;
}): GeneratedCard {
  const { width, height } = options.dimensions;
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new Error("social-card dimensions must be positive");
  }

  const flavorSheets = new Set(["dist/styles/flavors/easy-cheese.css", `dist/styles/flavors/${options.flavor}.css`]);

  return {
    width,
    height,
    html: `<!doctype html><html lang="en"><meta charset="utf-8"><title>${escapeHtml(options.title)}</title><link rel="stylesheet" href="./flavors/${options.flavor}.css"><link rel="stylesheet" href="./social-card.css"><main class="${cardClass[options.flavor]}" style="width:${width}px;height:${height}px"><p>Cheese Lord</p><h1>${escapeHtml(options.title)}</h1><p>${escapeHtml(options.description)}</p></main></html>`,
    assets: [...flavorSheets, "dist/styles/social-card.css", "dist/styles/fonts.css", ...fontAssets],
  };
}
