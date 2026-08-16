# Contrast checker only understands specific oklch() shapes

`scripts/check.mjs` enforces `core.minimumContrast` (4.5:1) mechanically by resolving every
color token to an OKLCH triple and computing relative luminance itself — it does not
delegate to a browser or a color library. `resolveColor()` (scripts/check.mjs) recognizes
exactly four value shapes: a `var(--token[, fallback])` chain, `light-dark(light, dark)`
pairs, a literal `oklch(l c h)`, and `oklch(from var(--token) <expr> <expr> <expr>)` with
each channel either a bare `l`/`c`/`h` passthrough or a single-operation `calc(l|c|h * / + -
N)`. Anything else — nested `calc()`, a second operation, `color-mix()`, hex/`rgb()`, or a
translucent color with an alpha channel — throws `unsupported color value` / `unsupported
oklch channel expression`, or (for a 4-channel value with alpha) an explicit "refusing to
contrast-check a translucent color" error.

**Why this matters:** a stylesheet change that introduces a new way of deriving a color from
a `--cl-*` primitive (a more complex `calc()`, a different relative-color function) will fail
`npm run check` with a checker error, not a contrast failure — the fix is to extend
`resolveColor()`/`evalChannel()` in `scripts/check.mjs` to understand the new shape, not to
work around it in the stylesheet. This is a deliberate accept-list, not a bug: it exists so
the contrast floor is provably enforced only for syntax the checker actually evaluates,
rather than silently skipping colors it can't parse.

The same script also enforces the no-colored-literal rule (chroma > 0.025 outside
`styles/flavors/`) and the "every rendering stylesheet respects
`prefers-reduced-motion` / defines `:focus-visible`" rules referenced in `README.md`'s
Guarantees section — this page covers only the contrast-resolution mechanism, which is the
part with a real extension gotcha.

Grounded in: `scripts/check.mjs` (`resolveColor`, `evalChannel`, `splitTopLevel`,
`assertContrast`).
