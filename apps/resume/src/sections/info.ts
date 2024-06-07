import BroadlumeLogo from '@resume/assets/icons/broadlume-logo.svg?react';
import StashLogo from '@resume/assets/icons/stash-logo.svg?react';
import UltraMobileLogo from '@resume/assets/icons/ultra-mobile-logo.svg?react';
import WestEndDesignsLogo from '@resume/assets/icons/west-end-designs-logo.svg?react';

export const EXPERIENCE = [
  {
    title: 'Tech Lead',
    company: 'Broadlume',
    dates: '2022 - 2024',
    description:
      'Managed team as Tech Lead to create a custom analytics service, component library + design system & unified portal with integrations for the distributed BroadlumeX ecosystem. Managed CI/CD pipelines and deployments for the Tatami monorepo.',
    website: 'www.broadlume.com',
    logo: BroadlumeLogo,
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
    title: 'Senior Full Stack Engineer',
    company: 'Stash',
    dates: '2021 - 2022',
    description:
      'Collaborated with graphic designers to implement new routes and features on the Stash website, enhancing user experience and site navigation. Utilized React and TypeScript to develop clean, efficient, and maintainable code.',
    website: 'www.stash.com',
    logo: StashLogo,
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
    dates: '2019 - 2020',
    description: `Developed software solutions to interface with T-Mobile's network, ensuring seamless integration and optimal performance for Ultra Mobile users. Worked with a variety of technologies to deliver reliable and efficient code.`,
    website: 'www.ultramobile.com',
    logo: UltraMobileLogo,
    technologies: ['JavaScript', 'Node.js', 'Express', 'MySQL', 'AWS'],
  },
  {
    title: 'Software Developer',
    company: 'West End Designs',
    dates: '2015 - 2020',
    description:
      'Provided consulting services to clients, developing custom WordPress websites tailored to their specific needs. Implemented responsive designs & optimized site performance.',
    website: 'www.westendwebdesigns.com',
    logo: WestEndDesignsLogo,
    technologies: ['WordPress', 'PHP', 'HTML', 'CSS', 'JavaScript', 'MySQL'],
  },
] as const;

export type ExperienceType = (typeof EXPERIENCE)[number];
