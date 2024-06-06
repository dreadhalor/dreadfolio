import { FaUniversity, FaBook, FaGavel } from 'react-icons/fa';
import { GiLaurels } from 'react-icons/gi';
import UCLALogo from '@resume/assets/ucla-logo.svg?react';
import React from 'react';

const EducationGridItem = ({ children }: { children: React.ReactNode }) => (
  <div className='row-span-3 grid grid-rows-subgrid items-center justify-items-center'>
    {children}
  </div>
);

export const Education = () => (
  <div className='flex min-w-[300px] flex-col gap-4'>
    <div className='flex gap-2'>
      <FaUniversity className='h-8 w-8' />
      <h2 className='text-3xl font-bold uppercase'>Education</h2>
    </div>
    <div className='-mt-2 flex items-center gap-2'>
      <UCLALogo className='h-[40px]' />
      <h2 className='text-base font-bold'>
        University of California,
        <br />
        Los Angeles
      </h2>
    </div>
    <div className='grid grid-cols-3 grid-rows-[auto_auto_auto] justify-center gap-y-1 text-center'>
      <EducationGridItem>
        <FaBook className='h-7 w-7' />
        <p className='text-sm opacity-50'>Field</p>
        <p className='text-sm'>Computer Science + Engineering</p>
      </EducationGridItem>
      <EducationGridItem>
        <GiLaurels className='h-8 w-8' />
        <p className='text-sm opacity-50'>President</p>
        <p className='text-sm'>Triangle Engineering Fraternity</p>
      </EducationGridItem>
      <EducationGridItem>
        <FaGavel className='h-8 w-8' />
        <p className='text-sm opacity-50'>Exec Board</p>
        <p className='text-sm'>Model United Nations</p>
      </EducationGridItem>
    </div>
  </div>
);
