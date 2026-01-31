import { Slider, useAchievements, Badge } from 'dread-ui';
import { useBoard } from '../providers/board-context';
import { Fragment } from 'react';
import { cn } from '@repo/utils';

const HistorySlider = () => {
  const { setStep, steps, sliderValue, setSliderValue, isEditing } = useBoard();
  const { unlockAchievementById } = useAchievements();
  
  if (steps.length <= 1) {
    return (
      <div className='flex items-center justify-center py-4 text-sm text-slate-400'>
        No history yet
      </div>
    );
  }
  
  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between text-xs text-slate-600'>
        <span>Step {sliderValue} of {steps.length - 1}</span>
        {steps.length > 1 && (
          <Badge variant='secondary' className='text-xs'>
            {steps.length - 1} step{steps.length - 1 !== 1 ? 's' : ''} taken
          </Badge>
        )}
      </div>
      <div className='relative py-2'>
        {steps.map((_step, index) => {
          const type = _step.type;
          const tickWidth = 3;
          const thumbWidth = 20;
          const percent = (index / (steps.length - 1)) * 100;
          const thumbOffset =
            (percent / 100) * thumbWidth - thumbWidth / 2 + tickWidth / 2;
          return (
            <Fragment key={index}>
              <div
                className={cn(
                  'history-slider-tick absolute left-0 top-0 h-full rounded-full',
                  type === 'manual' ? 'bg-blue-400' : 'bg-slate-300',
                  index === sliderValue && 'scale-125 bg-blue-500',
                )}
                style={{
                  width: tickWidth,
                  left: `calc(${percent}% - ${thumbOffset}px)`,
                }}
              />
              <div className='absolute left-0 top-1/2 h-2 w-full -translate-y-1/2 bg-slate-100 rounded-full' />
            </Fragment>
          );
        })}
        <Slider
          disabled={steps.length <= 1 || isEditing}
          className='relative w-auto'
          min={0}
          max={steps.length - 1}
          value={[sliderValue]}
          onValueChange={(e) => {
            const stepIndex = e[0]!;
            const _step = steps[stepIndex]!;
            setSliderValue((prev) => {
              if (prev < stepIndex)
                unlockAchievementById('fast_forward', 'su-done-ku');
              return stepIndex;
            });
            setStep(_step);
          }}
        />
      </div>
    </div>
  );
};

export { HistorySlider };
