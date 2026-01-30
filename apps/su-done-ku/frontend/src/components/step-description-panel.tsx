import { useBoard } from '../providers/board-context';

const StepDescriptionPanel = () => {
  const { steps } = useBoard();
  return (
    <div className='shrink-1 h-24 min-w-0 overflow-auto rounded-md bg-white'>
      {
        <div className='flex flex-col gap-2 p-2'>
          <h2 className='text-lg font-bold'>Steps</h2>
          <div className='flex flex-col gap-2 overflow-y-auto'>
            {steps.map((_step, index) => (
              <div key={index} className='flex flex-col gap-2'>
                <span className='text-sm font-bold'>{_step.type}</span>
                {/* <span className='text-xs'>{formatCrosshatch(step)}</span>
                <span className='text-xs'>{formatHiddenSingles(step)}</span> */}
              </div>
            ))}
          </div>
        </div>
      }
    </div>
  );
};

export { StepDescriptionPanel };
