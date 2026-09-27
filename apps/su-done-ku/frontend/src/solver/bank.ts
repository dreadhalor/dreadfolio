import bank from './puzzles.json';
import type { Grade } from '.';
import type { TechniqueId } from './board';

/*
 * The puzzles the app ships with (built by scripts/build-puzzle-bank.ts): 200 of each grade, each
 * one the solver finishes, with a note of every technique its solve uses — and, for most
 * techniques, an example: the puzzle where it's needed soonest.
 */

const bitOf = (id: TechniqueId) => 1 << bank.techniques.indexOf(id);
const maskOf = (ids: readonly TechniqueId[]) => ids.reduce((m, id) => m | bitOf(id), 0);
const GRADES: Grade[] = ['easy', 'medium', 'hard'];

/** The bundled puzzles of this grade (or any) whose solve needs at least one of these techniques. */
export function puzzlesNeeding(grade: Grade | 'any', anyOf: readonly TechniqueId[]) {
  const mask = maskOf(anyOf);
  return (grade === 'any' ? GRADES.flatMap((g) => bank[g]) : bank[grade]).filter((e) => e.u & mask).map((e) => e.p);
}

/** A random one of those, or null if there are none. */
export function randomPuzzle(grade: Grade | 'any', anyOf: readonly TechniqueId[], random: () => number = Math.random) {
  const pool = puzzlesNeeding(grade, anyOf);
  return pool.length ? pool[Math.floor(random() * pool.length)]! : null;
}

/** The example for a technique: the bundled puzzle where it's needed soonest. */
export const exampleOf = (id: TechniqueId): string | undefined => (bank.examples as Partial<Record<TechniqueId, string>>)[id];
