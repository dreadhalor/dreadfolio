// Import portfolio apps for room theming
// Note: In a real integration, you'd import from @repo or your actual portfolio
// For now, we'll define the app data structure here

// Import app screenshots (for portal display)
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

// Import app icons (for minimap thumbnails)
import HomepageIcon from '@repo/assets/icons/homepage-icon.svg';
import HermitcraftHornsIcon from '@repo/assets/icons/hermitcraft-horns-icon.svg';
import EnlightIcon from '@repo/assets/icons/enlight-icon.svg';
import DredgedUpIcon from '@repo/assets/icons/dredged-up-icon.svg';
import MinesweeperIcon from '@repo/assets/icons/minesweeper-icon.svg';
import RootBeerReviewsIcon from '@repo/assets/icons/root-beer-reviews-icon.svg';
import PathfinderVisualizerIcon from '@repo/assets/icons/pathfinder-visualizer-icon.svg';
import AsciiVideoIcon from '@repo/assets/icons/ascii-video-icon.svg';
import ShareMeIcon from '@repo/assets/icons/shareme-icon.svg';
import FallcrateIcon from '@repo/assets/icons/fallcrate-icon.svg';
import DreadUiIcon from '@repo/assets/icons/dread-ui-icon.svg';
import SketchesIcon from '@repo/assets/icons/sketches-icon.svg';
import SuDoneKuIcon from '@repo/assets/icons/su-done-ku-icon.svg';
import SteeringTextIcon from '@repo/assets/icons/steering-text-icon.svg';
import GifsterIcon from '@repo/assets/icons/gifster-icon.svg';

export interface AppData {
  id: string;
  name: string;
  color: string; // Primary color for room theme
  description: string;
  url?: string;
  imageUrl?: string; // Screenshot/preview image for portal
  iconUrl?: string; // Icon/thumbnail for minimap
}

/**
 * Get the app URL, automatically using localhost in development
 *
 * In dev mode:
 * - Relative paths (starting with /) → Portfolio backend (current hostname:3000)
 * - Absolute URLs (http/https) → Use as-is
 * - Override specific apps in DEV_URLS if running their dev server
 *
 * In production:
 * - Use the configured URLs as-is
 */
function getAppUrl(
  url: string | undefined,
  isDev: boolean,
): string | undefined {
  if (!url || !isDev) return url;

  // Development URL overrides for apps running their own dev server
  const DEV_URLS: Record<string, string> = {
    // '/home': 'http://localhost:5173', // Uncomment if running home-page dev server
    // '/enlight': 'http://localhost:5175', // Uncomment if running enlight dev server
  };

  // Check for override first
  if (DEV_URLS[url]) {
    return DEV_URLS[url];
  }

  // Convert relative paths to portfolio backend in dev
  // Use current hostname and protocol (works for localhost, 192.168.x.x, etc.)
  if (url.startsWith('/')) {
    const hostname =
      typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const protocol =
      typeof window !== 'undefined' ? window.location.protocol : 'http:';
    return `${protocol}//${hostname}:3000${url}`;
  }

  // Return absolute URLs as-is (external apps like hermitcraft-horns.com)
  return url;
}

// Detect development mode
const IS_DEV = import.meta.env.DEV;

