import { useRef, type PointerEvent } from 'react';
import type { Coordinates, Square } from '../types';
import { GridSquare } from './grid-square';

type Props = {
  grid: Square[][];
  size: number;
  gridRef: { current: HTMLDivElement | null };
  /** A press on a square, then each square the pointer crosses while it's held. */
  onPress: (cell: Coordinates) => void;
  onDrag: (cell: Coordinates) => void;
};

/* The squares a straight line from one cell to another crosses (Bresenham), the first left out. */
function line([r0, c0]: Coordinates, [r1, c1]: Coordinates) {
  const out: Coordinates[] = [];
  const dr = Math.abs(r1 - r0), dc = Math.abs(c1 - c0);
  const sr = r0 < r1 ? 1 : -1, sc = c0 < c1 ? 1 : -1;
  let err = dc - dr;
  let r = r0, c = c0;
  while (r !== r1 || c !== c1) {
    const e2 = 2 * err;
    if (e2 > -dr) {
      err -= dr;
      c += sc;
    }
    if (e2 < dc) {
      err += dc;
      r += sr;
    }
    out.push([r, c]);
  }
  return out;
}

/**
 * The grid. Which square the pointer is over is worked out from where it is (the grid's box and
 * the square size), so a drag touches exactly the squares it passes — however fast, every one on
 * the way, each once. The pointer is captured on press, so a drag that leaves the grid and comes
 * back carries on.
 */
export function Grid({ grid, size, gridRef, onPress, onDrag }: Props) {
  const rows = grid.length, cols = grid[0]?.length ?? 0;
  const last = useRef<Coordinates | null>(null);

  const cellAt = (e: PointerEvent<HTMLDivElement>): Coordinates | null => {
    const box = gridRef.current?.getBoundingClientRect();
    if (!box) return null;
    const r = Math.floor((e.clientY - box.top) / size), c = Math.floor((e.clientX - box.left) / size);
    return r >= 0 && c >= 0 && r < rows && c < cols ? [r, c] : null;
  };

  return (
    <div
      ref={(el) => {
        gridRef.current = el;
      }}
      className='m-auto grid touch-none'
      style={{ gridTemplateColumns: `repeat(${cols}, ${size}px)` }}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        const cell = cellAt(e);
        if (!cell) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        last.current = cell;
        onPress(cell);
      }}
      onPointerMove={(e) => {
        if (!last.current) return;
        const cell = cellAt(e);
        if (!cell || (cell[0] === last.current[0] && cell[1] === last.current[1])) return;
        for (const step of line(last.current, cell)) onDrag(step);
        last.current = cell;
      }}
      onPointerUp={() => (last.current = null)}
      onPointerCancel={() => (last.current = null)}
    >
      {grid.map((row) => row.map((square) => <GridSquare key={`${square.row}-${square.col}`} square={square} size={size} rows={rows} />))}
    </div>
  );
}
