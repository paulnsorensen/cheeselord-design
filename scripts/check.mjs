import { access, readFile } from "node:fs/promises";
import { glob } from "node:fs/promises";
import { dirname, join } from "node:path";

const packageJson = JSON.parse(await readFile("package.json", "utf8"));
if (packageJson.publishConfig?.access !== "public") throw new Error("publishConfig.access must be public");
if (!packageJson.peerDependencies?.astro || !packageJson.peerDependencies?.["@astrojs/starlight"]) {
  throw new Error("Astro and Starlight peer ranges are required");
}

try {
  await access("dist/styles");
} catch {
  throw new Error("dist/styles not found — run `npm run build` before `npm run check`");
}

for await (const filename of glob(["styles/**/*.css", "dist/styles/**/*.css", "components/**/*.astro"])) {
  const stylesheet = await readFile(filename, "utf8");
  if (stylesheet.includes("fonts.googleapis.com") || stylesheet.includes("fonts.gstatic.com")) {
    throw new Error(`${filename} must not load Google Fonts`);
  }
}

// Themes share their @font-face and reduced-motion rules via styles/fonts.css, so the
// guarantees below hold across the @import chain rather than in each theme's own text.
async function readResolved(filename, seen = new Set()) {
  if (seen.has(filename)) return "";
  seen.add(filename);
  const stylesheet = await readFile(filename, "utf8");
  let resolved = stylesheet;
  for (const [statement, target] of stylesheet.matchAll(/@import\s+["']([^"']+)["'][^;]*;/g)) {
    const imported = await readResolved(join(dirname(filename), target), seen);
    resolved = resolved.replace(statement, imported);
  }
  return resolved;
}

for (const filename of ["styles/easy-cheese.css", "styles/cheeselord.css"]) {
  const stylesheet = await readResolved(filename);
  if (!stylesheet.includes(":focus-visible")) throw new Error(`${filename} must define visible keyboard focus`);
  if (!stylesheet.includes("prefers-reduced-motion")) throw new Error(`${filename} must respect reduced motion`);
}

// The core contract is versioned by the package release itself.
const { core } = await import(new URL("../dist/index.js", import.meta.url));
if (core.version !== packageJson.version) {
  throw new Error(`core.version (${core.version}) must match package.json (${packageJson.version})`);
}

// ---- contrast enforcement: core.minimumContrast is a guarantee, not a wish ----
// Understands the oklch() shapes this package actually writes: literals,
// var() chains, light-dark() pairs, and `oklch(from var(--x) …)` with plain
// channels or single-operation calc(). Anything else throws, so a new syntax
// must be taught here before it can ship.

function splitTopLevel(text) {
  const parts = [];
  let depth = 0;
  let current = "";
  for (const character of text) {
    if (character === "(") depth += 1;
    if (character === ")") depth -= 1;
    if (character === " " && depth === 0) {
      if (current) parts.push(current);
      current = "";
      continue;
    }
    current += character;
  }
  if (current) parts.push(current);
  return parts;
}

function evalChannel(expression, base) {
  if (/^-?\d+(\.\d+)?%$/.test(expression)) return parseFloat(expression) / 100;
  if (/^-?\d+(\.\d+)?$/.test(expression)) return parseFloat(expression);
  if (/^[lch]$/.test(expression)) return base[expression];
  const calc = expression.match(/^calc\(([lch]) ([*+-]) (\d+(?:\.\d+)?)\)$/);
  if (calc) {
    const value = base[calc[1]];
    const operand = Number(calc[3]);
    if (calc[2] === "*") return value * operand;
    if (calc[2] === "+") return value + operand;
    return value - operand;
  }
  throw new Error(`unsupported oklch channel expression: ${expression}`);
}

function declarations(resolved) {
  const map = new Map();
  for (const match of resolved.matchAll(/(--[\w-]+):\s*([^;{}]+);/g)) map.set(match[1], match[2].trim());
  return map;
}

