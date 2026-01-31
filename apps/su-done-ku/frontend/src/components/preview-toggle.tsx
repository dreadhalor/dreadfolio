import { Tabs, TabsList, TabsTrigger } from 'dread-ui';
import { useBoard } from '../providers/board-context';
import { Grid3x3, Sparkle } from 'lucide-react';

const PreviewToggle = () => {
  const { showPreview, setShowPreview, isEditing } = useBoard();
  return (
    <Tabs
      variant='pills'
      value={showPreview ? 'changes' : 'board'}
      onValueChange={(val) => setShowPreview(val === 'changes')}
    >
      <TabsList className='grid w-full grid-cols-2 bg-slate-100'>
        <TabsTrigger disabled={isEditing} value='board' className='gap-2'>
          <Grid3x3 className='h-4 w-4' />
          Board
        </TabsTrigger>
        <TabsTrigger disabled={isEditing} value='changes' className='gap-2'>
          <Sparkle className='h-4 w-4' />
          Changes
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export { PreviewToggle };
