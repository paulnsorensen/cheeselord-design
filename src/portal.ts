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
  version?: string;
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

  return {
    html: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark">
  <title>🧀</title>
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
