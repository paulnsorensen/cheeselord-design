import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("shared styles self-host fonts and preserve focus and reduced-motion behavior", async () => {
  const [docsStyle, portalStyle] = await Promise.all([
    readFile("dist/styles/easy-cheese.css", "utf8"),
    readFile("dist/styles/cheeselord.css", "utf8"),
  ]);

  for (const stylesheet of [docsStyle, portalStyle]) {
    assert.doesNotMatch(stylesheet, /fonts\.googleapis\.com/);
    assert.match(stylesheet, /:focus-visible/);
    assert.match(stylesheet, /prefers-reduced-motion/);
  }
});

test("packed styles resolve every self-hosted font from their published location", async () => {
  const stylesheet = await readFile("dist/styles/easy-cheese.css", "utf8");
  const fontPaths = [
    "../../assets/fonts/fraunces-latin-500.woff2",
    "../../assets/fonts/fraunces-latin-700.woff2",
    "../../assets/fonts/ibm-plex-mono-latin.woff2",
  ];

  for (const fontPath of fontPaths) {
    assert.match(stylesheet, new RegExp(`url\\(\"${fontPath}\"\\)`));
    await access(new URL(fontPath, new URL("../dist/styles/", import.meta.url)));
  }
});
