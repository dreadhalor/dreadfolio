import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import './app.scss';
import { v4 as uuidv4 } from 'uuid';
import GridSquare from './components/grid-square';
import TopNav from './components/top-nav';
import { bfs } from './utilities/solvers/bfs';
import {
  kruskals,
  ellers,
  recursiveBacktracking,
  huntAndKill,
  prims,
} from './utilities/maze-generation/index';
import { Animator } from './utilities/animator';
import { finishAnimation } from './utilities/animations';
import { recursiveDivision } from './utilities/maze-generation/recursive-division';
import { aStar } from './utilities/solvers/a-star';
import { dfs } from './utilities/solvers/dfs';
import DrawWrapper from './utilities/draw-wrapper';
import { useAchievements } from 'dread-ui';
import { Square } from './types';
import { bfs_raw } from './utilities/solvers/bfs-raw';

export type SetValueProps = {
  square_uuid: string;
  val?: number;
  reset_override?: boolean;
  checkAchievements?: boolean;
};

const App: React.FC = () => {
  const [rows, setRows] = useState<number>();
  const [cols, setCols] = useState<number>();
  const squareSize = useRef<number>(25);

  const { isUnlockable, unlockAchievementById } = useAchievements();

  const createNewGrid = (num_rows: number, num_cols: number): Square[][] => {
    const new_grid: Square[][] = [];
    for (let i = 0; i < num_rows; i++) {
      const row: Square[] = [];
      for (let j = 0; j < num_cols; j++) {
        row.push({ uuid: uuidv4(), row: i, col: j });
      }
      new_grid.push(row);
    }
    return new_grid;
  };

  const [grid, setGrid] = useState<Square[][]>();

  const gridContainerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const mode = useRef<number>(3);
  const solved = useRef<boolean>(false);
  const navRef = useRef<any>(null);
  const animatorRef = useRef<Animator>(new Animator());
  const dragValRef = useRef<number | null>(null);

  const finished = () =>
    grid && animatorRef.current.playAnimations([...finishAnimation(grid)]);
  if (finished) animatorRef.current.setFinishFunction(finished);

  const checkForPathReset = () => {
    return animatorRef.current.animationsLeft() > 0 || solved.current;
  };

  const setValueCheck = (
    candidate_square: Square,
    uuid: string,
    val: number,
    reset_override = false,
  ) => {
    const tile_match = candidate_square.uuid === uuid;
    const val_match = candidate_square.val === val;
    const exact_match = tile_match && val_match;
    if (exact_match) {
      candidate_square.setVal!(() => 0);
      return 0;
    } else if (tile_match) {
      if (val === 3 && candidate_square.pathVal === 2 && !reset_override)
        resetPath();
      if (val === 1 || val === 2) {
        if (candidate_square.val === 3) return null;
        if (!reset_override) resetPath();
        removeVal(val);
      }
      candidate_square.setVal!(() => val);
      return val;
    }
    return null;
  };

  const checkDrawingAchievement = (value: number | null) => {
    switch (value) {
      case 0:
        if (isUnlockable('erase_wall', 'pathfinder-visualizer'))
          unlockAchievementById('erase_wall', 'pathfinder-visualizer');
        break;
      case 1:
        if (isUnlockable('move_start', 'pathfinder-visualizer'))
          unlockAchievementById('move_start', 'pathfinder-visualizer');
        break;
      case 2:
        if (isUnlockable('move_end', 'pathfinder-visualizer'))
          unlockAchievementById('move_end', 'pathfinder-visualizer');
        break;
      case 3:
        if (isUnlockable('draw_wall', 'pathfinder-visualizer'))
          unlockAchievementById('draw_wall', 'pathfinder-visualizer');
        break;
      default:
        break;
    }
  };
  const setValue = ({
    square_uuid,
    val = mode.current,
    reset_override = false,
    checkAchievements = false,
  }: SetValueProps) => {
    let value_set = null;
    if (!rows || !cols || !grid) return null;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const possible = setValueCheck(
          grid[i]![j]!,
          square_uuid,
          val,
          reset_override,
        );
        if ((possible ?? null) !== null) value_set = possible;
      }
    }
    if ((value_set ?? null) !== null && checkForPathReset() && !reset_override)
      resetPath();
    if (checkAchievements) checkDrawingAchievement(value_set);
    return value_set;
  };
  const removeVal = (val: number) => {
    if (!rows || !cols || !grid) return;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const tile = grid[i]![j];
        if (!tile) continue;
        if (tile.val === val) tile.setVal!(() => 0);
      }
    }
  };
  useLayoutEffect(() => {
    resetGridSize();
  }, []);  
  useEffect(() => fullResetStartAndEnd(), [grid]);  

  const fullResetStartAndEnd = () => {
    let potential_start, potential_end;
    const inset = 3;
    if (!rows || !cols || !grid) return;
    if (rows <= cols) {
      const middle_row = Math.floor(rows / 2);
      const start_row = inset < cols ? inset : cols - 1;
      let end_row = cols - inset - 1;
      end_row = end_row >= 0 ? end_row : 0;
      potential_start = getTile([middle_row, start_row]);
      potential_end = getTile([middle_row, end_row]);
    } else {
      const middle_col = Math.floor(cols / 2);
      const start_col = inset < rows ? inset : rows - 1;
      let end_col = rows - inset - 1;
      end_col = end_col >= 0 ? end_col : 0;
      potential_start = getTile([start_col, middle_col]);
      potential_end = getTile([end_col, middle_col]);
    }
    if (potential_start) {
      setValue({ square_uuid: potential_start.uuid, val: 1 });
      potential_start.animate!(1);
    }
    if (potential_end) {
      setValue({ square_uuid: potential_end.uuid, val: 2 });
      potential_end.animate!(1);
    }
  };

  function resetGridSize() {
    if (!gridContainerRef.current) return;
    const w = gridContainerRef.current.clientWidth,
      h = gridContainerRef.current.clientHeight;
    squareSize.current = w < 600 ? 20 : 25;
    let new_rows = Math.floor(h / squareSize.current);
    if (new_rows % 2 === 0 && new_rows > 0) new_rows--;
    let new_cols = Math.floor(w / squareSize.current);
    if (new_cols % 2 === 0 && new_cols > 0) new_cols--;
    animatorRef.current.flushAnimationQueue();
    setRows(() => new_rows);  
    setCols(() => new_cols); //eslint disable-line exhaustive-deps
    setGrid(() => createNewGrid(new_rows, new_cols)); //eslint disable-line exhaustive-deps
    if (new_rows <= 1 || new_cols <= 1) {
      requestAnimationFrame(resetGridSize);
    }
  }
  useEffect(() => {
    window.addEventListener('resize', resetGridSize);
    return () => window.removeEventListener('resize', resetGridSize);
  }, []);  

  const gridStyle = {
    margin: 'auto',
    display: 'grid',
    gap: '0px',
    gridTemplateColumns: `repeat(${cols}, auto)`,
  };

  const getTile = (coords: [number, number]) => {
    if (coords) return grid?.[coords[0]]?.[coords[1]];
  };
  const getStartAndEnd = () => {
    let start = null,
      end = null;
    if (!rows || !cols || !grid) return [start, end];
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (grid[i]![j]!.val === 1) start = [i, j];
        if (grid[i]![j]!.val === 2) end = [i, j];
        if (start && end) break;
      }
    }
    return [start, end] as [[number, number], [number, number]];
  };
  const getClosestPathSquare = (
    new_grid: (Square | number)[][],
    coords: [number, number],
    val: number,
  ) => {
    return bfs_raw({
      grid: new_grid,
      startCoords: coords,
      solutionFunc: (tile_val: number | Square) => tile_val === val,
    });
  };
  const resetStartAndEnd = (
    old_start: [number, number],
    old_end: [number, number],
  ) => {
    if (!rows || !cols || !grid) return;
    const new_grid = grid.map((row) =>
      row.map((square) => {
        if (!square.val) return 0;
        if (square.val === 1 || square.val === 2) return 0;
        return square.val;
      }),
    );

    const start = getClosestPathSquare(new_grid, old_start, 0);
    const end = getClosestPathSquare(new_grid, old_end, 0);

    if (start) {
      const tile = getTile(start);
      if (!tile?.setVal || !tile?.animate) return;
      tile.setVal(() => 1);
      tile.animate(1);
    }
    if (end) {
      const tile = getTile(end);
      if (!tile?.setVal || !tile?.animate) return;
      tile.setVal(() => 2);
      tile.animate(1);
    }
  };

  const resetPath = () => {
    solved.current = false;
    animatorRef.current.flushAnimationQueue();
    if (!rows || !cols || !grid) return;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const tile = grid[i]![j];
        if (
          !tile ||
          !tile.setPathVal ||
          !tile.setDirection ||
          !tile.setDisplayVal ||
          !tile.setVal
        )
          continue;
        if (tile.pathVal) tile.setPathVal(() => 0);
        tile.setDirection(null);
        tile.setDisplayVal(null);
        switch (tile.val) {
          case 4:
            tile.setVal(() => 0);
            break;
          case 5:
            tile.setVal(() => 3);
            break;
          case 6:
            tile.setVal(() => 0);
            break;
          case 7:
            tile.setVal(() => 3);
            break;
          default:
            break;
        }
      }
    }
    navRef.current.forceRender();
  };
  const resetWalls = (animate_tiles = false) => {
    const [start, end] = getStartAndEnd();
    resetPath();
    if (!rows || !cols || !grid) return;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const tile = grid[i]![j];
        if (!tile || !tile.setVal || !tile.animate) continue;
        if (start && i === start[0] && j === start[1]) {
          tile.setVal(() => 1);
          if (animate_tiles) tile.animate(1);
        } else if (end && i === end[0] && j === end[1]) {
          tile.setVal(() => 2);
          if (animate_tiles) tile.animate(1);
        } else tile.setVal(() => 0);
      }
    }
  };

  const wallifyItAll = () => {
    resetPath();
    if (!rows || !cols || !grid) return;
    grid.forEach((row) =>
      row.forEach((tile) => {
        if (!tile.setVal || !tile.setDisplayVal) return;
        tile.setVal(() => 3);
        tile.setDisplayVal(null);
      }),
    );
  };
  const solveBFS = () => {
    const endpoints = getStartAndEnd();
    const start = endpoints[0];
    resetPath();
    if (!grid) return;
    const { end, animations } = bfs({
      maze: grid,
      start_coords: start,
      solution_func: (tile: Square) => tile.val === 2,
      frontier_animation: (tile: Square) => tile.setPathVal!(() => 3),
      traversal_animation: (tile: Square) => tile?.setPathVal!(() => 1),
      path_animation: (tile: Square) => tile.setPathVal!(() => 2),
    });
    if (!animations) return;
    if (animations)
      animations.push(() => {
        if (end) unlockAchievementById('solve_bfs', 'pathfinder-visualizer');
        else unlockAchievementById('no_solution', 'pathfinder-visualizer');
        if (!end && gridContainerRef.current) {
          gridContainerRef.current.classList.remove('no-solution');
          void gridContainerRef.current.offsetWidth;
          gridContainerRef.current.classList.add('no-solution');
        }
      });
    animatorRef.current.playAnimations(animations, 6);
    solved.current = true;
    navRef.current.forceRender();
  };
  const solveDFS = () => {
    const endpoints = getStartAndEnd();
    const start = endpoints[0];
    resetPath();
    if (!grid) return;
    const { end, animations } = dfs({
      maze: grid,
      start_coords: start,
      solution_func: (tile: Square) => tile.val === 2,
      frontier_animation: (tile: Square) => tile.setPathVal!(() => 3),
      traversal_animation: (tile: Square) => tile.setPathVal!(() => 1),
      path_animation: (tile: Square) => tile.setPathVal!(() => 2),
    });
    if (!animations) return;
    animations.push(() => {
      if (end) unlockAchievementById('solve_dfs', 'pathfinder-visualizer');
      else unlockAchievementById('no_solution', 'pathfinder-visualizer');
      if (!end && gridContainerRef.current) {
        gridContainerRef.current.classList.remove('no-solution');
        void gridContainerRef.current.offsetWidth;
        gridContainerRef.current.classList.add('no-solution');
      }
    });
    animatorRef.current.playAnimations(animations, 6);
    solved.current = true;
    navRef.current.forceRender();
  };
  const solveAStar = () => {
    const [start, end] = getStartAndEnd();
    resetPath();
    if (!grid) return;
    const { end: result, animations } = aStar({
      maze: grid,
      start_coords: start,
      end_coords: end,
      traverse_animation: (tile: Square) => tile.setPathVal!(() => 1),
      frontier_animation: (tile: Square) => tile.setPathVal!(() => 3),
      path_animation: (tile: Square) => tile.setPathVal!(() => 2),
    });
    if (!animations) return;
    animations.push(() => {
      if (result) unlockAchievementById('solve_astar', 'pathfinder-visualizer');
      else unlockAchievementById('no_solution', 'pathfinder-visualizer');
      if (!result && gridContainerRef.current) {
        gridContainerRef.current.classList.remove('no-solution');
        void gridContainerRef.current.offsetWidth;
        gridContainerRef.current.classList.add('no-solution');
      }
    });
    animatorRef.current.playAnimations(animations, 6);
    solved.current = true;
    navRef.current.forceRender();
  };

  const generateKruskals = () => {
    const [start, end] = getStartAndEnd();
    wallifyItAll();
    if (!grid) return;
    kruskals(grid, animatorRef);
    unlockAchievementById('generate_kruskals', 'pathfinder-visualizer');
    animatorRef.current.pushOneToOpenQueue(() => {
      if (!start || !end) return;

      resetStartAndEnd(start, end);
    });
    animatorRef.current.closeOpenQueue(true);
  };
  const generateEllers = () => {
    const [start, end] = getStartAndEnd();
    wallifyItAll();
    if (!grid) return;
    let { animations } = ellers(grid);
    unlockAchievementById('generate_ellers', 'pathfinder-visualizer');
    if (!animations) return;
    animations = animations.concat(() => {
      if (!start || !end) return;
      resetStartAndEnd(start, end);
    });

    animatorRef.current.playAnimations(animations, 1, true);
  };
  const generateDFS = () => {
    const [start, end] = getStartAndEnd();
    wallifyItAll();
    if (!grid) return;
    let { animations } = recursiveBacktracking(grid);
    unlockAchievementById(
      'generate_recursive_backtracking',
      'pathfinder-visualizer',
    );
    animations = animations.concat(() => {
      if (!start || !end) return;
      resetStartAndEnd(start, end);
    });

    animatorRef.current.playAnimations(animations, 2, true);
  };
  const generateHuntAndKill = () => {
    const [start, end] = getStartAndEnd();
    wallifyItAll();
    if (!grid) return;
    let { animations } = huntAndKill(grid);
    unlockAchievementById('generate_hunt_and_kill', 'pathfinder-visualizer');
    animations = animations.concat(() => {
      if (!start || !end) return;
      resetStartAndEnd(start, end);
    });
    animatorRef.current.playAnimations(animations, 2, true);
  };
  const generatePrims = () => {
    const [start, end] = getStartAndEnd();
    wallifyItAll();
    if (!grid) return;
    let { animations } = prims(grid);
    unlockAchievementById('generate_prims', 'pathfinder-visualizer');
    if (!animations) return;
    animations = animations.concat(() => {
      if (!start || !end) return;
      resetStartAndEnd(start, end);
    });
    animatorRef.current.playAnimations(animations, 2, true);
  };
  const generateRecursiveDivision = () => {
    const [start, end] = getStartAndEnd();
    resetWalls(false);

    if (!grid) return;
    let { animations } = recursiveDivision(grid, 10);
    animations = animations.concat(() => {
      if (!start || !end) return;
      resetStartAndEnd(start, end);
    });
    unlockAchievementById(
      'generate_recursive_division',
      'pathfinder-visualizer',
    );
    animatorRef.current.playAnimations(animations, 1, true);
  };

  return (
    <div className='App site-bg-empty flex h-full w-full flex-col'>
      <TopNav
        ref={navRef}
        modeRef={mode}
        solveBFS={solveBFS}
        solveDFS={solveDFS}
        solveAStar={solveAStar}
        clearPath={resetPath}
        generateKruskals={generateKruskals}
        generateEllers={generateEllers}
        generateDFS={generateDFS}
        generateHuntAndKill={generateHuntAndKill}
        generatePrims={generatePrims}
        generateRecursiveDivision={generateRecursiveDivision}
        resetWalls={resetWalls}
      />
      <div className='relative min-h-0 w-full flex-1'>
        <div className='absolute left-0 top-0 flex h-full w-full overflow-auto p-1'>
          <div
            ref={gridContainerRef}
            className={
              (rows && rows <= 1 ? 'opacity-0 ' : '') +
              'flex h-full min-w-0 flex-1 flex-row'
            }
          >
            <DrawWrapper
              refToUse={gridRef}
              className='flex h-full flex-1'
              style={{ touchAction: 'none' }}
            >
              <div style={gridStyle} ref={gridRef}>
                {grid &&
                  grid.map((row) =>
                    row.map((square) => (
                      <GridSquare
                        key={square.uuid}
                        size={squareSize.current}
                        rows={rows ?? 0}
                        square={square}
                        setValue={setValue}
                        dragValRef={dragValRef}
                        modeRef={mode}
                      />
                    )),
                  )}
              </div>
            </DrawWrapper>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
