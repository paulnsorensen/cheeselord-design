import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generatePortal } from '@cheeselord/design/portal';
import { previewFlavors } from './flavor.mjs';

const previewRoot = fileURLToPath(new URL('..', import.meta.url));
const pkgRoot = dirname(createRequire(import.meta.url).resolve('@cheeselord/design/package.json'));
const site = join(previewRoot, 'dist', 'portal', 'site');

const { version } = JSON.parse(
  await readFile(join(pkgRoot, 'package.json'), 'utf8'),
);
const { html, assets } = generatePortal({
  projects: [
    ...previewFlavors.map((flavor) => ({
      href: `../../${flavor}/`,
      label: flavor,
      description: `Starlight preview — ${flavor} flavor`,
    })),
    { href: 'https://github.com/paulnsorensen/cheeselord-design', label: 'cheeselord-design', description: 'The shared visual package' },
  ],
  version,
});

await mkdir(site, { recursive: true });
await writeFile(join(site, 'index.html'), html);

for (const asset of assets) {
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
