# Su-Done-Ku

**Sudoku where you play only the parts you enjoy.** Pick which techniques are yours. The app does the rest, pencil marks included, and stops whenever the next step is one of yours.

[Live](https://scottjhetrick.com/su-done-ku/)

## What it does

- **You choose what's yours.** Each of the 13 techniques is either **Me** or **Auto**. Out of the box, crosshatching and the singles are on auto and everything else is yours.
- **The app takes its turn after each of your moves.** It applies the auto techniques, easiest first, and stops as soon as the next step is one of yours. So you never crosshatch unless you want to, and the pencil marks an X-Wing or a box/line reduction needs are already there.
- **Playing:**
  - Tap a square, then a digit.
  - With **Pencil** on, a digit turns that pencil mark on or off.
  - **Erase** and **Undo** do what they say.
  - On a keyboard: the arrows move, 1–9 place a digit, P toggles pencil, Backspace erases, H gives a hint and ⌘Z undoes.
- **Mistakes show at once.** A wrong digit, or a pencil mark taken out that was the answer, turns red. The app won't build on a mistake. **Put it right** takes the wrong digit out, or puts the answer back among the pencil marks.
- **Stuck?**
  - **Hint** first says where to look ("Look for a pointing pair — try the top-left box.").
  - Press it again to see the step, and have the app do it for you if you like.
  - **Solution** walks through the rest from where you are. Your kinds of step come one at a time, each explained; the app's steps are gathered up between them.
- **Practice any technique.** The target beside it opens a puzzle that goes straight to a step needing it, with everything else on auto.
- **New puzzles.**
  - 600 ship with the app, 200 each of easy, medium and hard, graded by the hardest technique they need.
  - The menu only offers puzzles that need at least one of your techniques.
  - You can also type or paste your own. It's checked for clashes and for having exactly one answer.
- **Your game and your choices are kept** in the browser between visits.

## How it works

- `src/solver/`: the solver.
  - `board.ts` holds each square's candidates as a 9-bit mask.
  - `techniques.ts` has each technique find the first deduction it can make, in a fixed scan order, and write it up in plain words.
  - Crosshatching is a technique like any other. Placing a digit doesn't clear its row, column and box; crosshatching does, as a step of its own.
  - `index.ts` has the solve loop and the grading.
  - `check.ts` counts a puzzle's solutions and finds its answer by backtracking.
- `src/game.ts`: the game, as a reducer.
  - It holds the board, the answer (worked out when a puzzle loads), undo, hints and practice.
  - It holds whose each technique is.
  - After each move it runs the auto techniques until the next step is yours, unless there's a mistake on the board.
- `scripts/build-puzzle-bank.ts` builds `src/solver/puzzles.json` from the big puzzle lists in `backend/src/puzzles/`.
  - It keeps only puzzles the solver finishes, graded.
  - Each one notes every technique its solve used, so the menu can offer only puzzles that need one of yours.
  - It also picks an example for each technique.

The Express server in `backend/` is no longer used by the app. Its puzzle lists are just the source for the bundled puzzles.

## Tech

React 19, Base UI, Tailwind CSS 4, TypeScript and Vite, with tests in Vitest. There's no backend and no network: everything ships with the page.

## Scripts (in `frontend/`)

- `pnpm dev`: the dev server (`http://localhost:5173/su-done-ku/`)
- `pnpm build`: build to `dist/`
- `pnpm test`: the tests
- `pnpm lint`: ESLint
- `pnpm bank`: rebuild the bundled puzzles

## Tests

- **The solver.**
  - Every step of all 600 bundled puzzles and of the examples is checked against a brute-force solution: no digit placed wrong, no true candidate ruled out.
  - Boards are built by hand for the quads, X-Wing and XY-Wing.
  - The wording of the explanations is checked.
- **The game.**
  - The app's turn: it stops at your technique, leaves the board alone when everything is yours, and solves it all when everything is on auto.
  - Your moves: right and wrong digits, pencil marks, givens and undo.
  - Hints come in order, with mistakes first.
  - Handing a technique to the app, or taking one back.
  - Practice works for every technique with an example.
  - The solution runs from your board to the answer.
  - The puzzle menu offers only puzzles you have steps in.

## Limits

- **Human techniques only.** Some very hard puzzles need more (Swordfish, colouring, chains), and the app says when it's stuck.
- **Hidden quads never come up in practice.** They're implemented, but because the techniques are tried easiest first, a simpler one always gets there first, so hidden quads have no example.

## Author

Scott Hetrick · [scottjhetrick.com](https://scottjhetrick.com)
