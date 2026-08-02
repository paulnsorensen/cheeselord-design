# ADR: Preview deploys via a project GitHub Pages site under cheeselord.dev

Status: accepted (2026-08-01, pages-deploy-preview)

`cheeselord.dev` is the GitHub Pages **user site** (repo `paulnsorensen.github.io`, `cname: cheeselord.dev`). Consequently every project repo that enables Pages publishes automatically at `cheeselord.dev/<repo>` with no DNS or domain configuration — this repo's preview serves at `https://cheeselord.dev/cheeselord-design/`.

Decisions taken:

- Pages enabled on this repo with `build_type: workflow` and `https_enforced: true` (both applied via `gh api`, not files).
- `.github/workflows/deploy-preview.yml` builds `preview/` with `PREVIEW_BASE_PREFIX=/cheeselord-design` and deploys `preview/dist` on pushes to main. Actions are SHA-pinned; `pages: write` + `id-token: write` are scoped to the deploy job; checkout uses `persist-credentials: false`.
- The Astro `base` for each flavor is `<PREVIEW_BASE_PREFIX>/<flavor>`; local builds default to no prefix, so `npm run serve` behavior is unchanged.
- `portal.mjs` reproduces `generatePortal`'s package-root layout with `dist/` as the root: page at `dist/portal/site/`, shared assets at `dist/assets/` (the earlier `dist/portal/`-rooted layout broke the `../../assets/…` font references).
- Constraint discovered in review: the flavor set must have one owner — `previewFlavors` in `preview/scripts/flavor.mjs` drives the env guard and portal links, and a pairing test locks the build script to it.
