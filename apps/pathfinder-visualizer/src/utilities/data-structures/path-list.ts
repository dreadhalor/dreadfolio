import { Coordinates } from '../../types';
import { CoordinateUtils } from './coordinate-utils';

export class PathList {
  private list: Map<string, Coordinates | null>;

  constructor(map?: Map<string, Coordinates | null>) {
    this.list = map || new Map<string, Coordinates>();
  }

  has(coords: Coordinates): boolean {
    return this.list.has(CoordinateUtils.serialize(coords));
  }

  get(coords: Coordinates): Coordinates | null | undefined {
    return this.list.get(CoordinateUtils.serialize(coords));
  }

  at(index: number): Coordinates {
    const key = [...this.list.keys()][index];
    if (!key) {
      throw new Error('Index out of bounds');
    }
    return CoordinateUtils.deserialize(key);
  }

  getRandom(): Coordinates | null {
    const size = this.list.size;
    if (size === 0) return null;
    const index = Math.floor(Math.random() * size);
    return this.at(index);
  }

  set(coords: Coordinates, neighbor: Coordinates | null): void {
    this.list.set(CoordinateUtils.serialize(coords), neighbor);
  }

  entries(): [Coordinates, Coordinates | null][] {
    return [...this.list.entries()].map(([key, neighbors]) => [
      CoordinateUtils.deserialize(key),
      neighbors,
    ]);
  }

  realEntries(): [Coordinates, Coordinates][] {
    return this.entries().filter(([, neighbor]) => neighbor !== null) as [
      Coordinates,
      Coordinates,
    ][];
  }

  clone(): PathList {
    return new PathList(new Map(this.list));
  }
}
