import type { FlavorName } from "./flavor.js";

export interface StarlightThemeOptions {
  flavor: Extract<FlavorName, "easy-cheese" | "hallouminate">;
}

export interface StarlightThemePlugin {
  name: "@cheeselord/design";
  hooks: {
    "config:setup": (context: {
      config: { customCss?: string[] };
      updateConfig: (config: { customCss: string[] }) => void;
    }) => void;
  };
}

export function cheeselordTheme(options: StarlightThemeOptions): StarlightThemePlugin {
  const stylesheet = `@cheeselord/design/styles/${options.flavor}.css`;

  return {
    name: "@cheeselord/design",
    hooks: {
      "config:setup": ({ config, updateConfig }) => {
        updateConfig({ customCss: [...(config.customCss ?? []), stylesheet] });
      },
    },
  };
}
