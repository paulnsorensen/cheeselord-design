# Agent guidance for @cheeselord/design

## Hard requirement: light and dark are the same material world

Every flavor is defined by three parts: a **stage** (the page field), a **material** (its cheese identity: golden paste, brine-and-char, cellar stone), and an **edge** (its accent family: wax, sear, gold/vein).

When a flavor has both light and dark modes, **dark mode flips only the stage — never the material or the edge.** The two modes must read as the same cheese in a different room (marble board by day, basalt board by night), not as two unrelated themes. A mode that falls back to a generic light or dark palette is a defect, even if every contrast check passes.

Concretely, for any change to `styles/`:

- Surface tokens may change lightness and temperature across modes; the material's hue family and the accent's identity must stay recognizable in both.
- Derive dark values from the flavor's own primitives (relative color syntax / `light-dark()`), so the pairing holds by construction rather than by hand-tuning.
- Verify both modes in a browser before claiming done — screenshot light and dark side by side and check they tell one story. Text and accent colors must hold the core 4.5:1 contrast floor in both.

`cheeselord` (the portal) is dark-only by design and exempt from pairing, not from the material logic.
