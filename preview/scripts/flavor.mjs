/** @typedef {'easy-cheese' | 'hallouminate'} PreviewFlavor */

/** @type {PreviewFlavor[]} */
export const previewFlavors = ['easy-cheese', 'hallouminate'];

/** @param {NodeJS.ProcessEnv} env */
export function resolvePreviewPaths(env) {
  const flavor = /** @type {PreviewFlavor} */ (env.PREVIEW_FLAVOR ?? previewFlavors[0]);
  if (!previewFlavors.includes(flavor)) {
    throw new Error(`PREVIEW_FLAVOR must be one of ${previewFlavors.join(', ')}, got: ${flavor}`);
  }
  const prefix = env.PREVIEW_BASE_PREFIX ?? '';
  if (prefix !== '' && (!prefix.startsWith('/') || prefix.startsWith('//') || prefix.endsWith('/'))) {
    throw new Error(`PREVIEW_BASE_PREFIX must start with a single "/" and not end with "/", got: ${prefix}`);
  }
  return { flavor, base: `${prefix}/${flavor}`, outDir: `dist/${flavor}` };
}