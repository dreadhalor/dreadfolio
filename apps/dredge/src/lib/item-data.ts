import {} from '@dredge/assets/fish';
import {
  BaitBucketImage,
  BoltOfClothImage,
  DogTagsImage,
  LumberImage,
  MetalScrapsImage,
  PackedExplosivesImage,
} from '@dredge/assets/items';
import { GameItem } from '@dredge/types';

export const itemData: GameItem[] = [
  {
    id: 'bait-bucket',
    name: 'Bait Bucket',
    image: BaitBucketImage,
    width: 1,
    height: 2,
    shape: [[1], [1]],
  },
  {
    id: 'dog-tags',
    name: 'Dog Tags',
    image: DogTagsImage,
    width: 1,
    height: 2,
    shape: [[1], [1]],
  },
  {
    id: 'bolt-of-cloth',
    name: 'Bolt of Cloth',
    image: BoltOfClothImage,
    width: 1,
    height: 2,
    shape: [[1], [1]],
  },
  {
    id: 'metal-scraps',
    name: 'Metal Scraps',
    image: MetalScrapsImage,
    width: 2,
    height: 2,
    shape: [
      [1, 1],
      [1, 1],
    ],
  },
  {
    id: 'lumber',
    name: 'Lumber',
    image: LumberImage,
    width: 3,
    height: 1,
    shape: [[1, 1, 1]],
  },
  {
    id: 'packed-explosives',
    name: 'Packed Explosives',
    image: PackedExplosivesImage,
    width: 1,
    height: 2,
    shape: [[1], [1]],
  },
] as const;
