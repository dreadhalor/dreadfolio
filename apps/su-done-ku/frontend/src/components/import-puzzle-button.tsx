import { Button } from 'dread-ui';
import { useBoard } from '../providers/board-context';
import { X, FileInput, Play } from 'lucide-react';

const ImportPuzzleButton = () => {
  const { isEditing, setIsEditing, loadEditingPuzzle } = useBoard();
  return (
    <div className='flex w-full flex-nowrap gap-2'>
      <Button
        onClick={() => {
          if (isEditing) loadEditingPuzzle();
          else setIsEditing((prev) => !prev);
        }}
        className='flex-1 rounded-lg shadow-sm'
        variant={isEditing ? 'default' : 'outline'}
      >
        {isEditing ? (
          <>
            <Play className='mr-2 h-4 w-4' />
            Begin Solving
          </>
        ) : (
          <>
            <FileInput className='mr-2 h-4 w-4' />
            Import
          </>
        )}
      </Button>
      {isEditing && (
        <Button
          variant='ghost'
          className='rounded-lg px-3'
          onClick={() => setIsEditing(false)}
        >
          <X className='h-4 w-4' />
        </Button>
      )}
    </div>
  );
};

export { ImportPuzzleButton };
