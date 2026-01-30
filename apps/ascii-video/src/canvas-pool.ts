/**
 * Canvas Pool - Reusable canvas elements to avoid constant allocation/deallocation
 * This dramatically reduces GC pressure and improves performance
 */

export class CanvasPool {
  private pool: HTMLCanvasElement[] = [];
  private inUse: Set<HTMLCanvasElement> = new Set();
  private maxSize: number;

  constructor(initialSize = 10, maxSize = 20) {
    this.maxSize = maxSize;
    // Pre-allocate canvases
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createCanvas());
    }
  }

  private createCanvas(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    // Add willReadFrequently hint for 2D contexts
    canvas.getContext('2d', { willReadFrequently: true });
    return canvas;
  }

  /**
   * Get a canvas from the pool, or create a new one if pool is empty
   */
  acquire(width?: number, height?: number): HTMLCanvasElement {
    let canvas: HTMLCanvasElement;

    if (this.pool.length > 0) {
      canvas = this.pool.pop()!;
    } else {
      canvas = this.createCanvas();
    }

    if (width !== undefined && height !== undefined) {
      canvas.width = width;
      canvas.height = height;
    }

    this.inUse.add(canvas);
    return canvas;
  }

  /**
   * Return a canvas to the pool for reuse
   */
  release(canvas: HTMLCanvasElement): void {
    if (!this.inUse.has(canvas)) {
      return; // Already released or not from this pool
    }

    this.inUse.delete(canvas);

    // Clear the canvas
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Only return to pool if we haven't exceeded max size
    if (this.pool.length < this.maxSize) {
      this.pool.push(canvas);
    }
  }

  /**
   * Release all canvases currently in use
   */
  releaseAll(): void {
    const canvasesToRelease = Array.from(this.inUse);
    canvasesToRelease.forEach((canvas) => this.release(canvas));
  }

  /**
   * Get pool statistics for debugging
   */
  getStats() {
    return {
      available: this.pool.length,
      inUse: this.inUse.size,
      total: this.pool.length + this.inUse.size,
    };
  }
}

// Global singleton instance
export const canvasPool = new CanvasPool(10, 20);
