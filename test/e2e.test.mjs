import assert from "node:assert/strict";
import { access, readdir, readFile } from "node:fs/promises";
import test from "node:test";

const stylesDir = new URL("../dist/styles/", import.meta.url);
const genericFamilies = new Set(["serif", "sans-serif", "monospace", "system-ui", "ui-sans-serif", "cursive", "fantasy"]);

async function resolveImports(filename, seen = new Set()) {
  if (seen.has(filename)) return "";
  seen.add(filename);
  const content = await readFile(new URL(filename, stylesDir), "utf8");
  let resolved = content;
  for (const match of content.matchAll(/@import\s+"\.\/([^"]+)";/g)) {
    resolved += await resolveImports(match[1], seen);
  }
  return resolved;
}

async function styleFiles() {
  const entries = await readdir(new URL(".", stylesDir));
  return entries.filter((name) => name.endsWith(".css"));
}

function fontFaces(resolved) {
  const faces = [];
  for (const block of resolved.matchAll(/@font-face\s*\{([^}]*)\}/g)) {
    const body = block[1];
    const family = body.match(/font-family:\s*("[^"]+"|[^;]+);/)?.[1]?.replace(/^"|"$/g, "").trim();
    const weight = body.match(/font-weight:\s*([^;]+);/)?.[1]?.trim();
    const url = body.match(/url\("([^"]+)"\)/)?.[1];
    if (!family || !weight || !url) continue;
    faces.push({ family, weight, url });
  }
  return faces;
}

function referencedFamilies(withoutFontFace) {
  const families = new Set();
  for (const decl of withoutFontFace.matchAll(/font(?:-family)?:\s*([^;]+);/g)) {
    for (const quoted of decl[1].matchAll(/"([^"]+)"/g)) families.add(quoted[1]);
    for (const bare of decl[1].replace(/"[^"]*"/g, "").split(",")) {
      const name = bare.trim().split(/\s+/).pop();
      if (name && !genericFamilies.has(name) && !/^[\d.]/.test(name)) families.add(name);
    }
  }
  return families;
}

const REQUIRED_FACES = [
  { family: "Fraunces", weight: "100 900" },
  { family: "IBM Plex Mono", weight: "400" },
];

test("shared styles self-host fonts and preserve focus and reduced-motion behavior", async () => {
  for (const filename of await styleFiles()) {
    const resolved = await resolveImports(filename);
    assert.doesNotMatch(resolved, /fonts\.googleapis\.com/, `${filename} must not load Google Fonts`);
    assert.match(resolved, /prefers-reduced-motion/, `${filename} must respect reduced motion`);
  }
  for (const filename of ["cheeselord.css", "easy-cheese.css", "hallouminate.css"]) {
    const resolved = await resolveImports(filename);
    assert.match(resolved, /:focus-visible/, `${filename} must define visible keyboard focus`);
  }
});

test("every theme self-hosts the required font faces it references, resolved on disk", async () => {
  for (const filename of ["cheeselord.css", "easy-cheese.css", "hallouminate.css"]) {
    const resolved = await resolveImports(filename);
    const withoutFontFace = resolved.replace(/@font-face\s*\{[^}]*\}/g, "");
    const referenced = referencedFamilies(withoutFontFace);
    const faces = fontFaces(resolved);

    for (const required of REQUIRED_FACES) {
      if (!referenced.has(required.family)) continue;
      const match = faces.find((face) => face.family === required.family && face.weight === required.weight);
      assert.ok(match, `${filename} references ${required.family} but has no self-hosted @font-face for weight ${required.weight}`);
      await access(new URL(match.url, stylesDir));
    }
  }
});