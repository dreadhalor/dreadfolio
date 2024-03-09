import { useEffect, useLayoutEffect, useRef } from 'react';
import { useIntro } from '../../providers/intro-provider';
import { useHomepage } from '../../providers/homepage-provider';
import { cn } from '@repo/utils';
import { Button, Card, CardContent, CardHeader } from 'dread-ui';
import { SectionLink } from './section-link';
import { Section } from './section';
import { ExperienceCard, ProjectCardList } from './project-card';
import { experience, projects } from './info';
import { MdArrowDownward } from 'react-icons/md';
import { FaGithub, FaInstagram } from 'react-icons/fa';

const Page = () => {
  const { step } = useIntro();
  const { setOffset, setParallaxBaseHeight } = useHomepage();
  const containerRef = useRef<HTMLDivElement>(null);

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
        <div className='sticky left-0 top-0 flex h-full max-w-[640px] flex-1 shrink-0 flex-col justify-between py-24 pl-24 pr-2'>
          <div
            className='text-primary-foreground relative flex flex-1 flex-col items-start'
            style={{ textShadow: '0px 0px 20px #000000' }}
          >
            <h1 className='flex flex-nowrap text-4xl font-bold tracking-tight text-slate-200 sm:text-5xl'>
              Scott Hetrick
              <spline-viewer
                class='ml-2 inline-block h-[50px] w-[50px]'
                loading-anim-type='spinner-small-dark'
                url='https://prod.spline.design/8KeIdzt7Hi8smpDE/scene.splinecode'
              ></spline-viewer>
            </h1>
            <h2 className='mt-3 text-lg font-medium tracking-tight text-slate-200 sm:text-xl'>
              Programming. Pizza. Punchlines.
            </h2>
            <h2 className='text-md mt-2 font-medium tracking-tight text-slate-400 sm:text-lg'>
              Not necessarily in that order.
            </h2>
            <nav
              className='mt-16 hidden lg:block'
              aria-label='In-page jump links'
            >
              <ul className='w-max'>
                <SectionLink name='about' parent={containerRef}>
                  About
                </SectionLink>
                <SectionLink name='experience' parent={containerRef}>
                  Experience
                </SectionLink>
                <SectionLink name='projects' parent={containerRef}>
                  Projects
                </SectionLink>
              </ul>
            </nav>
          </div>
          <div className='ml-1 flex w-full items-center justify-start gap-5'>
            <FaGithub
              className='h-[24px] w-[24px] shrink-0 cursor-pointer text-slate-400 transition-colors hover:text-white'
              onClick={() =>
                window.open('https://www.github.com/dreadhalor', '_blank')
              }
            />
            <FaInstagram
              className='h-[24px] w-[24px] shrink-0 cursor-pointer text-slate-400 transition-colors hover:text-white'
              onClick={() =>
                window.open('https://www.instagram.com/dreadhalor/', '_blank')
              }
            />
          </div>
        </div>
        <div className='text-primary-foreground relative flex min-h-full max-w-[640px] flex-1 shrink-0 flex-col pb-24 pr-24'>
          <Section name='about' className='mb-4'>
            <Card className='border-0 bg-transparent text-slate-300 shadow-none'>
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
          <Section name='experience'>
            <div className='group/list flex h-full min-w-0 shrink-0 flex-col items-center justify-center gap-2 text-white'>
              {experience.map((exp, i) => (
                <ExperienceCard key={i} {...exp} />
              ))}
            </div>
          </Section>
          <Section name='projects'>
            <div className='flex h-full min-w-0 shrink-0 flex-col items-center justify-center text-white'>
              <ProjectCardList projects={projects} />
            </div>
            <Button variant={'link'} className='group mt-4 text-white'>
              View All Featured Projects
              <MdArrowDownward className='ml-2 inline-block transition-transform group-hover:translate-y-1' />
            </Button>
          </Section>
        </div>
      </div>
    </div>
  );
};

export { Page };
