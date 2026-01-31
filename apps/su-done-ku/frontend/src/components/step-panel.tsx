import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
  Badge,
  BadgeVariants,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Label,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  useAchievements,
} from 'dread-ui';
import { useBoard } from '../providers/board-context';
import { executeStep, strategies } from '../utils';
import { useState } from 'react';
import { cn } from '@repo/utils';
import { Strategy } from '../utils/algorithms';
import { HelpCircle } from 'lucide-react';

type TechniqueInfo = {
  name: string;
  description: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  pattern: string; // ASCII/emoji pattern representation
};

const techniqueInfo: Record<Strategy, TechniqueInfo> = {
  crosshatch: {
    name: 'Crosshatch',
    description: 'Look for cells where only one number can go by scanning rows, columns, and boxes.',
    difficulty: 'basic',
    pattern: '🎯',
  },
  hiddenSingles: {
    name: 'Hidden Singles',
    description: 'Find numbers that can only appear in one cell within a row, column, or box.',
    difficulty: 'basic',
    pattern: '💎',
  },
  nakedPairs: {
    name: 'Naked Pairs',
    description: 'Two cells with only the same two candidates can eliminate those candidates from other cells.',
    difficulty: 'intermediate',
    pattern: '👥',
  },
  nakedTriples: {
    name: 'Naked Triples',
    description: 'Three cells with only the same three candidates eliminate those candidates from others.',
    difficulty: 'intermediate',
    pattern: '🔺',
  },
  hiddenPairs: {
    name: 'Hidden Pairs',
    description: 'Find pairs of numbers that can only appear in two cells, eliminating other candidates.',
    difficulty: 'intermediate',
    pattern: '🔍👥',
  },
  hiddenTriples: {
    name: 'Hidden Triples',
    description: 'Find triples of numbers that can only appear in three cells.',
    difficulty: 'intermediate',
    pattern: '🔍🔺',
  },
  nakedQuads: {
    name: 'Naked Quads',
    description: 'Four cells with only the same four candidates eliminate those from other cells.',
    difficulty: 'advanced',
    pattern: '⬜⬜⬜⬜',
  },
  hiddenQuads: {
    name: 'Hidden Quads',
    description: 'Find quads of numbers that can only appear in four cells.',
    difficulty: 'advanced',
    pattern: '🔍⬜⬜',
  },
  pointingPairs: {
    name: 'Pointing Pairs',
    description: 'If a candidate appears only twice in a box and they\'re in the same row/column, eliminate from that line.',
    difficulty: 'advanced',
    pattern: '➡️👥',
  },
  pointingTriples: {
    name: 'Pointing Triples',
    description: 'Like pointing pairs but with three candidates in a line within a box.',
    difficulty: 'advanced',
    pattern: '➡️🔺',
  },
  boxLineReduction: {
    name: 'Box/Line Reduction',
    description: 'If a candidate in a row/column only appears within one box, eliminate from rest of box.',
    difficulty: 'advanced',
    pattern: '📦➡️',
  },
};

type StepControlProps = {
  id: Strategy;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};
const StepControl = ({
  id,
  checked,
  onCheckedChange,
}: StepControlProps) => {
  const { step, steps } = useBoard();
  const failed = step?.failedStrategies?.includes(id);
  const skipped = step?.skippedStrategies?.includes(id);
  const isActive = step?.type === id;
  
  // Count successes for this strategy across all steps
  const successCount = steps.filter((s) => s.type === id && s.eliminations.length > 0).length;
  
  const info = techniqueInfo[id];

  return (
    <div
      className={cn(
        'group flex flex-col gap-2 rounded-lg border p-3 transition-all cursor-pointer',
        checked 
          ? 'border-blue-200 bg-white shadow-sm hover:shadow-md' 
          : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300',
        isActive && 'ring-2 ring-blue-400 shadow-lg',
        !checked && 'opacity-60',
      )}
      onClick={() => onCheckedChange(!checked)}
    >
      <div className='flex items-center gap-3'>
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={(checked) => {
            if (typeof checked === 'boolean') {
              onCheckedChange(checked);
            }
          }}
          onClick={(e) => e.stopPropagation()}
          className='flex-shrink-0'
        />
        <div className='flex items-center gap-2 flex-1 min-w-0'>
          <span className='text-xl leading-none'>{info.pattern}</span>
          <Label htmlFor={id} className='cursor-pointer text-sm font-semibold text-slate-700'>
            {info.name}
          </Label>
        </div>
        {successCount > 0 && (
          <Badge variant='default' className='text-[10px] px-1.5 py-0.5 bg-green-500'>
            ✓ {successCount}×
          </Badge>
        )}
        {(skipped || failed) && (
          <Badge variant={failed ? 'destructive' : 'secondary'} className='text-[10px] px-1.5 py-0.5'>
            {failed ? '✗ failed' : '⊝ skipped'}
          </Badge>
        )}
      </div>
      <p className='text-[11px] text-slate-500 leading-relaxed pl-8'>{info.description}</p>
    </div>
  );
};

