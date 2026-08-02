import { cp, mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generatePortal } from '@cheeselord/design/portal';
import { previewFlavors } from './flavor.mjs';

const previewRoot = fileURLToPath(new URL('..', import.meta.url));
const pkgRoot = dirname(createRequire(import.meta.url).resolve('@cheeselord/design/package.json'));
const site = join(previewRoot, 'dist', 'portal', 'site');

const hero = { src: './hero.svg', fallbackSrc: './hero.svg', alt: 'Cheese wheel aging in a cellar' };
const { html, assets } = generatePortal({
  projects: [
    ...previewFlavors.map((flavor) => ({
      href: `../../${flavor}/`,
      label: flavor,
      description: `Starlight preview — ${flavor} flavor`,
    })),
    { href: 'https://github.com/paulnsorensen/cheeselord-design', label: 'cheeselord-design', description: 'The shared visual package' },
  ],
  hero,
});

await mkdir(site, { recursive: true });
await writeFile(join(site, 'index.html'), html);
await writeFile(
  join(site, 'hero.svg'),
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540"><rect width="960" height="540" fill="#212b26"/><circle cx="480" cy="270" r="150" fill="#c9962e"/><circle cx="430" cy="230" r="18" fill="#0d1612"/><circle cx="540" cy="300" r="24" fill="#0d1612"/><circle cx="470" cy="330" r="12" fill="#0d1612"/></svg>\n',
);

for (const asset of assets) {
  if (asset === hero.src) continue;
  const dest = asset.startsWith('dist/styles/')
    ? join(site, asset.slice('dist/styles/'.length))
    : join(previewRoot, 'dist', asset);
  await mkdir(dirname(dest), { recursive: true });
  await cp(join(pkgRoot, asset), dest);
}

await writeFile(
  join(previewRoot, 'dist', 'index.html'),
  '<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=./portal/site/"><title>Cheeselord Design preview</title><a href="./portal/site/">Portal</a>\n',
);
console.log('portal written to dist/portal/site/');
