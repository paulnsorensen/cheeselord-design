# `styles/easy-cheese.css` is the shared Starlight base, not an easy-cheese-only sheet

`styles/hallouminate.css` and `styles/sliced-bread.css` — the Starlight theme
sheets `cheeselordTheme()` (`src/starlight.ts`) points a consuming site at —
are both one-line-plus-a-texture overlays:

```css
/* styles/hallouminate.css */
@import "./easy-cheese.css";
@import "./flavors/hallouminate.css";
main h1 { font-variation-settings: "SOFT" 0, "WONK" 0; }
body { background: repeating-linear-gradient(...); }
```

```css
/* styles/sliced-bread.css */
@import "./easy-cheese.css";
@import "./flavors/sliced-bread.css";
body { background: repeating-linear-gradient(...); }
```

Despite its name, `styles/easy-cheese.css` is not scoped to the easy-cheese
flavor — it is the entire shared Starlight skin: fonts, header, the
`--sl-color-*` mapping, the neutral gray ramp derived from `--cl-ink`/`--cl-bone`,
the ceiling glow, code-chip styling, focus/selection rules, and — the part
that makes "exactly one accent color per flavor" (see `AGENTS.md`) hold for
*every* flavor without each one restating it — the collapse of Starlight's
stock five-hue family onto the single accent:

```css
/* styles/easy-cheese.css, inside :root */
--sl-color-purple: var(--sl-color-accent);
--sl-color-orange: var(--sl-color-accent);
--sl-color-green:  var(--sl-color-accent);
--sl-color-red:    var(--sl-color-accent);
--sl-color-blue:   var(--sl-color-accent);
/* + the matching -low/-high pairs for each */
```

`hallouminate.css` and `sliced-bread.css` never redeclare these mappings.
They only re-`@import` `flavors/<name>.css` (the four `--cl-*` color
primitives — paper/warm-paper/ink/amber/rind) after `easy-cheese.css`'s own
`@import "./flavors/easy-cheese.css"`, plus one flavor-specific texture rule
and (hallouminate only) turning off Fraunces' WONK. Because every
`--sl-color-*` in `easy-cheese.css` is expressed in terms of `--cl-*` tokens
via `light-dark()`/`oklch(from ...)`, and CSS custom properties resolve at
used-value time rather than at parse time, redefining the four `--cl-*`
primitives after the fact retints the whole cascade — the five-hue collapse,
the neutral ramp, the glow — for free. Adding a fourth Starlight flavor means
writing a `flavors/<name>.css` primitives file and a one-line overlay sheet,
not re-deriving the Starlight mapping.

**Consequence for future edits:** a change to the shared Starlight mechanism
(the five-hue collapse, the neutral ramp derivation, code-chip contrast,
focus/selection styling) belongs in `styles/easy-cheese.css` only — editing
`hallouminate.css` or `sliced-bread.css` to "fix" one of those for a single
flavor silently diverges it from the other two, since neither file has its
own copy to edit. Conversely, a flavor-specific visual difference (the sear
lines, the slice hairlines, WONK on/off) belongs in the flavor's own overlay
sheet, not in `easy-cheese.css`.

This is a distinct point from the `flavors/easy-cheese.css` vs.
`easy-cheese.css` naming collision noted in `test/e2e.test.mjs`'s
`resolveImports()` comment (imports resolve against the importing file, so
the two same-named files never clash at runtime) — this page is about what
`easy-cheese.css` *contains*, not about the duplicate filename.

See also [[flavor-set-layers]] for why Starlight themes admit only 3 of the 4
flavors in the first place.

Grounded in: `styles/easy-cheese.css`, `styles/hallouminate.css`,
`styles/sliced-bread.css`, `styles/flavors/hallouminate.css`,
`src/starlight.ts` (`cheeselordTheme`), `test/e2e.test.mjs`
(`resolveImports` comment), commit `6419d64` ("Collapse Starlight's stock
five-hue family... in the shared theme sheet").
