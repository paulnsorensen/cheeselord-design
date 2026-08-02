---
title: Cheeselord Design
description: Dogfood preview of the shared visual system.
---

Body text with **bold**, *italic*, `inline code`, and [a link](tokens/).

## Headings render in Fraunces

Paragraphs, captions, and UI chrome inherit the flavor surfaces; code renders in IBM Plex Mono.

### Lists

- Curds are messages from the cave
- Locked core tokens: `focus`, `motion`, `spacing`, `state`

1. Install `@cheeselord/design`
2. Register `cheeselordTheme({ flavor })`
3. Ship

### Code

```js
import { cheeselordTheme } from '@cheeselord/design/starlight';

starlight({
  plugins: [cheeselordTheme({ flavor: 'easy-cheese' })],
});
```

### Asides

:::note
Minimum contrast is 4.5:1 — `validateFlavor` enforces it.
:::

:::caution
Accent overrides outside `accent`, `accentMuted`, `accentStrong` are rejected.
:::

> Blockquote: 'Tis but a scratch on the rind.

---

<p class="cl-stamp">Aged with intent — batch 0.1.0</p>

The rule above is the ash line; the lettering above is a rind stamp.

| Export | Purpose |
| --- | --- |
| `/starlight` | Theme plugin |
| `/portal` | cheeselord.dev portal generator |
| `/social-card` | Social card generator |
