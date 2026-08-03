export interface ProjectLink {
  href: string;
  label: string;
  description: string;
}

export interface GeneratedPortal {
  html: string;
  /**
   * Every file transitively required to render the portal, as paths relative to the
   * installed package root (e.g. `node_modules/@cheeselord/design/`) — matching the
   * `dist`/`assets` layout published in `package.json`'s `files`.
   */
  assets: string[];
}

const fontAssets = ["assets/fonts/fraunces-latin-variable.woff2", "assets/fonts/ibm-plex-mono-latin.woff2"];
const stylesheetAssets = [
  "dist/styles/fonts.css",
  "dist/styles/header.css",
  "dist/styles/flavors/easy-cheese.css",
  "dist/styles/flavors/cheeselord.css",
  "dist/styles/cheeselord.css",
];

/* the 🧀 tab identity (AGENTS.md brand invariant #2), self-contained so no icon asset ships */
const favicon = "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 16%22><text x=%228%22 y=%2213%22 font-size=%2213%22 text-anchor=%22middle%22>%F0%9F%A7%80</text></svg>";

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
  version?: string;
  /** Meta/OpenGraph description; defaults to the cellar line. */
  description?: string;
  /** Absolute URL of a social-card image; emitted as og:image when given. */
  ogImage?: string;
}): GeneratedPortal {
  const rows = options.projects
    .map(
      ({ href, label, description }) =>
        `<a href="${sanitizeHref(href)}"><strong>${escapeHtml(label)}</strong> <span>${escapeHtml(description)}</span> <i aria-hidden="true">→</i></a>`,
    )
    .join("\n");
  const count = options.projects.length;
  const eyebrow = options.version
    ? `The cellar is open · v${escapeHtml(options.version)}`
    : "The cellar is open";
  const description = escapeHtml(options.description ?? "The cellar is open — milk in, wheels out. Projects of the Cheese Lord.");
  const ogImage = options.ogImage
    ? `\n  <meta property="og:image" content="${escapeHtml(options.ogImage)}">\n  <meta name="twitter:card" content="summary_large_image">`
    : "";

  return {
    html: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark">
  <title>🧀</title>
  <meta name="description" content="${description}">
  <link rel="icon" href="${favicon}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="cheeselord.dev">
  <meta property="og:description" content="${description}">${ogImage}
  <link rel="preload" as="font" type="font/woff2" href="../../assets/fonts/fraunces-latin-variable.woff2" crossorigin>
  <link rel="preload" as="font" type="font/woff2" href="../../assets/fonts/ibm-plex-mono-latin.woff2" crossorigin>
  <link rel="stylesheet" href="./cheeselord.css">
</head>
<body>
<header>
  <div class="wrap"><a class="brand" href="/">cheeselord<b>.dev</b></a></div>
</header>
<main>
  <div class="wrap">
    <div>
      <p class="eyebrow">${eyebrow}</p>
      <h1>The <em>cheese</em> must flow.</h1>
      <nav class="cellar" aria-label="Projects">
        <div class="cellar-head">~/cellar · ${count} ${count === 1 ? "wheel" : "wheels"}</div>
        ${rows}
      </nav>
    </div>
    <div class="wheel-box"><div class="wheel" role="img" aria-label="A wheel of cheese rendered as a grid of golden dots, with three eyes"></div></div>
  </div>
</main>
<footer>
  <div class="wrap"><span>milk in, wheels out 🧀</span></div>
</footer>
</body>
</html>`,
    assets: [...stylesheetAssets, ...fontAssets],
  };
}
