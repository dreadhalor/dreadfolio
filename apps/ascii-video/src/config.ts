/**
 * Runtime-tunable settings. Everything here is a mutable default rather than a
 * frozen constant so the on-screen controls can change it live; nothing in the
 * hot path caches these values across frames.
 */

export type GlyphMode = 'ramp' | 'braille';
export type BackgroundMode = 'video' | 'rain' | 'plain';
export type ColorMode = 'image' | 'region';

/** Dark -> light. Index 0 is the densest glyph. */
export const density = '@WÑ$9806532ba4c7?1=~"-;:,. ';

export const settings = {
  glyphMode: 'ramp' as GlyphMode,
  backgroundMode: 'video' as BackgroundMode,
  colorMode: 'image' as ColorMode,
  crt: false,
  mask: true,

  black: true,
  gradient: false,
  color: true,
  greenify: true,
  brightenAmount: 0,
  pixelScale: 1.5,
  /** Background bars behind the subject. Turning these off forces monochrome. */
  drawSquares: true,
  drawChars: true,
  showDiagnostics: false,

  /** Characters per inch, with the grid's long axis capped below. */
  cpi: 20,
  pixelationMax: 100,
  /** Mask alpha at or above which a cell counts as subject. */
  maskAlphaThreshold: 128,
  /** Run segmentation every N frames. */
  segmentInterval: 1,
  /** Brightness lift for braille cells, whose dots already carry tone. */
  brailleGain: 1.9,
};

export type Settings = typeof settings;

export const draw_margin: [number, number] = [0, 0];
export const base_black: [number, number, number] = [0, 0, 0];
export const base_white: [number, number, number] = [255, 255, 255];

/** Long edge of the canvas handed to the segmentation model. */
export const segmentation_long_side = 256;

/**
 * Multiclass categories, verified against the model rather than taken on faith:
 * rendering each index as a distinct colour puts 1 exactly on hair, 2 on the
 * neck and shoulders, 3 on the face. Matches the documentation here, unlike the
 * binary model whose mask is inverted from what its docs imply.
 */
export const REGION = {
  background: 0,
  hair: 1,
  bodySkin: 2,
  faceSkin: 3,
  clothes: 4,
  accessories: 5,
} as const;

/** Per-region tint, applied to the cell's own brightness. */
export const regionPalette: [number, number, number][] = [
  [0, 0, 0], // background, never drawn
  [255, 120, 40], // hair
  [120, 255, 180], // body skin
  [90, 200, 255], // face skin
  [200, 130, 255], // clothes
  [255, 240, 120], // accessories
];

/**
 * Rain glyphs, per mode. Every character drawn in a frame MUST share one
 * advance width: the layer normalises advance with a single letter-spacing
 * value, so a narrower glyph shifts everything after it and the error
 * accumulates along the row. In this stack the three sets measure
 * 50 (halfwidth katakana), 60.21 (ASCII) and 68.36 (braille) per 100px of
 * font-size, so katakana cannot be mixed with the ASCII ramp -- it drags each
 * row left by 17% of a cell per glyph.
 */
export const rainGlyphsAscii = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ<>|/\\=+*#$%&';

/** Braille rain: patterns with a few dots set, so the columns read as falling. */
export const rainGlyphsBraille = Array.from(
  { length: 48 },
  (_, i) => String.fromCodePoint(0x2800 + ((i * 37 + 13) % 255) + 1),
).join('');
