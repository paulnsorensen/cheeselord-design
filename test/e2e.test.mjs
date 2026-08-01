import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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
