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
function relativeRefs(text) {
  const refs = [];
  for (const match of text.matchAll(/(?:href|src)="([^"]+)"|url\("([^"]+)"\)|@import "([^"]+)"/g)) {
    const ref = match[1] ?? match[2] ?? match[3];
    if (ref.startsWith('http') || ref.startsWith('#') || ref.endsWith('/')) continue;
    refs.push(ref);
  }
  return refs;
}

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