# The shared favicon `rel` must equal the Starlight default

`cheeselordTheme()` in `src/starlight.ts` adds the 🧀 favicon to the Starlight `head` array. Its `rel` value is `shortcut icon`. Do not change it. A different value lets the Starlight default favicon win in the browser tab.

## Why the value matters

Starlight adds its own default favicon `<link>` with `rel="shortcut icon"`. Starlight sorts that link below every other link in `head`. A browser uses the last icon link that it finds.

A link with `rel="icon"` sorts above the Starlight default. The default link then comes last and wins. The cheese icon does not show.

A link with the same `rel` ties with the default in the sort. The sort is stable, so the tied links keep their insertion order. The `config:setup` hook runs before Starlight adds its default. The cheese link therefore stays last, and the browser uses it.

The Starlight `favicon` option accepts file paths only. The data URI in `cheeseFavicon` (`src/favicon.ts`) is not a file path, so the icon goes in `head`.

## Rules for future edits

- Keep `rel: "shortcut icon"` in `src/starlight.ts`. Do not "clean it up" to `icon`.
- Check the order in a real browser when Starlight changes how it sorts or appends its default favicon.
- Do not trust the test alone. `test/starlight.test.mjs` checks the `rel` value and the array position. It does not check the final `head` order after the Starlight hooks run.

## Related surfaces

The portal in `src/portal.ts` uses a plain `<link rel="icon">`. The portal is not a Starlight site, so no sort competes with it. Both surfaces share the `cheeseFavicon` constant. For the Starlight theme set, see [[architecture/flavor-set-layers]].
