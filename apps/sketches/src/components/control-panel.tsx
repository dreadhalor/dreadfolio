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
  Slider,
  Label,
  Checkbox,
} from 'dread-ui';
import { cn } from '@repo/utils';
import { useState } from 'react';

type ControlPanelProps = {
  fps: number;
  sketch: string;
  loadSketch: (sketch: string) => void;
  distanceField: number;
  setDistanceField: (distanceField: number) => void;
  showMetaballs: boolean;
  setShowMetaballs: (show: boolean) => void;
  showMetaballGrid: boolean;
  setShowMetaballGrid: (show: boolean) => void;
  showMetaballValues: boolean;
  setShowMetaballValues: (show: boolean) => void;
  metaballSquareSize: number;
  setMetaballSquareSize: (size: number) => void;
  linearInterpolation: boolean;
  setLinearInterpolation: (use: boolean) => void;
  metaballCount: number;
  setMetaballCount: (count: number) => void;
  metaballSize: number;
  setMetaballSize: (size: number) => void;
};
const ControlPanel = ({
  fps,
  sketch,
  loadSketch,
  distanceField,
  setDistanceField,
  showMetaballs,
  setShowMetaballs,
  showMetaballGrid,
  setShowMetaballGrid,
  showMetaballValues,
  setShowMetaballValues,
  metaballSquareSize,
  setMetaballSquareSize,
  linearInterpolation,
  setLinearInterpolation,
  metaballCount,
  setMetaballCount,
  metaballSize,
  setMetaballSize,
}: ControlPanelProps) => {
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
              {sketch === 'metaballs' && (
                <div className='mt-2 flex flex-col gap-2'>
                  <div className='mt-2 flex flex-col items-start justify-center gap-2'>
                    <Label htmlFor='distance-field-slider'>
                      Distance field: {distanceField}
                    </Label>
                    <Slider
                      id='distance-field-slider'
                      min={0}
                      max={100}
                      step={1}
                      value={[distanceField]}
                      onValueChange={(v) => setDistanceField(v[0]!)}
                    />
                  </div>
                  <div className='mt-2 flex flex-col items-start justify-center gap-2'>
                    <Label htmlFor='metaball-size-slider'>
                      Metaball size: {metaballSize}
                    </Label>
                    <Slider
                      id='metaball-size-slider'
                      min={10}
                      max={300}
                      step={1}
                      value={[metaballSize]}
                      onValueChange={(v) => setMetaballSize(v[0]!)}
                    />
                  </div>
                  <div className='mt-2 flex flex-col items-start justify-center gap-2'>
                    <Label htmlFor='grid-size-slider'>
                      Grid size: {metaballSquareSize}
                    </Label>
                    <Slider
                      id='grid-size-slider'
                      min={15}
                      max={100}
                      step={1}
                      value={[metaballSquareSize]}
                      onValueChange={(v) => setMetaballSquareSize(v[0]!)}
                    />
                  </div>
                  <div className='mt-2 flex flex-col items-start justify-center gap-2'>
                    <Label htmlFor='metaball-count-slider'>
                      Metaballs: {metaballCount}
                    </Label>
                    <Slider
                      id='metaball-count-slider'
                      min={1}
                      max={6}
                      step={1}
                      value={[metaballCount]}
                      onValueChange={(v) => setMetaballCount(v[0]!)}
                    />
                  </div>
                  <div className='mt-2 flex items-center justify-start gap-2 pr-3'>
                    <Checkbox
                      id='showMetaballs'
                      checked={showMetaballs}
                      onCheckedChange={setShowMetaballs}
                    />
                    <Label htmlFor='showMetaballs'>Show metaballs</Label>
                  </div>
                  <div className='mt-2 flex items-center justify-start gap-2 pr-3'>
                    <Checkbox
                      id='showGrid'
                      checked={showMetaballGrid}
                      onCheckedChange={setShowMetaballGrid}
                    />
                    <Label htmlFor='showGrid'>Show grid</Label>
                  </div>
                  <div className='mt-2 flex items-center justify-start gap-2 pr-3'>
                    <Checkbox
                      id='showValues'
                      checked={showMetaballValues}
                      onCheckedChange={setShowMetaballValues}
                    />
                    <Label htmlFor='showValues'>Show values</Label>
                  </div>
                  <div className='mt-2 flex items-center justify-start gap-2 pr-3'>
                    <Checkbox
                      id='linearInterpolation'
                      checked={linearInterpolation}
                      onCheckedChange={setLinearInterpolation}
                    />
                    <Label htmlFor='linearInterpolation'>
                      Use linear interpolation
                    </Label>
                  </div>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export { ControlPanel };
