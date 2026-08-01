import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { core, generatePortal, generateSocialCard, validateFlavor } from "../dist/index.js";

test("accepts a declared fresh-wheel flavor", () => {
  const report = validateFlavor(core, {
    name: "easy-cheese",
    accents: { accent: "#bd6d12", accentMuted: "#ffe4ae", accentStrong: "#763909" },
    surfaces: { paper: "#fff8e7", ink: "#2a1909" },
    socialCard: { composition: "workshop" },
  });
  assert.deepEqual(report, { valid: true, errors: [] });
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
    flavor: "cheeselord",
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
  assert.match(manifest.sourceCommit, /^[0-9a-f]{40}$/);
  assert.ok(Object.keys(manifest.inputHashes).length > 0);
  assert.ok(Object.keys(manifest.outputHashes).length > 0);
});
