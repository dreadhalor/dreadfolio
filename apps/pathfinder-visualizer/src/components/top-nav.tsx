import React, { useImperativeHandle, useState, ForwardedRef } from 'react';
import { Button, ChevronDown } from 'dread-ui';
import {
  UserMenu,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  useAchievements,
} from 'dread-ui';

interface TopNavProps {
  modeRef: React.MutableRefObject<number>;
  solveBFS: () => void;
  solveDFS: () => void;
  solveAStar: () => void;
  clearPath: () => void;
  generateKruskals: () => void;
  generateEllers: () => void;
  generateDFS: () => void;
  generateHuntAndKill: () => void;
  generatePrims: () => void;
  generateRecursiveDivision: () => void;
  resetWalls: (animate_tiles: boolean) => void;
}

const TopNav = (
  {
    modeRef,
    solveBFS,
    solveDFS,
    solveAStar,
    clearPath,
    generateKruskals,
    generateEllers,
    generateDFS,
    generateHuntAndKill,
    generatePrims,
    generateRecursiveDivision,
    resetWalls,
  }: TopNavProps,
  ref: ForwardedRef<any>,
) => {
  const [, forceRenderCounter] = useState(0); // Use array destructuring to ignore the first item
  const forceRender = () =>
    forceRenderCounter((prevCounter) => prevCounter + 1);
  useImperativeHandle(ref, () => ({ forceRender }));

  const { unlockAchievementById } = useAchievements();

  const mazeOptions = [
    { title: `Kruskal's Algorithm`, onClick: generateKruskals },
    { title: `Recursive Backtracking`, onClick: generateDFS },
    { title: `Prim's Algorithm`, onClick: generatePrims },
    { title: `Hunt-and-Kill Algorithm`, onClick: generateHuntAndKill },
    { title: `Recursive Division`, onClick: generateRecursiveDivision },
    { title: `Eller's Algorithm`, onClick: generateEllers },
  ];

  const solveOptions = [
    { title: `A* Algorithm`, onClick: solveAStar },
    { title: `Dijkstra's Algorithm/BFS`, onClick: solveBFS },
    { title: `Depth-First Search`, onClick: solveDFS },
  ];

  const clearOptions = [
    { title: `Clear Path`, onClick: clearPath },
    {
      title: `Clear Walls`,
      onClick: () => {
        unlockAchievementById('clear_walls', 'pathfinder-visualizer');
        resetWalls(true);
      },
    },
  ];

  const handleChange = (value: string) => {
    modeRef.current = Number(value);
    forceRender();
  };

  return (
    <div
      ref={ref}
      className='flex flex-row items-center gap-2 overflow-auto bg-slate-200 px-2 py-1'
    >
      <span className='flex-1'></span>
      <Select value={`${modeRef.current}`} onValueChange={handleChange}>
        <SelectTrigger className='w-[90px] shrink-0'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='1'>Start</SelectItem>
          <SelectItem value='2'>End</SelectItem>
          <SelectItem value='3'>Wall</SelectItem>
        </SelectContent>
      </Select>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='secondary' className='gap-1 rounded-lg pr-2'>
            Solve It!
            <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {solveOptions.map((option, index) => (
            <DropdownMenuItem key={index} onClick={option.onClick}>
              {option.title}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='secondary' className='gap-1 rounded-lg pr-2'>
            Generate Maze
            <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {mazeOptions.map((option, index) => (
            <DropdownMenuItem key={index} onClick={option.onClick}>
              {option.title}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='secondary' className='gap-1 rounded-lg pr-2'>
            Clear Map
            <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {clearOptions.map((option, index) => (
            <DropdownMenuItem key={index} onClick={option.onClick}>
              {option.title}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <span className='flex-1'></span>
      <UserMenu className='h-9 w-9' />
    </div>
  );
};

export default React.forwardRef(TopNav);
