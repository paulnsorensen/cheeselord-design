import assert from "node:assert/strict";
import test from "node:test";
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
