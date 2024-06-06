import { Badge } from '@dread-ui/index';
import { cn } from '@repo/utils';
import { FaBriefcase } from 'react-icons/fa';

import { EXPERIENCE, ExperienceType } from './info';

interface ExperienceCardProps {
  experience: ExperienceType;
  right?: boolean;
}
const ExperienceCard = ({
  experience: { title, company, dates, description, website, logo: Logo },
  right,
}: ExperienceCardProps) => {
  return (
    <div className={cn('grid grid-cols-4 gap-2 text-sm')}>
      <div
        className={cn(
          'flex flex-col text-xs',
          right && 'col-start-4 items-end',
        )}
      >
        {dates}
        {Logo && <Logo className='my-auto w-20' />}
      </div>
      <div
        className={cn('col-span-3 flex flex-col gap-1', right && 'row-start-1')}
      >
        <span className='uppercase'>
          {title} - {company}
        </span>
        <span className='opacity-60'>{website}</span>
        <span>{description}</span>
      </div>
    </div>
  );
};

export const Experience = () => {
  return (
    <div className='flex flex-col gap-3'>
      <div className='flex gap-2'>
        <FaBriefcase className='h-8 w-8' />
        <h2 className='text-3xl font-bold uppercase'>Experience</h2>
      </div>
      <div className='grid grid-cols-1 gap-4'>
        {EXPERIENCE.map((experience, index) => (
          <ExperienceCard
            key={experience.company}
            experience={experience}
            right={index % 2 === 1}
          />
        ))}
      </div>
    </div>
  );
};
