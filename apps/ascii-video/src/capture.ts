/**
 * Records this app's output as data and posts it to the mini, so the portfolio can replay the
 * look without any of the pipeline behind it.
 *
 * Nothing here re-derives the image. The renderer has already produced the only two things a
 * replay needs — the glyphs as real DOM text, and colour as a cols x rows canvas blended over
 * them — so this reads those back out. That is why the portfolio does not need mediapipe, the
 * segmenter, or the rain: it needs the frames, not the machinery that made them.
 *
 * Gated behind ?capture=<key>. Absent, none of this is reachable and the panel looks as it
 * always did.
 */

const ENDPOINT = 'https://record.dreadville.net/_ascii';
const FPS = 20;
const SECONDS = 2.5;

/** The upload key doubles as the switch: no key, no capture control. */
export const CAPTURE_KEY = new URLSearchParams(location.search).get('capture');

/** Drop alpha — these layers are opaque, and carrying it is a third more data for nothing. */
function rgb(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const d = ctx.getImageData(0, 0, w, h).data;
  const out = new Uint8Array(w * h * 3);
  for (let i = 0, j = 0; i < d.length; i += 4) {
    out[j++] = d[i]!;
    out[j++] = d[i + 1]!;
    out[j++] = d[i + 2]!;
  }
  return out;
}

function b64(u8: Uint8Array) {
  let s = '';
  for (let i = 0; i < u8.length; i += 0x8000)
    s += String.fromCharCode(...u8.subarray(i, i + 0x8000));
  return btoa(s);
}

export async function captureAscii(say: (message: string) => void) {
  if (!CAPTURE_KEY) return;

  const text = document.querySelector<HTMLElement>('.ascii-text');
  const color = document.querySelector<HTMLCanvasElement>('.ascii-color');
  const bars = document.querySelector<HTMLCanvasElement>('.ascii-bars');
  if (!text || !color || !bars) return say('no ascii layers');
  // The colour layers are only mounted in the blended modes; capturing without them would
  // silently record a grey frame, so refuse rather than produce something misleading.
  if (color.style.display === 'none') return say('needs a colour mode');

  const cctx = color.getContext('2d');
  const bctx = bars.getContext('2d');
  if (!cctx || !bctx) return say('no 2d context');

  const cols = color.width;
  const rows = color.height;
  const total = Math.round(FPS * SECONDS);
  const frames: { rows: string[]; color: string; bars: string }[] = [];

  await new Promise<void>((resolve) => {
    const timer = window.setInterval(() => {
      frames.push({
        rows: [...text.children].map((r) => r.textContent ?? ''),
        color: b64(rgb(cctx, cols, rows)),
        bars: b64(rgb(bctx, cols, rows)),
      });
      say(`recording ${frames.length}/${total}`);
      if (frames.length >= total) {
        window.clearInterval(timer);
        resolve();
      }
    }, 1000 / FPS);
  });

  /*
   * The backdrop only changes with the palette, not the picture, so in practice every frame
   * carries a byte-identical copy of it. On the first real capture that was 44% of the file
   * for one layer. Hoist it when it is genuinely shared; leave it per frame when it is not.
   */
  const sharedBars =
    new Set(frames.map((f) => f.bars)).size === 1 ? frames[0]!.bars : null;
  if (sharedBars) for (const f of frames) f.bars = '';

  say('uploading…');
  try {
    const res = await fetch(`${ENDPOINT}?k=${encodeURIComponent(CAPTURE_KEY)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        cols,
        rows,
        fps: FPS,
        // The exact styling and blend mode travel with the frames, so playback reproduces
        // this rather than approximating font metrics that were derived here from a
        // measured probe glyph.
        textStyle: text.style.cssText,
        blend: getComputedStyle(color).mixBlendMode,
        ...(sharedBars ? { bars: sharedBars } : {}),
        frames: sharedBars
          ? frames.map(({ rows, color: c }) => ({ rows, color: c }))
          : frames,
      }),
    });
    say(res.ok ? 'sent' : `failed: ${await res.text()}`);
  } catch (e) {
    say(`failed: ${e instanceof Error ? e.message : String(e)}`);
  }
}
