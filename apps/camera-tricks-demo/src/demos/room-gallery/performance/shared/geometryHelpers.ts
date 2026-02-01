import * as THREE from 'three';

/**
 * Geometry Transform Helpers
 * 
 * Utilities for applying transformations to geometries with automatic cleanup.
 * Prevents common bugs from forgetting to reset rotation/position state.
 */

/**
 * Apply position and rotation transformations to a geometry
 * 
 * Automatically resets the temp object's transform state after applying,
 * preventing state leakage between geometry transformations.
 * 
 * @param geometry - The geometry to transform
 * @param tempObject - Reusable Object3D for transformations
 * @param position - [x, y, z] position
 * @param rotation - Optional [x, y, z] rotation in radians
 * 
 * @example
 * ```ts
 * const geometries: THREE.BufferGeometry[] = [];
 * const tempObject = new THREE.Object3D();
 * 
 * const box = new THREE.BoxGeometry(1, 1, 1);
 * applyTransform(box, tempObject, [0, 1, 0], [Math.PI / 2, 0, 0]);
 * geometries.push(box);
 * 
 * // tempObject is automatically reset, safe to use again
 * const sphere = new THREE.SphereGeometry(0.5);
 * applyTransform(sphere, tempObject, [2, 0, 0]);
 * geometries.push(sphere);
 * ```
 */
export function applyTransform(
  geometry: THREE.BufferGeometry,
  tempObject: THREE.Object3D,
  position: [number, number, number],
  rotation?: [number, number, number]
): void {
  tempObject.position.set(...position);
  
  if (rotation) {
    tempObject.rotation.set(...rotation);
  }
  
  tempObject.updateMatrix();
  geometry.applyMatrix4(tempObject.matrix);
  
  // Auto-reset to prevent state leakage
  tempObject.position.set(0, 0, 0);
  tempObject.rotation.set(0, 0, 0);
}

/**
 * Create and transform a geometry in one call
 * 
 * Convenience wrapper that creates the geometry, applies transforms,
 * and returns the transformed geometry ready to push to an array.
 * 
 * @param geometryFactory - Function that creates the geometry
 * @param tempObject - Reusable Object3D for transformations
 * @param position - [x, y, z] position
 * @param rotation - Optional [x, y, z] rotation in radians
 * @returns The transformed geometry
 * 
 * @example
 * ```ts
 * const geometries: THREE.BufferGeometry[] = [];
 * const tempObject = new THREE.Object3D();
 * 
 * geometries.push(
 *   createAndTransform(
 *     () => new THREE.BoxGeometry(1, 2, 1),
 *     tempObject,
 *     [offsetX, 1, 0],
 *     [0, Math.PI / 4, 0]
 *   )
 * );
 * ```
 */
export function createAndTransform(
  geometryFactory: () => THREE.BufferGeometry,
  tempObject: THREE.Object3D,
  position: [number, number, number],
  rotation?: [number, number, number]
): THREE.BufferGeometry {
  const geometry = geometryFactory();
  applyTransform(geometry, tempObject, position, rotation);
  return geometry;
}

/**
 * Create multiple transformed instances of the same geometry
 * 
 * Useful for creating repeated objects like pillars, tiles, or decorative elements.
 * 
 * @param geometryFactory - Function that creates each geometry instance
 * @param tempObject - Reusable Object3D for transformations
 * @param transforms - Array of [position, rotation?] tuples
 * @returns Array of transformed geometries
 * 
 * @example
 * ```ts
 * const geometries: THREE.BufferGeometry[] = [];
 * const tempObject = new THREE.Object3D();
 * 
 * // Create 4 pillars in corners
 * geometries.push(...createMultiple(
 *   () => new THREE.CylinderGeometry(0.2, 0.2, 3, 8),
 *   tempObject,
 *   [
 *     [[offsetX - 5, 1.5, -5]],
 *     [[offsetX + 5, 1.5, -5]],
 *     [[offsetX - 5, 1.5, 5]],
 *     [[offsetX + 5, 1.5, 5]],
 *   ]
 * ));
 * ```
 */
export function createMultiple(
  geometryFactory: () => THREE.BufferGeometry,
  tempObject: THREE.Object3D,
  transforms: Array<[position: [number, number, number], rotation?: [number, number, number]]>
): THREE.BufferGeometry[] {
  return transforms.map(([position, rotation]) => 
    createAndTransform(geometryFactory, tempObject, position, rotation)
  );
}
