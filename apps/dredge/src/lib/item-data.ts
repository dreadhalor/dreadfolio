import {} from '@dredge/assets/fish';
import {
  BaitBucketImage,
  BoltOfClothImage,
  DogTagsImage,
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
] as const;
