import '../../Minesweeper.scss';
import DigitDisplay from './DigitDisplay';
import SmileButton from './SmileButton';

const ScoreBar = ({
  mines_remaining,
  seconds_elapsed,
  status,
  reset,
  mousedown,
}) => {
  return (
    <>
      <div className='minesweeper-border-colors-inset flex h-[34px] flex-row items-center justify-between border-2 px-[4px]'>
        <DigitDisplay num={mines_remaining ?? 0} />
        <SmileButton reset={reset} status={status} mousedown={mousedown} />
        <DigitDisplay num={seconds_elapsed ?? 0} />
      </div>
    </>
  );
};

export default ScoreBar;
