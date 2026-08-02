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
  /**
   * Every file transitively required to render the portal, as paths relative to the
   * installed package root (e.g. `node_modules/@cheeselord/design/`) — matching the
   * `dist`/`assets` layout published in `package.json`'s `files`. `hero.src` and
   * `hero.fallbackSrc` are returned exactly as provided by the caller, since the
   * portal does not control their base.
   */
  assets: string[];
}

const fontAssets = ["assets/fonts/fraunces-latin-variable.woff2", "assets/fonts/ibm-plex-mono-latin.woff2"];
const stylesheetAssets = ["dist/styles/fonts.css", "dist/styles/cheeselord.css"];

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeHref(href: string): string {
  if (/^https?:\/\//i.test(href) || href.startsWith("/") || href.startsWith("./") || href.startsWith("../")) {
    return escapeHtml(href);
  }
  return "#";
}

export function generatePortal(options: {
  projects: ProjectLink[];
  hero: AnimatedMedia;
}): GeneratedPortal {
  const projects = options.projects
    .map(
      ({ href, label, description }) =>
        `<li><a href="${sanitizeHref(href)}"><strong>${escapeHtml(label)}</strong><span>${escapeHtml(description)}</span></a></li>`,
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
  <link rel="preload" as="font" type="font/woff2" href="../../assets/fonts/fraunces-latin-variable.woff2" crossorigin>
  <link rel="stylesheet" href="./cheeselord.css">
</head>
<body>
  <main>
    <p class="eyebrow">The cellar is open</p>
    <h1>Cheese Lord</h1>
    <p class="lede">Tools and knowledge for working software, aged with intent.</p>
    <picture>
      <source srcset="${escapeHtml(options.hero.src)}" type="image/webp">
      <img src="${escapeHtml(options.hero.fallbackSrc)}" alt="${escapeHtml(options.hero.alt)}" width="960" height="540">
    </picture>
    <nav aria-label="Projects"><ul>${projects}</ul></nav>
  </main>
</body>
</html>`,
    assets: [options.hero.src, options.hero.fallbackSrc, ...stylesheetAssets, ...fontAssets],
  };
}