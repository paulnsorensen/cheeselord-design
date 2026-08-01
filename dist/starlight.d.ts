import type { FlavorName } from "./index.js";
export interface StarlightThemeOptions {
    flavor: Extract<FlavorName, "easy-cheese" | "hallouminate">;
}
export interface StarlightThemePlugin {
    name: "@cheeselord/design";
    hooks: {
        "config:setup": (context: {
            updateConfig: (config: {
                customCss: string[];
            }) => void;
        }) => void;
    };
}
export declare function cheeselordTheme(options: StarlightThemeOptions): StarlightThemePlugin;
