import { Accordion } from '@base-ui/react/accordion';
import { Checkbox } from '@base-ui/react/checkbox';
import { Select } from '@base-ui/react/select';
import { Slider } from '@base-ui/react/slider';
import clsx from 'clsx';
import { Check, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { sketches, type SketchKey } from '../sketches';

/* The sketches, as the picker lists them. */
const ITEMS = Object.entries(sketches).map(([value, { name }]) => ({ value: value as SketchKey, label: name }));

/* The keyboard focus ring. */
const FOCUS = 'outline-none focus-visible:ring-2 focus-visible:ring-white/70';

type ControlPanelProps = {
  fps?: number;
  sketch: SketchKey;
  loadSketch: (sketch: SketchKey) => void;
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

/* A labelled slider, its value beside its name. */
const Setting = ({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) => (
  <Slider.Root value={value} onValueChange={(v) => onChange(v)} min={min} max={max} step={1} className='flex flex-col gap-1.5'>
    <div className='flex items-center justify-between text-xs'>
      <Slider.Label className='text-white/70'>{label}</Slider.Label>
      <Slider.Value className='tabular-nums' />
    </div>
    <Slider.Control className='flex h-4 cursor-pointer touch-none items-center select-none'>
      <Slider.Track className='h-1 w-full rounded-full bg-white/20'>
        <Slider.Indicator className='rounded-full bg-[#ed225d]' />
        <Slider.Thumb className={clsx('size-3.5 rounded-full bg-white shadow', FOCUS)} />
      </Slider.Track>
    </Slider.Control>
  </Slider.Root>
);

/* A labelled checkbox. */
const Toggle = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) => (
  <label className='flex cursor-pointer items-center gap-2 text-xs select-none'>
    <Checkbox.Root
      checked={checked}
      onCheckedChange={(c) => onChange(c)}
      className={clsx('flex size-4 items-center justify-center rounded border border-white/40 data-[checked]:border-[#ed225d] data-[checked]:bg-[#ed225d]', FOCUS)}
    >
      <Checkbox.Indicator>
        <Check size={12} strokeWidth={3} />
      </Checkbox.Indicator>
    </Checkbox.Root>
    {label}
  </label>
);

/**
 * The sketches' panel, top left: the frame rate, the sketch picker, and (for Metaballs) its
 * settings. Faded until you reach for it, so the sketch has the screen.
 */
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
    <div
      className={clsx(
        'fixed top-2 left-2 z-10 w-[232px] rounded-lg border border-white/10 bg-neutral-900/75 text-sm text-neutral-100 shadow-lg backdrop-blur transition-opacity select-none',
        'opacity-50 hover:opacity-100 focus-within:opacity-100',
        selectOpen && 'opacity-100',
      )}
    >
      <Accordion.Root defaultValue={['sketches']}>
        <Accordion.Item value='sketches'>
          <Accordion.Header>
            <Accordion.Trigger className={clsx('group flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-2', FOCUS)}>
              <span className='tabular-nums'>FPS: {fps === undefined ? 'N/A' : fps.toFixed(0)}</span>
              <ChevronDown size={14} className='opacity-60 transition-transform group-data-[panel-open]:rotate-180' />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel className='flex flex-col gap-3 px-2 pb-2'>
            <Select.Root value={sketch} onValueChange={(v) => v !== null && loadSketch(v)} items={ITEMS} open={selectOpen} onOpenChange={setSelectOpen}>
              <Select.Trigger className={clsx('flex h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-white/15 bg-white/5 px-3 hover:bg-white/10', FOCUS)}>
                <span className='truncate'>
                  Sketch: <Select.Value />
                </span>
                <Select.Icon>
                  <ChevronsUpDown size={14} className='opacity-60' />
                </Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Positioner sideOffset={4} alignItemWithTrigger={false} className='z-50 outline-none'>
                  <Select.Popup
                    className={clsx(
                      'max-h-[min(var(--available-height),24rem)] min-w-[var(--anchor-width)] origin-[var(--transform-origin)] overflow-y-auto rounded-md border border-white/10 bg-neutral-900 py-1 text-sm text-neutral-100 shadow-xl outline-none',
                      'transition-[scale,opacity] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
                    )}
                  >
                    <Select.List>
                      {ITEMS.map((item) => (
                        <Select.Item
                          key={item.value}
                          value={item.value}
                          className='relative mx-1 flex cursor-pointer items-center rounded-sm py-1.5 pr-8 pl-2 outline-none select-none data-[highlighted]:bg-white/10'
                        >
                          <Select.ItemText>{item.label}</Select.ItemText>
                          <Select.ItemIndicator className='absolute right-2'>
                            <Check size={14} />
                          </Select.ItemIndicator>
                        </Select.Item>
                      ))}
                    </Select.List>
                  </Select.Popup>
                </Select.Positioner>
              </Select.Portal>
            </Select.Root>
            {sketch === 'metaballs' && (
              <div className='flex flex-col gap-3 pt-1'>
                <Setting label='Distance field' value={distanceField} min={0} max={100} onChange={setDistanceField} />
                <Setting label='Metaball size' value={metaballSize} min={10} max={300} onChange={setMetaballSize} />
                <Setting label='Grid size' value={metaballSquareSize} min={15} max={100} onChange={setMetaballSquareSize} />
                <Setting label='Metaballs' value={metaballCount} min={1} max={6} onChange={setMetaballCount} />
                <div className='flex flex-col gap-2 pt-1'>
                  <Toggle label='Show metaballs' checked={showMetaballs} onChange={setShowMetaballs} />
                  <Toggle label='Show grid' checked={showMetaballGrid} onChange={setShowMetaballGrid} />
                  <Toggle label='Show values' checked={showMetaballValues} onChange={setShowMetaballValues} />
                  <Toggle label='Use linear interpolation' checked={linearInterpolation} onChange={setLinearInterpolation} />
                </div>
              </div>
            )}
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
    </div>
  );
};

export { ControlPanel };
