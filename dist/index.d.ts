export declare const flavorNames: readonly ["easy-cheese", "hallouminate", "cheeselord"];
export type FlavorName = (typeof flavorNames)[number];
export interface CoreDefinition {
    version: string;
    lockedTokens: readonly string[];
    minimumContrast: number;
}
export interface FlavorDefinition {
    name: FlavorName;
    accents: Record<string, string>;
    typography?: {
        display?: string;
        mono?: string;
    };
    surfaces?: Record<string, string>;
    socialCard: {
        composition: "workshop" | "signal" | "monument";
    };
}
export interface ValidationReport {
    valid: boolean;
    errors: string[];
}
export declare const core: CoreDefinition;
export declare function validateFlavor(definition: CoreDefinition, flavor: FlavorDefinition): ValidationReport;
export declare function contentHash(value: string | Uint8Array): string;
export { generatePortal } from "./portal.js";
export { generateSocialCard } from "./social-card.js";
