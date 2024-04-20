import { Item, binPacking } from '@dredge/lib/bin-packing';
import { Fish, fishData, FishDataType } from '@dredge/lib/fish-data';
import { HullData, hulls } from '@dredge/lib/hull-data';
import { useState, createContext, useContext, useEffect } from 'react';

type DredgeProviderContextType = {
  inventory: Fish[];
  setInventory: React.Dispatch<React.SetStateAction<Fish[]>>;
  hull: HullData;
  setHull: React.Dispatch<React.SetStateAction<HullData>>;
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
  const [inventory, setInventory] = useState<Fish[]>([]);
  const [hull, setHull] = useState<HullData>(hulls[0]);

  useEffect(() => {
    console.log('Inventory:', inventory);
    const items: Item[] = inventory.map((fish: Fish) => ({
      id: fish.id,
      shape:
        fishData.find((data: FishDataType) => data.id === fish.id)?.shape || [],
    }));
    console.log('Items:', items);
    const packed = binPacking(items, hull.grid);
    console.log('Packed:', packed);
  }, [inventory, hull]);

  return (
    <DredgeProviderContext.Provider
      value={{ inventory, setInventory, hull, setHull }}
    >
      {children}
    </DredgeProviderContext.Provider>
  );
};
