import {
  ArrowSquidImage,
  BlackGrouperImage,
  BlueMackerelImage,
  CodImage,
  GreyEelImage,
  GulfFlounderImage,
  SailfishImage,
  StingrayImage,
} from '../assets/fish';

export type FishData = {
  id: string;
  number: number;
  name: string;
  image: string;
  width: number;
  height: number;
  imageWidth?: number;
  imageHeight?: number;
};

export const Fish: FishData[] = [
  {
    id: 'blue-mackerel',
    number: 1,
    name: 'Blue Mackerel',
    image: BlueMackerelImage,
    width: 2,
    height: 1,
  },

  {
    id: 'cod',
    number: 2,
    name: 'Cod',
    image: CodImage,
    width: 2,
    height: 2,
  },

  {
    id: 'arrow-squid',
    number: 3,
    name: 'Arrow Squid',
    image: ArrowSquidImage,
    width: 2,
    height: 1,
  },

  {
    id: 'grey-eel',
    number: 4,
    name: 'Grey Eel',
    image: GreyEelImage,
    width: 3,
    height: 1,
  },
  {
    id: 'gulf-flounder',
    number: 5,
    name: 'Gulf Flounder',
    image: GulfFlounderImage,
    width: 2,
    height: 2,
  },
  {
    id: 'black-grouper',
    number: 6,
    name: 'Black Grouper',
    image: BlackGrouperImage,
    width: 2,
    height: 2,
  },
  {
    id: 'stingray',
    number: 7,
    name: 'Stingray',
    image: StingrayImage,
    width: 3,
    height: 3,
  },
  {
    id: 'sailfish',
    number: 8,
    name: 'Sailfish',
    image: SailfishImage,
    width: 6,
    height: 2,
    imageWidth: 5,
    imageHeight: 2,
  },
] as const;
