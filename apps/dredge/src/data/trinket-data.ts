import {
  BagOfDoubloonsImage,
  BigBagOfDoubloonsImage,
  BrokenSpectaclesImage,
  DoubloonImage,
  SextantImage,
  OldIronChainImage,
} from '@dredge/assets/items';
import { Item } from '@dredge/types';

export const trinketData: Item[] = [
  {
    type: 'item',
    id: 'broken-spectacles',
    name: 'Broken Spectacles',
    image: BrokenSpectaclesImage,
    width: 2,
    height: 1,
    shape: [[1, 1]],
  },
  {
    type: 'item',
    id: 'doubloon',
    name: 'Doubloon',
    image: DoubloonImage,
    width: 1,
    height: 1,
    shape: [[1]],
  },
  {
    type: 'item',
    id: 'bag-of-doubloons',
    name: 'Bag of Doubloons',
    image: BagOfDoubloonsImage,
    width: 1,
    height: 2,
    shape: [[1], [1]],
  },
  {
    type: 'item',
    id: 'big-bag-of-doubloons',
    name: 'Big Bag of Doubloons',
    image: BigBagOfDoubloonsImage,
    width: 2,
    height: 2,
    shape: [
      [1, 1],
      [1, 1],
    ],
  },
  {
    type: 'item',
    id: 'sextant',
    name: 'Sextant',
    image: SextantImage,
    width: 2,
    height: 2,
    shape: [
      [1, 1],
      [1, 1],
    ],
  },
  {
    type: 'item',
    id: 'old-iron-chain',
    name: 'Old Iron Chain',
    image: OldIronChainImage,
    width: 1,
    height: 1,
    shape: [[1]],
  },
] as const;
