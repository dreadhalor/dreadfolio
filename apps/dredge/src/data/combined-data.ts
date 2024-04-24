import { crabPotData } from './crab-pot-data';
import { fishData } from './fish-data';
import { itemData } from './item-data';
import { questItemData } from './quest-item-data';
import { trinketData } from './trinket-data';

export const data = [
  ...fishData,
  ...itemData,
  ...trinketData,
  ...questItemData,
  ...crabPotData,
] as const;
