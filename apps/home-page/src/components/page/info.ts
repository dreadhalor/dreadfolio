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
      'Managed team as UI Tech Lead to create a component library and design system for the distributed BroadlumeX ecosystem. Managed CI/CD pipelines and deployments for the Tatami monorepo.',
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
      'Collaborated with graphic designers to implement new routes and features on the Stash website, enhancing user experience and site navigation. Utilized React and TypeScript to develop clean, efficient, and maintainable code.',
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
      'Serverless',
    ],
  },
  {
    title: 'Software Developer',
    company: 'Ultra Mobile',
    date: '2019-2020',
    description: `Developed software solutions to interface with T-Mobile's network, ensuring seamless integration and optimal performance for Ultra Mobile users. Worked with a variety of technologies to deliver reliable and efficient code.`,
    link: 'https://www.ultramobile.com/',
    technologies: ['JavaScript', 'Node.js', 'Express', 'MySQL', 'AWS'],
  },
  {
    title: 'Software Developer',
    company: 'West End Designs',
    date: '2015 - 2020',
    description:
      'Provided consulting services to clients, developing custom WordPress websites tailored to their specific needs. Implemented responsive designs, optimized site performance, and integrated various plugins to enhance functionality and user experience.',
    link: 'https://www.westendwebdesigns.com/',
    technologies: ['WordPress', 'PHP', 'HTML', 'CSS', 'JavaScript', 'MySQL'],
  },
];
