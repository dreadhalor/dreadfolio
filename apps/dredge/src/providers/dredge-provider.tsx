import { binPacking2 } from '@dredge/lib/bin-packing-2';
import { data } from '@dredge/lib/combined-data';
import { hulls } from '@dredge/lib/hull-data';
import { getItemAt } from '@dredge/lib/utils';
import {
  GameItem,
  HullData,
  InventoryItem,
  PackedItem,
  SlotType,
} from '@dredge/types';
import { useState, createContext, useContext, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

type DredgeProviderContextType = {
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  hull: HullData;
  setHull: React.Dispatch<React.SetStateAction<HullData>>;
  packedItems: PackedItem[];
  toggleSlot: (row: number, col: number) => void;
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
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [hull, setHull] = useState<HullData>(hulls[0]);
  const [packedItems, setPackedItems] = useState<PackedItem[]>([]);

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
    const unpackedItems: PackedItem[] = inventory.map(
      (item: InventoryItem) => ({
        id: uuidv4(),
        itemId: item.id,
        shape: data.find((data: GameItem) => data.id === item.id)?.shape || [],
      }),
    );
    console.log('Unpacked:', unpackedItems);
    const packed = binPacking2(unpackedItems, hull.grid);
    if (!packed) {
      // remove the last item from the inventory
      setInventory(inventory.slice(0, -1));
      return;
    }
    setPackedItems(packed || []);
    console.log('Packed:', packed);
  }, [inventory, hull]);

  return (
    <DredgeProviderContext.Provider
      value={{
        inventory,
        setInventory,
        hull,
        setHull,
        packedItems,
        toggleSlot,
      }}
    >
      {children}
    </DredgeProviderContext.Provider>
  );
};
