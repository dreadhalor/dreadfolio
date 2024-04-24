import { hulls } from '@dredge/data/hull-data';
import { HullData, GridItem, PackedItem } from '@dredge/types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface DredgeData {
  hull: HullData;
  setHull: (newHull: HullData) => void;
  inventory: GridItem[];
  setInventory: (newInventory: GridItem[]) => void;
  packedItems: PackedItem[];
  setPackedItems: (newPackedItems: PackedItem[]) => void;
}

export const useZustandAdapter = create<DredgeData>()(
  persist(
    (set) => ({
      hull: hulls[0],
      setHull: (newHull: HullData) => set({ hull: newHull }),
      inventory: [],
      setInventory: (newInventory: GridItem[]) =>
        set({ inventory: newInventory }),
      packedItems: [],
      setPackedItems: (newPackedItems: PackedItem[]) =>
        set({
          packedItems:
            JSON.stringify(newPackedItems) !== '{}' ? newPackedItems : [],
        }),
    }),
    {
      name: 'dredge-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
