import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";
import { relative } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { core, validateFlavor } from "../dist/index.js";
import { generatePortal } from "../dist/portal.js";
import { generateSocialCard } from "../dist/social-card.js";

test("accepts a declared fresh-wheel flavor", () => {
  const report = validateFlavor(core, {
    name: "easy-cheese",
    accents: { accent: "#bd6d12", accentMuted: "#ffe4ae", accentStrong: "#763909" },
    surfaces: { paper: "#fff8e7", ink: "#2a1909" },
    socialCard: { composition: "workshop" },
  });
  assert.deepEqual(report, { valid: true, errors: [] });
});

test("accepts oklch() flavor colors and rejects malformed ones", () => {
  const valid = validateFlavor(core, {
    name: "hallouminate",
    accents: { accent: "oklch(55.7% 0.153 45)", accentMuted: "oklch(92.3% 0.052 69)", accentStrong: "oklch(37.8% 0.108 41)" },
    surfaces: { paper: "oklch(98.2% 0.014 74)", ink: "oklch(21.8% 0.029 49)" },
    socialCard: { composition: "signal" },
  });
  assert.deepEqual(valid, { valid: true, errors: [] });

  const invalid = validateFlavor(core, {
    name: "hallouminate",
    accents: { accent: "oklch(55.7%, 0.153, 45)", accentMuted: "#ffe4ae", accentStrong: "#763909" },
    socialCard: { composition: "signal" },
  });
  assert.ok(invalid.errors.includes("accent accent must be a six-digit hex or oklch() color"));
});

test("rejects unknown and locked flavor overrides", () => {
  const report = validateFlavor(core, {
    name: "cheeselord",
    accents: { accent: "#c9962e", accentMuted: "#0d1612", accentStrong: "#f0e2c3", forbidden: "#ffffff" },
    surfaces: { focus: "#ffffff" },
    socialCard: { composition: "monument" },
  });
  assert.deepEqual(report.errors, ["unknown accent token: forbidden", "locked core token override: focus", "undeclared surface override: focus"]);
});

