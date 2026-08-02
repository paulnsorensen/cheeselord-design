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

The shell reads the flavor primitives itself — `--cellar` is `var(--cl-ink, …)`, `--panel` is `var(--cl-panel, …)`, `--gold` is `var(--cl-amber, …)` — so the page re-maps nothing, the two imports work in either order, and `cheeselord.css` alone still renders the portal's own cellar green. `styles/flavors/*.css` is the single producer of the `--cl-*` tokens; the Starlight themes import the same file, so a released token change moves docs pages and portal pages together.

Two shell tokens exist so a page never has to restate a shorthand:

- `--glow` is the ceiling wash inside the `body` background's seven layers. It defaults to the field's own hue (`oklch(from var(--cellar) 29% 0.035 h / 55%)`), so a flavored page arrives retinted; override the one token to tune it instead of repeating every layer.
- `--mono` names the identity face once, in `styles/fonts.css`. Every stylesheet here reads it and Starlight's `--sl-font-mono` is set from it, so a face swap is a one-token edit.

## Releases

`npm run build` emits `dist/release-manifest.json`. Its version, source commit, input hashes, and output hashes must agree with the matching GitHub release assets. The package publishes publicly; the release workflow must use npm 2FA or trusted publishing.

Publishing is automated by `.github/workflows/publish.yml` via npm OIDC trusted publishing: cut a GitHub release tagged `v<version>` (matching `package.json`, enforced by the workflow) and the job tests and publishes with provenance — no token or OTP in CI. One-time prerequisite: on npmjs.com, add a trusted publisher to the package (GitHub Actions · `paulnsorensen/cheeselord-design` · workflow `publish.yml`).

Set `SOURCE_COMMIT=<40-hex-sha>` to pin the manifest's `sourceCommit` explicitly (an invalid value throws); without it, the build reads `git rev-parse HEAD` and falls back to a `0`-filled sentinel commit when no `.git` directory is present (GitHub "Download ZIP", vendored source, `COPY . .` Docker builds).

Fonts are shipped as pinned WOFF2 files under `assets/fonts/`. No style requests a runtime Google Fonts asset.

## Installing from git

Installing this package directly from a git URL (rather than the npm registry) requires npm lifecycle scripts (`prepare`) to build `dist/` and `assets/fonts/`. `npm install --ignore-scripts` (or pnpm's script-skipping default) against a git dependency leaves the package empty and `import("@cheeselord/design")` unresolvable. Install from the registry, or allow lifecycle scripts to run, when depending on a git ref.
