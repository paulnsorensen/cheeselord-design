# cheeselord-design

`@cheeselord/design` is the shared visual contract (styles, components, portal/social-card
generators, Starlight plugin) for easy-cheese, hallouminate, and cheeselord.dev. This wiki
records the *why* behind non-obvious decisions and gotchas; see the repo's `README.md` and
`AGENTS.md` for what the package does and how to use/operate it — do not duplicate that
material here.

## Conventions

- One topic per file, kebab-case, under the subdirectory the topic belongs to
  (`architecture/` for how subsystems are wired and why, `gotchas/` for traps a future
  contributor would otherwise rediscover the hard way).
- Lead with the conclusion; capture rationale, constraints, and alternatives — not a
  restatement of README/AGENTS.md/ADR text. Link out to those with a normal path reference
  rather than copying them.
- Link related pages with `[[wikilinks]]` valid from the page that uses them.
- `docs/adr/` in the repo root holds this project's formal ADRs (e.g. the Pages preview
  deploy decision); the wiki complements those with narrower, code-grounded notes rather
  than replacing them.

## Sections

- Architecture
  - [[architecture/preview-app-split]] — why the preview site is a second npm package wired
    to the root via `file:..`, and what that buys in CI.
  - [[architecture/flavor-set-layers]] — the flavor set is not one list; each surface
    (Starlight themes, social cards, preview builds, the published schema) admits a
    deliberate subset, and the exported schema is unenforced and has drifted.
  - [[architecture/starlight-theme-sheets-share-a-base]] — `styles/easy-cheese.css` is the
    shared Starlight skin for all three themed flavors, not an easy-cheese-only sheet;
    `hallouminate.css`/`sliced-bread.css` are thin overlays on top of it.
- Gotchas
  - [[gotchas/contrast-checker-oklch-syntax]] — `scripts/check.mjs`'s contrast enforcement
    only understands specific `oklch()` shapes; new color syntax must be taught to it before
    it can ship.
  - [[gotchas/typescript7-explicit-types-node]] — the TypeScript 7 toolchain needs
    `@types/node` and `tsconfig.json`'s `types` array spelled out explicitly; neither looks
    load-bearing until it's missing.
