import { cn } from '@repo/utils';
import { MdOutlineArrowOutward } from 'react-icons/md';
import { Badge, useIframe } from 'dread-ui';
import { MouseEvent } from 'react';

type ProjectCardProps = {
  title: string;
  description: string;
  technologies: string[];
  link: string;
  image: string;
};
const ProjectCard = ({
  title,
  description,
  technologies,
  link,
  image,
}: ProjectCardProps) => {
  const { sendMessageToParent } = useIframe();

  return (
    <ListCard
      title={title}
      description={description}
      badges={technologies}
      onClick={() => {
        sendMessageToParent({
          type: 'scroll-to-app',
          link,
        });
      }}
      link={link}
    >
      <img
        src={image}
        alt={title}
        className='border-border/50 group-hover:border-border col-span-1 w-full rounded-lg border-2 brightness-75 transition-colors'
      />
    </ListCard>
  );
};

const ExperienceCard = ({
  title,
  company,
  date,
  description,
  technologies = [],
  link,
}: {
  title: string;
  company: string;
  date: string;
  description: string;
  technologies?: string[];
  link?: string;
}) => {
  return (
    <ListCard
      title={`${title} - ${company}`}
      description={description}
      badges={technologies}
      link={link}
    >
      {date}
    </ListCard>
  );
};

type ListCardProps = {
  title: string;
  description: string;
  badges?: string[];
  onClick?: () => void;
  link?: string;
  children: React.ReactNode;
};
const ListCard = ({
  title,
  description,
  badges = [],
  onClick,
  link,
  children,
}: ListCardProps) => {
  // so that the title can wrap, but if the arrow wraps by itself, it looks weird
  const lastWord = title.split(' ').pop();
  const firstWords = title.split(' ').slice(0, -1).join(' ').concat(' ');

  const handleClick: React.MouseEventHandler<HTMLAnchorElement> = (
    e: MouseEvent,
  ) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <a
      onClick={(e) => handleClick(e)}
      className={cn(
        'group grid min-h-[50px] w-full grid-cols-4 flex-nowrap gap-4 rounded-lg p-4 transition-all',
        'group-hover/list:opacity-50',
        'hover:cursor-pointer hover:bg-teal-800/20 hover:!opacity-100',
      )}
      href={link}
      target='_blank'
    >
      <div className='col-span-1 text-xs font-semibold uppercase tracking-wide text-slate-400'>
        {children}
      </div>

      <div className='col-span-3 flex flex-col gap-2'>
        <h3 className='relative text-sm font-medium leading-tight group-hover:text-teal-300 group-focus-visible:text-teal-300'>
          {firstWords}
          <span className='inline-block'>
            {lastWord}
            <MdOutlineArrowOutward
              className={cn(
                'ml-1 inline-block shrink-0 transition-transform',
                'group-hover:-translate-y-1 group-hover:translate-x-1',
                'group-focus-visible:-translate-y-1 group-focus-visible:translate-x-1',
              )}
            />
          </span>
        </h3>
        <p className='text-start text-sm leading-normal'>{description}</p>
        <div className='mt-1 flex w-full flex-wrap gap-2'>
          {badges.map((badge) => (
            <Badge key={badge}>{badge}</Badge>
          ))}
        </div>
      </div>
    </a>
  );
};

export { ExperienceCard, ProjectCard };
