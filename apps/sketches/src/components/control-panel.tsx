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
import { useState } from 'react';

type ControlPanelProps = {
  fps: number;
  sketch: string;
  loadSketch: (sketch: string) => void;
};
const ControlPanel = ({ fps, sketch, loadSketch }: ControlPanelProps) => {
  const [selectOpen, setSelectOpen] = useState(false);

  return (
    <Card
      className={cn(
        'pointer-events-none fixed left-2 top-2 select-none p-0 opacity-50 transition-[opacity] hover:opacity-100',
        selectOpen && 'opacity-100',
      )}
    >
      <CardContent
        noHeader
        className='w-[220px] items-center justify-center p-0'
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
                <span className='mx-auto'>FPS: {fps.toFixed(2) ?? 'N/A'}</span>
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
                  <SelectItem value='metaballs'>Metaballs</SelectItem>
                </SelectContent>
              </Select>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export { ControlPanel };
