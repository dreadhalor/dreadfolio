import { SelectionGrid } from './selection-grid/selection-grid';
import { fishData } from '@dredge/data/fish-data';
import { itemData } from '@dredge/data/item-data';
import { crabPotData } from '@dredge/data/crab-pot-data';
import { SectionDivider } from './selection-grid/section-divider';
import { Input } from './ui/input';
import { useEffect, useState } from 'react';
import { questItemData } from '@dredge/data/quest-item-data';
import { trinketData } from '@dredge/data/trinket-data';

export const SelectionGrids = () => {
  const [filter, setFilter] = useState('' as string);
  const [filteredFishData, setFilteredFishData] = useState(fishData);
  const [filteredItemData, setFilteredItemData] = useState(itemData);
  const [filteredCrabPotData, setFilteredCrabPotData] = useState(crabPotData);
  const [filteredQuestItemData, setFilteredQuestItemData] =
    useState(questItemData);
  const [filteredTrinketData, setFilteredTrinketData] = useState(trinketData);

  useEffect(() => {
    setFilteredFishData(
      fishData.filter((fish) =>
        fish.name.toLowerCase().includes(filter.toLowerCase()),
      ),
    );
    setFilteredItemData(
      itemData.filter((item) =>
        item.name.toLowerCase().includes(filter.toLowerCase()),
      ),
    );
    setFilteredCrabPotData(
      crabPotData.filter((crabPot) =>
        crabPot.name.toLowerCase().includes(filter.toLowerCase()),
      ),
    );
    setFilteredQuestItemData(
      questItemData.filter((questItem) =>
        questItem.name.toLowerCase().includes(filter.toLowerCase()),
      ),
    );
    setFilteredTrinketData(
      trinketData.filter((trinket) =>
        trinket.name.toLowerCase().includes(filter.toLowerCase()),
      ),
    );
  }, [filter]);

  return (
    <div className='bg-encyclopedia-pageFill flex h-full flex-col overflow-auto'>
      <div className='bg-encyclopedia-pageFill sticky top-0 z-10 w-full p-2'>
        <Input
          type='search'
          placeholder='Search...'
          className='border-encyclopedia-border bg-encyclopedia-entryFill w-full rounded-none border-4 text-black placeholder:text-gray-600'
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      <SectionDivider title='Fish' />
      <SelectionGrid items={filteredFishData} />
      <SectionDivider title='Items' />
      <SelectionGrid items={filteredItemData} />
      <SectionDivider title='Trinkets' />
      <SelectionGrid items={filteredTrinketData} />
      <SectionDivider title='Crab Pots' />
      <SelectionGrid items={filteredCrabPotData} />
      <SectionDivider title='Quest Items' />
      <SelectionGrid items={filteredQuestItemData} />
    </div>
  );
};