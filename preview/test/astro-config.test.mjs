import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolvePreviewPaths } from '../scripts/flavor.mjs';

test('defaults serve easy-cheese at the site root', () => {
  assert.deepEqual(resolvePreviewPaths({}), {
    flavor: 'easy-cheese',
    base: '/easy-cheese',
    outDir: 'dist/easy-cheese',
  });
});

test('PREVIEW_BASE_PREFIX prefixes base but not outDir', () => {
  const paths = resolvePreviewPaths({
    PREVIEW_FLAVOR: 'hallouminate',
    PREVIEW_BASE_PREFIX: '/cheeselord-design',
  });
  assert.deepEqual(paths, {
    flavor: 'hallouminate',
    base: '/cheeselord-design/hallouminate',
    outDir: 'dist/hallouminate',
  });
});

test('unknown flavor throws', () => {
  assert.throws(() => resolvePreviewPaths({ PREVIEW_FLAVOR: 'brie' }), /PREVIEW_FLAVOR/);
});

test('empty PREVIEW_BASE_PREFIX behaves as unset', () => {
  assert.deepEqual(resolvePreviewPaths({ PREVIEW_BASE_PREFIX: '' }), {
    flavor: 'easy-cheese',
    base: '/easy-cheese',
    outDir: 'dist/easy-cheese',
  });
});

test('malformed PREVIEW_BASE_PREFIX throws', () => {
  for (const prefix of ['/cheeselord-design/', 'cheeselord-design', '/', '//cheeselord-design']) {
    assert.throws(
      () => resolvePreviewPaths({ PREVIEW_BASE_PREFIX: prefix }),
      /PREVIEW_BASE_PREFIX/,
      `prefix: ${prefix}`,
    );
  }
});