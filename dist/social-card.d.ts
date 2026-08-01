import type { FlavorName } from "./index.js";
export interface SocialDimensions {
    width: number;
    height: number;
}
export interface GeneratedCard {
    html: string;
    width: number;
    height: number;
}
export declare function generateSocialCard(options: {
    flavor: FlavorName;
    title: string;
    description: string;
    dimensions: SocialDimensions;
}): GeneratedCard;
