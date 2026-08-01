export const flavorNames = ["easy-cheese", "hallouminate", "cheeselord"] as const;
export type FlavorName = (typeof flavorNames)[number];
