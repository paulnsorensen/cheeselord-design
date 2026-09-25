import { cheeseFavicon } from "./favicon.js";
import type { FlavorName } from "./flavor.js";

export interface StarlightThemeOptions {
  flavor: Extract<FlavorName, "easy-cheese" | "hallouminate" | "sliced-bread">;
}

export interface StarlightHeadTag {
  tag: string;
  attrs?: Record<string, string | boolean | undefined>;
  content?: string;
}

export interface StarlightThemePlugin {
  name: "@cheeselord/design";
  hooks: {
    "config:setup": (context: {
      config: { customCss?: string[]; head?: StarlightHeadTag[] };
      updateConfig: (config: { customCss: string[]; head: StarlightHeadTag[] }) => void;
    }) => void;
  };
}

/*
 * Starlight's `favicon` option accepts file paths only, so the icon goes in `head`.
 * Starlight sorts its default `rel="shortcut icon"` link below every other link, and the last icon wins.
 * The same rel value ties with that default, and the stable sort then keeps this link last.
 */
const icon: StarlightHeadTag = {
  tag: "link",
  attrs: { rel: "shortcut icon", type: "image/svg+xml", href: cheeseFavicon },
};

export function cheeselordTheme(options: StarlightThemeOptions): StarlightThemePlugin {
  const stylesheet = `@cheeselord/design/styles/${options.flavor}.css`;

  return {
    name: "@cheeselord/design",
    hooks: {
      "config:setup": ({ config, updateConfig }) => {
        updateConfig({
          customCss: [...(config.customCss ?? []), stylesheet],
          head: [...(config.head ?? []), icon],
        });
      },
    },
  };
}
