# Agent guidance for @cheeselord/design

## Design direction: dev-tool aesthetic, cheese in the copy

The visual language for every cheeselord surface follows the modern developer-tool school (reference set: getfresh.dev, zed.dev, superplane.com, agent-memory.dev, tuicr.dev, graphify.com):

- Dark-first, near-black fields; light mode is the same world with the stage flipped to near-white.
- Type-led heroes. Fraunces appears exactly once per page (the h1, full WONK on cheeselord/easy-cheese), with at most one word tinted in the accent. Everything else is quiet.
- IBM Plex Mono is the identity type: nav, eyebrows, labels, listings, footers.
- **Exactly one accent color per flavor** (easy-cheese/portal: gold; hallouminate: ember). No accent families.
- One engineered hero artifact per page at most (the dot-matrix wheel). Texture stays systematic and faint (constellation dots, sear lines) — never literal or organic.
- The cheese lives in copy, naming, and the wheel — **not** in surface materials. Wax seals, ash lines, rind stamps, and paste/marble staging were tried and rejected; do not reintroduce metaphor-as-decoration.

## Brand invariants (Paul, 2026-08-01): "if you visit a cheeselord site, you should know it"

The homepage (cheeselord.dev, repo paulnsorensen.github.io) is the source of truth for these. Per-site variation is limited to **colors, names, and assets** — nothing else.

1. **One font pair everywhere.** IBM Plex Mono as identity type + Fraunces for the single serif moment per page, on every site. No per-site font choices.
2. **🧀 in the tab, plus at most one in-page accent use per site.** Every site keeps the 🧀 title/favicon identity; the page body may use 🧀 exactly once, tastefully (e.g. in the footer wit). Never as repeated decoration.
3. **Header brand is a homelink.** Every site's mono header reads breadcrumb-style — `cheeselord.dev / <project>` — with the `cheeselord.dev` part linking back to the portal. Always top-left.
4. **Package-driven components.** Header, footer, hero shell, and listing come from `@cheeselord/design` and are byte-identical across sites. Invariants are enforced mechanically, not by convention.

## Hard requirement: light and dark are the same material world

Every flavor is a stage (the field), a material (its identity), and an edge (its single accent). **Dark mode flips only the stage — never the material or the edge.** The two modes must read as the same world in different light, not as two unrelated themes. A mode that falls back to a generic light or dark palette is a defect, even if every contrast check passes.

For any change to `styles/`:

- Derive paired values from the flavor's own primitives (relative color syntax / `light-dark()`), so coherence holds by construction.
- Verify both modes in a real browser before claiming done — screenshot light and dark side by side. Text and accents must hold the core 4.5:1 contrast floor in both.
- `cheeselord` (the portal) is dark-only by design and exempt from pairing, not from the material logic.
