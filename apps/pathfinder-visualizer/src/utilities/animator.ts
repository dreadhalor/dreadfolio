/*
 * Plays a queue of animation steps a few per frame. Starting a new queue (or stopping) ends the
 * one before it outright: its loop sees it's no longer the current run and stops, so a maze
 * begun over an unfinished one never has two animations fighting over the board.
 */
export class Animator {
  private queue: (() => void)[] = [];
  private run = 0;

  /** Plays `steps`, `perFrame` of them each frame; then `onDone`, if the run wasn't replaced. */
  play(steps: (() => void)[], perFrame = 1, onDone?: () => void) {
    const run = ++this.run;
    this.queue = steps;
    const loop = () => {
      if (run !== this.run) return;
      for (const step of this.queue.splice(0, perFrame)) step();
      if (this.queue.length) requestAnimationFrame(loop);
      else onDone?.();
    };
    loop();
  }

  /** Stops whatever is playing. */
  stop() {
    this.run++;
    this.queue = [];
  }

  get busy() {
    return this.queue.length > 0;
  }
}
