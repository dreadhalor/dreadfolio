import { Tabs, TabsContent, TabsList, TabsTrigger } from '@dredge/ui/tabs';
import { FishSelectionGrid } from './fish/fish-selection-grid';
import { ItemSelectionGrid } from './items/item-selection-grid';

export const SelectionGrid = () => {
  return (
    <Tabs defaultValue='fish' className='flex h-full flex-col'>
      <TabsList className='grid grid-cols-2'>
        <TabsTrigger value='fish'>Fish</TabsTrigger>
        <TabsTrigger value='items'>Items</TabsTrigger>
      </TabsList>
      <TabsContent value='fish' className='overflow-auto'>
        <FishSelectionGrid />
      </TabsContent>
      <TabsContent value='items' className='overflow-auto'>
        <ItemSelectionGrid />
      </TabsContent>
    </Tabs>
  );
};