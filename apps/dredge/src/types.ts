export interface PackedItem {
  id: string;
  itemId: string;
  shape: number[][];
  rotation?: number;
  topLeft?: [number, number];
}

export interface GridItemBase {
  id: string;
  name: string;
  image: string;
  width: number;
  height: number;
  shape: number[][];
  imageWidth?: number;
  imageHeight?: number;
}

export interface Fish extends GridItemBase {
  type: 'fish';
  number: number;
  value?: number;
}
export interface Item extends GridItemBase {
  type: 'item';
}
export interface CrabPot extends GridItemBase {
  type: 'crab-pot';
}

export type GridItem = Fish | Item | CrabPot;

export interface HullData {
  id: number;
  name: string;
  grid: number[][];
}

export enum SlotType {
  Locked,
  Available,
  Damaged,
}
