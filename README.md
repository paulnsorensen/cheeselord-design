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

Use a site-local bridge for documented Starlight component override paths. The bridge imports `@cheeselord/design/components/Header.astro` and forwards `Astro.props`, the default slot, and named slots. `Header.astro` renders the brand as the breadcrumb homelink `cheeselord.dev / <project>` (see the invariants in AGENTS.md) — pass `project`, and `projectHref` if the project segment shouldn't link to `/`.

## Releases

`npm run build` emits `dist/release-manifest.json`. Its version, source commit, input hashes, and output hashes must agree with the matching GitHub release assets. The package publishes publicly; the release workflow must use npm 2FA or trusted publishing.

Set `SOURCE_COMMIT=<40-hex-sha>` to pin the manifest's `sourceCommit` explicitly (an invalid value throws); without it, the build reads `git rev-parse HEAD` and falls back to a `0`-filled sentinel commit when no `.git` directory is present (GitHub "Download ZIP", vendored source, `COPY . .` Docker builds).

Fonts are shipped as pinned WOFF2 files under `assets/fonts/`. No style requests a runtime Google Fonts asset.

## Installing from git

Installing this package directly from a git URL (rather than the npm registry) requires npm lifecycle scripts (`prepare`) to build `dist/` and `assets/fonts/`. `npm install --ignore-scripts` (or pnpm's script-skipping default) against a git dependency leaves the package empty and `import("@cheeselord/design")` unresolvable. Install from the registry, or allow lifecycle scripts to run, when depending on a git ref.
