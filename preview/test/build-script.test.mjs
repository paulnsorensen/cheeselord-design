import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { previewFlavors } from '../scripts/flavor.mjs';

test('the build script builds every preview flavor', async () => {
  const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  for (const flavor of previewFlavors) {
    assert.match(
      pkg.scripts.build,
      new RegExp(`PREVIEW_FLAVOR=${flavor} `),
      `build script must build ${flavor}`,
    );
  }
});