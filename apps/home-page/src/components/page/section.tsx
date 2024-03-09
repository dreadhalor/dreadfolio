import { cn } from '@repo/utils';
import { useEffect, useRef, useState } from 'react';
import { useHomepage } from '../../providers/homepage-provider';
import { Card, CardContent, CardHeader } from 'dread-ui';
import { StickyObserver } from './sticky-observer';

const SectionHeader = ({ children }: { children: React.ReactNode }) => {
  const [stuck, setStuck] = useState(false);

  // useEffect(() => {
  //   console.log(`${children} stuck`, stuck);
  // }, [children, stuck]);

  return (
    <StickyObserver position='top' setStuck={setStuck}>
      <CardHeader
        className={cn(
          'px-0 transition-colors md:-mx-12 md:px-12',
          'lg:-ml-4 lg:-mr-24 lg:pl-4 lg:pr-24',
          'backdrop-blur-sm',
        )}
      >
        <h3 style={{ textShadow: '0 0 10px rgba(0, 0, 0, 0.5)' }}>
          {children}
        </h3>
      </CardHeader>
    </StickyObserver>
  );
};

const SectionContent = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) => {
  return <CardContent className={className}>{children}</CardContent>;
};

type SectionProps = {
  children: React.ReactNode;
  name: string;
  className?: string;
};
const Section = ({ children, name, className }: SectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { setActiveSection, offset } = useHomepage();

  useEffect(() => {
    const top = ref.current?.getBoundingClientRect().top ?? -1;
    // const bottom = ref.current?.getBoundingClientRect().bottom;
    // if the top is within 100px of the top of the screen, it's the active section
    if (top < 0) return;
    if (top < 100) {
      setActiveSection(name);
    }
  }, [offset, setActiveSection, name]);

  return (
    <section
      id={name}
      className={cn('w-full shrink-0 border-0 pt-24 text-slate-300', className)}
      ref={ref}
    >
      <Card className='border-0 bg-transparent p-0 text-slate-300 shadow-none'>
        {children}
      </Card>
    </section>
  );
};

export { Section, SectionHeader, SectionContent };
