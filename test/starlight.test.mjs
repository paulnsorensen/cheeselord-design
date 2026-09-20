import assert from "node:assert/strict";
import test from "node:test";
import { cheeseFavicon } from "../dist/index.js";
import { cheeselordTheme } from "../dist/starlight.js";

test("cheeselordTheme appends its stylesheet after a consumer's existing customCss", () => {
  const plugin = cheeselordTheme({ flavor: "hallouminate" });
  let updated;
  plugin.hooks["config:setup"]({
    config: { customCss: ["./src/styles/site.css"] },
    updateConfig: (config) => {
      updated = config;
    },
  });

  assert.deepEqual(updated.customCss, ["./src/styles/site.css", "@cheeselord/design/styles/hallouminate.css"]);
});

test("cheeselordTheme appends the 🧀 favicon after a consumer's existing head", () => {
  const plugin = cheeselordTheme({ flavor: "easy-cheese" });
  const existing = { tag: "meta", attrs: { name: "robots", content: "noindex" } };
  let updated;
  plugin.hooks["config:setup"]({
    config: { head: [existing] },
    updateConfig: (config) => {
      updated = config;
    },
  });

  assert.equal(updated.head.length, 2);
  assert.equal(updated.head[0], existing);
  const icon = updated.head[1];
  assert.equal(icon.tag, "link");
  /* the rel must equal Starlight's default favicon rel, or Starlight sorts the default link last and it wins */
  assert.equal(icon.attrs.rel, "shortcut icon");
  assert.equal(icon.attrs.href, cheeseFavicon);
  assert.match(icon.attrs.href, /%F0%9F%A7%80/);
});
