export interface ProjectLink {
    href: string;
    label: string;
    description: string;
}
export interface AnimatedMedia {
    src: string;
    alt: string;
    fallbackSrc: string;
}
export interface GeneratedPortal {
    html: string;
    assets: string[];
}
export declare function generatePortal(options: {
    flavor: "cheeselord";
    projects: ProjectLink[];
    hero: AnimatedMedia;
}): GeneratedPortal;
