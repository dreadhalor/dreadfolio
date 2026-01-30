import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useAchievements } from 'dread-ui';
import { AppType } from '@ms/providers/app-provider';

export const difficultySettings = {
  beginner: { rows: 9, cols: 9, bombs: 10 },
  intermediate: { rows: 16, cols: 16, bombs: 40 },
  expert: { rows: 16, cols: 30, bombs: 99 },
};

export interface CellType {
  val: number;
  open: number;
  flagged: number;
}

export type GameStatus = 'new' | 'started' | 'won' | 'lost';

interface MinesweeperContextProps {
  app: AppType;
  menuOpen: boolean;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  guessCount: number;
  rows: number;
  cols: number;
  bombs: number;
  grid: CellType[][];
  seconds: number;
  status: GameStatus;
  mousedown: boolean;
  reset: (difficulty?: keyof typeof difficultySettings) => void;
  clickCell: (row: number, col: number) => void;
  flagCell: (row: number, col: number) => void;
  getRemainingMines: () => number;
}

const MinesweeperContext = createContext<MinesweeperContextProps | undefined>(
  undefined,
);

export const useMinesweeper = (): MinesweeperContextProps => {
  const context = useContext(MinesweeperContext);
  if (!context) {
    throw new Error('useMinesweeper must be used within a MinesweeperProvider');
  }
  return context;
};

interface MinesweeperProviderProps {
  app: AppType;
  children: ReactNode;
}

export const MinesweeperProvider: React.FC<MinesweeperProviderProps> = ({
  app,
  children,
}) => {
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
  const [status, setStatus] = useState<GameStatus>('new');
  const [mousedown, setMousedown] = useState<boolean>(false);

  const { unlockAchievementById } = useAchievements();

  // Timer Effect
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (status === 'started') {
      timer = setInterval(() => setSeconds((sec) => sec + 1), 1000);
    } else if (status === 'new') {
      setSeconds(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [status]);

  // Status Effect for Achievements
  useEffect(() => {
    if (status === 'lost') {
      unlockAchievementById('lose_game', 'minesweeper');
      if (guessCount === 2) {
        unlockAchievementById('lose_second_click', 'minesweeper');
      }
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
  }, [status, unlockAchievementById, guessCount, rows, cols]);

  // Pointer Up Event Listener
  useEffect(() => {
    const mouseup = (e: PointerEvent) => {
      e.preventDefault();
      setMousedown(false);
    };
    window.addEventListener('pointerup', mouseup);
    return () => {
      window.removeEventListener('pointerup', mouseup);
    };
  }, []);

  const reset = (difficulty?: keyof typeof difficultySettings) => {
    if (difficulty) {
      const settings = difficultySettings[difficulty];
      setRows(settings.rows);
      setCols(settings.cols);
      setBombs(settings.bombs);
      setGrid(createEmptyGrid(settings.rows, settings.cols));
    } else {
      setGrid(createEmptyGrid(rows, cols));
    }
    setMenuOpen(false);
    setStatus('new');
  };

  const isPlaying = () => status === 'new' || status === 'started';

  const checkWin = (candidate_grid: CellType[][], num_bombs: number) => {
    const cells = candidate_grid.flat();
    return (
      cells.filter((cell) => cell.open === 1 && cell.val > -1).length ===
      cells.length - num_bombs
    );
  };

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
        if (checkWin(newGrid, bombs)) {
          newGrid.forEach((rowArr) => {
            rowArr.forEach((cell) => {
              if (cell.val === -1) cell.flagged = 1;
            });
          });
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
              const neighbors = getNeighbors(candidate_grid, r, c);
              const unflaggedZeroes = neighbors.filter(
                ([nr, nc]) =>
                  candidate_grid[nr]?.[nc] &&
                  candidate_grid[nr][nc].val !== -1 &&
                  candidate_grid[nr][nc].open === 0 &&
                  candidate_grid[nr][nc].flagged === 0,
              );
              stack = stack.concat(unflaggedZeroes);
            }
          }
        }
      } else {
        candidate_grid[row][col].open = 1;
        if (candidate_grid[row][col].val === -1) {
          setStatus('lost');
          candidate_grid[row][col].val = -2;
          candidate_grid.forEach((rowArr) => {
            rowArr.forEach((cell) => {
              if (cell.flagged === 1 && cell.val !== -1) cell.val = -3;
              if (cell.val < 0) cell.open = 1;
            });
          });
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
        const cell = result[i]?.[j];
        if (!cell) continue;
        if (cell.val !== -1) {
          cell.val = getMineCount(result, i, j);
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
    } else {
      bomb_indices = [...Array(total_cells).keys()];
    }
    const bomb_coords: [number, number][] = bomb_indices.map((index) => [
      Math.floor(index / cols),
      index % cols,
    ]);
    bomb_coords.forEach(([r, c]) => {
      if (candidate_grid[r]?.[c]) {
        candidate_grid[r][c].val = -1;
      }
    });
    return candidate_grid;
  };

  const getNeighbors = (
    candidate_grid: CellType[][],
    row: number,
    col: number,
  ): [number, number][] => {
    if (!candidate_grid[0]) return [];
    const min_row = Math.max(row - 1, 0);
    const max_row = Math.min(row + 1, candidate_grid.length - 1);
    const min_col = Math.max(col - 1, 0);
    const max_col = Math.min(col + 1, candidate_grid[0].length - 1);
    const neighbors: [number, number][] = [];
    for (let r = min_row; r <= max_row; r++) {
      for (let c = min_col; c <= max_col; c++) {
        if (r !== row || c !== col) {
          neighbors.push([r, c]);
        }
      }
    }
    return neighbors;
  };

  const getMineCount = (
    candidate_grid: CellType[][],
    row: number,
    col: number,
  ): number => {
    const neighbors = getNeighbors(candidate_grid, row, col);
    return neighbors.reduce((count, [r, c]) => {
      return count + (candidate_grid[r]![c]!.val === -1 ? 1 : 0);
    }, 0);
  };

  const getRemainingMines = () => {
    return bombs - grid.flat().filter((cell) => cell.flagged === 1).length;
  };

  const contextValue: MinesweeperContextProps = {
    app,
    menuOpen,
    setMenuOpen,
    guessCount,
    rows,
    cols,
    bombs,
    grid,
    seconds,
    status,
    mousedown,
    reset,
    clickCell,
    flagCell,
    getRemainingMines,
  };

  return (
    <MinesweeperContext.Provider value={contextValue}>
      {children}
    </MinesweeperContext.Provider>
  );
};
