import { useZustandAdapter } from '@dredge/hooks/use-zustand-adapter';
import { binPacking } from '@dredge/lib/bin-packing';
import { data } from '@dredge/data/combined-data';
import { getItemAt } from '@dredge/lib/utils';
import {
  GridItemBase,
  HullData,
  GridItem,
  PackedItem,
  SlotType,
} from '@dredge/types';
import { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

type DredgeProviderContextType = {
  inventory: GridItem[];
  setInventory: (newInventory: GridItem[]) => void;
  hull: HullData;
  setHull: (newHull: HullData) => void;
  packedItems: PackedItem[];
  toggleSlot: (row: number, col: number) => void;
  movingItem: GridItem | null;
  setMovingItem: (item: GridItem | null) => void;
};

const DredgeProviderContext = createContext<DredgeProviderContextType>(
  {} as DredgeProviderContextType,
);

export const useDredge = () => {
  const context = useContext(DredgeProviderContext);
  if (context === undefined) {
    throw new Error('useDredge must be used within a DredgeProvider');
  }
  return context;
};

export const DredgeProvider = ({ children }: { children: React.ReactNode }) => {
  const {
    hull,
    setHull,
    inventory,
    setInventory,
    packedItems,
    setPackedItems,
  } = useZustandAdapter();

  const [movingItem, setMovingItem] = useState<GridItem | null>(null);

  const toggleSlot = (row: number, col: number) => {
    // if there is an item in the slot, just remove the item
    const item = getItemAt(packedItems, row, col);
    if (item) {
      const index = inventory.findIndex((i) => i.id === item.itemId);
      if (index === -1) return;
      const newInventory = inventory.map((i) => ({ ...i }));
      newInventory.splice(index, 1);
      setInventory(newInventory);
      return;
    }
    // if there is no item in the slot, toggle the slot
    const newGrid = hull.grid.map((r) => r.slice());
    const slot = newGrid[row][col];
    switch (slot) {
      case SlotType.Locked:
        break;
      case SlotType.Available:
        newGrid[row][col] = SlotType.Damaged;
        break;
      case SlotType.Damaged:
        newGrid[row][col] = SlotType.Available;
        break;
    }
    setHull({ ...hull, grid: newGrid });
  };

  useEffect(() => {
    console.log('Inventory:', inventory);
    const unpackedItems: PackedItem[] = inventory.map((item: GridItem) => ({
      id: uuidv4(),
      itemId: item.id,
      shape:
        data.find((data: GridItemBase) => data.id === item.id)?.shape || [],
    }));
    console.log('Unpacked:', unpackedItems);
    const packed = binPacking(unpackedItems, hull.grid);
    if (!packed) {
      // remove the last item from the inventory
      setInventory(inventory.slice(0, -1));
      return;
    }
    setPackedItems(packed || []);
    console.log('Packed:', packed);
  }, [inventory, hull, setPackedItems, setInventory]);

  return (
    <DredgeProviderContext.Provider
      value={{
        inventory,
        setInventory,
        hull,
        setHull,
        packedItems,
        toggleSlot,
        movingItem,
        setMovingItem,
      }}
    >
      {children}
    </DredgeProviderContext.Provider>
  );
};
