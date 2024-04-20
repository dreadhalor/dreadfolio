import { Item } from '@dredge/lib/bin-packing';
import { binPacking3 } from '@dredge/lib/bin-packing-3';
import { Fish, fishData, FishDataType } from '@dredge/lib/fish-data';
import { HullData, hulls } from '@dredge/lib/hull-data';
import { useState, createContext, useContext } from 'react';

type DredgeProviderContextType = {
  inventory: Fish[];
  setInventory: React.Dispatch<React.SetStateAction<Fish[]>>;
  hull: HullData;
  setHull: React.Dispatch<React.SetStateAction<HullData>>;
  packedFish: Item[];
  packFish: (id: string) => void;
  unpackFish: (id: string) => void;
  toggleFish: (id: string) => void;
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
  const [packedFish, setPackedFish] = useState<Item[]>([]);

  const packFish = (id: string) => {
    const fish = fishData.find((data: FishDataType) => data.id === id);
    console.log('in packFish, fish to pack:', fish);
    if (!fish) return;

    const item: Item = {
      id: fish.id,
      shape: fish.shape,
    };

    const result = binPacking3(packedFish, hull.grid, item, true);
    console.log('result:', result);
    if (result) {
      setPackedFish(result.items);
      return result.items;
    }

    return [];
  };

  const unpackFish = (id: string) => {
    const item = packedFish.find((item) => item.id === id);
    if (!item) return;

    const result = binPacking3(packedFish, hull.grid, item, false);
    if (result) {
      setPackedFish(result.items);
    }
  };

  const toggleFish = (id: string) => {
    const fish = packedFish.find((item) => item.id === id);
    console.log('FISH TO PACK/UNPACK:', fish);
    if (fish) {
      unpackFish(id);
      // setInventory((prev) => {
      //   return prev.filter((f) => f.id !== id);
      // });
    } else {
      const packed = packFish(id);
      if (!packed) console.log('NO SOLUTION');
    }
  };

  return (
    <DredgeProviderContext.Provider
      value={{
        inventory,
        setInventory,
        hull,
        setHull,
        packedFish,
        packFish,
        unpackFish,
        toggleFish,
      }}
    >
      {children}
    </DredgeProviderContext.Provider>
  );
};
