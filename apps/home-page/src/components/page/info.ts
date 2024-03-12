import {
  EnlightScreenshot,
  FallcrateScreenshot,
  MinesweeperScreenshot,
  PathfinderVisualizerScreenshot,
  ShareMeScreenshot,
  SuDoneKuScreenshot,
} from '@repo/assets';

export const projects = [
  {
    title: 'ShareMe',
    description:
      'A Pinterest-inspired social media platform for sharing and discovering images. Built with React, Sanity.io, and Firebase.',
    image: ShareMeScreenshot,
    link: '/shareme',
    technologies: ['React', 'Sanity.io', 'Firebase'],
  },
  {
    title: 'Minesweeper',
    description:
      'Classic Minesweeper game with customizable grid size and mine count. Built with React, TypeScript, and Tailwind CSS.',
    image: MinesweeperScreenshot,
    link: '/minesweeper',
    technologies: ['React', 'TypeScript', 'Tailwind CSS'],
  },
  {
    title: 'Pathfinding Visualizer',
    description:
      "Visualize pathfinding algorithms like Dijkstra's, BFS and A* on a grid. Built with React, TypeScript, and Tailwind CSS.",
    image: PathfinderVisualizerScreenshot,
    link: '/pathfinder-visualizer',
    technologies: ['React', 'TypeScript', 'Tailwind CSS'],
  },
  {
    title: 'Fallcrate',
    description:
      'A Dropbox-inspired cloud storage app. Built with React, TypeScript, and Tailwind CSS.',
    image: FallcrateScreenshot,
    link: '/fallcrate',
    technologies: ['React', 'TypeScript', 'Tailwind CSS'],
  },
  {
    title: 'Enlight',
    description:
      'A raycasting app that visualizes the path of light rays as they hit obstacles. Built with vanilla Javascript + TypeScript.',
    image: EnlightScreenshot,
    link: '/enlight',
    technologies: ['JavaScript', 'TypeScript'],
  },
  {
    title: 'Su-Done-Ku',
    description:
      'A Sudoku solver that can be used to show step-by-step how to logically solve Sudoku puzzles. Built with React, TypeScript, and Tailwind CSS.',
    image: SuDoneKuScreenshot,
    link: '/su-done-ku',
    technologies: ['React', 'TypeScript', 'Tailwind CSS'],
  },
];

export const experience = [
  {
    title: 'Senior Full Stack Engineer',
    company: 'Broadlume',
    date: '2022 - 2024',
    description:
      'Working on the Google Search team to improve the search experience for users.',
    link: 'https://www.broadlume.com/',
    technologies: [
      'HTML + SCSS',
      'React',
      'Docker',
      'CircleCI',
      'Github Actions',
      'Google Cloud',
      'Storybook',
      'TypeScript',
      'Tailwind CSS',
      'Bootstrap',
      'PostgreSQL',
      'GraphQL',
      'Apollo',
      'Ruby on Rails',
      'Jest',
      'Cypress',
      'Chromatic',
    ],
  },
  {
    title: 'Software Developer',
    company: 'Stash',
    date: '2021 - 2022',
    description:
      'Worked on the Stash website to improve the user experience and performance.',
    link: 'https://www.stash.com/',
    technologies: [
      'React',
      'TypeScript',
      'Tailwind CSS',
      'Node.js',
      'Express',
      'PostgreSQL',
      'AWS',
      'Pug',
      'Jest',
      'Cypress',
    ],
  },
  {
    title: 'Software Developer',
    company: 'Ultra Mobile',
    date: '2019-2020',
    description:
      'Worked on the Ultra Mobile website to improve the user experience and performance.',
    link: 'https://www.ultramobile.com/',
  },
  {
    title: 'Software Developer',
    company: 'West End Designs',
    date: '2015 - 2020',
    description:
      'Worked on the West End Designs website to improve the user experience and performance.',
    link: 'https://www.westendwebdesigns.com/',
  },
];
