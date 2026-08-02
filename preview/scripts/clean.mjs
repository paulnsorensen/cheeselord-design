import { rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const previewRoot = fileURLToPath(new URL('..', import.meta.url));

await rm(join(previewRoot, 'dist'), { recursive: true, force: true });