import { Coordinates } from '../../types';
import { CoordinateUtils } from './coordinate-utils';

export class GridSet {
  private set: Set<string>;

  /**
   * Initializes the GridSet with an optional array of coordinates.
   * @param coordsSet - An array of coordinates to initialize the set with.
   */
  constructor(coordsSet: Coordinates[] = []) {
    this.set = new Set<string>();
    this.addMultiple(coordsSet);
  }

  /**
   * Adds a single set of coordinates to the GridSet.
   * @param coords - The coordinates to add.
   * @returns The GridSet instance for chaining.
   */
  add(coords: Coordinates): this {
    this.set.add(CoordinateUtils.serialize(coords));
    return this;
  }

  /**
   * Adds multiple sets of coordinates to the GridSet.
   * @param coordsSet - An array of coordinates to add.
   * @returns An array of coordinates that were successfully added.
   */
  addMultiple(coordsSet: Coordinates[]): Coordinates[] {
    const successes: Coordinates[] = [];
    for (const coords of coordsSet) {
      const serialized = CoordinateUtils.serialize(coords);
      if (!this.set.has(serialized)) {
        this.set.add(serialized);
        successes.push(coords);
      }
    }
    return successes;
  }

  /**
   * Checks if the GridSet contains the specified coordinates.
   * @param coords - The coordinates to check.
   * @returns True if the coordinates exist, otherwise false.
   */
  has(coords: Coordinates): boolean {
    return this.set.has(CoordinateUtils.serialize(coords));
  }

  /**
   * Converts the GridSet to an array of coordinates.
   * @returns An array of coordinates.
   */
  toArray(): Coordinates[] {
    return Array.from(this.set).map(CoordinateUtils.deserialize);
  }

  /**
   * Retrieves the coordinates at the specified index.
   * @param index - The index of the coordinates to retrieve.
   * @returns The coordinates at the given index or null if out of bounds.
   */
  at(index: number): Coordinates | null {
    if (index < 0 || index >= this.size()) return null;
    const serialized = Array.from(this.set)[index];
    return serialized ? CoordinateUtils.deserialize(serialized) : null;
  }

  /**
   * Removes and returns a random set of coordinates from the GridSet.
   * @returns The removed coordinates or null if the set is empty.
   */
  popRandom(): Coordinates | null {
    const size = this.size();
    if (size === 0) return null;
    const index = Math.floor(Math.random() * size);
    const serialized = Array.from(this.set)[index];
    if (serialized) {
      this.set.delete(serialized);
      return CoordinateUtils.deserialize(serialized);
    }
    return null;
  }

  /**
   * Deletes the specified coordinates from the GridSet.
   * @param coords - The coordinates to delete.
   * @returns True if the coordinates were deleted, otherwise false.
   */
  delete(coords: Coordinates): boolean {
    return this.set.delete(CoordinateUtils.serialize(coords));
  }

  /**
   * Retrieves the number of elements in the GridSet.
   * @returns The size of the set.
   */
  size(): number {
    return this.set.size;
  }

  /**
   * Creates a clone of the current GridSet.
   * @returns A new instance of GridSet with the same data.
   */
  clone(): GridSet {
    return new GridSet(this.toArray());
  }

  /**
   * Clears all elements from the GridSet.
   */
  clear(): void {
    this.set.clear();
  }
}
