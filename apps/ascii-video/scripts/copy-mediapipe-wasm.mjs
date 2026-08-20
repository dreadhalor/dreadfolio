/**
 * MediaPipe ships its vision wasm runtime inside node_modules. Vite only serves
 * files that live under public/, so mirror the runtime there before dev/build.
 *
 * The files are ~18MB, so they are gitignored and re-copied on every run rather
 * than committed. Copy is skipped when the destination is already current.
 */
import { cp, mkdir, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(here, '../../../node_modules/@mediapipe/tasks-vision/wasm');
const dest = resolve(here, '../public/mediapipe/wasm');

const exists = async (p) => !!(await stat(p).catch(() => null));

if (!(await exists(src))) {
  console.error(`[mediapipe] wasm runtime not found at ${src}\n` +
    `[mediapipe] run an install first — @mediapipe/tasks-vision is required.`);
  process.exit(1);
}

const srcStat = await stat(resolve(src, 'vision_wasm_internal.wasm'));
const destStat = await stat(resolve(dest, 'vision_wasm_internal.wasm')).catch(() => null);
if (destStat && destStat.size === srcStat.size) {
  console.log('[mediapipe] wasm runtime already current, skipping copy');
  process.exit(0);
}

await mkdir(dest, { recursive: true });
await cp(src, dest, { recursive: true });
console.log(`[mediapipe] copied vision wasm runtime -> public/mediapipe/wasm`);
