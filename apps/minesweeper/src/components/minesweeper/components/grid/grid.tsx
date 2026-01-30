import React from 'react';
import Cell from './cell';

interface GridProps {
  grid: {
    val: number;
    open: number;
    flagged: number;
  }[][];
  clickCell: (row: number, col: number) => void;
  flagCell: (row: number, col: number) => void;
  status: string;
}

const Grid: React.FC<GridProps> = ({ grid, clickCell, flagCell, status }) => {
  return (
    <div
      className='minesweeper-border-colors-inset grid border-[3px]'
      style={{
        gridTemplateColumns: `repeat(${grid?.[0]?.length}, auto)`,
      }}
    >
      {grid &&
        grid.map((row, row_index) =>
          row.map((cell, col_index) => (
            <Cell
              key={`${row_index},${col_index}`}
              row={row_index}
              col={col_index}
              cell={cell}
              clickCell={clickCell}
              flagCell={flagCell}
              status={status}
            />
          )),
        )}
    </div>
  );
};

export default Grid;
