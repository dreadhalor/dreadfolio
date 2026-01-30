import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'dread-ui';
import { StepKey, steps, useIntro } from '@frontend/providers/intro-provider';
import { SketchKey, sketches } from '@repo/sketches';

const Controls = () => {
  const {
    animateTitle,
    setAnimateTitle,
    shrinkBackground,
    setShrinkBackground,
    retractBackground,
    setRetractBackground,
    shrinkForeground,
    setShrinkForeground,
    retractForeground,
    setRetractForeground,
    swapLayers,
    setSwapLayers,
    sketch1,
    sketch2,
    setSketch1,
    setSketch2,
    step,
    setStep,
    startAnimating,
    setStartAnimating,
  } = useIntro();

  const setStepTypesafe = (value: string) => {
    if (steps.map(({ key }) => key).includes(value as StepKey)) {
      setStep(value as StepKey);
    }
  };
  const setSketch1Typesafe = (value: string) => {
    if (value in sketches) setSketch1(value as SketchKey);
    else setSketch1(null);
  };
  const setSketch2Typesafe = (value: string) => {
    if (value in sketches) setSketch2(value as SketchKey);
    else setSketch2(null);
  };

  return (
    <div className='absolute inset-x-0 z-20 overflow-auto'>
      <div className='flex min-w-max gap-2'>
        <Button
          variant={startAnimating ? 'default' : 'secondary'}
          onClick={() => setStartAnimating((prev) => !prev)}
        >
          Start Animating
        </Button>
        <Select value={step} onValueChange={setStepTypesafe}>
          <SelectTrigger className='w-[180px] text-black'>
            <SelectValue>Step: {step}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {steps.map(({ key }) => (
              <SelectItem key={key} value={key}>
                {key}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant={animateTitle ? 'default' : 'secondary'}
          onClick={() => setAnimateTitle((prev) => !prev)}
        >
          Animate Title
        </Button>
        <div className='flex flex-col gap-2'>
          <Button
            variant={shrinkForeground ? 'default' : 'secondary'}
            onClick={() => setShrinkForeground((prev) => !prev)}
          >
            Shrink Foreground
          </Button>
          <Button
            variant={retractForeground ? 'default' : 'secondary'}
            onClick={() => setRetractForeground((prev) => !prev)}
          >
            Retract Foreground
          </Button>
        </div>
        <div className='flex flex-col gap-2'>
          <Button
            variant={shrinkBackground ? 'default' : 'secondary'}
            onClick={() => setShrinkBackground((prev) => !prev)}
          >
            Shrink Background
          </Button>
          <Button
            variant={retractBackground ? 'default' : 'secondary'}
            onClick={() => setRetractBackground((prev) => !prev)}
          >
            Retract Background
          </Button>
        </div>
        <Button
          variant={swapLayers ? 'default' : 'secondary'}
          onClick={() => setSwapLayers((prev) => !prev)}
        >
          Swap Layers
        </Button>
        <Select value={sketch2 as string} onValueChange={setSketch2Typesafe}>
          <SelectTrigger className='w-[220px] text-black'>
            <SelectValue>Front: {sketch2}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='_'>None</SelectItem>
            {Object.entries(sketches).map(([key, { name }]) => (
              <SelectItem key={key} value={key}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sketch1 as string} onValueChange={setSketch1Typesafe}>
          <SelectTrigger className='w-[220px] text-black'>
            <SelectValue>Back: {sketch1}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='_'>None</SelectItem>
            {Object.entries(sketches).map(([key, { name }]) => (
              <SelectItem key={key} value={key}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export { Controls };
