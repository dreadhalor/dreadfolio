import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useHomePage } from '../../providers/home-page-provider';
import { cn } from '@repo/utils';
import { Card, CardContent, CardHeader } from 'dread-ui';
import { SectionLink } from './section-link';
import { Section } from './section';
import { ProjectCardList } from './project-card';
import {
  MinesweeperScreenshot,
  PathfinderVisualizerScreenshot,
  ShareMeScreenshot,
} from '@repo/assets';

type PageProps = {
  offset: number;
  setOffset: (offset: number) => void;
  setParallaxBaseHeight: (height: number) => void;
};
const Page = ({ offset, setOffset, setParallaxBaseHeight }: PageProps) => {
  const { step } = useHomePage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState('about');

  const projects = [
    {
      title: 'ShareMe',
      description:
        'Web app for visualizing personalized Spotify data. View your top artists, top tracks, recently played tracks, and detailed audio information about each track. Create and save new playlists of recommended tracks based on your existing playlists and more.',
      image: ShareMeScreenshot,
      technologies: ['React', 'Sanity.io', 'Firebase'],
    },
    {
      title: 'Minesweeper',
      description:
        'Classic Minesweeper game with customizable grid size and mine count. Built with React, TypeScript, and Tailwind CSS.',
      image: MinesweeperScreenshot,
      technologies: ['React', 'TypeScript', 'Tailwind CSS'],
    },
    {
      title: 'Pathfinding Visualizer',
      description:
        "Visualize pathfinding algorithms like Dijkstra's, BFS and A* on a grid. Built with React, TypeScript, and Tailwind CSS.",
      image: PathfinderVisualizerScreenshot,
      technologies: ['React', 'TypeScript', 'Tailwind CSS'],
    },
  ];

  const removeLogo = () => {
    const splineViewer = document.getElementsByTagName('spline-viewer')[0];
    if (!splineViewer) return;
    const shadowRoot = splineViewer.shadowRoot;
    if (!shadowRoot) return;
    const logo = shadowRoot.getElementById('logo');
    if (!logo) return;
    logo.style.visibility = 'hidden';
  };

  useEffect(() => {
    removeLogo();
  }, []);

  useLayoutEffect(() => {
    setParallaxBaseHeight(containerRef.current?.scrollHeight ?? 0);
  }, [setParallaxBaseHeight, containerRef.current?.scrollHeight]);

  return (
    <div
      className={cn(
        'bg-primary/60 pointer-events-none relative flex h-full w-full opacity-0',
        step === 'homepage' && 'pointer-events-auto opacity-100',
      )}
    >
      <div
        ref={containerRef}
        className='relative mx-auto flex h-full w-full items-start justify-center overflow-auto overscroll-y-contain'
        onScroll={(e) => {
          setOffset(e.currentTarget.scrollTop);
        }}
      >
        <div className='sticky left-0 top-0 flex h-full max-w-[640px] flex-1 shrink-0 py-24 pl-24 pr-2'>
          <div
            className='text-primary-foreground relative flex flex-1 flex-col items-start'
            style={{ textShadow: '0px 0px 20px #000000' }}
          >
            <h1 className='text-4xl font-bold tracking-tight text-slate-200 sm:text-5xl'>
              Scott Hetrick
            </h1>
            <h2 className='mt-3 text-lg font-medium tracking-tight text-slate-200 sm:text-xl'>
              Programming. Pizza. Punchlines.
            </h2>
            <h2 className='text-md mt-2 font-medium tracking-tight text-slate-400 sm:text-lg'>
              Not necessarily in that order.
            </h2>
            <spline-viewer
              class='mx-auto my-4 h-[200px] w-[200px] shrink-0 overflow-hidden'
              loading-anim-type='spinner-small-dark'
              url='https://prod.spline.design/8KeIdzt7Hi8smpDE/scene.splinecode'
            ></spline-viewer>
            <nav className='hidden lg:block' aria-label='In-page jump links'>
              <ul className='w-max'>
                <SectionLink
                  name='about'
                  activeSection={activeSection}
                  parent={containerRef}
                >
                  About
                </SectionLink>
                <SectionLink
                  name='tech-stack'
                  activeSection={activeSection}
                  parent={containerRef}
                >
                  Tech Stack
                </SectionLink>
                <SectionLink
                  name='projects'
                  activeSection={activeSection}
                  parent={containerRef}
                >
                  Projects
                </SectionLink>
              </ul>
            </nav>
          </div>
        </div>
        <div className='text-primary-foreground relative flex min-h-full max-w-[640px] flex-1 shrink-0 flex-col py-24 pr-24'>
          <Section
            offset={offset}
            setActiveSection={setActiveSection}
            name='about'
            className='mb-4'
          >
            <Card className='bg-primary/20 border-0 text-slate-300'>
              <CardHeader>
                <h3>About Me</h3>
              </CardHeader>
              <CardContent className='flex flex-col gap-4'>
                <p>
                  My web development adventure started in high school,
                  automating Model United Nations conferences with my first
                  software project. This early success propelled me into a
                  career where I've since built a widely used component library,
                  led UI projects, & embraced the challenges of full-stack
                  development with a mix of curiosity & humor.
                </p>
                <p>
                  Now, I specialize in creating elegant web experiences using
                  Typescript, React, & Tailwind CSS, finding joy in the sweet
                  spot where design meets robust engineering. When I'm not
                  coding, I'm likely eating pizza, doing stand-up comedy, eating
                  pizza, exploring new tech, or enjoying life's simple moments
                  with friends & family & pizza.
                </p>
              </CardContent>
            </Card>
          </Section>
          <Section
            offset={offset}
            setActiveSection={setActiveSection}
            name='tech-stack'
          >
            <div className='flex min-h-full min-w-0 shrink-0 flex-col items-center justify-center gap-4 leading-[26px] text-slate-300'>
              <Card className='bg-primary/30 overflow-hidden border-0 text-slate-300'>
                <CardHeader>
                  <h3>Front-End Technologies</h3>
                </CardHeader>
                <CardContent className='pl-10'>
                  <ul className='list-disc'>
                    <li>
                      Programming Languages & Libraries: JavaScript, TypeScript,
                      HTML/CSS, Sass
                    </li>
                    <li>
                      Frameworks: React, Angular, Ruby on Rails (for front-end
                      aspects), jQuery
                    </li>
                    <li>
                      UI Development & Styling: TailwindCSS, Framer Motion
                    </li>
                    <li>Build Tools: Vite, Turborepo</li>
                    <li>
                      Design & Prototyping: Figma, Adobe Illustrator, Adobe
                      Photoshop, Spline, p5.js
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className='bg-primary/30 overflow-hidden border-0 text-slate-300'>
                <CardHeader>
                  <h3>Back-End Technologies</h3>
                </CardHeader>
                <CardContent className='pl-10'>
                  <ul className='list-disc'>
                    <li>Programming Languages: Node.js, Java, Ruby, C/C++</li>
                    <li>
                      Frameworks & Runtime Environments: Express, Ruby on Rails
                      (back-end aspects)
                    </li>
                    <li>
                      API Development & Integration: GraphQL, RESTful Web APIs,
                      tRPC
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className='bg-primary/30 overflow-hidden border-0 text-slate-300'>
                <CardHeader>
                  <h3>Databasing</h3>
                </CardHeader>
                <CardContent className='pl-10'>
                  <ul className='list-disc'>
                    <li>
                      Types & Management Systems: RDBMS, PostgreSQL, MySQL,
                      MongoDB, Firebase, PlanetScale
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className='bg-primary/30 overflow-hidden border-0 text-slate-300'>
                <CardHeader>
                  <h3>DevOps & Deployment</h3>
                </CardHeader>
                <CardContent className='pl-10'>
                  <ul className='list-disc'>
                    <li>Containerization & Orchestration: Docker</li>
                    <li>
                      Cloud Platforms & Services: AWS, DigitalOcean, Google
                      Cloud
                    </li>
                    <li>
                      Continuous Integration & Continuous Deployment (CI/CD):
                      Github Actions, CircleCI
                    </li>
                    <li>Web Server Management: Nginx</li>
                    <li>Visual Testing & Review: Chromatic</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className='bg-primary/30 overflow-hidden border-0 text-slate-300'>
                <CardHeader>
                  <h3>Development Tooling & Collaboration</h3>
                </CardHeader>
                <CardContent className='pl-10'>
                  <ul className='list-disc'>
                    <li>Editors & IDEs: VSCode</li>
                    <li>Version Control & Repository Hosting: Git, GitHub</li>
                    <li>Package Managers: PNPM, NPM</li>
                    <li>
                      Testing Frameworks & Libraries: Vitest/Jest, Cypress
                    </li>
                    <li>
                      Project Management & Documentation: Jira, Confluence
                    </li>
                    <li>
                      Code Quality & Maintenance: Storybook, CodeClimate, Zod
                      (for TypeScript validation)
                    </li>
                    <li>Scripting & Configuration: Bash, JSON, YML</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </Section>
          <Section
            offset={offset}
            setActiveSection={setActiveSection}
            name='projects'
          >
            <div className='flex h-full min-w-0 shrink-0 flex-col items-center justify-center text-white'>
              {/* <ProjectCard2 /> */}
              <ProjectCardList projects={projects} />
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
};

export { Page };
