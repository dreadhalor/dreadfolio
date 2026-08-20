/**
 * Runtime-tunable settings. Everything here is a mutable default rather than a
 * frozen constant so the on-screen controls can change it live; nothing in the
 * hot path caches these values across frames.
 */

export type GlyphMode = 'ramp' | 'edge' | 'braille';
export type BackgroundMode = 'video' | 'rain' | 'plain';
export type ColorMode = 'image' | 'region';
export type { TimeMode } from './temporal';

/** Dark -> light. Index 0 is the densest glyph. */
export const density = '@WÑ$9806532ba4c7?1=~"-;:,. ';

export const settings = {
  glyphMode: 'ramp' as GlyphMode,
  backgroundMode: 'video' as BackgroundMode,
  colorMode: 'image' as ColorMode,
  /** Give each segmentation region its own glyph set. Needs the multiclass model. */
  regionEffects: false,
  crt: false,
  mask: true,
  timeMode: 'off' as import('./temporal').TimeMode,
  /** Per-frame retention for the trails effect; higher lingers longer. */
  trailDecay: 0.88,

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

  /**
   * Cells along the grid's long axis. This is the app's resolution dial: the
   * short axis follows the viewport's aspect. Segmentation cost is fixed
   * regardless, so the ceiling here is really about the DOM.
   */
  resolution: 160,
  /** Mask alpha at or above which a cell counts as subject. */
  maskAlphaThreshold: 128,
  /** Run segmentation every N frames. */
  segmentInterval: 1,
  /** Brightness lift for braille cells, whose dots already carry tone. */
  brailleGain: 1.9,
  /**
   * Sobel gradient magnitude above which a cell is drawn as a contour glyph
   * rather than a tone glyph. Lower means more of the frame turns into lines.
   */
  edgeThreshold: 120,
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
/**
 * Glyph set per region, indexed by category. Mixing these within one frame is
 * only safe because each run carries its own letter-spacing -- see the note on
 * advance widths in ascii-dom.
 */
export const regionGlyphs: GlyphMode[] = [
  'ramp', // background
  'braille', // hair -- fine dot texture suits strands
  'ramp', // body skin
  'edge', // face skin -- contours pick out features
  'ramp', // clothes
  'edge', // accessories
];

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
