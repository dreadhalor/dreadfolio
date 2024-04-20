import { binPacking2 } from '@dredge/lib/bin-packing-2';
import { data } from '@dredge/lib/combined-data';
import { HullData, hulls } from '@dredge/lib/hull-data';
import { GameItem, InventoryItem, PackedItem } from '@dredge/types';
import { useState, createContext, useContext, useEffect } from 'react';

type DredgeProviderContextType = {
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  hull: HullData;
  setHull: React.Dispatch<React.SetStateAction<HullData>>;
  packedItems: PackedItem[];
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

  useEffect(() => {
    console.log('Inventory:', inventory);
    const unpackedItems: PackedItem[] = inventory.map(
      (item: InventoryItem) => ({
        id: item.id,
        shape: data.find((data: GameItem) => data.id === item.id)?.shape || [],
      }),
    );
    console.log('Unpacked:', unpackedItems);
    const packed = binPacking2(unpackedItems, hull.grid);
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
      }}
    >
      {children}
    </DredgeProviderContext.Provider>
  );
};
