import { useSyncExternalStore } from 'react';

/**
 * A line about what's happening: in full, short enough for a phone, and — when the line is
 * ticking (a search's running count) — what a screen reader should hear instead, once.
 */
export type Status = { text: string; short: string; spoken?: string };

/* What the status line says before anything's run, and after the board is cleared. */
export const HINT: Status = {
  text: 'Drag to draw walls, or drag the start and end to move them. Then pick a search from Solve It!',
  short: 'Drag to draw walls or move the ends.',
};

/* "1 square", "2 squares". */
export const count = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/*
 * The status line lives outside React's tree: a search updates it as it plays, and only the
 * status bar should redraw for that — not the app, and with it every square of the grid.
 */
let current = HINT;
const listeners = new Set<() => void>();
let pending = false;

/* Sets the line. A frame's steps can set it several times: the bar is told once, after them. */
export function setStatus(next: Status) {
  current = next;
  if (pending) return;
  pending = true;
  queueMicrotask(() => {
    pending = false;
    listeners.forEach((l) => l());
  });
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
const snapshot = () => current;

export function useStatus() {
  return useSyncExternalStore(subscribe, snapshot);
}
