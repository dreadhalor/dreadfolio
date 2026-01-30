import { useState, useEffect } from 'react';
import Grid from './components/grid/grid';
import ScoreBar from './components/score-bar/score-bar';
import './minesweeper.scss';
import { GameMenu } from './game-menu';
import { useAchievements } from 'dread-ui';
import {
  CellType,
  difficultySettings,
} from '@ms/providers/minesweeper-provider';

const Minesweeper = () => {
  const createEmptyGrid = (rows: number, cols: number): CellType[][] => {
    const result: CellType[][] = [];
    for (let i = 0; i < rows; i++) {
      const row: CellType[] = [];
      for (let j = 0; j < cols; j++) {
        row.push({
          val: -2,
          open: 0,
          flagged: 0,
        });
      }
      result.push(row);
    }
    return result;
  };

  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [guessCount, setGuessCount] = useState<number>(0);
  const [rows, setRows] = useState<number>(difficultySettings.beginner.rows);
  const [cols, setCols] = useState<number>(difficultySettings.beginner.cols);
  const [bombs, setBombs] = useState<number>(difficultySettings.beginner.bombs);
  const [grid, setGrid] = useState<CellType[][]>(createEmptyGrid(rows, cols));
  const [seconds, setSeconds] = useState<number>(0);
  const [status, setStatus] = useState<'new' | 'started' | 'won' | 'lost'>(
    'new',
  );
  const [mousedown, setMousedown] = useState<boolean>(false);

  const mouseup = (e: PointerEvent) => {
    e.preventDefault();
    setMousedown(false);
  };

  const { unlockAchievementById } = useAchievements();

  useEffect(() => {
    if (status === 'lost') {
      unlockAchievementById('lose_game', 'minesweeper');
      if (guessCount === 2)
        unlockAchievementById('lose_second_click', 'minesweeper');
    }
    if (status === 'won') {
      const { beginner, intermediate, expert } = difficultySettings;
      if (rows === beginner.rows && cols === beginner.cols)
        unlockAchievementById('beat_beginner', 'minesweeper');
      if (rows === intermediate.rows && cols === intermediate.cols)
        unlockAchievementById('beat_intermediate', 'minesweeper');
      if (rows === expert.rows && cols === expert.cols)
        unlockAchievementById('beat_expert', 'minesweeper');
    }
    if (status === 'new') {
      setGuessCount(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const reset = (difficulty?: keyof typeof difficultySettings) => {
    if (difficulty) {
      const settings = difficultySettings[difficulty];
      setRows(settings.rows);
      setCols(settings.cols);
      setBombs(settings.bombs);
      setGrid(createEmptyGrid(settings.rows, settings.cols));
    } else setGrid(createEmptyGrid(rows, cols));
    setMenuOpen(false);
    setStatus('new');
  };

  const isPlaying = () => status === 'new' || status === 'started';

  const checkWin = (candidate_grid: CellType[][], num_bombs: number) => {
    const cells = candidate_grid.flat(1);
    return (
      cells.filter((cell) => cell.open === 1 && cell.val > -1).length ===
      cells.length - num_bombs
    );
  };

  function addSecond() {
    setSeconds((sec) => sec + 1);
  }

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    switch (status) {
      case 'started':
        timer = setInterval(addSecond, 1000);
        break;
      case 'new':
        setSeconds(0);
        break;
      default:
        break;
    }
    return () => {
      if (timer) clearInterval(timer);
    };
     
  }, [status]);

  const clickCell = (row: number, col: number) => {
    if (isPlaying()) {
      setGuessCount((count) => count + 1);
      if (!grid[row]?.[col]) return;
      if (grid[row][col].val === -2) formatGrid(row, col);
      if (!(grid[row][col].open || grid[row][col].flagged)) {
        const newGrid = [...grid];
        openCell(newGrid, row, col);
        setGrid(newGrid);
        if (status === 'new') setStatus('started');
        if (checkWin(grid, bombs)) {
          for (const row of grid) {
            for (const cell of row) {
              if (cell.val === -1) cell.flagged = 1;
            }
          }
          setStatus('won');
        }
      }
    }
  };

  const openCell = (candidate_grid: CellType[][], row: number, col: number) => {
    if (!candidate_grid[row]?.[col]) return;
    if (!candidate_grid[row][col].flagged) {
      if (candidate_grid[row][col].val === 0) {
        let stack: [number, number][] = [[row, col]];
        while (stack.length > 0) {
          const [r, c] = stack.pop()!;
          const cell = candidate_grid[r]?.[c];
          if (!cell) continue;
          if (cell.val > -1 && !cell.open) {
            cell.open = 1;
            if (cell.val === 0) {
              const neighbor_cells = getNeighbors(candidate_grid, r, c);
              const unflagged_zeroes = neighbor_cells.filter(
                ([r, c]) =>
                  candidate_grid[r]?.[c] &&
                  candidate_grid[r][c].val !== -1 &&
                  candidate_grid[r][c].open === 0 &&
                  candidate_grid[r][c].flagged === 0,
              );
              stack = stack.concat(unflagged_zeroes);
            }
          }
        }
      } else {
        candidate_grid[row][col].open = 1;
        if (candidate_grid[row][col].val === -1) {
          setStatus('lost');
          candidate_grid[row][col].val = -2;
          for (const row of candidate_grid) {
            for (const cell of row) {
              if (cell.flagged === 1 && cell.val !== -1) cell.val = -3;
              if (cell.val < 0) cell.open = 1;
            }
          }
        }
      }
    }
  };

  const flagCell = (row: number, col: number) => {
    if (isPlaying()) {
      const newGrid = [...grid];
      const cell = newGrid[row]?.[col];
      if (!cell) return;
      if (cell.open === 0) {
        cell.flagged = (cell.flagged + 1) % 3;
        if (cell.flagged === 1)
          unlockAchievementById('flag_cell', 'minesweeper');
        if (cell.flagged === 2)
          unlockAchievementById('question_cell', 'minesweeper');
        setGrid(newGrid);
      }
    }
  };

  const formatGrid = (starting_row: number, starting_column: number) => {
    const result = [...grid];
    plantBombs(result, bombs, starting_row * cols + starting_column);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (result[i]![j]!.val !== -1) {
          result[i]![j]!.val = getMineCount(result, i, j);
        }
      }
    }
    setGrid(result);
  };

  const plantBombs = (
    candidate_grid: CellType[][],
    bombs: number,
    starting_index: number | null = null,
  ) => {
    if (!candidate_grid[0]) return candidate_grid;
    const rows = candidate_grid.length;
    const cols = candidate_grid[0].length;
    if (!cols || !rows) return candidate_grid;
    const total_cells = rows * cols;
    let bomb_indices: number[] = [];
    if (bombs > total_cells) bombs = total_cells;
    const survivable = bombs < total_cells;
    if (survivable) {
      while (bomb_indices.length < bombs) {
        const next_index = Math.floor(Math.random() * total_cells);
        if (
          !bomb_indices.includes(next_index) &&
          next_index !== starting_index
        ) {
          bomb_indices.push(next_index);
        }
      }
    } else bomb_indices = [...Array(total_cells).keys()];
    const result: [number, number][] = bomb_indices.map((index) => [
      Math.floor(index / cols),
      index % cols,
    ]);
    result.forEach(([row, col]) => {
      if (!candidate_grid[row]?.[col]) return;
      candidate_grid[row][col].val = -1;
    });
    return candidate_grid;
  };

  const getNeighbors = (
    candidate_grid: CellType[][],
    row: number,
    col: number,
  ) => {
    if (!candidate_grid[0]) return [];
    const min_row = Math.max(row - 1, 0);
    const max_row = Math.min(row + 1, candidate_grid.length - 1);
    const min_col = Math.max(col - 1, 0);
    const max_col = Math.min(col + 1, candidate_grid[0].length - 1);
    const result: [number, number][] = [];
    for (let i = min_row; i <= max_row; i++) {
      for (let j = min_col; j <= max_col; j++) {
        if (i !== row || j !== col) {
          result.push([i, j]);
        }
      }
    }
    return result;
  };

  const getMineCount = (
    candidate_grid: CellType[][],
    row: number,
    col: number,
  ) => {
    const neighbor_coords = getNeighbors(candidate_grid, row, col);
    const neighbor_cells = neighbor_coords.map(
      ([row, col]) => candidate_grid[row]![col]!,
    );
    const mine_count = neighbor_cells.filter((cell) => cell.val === -1).length;
    return mine_count;
  };

  const getRemainingMines = () => {
    return bombs - grid?.flat(1).filter((cell) => cell.flagged === 1).length;
  };

  useEffect(() => {
    window.addEventListener('pointerup', mouseup);
    return () => {
      window.removeEventListener('pointerup', mouseup);
    };
     
  }, []);

  return (
    <div className='flex h-full w-full flex-col'>
      <GameMenu
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        reset={reset}
        grid={grid}
      />
      <div
        className='flex w-full flex-col gap-[5px] border-l-[3px] border-t-[3px] border-[rgb(245,245,245)] bg-[#c0c0c0] p-[5px]'
        onPointerDown={(e) => {
          e.preventDefault();
          setMousedown(true);
        }}
      >
        <ScoreBar
          mines_remaining={getRemainingMines()}
          seconds_elapsed={seconds}
          reset={reset}
          status={status}
          mousedown={mousedown}
        />
        <Grid
          grid={grid}
          clickCell={clickCell}
          flagCell={flagCell}
          status={status}
        />
      </div>
    </div>
  );
};

export default Minesweeper;
