import { crabPotData } from './crab-pot-data';
import { fishData } from './fish-data';
import { itemData } from './item-data';

export const data = [...fishData, ...itemData, ...crabPotData] as const;
