import { hulls } from '@dredge/lib/hull-data';
import { HullData, InventoryItem, PackedItem } from '@dredge/types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface DredgeData {
  hull: HullData;
  setHull: (newHull: HullData) => void;
  inventory: InventoryItem[];
  setInventory: (newInventory: InventoryItem[]) => void;
  packedItems: PackedItem[];
  setPackedItems: (newPackedItems: PackedItem[]) => void;
}

export const useZustandAdapter = create<DredgeData>()(
  persist(
    (set) => ({
      hull: hulls[0],
      setHull: (newHull: HullData) => set({ hull: newHull }),
      inventory: [],
      setInventory: (newInventory: InventoryItem[]) =>
        set({ inventory: newInventory }),
      packedItems: [],
      setPackedItems: (newPackedItems: PackedItem[]) =>
        set({ packedItems: newPackedItems }),
    }),
    {
      name: 'dredge-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
