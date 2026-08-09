import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { access, readFile, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const previewRoot = fileURLToPath(new URL('..', import.meta.url));
const site = resolve(previewRoot, 'dist', 'portal', 'site');

// Unlike root test/contracts.test.mjs (CSS-only), this matcher also covers HTML
// href/src attributes and deliberately skips directory links (flavor apps are
// validated by their own builds).
// A reference is a path on disk only when it has no scheme and no authority.
// `startsWith('http')` used to stand in for that, which let `data:` URIs — the
// portal's inline emoji favicon — through to be resolved as filenames.
const hasScheme = /^[a-z][a-z0-9+.-]*:/i;

function relativeRefs(text) {
  const refs = [];
  for (const match of text.matchAll(/(?:href|src)="([^"]+)"|url\("([^"]+)"\)|@import "([^"]+)"/g)) {
    const ref = match[1] ?? match[2] ?? match[3];
    if (hasScheme.test(ref) || ref.startsWith('//') || ref.startsWith('#') || ref.endsWith('/')) continue;
    refs.push(ref);
  }
  return refs;
}

test('only scheme-less references are treated as paths on disk', () => {
  const refs = relativeRefs(`
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22/>" />
    <a href="https://example.test/page">out</a>
    <a href="//example.test/page">protocol-relative</a>
    <a href="#anchor">anchor</a>
    <a href="../easy-cheese/">flavor app</a>
    <link rel="stylesheet" href="cheeselord.css" />
    <img src="wheel.svg" />
  `);
  assert.deepEqual(refs, ['cheeselord.css', 'wheel.svg']);
});

test('every relative portal asset reference resolves to a file on disk', async () => {
  await rm(resolve(previewRoot, 'dist', 'portal'), { recursive: true, force: true });
  await rm(resolve(previewRoot, 'dist', 'assets'), { recursive: true, force: true });
  await promisify(execFile)(process.execPath, ['scripts/portal.mjs'], { cwd: previewRoot });
  for (const file of ['index.html', 'cheeselord.css', 'fonts.css']) {
    const path = resolve(site, file);
    const text = await readFile(path, 'utf8');
    const refs = relativeRefs(text);
    assert.ok(refs.length > 0, `expected relative references in ${file}`);
    for (const ref of refs) {
      const target = resolve(dirname(path), ref);
      try {
        await access(target);
      } catch {
        assert.fail(`${file} references ${ref} but ${target} does not exist`);
      }
    }
  }
});