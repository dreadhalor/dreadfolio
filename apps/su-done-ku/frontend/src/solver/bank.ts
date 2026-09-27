import bank from './puzzles.json';
import type { Grade } from '.';
import type { TechniqueId } from './board';

/*
 * The puzzles the app ships with (built by scripts/build-puzzle-bank.ts): 200 of each grade, each
 * one the solver finishes, with a note of every technique its solve uses.
 */

const bitOf = (id: TechniqueId) => 1 << bank.techniques.indexOf(id);

/** A random bundled puzzle of this grade, as 81 digits; `avoid`: techniques its solve mustn't need. */
export function randomPuzzle(grade: Grade, avoid: readonly TechniqueId[] = [], random: () => number = Math.random) {
  const mask = avoid.reduce((m, id) => m | bitOf(id), 0);
  const pool = bank[grade].filter((e) => !(e.u & mask));
  return pool[Math.floor(random() * pool.length)]!.p;
}
