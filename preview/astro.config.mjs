// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { cheeselordTheme } from '@cheeselord/design/starlight';

const flavor = process.env.PREVIEW_FLAVOR ?? 'easy-cheese';
if (flavor !== 'easy-cheese' && flavor !== 'hallouminate') {
  throw new Error(`PREVIEW_FLAVOR must be easy-cheese or hallouminate, got: ${flavor}`);
}

export default defineConfig({
  outDir: `dist/${flavor}`,
  base: `/${flavor}`,
  integrations: [
    starlight({
      title: `Cheeselord Design — ${flavor}`,
      description: 'Dogfood preview of the shared visual system.',
      plugins: [cheeselordTheme({ flavor })],
    }),
  ],
});
