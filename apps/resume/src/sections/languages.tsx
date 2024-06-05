import React from 'react';
import {
  FaLaptopCode,
  FaHtml5,
  FaCss3Alt,
  FaDatabase,
  FaJava,
  FaPhp,
  FaPython,
} from 'react-icons/fa6';
import { IoLogoJavascript } from 'react-icons/io5';
import { SiJavascript, SiTypescript, SiCplusplus, SiC } from 'react-icons/si';
import { DiRuby } from 'react-icons/di';
import NoSQLIcon from '@resume/assets/icons/nosql-icon.svg?react';
import CSharpLogo from '@resume/assets/icons/csharp-logo.svg?react';

interface LanguageItemProps {
  logo: React.FC<{ className: string }>;
  label: string;
}
const LanguageItem = ({ logo: Logo, label }: LanguageItemProps) => (
  <div className='flex flex-col items-center gap-1'>
    {Logo && <Logo className='h-10 w-10 shrink-0' />}
    <p className='text-xs'>{label}</p>
  </div>
);

export const Languages = () => {
  return (
    <div className='flex flex-col'>
      <div className='flex items-center gap-2 text-2xl uppercase'>
        <FaLaptopCode />
        Languages
      </div>

      <div className='grid w-full grid-cols-[repeat(13,minmax(0,1fr))] gap-2'>
        <LanguageItem logo={FaHtml5} label='HTML' />
        <LanguageItem logo={FaCss3Alt} label='CSS' />
        <LanguageItem logo={SiJavascript} label='JavaScript' />
        <LanguageItem logo={FaDatabase} label='SQL' />
        <LanguageItem logo={SiTypescript} label='TypeScript' />
        <LanguageItem logo={NoSQLIcon as React.FC} label='NoSQL' />
        <LanguageItem logo={FaJava} label='Java' />
        <LanguageItem logo={SiC} label='C' />
        <LanguageItem logo={SiCplusplus} label='C++' />
        <LanguageItem logo={DiRuby} label='Ruby' />
        <LanguageItem logo={FaPhp} label='PHP' />
        <LanguageItem logo={FaPython} label='Python' />
        <LanguageItem logo={CSharpLogo as React.FC} label='C#' />
      </div>
    </div>
  );
};
