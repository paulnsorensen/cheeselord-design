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

export function generatePortal(options: {
  flavor: "cheeselord";
  projects: ProjectLink[];
  hero: AnimatedMedia;
}): GeneratedPortal {
  const projects = options.projects
    .map(
      ({ href, label, description }) => `<li><a href="${href}"><strong>${label}</strong><span>${description}</span></a></li>`,
    )
    .join("\n");

  return {
    html: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark">
  <title>Cheese Lord</title>
  <link rel="stylesheet" href="./cheeselord.css">
</head>
<body>
  <main>
    <p class="eyebrow">The cellar is open</p>
    <h1>Cheese Lord</h1>
    <p class="lede">Tools and knowledge for working software, aged with intent.</p>
    <picture>
      <source srcset="${options.hero.src}" type="image/webp">
      <img src="${options.hero.fallbackSrc}" alt="${options.hero.alt}" width="960" height="540">
    </picture>
    <nav aria-label="Projects"><ul>${projects}</ul></nav>
  </main>
</body>
</html>`,
    assets: [options.hero.src, options.hero.fallbackSrc, "cheeselord.css"],
  };
}
