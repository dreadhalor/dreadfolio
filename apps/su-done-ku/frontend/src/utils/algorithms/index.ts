import { crosshatch } from './crosshatch';
import { hiddenSingles } from './hidden-singles';
import { nakedPairs } from './naked-pairs';
import { nakedTriples } from './naked-triples';
import { hiddenPairs } from './hidden-pairs';
import { hiddenTriples } from './hidden-triples';
import { nakedQuads } from './naked-quads';
import { hiddenQuads } from './hidden-quads';
import { pointingPairs } from './pointing-pairs';
import { pointingTriples } from './pointing-triples';
import { boxLineReduction } from './box-line-reduction';

export const strategies = {
  crosshatch,
  hiddenSingles,
  nakedPairs,
  nakedTriples,
  hiddenPairs,
  hiddenTriples,
  nakedQuads,
  hiddenQuads,
  pointingPairs,
  pointingTriples,
  boxLineReduction,
} as const;

export type Strategy = keyof typeof strategies;
