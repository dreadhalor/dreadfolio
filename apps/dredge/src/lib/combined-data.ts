import { fishData } from './fish-data';
import { itemData } from './item-data';

export const data = [...fishData, ...itemData] as const;
