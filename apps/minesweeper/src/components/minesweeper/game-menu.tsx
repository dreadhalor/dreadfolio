import React, { useEffect, useRef } from 'react';
import { cn } from '@repo/utils';
import Checkmark from '@ms/assets/minesweeper/icons/checked.png';
import {
  useMinesweeper,
  CellType,
  difficultySettings,
} from '@ms/providers/minesweeper-provider';
import { useApp } from '@ms/providers/app-provider';

type GameMenuItemDropdownItemProps = {
  children: React.ReactNode;
  showCheckmark?: boolean;
  onSelected?: () => void;
};
const GameMenuItemDropdownItem = ({
  children,
  showCheckmark = false,
  onSelected = () => {},
}: GameMenuItemDropdownItemProps) => {
  return (
    <div
      className='group flex flex-nowrap items-center pr-[33px] text-[11px] leading-[18px] hover:bg-[rgb(22,96,232)] hover:text-white'
      onClick={(e) => {
        e.stopPropagation();
        onSelected();
      }}
    >
      <span className='flex h-[18px] w-[18px] items-center justify-center'>
        {showCheckmark && (
          <img
            src={Checkmark}
            alt='checked'
            className='h-[7px] w-[7px] group-hover:invert'
          />
        )}
      </span>
      {children}
    </div>
  );
};

const GameMenuItemDropdownSeparator = () => {
  return <div className='mx-px my-[3px] h-[1px] w-full bg-[gray]'></div>;
};

type GameMenuItemDropdownProps = {
  children: React.ReactNode;
  className?: string;
};
const GameMenuItemDropdown = ({
  children,
  className,
}: GameMenuItemDropdownProps) => {
  return (
    <div
      className={cn(
        'absolute left-0 top-full flex flex-col gap-0 border border-solid border-[gray] bg-white p-[2px] text-[11px] leading-[18px] text-[rgb(15,23,42)] shadow-[rgb(100,100,100)_2px_2px_1px]',
        className,
      )}
    >
      {children}
    </div>
  );
};

type GameMenuItemProps = {
  grid: CellType[][];
  menuOpen: boolean;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  reset: (difficulty?: keyof typeof difficultySettings) => void;
  children: React.ReactNode;
};
const GameMenuItem = ({
  grid,
  menuOpen,
  setMenuOpen,
  reset,
  children,
}: GameMenuItemProps) => {
  const menuItemRef = useRef<HTMLDivElement>(null);
  const cols = grid[0]?.length;
  const difficulty =
    cols === 9 ? 'beginner' : cols === 16 ? 'intermediate' : 'expert';

  const { app } = useMinesweeper();
  const { closeApp } = useApp();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuItemRef.current &&
        !menuItemRef.current.contains(e.target as Node)
      )
        setMenuOpen(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [menuItemRef, setMenuOpen]);

  return (
    <div
      ref={menuItemRef}
      onClick={() => setMenuOpen(true)}
      className={cn(
        'z-10 overflow-visible px-[5px] text-[11px] leading-[20px]',
        menuOpen && 'bg-[rgb(22,96,232)] text-white',
      )}
      style={{
        fontFamily:
          '-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {children}
      <GameMenuItemDropdown className={cn(menuOpen ? 'visible' : 'hidden')}>
        <GameMenuItemDropdownItem onSelected={() => reset()}>
          New
        </GameMenuItemDropdownItem>
        <GameMenuItemDropdownSeparator />
        <GameMenuItemDropdownItem
          onSelected={() => reset('beginner')}
          showCheckmark={difficulty === 'beginner'}
        >
          Beginner
        </GameMenuItemDropdownItem>
        <GameMenuItemDropdownItem
          onSelected={() => reset('intermediate')}
          showCheckmark={difficulty === 'intermediate'}
        >
          Intermediate
        </GameMenuItemDropdownItem>
        <GameMenuItemDropdownItem
          onSelected={() => reset('expert')}
          showCheckmark={difficulty === 'expert'}
        >
          Expert
        </GameMenuItemDropdownItem>
        <GameMenuItemDropdownSeparator />
        <GameMenuItemDropdownItem onSelected={() => closeApp(app.id)}>
          Exit
        </GameMenuItemDropdownItem>
      </GameMenuItemDropdown>
    </div>
  );
};

type GameMenuProps = {
  grid: CellType[][];
  menuOpen: boolean;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  reset: (difficulty?: keyof typeof difficultySettings) => void;
};
const GameMenu = ({ menuOpen, setMenuOpen, reset, grid }: GameMenuProps) => {
  return (
    <div className='relative flex h-[20px] items-center bg-[rgb(236,233,216)]'>
      <GameMenuItem
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        reset={reset}
        grid={grid}
      >
        Game
      </GameMenuItem>
    </div>
  );
};

export { GameMenu };
