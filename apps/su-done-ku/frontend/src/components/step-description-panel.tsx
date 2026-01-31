import { useBoard } from '../providers/board-context';
import { Badge } from 'dread-ui';

const techniqueDescriptions: Record<string, string> = {
  start: 'Puzzle loaded and ready to solve',
  manual: 'Manual candidate entry',
  crosshatch: 'Scanned rows, columns, and boxes to find obvious placements',
  hiddenSingles: 'Found cells where only one candidate is possible',
  nakedPairs: 'Eliminated candidates using locked pairs',
  nakedTriples: 'Eliminated candidates using locked triples',
  hiddenPairs: 'Found hidden pairs to eliminate other candidates',
  hiddenTriples: 'Found hidden triples to eliminate other candidates',
  nakedQuads: 'Eliminated candidates using locked quads',
  hiddenQuads: 'Found hidden quads to eliminate other candidates',
  pointingPairs: 'Used pointing pairs to eliminate candidates',
  pointingTriples: 'Used pointing triples to eliminate candidates',
  boxLineReduction: 'Eliminated candidates using box/line interactions',
  none: 'No techniques found any eliminations',
};

const StepDescriptionPanel = () => {
  const { step, steps, sliderValue } = useBoard();
  
  if (!step || steps.length <= 1) {
    return (
      <div className='text-center text-sm text-slate-500'>
        No steps taken yet. Click "Take Step" to begin solving.
      </div>
    );
  }

  const currentStep = steps[sliderValue];
  const eliminationCount = currentStep?.eliminations?.length || 0;
  const description = techniqueDescriptions[currentStep?.type || 'start'] || 'Unknown technique';

  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-2'>
        <Badge variant='default' className='text-xs'>
          Step {sliderValue} / {steps.length - 1}
        </Badge>
        {currentStep?.type && currentStep.type !== 'start' && (
          <Badge variant='secondary' className='text-xs font-mono'>
            {currentStep.type}
          </Badge>
        )}
      </div>
      
      <p className='text-sm leading-relaxed text-slate-700'>
        {description}
      </p>

      {eliminationCount > 0 && (
        <div className='text-xs text-slate-500'>
          Eliminated {eliminationCount} candidate{eliminationCount !== 1 ? 's' : ''}
        </div>
      )}

      {currentStep?.failedStrategies && currentStep.failedStrategies.length > 0 && (
        <div className='text-xs text-red-600'>
          {currentStep.failedStrategies.length} technique{currentStep.failedStrategies.length !== 1 ? 's' : ''} found nothing
        </div>
      )}
    </div>
  );
};

export { StepDescriptionPanel };
