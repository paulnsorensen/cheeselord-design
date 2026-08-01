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

Use a site-local bridge for documented Starlight component override paths. The bridge imports `@cheeselord/design/components/Header.astro` and forwards `Astro.props`, the default slot, and named slots.

## Releases

`npm run build` emits `dist/release-manifest.json`. Its version, source commit, input hashes, and output hashes must agree with the matching GitHub release assets. The package publishes publicly; the release workflow must use npm 2FA or trusted publishing.

Fonts are shipped as pinned WOFF2 files under `assets/fonts/`. No style requests a runtime Google Fonts asset.
