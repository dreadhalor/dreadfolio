import { Coordinates } from '../../types';

export class CoordinateUtils {
  /**
   * Serializes coordinates into a string key in the format "row,col".
   * @param coords - The coordinates to serialize.
   * @returns A string representation of the coordinates.
   */
  static serialize(coords: Coordinates): string {
    return `${coords[0]},${coords[1]}`;
  }

  /**
   * Deserializes a string key back into coordinates.
   * @param key - The string key to deserialize.
   * @returns The corresponding Coordinates.
   */
  static deserialize(key: string): Coordinates {
    const [row, col] = key.split(',').map(Number);
    if (row === undefined || col === undefined)
      throw new Error('Invalid key format');
    return [row, col];
  }
}
