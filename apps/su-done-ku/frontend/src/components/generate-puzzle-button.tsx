import {
  Button,
  ChevronDown,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from 'dread-ui';
import { useBoard } from '../providers/board-context';
const GeneratePuzzleButton = () => {
  const { generatePuzzleWithApi } = useBoard();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className='w-full rounded-lg'>
          <span className='ml-auto'>Generate Puzzle</span>
          <ChevronDown className='ml-auto' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='dropdown-menu-content'>
        <DropdownMenuItem
          onClick={() => {
            generatePuzzleWithApi('easy');
          }}
        >
          Easy
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            generatePuzzleWithApi('medium');
          }}
        >
          Medium
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            generatePuzzleWithApi('hard');
          }}
        >
          Hard
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { GeneratePuzzleButton };
