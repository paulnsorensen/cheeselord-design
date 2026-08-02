// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { cheeselordTheme } from '@cheeselord/design/starlight';
import { resolvePreviewPaths } from './scripts/flavor.mjs';

const { flavor, base, outDir } = resolvePreviewPaths(process.env);

export default defineConfig({
  outDir,
  base,
  integrations: [
    starlight({
      title: `Cheeselord Design — ${flavor}`,
      description: 'Dogfood preview of the shared visual system.',
      plugins: [cheeselordTheme({ flavor })],
    }),
  ],
});