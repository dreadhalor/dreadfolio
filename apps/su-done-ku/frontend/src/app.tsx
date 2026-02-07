import { Card, CardContent, CardHeader, UserMenu } from 'dread-ui';
import { useEffect } from 'react';
import { Step, createEmptyBoard } from './utils';
import { StepPanel } from './components/step-panel';
import { useBoard } from './providers/board-context';
import { CellGrid } from './components/cell-grid';
import { PreviewToggle } from './components/preview-toggle';
import { HistorySlider } from './components/history-slider';
import { GeneratePuzzleButton } from './components/generate-puzzle-button';
import { ImportPuzzleButton } from './components/import-puzzle-button';
import { StepDescriptionPanel } from './components/step-description-panel';
import { SuccessCelebration } from './components/success-celebration';

// create a sudoku board with a 9x9 grid of cells, where each cell is a 3x3 grid of cells containing numbers 1-9
function App() {
  const { resetSteps, addStep } = useBoard();

  useEffect(() => {
    // Initialize empty board on mount (intentionally run once)
    const initStep: Step = {
      type: 'start',
      boardSnapshot: JSON.parse(JSON.stringify(createEmptyBoard())),
      eliminations: [],
    };
    resetSteps();
    addStep(initStep);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- Only run on mount to initialize board

  return (
    <div className='flex min-h-screen w-full flex-col bg-slate-100'>
      {/* Top Toolbar */}
      <div className='border-b bg-white/95 shadow-sm'>
        <div className='mx-auto flex max-w-[1600px] items-center justify-between px-4 py-4 sm:px-6'>
          <div className='flex items-center gap-2 sm:gap-3'>
            <div className='text-xl font-bold text-blue-600 sm:text-2xl'>
              Su-Done-Ku
            </div>
            <div className='hidden text-sm text-slate-500 sm:block'>
              Sudoku Solver & Helper
            </div>
          </div>
          <div className='flex items-center gap-3'>
            <UserMenu className='h-9 w-9 sm:h-10 sm:w-10' />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-4 p-4 sm:p-6 lg:flex-row lg:gap-6'>
        {/* Left Column - Board */}
        <div className='flex flex-1 flex-col gap-4'>
          <Card className='shadow-lg'>
            <CardContent noHeader className='p-3 sm:p-4'>
              <PreviewToggle />
            </CardContent>
          </Card>

          <Card className='shadow-lg'>
            <CardContent noHeader className='overflow-x-auto p-3 sm:p-6'>
              <div className='mx-auto w-fit'>
                <CellGrid />
              </div>
            </CardContent>
          </Card>

          <Card className='shadow-lg'>
            <CardHeader className='text-sm font-semibold text-slate-700'>
              History
            </CardHeader>
            <CardContent className='px-4 pb-4 sm:px-6'>
              <HistorySlider />
            </CardContent>
          </Card>

          {/* Color Legend */}
          <Card className='shadow-lg'>
            <CardHeader className='text-sm font-semibold text-slate-700'>
              Color Guide
            </CardHeader>
            <CardContent className='space-y-2 text-sm'>
              <div className='flex items-center gap-2'>
                <div className='h-4 w-4 flex-shrink-0 rounded bg-red-200' />
                <span>Eliminated candidates</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='h-4 w-4 flex-shrink-0 rounded bg-green-200' />
                <span>Reference cells (logic source)</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='h-4 w-4 flex-shrink-0 rounded bg-blue-400' />
                <span>Recently added</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='h-4 w-4 flex-shrink-0 rounded bg-red-500' />
                <span>Error (no valid candidates)</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Controls */}
        <div className='flex w-full flex-col gap-4 lg:w-[380px] xl:w-[420px]'>
          {/* Puzzle Input */}
          <Card className='shadow-lg'>
            <CardHeader className='text-sm font-semibold text-slate-700'>
              Puzzle Input
            </CardHeader>
            <CardContent className='flex gap-2'>
              <div className='flex-1'>
                <ImportPuzzleButton />
              </div>
              <div className='flex-1'>
                <GeneratePuzzleButton />
              </div>
            </CardContent>
          </Card>

          {/* Step Panel */}
          <StepPanel />

          {/* Step Description */}
          <Card className='shadow-lg'>
            <CardHeader className='text-sm font-semibold text-slate-700'>
              Last Step
            </CardHeader>
            <CardContent>
              <StepDescriptionPanel />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Celebration */}
      <SuccessCelebration />
    </div>
  );
}

export { App };
