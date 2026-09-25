# TypeScript 7's native `tsc` needs `@types/node` and `tsconfig.json` `types` spelled out

The toolchain move to TypeScript 7.0.2 (commit `6419d64`, alongside the
Astro 7 / Starlight 0.41 bump) added two things that TypeScript 5.9 didn't
require:

- `@types/node` as an explicit `devDependencies` entry in `package.json`.
- `"types": ["node"]` in `tsconfig.json`'s `compilerOptions`.

Under TypeScript 5, `@types/node` types (used for `node:crypto`,
`node:fs/promises`, etc. throughout `scripts/*.mjs` and `src/`) were picked
up without a `types` array — TS 7's native `tsc` does not do this implicitly.
Without both entries, `npm run check` (which starts with `tsc --noEmit`) and
the `build` script's own `tsc` step fail to resolve Node's built-in module
types.

**Why this matters going forward:** neither entry looks load-bearing on
casual inspection. `@types/node` has no import statement anywhere that
references it directly (types packages never do), and `"types": ["node"]`
looks like a redundant default. A future dependency-cleanup pass (e.g. a
"remove unused devDependency" sweep) could drop either one without any
import breaking, and the failure would only surface as a `tsc` error the
next time someone runs `npm run check` or `npm ci` — not as an obviously
related regression. If `tsc --noEmit` starts failing to resolve `node:*`
modules after a dependency bump, check these two entries before assuming
something else broke.

Grounded in: `package.json` (`devDependencies`), `tsconfig.json`
(`compilerOptions.types`), commit `6419d64` ("native tsc needs an explicit
@types/node and a tsconfig types entry").
