# Preview is a second npm package, not a folder of the main build

`preview/` is its own `package.json` (`@cheeselord/design-preview`, private) that depends on
the root package via `"@cheeselord/design": "file:.."` rather than being folded into the root
build. Two consequences follow from that split:

- **Two install steps, in order.** `npm ci` at the repo root builds `dist/` (via the
  `prepare` lifecycle script), then `preview/` needs its own `npm ci`/`npm install` to pick up
  that built package through the `file:..` link. `ci.yml` and `deploy-preview.yml` both run
  root install/build first, then `preview/` install, in that order — reversing the order
  would let preview link against a stale or absent `dist/`.
- **Preview has its own CI gate on pull requests, not just on deploy.** `ci.yml` runs
  `npm test` inside `preview/` on every PR, with the comment explaining why: the preview is
  the only consumer that exercises the published portal and the Starlight integration end to
  end, and relying solely on `deploy-preview.yml` (which only runs on pushes to `main`) let a
  broken portal reference reach `main` before anything caught it.

**Build-time flavor split.** `preview/package.json`'s `build` script runs `astro build` twice
— once per `PREVIEW_FLAVOR` — before running `scripts/portal.mjs` to assemble the combined
`dist/`. `scripts/flavor.mjs` is the single owner of which flavors the preview builds
(`previewFlavors = ['easy-cheese', 'hallouminate']`); `resolvePreviewPaths()` there validates
`PREVIEW_FLAVOR` against that list and derives the Astro `base` from
`PREVIEW_BASE_PREFIX`/flavor. `scripts/portal.mjs` imports the same `previewFlavors` list to
generate the portal's links, and `preview/test/build-script.test.mjs` pairs against it — so
adding a third flavor to the preview is a one-array edit that both the build and the portal
links pick up, enforced by that pairing test rather than by convention. `cheeselord` itself
(the portal flavor) is not in `previewFlavors` because the portal page is generated directly
by `portal.mjs`, not built as a separate Astro flavor site.

The `PREVIEW_BASE_PREFIX=/cheeselord-design` env var (set only in `deploy-preview.yml`) is
what makes the built pages resolve correctly at `cheeselord.dev/cheeselord-design/` per the
Pages preview ADR (`docs/adr/pages-deploy-preview-001.md`) rather than at a site root; local
`npm run serve` omits it and builds unprefixed.

Grounded in: `preview/package.json`, `.github/workflows/ci.yml`,
`.github/workflows/deploy-preview.yml`, `preview/scripts/flavor.mjs`,
`preview/scripts/portal.mjs`, `preview/test/build-script.test.mjs`,
`docs/adr/pages-deploy-preview-001.md`.
