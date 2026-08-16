import assert from "node:assert/strict";
import { access, readdir, readFile } from "node:fs/promises";
import test from "node:test";

const stylesDir = new URL("../dist/styles/", import.meta.url);
const genericFamilies = new Set(["serif", "sans-serif", "monospace", "system-ui", "ui-sans-serif", "cursive", "fantasy"]);

// Imports resolve against the importing file, not the styles root: flavors/ and
// the Starlight themes both ship an `easy-cheese.css`.
async function resolveImports(fileUrl, seen = new Set()) {
  if (seen.has(fileUrl.href)) return "";
  seen.add(fileUrl.href);
  const content = await readFile(fileUrl, "utf8");
  let resolved = content;
  for (const match of content.matchAll(/@import\s+"([^"]+)"[^;]*;/g)) {
    resolved += await resolveImports(new URL(match[1], fileUrl), seen);
  }
  return resolved;
}

// Recursive: styles/flavors/*.css ship to consumers too, so they are held to the
// same no-remote-fonts rule as the sheets that import them.
async function styleFiles() {
  const files = [];
  for (const entry of await readdir(new URL(".", stylesDir), { withFileTypes: true, recursive: true })) {
    if (entry.isFile() && entry.name.endsWith(".css")) {
      const dir = entry.parentPath.slice(entry.parentPath.indexOf("dist/styles/") + "dist/styles/".length);
      files.push(dir ? `${dir}/${entry.name}` : entry.name);
    }
  }
  return files;
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
  // `--mono` counts as a reference: every sheet names the mono face through the token.
  for (const decl of withoutFontFace.matchAll(/(?:font(?:-family)?|--mono):\s*([^;]+);/g)) {
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

// Pinned so the sweep below cannot quietly shrink to nothing: a mis-pathed dist
// directory or a lost sheet fails here rather than passing zero assertions.
const SHIPPED_STYLESHEETS = [
  "cheeselord.css",
  "easy-cheese.css",
  "flavors/cheeselord.css",
  "flavors/easy-cheese.css",
  "flavors/hallouminate.css",
  "flavors/sliced-bread.css",
  "fonts.css",
  "hallouminate.css",
  "header.css",
  "sliced-bread.css",
  "social-card.css",
];

test("shared styles self-host fonts and preserve focus and reduced-motion behavior", async () => {
  const files = await styleFiles();
  assert.deepEqual(files.sort(), SHIPPED_STYLESHEETS, "the built styles directory must ship exactly these sheets");

  for (const filename of files) {
    const resolved = await resolveImports(new URL(filename, stylesDir));
    assert.doesNotMatch(resolved, /fonts\.googleapis\.com/, `${filename} must not load Google Fonts`);
  }
  // Sheets that render a page must respect reduced motion; flavors/*.css declare
  // tokens and no rules, so they have no animation to suppress.
  for (const filename of ["cheeselord.css", "easy-cheese.css", "hallouminate.css", "sliced-bread.css", "header.css", "social-card.css"]) {
    const resolved = await resolveImports(new URL(filename, stylesDir));
    assert.match(resolved, /prefers-reduced-motion/, `${filename} must respect reduced motion`);
  }
  for (const filename of ["cheeselord.css", "easy-cheese.css", "hallouminate.css", "sliced-bread.css"]) {
    const resolved = await resolveImports(new URL(filename, stylesDir));
    assert.match(resolved, /:focus-visible/, `${filename} must define visible keyboard focus`);
  }
});

// Pinned so a broken family regex fails loudly instead of skipping every check:
// each pair below must still be discovered by referencedFamilies().
const EXPECTED_FACE_REFERENCES = [
  "cheeselord.css → Fraunces",
  "cheeselord.css → IBM Plex Mono",
  "easy-cheese.css → Fraunces",
  "easy-cheese.css → IBM Plex Mono",
  "hallouminate.css → Fraunces",
  "hallouminate.css → IBM Plex Mono",
  "sliced-bread.css → Fraunces",
  "sliced-bread.css → IBM Plex Mono",
  "social-card.css → Fraunces",
  "social-card.css → IBM Plex Mono",
];

test("every theme self-hosts the required font faces it references, resolved on disk", async () => {
  const checked = [];
  for (const filename of ["cheeselord.css", "easy-cheese.css", "hallouminate.css", "sliced-bread.css", "social-card.css"]) {
    const resolved = await resolveImports(new URL(filename, stylesDir));
    const withoutFontFace = resolved.replace(/@font-face\s*\{[^}]*\}/g, "");
    const referenced = referencedFamilies(withoutFontFace);
    const faces = fontFaces(resolved);

    for (const required of REQUIRED_FACES) {
      if (!referenced.has(required.family)) continue;
      const match = faces.find((face) => face.family === required.family && face.weight === required.weight);
      assert.ok(match, `${filename} references ${required.family} but has no self-hosted @font-face for weight ${required.weight}`);
      await access(new URL(match.url, stylesDir));
      checked.push(`${filename} → ${required.family}`);
    }
  }
  assert.deepEqual(checked.sort(), EXPECTED_FACE_REFERENCES, "a reference the sweep used to find has gone unchecked");
});
