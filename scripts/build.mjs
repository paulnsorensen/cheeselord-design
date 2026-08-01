import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const dist = join(root, "dist");
const assets = join(root, "assets", "fonts");
const inputs = ["src", "styles", "components", "schemas", "assets"];

async function files(path) {
  const entries = await readdir(path, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    const entryPath = join(path, entry.name);
    if (entry.isDirectory()) result.push(...(await files(entryPath)));
    else result.push(entryPath);
  }
  return result;
}

const hash = (content) => `sha256:${createHash("sha256").update(content).digest("hex")}`;

await rm(dist, { recursive: true, force: true });
await mkdir(join(dist, "styles"), { recursive: true });
await mkdir(assets, { recursive: true });
await cp(join(root, "styles"), join(dist, "styles"), { recursive: true });
await cp(join(root, "node_modules", "@fontsource", "fraunces", "files", "fraunces-latin-500-normal.woff2"), join(assets, "fraunces-latin-500.woff2"));
await cp(join(root, "node_modules", "@fontsource", "fraunces", "files", "fraunces-latin-700-normal.woff2"), join(assets, "fraunces-latin-700.woff2"));
await cp(join(root, "node_modules", "@fontsource", "ibm-plex-mono", "files", "ibm-plex-mono-latin-400-normal.woff2"), join(assets, "ibm-plex-mono-latin.woff2"));
await cp(join(root, "node_modules", "@fontsource", "fraunces", "LICENSE"), join(assets, "LICENSE-Fraunces"));
await cp(join(root, "node_modules", "@fontsource", "ibm-plex-mono", "LICENSE"), join(assets, "LICENSE-IBM-Plex-Mono"));

const inputHashes = {};
for (const directory of inputs) {
  for (const file of await files(join(root, directory))) {
    inputHashes[relative(root, file)] = hash(await readFile(file));
  }
}

const outputHashes = {};
for (const file of await files(dist)) {
  outputHashes[relative(root, file)] = hash(await readFile(file));
}

const sourceCommit = process.env.SOURCE_COMMIT ?? execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
const { version } = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
const manifest = { version, sourceCommit, inputHashes, outputHashes };
await writeFile(join(dist, "release-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
