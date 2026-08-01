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
  for (const [statement, target] of stylesheet.matchAll(/@import\s+["']([^"']+)["']\s*;/g)) {
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