// Portfolio apps with their vibrant themes
// URLs are automatically adjusted for local development
const PORTFOLIO_APPS_RAW: AppData[] = [
  {
    id: 'home',
    name: 'Homepage',
    color: '#303030', // Dark gray to match room theme
    description: "Scott Hetrick's official portfolio homepage.",
    url: '/home',
    imageUrl: HomepageImg,
    iconUrl: HomepageIcon,
  },
  {
    id: 'hermitcraft-horns',
    name: 'HermitCraft Horns',
    color: '#8b00ff', // Minecraft nether portal purple
    description:
      'An app for making & sharing audio clips of Hermitcraft videos.',
    url: 'https://hermitcraft-horns.com',
    imageUrl: HermitcraftHornsImg,
    iconUrl: HermitcraftHornsIcon,
  },
  {
    id: 'enlight',
    name: 'Enlight',
    color: '#ff6b9d', // Vibrant pink for the light/shadow theme
    description: 'A relaxing playground of shine and shadow.',
    url: '/enlight',
    imageUrl: EnlightImg,
    iconUrl: EnlightIcon,
  },
  {
    id: 'dredged-up',
    name: 'DredgedUp',
    color: '#1a4d2e', // Deep sea green
    description: 'Optimal spatial inventory packing for the game Dredge.',
    url: 'https://dredgedup.com',
    imageUrl: DredgedUpImg,
    iconUrl: DredgedUpIcon,
  },
  {
    id: 'minesweeper',
    name: 'Minesweeper',
    color: '#5EB3E4', // Windows XP Bliss sky blue
    description: "Ittttttt's Minesweeper!",
    url: '/minesweeper',
    imageUrl: MinesweeperImg,
    iconUrl: MinesweeperIcon,
  },
  {
    id: 'root-beer-reviews',
    name: 'Root Beer Reviews',
    color: '#8b4513', // Root beer brown
    description: 'A place to review and discover new root beers.',
    url: 'https://summit.scottjhetrick.com',
    imageUrl: RootBeerReviewsImg,
    iconUrl: RootBeerReviewsIcon,
  },
  {
    id: 'pathfinder-visualizer',
    name: 'Pathfinder Visualizer',
    color: '#6c757d', // Slate gray for the grid
    description: 'A pathfinding visualizer, coded in React.',
    url: '/pathfinder-visualizer',
    imageUrl: PathfinderVisualizerImg,
    iconUrl: PathfinderVisualizerIcon,
  },
  {
    id: 'ascii-video',
    name: 'Matrix-Cam',
    color: '#00ff41', // Matrix green
    description: 'Vanilla JS app using TensorFlow.js for person detection.',
    // url: '/ascii-video',
    url: 'https://scottjhetrick.com/ascii-video',
    imageUrl: AsciiVideoImg,
    iconUrl: AsciiVideoIcon,
  },
  {
    id: 'shareme',
    name: 'ShareMe',
    color: '#e60023', // Pinterest red
    description: 'A Pinterest-inspired social media app.',
    url: '/shareme',
    imageUrl: ShareMeImg,
    iconUrl: ShareMeIcon,
  },
  {
    id: 'fallcrate',
    name: 'Fallcrate',
    color: '#0061fe', // Dropbox blue
    description:
      'A Dropbox-inspired full-stack web app for sharing and organizing files.',
    url: '/fallcrate',
    imageUrl: FallcrateImg,
    iconUrl: FallcrateIcon,
  },
  {
    id: 'dread-ui',
    name: 'DreadUI',
    color: '#8b5cf6', // Purple for UI library
    description:
      'My personal component library I created to use across my projects.',
    url: '/dread-ui',
    imageUrl: DreadUiImg,
    iconUrl: DreadUiIcon,
  },
  {
    id: 'sketches',
    name: 'p5.js Sketches',
    color: '#ed225d', // p5.js pink
    description: 'Various p5 sketches to play around with.',
    url: '/sketches',
    imageUrl: SketchesImg,
    iconUrl: SketchesIcon,
  },
  {
    id: 'su-done-ku',
    name: 'Su-Done-Ku',
    color: '#3b82f6', // Puzzle blue
    description: 'All other Sudoku solvers are worse than this one.',
    url: '/su-done-ku',
    imageUrl: SuDoneKuImg,
    iconUrl: SuDoneKuIcon,
  },
  {
    id: 'steering-text',
    name: 'Steering Text',
    color: '#f97316', // Orange for movement/dynamics
    description: 'Steering behavior, demonstrated through text.',
    url: '/steering-text',
    imageUrl: SteeringTextImg,
    iconUrl: SteeringTextIcon,
  },
  {
    id: 'gifster',
    name: 'Gifster',
    color: '#9333ea', // Purple/magenta for gifs
    description: "We're not GIPHY, but we do use their API.",
    url: '/gifster',
    imageUrl: GifsterImg,
    iconUrl: GifsterIcon,
  },
];

// Export apps with dev URLs applied
export const PORTFOLIO_APPS: AppData[] = PORTFOLIO_APPS_RAW.map((app) => ({
  ...app,
  url: getAppUrl(app.url, IS_DEV),
}));

// Log dev mode URLs for debugging
if (IS_DEV) {
  console.log('[Dev Mode] App URLs adjusted for local testing:');
  PORTFOLIO_APPS.forEach((app) => {
    if (app.url?.startsWith('http://localhost')) {
      console.log(`  ${app.name}: ${app.url}`);
    }
  });
}
