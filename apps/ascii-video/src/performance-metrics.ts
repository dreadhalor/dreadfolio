/**
 * Performance metrics tracker for debugging and optimization
 */

export class PerformanceMetrics {
  private frameTimes: number[] = [];
  private maxSamples = 60;
  private lastFrameTime = 0;
  
  startFrame() {
    this.lastFrameTime = performance.now();
  }
  
  endFrame() {
    const frameTime = performance.now() - this.lastFrameTime;
    this.frameTimes.push(frameTime);
    
    if (this.frameTimes.length > this.maxSamples) {
      this.frameTimes.shift();
    }
  }
  
  getAverageFPS(): number {
    if (this.frameTimes.length === 0) return 0;
    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    return Math.round(1000 / avgFrameTime);
  }
  
  getAverageFrameTime(): number {
    if (this.frameTimes.length === 0) return 0;
    return Math.round(this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length);
  }
  
  getCurrentFPS(): number {
    if (this.frameTimes.length === 0) return 0;
    const lastFrameTime = this.frameTimes[this.frameTimes.length - 1];
    return Math.round(1000 / lastFrameTime);
  }
  
  getStats() {
    return {
      avgFPS: this.getAverageFPS(),
      currentFPS: this.getCurrentFPS(),
      avgFrameTime: this.getAverageFrameTime(),
    };
  }
}

export const performanceMetrics = new PerformanceMetrics();
