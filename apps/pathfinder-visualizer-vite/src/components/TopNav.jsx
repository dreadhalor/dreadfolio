import React, { useImperativeHandle, useState } from 'react';
import BasicMenu from './BasicMenu';
import ModeSelect from './ModeSelect';

const TopNav = (
  {
    modeRef,
    solveBFS,
    solveDFS,
    solveAStar,
    clearPath,
    solvedRef,
    generateKruskals,
    generateEllers,
    generateDFS,
    generateHuntAndKill,
    generatePrims,
    generateRecursiveDivision,
    resetWalls,
  },
  ref
) => {
  const [ignore, forceRenderCounter] = useState(0); // eslint-disable-line no-unused-vars
  const forceRender = () => forceRenderCounter((prev_counter) => prev_counter + 1);
  useImperativeHandle(ref, () => ({ forceRender }));

  let maze_options = [
    { title: `Kruskal's Algorithm`, onClick: generateKruskals },
    { title: `Recursive Backtracking`, onClick: generateDFS },
    { title: `Prim's Algorithm`, onClick: generatePrims },
    { title: `Hunt-and-Kill Algorithm`, onClick: generateHuntAndKill },
    { title: `Recursive Division`, onClick: generateRecursiveDivision },
    { title: `Eller's Algorithm`, onClick: generateEllers },
  ];
  let solve_options = [
    { title: `A* Algorithm`, onClick: solveAStar },
    { title: `Dijkstra's Algorithm/BFS`, onClick: solveBFS },
    { title: `Depth-First Search`, onClick: solveDFS },
  ];
  let clear_options = [
    { title: `Clear Path`, onClick: clearPath },
    { title: `Clear Walls`, onClick: () => resetWalls(true) },
  ];

  return (
    <div ref={ref} className='bg-slate-200 flex flex-row overflow-auto px-2'>
      <span className='flex-1'></span>
      <ModeSelect modeRef={modeRef} renderParent={forceRender} />
      <BasicMenu title={'Solve It!'} options={solve_options} />
      <BasicMenu title={'Generate Maze'} options={maze_options} />
      <BasicMenu title={'Clear Map'} options={clear_options} />
      <span className='flex-1'></span>
    </div>
  );
};

export default React.forwardRef(TopNav);
