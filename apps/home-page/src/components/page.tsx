import { useEffect, useRef, useState } from 'react';
import { useHomePage } from '../providers/home-page-provider';
import { cn } from '@repo/utils';
import { useScroll, motion } from 'framer-motion';

type SectionLinkProps = {
  name: string;
  children: string;
  activeSection: string;
};
const SectionLink = ({ name, children, activeSection }: SectionLinkProps) => {
  const isActive = name === activeSection;
  return (
    <li id={name}>
      <a
        className={cn('group flex items-center py-3', isActive && 'active')}
        href={`#${name}`}
      >
        <span
          className={cn(
            'mr-4 h-px w-8 bg-slate-400 transition-all',
            'group-hover:w-16 group-hover:bg-slate-200',
            'group-focus-visible:w-16 group-focus-visible:bg-slate-200',
            'group-[.active]:w-16 group-[.active]:bg-slate-200',
            'motion-reduce:transition-none',
          )}
        ></span>
        <span
          className={cn(
            'text-xs font-bold uppercase tracking-widest text-slate-400',
            'group-hover:text-slate-200',
            'group-focus-visible:text-slate-200',
            'group-[.active]:text-slate-200',
          )}
        >
          {children}
        </span>
      </a>
    </li>
  );
};
type SectionProps = {
  children: React.ReactNode;
  name: string;
  parent: React.MutableRefObject<HTMLDivElement | null>;
  setActiveSection: (section: string) => void;
};
const Section = ({
  parent,
  children,
  name,
  setActiveSection,
}: SectionProps) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    container: parent,
    offset: ['end start', 'start end'],
    layoutEffect: false,
  });
  const [progress, setProgress] = useState(0);
  const [updateActiveSection, setUpdateActiveSection] = useState(false);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (v) => {
      setProgress(() => {
        if (v < 0.55 && v > 0) setUpdateActiveSection(true);
        return v;
      });
    });
    return () => {
      unsubscribe();
    };
  }, [scrollYProgress, setActiveSection, name]);

  // annoying but we gotta do it like this to avoid a warning about updating parent state in a child
  useEffect(() => {
    if (updateActiveSection) {
      setActiveSection(name);
      setUpdateActiveSection(false);
    }
  }, [updateActiveSection, setActiveSection, name]);

  return (
    <section className='relative h-full w-full shrink-0 py-24' ref={ref}>
      <motion.div
        className='absolute left-0 top-0 h-[10px] bg-white'
        style={{
          width: `${progress * 100}%`,
        }}
      />
      {children}
    </section>
  );
};

const Page = () => {
  const { step } = useHomePage();
  const containerRef = useRef(null);
  const [activeSection, setActiveSection] = useState('begin');

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

  return (
    <div
      className={cn(
        'bg-primary/60 pointer-events-none relative flex h-full w-full opacity-0',
        step === 'homepage' && 'pointer-events-auto opacity-100',
      )}
    >
      <div
        ref={containerRef}
        className='relative mx-auto flex h-full w-full max-w-screen-xl overflow-auto overscroll-y-contain px-24'
      >
        <div className='sticky left-0 top-0 flex w-1/2 py-24'>
          <div
            className='text-primary-foreground relative flex flex-1 flex-col items-start border'
            style={{ textShadow: '0px 0px 20px #000000' }}
          >
            <h1 className='text-4xl font-bold tracking-tight text-slate-200 sm:text-5xl'>
              Scott Hetrick
            </h1>
            <h2 className='mt-3 text-lg font-medium tracking-tight text-slate-200 sm:text-xl'>
              Programming. Pizza. Punchlines.
            </h2>
            <h2 className='mt-1 text-lg font-medium tracking-tight text-slate-200 sm:text-xl'>
              Not necessarily in that order.
            </h2>
            <nav
              className='nav hidden lg:block'
              aria-label='In-page jump links'
            >
              <ul className='mt-16 w-max'>
                <SectionLink name='begin' activeSection={activeSection}>
                  Begin
                </SectionLink>
                <SectionLink name='about' activeSection={activeSection}>
                  About
                </SectionLink>
                <SectionLink name='experience' activeSection={activeSection}>
                  Experience
                </SectionLink>
                <SectionLink name='projects' activeSection={activeSection}>
                  Projects
                </SectionLink>
              </ul>
            </nav>
          </div>
        </div>
        <div className='text-primary-foreground relative flex w-1/2 flex-col border'>
          <Section
            parent={containerRef}
            setActiveSection={setActiveSection}
            name='begin'
          >
            <spline-viewer
              class='h-full w-full shrink-0'
              events-target='global'
              loading-anim-type='spinner-small-dark'
              url='https://prod.spline.design/8KeIdzt7Hi8smpDE/scene.splinecode'
            ></spline-viewer>
          </Section>
          <Section
            parent={containerRef}
            setActiveSection={setActiveSection}
            name='about'
          >
            <div className='flex h-full min-w-0 shrink-0 flex-col items-center justify-center border-2 text-white'>
              About
            </div>
          </Section>
          <Section
            parent={containerRef}
            setActiveSection={setActiveSection}
            name='experience'
          >
            <div className='flex h-full min-w-0 shrink-0 flex-col items-center justify-center border-2 text-white'>
              Experience
            </div>
          </Section>
          <Section
            parent={containerRef}
            setActiveSection={setActiveSection}
            name='projects'
          >
            <div className='flex h-full min-w-0 shrink-0 flex-col items-center justify-center border-2 text-white'>
              Projects
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
};

export { Page };
