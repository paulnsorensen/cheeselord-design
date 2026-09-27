# The shared favicon's `rel` must equal Starlight's default, or Starlight's own icon wins

`cheeselordTheme()` (`src/starlight.ts`) pushes the 🧀 favicon onto Starlight's `head`
array using `rel="shortcut icon"`. That exact value is load-bearing — it is not an
arbitrary or legacy choice.

## Why this matters

Starlight ships its own default favicon `<link>` and appends it to `head` internally.
The two links only differ if a consuming site sets no favicon of its own, in which case
both the shared cheeselord icon and Starlight's default coexist in the rendered
`<head>`. Browsers use the **last** matching icon link when more than one is present.
Starlight sorts its own default favicon link so it lands after third-party `head`
entries — so a naive `rel="icon"` push from this package would render, then get
overridden by Starlight's default appearing later in the document.

Using the **same** `rel` value as Starlight's default (`shortcut icon`) means the two
entries tie in Starlight's sort, and a stable sort preserves relative insertion order
among ties — so this package's entry (pushed in `config:setup`, which runs before
Starlight appends its own default) still lands last in the final `head`, and browsers
pick it.

**Consequence for future edits:** do not change the icon `<link>`'s `rel` to a more
conventional value like `"icon"` to "clean this up" — that breaks the ordering trick and
lets Starlight's own favicon win silently. If Starlight's sort or default-append
behavior changes upstream, this needs re-verification in a real browser, not just a
passing test — `test/starlight.test.mjs` checks the `rel` value and array position it
expects today, not the rendered `<head>` order after Starlight's own hook runs.

The favicon data URI itself lives in `src/favicon.ts` as `cheeseFavicon`, shared between
the portal (`src/portal.ts`, plain `<link rel="icon">` — no Starlight sort to fight) and
the Starlight plugin.

Grounded in: `src/starlight.ts` (`cheeselordTheme`, the `icon` head tag and its comment),
`src/favicon.ts`, `src/portal.ts`, `test/starlight.test.mjs`, commit `07ea64c` ("add the
shared 🧀 favicon to every docs site").
