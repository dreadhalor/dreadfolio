import {
  AsciiVideoIcon,
  AsciiVideoScreenshot,
  EnlightIcon,
  EnlightScreenshot,
  MinesweeperIcon,
  MinesweeperScreenshot,
  PathfinderVisualizerIcon,
  PathfinderVisualizerScreenshot,
} from '@repo/assets';

export const apps = [
  {
    name: 'test-child',
    url: '/test-child',
    icon: '',
    alt: 'Test App',
    image: '',
    background: 'bg-red-500',
    description: 'This is a test child app',
  },
  {
    name: 'enlight',
    url: '/enlight',
    icon: EnlightIcon,
    alt: 'Enlight Icon',
    image: EnlightScreenshot,
    background: 'bg-blue-500',
    description: 'A simple, elegant, and modern web browser.',
  },
  {
    name: 'minesweeper',
    url: '/minesweeper',
    icon: MinesweeperIcon,
    alt: 'Minesweeper Icon',
    image: MinesweeperScreenshot,
    background: 'bg-green-500',
    description: 'A classic game of Minesweeper.',
  },
  {
    name: 'pathfinder-visualizer',
    url: '/pathfinder-visualizer',
    icon: PathfinderVisualizerIcon,
    alt: 'Pathfinder Visualizer Icon',
    image: PathfinderVisualizerScreenshot,
    background: 'bg-yellow-500',
    description: 'A visualizer for pathfinding algorithms.',
  },
  {
    name: 'ascii-video',
    url: '/ascii-video',
    icon: AsciiVideoIcon,
    alt: 'Matrix-Cam Icon',
    image: AsciiVideoScreenshot,
    background: 'bg-purple-500',
    description: 'A webcam that renders video as ASCII.',
  },
  {
    name: 'dread-ui',
    url: '/dread-ui',
    icon: '',
    alt: 'dread ui',
    image: '',
    background: 'bg-pink-500',
    description: 'A simple, elegant, and modern web browser.',
  },
] as const;

export const appIconSizeSmall = 30;
export const appIconSizeLarge = 80;
export const appIconJumpTopBound = 160;
export const selectedAppIconMarginLarge = 20;
export const selectedAppIconMarginSmall = 8;
export const perspective = 500;
export const appSnapSpaceSize = 80;

export const navbarMargin = 10; // margin between navbar & the side of the screen
// very mathy value to create the navbar margin via perspective
export const getK = (iconSize: number, parentWidth: number) => {
  const excess = navbarMargin + iconSize + selectedAppIconMarginLarge;
  const k = perspective / Math.pow(parentWidth - excess, 2);
  return k;
};
