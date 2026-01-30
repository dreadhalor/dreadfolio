import { Coordinates } from '../../types';

export class GridUnionFind {
  private setMap: Map<string, number>;
  public count: number; // Number of disconnected components

  constructor(coords_set: Coordinates[] = []) {
    this.count = 0;
    this.setMap = new Map<string, number>();
    this.addMultiple(coords_set);
  }

  /**
   * Unions the sets containing the two specified coordinates.
   * @param coords_a - The first set of coordinates.
   * @param coords_b - The second set of coordinates.
   * @returns True if the union was successful.
   * @throws Error if either set of coordinates does not exist.
   */
  union(coords_a: Coordinates, coords_b: Coordinates): boolean {
    const a_id = this.setMap.get(JSON.stringify(coords_a));
    const b_id = this.setMap.get(JSON.stringify(coords_b));

    if (a_id === undefined || b_id === undefined) {
      throw new Error('One or both coordinates not found in the set.');
    }

    const min = Math.min(a_id, b_id);
    const max = Math.max(a_id, b_id);

    if (min !== max) {
      for (const key of this.setMap.keys()) {
        if (this.setMap.get(key) === max) {
          this.setMap.set(key, min);
        }
      }
      this.count--;
    }

    return true;
  }

  /**
   * Generates the next available unique ID.
   * @returns The next free ID.
   */
  private nextFreeID(): number {
    const ids = this.setIDs();
    let candidate_id = 0;
    while (ids.has(candidate_id)) candidate_id++;
    return candidate_id;
  }

  /**
   * Adds a single set of coordinates to the Union-Find structure.
   * @param coords - The coordinates to add.
   * @returns True if the coordinates were added, otherwise false.
   */
  add(coords: Coordinates): boolean {
    if (this.find(coords) !== undefined) return false;
    this.setMap.set(JSON.stringify(coords), this.nextFreeID());
    this.count++;
    return true;
  }

  /**
   * Adds multiple sets of coordinates to the Union-Find structure.
   * @param coords_set - An array of coordinates to add.
   */
  addMultiple(coords_set: Coordinates[]): void {
    for (const coords of coords_set) this.add(coords);
  }

  /**
   * Removes a single set of coordinates from the Union-Find structure.
   * @param coords - The coordinates to remove.
   */
  remove(coords: Coordinates): void {
    if (this.find(coords) !== undefined) {
      this.setMap.delete(JSON.stringify(coords));
      this.count--;
    }
  }

  /**
   * Removes multiple sets of coordinates from the Union-Find structure.
   * @param coords_set - An array of coordinates to remove.
   */
  removeMultiple(coords_set: Coordinates[]): void {
    for (const coords of coords_set) this.remove(coords);
  }

  /**
   * Finds the set ID for the specified coordinates.
   * @param coords - The coordinates to find.
   * @returns The set ID or undefined if not found.
   */
  find(coords: Coordinates): number | undefined {
    return this.setMap.get(JSON.stringify(coords));
  }

  /**
   * Checks if two sets of coordinates are connected.
   * @param coords_a - The first set of coordinates.
   * @param coords_b - The second set of coordinates.
   * @returns True if both coordinates are in the same set, otherwise false.
   */
  connected(coords_a: Coordinates, coords_b: Coordinates): boolean {
    return (
      this.setMap.get(JSON.stringify(coords_a)) ===
      this.setMap.get(JSON.stringify(coords_b))
    );
  }

  /**
   * Retrieves all sets of connected coordinates.
   * @returns An iterable of arrays containing connected coordinates.
   */
  sets(): Iterable<Coordinates[]> {
    const reverseMap = new Map<number, Coordinates[]>();
    for (const [coords_str, id] of this.setMap.entries()) {
      if (!reverseMap.has(id)) reverseMap.set(id, []);
      reverseMap.get(id)!.push(JSON.parse(coords_str) as Coordinates);
    }
    return reverseMap.values();
  }

  /**
   * Retrieves all unique set IDs.
   * @returns A set of unique IDs.
   */
  setIDs(): Set<number> {
    return new Set<number>(this.setMap.values());
  }

  /**
   * Transfers data to or from the Union-Find structure.
   * @param uf - The data to transfer.
   * @returns The updated GridUnionFind instance or the current data if no params are provided.
   */
  transferData(uf?: GridUnionFind): GridUnionFind {
    if (!uf) return this;
    this.setMap = new Map(uf.setMap);
    this.count = uf.count;
    return this;
  }
}
