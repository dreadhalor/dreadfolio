import { ReactP5Wrapper } from '@p5-wrapper/react';
import { Cubes, Sand, Waves, MarchingSquares } from './sketches';
import { useRef, useState } from 'react';
import { throttle } from 'lodash';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionHeader,
  Card,
  CardContent,
  AccordionContent,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from 'dread-ui';
import { cn } from '@repo/utils';

type Sketches = 'sand' | 'waves' | 'cubes' | 'marching-squares';

const App = () => {
  const [fps, setFps] = useState(60);
  const throttledSetFps = useRef(throttle(setFps, 100));
  const [sketch, setSketch] = useState<Sketches>('marching-squares');
  const [selectOpen, setSelectOpen] = useState(false);

  const loadSketch = (sketch: string) => {
    setSketch(sketch as Sketches);
  };

  const getSketch = () => {
    switch (sketch) {
      case 'sand':
        return Sand;
      case 'waves':
        return Waves;
      case 'cubes':
        return Cubes;
      case 'marching-squares':
        return MarchingSquares;
      default:
        return Sand;
    }
  };

  return (
    <>
      <Card
        className={cn(
          'pointer-events-none fixed left-2 top-2 select-none p-0 opacity-50 transition-[opacity] hover:opacity-100',
          selectOpen && 'opacity-100',
        )}
      >
        <CardContent
          noHeader
          className='w-[180px] items-center justify-center p-0'
        >
          <Accordion
            className='pointer-events-auto w-full p-0'
            type='single'
            defaultValue='sketches'
            collapsible
          >
            <AccordionItem value='sketches' className='w-full border-none'>
              <AccordionHeader className='w-full'>
                <AccordionTrigger className='px-2'>
                  <span className='mx-auto'>
                    FPS: {fps.toFixed(2) ?? 'N/A'}
                  </span>
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionContent className='p-2 pt-0'>
                <Select
                  value={sketch}
                  onValueChange={(value) => loadSketch(value)}
                  open={selectOpen}
                  onOpenChange={setSelectOpen}
                >
                  <SelectTrigger className='px-4'>
                    <span>Sketch: {sketch}</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='sand'>Sand</SelectItem>
                    <SelectItem value='waves'>Waves</SelectItem>
                    <SelectItem value='cubes'>Cubes</SelectItem>
                    <SelectItem value='marching-squares'>
                      Marching Squares
                    </SelectItem>
                  </SelectContent>
                </Select>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
      <ReactP5Wrapper sketch={getSketch()} setFps={throttledSetFps.current} />
    </>
  );
};

export { App };
