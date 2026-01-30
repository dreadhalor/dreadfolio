import { Tabs, TabsList, TabsTrigger } from 'dread-ui';
import { useBoard } from '../providers/board-context';

const PreviewToggle = () => {
  const { showPreview, setShowPreview, isEditing } = useBoard();
  return (
    <Tabs
      variant='pills'
      value={showPreview ? 'changes' : 'board'}
      onValueChange={(val) => setShowPreview(val === 'changes')}
    >
      <TabsList className='grid w-full grid-cols-2'>
        <TabsTrigger disabled={isEditing} value='board'>
          Board
        </TabsTrigger>
        <TabsTrigger disabled={isEditing} value='changes'>
          Changes
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export { PreviewToggle };
