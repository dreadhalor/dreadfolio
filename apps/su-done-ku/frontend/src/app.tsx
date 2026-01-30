import { Card, CardContent, UserMenu } from 'dread-ui';
import { useEffect } from 'react';
import { Step, createEmptyBoard } from './utils';
import { StepPanel } from './components/step-panel';
import { useBoard } from './providers/board-context';
import { CellGrid } from './components/cell-grid';
import { PreviewToggle } from './components/preview-toggle';
import { HistorySlider } from './components/history-slider';
import { GeneratePuzzleButton } from './components/generate-puzzle-button';
import { ImportPuzzleButton } from './components/import-puzzle-button';

// create a sudoku board with a 9x9 grid of cells, where each cell is a 3x3 grid of cells containing numbers 1-9
function App() {
  const { resetSteps, addStep } = useBoard();

  useEffect(() => {
    const initStep: Step = {
      type: 'start',
      boardSnapshot: JSON.parse(JSON.stringify(createEmptyBoard())),
      eliminations: [],
    };
    resetSteps();
    addStep(initStep);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className='flex h-full w-full items-center justify-center gap-4 text-black'>
      <div className='flex flex-col gap-2'>
        <PreviewToggle />
        <CellGrid />
        <Card>
          <CardContent noHeader className='p-1 px-2'>
            <HistorySlider />
          </CardContent>
        </Card>
      </div>
      <div className='flex flex-col gap-4'>
        {/* <LoadExamplePuzzleButton /> */}
        <div className='flex w-full flex-nowrap gap-4'>
          <Card className='my-auto flex flex-1 items-center'>
            <CardContent noHeader className='flex flex-1 p-1'>
              <ImportPuzzleButton />
            </CardContent>
          </Card>
          <UserMenu className='h-12 w-12' />
        </div>

        <Card>
          <CardContent noHeader className='flex p-1'>
            <GeneratePuzzleButton />
          </CardContent>
        </Card>
        <StepPanel />
      </div>
    </div>
  );
}

export { App };
