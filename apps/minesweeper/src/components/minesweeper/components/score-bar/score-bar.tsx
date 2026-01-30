import React from 'react';
import '../../minesweeper.scss';
import DigitDisplay from './digit-display';
import SmileButton from './smile-button';
import { difficultySettings } from '@ms/providers/minesweeper-provider';

interface ScoreBarProps {
  mines_remaining: number;
  seconds_elapsed: number;
  status: 'new' | 'started' | 'won' | 'lost';
  reset: (difficulty?: keyof typeof difficultySettings) => void;
  mousedown: boolean;
}

const ScoreBar: React.FC<ScoreBarProps> = ({
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
