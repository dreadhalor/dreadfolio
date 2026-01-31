import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from 'dread-ui';
import { useBoard } from '../providers/board-context';
import { Sparkles, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@repo/utils';

const GeneratePuzzleButton = () => {
  const { generatePuzzleWithApi, isGenerating } = useBoard();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button 
          type="button" 
          className='w-full rounded-lg shadow-sm' 
          variant='outline'
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className='mr-2 h-4 w-4' />
              Generate
              <ChevronDown className='ml-2 h-4 w-4' />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-full'>
        <DropdownMenuItem
          onSelect={() => generatePuzzleWithApi('easy')}
        >
          <span className='font-medium'>Easy</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => generatePuzzleWithApi('medium')}
        >
          <span className='font-medium'>Medium</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => generatePuzzleWithApi('hard')}
        >
          <span className='font-medium'>Hard</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { GeneratePuzzleButton };
