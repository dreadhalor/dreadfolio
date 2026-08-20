/**
 * Every visual knob the old p5 sketch exposed, kept verbatim so the rendered
 * result is unchanged. Only the machinery underneath was rewritten.
 */

export const density = '@WÑ$9806532ba4c7?1=~"-;:,. ';
// const density =
// 'ヹヰガホヺセヱオザヂズモネルキヴミグビサヲテワプクヅバゾフベナンョォヵニャェヶトィー゠・';

export const black = true;
export const gradient = false;
export const color = true;
export const brighten_amount = 0;
export const greenify = true;
export const pixel_scale = 1.5;
export const draw_raw_feed = true;
export const draw_squares = true;
export const draw_chars = true;
export const show_diagnostics = false;
export const pausable = false;

/** Outer padding around the ASCII grid, in px. */
export const draw_margin: [number, number] = [0, 0];

/**
 * Characters-per-inch target. The grid is sized from this and the display DPI
 * so the glyphs stay a consistent physical size across screens.
 */
export const CPI = 20;
/** Hard ceiling on grid cells along the long axis. */
export const pixelation_max = 100;

/**
 * Long-edge size of the canvas handed to the segmentation model. The short edge
 * follows the camera's aspect ratio so the frame is never distorted, and the
 * whole frame is always segmented -- see the note in frame-pipeline on why the
 * mask must cover the full frame rather than the visible crop.
 */
export const segmentation_long_side = 256;

/**
 * Run segmentation every N frames. 1 is affordable (~5ms) at 60fps; raise it
 * if you want more headroom, at the cost of a slightly laggier silhouette.
 */
export const segment_interval = 1;

/**
 * Mask alpha at or above which a cell counts as "person". The mask is scaled
 * from 256x144 down to the grid with smoothing, so edge cells land in between;
 * thresholding keeps the silhouette tight instead of haloing by a cell.
 */
export const mask_alpha_threshold = 128;

export const base_black: [number, number, number] = [0, 0, 0];
export const base_white: [number, number, number] = [255, 255, 255];
