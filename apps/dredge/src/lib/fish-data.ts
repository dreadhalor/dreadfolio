import {
  ArrowSquidImage,
  BlackGrouperImage,
  BlueMackerelImage,
  CodImage,
  GreyEelImage,
  GulfFlounderImage,
  SailfishImage,
  StingrayImage,
  BronzeWhalerImage,
  BlacktipReefSharkImage,
  CommonCrabImage,
  FiddlerCrabImage,
  OceanicPerchImage,
  TigerMackerelImage,
  BlackSeaBassImage,
  StonefishImage,
  BlackmouthSalmonImage,
  CongerEelImage,
  DevilRayImage,
  SturgeonImage,
} from '@dredge/assets/fish';

export type FishDataType = {
  id: string;
  number: number;
  name: string;
  image: string;
  width: number;
  height: number;
  shape: number[][];
  imageWidth?: number;
  imageHeight?: number;
};

export type Fish = {
  id: string;
  count: number;
};

export const fishData: FishDataType[] = [
  {
    id: 'blue-mackerel',
    number: 1,
    name: 'Blue Mackerel',
    image: BlueMackerelImage,
    width: 2,
    height: 1,
    shape: [[1, 1]],
  },

  {
    id: 'cod',
    number: 2,
    name: 'Cod',
    image: CodImage,
    width: 2,
    height: 2,
    shape: [
      [1, 1],
      [0, 1],
    ],
  },

  {
    id: 'arrow-squid',
    number: 3,
    name: 'Arrow Squid',
    image: ArrowSquidImage,
    width: 2,
    height: 1,
    shape: [[1, 1]],
  },

  {
    id: 'grey-eel',
    number: 4,
    name: 'Grey Eel',
    image: GreyEelImage,
    width: 3,
    height: 1,
    shape: [[1, 1, 1]],
  },
  {
    id: 'gulf-flounder',
    number: 5,
    name: 'Gulf Flounder',
    image: GulfFlounderImage,
    width: 2,
    height: 2,
    shape: [
      [1, 1],
      [1, 1],
    ],
  },
  {
    id: 'black-grouper',
    number: 6,
    name: 'Black Grouper',
    image: BlackGrouperImage,
    width: 2,
    height: 2,
    shape: [
      [1, 1],
      [1, 1],
    ],
  },
  {
    id: 'stingray',
    number: 7,
    name: 'Stingray',
    image: StingrayImage,
    width: 3,
    height: 3,
    shape: [
      [0, 1, 1],
      [1, 1, 1],
      [0, 1, 1],
    ],
  },
  {
    id: 'sailfish',
    number: 8,
    name: 'Sailfish',
    image: SailfishImage,
    width: 6,
    height: 2,
    shape: [
      [0, 1, 1, 1, 0, 0],
      [1, 1, 1, 1, 1, 1],
    ],
    imageWidth: 5,
    imageHeight: 2,
  },
  {
    id: 'bronze-whaler',
    number: 9,
    name: 'Bronze Whaler',
    image: BronzeWhalerImage,
    width: 4,
    height: 3,
    shape: [
      [0, 1, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 1, 0],
    ],
  },
  {
    id: 'blacktip-reef-shark',
    number: 10,
    name: 'Blacktip Reef Shark',
    image: BlacktipReefSharkImage,
    width: 4,
    height: 3,
    shape: [
      [0, 0, 1, 0],
      [1, 1, 1, 1],
      [0, 1, 0, 0],
    ],
  },
  {
    id: 'common-crab',
    number: 11,
    name: 'Common Crab',
    image: CommonCrabImage,
    width: 1,
    height: 1,
    shape: [[1]],
  },
  {
    id: 'fiddler-crab',
    number: 12,
    name: 'Fiddler Crab',
    image: FiddlerCrabImage,
    width: 3,
    height: 2,
    shape: [
      [1, 1, 1],
      [1, 1, 0],
    ],
  },
  {
    id: 'oceanic-perch',
    number: 13,
    name: 'Oceanic Perch',
    image: OceanicPerchImage,
    width: 1,
    height: 1,
    shape: [[1]],
  },
  {
    id: 'tiger-mackerel',
    number: 14,
    name: 'Tiger Mackerel',
    image: TigerMackerelImage,
    width: 2,
    height: 1,
    shape: [[1, 1]],
  },
  {
    id: 'black-sea-bass',
    number: 15,
    name: 'Black Sea Bass',
    image: BlackSeaBassImage,
    width: 2,
    height: 1,
    shape: [[1, 1]],
  },
  {
    id: 'stonefish',
    number: 16,
    name: 'Stonefish',
    image: StonefishImage,
    width: 2,
    height: 2,
    shape: [
      [1, 1],
      [1, 1],
    ],
  },
  {
    id: 'blackmouth-salmon',
    number: 17,
    name: 'Blackmouth Salmon',
    image: BlackmouthSalmonImage,
    width: 2,
    height: 2,
    shape: [
      [1, 1],
      [1, 0],
    ],
  },
  {
    id: 'conger-eel',
    number: 18,
    name: 'Conger Eel',
    image: CongerEelImage,
    width: 4,
    height: 2,
    shape: [
      [1, 1, 0, 0],
      [0, 1, 1, 1],
    ],
  },
  {
    id: 'devil-ray',
    number: 19,
    name: 'Devil Ray',
    image: DevilRayImage,
    width: 4,
    height: 3,
    shape: [
      [0, 1, 1, 0],
      [1, 1, 1, 1],
      [0, 1, 1, 0],
    ],
  },
  {
    id: 'sturgeon',
    number: 20,
    name: 'Sturgeon',
    image: SturgeonImage,
    width: 3,
    height: 2,
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
  },
] as const;
