import {
  EnlightScreenshot,
  FallcrateScreenshot,
  HermitcraftHornsScreenshot,
  MinesweeperScreenshot,
  PathfinderVisualizerScreenshot,
  ShareMeScreenshot,
  SuDoneKuScreenshot,
} from '@repo/assets';

export const projects = [
  {
    id: 'hermitcraft-horns',
    title: 'HermitCraft Horns',
    description:
      'An app for making & sharing audio clips of Hermitcraft videos. Built for scale, as it currently receives traffic of 5,000 requests per day.',
    image: HermitcraftHornsScreenshot,
    technologies: [
      'Next.js',
      'React',
      'AWS',
      'Docker',
      'PostgreSQL',
      'Redis',
      'Responsive Design',
      'TypeScript',
      'Tailwind CSS',
      'Drizzle',
      'Vercel',
      'trpc',
    ],
  },
  {
    id: 'shareme',
    title: 'ShareMe',
    description:
      'A Pinterest-inspired social media platform for sharing and discovering images. Built with React, Sanity.io, and Firebase.',
    image: ShareMeScreenshot,
    technologies: [
      'React',
      'Sanity.io',
      'Firebase',
      'TypeScript',
      'Tailwind CSS',
    ],
  },
  {
    id: 'minesweeper',
    title: 'Minesweeper',
    description:
      'Classic Minesweeper game with customizable grid size and mine count. Built with React, TypeScript, and Tailwind CSS.',
    image: MinesweeperScreenshot,
    technologies: ['React', 'TypeScript', 'Tailwind CSS'],
  },
  {
    id: 'pathfinder-visualizer',
    title: 'Pathfinding Visualizer',
    description:
      "Visualize pathfinding algorithms like Dijkstra's, BFS and A* on a grid. Built with React, TypeScript, and Tailwind CSS.",
    image: PathfinderVisualizerScreenshot,
    technologies: ['React', 'TypeScript', 'Tailwind CSS'],
  },
  {
    id: 'fallcrate',
    title: 'Fallcrate',
    description:
      'A Dropbox-inspired cloud storage app. Built with React, TypeScript, and Tailwind CSS.',
    image: FallcrateScreenshot,
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Firebase'],
  },
  {
    id: 'enlight',
    title: 'Enlight',
    description:
      'A raycasting app that visualizes the path of light rays as they hit obstacles. Built with vanilla Javascript + TypeScript.',
    image: EnlightScreenshot,
    technologies: ['JavaScript', 'TypeScript'],
  },
  {
    id: 'su-done-ku',
    title: 'Su-Done-Ku',
    description:
      'A Sudoku solver that can be used to show step-by-step how to logically solve Sudoku puzzles. Built with React, TypeScript, and Tailwind CSS.',
    image: SuDoneKuScreenshot,
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'REST API'],
  },
];

export const experience = [
  {
    title: 'Tech Lead',
    company: 'Broadlume',
    date: '2022 - 2024',
    description:
      'Managed team as Tech Lead to create a custom analytics service, component library + design system & unified portal with integrations for the distributed BroadlumeX ecosystem. Managed CI/CD pipelines and deployments for the Tatami monorepo.',
    link: 'https://www.broadlume.com/',
    technologies: [
      'HTML + SCSS',
      'React',
      'Docker',
      'Redis',
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
    title: 'Senior Full Stack Engineer',
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
    title: 'Software Engineer II',
    company: 'Ultra Mobile',
    date: '2019 - 2020',
    description: `Developed software solutions to interface with T-Mobile's network, ensuring seamless integration and optimal performance for Ultra Mobile users. Worked with a variety of technologies to deliver reliable and efficient code.`,
    link: 'https://www.ultramobile.com/',
    technologies: ['JavaScript', 'Node.js', 'Express', 'MySQL', 'AWS'],
  },
  {
    title: 'Software Developer',
    company: 'West End Designs',
    date: '2015 - 2020',
    description:
      'Provided client consulting, developing custom WordPress websites. Implemented responsive designs & optimized site performance.',
    link: 'https://www.westendwebdesigns.com/',
    technologies: ['WordPress', 'PHP', 'HTML', 'CSS', 'JavaScript', 'MySQL'],
  },
];
