import { Button } from 'dread-ui';
import { useBoard } from '../providers/board-context';
import { GrFormClose } from 'react-icons/gr';

const ImportPuzzleButton = () => {
  const { isEditing, setIsEditing, loadEditingPuzzle } = useBoard();
  return (
    <div className='flex w-full flex-nowrap'>
      <Button
        onClick={() => {
          if (isEditing) loadEditingPuzzle();
          else setIsEditing((prev) => !prev);
        }}
        className='w-full flex-1 rounded-lg'
      >
        {isEditing ? 'Begin Solving' : 'Import Puzzle'}
      </Button>
      {isEditing && (
        <Button
          variant='ghost'
          className='rounded-md px-0'
          onClick={() => setIsEditing(false)}
        >
          <GrFormClose size={24} />
        </Button>
      )}
    </div>
  );
};

export { ImportPuzzleButton };
