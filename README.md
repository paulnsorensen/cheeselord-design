# Cheeselord Design

`@cheeselord/design` is the shared visual contract for easy-cheese, hallouminate, and cheeselord.dev.

## Starlight

Install the package and register its plugin in the existing Starlight integration:

```js
import { cheeselordTheme } from "@cheeselord/design/starlight";

starlight({
  plugins: [cheeselordTheme({ flavor: "hallouminate" })],
});
```

Use a site-local bridge for documented Starlight component override paths. The bridge imports `@cheeselord/design/components/Header.astro` and forwards `Astro.props`, the default slot, and named slots. `Header.astro` renders the brand as the breadcrumb homelink `cheeselord.dev / <project>` (see the invariants in AGENTS.md) — pass `project`, and `projectHref` if the project segment shouldn't link to `/`. For Starlight sites, bridge `components/Brand.astro` into a `SiteTitle` override instead so the breadcrumb sits inside Starlight's own header chrome (pass `projectHref={import.meta.env.BASE_URL}` when the site has a base path).

## Portal pages (non-Starlight)

A plain Astro or HTML page takes the portal shell from `cheeselord.css` and its colours from a flavor sheet:

```js
import "@cheeselord/design/styles/cheeselord.css";
import "@cheeselord/design/styles/flavors/easy-cheese.css";
```

The shell's own cellar green is a flavor like any other: `cheeselord.css` imports `styles/flavors/cheeselord.css` into a CSS cascade layer, and because unlayered declarations outrank layered ones, a flavor sheet the page adds wins in either import order — the page re-maps nothing, and `cheeselord.css` alone still renders cellar green. `styles/flavors/*.css` is the single producer of the `--cl-*` tokens; the Starlight themes import the same files, so a released token change moves docs pages, portal pages, and social cards together.

Two shell tokens exist so a page never has to restate a shorthand:

- `--glow` is the ceiling wash inside the `body` background's seven layers. It defaults to the field's own hue (`oklch(from var(--cellar) 29% 0.035 h / 55%)`), so a flavored page arrives retinted; override the one token to tune it instead of repeating every layer.
- `--mono` names the identity face once, in `styles/fonts.css`. Every stylesheet here reads it and Starlight's `--sl-font-mono` is set from it, so a face swap is a one-token edit.

## Social cards

`generateSocialCard({ flavor, title, description, dimensions })` returns the card HTML plus an `assets` list of every file it needs, mirroring `generatePortal`. The HTML links the flavor primitives first, then `styles/social-card.css`, whose three compositions map one per flavor: `fresh-wheel` (easy-cheese, the wheel stage right), `signal-through-the-melt` (hallouminate, sear lines, no wonk), and `norse-cheese-lord` (cheeselord, centered on the constellation field). Type is sized in container units, so any requested dimensions keep the proportions. Place the HTML next to the copied assets (the `dist/styles/` layout), screenshot at `width`×`height`, and hand the resulting URL to `generatePortal({ ogImage })` for the matching `og:image` tag.

## Guarantees

`npm run check` enforces the style contracts mechanically: no runtime Google Fonts, visible `:focus-visible`, reduced-motion behavior in every sheet, `core.version` equal to the package version, and — for every flavor, in both modes — the text and accent token pairs holding `core.minimumContrast` (4.5:1). Set `CONTRAST_VERBOSE=1` to print the computed ratios.

## Releases

`npm run build` emits `dist/release-manifest.json`. Its version, source commit, input hashes, and output hashes must agree with the matching GitHub release assets. The package publishes publicly; the release workflow must use npm 2FA or trusted publishing.

Publishing is automated by `.github/workflows/publish.yml` via npm OIDC trusted publishing: cut a GitHub release tagged `v<version>` (matching `package.json`, enforced by the workflow) and the job tests and publishes with provenance — no token or OTP in CI. One-time prerequisite: on npmjs.com, add a trusted publisher to the package (GitHub Actions · `paulnsorensen/cheeselord-design` · workflow `publish.yml`).

Set `SOURCE_COMMIT=<40-hex-sha>` to pin the manifest's `sourceCommit` explicitly (an invalid value throws); without it, the build reads `git rev-parse HEAD` and falls back to a `0`-filled sentinel commit when no `.git` directory is present (GitHub "Download ZIP", vendored source, `COPY . .` Docker builds).

Fonts are shipped as pinned WOFF2 files under `assets/fonts/`. No style requests a runtime Google Fonts asset.

## Installing from git

Installing this package directly from a git URL (rather than the npm registry) requires npm lifecycle scripts (`prepare`) to build `dist/` and `assets/fonts/`. `npm install --ignore-scripts` (or pnpm's script-skipping default) against a git dependency leaves the package empty and `import("@cheeselord/design")` unresolvable. Install from the registry, or allow lifecycle scripts to run, when depending on a git ref.
