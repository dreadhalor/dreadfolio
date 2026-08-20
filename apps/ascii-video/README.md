# ASCII Video

**Real-time ASCII art from webcam with AI-powered person segmentation**

[View Live Demo](https://scottjhetrick.com/ascii-video/) *(requires camera access)*

ASCII Video turns your webcam into animated ASCII art in real time. A MediaPipe
segmentation model cuts out the background so only you get rendered as text, and
the characters are **real DOM text** — you can select them, copy them, and
inspect them in devtools.

---

## Features

- **Real-time ASCII conversion** — webcam to characters at display framerate
- **AI person segmentation** — MediaPipe ImageSegmenter, GPU delegate
- **Selectable text** — the ASCII is DOM, not pixels painted onto a canvas
- **Edge mode** — Sobel contour glyphs that follow features instead of tone
- **Braille mode** — halftone dot rendering at 2x4 subcell resolution
- **Time effects** — slit-scan and motion trails over the sampled grid
- **Region colouring** — hair, skin, face and clothes tinted separately
- **Matrix rain** — falling katakana in the area the mask carves out
- **CRT treatment** — scanlines, bloom and vignette
- **Live diagnostics** — fps, frame time, grid size, model and delegate
- **Responsive** — the grid is derived from viewport size and display DPI

Press `c` or click the gear to open the controls; everything is switchable live.
Close with the X, Escape, or by tapping the artwork. The ASCII is real selectable
text, so you can drag-select and copy a frame straight out of the page.

---

## How it works

```
<video> (GPU-composited underlay, mirrored in CSS)
   |
   +-- FULL frame, scaled  -> seg canvas -> ImageSegmenter -> category mask
   |   (never cropped)                                            |
   |                                                     matching sub-rect
   +-- cover-crop to grid  -> grid canvas --- destination-in -----+
                          |
                     getImageData
                          |
                  AsciiDomRenderer -> one <div> per row of spans
```

Everything happens at grid resolution. Cover, crop, contain and mirror collapse
into a single `drawImage` with a source rect and a mirrored transform, and the
mask is applied by the GPU with `globalCompositeOperation = 'destination-in'`
rather than by looping over pixels on the CPU.

The loop is driven by `requestVideoFrameCallback`, so it runs once per actual
camera frame instead of on a timer that drifts out of phase with capture.

Sizing is observer-driven. A `ResizeObserver` on the host tracks the element
rather than the window, so the grid follows layout changes that never resize the
window at all. The cell size is published as a `--cell` custom property, so a
resize that keeps the grid's shape costs a few style writes rather than
regenerating every row: verified across 40 resize steps and 7 distinct cell
sizes, every row element was reused.

---

## Performance

The app was rebuilt around measurements taken on an M4 (Chrome 151), not
guesses. Per-frame cost before and after:

| Stage | Before | After |
|---|---|---|
| Segmentation | 122.6 ms (BodyPix @ 2560x1440) | ~4-7 ms (MediaPipe, GPU delegate) |
| Canvas pipeline | 11.9 ms | 0.3 ms |
| DOM ASCII render | 8.4 ms at full coverage (2.3 ms at 25%) | **0.5 ms, flat** |

Per glyph mode, measured at 100x62 with pre-built buffers: ramp 0.5 ms, edge
0.7 ms, braille 2.1 ms (eight times the sample data). Time effects add well
under a millisecond.
| **JS bundle** | **2.22 MB (~600 KB gz)** | **143 KB (~44 KB gz)** |

Measured end to end: **~7 fps worth of work per frame, now 90-120 fps.**

### What actually mattered

- **The model, not the plumbing.** BodyPix cost ~122 ms/frame. Critically, its
  cost barely responded to input size — reading a 16-pixel tensor took the same
  ~39 ms as a 36,864-pixel one, because `.data()` is simply where you wait for
  queued inference. TF.js's generic WebGL kernels are far slower than TFLite's
  GPU delegate for this model. Shrinking inputs could never have fixed it.
- **Resolution discipline.** The old pipeline upscaled a 640x480 webcam frame to
  2560x1920, cropped it, ran a full-resolution `getImageData` (8.2 ms) plus a
  3.7M-iteration JS alpha loop plus `putImageData`, then crushed the result down
  to a 100x56 grid. It touched ~660x more pixels than there are characters.
- **`willReadFrequently` was a red herring.** It does disable GPU acceleration in
  Chrome, but measured here it made no difference (11.9 ms vs 12.8 ms) — on
  Apple Silicon's unified memory the readback penalty does not materialize.

### Colour does not live in the DOM

The single worst scaling property this app had was that **cost grew with how
much of the frame was a person**: fill the view and it crawled, with devtools
attached it hit ~1fps. Masked-out cells collapse into one long run of spaces,
but every visible cell emitted a coloured `<span>` — and photographic content
shatters colour runs down to roughly one span per cell (5,128 spans for 6,900
cells). Measured breakdown: building the strings was 0.4 ms, `innerHTML`
parsing 2.3 ms, and **style recalc plus inline layout 5.6 ms**.

So the fix was not a faster way to make spans. Reusing persistent span elements
measured 8.1 ms against the old 8.3 ms — no help, because the cost is the number
of styled inline boxes, not how they are created. Coarser colour quantisation
did not help either: even 4 levels per channel only halved the run count, since
real imagery crosses quantisation boundaries every few cells anyway.

Colour is now supplied by a `cols x rows` canvas scaled over the text with
`image-rendering: pixelated` and `mix-blend-mode: multiply`. Against a black
backdrop that is exactly equivalent — `black x C = black`, `white x C = C` — so
the text layer needs **no spans at all**. Cost went from 8.4 ms at full coverage
to **0.5 ms flat**, 15.8x, and it no longer depends on coverage:

| person coverage | old span path | blend path |
|---|---|---|
| 25% | 2.3 ms | 0.4 ms |
| 50% | 4.1 ms | 0.5 ms |
| 75% | 6.0 ms | 0.5 ms |
| 100% | 7.9 ms | 0.5 ms |

The opaque bars that backdrop the glyphs are a second canvas rather than a layer
of `<span>` elements. That is not about raw speed — it is about DOM churn.
`innerHTML` replaces child nodes, and with devtools attached every one of those
mutations is echoed to the frontend. Measured against a noisy camera source:
**11,235 DOM mutation events over 4 seconds, down to 5,110** once the bars moved
to a canvas, and the cost of having DOM inspection active went from
90 -> 73 fps of headroom to 72 -> 71. What is left is one text-node update per
row per frame, which is irreducible if the ASCII is to be real selectable text.

Note this only shows up with a *noisy* source. A static test image lets the
per-row caches suppress almost every write, which is exactly how it was missed
the first time round.

The equivalence needs an opaque dark backdrop inside the blend group, so it
holds only for a black background with mask bars drawn. Any other combination
falls back to the original span renderer, which is still there.

### Where the time goes now

Segmentation inference, at ~10 ms. Mask bookkeeping is 0.3 ms and the ASCII
render 0.5 ms. That cost is flat with respect to coverage, so the app no longer
degrades as the subject fills the frame. `segment_interval` trades mask
freshness for headroom if you ever need it.

---

## Tech stack

- **Language**: TypeScript (strict)
- **Segmentation**: `@mediapipe/tasks-vision` ImageSegmenter (SelfieSegmenter, landscape)
- **Rendering**: DOM text + one small 2D canvas for sampling
- **Build**: Vite

No p5, no TensorFlow.js. Both were removed — p5 was providing a canvas that had
nothing left to draw once the ASCII became DOM and the feed became a `<video>`.

---

## Quick start

```bash
# from the monorepo root
pnpm install

cd apps/ascii-video
pnpm dev        # https://localhost:5173/ascii-video/
pnpm dev-host   # also reachable on the LAN
```

A webcam and a secure context are required (`https://` or `localhost`). The dev
server uses a self-signed certificate if `.cert/` is present, so you'll need to
accept the browser warning.

The MediaPipe wasm runtime (~18 MB) lives in `node_modules` and is mirrored into
`public/mediapipe/wasm/` by `scripts/copy-mediapipe-wasm.mjs`, which the `dev`
and `build` scripts run automatically. That directory is gitignored.

---

## Scripts

```bash
pnpm dev        # dev server
pnpm dev-host   # dev server, network accessible
pnpm build      # production build
pnpm preview    # preview the production build
pnpm lint       # eslint
```

---

## Project structure

```
src/
  config.ts          # every visual + tuning knob
  segmenter.ts       # MediaPipe ImageSegmenter wrapper
  frame-pipeline.ts  # video -> grid-resolution RGBA matrix
  ascii-dom.ts       # the RGBA matrix -> DOM text
  renderer.ts        # wiring + the rVFC loop
  video-camera.ts    # getUserMedia
  main.ts            # entry point
public/
  models/            # .tflite segmentation models (committed)
  mediapipe/         # wasm runtime (gitignored, copied at dev/build)
```

---

## Modes

**Glyphs.** `ramp` maps cell brightness onto a density ramp.

`edge` runs a Sobel over the luminance field: the gradient magnitude decides
whether a cell sits on an edge, and the gradient direction picks a glyph that
follows the contour, so features are drawn as lines rather than dissolving into
tone. Below the threshold it falls back to the ramp, so flat areas still shade.
Two notes: the contour glyphs are ASCII `_ / | \` on purpose, because box
drawing characters resolve to a different advance in the fallback font and this
layer normalises advance globally; and luminance is box-blurred before the
Sobel, since differentiating raw sensor noise turns half the frame into
spurious contours. `edgeThreshold` tunes how much of the frame becomes line
work — 120 gives roughly 13%, 38 gives 55% and reads as circuitry.

`braille` samples
each cell at 2x4 and ordered-dithers those eight subpixels into a Unicode
braille pattern — a halftone, so it captures finer gradients but reads as
dithering rather than as four times the detail.

Three things to know before touching braille, each of which produced a visible
bug: the dither matrix must be indexed in *absolute* subpixel space (a 2x4
matrix is exactly one cell wide, so every cell gets an identical pattern and the
image prints a regular stripe); **every glyph drawn in a frame must share one
advance width**, because a single letter-spacing value normalises the layer and
any narrower glyph shifts everything after it, accumulating along the row (this
stack measures 50 for halfwidth katakana, 60.21 for ASCII, 68.36 for braille per
100px, so an ASCII space among braille drags the row left by ~0.12 of a cell
each); and **U+2800 is not blank** — it paints the empty dot positions in every
macOS monospace fallback — so runs of blank cells are wrapped in a
`visibility:hidden` span, which keeps the advance and renders nothing. Blank runs
follow the silhouette, so that is ~70 spans per frame rather than one per cell.

**Colour.** `image` uses the pixel's own colour. `region` tints by segmentation
class — hair, body skin, face skin, clothes — modulated by the cell's brightness
so it still reads as a picture. Region mode needs the multiclass model, which is
16MB, so it is fetched only when selected and dropped again afterwards: its mask
is noticeably less clean around the jaw and shoulders than the 250KB binary one.

**Background.** `video` shows the live feed behind the subject, `rain` replaces
it with falling katakana, `plain` with flat colour.

**Time.** `slitscan` takes each output row from a different point in the past,
so moving through frame smears you across time. `trails` keeps a decaying
maximum, including alpha, so the silhouette itself leaves an afterimage.

These are only affordable because sampling happens at grid resolution: a
slit-scan at camera resolution means buffering megabytes per frame, whereas a
100x62 frame is 25KB and a whole second of history costs under a megabyte.
History is capped at 24MB, which matters because braille samples 8x per cell.

## Customization

All knobs live in `src/config.ts`:

```ts
export const density = '@WÑ$9806532ba4c7?1=~"-;:,. ';  // dark -> light ramp
export const black = true;          // black background
export const greenify = true;       // Matrix green
export const pixel_scale = 1.5;     // glyph size within its cell
export const draw_raw_feed = true;  // show the video behind the ASCII
export const CPI = 20;              // characters per inch
export const pixelation_max = 100;  // cap on grid cells along the long axis
export const segment_interval = 1;  // run segmentation every N frames
```

### Asset caching

`public/` is copied verbatim by Vite — no content hashing — and the deploy serves
everything non-HTML with `max-age=31536000, immutable`. An unversioned path
would therefore pin the first copy a visitor downloaded for a year, and a
CloudFront invalidation would not help because the browser never revalidates.
So both large binaries carry a version in their path:

- models are named `*.v1.tflite`; **bump the suffix whenever a model file is
  replaced**, or returning visitors keep the old weights
- the wasm runtime goes to `public/mediapipe/wasm-<package version>/`, written by
  `scripts/copy-mediapipe-wasm.mjs`, which also emits `src/mediapipe-runtime.ts`
  so the app knows the directory. That file is generated but committed, so a
  bare `vite` still works; the script rewrites it when the version changes.
  (Vite's `define` was the obvious mechanism and does not survive into
  dev-served modules here, hence the generated file.)

In development the app instance is exposed for poking at:

```js
asciiVideo.stats()             // fps, frame time, grid, model, delegate, coverage
asciiSettings.glyphMode = 'braille'  // same object the render loop reads
```

## Mobile

The grid is sized from CSS pixels only. A CSS pixel is already nominally 1/96
inch regardless of `devicePixelRatio`, so multiplying by the ratio double-counts
it — that made cells three times too large on a 3x phone, 27 columns across a
393px viewport instead of 46. Controls are 44px on their short axis, the panel is
bounded by `min(260px, 100vw - 24px)` and `100dvh`, and the page uses `100dvh`
because `100vh` on mobile Safari includes the browser chrome and pushes the
bottom of the grid under the toolbar.

---

## Notes and gotchas

- **The two segmentation models do not agree on encoding.** The binary model
  emits 0 for subject and 255 for background — *not* the category index its docs
  describe. Verified empirically: a solid grey frame returns 100% 255, a forest
  photo 97% 255, a close-up portrait 76% 0. The multiclass model does emit true
  indices (0 background, 1 hair, 2 body-skin, 3 face-skin), verified by rendering
  each index as a colour and checking the regions land where they should. Ask
  `segmenter.isSubject()` rather than assuming either convention.
- **Feed each model its native input shape.** The multiclass net is 256x256;
  handing it a 256x144 letterbox makes it upscale vertically and the mask comes
  back ragged with holes.
- **`user-select: none` on `*` will silently break text selection.** The
  universal selector applies to every element directly, so it beats inheritance
  from the text layer; `.ascii-text *` has to be exempted explicitly.
- **The mask must cover the whole camera frame, not the visible crop.** The grid
  shows a cover-crop of the video whose aspect follows the window, so if the
  segmentation input is cropped to some other aspect the two describe different
  regions and the silhouette lands in the wrong place — visibly squashed and
  offset once the window stops being 16:9. The model is fed the full frame
  (scaled, never distorted) and the composite draws the sub-rect of the mask
  matching the crop that was sampled.
- **`stats().fps` is the observed frame rate, not `1000 / workTime`.** The
  latter stays flattering while the loop is starved, which is precisely when you
  need the number to be honest. `headroomFps` reports the work-derived figure.
- **A throw inside the render loop used to kill it permanently** — the rVFC
  chain re-arms at the end of the tick, so an exception meant no reschedule and
  the ASCII froze while the stats kept reporting the last good rate. The tick is
  now wrapped and always reschedules, counting failures in `stats().frameErrors`.
- The GPU delegate falls back to CPU automatically (~7 ms instead of ~4 ms) if
  the driver refuses it.
- **`matchMedia('(resolution: Ndppx)')` is the documented way to watch
  devicePixelRatio, but its `change` event was observed not to fire** even
  though `devicePixelRatio` updated and `mq.matches` correctly flipped. Grid
  density therefore tracks DPR two ways that do work: a ResizeObserver bound to
  `device-pixel-content-box`, plus a plain `devicePixelRatio` comparison in the
  loop (a property read, not a layout flush).
- **Never read `clientWidth`/`getBoundingClientRect` in the render loop.** It
  forces a synchronous layout, and doing it every frame right before writing
  styles is layout thrashing. The ResizeObserver pushes size in instead.

---

## Known limitations

- Camera required, no fallback
- HTTPS / secure context only
- Chrome and Edge are best supported; Safari support for the GPU delegate varies
- The wasm runtime is a ~2.8 MB gzipped download on first load (cached after)

---

## License

MIT — see root LICENSE.

## Author

**Scott Hetrick** — [scottjhetrick.com](https://scottjhetrick.com) · [@Dreadhalor](https://github.com/Dreadhalor)
