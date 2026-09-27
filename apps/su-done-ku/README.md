# Su-Done-Ku

**A sudoku solver that works a puzzle the way a person would: one deduction at a time, each one explained.**

[Live](https://scottjhetrick.com/su-done-ku/)

## What it does

- **Opens on a puzzle.** Every empty square starts with its pencil marks filled in: the digits its row, column and box still allow.
- **Next step** makes the easiest deduction there is and says why, naming the squares and digits:
  > In the top-middle box, 2 can only go in B4 and B6, both in row B. Whichever it is, the rest of row B can't have a 2.
- **The board shows it.** What a step rests on is green; what it rules out is struck through in red; a digit it places drops in, in blue.
- **Play** runs through the steps; **Back**, the slider, and the keyboard (← →, Space, Home, End) go anywhere in the solve.
- **Twelve techniques**, easiest first: naked and hidden singles; pointing pairs and triples; box/line reduction; naked and hidden pairs, triples and quads; X-Wing; XY-Wing. Switch any of them off and the solve works itself out again without it (and says so if it gets stuck). Each has an **example**: a puzzle that opens on the step where it's needed.
- **Pencil marks by hand:** tap an empty square to change its marks. The solver carries on from yours.
- **New puzzles:** 600 ship with the app, 200 each of easy, medium and hard, graded by the hardest technique they need. Or type or paste your own; it's checked for clashes and for having exactly one answer.

## How it works

- `src/solver/`: the solver.
  - `board.ts` holds each square's candidates as a 9-bit mask.
  - `techniques.ts` has each technique find the first deduction it can make, in a fixed scan order, and write it up in plain words.
  - `index.ts` has the solve loop and the grading.
  - A digit placed is struck from its row, column and box in the same step.
- `src/state.ts`: the whole line of steps is worked out when a puzzle loads (a millisecond or so), so the controls just move along it. Switching a technique or changing a pencil mark keeps everything up to the current step and works out the rest again.
- `scripts/build-puzzle-bank.ts` builds `src/solver/puzzles.json` from the big puzzle lists in `backend/src/puzzles/`. It keeps only puzzles the solver finishes, graded, plus an example for each technique.

The Express server in `backend/` is no longer used by the app. Its puzzle lists are just the source for the bundled puzzles.

## Tech

React 19, Base UI, Tailwind CSS 4, TypeScript, Vite; tests with Vitest. No backend and no network: everything ships with the page.

## Scripts (in `frontend/`)

- `pnpm dev`: the dev server (`http://localhost:5173/su-done-ku/`)
- `pnpm build`: build to `dist/`
- `pnpm test`: the tests
- `pnpm lint`: ESLint
- `pnpm bank`: rebuild the bundled puzzles

## Tests

- Every step of all 600 bundled puzzles and the examples is checked against a brute-force solution: no digit placed wrong, no true candidate ruled out.
- Boards are built by hand for the quads, X-Wing and XY-Wing.
- The explanations' wording is checked.

## Limits

- **Human techniques only.** Some very hard puzzles need more (Swordfish, colouring, chains), and the solver says when it's stuck.
- **Hidden quads never come up in practice.** They're implemented, but with the techniques tried easiest first, a simpler one always gets there first, so they have no example.

## Author

Scott Hetrick · [scottjhetrick.com](https://scottjhetrick.com)
