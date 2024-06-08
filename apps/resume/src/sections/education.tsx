import { FaUniversity, FaBook, FaGavel } from 'react-icons/fa';
import { GiLaurels } from 'react-icons/gi';
import UCLALogo from '@resume/assets/ucla-logo.svg?react';
import React from 'react';
import { Card } from '@resume/card';

const EducationGridItem = ({
  title,
  icon,
  subtitle,
}: {
  title: string;
  icon: React.ReactNode;
  subtitle: string;
}) => (
  <div className='row-span-3 grid grid-rows-subgrid items-center justify-items-center'>
    {icon}
    <p className='text-[13px] opacity-50'>{title}</p>
    <p className='mt-[-3px] text-[13px] leading-4'>{subtitle}</p>
  </div>
);

export const Education = () => (
  <div className='flex min-w-[310px] flex-col gap-2'>
    <div className='flex items-center gap-2 text-2xl'>
      <FaUniversity />
      <h2 className='font-bold uppercase'>Education</h2>
    </div>
    <Card className='flex flex-col gap-2'>
      <div className='flex items-center gap-2'>
        <UCLALogo className='h-[40px]' />
        <h2 className='text-base font-bold'>
          University of California,
          <br />
          Los Angeles
        </h2>
      </div>
      <div className='grid grid-cols-3 grid-rows-[auto_auto_auto] justify-center gap-y-1 text-center'>
        <EducationGridItem
          icon={<FaBook className='h-7 w-7' />}
          title='Field'
          subtitle='Computer Science + Engineering'
        />

        <EducationGridItem
          icon={<GiLaurels className='h-8 w-8' />}
          title='President'
          subtitle='Triangle Engineering Fraternity'
        />
        <EducationGridItem
          icon={<FaGavel className='h-8 w-8' />}
          title='Exec Board'
          subtitle='Model United Nations'
        />
      </div>
    </Card>
  </div>
);
