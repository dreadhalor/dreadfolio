import type { Dispatch, SetStateAction } from 'react';

/** A cell of the grid: [row, column]. */
export type Coordinates = [number, number];

/**
 * A square of the grid, as the algorithms see it: what it holds, and the setters its component
 * registers so an animation step can change it.
 *
 * val: 0 empty · 1 start · 2 end · 3 wall · 4 carving (backtracking) · 5 scanned · 6 scan
 *      path · 7 frontier (Prim's)
 * pathVal: 0 none · 1 visited · 2 on the path · 3 frontier
 */
export interface Square {
  row: number;
  col: number;
  val?: number;
  setVal?: Dispatch<SetStateAction<number>>;
  pathVal?: number;
  setPathVal?: Dispatch<SetStateAction<number>>;
  /** 1 a pop (placed, carved), 2 the wave across a finished maze. */
  animate?: (kind: 1 | 2) => void;
  setDisplayVal?: (val: number | null) => void;
  setDirection?: (val: string | null) => void;
}
