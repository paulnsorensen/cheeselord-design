import { createHash } from "node:crypto";
import { flavorNames, type FlavorName } from "./flavor.js";

export { flavorNames };
export type { FlavorName };

export interface CoreDefinition {
  version: string;
  lockedTokens: readonly string[];
  minimumContrast: number;
}

export interface FlavorDefinition {
  name: FlavorName;
  accents: Record<string, string>;
  typography?: { display?: string; mono?: string };
  surfaces?: Record<string, string>;
  socialCard: { composition: "workshop" | "signal" | "monument" };
}

export interface ValidationReport {
  valid: boolean;
  errors: string[];
}

const hexColor = /^#[0-9a-f]{6}$/i;
const allowedAccents = new Set(["accent", "accentMuted", "accentStrong"]);
const allowedSurfaces = new Set(["paper", "ink"]);

export const core: CoreDefinition = {
  version: "0.1.0",
  lockedTokens: ["focus", "motion", "spacing", "state"],
  minimumContrast: 4.5,
};

export function validateFlavor(
  definition: CoreDefinition,
  flavor: FlavorDefinition,
): ValidationReport {
  const errors: string[] = [];
  const checkLocked = (key: string) => {
    if (definition.lockedTokens.includes(key)) errors.push(`locked core token override: ${key}`);
  };

  if (!flavor.accents) {
    errors.push("accents is required");
  } else {
    for (const [key, value] of Object.entries(flavor.accents)) {
      checkLocked(key);
      if (!allowedAccents.has(key)) errors.push(`unknown accent token: ${key}`);
      if (!hexColor.test(value)) errors.push(`accent ${key} must be a six-digit hex color`);
    }

    if (!Object.hasOwn(flavor.accents, "accent") || !Object.hasOwn(flavor.accents, "accentMuted") || !Object.hasOwn(flavor.accents, "accentStrong")) {
      errors.push("accent, accentMuted, and accentStrong are required");
    }
  }

  if (flavor.surfaces) {
    for (const [key, value] of Object.entries(flavor.surfaces)) {
      checkLocked(key);
      if (!allowedSurfaces.has(key)) errors.push(`undeclared surface override: ${key}`);
      if (!hexColor.test(value)) errors.push(`surface ${key} must be a six-digit hex color`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export function contentHash(value: string | Uint8Array): string {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

