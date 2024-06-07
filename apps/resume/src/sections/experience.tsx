import { Badge } from '@dread-ui/index';
import { cn } from '@repo/utils';
import { FaBriefcase } from 'react-icons/fa';

import { EXPERIENCE, ExperienceType } from './info';
import { Card } from '@resume/card';

interface ExperienceCardProps {
  experience: ExperienceType;
  right?: boolean;
}
const ExperienceCard = ({
  experience: { title, company, dates, description, website, logo: Logo },
  right,
}: ExperienceCardProps) => {
  return (
    <Card>
      <div className={cn('grid grid-cols-5 gap-2 text-[13px]')}>
        <div
          className={cn(
            'flex flex-col text-xs',
            right && 'col-start-5 items-end',
          )}
        >
          <span className='opacity-60'>{dates}</span>
          {Logo && <Logo className='my-auto w-[72px]' />}
        </div>
        <div
          className={cn(
            'col-span-4 flex flex-col gap-1',
            right && 'row-start-1',
          )}
        >
          <span className='uppercase'>
            {title} - {company}
          </span>
          <span className='-mt-1 opacity-60'>{website}</span>
          <span>{description}</span>
        </div>
      </div>
    </Card>
  );
};

export const Experience = () => {
  return (
    <div className='flex flex-col gap-2'>
      <div className='flex gap-2'>
        <FaBriefcase className='h-8 w-8' />
        <h2 className='text-2xl font-bold uppercase'>Experience</h2>
      </div>
      <div className='flex flex-col gap-4'>
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
