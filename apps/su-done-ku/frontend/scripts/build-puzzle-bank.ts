/*
 * Builds the puzzles the app ships with (src/solver/puzzles.json) from the big puzzle lists the
 * old server drew from: only puzzles the solver finishes, each graded by the hardest technique it
 * needed — easy: singles; medium: pointing, box/line, pairs; hard: triples, X-Wing, XY-Wing, quads.
 * Each keeps a note of every technique its solve used (a bit per technique, in TECHNIQUES order).
 * And an example for each technique: the puzzle where it turns up soonest (hidden quads, which a
 * simpler technique always beats to it, have none).
 *
 *   npx vite-node scripts/build-puzzle-bank.ts [sourceDir]
 *
 * Deterministic: the lists are sampled at fixed strides, so a rerun writes the same bank.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TECHNIQUES, gradeOf, parsePuzzle, solve, type Grade, type TechniqueId } from '../src/solver';

const here = path.dirname(fileURLToPath(import.meta.url));
const SOURCE = process.argv[2] ?? path.resolve(here, '../../backend/src/puzzles');
const OUT = path.resolve(here, '../src/solver/puzzles.json');
const PER_GRADE = 200;
/* Of the hard ones, at least this many solvable without X-Wing or XY-Wing (the old solver's reach). */
const HARD_WITHOUT_WINGS = 60;

const bitOf = (id: string) => 1 << TECHNIQUES.findIndex((t) => t.id === id);
const WINGS = bitOf('xWing') | bitOf('xyWing');
const HIDDEN_SINGLE = bitOf('hiddenSingle');

type Entry = { p: string; u: number };
const bank: Record<Grade, Entry[]> = { easy: [], medium: [], hard: [] };
const seen = new Set<string>();

function* sample(file: string, count: number) {
  const lines = fs.readFileSync(path.join(SOURCE, file), 'utf8').trim().split('\n');
  const stride = Math.max(1, Math.floor(lines.length / count));
  for (let i = 0; i < lines.length; i += stride) {
    const puzzle = lines[i]!.trim().split(/\s+/)[1];
    if (puzzle && puzzle.length === 81) yield puzzle;
  }
}

function consider(puzzle: string, want: Grade, accept: (e: Entry) => boolean) {
  if (seen.has(puzzle) || bank[want].length >= PER_GRADE) return;
  const { outcome, steps } = solve(parsePuzzle(puzzle));
  if (outcome !== 'solved' || gradeOf(steps) !== want) return;
  const entry = { p: puzzle, u: steps.reduce((m, s) => m | bitOf(s.technique), 0) };
  if (!accept(entry)) return;
  seen.add(puzzle);
  bank[want].push(entry);
}

// Easy: singles only, and using hidden singles (all-naked-singles puzzles are just counting).
for (const p of sample('easy.txt', 4000)) consider(p, 'easy', (e) => (e.u & HIDDEN_SINGLE) !== 0);
// Medium: from the medium list, then the hard one if it runs short.
for (const p of sample('medium.txt', 4000)) consider(p, 'medium', () => true);
for (const p of sample('hard.txt', 4000)) consider(p, 'medium', () => true);
// Hard: first make sure enough need no wings, then fill up.
let withoutWings = 0;
for (const p of sample('hard.txt', 40000)) {
  if (withoutWings >= HARD_WITHOUT_WINGS) break;
  const before = bank.hard.length;
  consider(p, 'hard', (e) => (e.u & WINGS) === 0);
  withoutWings += bank.hard.length - before;
}
for (const p of sample('hard.txt', 4000)) consider(p, 'hard', () => true);

for (const g of ['easy', 'medium', 'hard'] as const) {
  if (bank[g].length < PER_GRADE) throw new Error(`Only ${bank[g].length} ${g} puzzles found; widen the sampling.`);
}

// Examples: for each technique, the puzzle (from the bank, or for the rarest the wider lists)
// where it's first needed soonest — then the easiest, then the shortest.
const GRADES: Grade[] = ['easy', 'medium', 'hard'];
type Candidate = { p: string; first: number; grade: number; length: number };
const best = new Map<TechniqueId, Candidate>();
const offer = (p: string) => {
  const { outcome, steps } = solve(parsePuzzle(p));
  if (outcome !== 'solved') return;
  const grade = GRADES.indexOf(gradeOf(steps));
  for (const { id } of TECHNIQUES) {
    const first = steps.findIndex((s) => s.technique === id);
    if (first < 0) continue;
    const c = { p, first, grade, length: steps.length };
    const b = best.get(id);
    if (!b || c.first < b.first || (c.first === b.first && (c.grade < b.grade || (c.grade === b.grade && c.length < b.length)))) best.set(id, c);
  }
};
for (const g of GRADES) for (const e of bank[g]) offer(e.p);
for (const p of sample('hard.txt', 20000)) if (!best.has('nakedQuad')) offer(p);
const examples = Object.fromEntries(TECHNIQUES.filter((t) => best.has(t.id)).map((t) => [t.id, best.get(t.id)!.p]));

fs.writeFileSync(OUT, JSON.stringify({ techniques: TECHNIQUES.map((t) => t.id), ...bank, examples }) + '\n');
console.log(`examples: ${TECHNIQUES.map((t) => (best.has(t.id) ? `${t.id}@${best.get(t.id)!.first}` : `${t.id}: none`)).join(', ')}`);
const wings = bank.hard.filter((e) => e.u & WINGS).length;
console.log(`wrote ${path.relative(process.cwd(), OUT)}: ${PER_GRADE} each; hard: ${wings} use a wing, ${PER_GRADE - wings} don't`);
