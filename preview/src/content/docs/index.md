---
title: Cheeselord Design
description: Dogfood preview of the shared visual system.
---

Body text with **bold**, *italic*, `inline code`, and [a link](tokens/).

## One serif moment

The page title renders in Fraunces; body and headings stay quiet, and wayfinding chrome is IBM Plex Mono.

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

| Export | Purpose |
| --- | --- |
| `/starlight` | Theme plugin |
| `/portal` | cheeselord.dev portal generator |
| `/social-card` | Social card generator |