// Resolves a token to { light, dark } oklch triples ({ l, c, h }); opaque colors only.
function resolveColor(tokens, value, mode) {
  const variable = value.match(/^var\((--[\w-]+)(?:,\s*(.+))?\)$/);
  if (variable) {
    const target = tokens.get(variable[1]) ?? variable[2];
    if (!target) throw new Error(`cannot resolve ${variable[1]}`);
    return resolveColor(tokens, target.trim(), mode);
  }
  const lightDark = value.match(/^light-dark\((.+)\)$/);
  if (lightDark) {
    const halves = [];
    let depth = 0;
    let current = "";
    for (const character of lightDark[1]) {
      if (character === "(") depth += 1;
      if (character === ")") depth -= 1;
      if (character === "," && depth === 0) {
        halves.push(current);
        current = "";
        continue;
      }
      current += character;
    }
    halves.push(current);
    return resolveColor(tokens, halves[mode === "light" ? 0 : 1].trim(), mode);
  }
  const literal = value.match(/^oklch\(([^)]+)\)$/);
  if (literal && !literal[1].startsWith("from ")) {
    const channels = splitTopLevel(literal[1]);
    if (channels.length > 3) throw new Error(`refusing to contrast-check a translucent color: ${value}`);
    return { l: evalChannel(channels[0], {}), c: evalChannel(channels[1], {}), h: evalChannel(channels[2], {}) };
  }
  const relative = value.match(/^oklch\(from (var\(--[\w-]+\)) (.+)\)$/);
  if (relative) {
    const base = resolveColor(tokens, relative[1], mode);
    const channels = splitTopLevel(relative[2]);
    if (channels.length > 3) throw new Error(`refusing to contrast-check a translucent color: ${value}`);
    return { l: evalChannel(channels[0], base), c: evalChannel(channels[1], base), h: evalChannel(channels[2], base) };
  }
  throw new Error(`unsupported color value: ${value}`);
}

function luminance({ l, c, h }) {
  const hue = (h * Math.PI) / 180;
  const a = c * Math.cos(hue);
  const b = c * Math.sin(hue);
  const long = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const medium = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const short = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const clamp = (channel) => Math.min(1, Math.max(0, channel));
  const red = clamp(4.0767416621 * long - 3.3077115913 * medium + 0.2309699292 * short);
  const green = clamp(-1.2684380046 * long + 2.6097574011 * medium - 0.3413193965 * short);
  const blue = clamp(-0.0041960863 * long - 0.7034186147 * medium + 1.707614701 * short);
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrast(tokens, foreground, background, mode) {
  const fg = luminance(resolveColor(tokens, `var(${foreground})`, mode));
  const bg = luminance(resolveColor(tokens, `var(${background})`, mode));
  return (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
}

function assertContrast(filename, tokens, foreground, background, mode) {
  const ratio = contrast(tokens, foreground, background, mode);
  if (process.env.CONTRAST_VERBOSE) console.log(`${filename} (${mode}): ${foreground} on ${background} = ${ratio.toFixed(2)}:1`);
  if (ratio < core.minimumContrast) {
    throw new Error(
      `${filename} (${mode}): ${foreground} on ${background} is ${ratio.toFixed(2)}:1, below the ${core.minimumContrast}:1 floor`,
    );
  }
}

const flavors = ["easy-cheese", "hallouminate", "cheeselord"];

// Flavor primitives: the accent must speak on the dark field, the rind on paper.
for (const flavor of flavors) {
  const filename = `styles/flavors/${flavor}.css`;
  const tokens = declarations(await readResolved(filename));
  assertContrast(filename, tokens, "--cl-amber", "--cl-ink", "dark");
  assertContrast(filename, tokens, "--cl-rind", "--cl-paper", "light");
}

// Starlight themes: text tokens against the mode's field, for every flavor's primitives.
for (const flavor of ["easy-cheese", "hallouminate"]) {
  const filename = `styles/${flavor}.css`;
  const tokens = declarations(await readResolved(filename));
  for (const token of ["--sl-color-white", "--sl-color-gray-1", "--sl-color-gray-2", "--sl-color-gray-3", "--sl-color-text-accent"]) {
    assertContrast(filename, tokens, token, "--sl-color-black", "light");
    assertContrast(filename, tokens, token, "--sl-color-black", "dark");
  }
}

// The portal shell and the social cards live on the dark field only.
{
  const tokens = declarations(await readResolved("styles/cheeselord.css"));
  for (const token of ["--bone", "--dim", "--gold"]) {
    assertContrast("styles/cheeselord.css", tokens, token, "--cellar", "dark");
  }
}
for (const flavor of flavors) {
  const tokens = declarations(await readResolved("styles/social-card.css"));
  for (const [name, value] of declarations(await readResolved(`styles/flavors/${flavor}.css`))) tokens.set(name, value);
  for (const token of ["--card-bone", "--card-dim", "--cl-amber"]) {
    assertContrast(`styles/social-card.css (${flavor})`, tokens, token, "--cl-ink", "dark");
  }
}
