import { Slider, useAchievements } from 'dread-ui';
import { useBoard } from '../providers/board-context';
import { Fragment } from 'react';
import { cn } from '@repo/utils';

const HistorySlider = () => {
  const { setStep, steps, sliderValue, setSliderValue, isEditing } = useBoard();
  const { unlockAchievementById } = useAchievements();
  return (
    <div className='relative py-2'>
      {steps.length > 1 &&
        steps.map((_step, index) => {
          const type = _step.type;
          const tickWidth = 2;
          const thumbWidth = 16;
          const percent = (index / (steps.length - 1)) * 100;
          const thumbOffset =
            (percent / 100) * thumbWidth - thumbWidth / 2 + tickWidth / 2;
          return (
            <Fragment key={index}>
              <div
                key={index}
                className={cn(
                  'bg-primary/20 absolute left-0 top-0 h-full rounded-full',
                  type === 'manual' && 'bg-primary/60',
                )}
                style={{
                  width: tickWidth,
                  left: `calc(${percent}% - ${thumbOffset}px)`,
                }}
              />
              <div className='absolute left-0 top-1/2 h-2 w-full -translate-y-1/2 bg-white' />
            </Fragment>
          );
        })}
      <Slider
        disabled={steps.length <= 1 || isEditing}
        className='w-auto'
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
  );
};

export { HistorySlider };
