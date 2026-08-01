import { readFile } from "node:fs/promises";
import { glob } from "node:fs/promises";

const packageJson = JSON.parse(await readFile("package.json", "utf8"));
if (packageJson.publishConfig?.access !== "public") throw new Error("publishConfig.access must be public");
if (!packageJson.peerDependencies?.astro || !packageJson.peerDependencies?.["@astrojs/starlight"]) {
  throw new Error("Astro and Starlight peer ranges are required");
}

for await (const filename of glob("styles/**/*.css")) {
  const stylesheet = await readFile(filename, "utf8");
  if (stylesheet.includes("fonts.googleapis.com")) throw new Error(`${filename} must not load Google Fonts`);
}

for (const filename of ["styles/easy-cheese.css", "styles/cheeselord.css"]) {
  const stylesheet = await readFile(filename, "utf8");
  if (!stylesheet.includes(":focus-visible")) throw new Error(`${filename} must define visible keyboard focus`);
  if (!stylesheet.includes("prefers-reduced-motion")) throw new Error(`${filename} must respect reduced motion`);
}
