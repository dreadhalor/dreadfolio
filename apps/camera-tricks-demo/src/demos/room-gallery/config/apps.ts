// Import portfolio apps for room theming
// Note: In a real integration, you'd import from @repo or your actual portfolio
// For now, we'll define the app data structure here

// Import app screenshots
import HomepageImg from '@repo/assets/app-images/homepage.webp';
import HermitcraftHornsImg from '@repo/assets/app-images/hermitcraft-horns.webp';
import EnlightImg from '@repo/assets/app-images/enlight.webp';
import DredgedUpImg from '@repo/assets/app-images/dredged-up.webp';
import MinesweeperImg from '@repo/assets/app-images/minesweeper.webp';
import RootBeerReviewsImg from '@repo/assets/app-images/root-beer-reviews.webp';
import PathfinderVisualizerImg from '@repo/assets/app-images/pathfinder-visualizer.webp';
import AsciiVideoImg from '@repo/assets/app-images/ascii-video.webp';
import ShareMeImg from '@repo/assets/app-images/shareme.webp';
import FallcrateImg from '@repo/assets/app-images/fallcrate.webp';
import DreadUiImg from '@repo/assets/app-images/dread-ui.webp';
import SketchesImg from '@repo/assets/app-images/sketches.webp';
import SuDoneKuImg from '@repo/assets/app-images/su-done-ku.webp';
import SteeringTextImg from '@repo/assets/app-images/steering-text.webp';
import GifsterImg from '@repo/assets/app-images/gifster.webp';

export interface AppData {
  id: string;
  name: string;
  color: string; // Primary color for room theme
  description: string;
  url?: string;
  imageUrl?: string; // Screenshot/preview image for portal
}

// Portfolio apps with their vibrant themes
export const PORTFOLIO_APPS: AppData[] = [
  {
    id: 'home',
    name: 'Homepage',
    color: '#303030', // Dark gray to match room theme
    description: "Scott Hetrick's official portfolio homepage.",
    url: '/home',
    imageUrl: HomepageImg,
  },
  {
    id: 'hermitcraft-horns',
    name: 'HermitCraft Horns',
    color: '#6b9fff', // Bright sky blue
    description: 'An app for making & sharing audio clips of Hermitcraft videos.',
    url: 'https://hermitcraft-horns.com',
    imageUrl: HermitcraftHornsImg,
  },
  {
    id: 'enlight',
    name: 'Enlight',
    color: '#ff6b9d', // Vibrant pink for the light/shadow theme
    description: 'A relaxing playground of shine and shadow.',
    url: '/enlight',
    imageUrl: EnlightImg,
  },
  {
    id: 'dredged-up',
    name: 'DredgedUp',
    color: '#1a4d2e', // Deep sea green
    description: 'Optimal spatial inventory packing for the game Dredge.',
    url: 'https://dredgedup.com',
    imageUrl: DredgedUpImg,
  },
  {
    id: 'minesweeper',
    name: 'Minesweeper',
    color: '#1f2f86', // Classic minesweeper navy
    description: "Ittttttt's Minesweeper!",
    url: '/minesweeper',
    imageUrl: MinesweeperImg,
  },
  {
    id: 'root-beer-reviews',
    name: 'Root Beer Reviews',
    color: '#8b4513', // Root beer brown
    description: 'A place to review and discover new root beers.',
    url: 'https://summit.scottjhetrick.com',
    imageUrl: RootBeerReviewsImg,
  },
  {
    id: 'pathfinder-visualizer',
    name: 'Pathfinder Visualizer',
    color: '#6c757d', // Slate gray for the grid
    description: 'A pathfinding visualizer, coded in React.',
    url: '/pathfinder-visualizer',
    imageUrl: PathfinderVisualizerImg,
  },
  {
    id: 'ascii-video',
    name: 'Matrix-Cam',
    color: '#00ff41', // Matrix green
    description: 'Vanilla JS app using TensorFlow.js for person detection.',
    url: '/ascii-video',
    imageUrl: AsciiVideoImg,
  },
  {
    id: 'shareme',
    name: 'ShareMe',
    color: '#e60023', // Pinterest red
    description: 'A Pinterest-inspired social media app.',
    url: '/shareme',
    imageUrl: ShareMeImg,
  },
  {
    id: 'fallcrate',
    name: 'Fallcrate',
    color: '#0061fe', // Dropbox blue
    description: 'A Dropbox-inspired full-stack web app for sharing and organizing files.',
    url: '/fallcrate',
    imageUrl: FallcrateImg,
  },
  {
    id: 'dread-ui',
    name: 'DreadUI',
    color: '#8b5cf6', // Purple for UI library
    description: 'My personal component library I created to use across my projects.',
    url: '/dread-ui',
    imageUrl: DreadUiImg,
  },
  {
    id: 'sketches',
    name: 'p5.js Sketches',
    color: '#ed225d', // p5.js pink
    description: 'Various p5 sketches to play around with.',
    url: '/sketches',
    imageUrl: SketchesImg,
  },
  {
    id: 'su-done-ku',
    name: 'Su-Done-Ku',
    color: '#3b82f6', // Puzzle blue
    description: 'All other Sudoku solvers are worse than this one.',
    url: '/su-done-ku',
    imageUrl: SuDoneKuImg,
  },
  {
    id: 'steering-text',
    name: 'Steering Text',
    color: '#f97316', // Orange for movement/dynamics
    description: 'Steering behavior, demonstrated through text.',
    url: '/steering-text',
    imageUrl: SteeringTextImg,
  },
  {
    id: 'gifster',
    name: 'Gifster',
    color: '#9333ea', // Purple/magenta for gifs
    description: "We're not GIPHY, but we do use their API.",
    url: '/gifster',
    imageUrl: GifsterImg,
  },
];
