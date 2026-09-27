# Enlight

A soiree of shine and shadow: you are a light, and the shapes you make cast
shadows as you wander around them. Plain TypeScript and the Canvas 2D API, no
framework, just the maths.

[Live](https://scottjhetrick.com/enlight/)

## Playing

- The light is your pointer, and it goes anywhere, into a shape too, which
  lights it from the inside.
- Double-click (double-tap) anywhere to make a shape.
- With a mouse, drag a shape to move it; click it, then drag its corners to
  reshape it.
- By touch, a finger dragging about only moves the light, so tap a shape to
  select it first; then drag it, or its corners.
- Double-click (double-tap) a shape, or press Delete while it is selected, to
  get rid of it.
- The `?` opens the instructions again. Like everything else here, it only
  shows where the light falls.

`?soft=N` pins how many point lights make up the soft light (default 32).

## How it works

**Visibility.** Everything the light can see from a point is a polygon. The
only places that polygon's outline can turn are shape corners and the points
where two shapes' edges cross, so `Caster` (in `src/geometry.ts`) aims two rays
at each of those, a hair either side, and keeps the nearest wall each ray hits.
Crossings are found once whenever the shapes change, not every frame.

Rather than test every ray against every wall, the caster sweeps round the
light: each wall covers a span of angles as seen from the light, and a ray is
only tested against the walls whose span it falls in. `test/geometry.test.ts`
checks the sweep against the brute-force version, point for point.

**Soft shadows.** A real light has a size, so its shadows have soft edges. The
light is a disc of 32 point lights, spread over it in a sunflower spiral; each
adds its share wherever it can see. Where only some of them reach, you are in
the penumbra. That coverage is then multiplied by one radial falloff, painted
once, so the gradient stays smooth.

**Everything else is drawn by the light.** Copy that should only appear in the
dark is painted underneath and hidden by the light; copy, the `?` and the bright
rims on the faces that meet the light are painted on top, clipped to wherever
the light reaches.

**Cheap when idle.** Frames are drawn on demand, only when something moves. The
canvas matches the screen's pixel density (up to 2x) so edges stay sharp, and if
frames start coming back slowly the light drops to 16 point lights.

## Code

```
src/
  main.ts       input, onboarding, frame scheduling
  render.ts     the light layer, rims, copy, corner handles, the orb
  geometry.ts   visibility polygons and hit tests
  shapes.ts     making, finding and keeping shapes on screen
  style.css     layout and the help card
  fonts/        Annie Use Your Telescope (SIL Open Font License, see OFL.txt)
test/
  geometry.test.ts
```

## Scripts

```bash
pnpm dev     # dev server
pnpm build   # production build into dist/, served under /enlight/
pnpm test    # geometry tests (Node 22.6+ runs the TypeScript directly)
pnpm lint
```

## Credits

Font: [Annie Use Your Telescope](https://fonts.google.com/specimen/Annie+Use+Your+Telescope)
by Kimberly Geswein, under the SIL Open Font License 1.1.
