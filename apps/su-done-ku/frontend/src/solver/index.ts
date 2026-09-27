import { apply, statusOf, type Board, type Deduction, type TechniqueId } from './board';
import { FINDERS } from './techniques';

export * from './board';

/*
 * The solver: one deduction at a time, easiest technique first, as a person would work — and when
 * a step places a digit, that digit is struck from the rest of its row, column and box in the same
 * step, the way a person tidies their pencil marks.
 */

export type Level = 'basic' | 'intermediate' | 'advanced';
export type Grade = 'easy' | 'medium' | 'hard';

export type Technique = { id: TechniqueId; name: string; level: Level; blurb: string };

/* Every technique, in the order they're tried: easiest first. */
export const TECHNIQUES: readonly Technique[] = [
  { id: 'nakedSingle', name: 'Naked single', level: 'basic', blurb: 'A square down to one candidate is that digit.' },
  { id: 'hiddenSingle', name: 'Hidden single', level: 'basic', blurb: 'A digit with one place left in a row, column or box goes there.' },
  { id: 'pointing', name: 'Pointing pair / triple', level: 'intermediate', blurb: 'A digit that, inside a box, is stuck on one line owns that line’s spot for it.' },
  { id: 'boxLine', name: 'Box/line reduction', level: 'intermediate', blurb: 'A digit that, along a line, is stuck inside one box owns that box’s spot for it.' },
  { id: 'nakedPair', name: 'Naked pair', level: 'intermediate', blurb: 'Two squares with the same two candidates take both digits.' },
  { id: 'hiddenPair', name: 'Hidden pair', level: 'intermediate', blurb: 'Two digits with the same two places left take those squares.' },
  { id: 'nakedTriple', name: 'Naked triple', level: 'advanced', blurb: 'Three squares with three candidates between them take those digits.' },
  { id: 'hiddenTriple', name: 'Hidden triple', level: 'advanced', blurb: 'Three digits with the same three places left take those squares.' },
  { id: 'xWing', name: 'X-Wing', level: 'advanced', blurb: 'A digit boxed into the corners of a rectangle clears the rectangle’s lines.' },
  { id: 'xyWing', name: 'XY-Wing', level: 'advanced', blurb: 'Three two-candidate squares that force a digit into one of two places.' },
  { id: 'nakedQuad', name: 'Naked quad', level: 'advanced', blurb: 'Four squares with four candidates between them take those digits.' },
  { id: 'hiddenQuad', name: 'Hidden quad', level: 'advanced', blurb: 'Four digits with the same four places left take those squares.' },
];

export const TECHNIQUE_BY_ID = Object.fromEntries(TECHNIQUES.map((t) => [t.id, t])) as Record<TechniqueId, Technique>;
export const ALL_TECHNIQUES: ReadonlySet<TechniqueId> = new Set(TECHNIQUES.map((t) => t.id));

/** The next deduction, using only the techniques switched on, and which of those found nothing. */
export function nextStep(b: Board, enabled: ReadonlySet<TechniqueId> = ALL_TECHNIQUES) {
  const tried: TechniqueId[] = [];
  for (const { id } of TECHNIQUES) {
    if (!enabled.has(id)) continue;
    const deduction = FINDERS[id](b);
    if (deduction) return { deduction, tried };
    tried.push(id);
  }
  return { deduction: null, tried };
}

export type Outcome = 'solved' | 'stuck' | 'broken';

/** Every step from here to the end: solved, stuck (nothing switched on finds anything), or broken. */
export function solve(start: Board, enabled: ReadonlySet<TechniqueId> = ALL_TECHNIQUES) {
  const steps: Deduction[] = [];
  let board = start;
  for (let n = 0; n < 2000; n++) {
    const status = statusOf(board);
    if (status !== 'solving') return { board, steps, outcome: status as Outcome };
    const { deduction } = nextStep(board, enabled);
    if (!deduction) break;
    steps.push(deduction);
    board = apply(board, deduction);
  }
  return { board, steps, outcome: 'stuck' as Outcome };
}

const LEVEL_GRADE: Record<Level, Grade> = { basic: 'easy', intermediate: 'medium', advanced: 'hard' };
const LEVELS: Level[] = ['basic', 'intermediate', 'advanced'];

/** How hard a solve was: its hardest technique's level. */
export function gradeOf(steps: readonly Deduction[]): Grade {
  let top = 0;
  for (const s of steps) top = Math.max(top, LEVELS.indexOf(TECHNIQUE_BY_ID[s.technique].level));
  return LEVEL_GRADE[LEVELS[top]!];
}
