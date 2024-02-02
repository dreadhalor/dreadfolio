import {
  one,
  two,
  three,
  four,
  five,
  six,
  seven,
  eight,
  flag,
  question,
  mine,
  mine_death,
  misflagged,
} from '../../../../assets/minesweeper/cell';
import './Cell.scss';

const Cell = ({ row, col, cell, clickCell, flagCell, status }) => {
  const cell_size = 16;

  const digits = {
    1: one,
    2: two,
    3: three,
    4: four,
    5: five,
    6: six,
    7: seven,
    8: eight,
    flag: flag,
    '?': question,
    mine: mine,
    mine_death: mine_death,
    misflagged: misflagged,
  };

  const getBorder = (cell) => {
    if (cell.open === 1) return 'open-square-border';
    if (cell.flagged || status === 'lost' || status === 'win')
      return 'closed-square-border-no-hover';
    return 'closed-square-border';
  };
  const getCharacter = (cell) => {
    if (cell.open) {
      if (cell.val === -1) return <img src={digits['mine']} alt={'mine'} />;
      if (cell.val === -2)
        return (
          <img src={digits['mine_death']} alt={'the mine that killed you'} />
        );
      if (cell.val === -3)
        return <img src={digits['misflagged']} alt={'misflagged'} />;
      if (cell.val > 0) return <img src={digits[cell.val]} alt={cell.val} />;
      return '';
    } else if (cell.flagged) {
      if (cell.flagged === 1) return <img src={digits['flag']} alt={'flag'} />;
      if (cell.flagged === 2)
        return <img src={digits['?']} alt={'question mark'} />;
    } else if (status === 'lost') {
      if (cell.val === -1) return <img src={digits['mine']} alt={'mine'} />;
      return '';
    }
    return '';
  };

  return (
    <div
      className={`relative`}
      style={{
        height: `${cell_size}px`,
        width: `${cell_size}px`,
      }}
      onClick={(e) => {
        e.preventDefault();
        clickCell(row, col);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        flagCell(row, col);
      }}
    >
      <div className='absolute inset-0'>{getCharacter(cell)}</div>
      <div className={`absolute inset-0 ${getBorder(cell)}`}></div>
    </div>
  );
};

export default Cell;
