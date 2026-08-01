import { createHash } from "node:crypto";
export const flavorNames = ["easy-cheese", "hallouminate", "cheeselord"];
const hexColor = /^#[0-9a-f]{6}$/i;
const allowedAccents = { accent: true, accentMuted: true, accentStrong: true };
const allowedSurfaces = { paper: true, ink: true };
export const core = {
    version: "0.1.0",
    lockedTokens: ["focus", "motion", "spacing", "state"],
    minimumContrast: 4.5,
};
export function validateFlavor(definition, flavor) {
    const errors = [];
    for (const [key, value] of Object.entries(flavor.accents)) {
        if (!allowedAccents[key])
            errors.push(`unknown accent token: ${key}`);
        if (!hexColor.test(value))
            errors.push(`accent ${key} must be a six-digit hex color`);
    }
    if (flavor.surfaces) {
        for (const [key, value] of Object.entries(flavor.surfaces)) {
            if (definition.lockedTokens.includes(key))
                errors.push(`locked core token override: ${key}`);
            if (!allowedSurfaces[key])
                errors.push(`undeclared surface override: ${key}`);
            if (!hexColor.test(value))
                errors.push(`surface ${key} must be a six-digit hex color`);
        }
    }
    if (!flavor.accents.accent || !flavor.accents.accentMuted || !flavor.accents.accentStrong) {
        errors.push("accent, accentMuted, and accentStrong are required");
    }
    return { valid: errors.length === 0, errors };
}
export function contentHash(value) {
    return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}
export { generatePortal } from "./portal.js";
export { generateSocialCard } from "./social-card.js";