const StepPanel = () => {
  const { step, addStep, isSolved, isErrored, isEditing } = useBoard();
  const { unlockAchievementById } = useAchievements();
  const [strategyStates, setStrategyStates] = useState({
    crosshatch: true,
    hiddenSingles: true,
    nakedPairs: true,
    nakedTriples: true,
    hiddenPairs: true,
    hiddenTriples: true,
    nakedQuads: true,
    hiddenQuads: true,
    pointingPairs: true,
    pointingTriples: true,
    boxLineReduction: true,
  });
  const isNakedLockedSet = (strategy: string) =>
    strategy === 'nakedPairs' ||
    strategy === 'nakedTriples' ||
    strategy === 'nakedQuads';
  const handleStrategyChange = (strategy: Strategy) => (checked: boolean) => {
    setStrategyStates((prev) => ({ ...prev, [strategy]: checked }));
    if (isNakedLockedSet(strategy) && !checked)
      unlockAchievementById('uncheck_naked_pairs', 'su-done-ku');
    if (isNakedLockedSet(strategy) && checked)
      unlockAchievementById('check_naked_pairs', 'su-done-ku');
  };

  const advanceStep = () => {
    // iterate through strategies & execute all checked strategies until one makes an elimination
    const board = executeStep(step!);
    const failedStrategies: Strategy[] = [];
    const skippedStrategies: Strategy[] = [];
    for (const [strategy, checked] of Object.entries(strategyStates)) {
      if (checked) {
        const newStep = strategies[strategy as Strategy](board);
        if (newStep.eliminations.length > 0) {
          switch (newStep.type) {
            case 'crosshatch':
              unlockAchievementById('crosshatching', 'su-done-ku');
              break;
            case 'nakedPairs':
              unlockAchievementById('naked_pair', 'su-done-ku');
              break;
            case 'nakedQuads':
              unlockAchievementById('naked_quad', 'su-done-ku');
              break;
            case 'hiddenPairs':
              unlockAchievementById('hidden_pair', 'su-done-ku');
              break;
            case 'pointingPairs':
            case 'pointingTriples':
              unlockAchievementById('pointing_set', 'su-done-ku');
              break;
            case 'boxLineReduction':
              unlockAchievementById('box_line_reduction', 'su-done-ku');
              break;
          }
          addStep({
            ...newStep,
            failedStrategies,
            skippedStrategies,
          });
          return;
        } else failedStrategies.push(strategy as Strategy);
      } else skippedStrategies.push(strategy as Strategy);
    }
    // if no eliminations are made, execute a step with no eliminations
    addStep({
      type: 'none',
      boardSnapshot: board,
      eliminations: [],
      failedStrategies,
      skippedStrategies,
    });
    unlockAchievementById('stump_solver', 'su-done-ku');
  };

  const basicTechniques: Strategy[] = ['crosshatch', 'hiddenSingles'];
  const intermediateTechniques: Strategy[] = ['nakedPairs', 'nakedTriples', 'hiddenPairs', 'hiddenTriples'];
  const advancedTechniques: Strategy[] = ['nakedQuads', 'hiddenQuads', 'pointingPairs', 'pointingTriples', 'boxLineReduction'];

  return (
    <Card className='w-full shadow-lg'>
      <CardHeader className='text-sm font-semibold text-slate-700'>
        Solving Techniques
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Take Step Button */}
        <Button
          className={cn(
            'w-full rounded-lg text-base font-semibold shadow-sm transition-all',
            isSolved && 'bg-green-500 hover:bg-green-600',
            isErrored && 'bg-red-500 hover:bg-red-600',
            !isSolved && !isErrored && 'bg-blue-600 hover:bg-blue-700',
          )}
          onClick={() => advanceStep()}
          disabled={isSolved || isErrored || isEditing}
          size='lg'
        >
          {isSolved ? '✓ Solved!' : isErrored ? '✗ Error!' : 'Take Step →'}
        </Button>

        {/* Grouped Techniques */}
        <Accordion type='multiple' defaultValue={['basic', 'intermediate', 'advanced']} className='space-y-2'>
          <AccordionItem value='basic' className='rounded-lg border'>
            <AccordionHeader>
              <AccordionTrigger className='px-3 py-2 text-sm font-medium text-slate-700 hover:no-underline'>
                Basic Techniques
              </AccordionTrigger>
            </AccordionHeader>
            <AccordionContent className='space-y-2 p-2'>
              {basicTechniques.map((strategy) => (
                <StepControl
                  key={strategy}
                  id={strategy}
                  checked={strategyStates[strategy]}
                  onCheckedChange={handleStrategyChange(strategy)}
                />
              ))}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value='intermediate' className='rounded-lg border'>
            <AccordionHeader>
              <AccordionTrigger className='px-3 py-2 text-sm font-medium text-slate-700 hover:no-underline'>
                Intermediate Techniques
              </AccordionTrigger>
            </AccordionHeader>
            <AccordionContent className='space-y-2 p-2'>
              {intermediateTechniques.map((strategy) => (
                <StepControl
                  key={strategy}
                  id={strategy}
                  checked={strategyStates[strategy]}
                  onCheckedChange={handleStrategyChange(strategy)}
                />
              ))}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value='advanced' className='rounded-lg border'>
            <AccordionHeader>
              <AccordionTrigger className='px-3 py-2 text-sm font-medium text-slate-700 hover:no-underline'>
                Advanced Techniques
              </AccordionTrigger>
            </AccordionHeader>
            <AccordionContent className='space-y-2 p-2'>
              {advancedTechniques.map((strategy) => (
                <StepControl
                  key={strategy}
                  id={strategy}
                  checked={strategyStates[strategy]}
                  onCheckedChange={handleStrategyChange(strategy)}
                />
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};
export { StepPanel };