test("generates a dark portal with keyboard-navigable project links and GIF fallback", () => {
  const portal = generatePortal({
    projects: [{ href: "https://example.test/hallouminate", label: "hallouminate", description: "Grounded knowledge." }],
    hero: { src: "cheeselord.webp", fallbackSrc: "cheeselord.gif", alt: "The Cheese Lord" },
  });
  assert.match(portal.html, /color-scheme" content="dark"/);
  assert.match(portal.html, /href="https:\/\/example.test\/hallouminate"/);
  assert.match(portal.html, /src="cheeselord.gif"/);
});

test("generates a social card at its requested dimensions", () => {
  const card = generateSocialCard({ flavor: "hallouminate", title: "Ground it.", description: "Search knowledge.", dimensions: { width: 1280, height: 640 } });
  assert.equal(card.width, 1280);
  assert.match(card.html, /signal-through-the-melt/);
});

test("writes a release manifest with source and output provenance", async () => {
  const manifest = JSON.parse(await readFile("dist/release-manifest.json", "utf8"));
  const packageJson = JSON.parse(await readFile("package.json", "utf8"));

  assert.match(manifest.sourceCommit, /^[0-9a-f]{40}$/);
  assert.equal(manifest.version, packageJson.version);
  assert.ok(Object.keys(manifest.inputHashes).length > 0);
  assert.ok(Object.keys(manifest.outputHashes).length > 0);

  const inputKeys = Object.keys(manifest.inputHashes);
  const outputKeys = Object.keys(manifest.outputHashes);
  assert.deepEqual(inputKeys.filter((key) => outputKeys.includes(key)), []);

  const knownInput = "src/index.ts";
  const expectedHash = `sha256:${createHash("sha256").update(await readFile(knownInput)).digest("hex")}`;
  assert.equal(manifest.inputHashes[knownInput], expectedHash);

  assert.ok(manifest.fontProvenance && Object.keys(manifest.fontProvenance).length > 0);
});

test("portal escapes untrusted label/alt text and rejects unsafe href schemes", () => {
  const portal = generatePortal({
    projects: [{ href: "javascript:alert(1)", label: "<script>alert(1)</script>", description: "d" }],
    hero: { src: "hero.webp", fallbackSrc: "hero.gif", alt: '" onerror=alert(1)' },
  });
  assert.doesNotMatch(portal.html, /href="javascript:alert\(1\)"/);
  assert.match(portal.html, /href="#"/);
  assert.doesNotMatch(portal.html, /<script>alert\(1\)<\/script>/);
  assert.match(portal.html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(portal.html, /alt="" onerror=alert\(1\)"/);
  assert.match(portal.html, /alt="&quot; onerror=alert\(1\)"/);
});

test("social card escapes untrusted title and description", () => {
  const card = generateSocialCard({
    flavor: "hallouminate",
    title: "<script>alert(1)</script>",
    description: '"><img src=x onerror=alert(1)>',
    dimensions: { width: 100, height: 100 },
  });
  assert.doesNotMatch(card.html, /<script>alert\(1\)<\/script>/);
  assert.match(card.html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(card.html, /<img src=x onerror=alert\(1\)>/);
});

test("rejects prototype-chain accent keys like toString", () => {
  const report = validateFlavor(core, {
    name: "cheeselord",
    accents: { accent: "#c9962e", accentMuted: "#0d1612", accentStrong: "#f0e2c3", toString: "#ffffff" },
    socialCard: { composition: "monument" },
  });
  assert.equal(report.valid, false);
  assert.ok(report.errors.includes("unknown accent token: toString"));
});

test("missing accents returns invalid instead of throwing", () => {
  const report = validateFlavor(core, {
    name: "cheeselord",
    socialCard: { composition: "monument" },
  });
  assert.deepEqual(report, { valid: false, errors: ["accents is required"] });
});

test("locked core tokens cannot be overridden via accents", () => {
  const report = validateFlavor(core, {
    name: "cheeselord",
    accents: { accent: "#c9962e", accentMuted: "#0d1612", accentStrong: "#f0e2c3", focus: "#ffffff" },
    socialCard: { composition: "monument" },
  });
  assert.ok(report.errors.includes("locked core token override: focus"));
});

test("rejects non-finite social card dimensions", () => {
  assert.throws(
    () =>
      generateSocialCard({
        flavor: "hallouminate",
        title: "t",
        description: "d",
        dimensions: { width: NaN, height: 100 },
      }),
    /positive/,
  );
});

test("portal assets cover every file transitively required to render it", async () => {
  const portal = generatePortal({
    projects: [],
    hero: { src: "hero.webp", fallbackSrc: "hero.gif", alt: "hero" },
  });

  const cssRelPath = portal.html.match(/<link rel="stylesheet" href="\.\/([^"]+)">/)[1];
  const distStylesDir = new URL("../dist/styles/", import.meta.url);
  const packageRoot = new URL("../", import.meta.url);

  async function resolveCss(filename, seen = new Set()) {
    if (seen.has(filename)) return "";
    seen.add(filename);
    const content = await readFile(new URL(filename, distStylesDir), "utf8");
    let resolved = content;
    for (const match of content.matchAll(/@import\s+"\.\/([^"]+)";/g)) {
      resolved += await resolveCss(match[1], seen);
    }
    return resolved;
  }

  const resolved = await resolveCss(cssRelPath);
  const required = new Set([`dist/styles/${cssRelPath}`]);
  for (const match of resolved.matchAll(/@import\s+"\.\/([^"]+)";/g)) {
    required.add(`dist/styles/${match[1]}`);
  }
  for (const match of resolved.matchAll(/url\("([^"]+)"\)/g)) {
    const resolvedUrl = new URL(match[1], distStylesDir);
    required.add(relative(fileURLToPath(packageRoot), fileURLToPath(resolvedUrl)));
  }

  for (const path of required) {
    assert.ok(portal.assets.includes(path), `assets missing ${path}`);
    await access(new URL(path, packageRoot));
  }
});
