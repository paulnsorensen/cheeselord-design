import type { FlavorName } from "./index.js";

export interface StarlightThemeOptions {
  flavor: Extract<FlavorName, "easy-cheese" | "hallouminate">;
}

export interface StarlightThemePlugin {
  name: "@cheeselord/design";
  hooks: {
    "config:setup": (context: {
      updateConfig: (config: { customCss: string[] }) => void;
    }) => void;
  };
}

export function cheeselordTheme(options: StarlightThemeOptions): StarlightThemePlugin {
  const stylesheet = `@cheeselord/design/styles/${options.flavor}.css`;

  return {
    name: "@cheeselord/design",
    hooks: {
      "config:setup": ({ updateConfig }) => {
        updateConfig({ customCss: [stylesheet] });
      },
    },
  };
}
