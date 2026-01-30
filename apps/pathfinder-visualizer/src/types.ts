/**
 * Represents a coordinate in the grid.
 */
export type Coordinates = [number, number];

export interface Square {
  uuid: string;
  row: number;
  col: number;
  val?: number;
  setVal?: React.Dispatch<React.SetStateAction<number>>;
  pathVal?: number;
  setPathVal?: React.Dispatch<React.SetStateAction<number>>;
  animate?: (num: number) => void;
  setDisplayVal?: (val: number | null) => void;
  setDirection?: (val: string | null) => void;
}
