export const flavorNames = ["easy-cheese", "hallouminate", "sliced-bread", "cheeselord"] as const;
export type FlavorName = (typeof flavorNames)[number];
