import { cn } from '@repo/utils';

type SectionLinkProps = {
  name: string;
  children: string;
  activeSection: string;
  parent: React.MutableRefObject<HTMLDivElement | null>;
  offset?: number;
  setOffset?: (offset: number) => void;
};
const SectionLink = ({
  name,
  children,
  activeSection,
  parent,
  // offset,
  // setOffset,
}: SectionLinkProps) => {
  const isActive = name === activeSection;
  return (
    <li>
      <div
        className={cn(
          'group flex cursor-pointer items-center py-3',
          isActive && 'active',
        )}
        // href={`#${name}`}
        onClick={() => {
          const section = document.getElementById(name);
          if (!section) return;
          parent.current?.scrollTo({
            top: section.offsetTop,
            behavior: 'smooth',
          });
        }}
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
        <h3
          className={cn(
            'text-slate-400',
            'group-hover:text-slate-200',
            'group-focus-visible:text-slate-200',
            'group-[.active]:text-slate-200',
          )}
        >
          {children}
        </h3>
      </div>
    </li>
  );
};

export { SectionLink };
