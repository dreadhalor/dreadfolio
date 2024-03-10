import { FaInstagram, FaGithub } from 'react-icons/fa';
import { SectionLink } from './section/section-link';
import { cn } from '@repo/utils';
import { RefObject } from 'react';

const PageHeader = ({ parent }: { parent: RefObject<HTMLDivElement> }) => {
  return (
    <div
      className={cn(
        'relative flex flex-1 shrink-0 flex-col justify-between',
        'lg:sticky lg:left-0 lg:top-0 lg:h-screen lg:py-24',
      )}
    >
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
        <nav className='mt-16 hidden lg:block' aria-label='In-page jump links'>
          <ul className='w-max'>
            <SectionLink name='about' parent={parent}>
              About
            </SectionLink>
            <SectionLink name='experience' parent={parent}>
              Experience
            </SectionLink>
            <SectionLink name='projects' parent={parent}>
              Projects
            </SectionLink>
          </ul>
        </nav>
      </div>
      <div className='ml-1 mt-8 flex w-full items-center justify-start gap-5'>
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
  );
};

export { PageHeader };
