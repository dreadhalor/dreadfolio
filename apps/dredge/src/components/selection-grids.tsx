import { Tabs, TabsContent, TabsList, TabsTrigger } from '@dredge/ui/tabs';
import { SelectionGrid } from './selection-grid/selection-grid';
import { fishData } from '@dredge/data/fish-data';
import { itemData } from '@dredge/data/item-data';
import { crabPotData } from '@dredge/data/crab-pot-data';
import { SectionDivider } from './selection-grid/section-divider';

export const SelectionGrids = () => {
  return (
    <Tabs defaultValue='fish' className='flex h-full flex-col'>
      <TabsList className='grid grid-cols-3'>
        <TabsTrigger value='fish'>Fish</TabsTrigger>
        <TabsTrigger value='items'>Items</TabsTrigger>
        <TabsTrigger value='crab-pots'>Crab Pots</TabsTrigger>
      </TabsList>
      <TabsContent value='fish' className='overflow-auto'>
        <SelectionGrid items={fishData} />
      </TabsContent>
      <TabsContent value='items' className='overflow-auto'>
        <SelectionGrid items={itemData} />
      </TabsContent>
      <TabsContent
        value='crab-pots'
        className='bg-encyclopedia-pageFill overflow-auto'
      >
        <SectionDivider title='Items' />
        <SelectionGrid items={itemData} />
        <SectionDivider title='Crab Pots' />
        <SelectionGrid items={crabPotData} />
      </TabsContent>
    </Tabs>
  );
};
