import { FaUniversity, FaBook, FaGavel } from 'react-icons/fa';
import { GiLaurels } from 'react-icons/gi';
import UCLALogo from '@resume/assets/ucla-logo.svg?react';
import React from 'react';
import { Card } from '@resume/card';

const EducationGridItem = ({ children }: { children: React.ReactNode }) => (
  <div className='row-span-3 grid grid-rows-subgrid items-center justify-items-center'>
    {children}
  </div>
);

export const Education = () => (
  <div className='flex min-w-[310px] flex-col gap-2'>
    <div className='flex gap-2'>
      <FaUniversity className='h-8 w-8' />
      <h2 className='text-2xl font-bold uppercase'>Education</h2>
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
        <EducationGridItem>
          <FaBook className='h-7 w-7' />
          <p className='text-[13px] opacity-50'>Field</p>
          <p className='mt-[-2px] text-[13px]'>
            Computer Science + Engineering
          </p>
        </EducationGridItem>
        <EducationGridItem>
          <GiLaurels className='h-8 w-8' />
          <p className='text-[13px] opacity-50'>President</p>
          <p className='mt-[-2px] text-[13px]'>
            Triangle Engineering Fraternity
          </p>
        </EducationGridItem>
        <EducationGridItem>
          <FaGavel className='h-8 w-8' />
          <p className='text-[13px] opacity-50'>Exec Board</p>
          <p className='mt-[-2px] text-[13px]'>Model United Nations</p>
        </EducationGridItem>
      </div>
    </Card>
  </div>
);
